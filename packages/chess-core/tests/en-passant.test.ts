import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('En Passant Rules', () => {
  it('allows white en-passant capture immediately after double pawn push', () => {
    const engine = new GameEngine();
    // 1. e4 Nf6 2. e5 d5 (Black pushes d-pawn 2 squares)
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'g8', to: 'f6' });
    engine.move({ from: 'e4', to: 'e5' });
    engine.move({ from: 'd7', to: 'd5' });

    // White pawn on e5 can capture on d6 via en passant
    const eMoves = engine.legalMoves('e5');
    const epMove = eMoves.find((m) => m.to === 'd6');
    expect(epMove).toBeDefined();

    const res = engine.move({ from: 'e5', to: 'd6' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.isEnPassant).toBe(true);
      expect(res.captured).toBe('p');
      expect(res.capturedSquare).toBe('d5'); // The captured pawn is on d5, not d6!
      // Verify d5 square is empty and d6 has the white pawn
      expect(engine.getPiece('d5')).toBeNull();
      expect(engine.getPiece('d6')?.color).toBe('w');
    }
  });

  it('allows black en-passant capture', () => {
    // White pawn on d2, Black pawn on e4
    const engine = new GameEngine('rnbqkbnr/pppp1ppp/8/8/4p3/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    // White pushes d2-d4
    engine.move({ from: 'd2', to: 'd4' });

    const res = engine.move({ from: 'e4', to: 'd3' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.isEnPassant).toBe(true);
      expect(res.captured).toBe('p');
      expect(res.capturedSquare).toBe('d4');
      expect(engine.getPiece('d4')).toBeNull();
    }
  });

  it('expires en-passant if not taken immediately', () => {
    const engine = new GameEngine();
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'g8', to: 'f6' });
    engine.move({ from: 'e4', to: 'e5' });
    engine.move({ from: 'd7', to: 'd5' });

    // White plays another move instead: a2-a3
    engine.move({ from: 'a2', to: 'a3' });
    // Black plays a7-a6
    engine.move({ from: 'a7', to: 'a6' });

    // En passant is no longer valid
    const eMoves = engine.legalMoves('e5');
    expect(eMoves.map((m) => m.to)).not.toContain('d6');
  });

  it('disallows en-passant if it exposes the king along the rank (horizontal pin edge case)', () => {
    // White King on e5, White pawn on f5, Black pawn on g7, Black Rook on a5, Black King on h8
    // Black plays g7-g5 (offering e.p. on g6).
    // If White plays fxg6 e.p., both f5 and g5 leave rank 5, leaving King e5 in check from Rook a5!
    const engine = new GameEngine('7k/6p1/8/r3KP2/8/8/8/8 b - - 0 1');
    engine.move({ from: 'g7', to: 'g5' });

    // Check legal moves for f5 pawn
    const f5Moves = engine.legalMoves('f5');
    expect(f5Moves.map((m) => m.to)).not.toContain('g6');
  });
});
