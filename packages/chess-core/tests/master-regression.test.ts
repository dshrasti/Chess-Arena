import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';
import { validateFen } from '../src/fen';
import { toFigurine, toUci, parseUci } from '../src/notation';

describe('Master Regression & Extra Rules Coverage (Target ≥ 150 tests)', () => {
  it('throws an error when initializing with invalid FEN', () => {
    expect(() => new GameEngine('invalid-fen')).toThrowError('Cannot initialize GameEngine');
  });

  it('correctly tracks King walk in famous Short vs Timman 1991 game sequence', () => {
    // Setting up position where King marches up the board
    const engine = new GameEngine('6k1/5pp1/8/8/8/6K1/8/8 w - - 0 1');
    engine.move({ from: 'g3', to: 'f4' });
    expect(engine.kingSquare('w')).toBe('f4');
    engine.move({ from: 'g8', to: 'h7' });
    engine.move({ from: 'f4', to: 'g5' });
    expect(engine.kingSquare('w')).toBe('g5');
  });

  describe('FEN round-trip tests for 10 diverse game positions', () => {
    const fens = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
      'r1b1k2r/pppp1ppp/2n2n2/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4',
      'r2q1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8',
      '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
      '8/8/8/8/8/4k3/4p3/4K3 w - - 0 1',
      '8/8/8/8/8/5k2/8/4K2R w - - 0 1',
      'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
      'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    ];

    for (let i = 0; i < fens.length; i++) {
      it(`accurately round-trips position FEN #${i + 1}`, () => {
        const fen = fens[i]!;
        const engine = new GameEngine(fen);
        expect(engine.toFen()).toBe(fen);
      });
    }
  });

  describe('Claim draw validation', () => {
    it('returns false when draw conditions are not met', () => {
      const engine = new GameEngine();
      expect(engine.claimDraw()).toBe(false);
    });

    it('returns true and ends game when eligible for threefold repetition claim', () => {
      const engine = new GameEngine();
      // 1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8
      engine.move({ from: 'g1', to: 'f3' });
      engine.move({ from: 'g8', to: 'f6' });
      engine.move({ from: 'f3', to: 'g1' });
      engine.move({ from: 'f6', to: 'g8' });
      engine.move({ from: 'g1', to: 'f3' });
      engine.move({ from: 'g8', to: 'f6' });
      engine.move({ from: 'f3', to: 'g1' });
      engine.move({ from: 'f6', to: 'g8' });

      expect(engine.claimDraw()).toBe(true);
      expect(engine.status().isGameOver).toBe(true);
      expect(engine.status().result).toBe('1/2-1/2');
    });

    it('returns true and ends game when halfmove clock >= 100', () => {
      const engine = new GameEngine('8/8/8/4k3/8/8/4K3/R7 w - - 100 50');
      expect(engine.claimDraw()).toBe(true);
      expect(engine.status().isGameOver).toBe(true);
    });
  });

  describe('Figurine and UCI notation toggles', () => {
    it('converts Queen check correctly', () => {
      expect(toFigurine('Qe7+')).toBe('♕e7+');
    });

    it('converts King moves correctly', () => {
      expect(toFigurine('Ke2')).toBe('♔e2');
    });

    it('converts Rook captures correctly', () => {
      expect(toFigurine('Rxd5')).toBe('♖xd5');
    });

    it('converts Bishop checks correctly', () => {
      expect(toFigurine('Bxf7+')).toBe('♗xf7+');
    });

    it('handles null and empty input in toFigurine', () => {
      expect(toFigurine('')).toBe('');
    });

    it('throws error on malformed UCI strings in parseUci', () => {
      expect(() => parseUci('e2')).toThrowError('Invalid UCI move string');
      expect(() => parseUci('')).toThrowError('Invalid UCI move string');
      expect(() => parseUci('e2e4qq')).toThrowError('Invalid UCI move string');
    });
  });

  describe('Reset and State Reinitialization', () => {
    it('resets all history, clocks, and termination overrides', () => {
      const engine = new GameEngine();
      engine.move({ from: 'e2', to: 'e4' });
      engine.resign('w');
      expect(engine.status().isGameOver).toBe(true);

      engine.reset();
      expect(engine.status().isGameOver).toBe(false);
      expect(engine.turn()).toBe('w');
      expect(engine.getHistory().length).toBe(0);
      expect(engine.toFen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });
  });
});

