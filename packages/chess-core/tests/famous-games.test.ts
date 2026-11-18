import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Famous Games Regression Fixtures', () => {
  it("replays Morphy's Opera Game (1858) to checkmate", () => {
    const engine = new GameEngine();
    const morphyMoves: Array<[string, string]> = [
      ['e2', 'e4'], ['e7', 'e5'],
      ['g1', 'f3'], ['d7', 'd6'],
      ['d2', 'd4'], ['c8', 'g4'],
      ['d4', 'e5'], ['g4', 'f3'],
      ['d1', 'f3'], ['d6', 'e5'],
      ['f1', 'c4'], ['g8', 'f6'],
      ['f3', 'b3'], ['d8', 'e7'],
      ['b1', 'c3'], ['c7', 'c6'],
      ['c1', 'g5'], ['b7', 'b5'],
      ['c3', 'b5'], ['c6', 'b5'],
      ['c4', 'b5'], ['b8', 'd7'],
      ['e1', 'c1'], ['a8', 'd8'],
      ['d1', 'd7'], ['d8', 'd7'],
      ['h1', 'd1'], ['e7', 'e6'],
      ['b5', 'd7'], ['f6', 'd7'],
      ['b3', 'b8'], ['d7', 'b8'],
      ['d1', 'd8'], // 17. Rd8#
    ];

    for (const [from, to] of morphyMoves) {
      const res = engine.move({ from, to });
      expect('code' in res).toBe(false);
    }

    const status = engine.status();
    expect(status.isGameOver).toBe(true);
    expect(status.status).toBe('checkmate');
    expect(status.winner).toBe('w');
    expect(status.result).toBe('1-0');
  });

  it('replays Scholar Mate variations and traps', () => {
    const engine = new GameEngine();
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'e7', to: 'e5' });
    engine.move({ from: 'f1', to: 'c4' });
    engine.move({ from: 'f8', to: 'c5' });
    engine.move({ from: 'd1', to: 'h5' });
    engine.move({ from: 'g8', to: 'f6' });
    const res = engine.move({ from: 'h5', to: 'f7' });
    expect('code' in res).toBe(false);
    expect(engine.status().status).toBe('checkmate');
  });
});

