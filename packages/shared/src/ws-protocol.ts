import { z } from 'zod';

export const ClientMessageType = z.enum([
  'auth',
  'queue.join',
  'queue.leave',
  'room.create',
  'room.join',
  'room.leave',
  'invite.send',
  'invite.accept',
  'invite.decline',
  'game.move',
  'game.resign',
  'game.draw.offer',
  'game.draw.accept',
  'game.draw.decline',
  'game.takeback.request',
  'game.takeback.accept',
  'game.takeback.decline',
  'game.abort',
  'game.rematch',
  'chat.send',
  'ping',
]);

export const ServerMessageType = z.enum([
  'auth.ok',
  'queue.status',
  'room.state',
  'game.start',
  'game.state',
  'game.move.applied',
  'game.draw.offered',
  'game.takeback.offered',
  'game.over',
  'opponent.disconnected',
  'opponent.reconnected',
  'chat.message',
  'pong',
  'error',
]);

export const GameMoveSchema = z.object({
  gameId: z.string().uuid(),
  from: z.string().regex(/^[a-h][1-8]$/),
  to: z.string().regex(/^[a-h][1-8]$/),
  promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
  clientSeq: z.number().int().nonnegative(),
});

export const QueueJoinSchema = z.object({
  category: z.enum(['bullet', 'blitz', 'rapid', 'classical']),
  timeControl: z.string(),
  rated: z.boolean(),
});

export const RoomCreateSchema = z.object({
  timeControl: z.string(),
  color: z.enum(['white', 'black', 'random']),
  rated: z.boolean(),
});

export const ChatSendSchema = z.object({
  targetId: z.string(),
  body: z.string().min(1).max(300),
});

export const ClientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('auth'), token: z.string() }),
  z.object({ type: z.literal('queue.join'), payload: QueueJoinSchema }),
  z.object({ type: z.literal('queue.leave') }),
  z.object({ type: z.literal('room.create'), payload: RoomCreateSchema }),
  z.object({ type: z.literal('room.join'), roomCode: z.string().min(4).max(12) }),
  z.object({ type: z.literal('room.leave'), roomCode: z.string() }),
  z.object({ type: z.literal('game.move'), payload: GameMoveSchema }),
  z.object({ type: z.literal('game.resign'), gameId: z.string().uuid() }),
  z.object({ type: z.literal('game.draw.offer'), gameId: z.string().uuid() }),
  z.object({ type: z.literal('game.draw.accept'), gameId: z.string().uuid() }),
  z.object({ type: z.literal('game.draw.decline'), gameId: z.string().uuid() }),
  z.object({ type: z.literal('game.abort'), gameId: z.string().uuid() }),
  z.object({ type: z.literal('game.rematch'), gameId: z.string().uuid() }),
  z.object({ type: z.literal('chat.send'), payload: ChatSendSchema }),
  z.object({ type: z.literal('ping'), timestamp: z.number() }),
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;

