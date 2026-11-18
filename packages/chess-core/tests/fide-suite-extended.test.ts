import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Extended FIDE Rules and State Integrity', () => {
  describe('Full Multi-Ply Undo across Special Moves', () => {
    it('restores castling rights and rook position after undoing castling', () => {
      const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const fenBefore = engine.toFen();

      // Castle kingside
      const res = engine.move({ from: 'e1', to: 'g1' });
      expect('code' in res).toBe(false);
      expect(engine.getPiece('f1')?.type).toBe('r');
      expect(engine.getPiece('h1')).toBeNull();

      // Undo castling
      expect(engine.undo()).toBe(true);
      expect(engine.toFen()).toBe(fenBefore);
      expect(engine.getPiece('h1')?.type).toBe('r');
      expect(engine.getPiece('f1')).toBeNull();
      expect(engine.getPiece('e1')?.type).toBe('k');
    });

    it('restores captured pawn and square after undoing en-passant', () => {
      const engine = new GameEngine();
      engine.move({ from: 'e2', to: 'e4' });
      engine.move({ from: 'g8', to: 'f6' });
      engine.move({ from: 'e4', to: 'e5' });
      engine.move({ from: 'd7', to: 'd5' });
      const fenBeforeEp = engine.toFen();

      // En passant capture
      engine.move({ from: 'e5', to: 'd6' });
      expect(engine.getPiece('d5')).toBeNull();
      expect(engine.getPiece('d6')?.color).toBe('w');

      // Undo en passant
      engine.undo();
      expect(engine.toFen()).toBe(fenBeforeEp);
      expect(engine.getPiece('d5')?.type).toBe('p');
      expect(engine.getPiece('d5')?.color).toBe('b');
      expect(engine.getPiece('e5')?.type).toBe('p');
      expect(engine.getPiece('e5')?.color).toBe('w');
      expect(engine.getPiece('d6')).toBeNull();
    });

    it('restores pawn on 7th rank after undoing promotion', () => {
      const engine = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      const fenBeforePromo = engine.toFen();

      engine.move({ from: 'e7', to: 'e8', promotion: 'q' });
      expect(engine.getPiece('e8')?.type).toBe('q');

      engine.undo();
      expect(engine.toFen()).toBe(fenBeforePromo);
      expect(engine.getPiece('e7')?.type).toBe('p');
      expect(engine.getPiece('e8')).toBeNull();
    });

    it('restores captured piece after undoing normal capture', () => {
      const engine = new GameEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
      engine.move({ from: 'd7', to: 'd5' });
      const fenBeforeCap = engine.toFen();

      engine.move({ from: 'e4', to: 'd5' });
      expect(engine.getPiece('d5')?.color).toBe('w');

      engine.undo();
      expect(engine.toFen()).toBe(fenBeforeCap);
      expect(engine.getPiece('d5')?.color).toBe('b');
      expect(engine.getPiece('e4')?.color).toBe('w');
    });
  });

  describe('Underpromotion to avoid stalemate', () => {
    it('underpromotes to Rook to avoid stalemate by Queen', () => {
      // White king on a6, pawn on b7, Black king on a8.
      // 1. b8=Q+ is stalemate/draw or mate depending on square,
      // here with Black king on a8, White king on c7:
      // If White plays b8=Q#, Black has nowhere to go.
      // But in a position where Queen covers the only escape and gives stalemate,
      // promoting to Rook or Bishop can avoid it.
      const engine = new GameEngine('k7/1P6/K7/8/8/8/8/8 w - - 0 1');
      // b7-b8=R+ checks king and forces moves without stalemate
      const res = engine.move({ from: 'b7', to: 'b8', promotion: 'r' });
      expect('code' in res).toBe(false);
      if (!('code' in res)) {
        expect(res.promotion).toBe('r');
        expect(res.isCheck).toBe(true);
      }
    });
  });

  describe('Resignation edge cases', () => {
    it('records Black resignation giving White victory (1-0)', () => {
      const engine = new GameEngine();
      engine.move({ from: 'e2', to: 'e4' });
      engine.resign('b');

      const status = engine.status();
      expect(status.isGameOver).toBe(true);
      expect(status.winner).toBe('w');
      expect(status.result).toBe('1-0');
      expect(status.termination).toBe('resignation');
    });
  });

  describe('Illegal moves attempts on initial board', () => {
    it('disallows pawn moving 3 squares', () => {
      const engine = new GameEngine();
      const res = engine.move({ from: 'e2', to: 'e5' });
      expect('code' in res).toBe(true);
    });

    it('disallows pawn moving backwards', () => {
      const engine = new GameEngine();
      engine.move({ from: 'e2', to: 'e4' });
      engine.move({ from: 'e7', to: 'e5' });
      const res = engine.move({ from: 'e4', to: 'e3' });
      expect('code' in res).toBe(true);
    });

    it('disallows rook diagonal move', () => {
      const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const res = engine.move({ from: 'a1', to: 'b2' });
      expect('code' in res).toBe(true);
    });

    it('disallows bishop straight move', () => {
      const engine = new GameEngine('4k3/8/8/3b4/8/8/8/4K3 b - - 0 1');
      const res = engine.move({ from: 'd5', to: 'd4' });
      expect('code' in res).toBe(true);
    });

    it('disallows knight straight move', () => {
      const engine = new GameEngine();
      const res = engine.move({ from: 'b1', to: 'b3' });
      expect('code' in res).toBe(true);
    });
  });
});
