import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/GameEngine';

describe('Piece Movements & Check Rules', () => {
  it('allows pawns to advance 1 or 2 squares on first move', () => {
    const engine = new GameEngine();
    const eMoves = engine.legalMoves('e2');
    expect(eMoves.map((m) => m.to)).toContain('e3');
    expect(eMoves.map((m) => m.to)).toContain('e4');
  });

  it('blocks pawns when a piece is immediately in front', () => {
    // White pawn on e2, black knight on e3
    const engine = new GameEngine('rnbqkbnr/pppppppp/8/8/8/4n3/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const eMoves = engine.legalMoves('e2');
    expect(eMoves.length).toBe(0);
  });

  it('allows knights to jump over pieces', () => {
    const engine = new GameEngine();
    const b1Moves = engine.legalMoves('b1');
    expect(b1Moves.map((m) => m.to).sort()).toEqual(['a3', 'c3'].sort());
  });

  it('stops sliding pieces at obstacles', () => {
    const engine = new GameEngine();
    // Bishop on c1 cannot move over pawns
    expect(engine.legalMoves('c1').length).toBe(0);
    // Rook on a1 cannot move over pawns
    expect(engine.legalMoves('a1').length).toBe(0);
  });

  it('enforces absolute pin (pinned piece cannot expose king)', () => {
    // White king on e1, White knight on e2, Black queen on e8 pinning the knight, Black king on h8
    const engine = new GameEngine('4q2k/8/8/8/8/8/4N3/4K3 w - - 0 1');
    const knightMoves = engine.legalMoves('e2');
    expect(knightMoves.length).toBe(0); // Knight cannot move at all without exposing King
  });

  it('allows pinned bishop to move along the pin ray', () => {
    // White king on e1, White bishop on d2, Black bishop on a5 pinning along a5-e1 diagonal, Black king on h8
    const engine = new GameEngine('7k/8/8/b7/8/8/3B4/4K3 w - - 0 1');
    const bishopMoves = engine.legalMoves('d2');
    // Can move to c3, b4 or capture on a5 along the pin ray, but cannot leave diagonal
    expect(bishopMoves.map((m) => m.to).sort()).toEqual(['a5', 'b4', 'c3'].sort());
  });

  it('prevents king from moving into attacked squares', () => {
    // White king on e1, Black rook on d8 controlling d-file, Black king on h8
    const engine = new GameEngine('3r3k/8/8/8/8/8/8/4K3 w - - 0 1');
    const kingMoves = engine.legalMoves('e1');
    // Cannot move to d1 or d2
    expect(kingMoves.map((m) => m.to)).not.toContain('d1');
    expect(kingMoves.map((m) => m.to)).not.toContain('d2');
    // Can move to e2, f1, f2
    expect(kingMoves.map((m) => m.to).sort()).toEqual(['e2', 'f1', 'f2'].sort());
  });

  it('requires moving out of check when checked', () => {
    // White king on e1, Black queen on e2 checking the king, Black king on h8
    const engine = new GameEngine('7k/8/8/8/8/8/4q3/4K3 w - - 0 1');
    expect(engine.inCheck()).toBe(true);
    const moves = engine.legalMoves();
    // Only legal move is king capturing the queen on e2
    expect(moves.length).toBe(1);
    expect(moves[0]!.from).toBe('e1');
    expect(moves[0]!.to).toBe('e2');
  });

  it('allows blocking check with an intervening piece', () => {
    // White king on e1, Black rook on e8, White bishop on c1 can move to e3, Black king on h8
    const engine = new GameEngine('4r2k/8/8/8/8/8/8/2B1K3 w - - 0 1');
    expect(engine.inCheck()).toBe(true);
    const bishopMoves = engine.legalMoves('c1');
    expect(bishopMoves.map((m) => m.to)).toContain('e3');
  });
});
