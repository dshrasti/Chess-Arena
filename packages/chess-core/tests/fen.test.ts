import { describe, it, expect } from 'vitest';
import { validateFen } from '../src/fen';

describe('FEN Validator', () => {
  it('accepts standard starting position FEN', () => {
    const res = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('rejects empty or non-string input', () => {
    expect(validateFen('').valid).toBe(false);
    // @ts-expect-error testing invalid type
    expect(validateFen(null).valid).toBe(false);
  });

  it('rejects FEN without 6 fields', () => {
    const res = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('expected 6 space-separated fields');
  });

  it('rejects FEN without 8 ranks', () => {
    const res = validateFen('rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('expected 8 ranks');
  });

  it('rejects ranks with too few or too many squares', () => {
    const tooMany = validateFen('rnbqkbnr/ppppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(tooMany.valid).toBe(false);
    const tooFew = validateFen('rnbqkbnr/pppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(tooFew.valid).toBe(false);
  });

  it('rejects pawns on the 1st or 8th rank', () => {
    const pawnOn8 = validateFen('rnbqkbnP/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(pawnOn8.valid).toBe(false);
    expect(pawnOn8.error).toContain('Pawns are not allowed on the 1st or 8th rank');

    const pawnOn1 = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNp w KQkq - 0 1');
    expect(pawnOn1.valid).toBe(false);
    expect(pawnOn1.error).toContain('Pawns are not allowed on the 1st or 8th rank');
  });

  it('rejects missing White King', () => {
    const noWhiteKing = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQ1BNR w KQkq - 0 1');
    expect(noWhiteKing.valid).toBe(false);
    expect(noWhiteKing.error).toContain('exactly one White King');
  });

  it('rejects missing Black King', () => {
    const noBlackKing = validateFen('rnbq1bnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(noBlackKing.valid).toBe(false);
    expect(noBlackKing.error).toContain('exactly one Black King');
  });

  it('rejects multiple kings of same color', () => {
    const twoWhiteKings = validateFen('rnbqkbnr/pppppppp/8/8/8/4K3/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(twoWhiteKings.valid).toBe(false);
  });

  it('rejects invalid active color', () => {
    const res = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1');
    expect(res.valid).toBe(false);
    expect(res.error).toContain("expected 'w' or 'b'");
  });

  it('rejects invalid castling availability symbols', () => {
    const res = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w ABC - 0 1');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid castling availability');
  });

  it('rejects duplicate castling availability symbols', () => {
    const res = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KKkq - 0 1');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Duplicate castling symbol');
  });

  it('validates en passant target rank matches color to move', () => {
    // When white is to move, ep square must be on rank 6
    const invalidRankForWhite = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e3 0 1');
    expect(invalidRankForWhite.valid).toBe(false);
    expect(invalidRankForWhite.error).toContain('must be on rank 6');

    // When black is to move, ep square must be on rank 3
    const invalidRankForBlack = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq e6 0 1');
    expect(invalidRankForBlack.valid).toBe(false);
    expect(invalidRankForBlack.error).toContain('must be on rank 3');
  });

  it('rejects invalid halfmove and fullmove counters', () => {
    const badHalfmove = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -5 1');
    expect(badHalfmove.valid).toBe(false);

    const badFullmove = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0');
    expect(badFullmove.valid).toBe(false);
  });
});

