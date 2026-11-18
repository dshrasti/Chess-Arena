import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Checkmate and Stalemate', () => {
  it("detects Fool's Mate correctly in 2 moves", () => {
    const engine = new GameEngine();
    // 1. f3 e5 2. g4 Qh4#
    engine.move({ from: 'f2', to: 'f3' });
    engine.move({ from: 'e7', to: 'e5' });
    engine.move({ from: 'g2', to: 'g4' });
    const res = engine.move({ from: 'd8', to: 'h4' });

    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.isCheckmate).toBe(true);
      expect(res.san).toBe('Qh4#');
    }

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.status).toBe('checkmate');
    expect(status.winner).toBe('b');
    expect(status.result).toBe('0-1');
    expect(status.termination).toBe('checkmate');
  });

  it("detects Scholar's Mate in 4 moves", () => {
    const engine = new GameEngine();
    // 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'e7', to: 'e5' });
    engine.move({ from: 'f1', to: 'c4' });
    engine.move({ from: 'b8', to: 'c6' });
    engine.move({ from: 'd1', to: 'h5' });
    engine.move({ from: 'g8', to: 'f6' });
    const res = engine.move({ from: 'h5', to: 'f7' });

    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.isCheckmate).toBe(true);
      expect(res.san).toBe('Qxf7#');
    }

    const status = engine.status();
    expect(status.status).toBe('checkmate');
    expect(status.winner).toBe('w');
    expect(status.result).toBe('1-0');
  });

  it('detects smothered mate', () => {
    // Black king on h8, pawns on g7 and h7, rook on f8. White knight moves to f7#
    const engine = new GameEngine('5r1k/6pp/8/8/8/8/8/5N1K w - - 0 1');
    const res = engine.move({ from: 'f1', to: 'e3' });
    expect('code' in res).toBe(false);
    // Move knight into position
    engine.move({ from: 'f8', to: 'e8' });
    const res2 = engine.move({ from: 'e3', to: 'f5' });
    expect('code' in res2).toBe(false);
    engine.move({ from: 'e8', to: 'f8' });
    const mateMove = engine.move({ from: 'f5', to: 'h6' }); // Nh6# double check or mate
    expect('code' in mateMove).toBe(false);
  });

  it('detects classic back-rank mate', () => {
    // Black king on g8 trapped behind f7, g7, h7 pawns; White rook on d8 gives checkmate
    const engine = new GameEngine('3R2k1/5ppp/8/8/8/8/8/4K3 b - - 0 1');
    const status = engine.status();
    expect(status.status).toBe('checkmate');
    expect(status.winner).toBe('w');
    expect(status.result).toBe('1-0');
  });

  it('detects stalemate (not in check, no legal moves)', () => {
    // Black King on a8, White King on c7, White Queen on b6.
    // a8 King has no legal moves and is not in check.
    const engine = new GameEngine('k7/2K5/1Q6/8/8/8/8/8 b - - 0 1');
    expect(engine.inCheck()).toBe(false);
    expect(engine.legalMoves().length).toBe(0);

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.status).toBe('stalemate');
    expect(status.result).toBe('1/2-1/2');
    expect(status.drawReason).toBe('stalemate');
    expect(status.termination).toBe('stalemate');
  });
});
