import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('History, Undo/Redo & Material Balance', () => {
  it('undoes and redoes moves accurately', () => {
    const engine = new GameEngine();
    const fenStart = engine.toFen();

    engine.move({ from: 'e2', to: 'e4' });
    const fenAfterE4 = engine.toFen();
    expect(fenAfterE4).not.toBe(fenStart);

    // Undo e4
    expect(engine.undo()).toBe(true);
    expect(engine.toFen()).toBe(fenStart);
    expect(engine.canRedo()).toBe(true);

    // Redo e4
    expect(engine.redo()).toBe(true);
    expect(engine.toFen()).toBe(fenAfterE4);
  });

  it('clears redo stack when a new branching move is played', () => {
    const engine = new GameEngine();
    engine.move({ from: 'e2', to: 'e4' });
    engine.undo();
    expect(engine.canRedo()).toBe(true);

    // Play d2-d4 instead
    engine.move({ from: 'd2', to: 'd4' });
    expect(engine.canRedo()).toBe(false); // Redo stack was cleared
  });

  it('navigates history (jumpToPly, first, prev, next, last) non-destructively', () => {
    const engine = new GameEngine();
    engine.move({ from: 'e2', to: 'e4' }); // ply 1
    engine.move({ from: 'e7', to: 'e5' }); // ply 2
    engine.move({ from: 'g1', to: 'f3' }); // ply 3
    engine.move({ from: 'b8', to: 'c6' }); // ply 4

    expect(engine.getCurrentPly()).toBe(4);
    expect(engine.isAtLivePosition()).toBe(true);

    // Jump to ply 2 (after 1... e5)
    engine.jumpToPly(2);
    expect(engine.getCurrentPly()).toBe(2);
    expect(engine.turn()).toBe('w'); // White to move after ply 2
    expect(engine.isAtLivePosition()).toBe(false);

    // Jump to first
    engine.first();
    expect(engine.getCurrentPly()).toBe(0);

    // Step next
    engine.next();
    expect(engine.getCurrentPly()).toBe(1);

    // Jump to last (live)
    engine.last();
    expect(engine.getCurrentPly()).toBe(4);
    expect(engine.isAtLivePosition()).toBe(true);
    expect(engine.getHistory().length).toBe(4); // History remains intact
  });

  it('calculates material balance and captured pieces correctly', () => {
    const engine = new GameEngine();
    const initialBal = engine.materialBalance();
    expect(initialBal.diff).toBe(0);
    expect(initialBal.whiteValue).toBe(39); // 8p(8) + 2n(6) + 2b(6) + 2r(10) + 1q(9) = 39

    // 1. e4 d5 2. exd5
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'd7', to: 'd5' });
    engine.move({ from: 'e4', to: 'd5' });

    // White has captured 1 pawn
    const captured = engine.capturedPieces();
    expect(captured.w).toContain('p');
    expect(captured.b.length).toBe(0);

    const balAfterCapture = engine.materialBalance();
    expect(balAfterCapture.diff).toBe(1); // White +1 advantage
  });
});

