import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Draw Rules', () => {
  it('detects threefold repetition draw', () => {
    const engine = new GameEngine();
    // Knights shuffle back and forth 3 times
    // 1. Nf3 Nf6 2. Ng1 Ng8
    engine.move({ from: 'g1', to: 'f3' });
    engine.move({ from: 'g8', to: 'f6' });
    engine.move({ from: 'f3', to: 'g1' });
    engine.move({ from: 'f6', to: 'g8' });

    // 2. Nf3 Nf6 2. Ng1 Ng8 (2nd repetition)
    engine.move({ from: 'g1', to: 'f3' });
    engine.move({ from: 'g8', to: 'f6' });
    engine.move({ from: 'f3', to: 'g1' });
    engine.move({ from: 'f6', to: 'g8' });

    // Position has now occurred 3 times!
    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.status).toBe('draw');
    expect(status.drawReason).toBe('threefold_repetition');
    expect(status.result).toBe('1/2-1/2');
  });

  it('detects fifty-move rule draw (100 halfmoves without pawn push or capture)', () => {
    // FEN with halfmove clock set to 99
    const engine = new GameEngine('8/8/8/4k3/8/8/4K3/R7 w - - 99 50');
    // Move rook a1 to a2 (no pawn push, no capture)
    engine.move({ from: 'a1', to: 'a2' });

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.status).toBe('draw');
    expect(status.drawReason).toBe('fifty_move');
    expect(status.result).toBe('1/2-1/2');
  });

  it('detects insufficient material for King vs King', () => {
    const engine = new GameEngine('8/8/8/4k3/8/8/4K3/8 w - - 0 1');
    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.drawReason).toBe('insufficient_material');
    expect(status.result).toBe('1/2-1/2');
  });

  it('detects insufficient material for King + Bishop vs King', () => {
    const engine = new GameEngine('8/8/8/4k3/8/5B2/4K3/8 w - - 0 1');
    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.drawReason).toBe('insufficient_material');
  });

  it('detects insufficient material for King + Knight vs King', () => {
    const engine = new GameEngine('8/8/8/4k3/8/5N2/4K3/8 w - - 0 1');
    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.drawReason).toBe('insufficient_material');
  });

  it('detects insufficient material for same-color bishops (K+B vs K+B)', () => {
    // White bishop on c1 (dark square), Black bishop on f8 (dark square)
    // Dark square + Dark square = same color bishops -> insufficient material
    const engine = new GameEngine('5b2/8/8/4k3/8/8/4K3/2B5 w - - 0 1');
    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.drawReason).toBe('insufficient_material');
  });

  it('handles draw by agreement', () => {
    const engine = new GameEngine();
    engine.move({ from: 'e2', to: 'e4' });
    engine.agreeDraw();

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.status).toBe('draw');
    expect(status.drawReason).toBe('agreement');
    expect(status.result).toBe('1/2-1/2');
  });

  it('handles resignation', () => {
    const engine = new GameEngine();
    engine.resign('w'); // White resigns

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.winner).toBe('b');
    expect(status.result).toBe('0-1');
    expect(status.termination).toBe('resignation');
  });

  it('handles timeout adjudication vs insufficient material', () => {
    // Black flags on time, but White has only King (insufficient material to mate)
    const engine = new GameEngine('8/8/8/4k3/8/8/4K3/8 w - - 0 1');
    engine.flagTimeout('b'); // Black times out

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.result).toBe('1/2-1/2'); // Draw under FIDE rules
  });
});

