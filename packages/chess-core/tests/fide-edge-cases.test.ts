import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('FIDE Detailed Edge Cases & Invariants', () => {
  // Test all 8 ranks and files pawn start advances
  describe('Pawn double advance on all files a through h', () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (const f of files) {
      it(`allows pawn double advance on file ${f}`, () => {
        const engine = new GameEngine();
        const from = `${f}2`;
        const to = `${f}4`;
        const res = engine.move({ from, to });
        expect('code' in res).toBe(false);
        if (!('code' in res)) {
          expect(res.from).toBe(from);
          expect(res.to).toBe(to);
          expect(res.piece).toBe('p');
        }
      });
    }
  });

  describe('King safety and check detection on all ranks and diagonals', () => {
    it('detects check along ranks', () => {
      // White king on e2, White rook on a1 checking Black king on h1
      const engine = new GameEngine('8/8/8/8/8/8/4K3/R6k b - - 0 1');
      expect(engine.inCheck()).toBe(true);
    });

    it('detects check along files', () => {
      const engine = new GameEngine('7k/8/8/8/8/8/8/4K2R b - - 0 1');
      expect(engine.inCheck()).toBe(true);
    });

    it('detects check along diagonals by bishop', () => {
      const engine = new GameEngine('7k/8/5B2/8/8/8/8/4K3 b - - 0 1');
      expect(engine.inCheck()).toBe(true);
    });

    it('detects check by knight', () => {
      const engine = new GameEngine('7k/5N2/8/8/8/8/8/4K3 b - - 0 1');
      expect(engine.inCheck()).toBe(true);
    });

    it('detects check by pawn', () => {
      const engine = new GameEngine('7k/6P1/8/8/8/8/8/4K3 b - - 0 1');
      expect(engine.inCheck()).toBe(true);
    });
  });

  describe('Promotion Under-Promotions & Variants', () => {
    const pieces = ['q', 'r', 'b', 'n'] as const;
    for (const p of pieces) {
      it(`correctly produces White promotion to ${p.toUpperCase()}`, () => {
        const engine = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
        const res = engine.move({ from: 'e7', to: 'e8', promotion: p });
        expect('code' in res).toBe(false);
        if (!('code' in res)) {
          expect(res.promotion).toBe(p);
          expect(engine.getPiece('e8')?.type).toBe(p);
        }
      });

      it(`correctly produces Black promotion to ${p.toUpperCase()}`, () => {
        const engine = new GameEngine('4k2K/8/8/8/8/8/4p3/8 b - - 0 1');
        const res = engine.move({ from: 'e2', to: 'e1', promotion: p });
        expect('code' in res).toBe(false);
        if (!('code' in res)) {
          expect(res.promotion).toBe(p);
          expect(engine.getPiece('e1')?.type).toBe(p);
        }
      });
    }
  });

  describe('Legal moves query per square', () => {
    it('returns empty array when square is empty', () => {
      const engine = new GameEngine();
      expect(engine.legalMoves('e4').length).toBe(0);
    });

    it('returns empty array when square has opponent piece on your turn', () => {
      const engine = new GameEngine();
      expect(engine.legalMoves('e7').length).toBe(0);
    });

    it('returns piece information for every valid legal move', () => {
      const engine = new GameEngine();
      const moves = engine.legalMoves();
      expect(moves.length).toBe(20); // 16 pawn moves + 4 knight moves
      for (const m of moves) {
        expect(m.from).toBeDefined();
        expect(m.to).toBeDefined();
        expect(m.san).toBeDefined();
        expect(m.uci).toBeDefined();
        expect(m.color).toBe('w');
      }
    });
  });

  describe('King square resolution', () => {
    it('accurately identifies king square for both colors', () => {
      const engine = new GameEngine();
      expect(engine.kingSquare('w')).toBe('e1');
      expect(engine.kingSquare('b')).toBe('e8');

      // Move king
      engine.move({ from: 'e2', to: 'e4' });
      engine.move({ from: 'e7', to: 'e5' });
      engine.move({ from: 'e1', to: 'e2' });
      expect(engine.kingSquare('w')).toBe('e2');
    });
  });

  describe('FEN Export Consistency', () => {
    it('exports identical FEN after symmetric moves', () => {
      const engine = new GameEngine();
      const initial = engine.toFen();
      engine.move({ from: 'g1', to: 'f3' });
      engine.move({ from: 'g8', to: 'f6' });
      engine.move({ from: 'f3', to: 'g1' });
      engine.move({ from: 'f6', to: 'g8' });
      // Halfmove clock increments, but piece placement and castling match
      expect(engine.toFen().split(' ')[0]).toBe(initial.split(' ')[0]);
      expect(engine.toFen().split(' ')[1]).toBe(initial.split(' ')[1]);
      expect(engine.toFen().split(' ')[2]).toBe(initial.split(' ')[2]);
    });
  });
});
