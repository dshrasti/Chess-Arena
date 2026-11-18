import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';
import { identifyOpening } from '../src/opening-book';
import { validateFen } from '../src/fen';
import { parseUci } from '../src/notation';

describe('Comprehensive Rules & Edge Cases', () => {
  describe('Double Check Mechanics', () => {
    it('forces the king to move when facing double check (cannot capture or block)', () => {
      // White King on e1, Black King on h8, Black double check with Queen and Knight
      const engine = new GameEngine('4q2k/8/8/8/8/3n4/8/4K3 w - - 0 1');
      expect(engine.inCheck()).toBe(true);
      const moves = engine.legalMoves();
      // Every legal move must be a King move
      for (const m of moves) {
        expect(m.piece).toBe('k');
      }
    });
  });

  describe('Knight Board Traversal', () => {
    it('has only 2 legal moves from a corner square', () => {
      const engine = new GameEngine('8/8/8/8/8/8/8/N3K2k w - - 0 1');
      const moves = engine.legalMoves('a1');
      expect(moves.length).toBe(2);
      expect(moves.map((m) => m.to).sort()).toEqual(['b3', 'c2'].sort());
    });

    it('has 4 legal moves from an edge square (a4)', () => {
      const engine = new GameEngine('8/8/8/8/N7/8/8/4K2k w - - 0 1');
      const moves = engine.legalMoves('a4');
      expect(moves.length).toBe(4);
      expect(moves.map((m) => m.to).sort()).toEqual(['b2', 'b6', 'c3', 'c5'].sort());
    });

    it('has 8 legal moves from an open central square (d4)', () => {
      const engine = new GameEngine('8/8/8/8/3N4/8/8/4K2k w - - 0 1');
      const moves = engine.legalMoves('d4');
      expect(moves.length).toBe(8);
      expect(moves.map((m) => m.to).sort()).toEqual([
        'b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'
      ].sort());
    });
  });

  describe('King Corner & Center Geometry', () => {
    it('has 3 legal moves from a corner', () => {
      const engine = new GameEngine('K7/8/8/8/8/8/8/7k w - - 0 1');
      const moves = engine.legalMoves('a8');
      expect(moves.length).toBe(3);
      expect(moves.map((m) => m.to).sort()).toEqual(['a7', 'b7', 'b8'].sort());
    });

    it('has 8 legal moves from a center square without obstructions', () => {
      const engine = new GameEngine('8/8/8/8/4K3/8/8/7k w - - 0 1');
      const moves = engine.legalMoves('e4');
      expect(moves.length).toBe(8);
    });
  });

  describe('Opening Book Matching', () => {
    it('identifies Ruy Lopez moves', () => {
      const opening = identifyOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
      expect(opening).toBeDefined();
      expect(opening?.name).toBe('Ruy Lopez');
      expect(opening?.eco).toBe('C60');
    });

    it('identifies Sicilian Defense Najdorf', () => {
      const opening = identifyOpening(['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6']);
      expect(opening).toBeDefined();
      expect(opening?.name).toBe('Sicilian Defense: Najdorf Variation');
      expect(opening?.eco).toBe('B90');
    });

    it('identifies Italian Game', () => {
      const opening = identifyOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
      expect(opening).toBeDefined();
      expect(opening?.name).toBe('Italian Game');
      expect(opening?.eco).toBe('C50');
    });

    it('identifies French Defense', () => {
      const opening = identifyOpening(['e4', 'e6']);
      expect(opening).toBeDefined();
      expect(opening?.name).toBe('French Defense');
      expect(opening?.eco).toBe('C00');
    });

    it('identifies English Opening', () => {
      const opening = identifyOpening(['c4']);
      expect(opening).toBeDefined();
      expect(opening?.name).toBe('English Opening');
      expect(opening?.eco).toBe('A10');
    });
  });

  describe('GameEngine Subscription & Event Dispatch', () => {
    it('dispatches listener on move and undo', () => {
      const engine = new GameEngine();
      let callCount = 0;
      const unsubscribe = engine.subscribe(() => {
        callCount++;
      });

      engine.move({ from: 'e2', to: 'e4' });
      expect(callCount).toBe(1);

      engine.undo();
      expect(callCount).toBe(2);

      unsubscribe();
      engine.move({ from: 'd2', to: 'd4' });
      expect(callCount).toBe(2); // No further calls after unsubscribe
    });
  });

  describe('Move Validation & Rejections', () => {
    it('rejects moving an empty square', () => {
      const engine = new GameEngine();
      const res = engine.move({ from: 'e4', to: 'e5' });
      expect('code' in res).toBe(true);
      if ('code' in res) {
        expect(res.code).toBe('ILLEGAL_MOVE');
      }
    });

    it('rejects moving opponent piece on your turn', () => {
      const engine = new GameEngine();
      // White turn, trying to move black e7 pawn
      const res = engine.move({ from: 'e7', to: 'e5' });
      expect('code' in res).toBe(true);
    });

    it('rejects moves once game is over', () => {
      const engine = new GameEngine();
      engine.resign('w');
      const res = engine.move({ from: 'e2', to: 'e4' });
      expect('code' in res).toBe(true);
      if ('code' in res) {
        expect(res.code).toBe('GAME_OVER');
      }
    });
  });

  describe('Discovered Checks', () => {
    it('detects check when an intervening piece moves away revealing a line of sight', () => {
      // White king on e1, White bishop on d2, Black rook on a5, Black king on g8
      // If White moves rook e1 to e7 checking king...
      // Or: White Queen on e1, White Knight on e4, Black King on e8.
      // Moving Knight to d6 or f6 or g5 reveals Queen checking King on e8!
      const engine = new GameEngine('4k3/8/8/8/4N3/8/8/4Q2K w - - 0 1');
      const res = engine.move({ from: 'e4', to: 'f6' });
      expect('code' in res).toBe(false);
      if (!('code' in res)) {
        expect(res.isCheck).toBe(true);
        expect(engine.inCheck()).toBe(true);
      }
    });
  });
});
