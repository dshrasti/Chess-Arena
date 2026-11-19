import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import { PresenceManager } from '../presence';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('PresenceManager', () => {
  let server: ReturnType<typeof createServer>;
  let wss: WebSocketServer;
  let manager: PresenceManager;
  let port: number;

  beforeEach(async () => {
    server = createServer();
    wss = new WebSocketServer({ server });
    manager = new PresenceManager(wss, logger);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          port = addr.port;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    manager.close();
    wss.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('starts with 0 unique users', () => {
    expect(manager.getUniqueCount()).toBe(0);
  });

  it('increases count to 1 when a user connects and broadcasts presence', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}?sessionId=user_1`);

    const receivedCount = await new Promise<number>((resolve) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'presence.update') {
          resolve(msg.count);
        }
      });
    });

    expect(receivedCount).toBe(1);
    expect(manager.getUniqueCount()).toBe(1);
    ws.close();
  });

  it('does not increment count for multiple tabs of the same user (deduplication)', async () => {
    const ws1 = new WebSocket(`ws://127.0.0.1:${port}?sessionId=user_dup`);
    await new Promise<void>((resolve) => ws1.on('open', resolve));

    expect(manager.getUniqueCount()).toBe(1);

    // Second tab with same sessionId
    const ws2 = new WebSocket(`ws://127.0.0.1:${port}?sessionId=user_dup`);
    await new Promise<void>((resolve) => ws2.on('open', resolve));

    // Count must remain 1!
    expect(manager.getUniqueCount()).toBe(1);

    ws1.close();
    ws2.close();
  });

  it('counts distinct users separately and decrements when all tabs close', async () => {
    const userA_tab1 = new WebSocket(`ws://127.0.0.1:${port}?sessionId=user_A`);
    await new Promise<void>((resolve) => userA_tab1.on('open', resolve));
    expect(manager.getUniqueCount()).toBe(1);

    const userA_tab2 = new WebSocket(`ws://127.0.0.1:${port}?sessionId=user_A`);
    await new Promise<void>((resolve) => userA_tab2.on('open', resolve));
    expect(manager.getUniqueCount()).toBe(1);

    const userB_tab1 = new WebSocket(`ws://127.0.0.1:${port}?sessionId=user_B`);
    await new Promise<void>((resolve) => userB_tab1.on('open', resolve));
    expect(manager.getUniqueCount()).toBe(2);

    // Close userA tab 1 -> User A still has tab 2, count remains 2
    userA_tab1.close();
    await new Promise((r) => setTimeout(r, 50));
    expect(manager.getUniqueCount()).toBe(2);

    // Close userA tab 2 -> User A has no open connections, count drops to 1
    userA_tab2.close();
    await new Promise((r) => setTimeout(r, 50));
    expect(manager.getUniqueCount()).toBe(1);

    // Close userB -> count drops to 0
    userB_tab1.close();
    await new Promise((r) => setTimeout(r, 50));
    expect(manager.getUniqueCount()).toBe(0);
  });

  it('supports upgrading guest session to authenticated userId', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}?sessionId=guest_123`);
    await new Promise<void>((resolve) => ws.on('open', resolve));
    expect(manager.getUniqueCount()).toBe(1);

    // User signs in with userId 'auth_alice'
    ws.send(JSON.stringify({ type: 'presence.join', userId: 'auth_alice', sessionId: 'guest_123' }));
    await new Promise((r) => setTimeout(r, 50));
    expect(manager.getUniqueCount()).toBe(1);

    // Another tab signs in with same userId 'auth_alice'
    const ws2 = new WebSocket(`ws://127.0.0.1:${port}?userId=auth_alice`);
    await new Promise<void>((resolve) => ws2.on('open', resolve));
    expect(manager.getUniqueCount()).toBe(1); // deduplicated

    ws.close();
    ws2.close();
  });
});
