import { describe, it, expect } from 'vitest';
import { toFigurine, toUci, parseUci } from '../src/notation';
import { GameEngine } from '../src/GameEngine';

describe('Notation & SAN Disambiguation', () => {
  it('disambiguates by file when two knights can move to the same square (Nbd2)', () => {
    // 1. d4 d5 2. Nf3 e6. Now White knights on b1 and f3 can both move to d2!
    const engine = new GameEngine();
    engine.move({ from: 'd2', to: 'd4' });
    engine.move({ from: 'd7', to: 'd5' });
    engine.move({ from: 'g1', to: 'f3' });
    engine.move({ from: 'e7', to: 'e6' });

    const res = engine.move({ from: 'b1', to: 'd2' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.san).toBe('Nbd2');
    }
  });

  it('disambiguates by rank when two rooks share the same file (R1a3)', () => {
    // White rooks on a1 and a8, can both move to a3
    const engine = new GameEngine('R7/8/8/8/8/8/8/R3K2k w - - 0 1');
    const res = engine.move({ from: 'a1', to: 'a3' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.san).toBe('R1a3');
    }
  });

  it('appends + for check and # for checkmate', () => {
    // 1. e4 e5 2. Qh5 Ke7 3. Qxe5#
    const engine = new GameEngine();
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'e7', to: 'e5' });
    engine.move({ from: 'd1', to: 'h5' });
    const checkMove = engine.move({ from: 'e8', to: 'e7' });
    expect('code' in checkMove).toBe(false);

    const mateMove = engine.move({ from: 'h5', to: 'e5' });
    expect('code' in mateMove).toBe(false);
    if (!('code' in mateMove)) {
      expect(mateMove.san).toBe('Qxe5#');
      expect(mateMove.isCheckmate).toBe(true);
    }
  });

  it('converts SAN to figurine notation', () => {
    expect(toFigurine('Nf3')).toBe('♘f3');
    expect(toFigurine('Bc4')).toBe('♗c4');
    expect(toFigurine('Rad1')).toBe('♖ad1');
    expect(toFigurine('Qh4+')).toBe('♕h4+');
    expect(toFigurine('O-O')).toBe('O-O'); // Castling stays standard
    expect(toFigurine('e4')).toBe('e4'); // Pawn moves unchanged
  });

  it('converts to and parses UCI strings', () => {
    expect(toUci('e2', 'e4')).toBe('e2e4');
    expect(toUci('e7', 'e8', 'q')).toBe('e7e8q');

    const parsedNormal = parseUci('e2e4');
    expect(parsedNormal.from).toBe('e2');
    expect(parsedNormal.to).toBe('e4');
    expect(parsedNormal.promotion).toBeUndefined();

    const parsedPromo = parseUci('e7e8q');
    expect(parsedPromo.from).toBe('e7');
    expect(parsedPromo.to).toBe('e8');
    expect(parsedPromo.promotion).toBe('q');
  });
});
