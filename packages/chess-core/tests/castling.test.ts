import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Castling Rules', () => {
  it('allows standard white kingside and queenside castling when clear', () => {
    // Both sides clear for White
    const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const kingMoves = engine.legalMoves('e1');
    const targets = kingMoves.map((m) => m.to);
    expect(targets).toContain('g1'); // Kingside O-O
    expect(targets).toContain('c1'); // Queenside O-O-O

    const res = engine.move({ from: 'e1', to: 'g1' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.san).toBe('O-O');
      expect(res.castling).toEqual({
        side: 'k',
        rookFrom: 'h1',
        rookTo: 'f1',
      });
      // Verify rook on f1
      expect(engine.getPiece('f1')?.type).toBe('r');
    }
  });

  it('allows black castling when clear', () => {
    const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1');
    const res = engine.move({ from: 'e8', to: 'c8' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.san).toBe('O-O-O');
      expect(res.castling).toEqual({
        side: 'q',
        rookFrom: 'a8',
        rookTo: 'd8',
      });
      expect(engine.getPiece('d8')?.type).toBe('r');
    }
  });

  it('disallows castling when intermediate squares are occupied', () => {
    // Bishop on f1 blocks White kingside castling
    const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3KB1R w KQkq - 0 1');
    const targets = engine.legalMoves('e1').map((m) => m.to);
    expect(targets).not.toContain('g1');
    expect(targets).toContain('c1');
  });

  it('disallows castling when king is in check', () => {
    // Black rook on e8 checking White king on e1, Black king on h8
    const engine = new GameEngine('4r2k/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(engine.inCheck()).toBe(true);
    const targets = engine.legalMoves('e1').map((m) => m.to);
    expect(targets).not.toContain('g1');
    expect(targets).not.toContain('c1');
  });

  it('disallows castling through an attacked square', () => {
    // Black rook on f8 attacks f1, Black king on h8
    const engine = new GameEngine('5r1k/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const targets = engine.legalMoves('e1').map((m) => m.to);
    expect(targets).not.toContain('g1'); // f1 is attacked
    expect(targets).toContain('c1'); // Queenside still valid
  });

  it('disallows castling into an attacked square', () => {
    // Black rook on g8 attacks g1, Black king on h8
    const engine = new GameEngine('6rk/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const targets = engine.legalMoves('e1').map((m) => m.to);
    expect(targets).not.toContain('g1'); // g1 is attacked
  });

  it('allows queenside castling even if b1 is attacked (king does not pass through b1)', () => {
    // Black rook on b8 attacks b1, but king only travels e1 -> d1 -> c1, Black king on h8
    const engine = new GameEngine('1r4k1/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const targets = engine.legalMoves('e1').map((m) => m.to);
    expect(targets).toContain('c1');
  });

  it('permanently loses castling rights after king moves', () => {
    const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    // King moves e1 -> e2
    engine.move({ from: 'e1', to: 'e2' });
    // Black plays e8 -> e7
    engine.move({ from: 'e8', to: 'e7' });
    // King moves back e2 -> e1
    engine.move({ from: 'e2', to: 'e1' });
    // Black plays e7 -> e8
    engine.move({ from: 'e7', to: 'e8' });

    // Both kings have moved, so castling is no longer permitted
    expect(engine.legalMoves('e1').map((m) => m.to)).not.toContain('g1');
    expect(engine.legalMoves('e1').map((m) => m.to)).not.toContain('c1');
  });

  it('loses rights on specific side when that rook moves', () => {
    const engine = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    // h1 rook moves to g1
    engine.move({ from: 'h1', to: 'g1' });
    engine.move({ from: 'a8', to: 'b8' });
    engine.move({ from: 'g1', to: 'h1' });
    engine.move({ from: 'b8', to: 'a8' });

    // White kingside right is gone, but queenside is intact
    const targets = engine.legalMoves('e1').map((m) => m.to);
    expect(targets).not.toContain('g1');
    expect(targets).toContain('c1');
  });
});
