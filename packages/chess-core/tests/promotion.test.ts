import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Pawn Promotion Rules', () => {
  it('allows promotion to Queen', () => {
    // White pawn on e7, ready to promote on e8
    const engine = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const res = engine.move({ from: 'e7', to: 'e8', promotion: 'q' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.promotion).toBe('q');
      expect(res.san).toBe('e8=Q');
      expect(engine.getPiece('e8')?.type).toBe('q');
    }
  });

  it('allows underpromotion to Rook, Bishop, Knight', () => {
    // Rook
    const engineR = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const resR = engineR.move({ from: 'e7', to: 'e8', promotion: 'r' });
    expect('code' in resR).toBe(false);
    if (!('code' in resR)) expect(resR.san).toBe('e8=R');

    // Bishop
    const engineB = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const resB = engineB.move({ from: 'e7', to: 'e8', promotion: 'b' });
    expect('code' in resB).toBe(false);
    if (!('code' in resB)) expect(resB.san).toBe('e8=B');

    // Knight
    const engineN = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const resN = engineN.move({ from: 'e7', to: 'e8', promotion: 'n' });
    expect('code' in resN).toBe(false);
    if (!('code' in resN)) expect(resN.san).toBe('e8=N');
  });

  it('supports capturing promotion', () => {
    // White pawn on e7, Black rook on d8
    const engine = new GameEngine('3r4/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const res = engine.move({ from: 'e7', to: 'd8', promotion: 'q' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.captured).toBe('r');
      expect(res.capturedSquare).toBe('d8');
      expect(res.san).toBe('exd8=Q');
    }
  });

  it('returns PROMOTION_REQUIRED when moving to last rank without promotion piece', () => {
    const engine = new GameEngine('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const res = engine.move({ from: 'e7', to: 'e8' });
    expect('code' in res).toBe(true);
    if ('code' in res) {
      expect(res.code).toBe('PROMOTION_REQUIRED');
    }
  });

  it('underpromotion to knight gives immediate check', () => {
    // White pawn on e7, Black king on f7, Black rook on d8
    // Promoting to knight on d8 checks the king on f7!
    const engine = new GameEngine('3r4/4P3/5k2/8/8/8/8/4K3 w - - 0 1');
    const res = engine.move({ from: 'e7', to: 'e8', promotion: 'n' });
    expect('code' in res).toBe(false);
    if (!('code' in res)) {
      expect(res.san).toBe('e8=N+');
      expect(res.isCheck).toBe(true);
      expect(engine.inCheck()).toBe(true);
    }
  });
});

