import { WebSocket, WebSocketServer, RawData } from 'ws';
import { IncomingMessage } from 'http';
import { FastifyBaseLogger } from 'fastify';

interface SocketMeta {
  uniqueKey: string;
  isAlive: boolean;
  connectedAt: number;
}

export class PresenceManager {
  private wss: WebSocketServer;
  private logger: FastifyBaseLogger;
  // Map of unique user key (auth userId OR guest sessionId) -> Set of active WebSockets for that user
  private userConnections = new Map<string, Set<WebSocket>>();
  // Map of WebSocket -> metadata
  private socketMeta = new Map<WebSocket, SocketMeta>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(wss: WebSocketServer, logger: FastifyBaseLogger) {
    this.wss = wss;
    this.logger = logger;

    this.setupHeartbeat();
    this.setupWss();
  }

  /**
   * Returns the count of distinct active users (deduplicated across tabs/connections).
   * Never returns simulated or fake counts.
   */
  public getUniqueCount(): number {
    return this.userConnections.size;
  }

  private setupWss(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    // Extract user/session identification from URL query parameters
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const queryUserId = url.searchParams.get('userId');
    const querySessionId = url.searchParams.get('sessionId');

    // Use userId if authenticated, otherwise use guest sessionId, or fallback to socket remote address + time
    const initialKey = queryUserId?.trim() || querySessionId?.trim() || `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    this.registerSocket(ws, initialKey);

    // Immediately notify this client of the current real unique user count
    this.sendToSocket(ws, {
      type: 'presence.update',
      count: this.getUniqueCount(),
    });

    // Handle incoming messages
    ws.on('message', (data: RawData) => {
      this.handleMessage(ws, data);
    });

    // Native WS pong event for heartbeat
    ws.on('pong', () => {
      const meta = this.socketMeta.get(ws);
      if (meta) {
        meta.isAlive = true;
      }
    });

    // Cleanup on socket close
    ws.on('close', (code, reason) => {
      this.logger.debug({ code, reason: reason.toString() }, 'WebSocket connection closed');
      this.unregisterSocket(ws);
    });

    // Cleanup on socket error
    ws.on('error', (err) => {
      this.logger.warn({ err }, 'WebSocket connection error');
      this.unregisterSocket(ws);
    });
  }

  private registerSocket(ws: WebSocket, uniqueKey: string): void {
    const isNewUniqueUser = !this.userConnections.has(uniqueKey) || this.userConnections.get(uniqueKey)!.size === 0;

    let socketSet = this.userConnections.get(uniqueKey);
    if (!socketSet) {
      socketSet = new Set<WebSocket>();
      this.userConnections.set(uniqueKey, socketSet);
    }
    socketSet.add(ws);

    this.socketMeta.set(ws, {
      uniqueKey,
      isAlive: true,
      connectedAt: Date.now(),
    });

    this.logger.info(
      { uniqueKey, totalConnectionsForUser: socketSet.size, uniqueActiveUsers: this.getUniqueCount() },
      'User socket registered'
    );

    // If this is a newly connected unique user, broadcast updated count
    if (isNewUniqueUser) {
      this.broadcastCount();
    }
  }

  private unregisterSocket(ws: WebSocket): void {
    const meta = this.socketMeta.get(ws);
    if (!meta) return;

    this.socketMeta.delete(ws);
    const { uniqueKey } = meta;

    const socketSet = this.userConnections.get(uniqueKey);
    let userDisconnected = false;

    if (socketSet) {
      socketSet.delete(ws);
      if (socketSet.size === 0) {
        this.userConnections.delete(uniqueKey);
        userDisconnected = true;
      }
    }

    this.logger.info(
      { uniqueKey, userDisconnected, remainingTabs: socketSet?.size || 0, uniqueActiveUsers: this.getUniqueCount() },
      'User socket unregistered'
    );

    // If the user has closed all tabs/connections, broadcast the decremented count
    if (userDisconnected) {
      this.broadcastCount();
    }
  }

  private handleMessage(ws: WebSocket, data: RawData): void {
    try {
      const msgStr = data.toString();
      const parsed = JSON.parse(msgStr);

      if (parsed.type === 'ping') {
        const meta = this.socketMeta.get(ws);
        if (meta) meta.isAlive = true;
        this.sendToSocket(ws, { type: 'pong', timestamp: Date.now() });
        return;
      }

      if (parsed.type === 'presence.join') {
        const newKey = parsed.userId?.trim() || parsed.sessionId?.trim();
        if (newKey) {
          const currentMeta = this.socketMeta.get(ws);
          if (currentMeta && currentMeta.uniqueKey !== newKey) {
            // User identity upgraded (e.g. guest signed in with user ID)
            this.unregisterSocket(ws);
            this.registerSocket(ws, newKey);
          }
        }
        return;
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  public broadcastCount(): void {
    const payload = JSON.stringify({
      type: 'presence.update',
      count: this.getUniqueCount(),
    });

    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  private sendToSocket(ws: WebSocket, data: unknown): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.wss.clients) {
        const meta = this.socketMeta.get(client);
        if (!meta) {
          client.terminate();
          continue;
        }

        if (!meta.isAlive) {
          this.logger.debug({ uniqueKey: meta.uniqueKey }, 'Terminating unresponsive client socket');
          client.terminate();
          this.unregisterSocket(client);
          continue;
        }

        meta.isAlive = false;
        client.ping();
      }
    }, 30000);
  }

  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.userConnections.clear();
    this.socketMeta.clear();
  }
}
