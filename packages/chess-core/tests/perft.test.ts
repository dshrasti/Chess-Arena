import { describe, it, expect } from 'vitest';
import { Chess, Square } from 'chess.js';

function perft(chess: Chess, depth: number): number {
  if (depth === 0) return 1;

  const moves = chess.moves({ verbose: true });
  if (depth === 1) return moves.length;

  let nodes = 0;
  for (const move of moves) {
    chess.move({
      from: move.from as Square,
      to: move.to as Square,
      promotion: move.promotion,
    });
    nodes += perft(chess, depth - 1);
    chess.undo();
  }
  return nodes;
}

describe('Perft Move Generation Validation', () => {
  // Position 1: Standard Start
  it('passes Perft Position 1 (Standard Start Position)', () => {
    const chess = new Chess();
    expect(perft(chess, 1)).toBe(20);
    expect(perft(chess, 2)).toBe(400);
    expect(perft(chess, 3)).toBe(8902);
  });

  // Position 2: Kiwipete
  it('passes Perft Position 2 (Kiwipete)', () => {
    const fen = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1';
    const chess = new Chess(fen);
    expect(perft(chess, 1)).toBe(48);
    expect(perft(chess, 2)).toBe(2039);
  });

  // Position 3
  it('passes Perft Position 3', () => {
    const fen = '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1';
    const chess = new Chess(fen);
    expect(perft(chess, 1)).toBe(14);
    expect(perft(chess, 2)).toBe(191);
    expect(perft(chess, 3)).toBe(2812);
  });

  // Position 4
  it('passes Perft Position 4', () => {
    const fen = 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1';
    const chess = new Chess(fen);
    expect(perft(chess, 1)).toBe(6);
    expect(perft(chess, 2)).toBe(264);
    expect(perft(chess, 3)).toBe(9467);
  });

  // Position 5
  it('passes Perft Position 5', () => {
    const fen = 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8';
    const chess = new Chess(fen);
    expect(perft(chess, 1)).toBe(44);
    expect(perft(chess, 2)).toBe(1486);
  });

  // Position 6
  it('passes Perft Position 6', () => {
    const fen = 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10';
    const chess = new Chess(fen);
    expect(perft(chess, 1)).toBe(46);
    expect(perft(chess, 2)).toBe(2079);
  });
});
