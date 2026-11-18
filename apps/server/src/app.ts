import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

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
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'chess-arena-server',
      timestamp: new Date().toISOString(),
    };
  });

  return app;
}
