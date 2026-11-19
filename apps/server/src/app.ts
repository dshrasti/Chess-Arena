import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { WebSocketServer } from 'ws';
import { PresenceManager } from './presence';

export interface AppInstanceWithPresence extends FastifyInstance {
  presenceManager?: PresenceManager;
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // Managed per route or frontend
  });

  await app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
    ],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Attach WebSocketServer to the underlying Node HTTP server
  const wss = new WebSocketServer({
    server: app.server,
    path: '/ws',
  });

  const presenceManager = new PresenceManager(wss, app.log);
  (app as AppInstanceWithPresence).presenceManager = presenceManager;

  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'chess-arena-server',
      timestamp: new Date().toISOString(),
    };
  });

  // REST endpoint for real-time presence
  app.get('/api/presence', async () => {
    return {
      count: presenceManager.getUniqueCount(),
      timestamp: new Date().toISOString(),
    };
  });

  app.addHook('onClose', async () => {
    presenceManager.close();
    wss.close();
  });

  return app;
}
