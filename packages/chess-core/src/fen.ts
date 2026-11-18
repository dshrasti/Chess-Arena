import { FenValidationResult, Color } from './types.js';

export function validateFen(fen: string): FenValidationResult {
  if (!fen || typeof fen !== 'string') {
    return { valid: false, error: 'FEN must be a non-empty string' };
  }

  const parts = fen.trim().split(/\s+/);
  if (parts.length !== 6) {
    return {
      valid: false,
      error: `Invalid FEN structure: expected 6 space-separated fields, got ${parts.length}`,
    };
  }

  const [piecePlacement, activeColor, castling, enPassant, halfmove, fullmove] = parts as [
    string, string, string, string, string, string
  ];

  // 1. Validate Piece Placement
  const ranks = piecePlacement.split('/');
  if (ranks.length !== 8) {
    return {
      valid: false,
      error: `Invalid piece placement: expected 8 ranks separated by '/', got ${ranks.length}`,
    };
  }

  let whiteKings = 0;
  let blackKings = 0;

  for (let r = 0; r < 8; r++) {
    const rank = ranks[r]!;
    let squareCount = 0;

    for (let c = 0; c < rank.length; c++) {
      const char = rank[c]!;

      if (char >= '1' && char <= '8') {
        squareCount += parseInt(char, 10);
      } else if (/[pnbrqkPNBRQK]/.test(char)) {
        squareCount += 1;

        if (char === 'K') whiteKings++;
        if (char === 'k') blackKings++;

        // Pawns on 1st rank (r = 7 in FEN) or 8th rank (r = 0 in FEN) are illegal
        if ((char === 'P' || char === 'p') && (r === 0 || r === 7)) {
          return {
            valid: false,
            error: `Pawns are not allowed on the 1st or 8th rank (found '${char}' on rank ${8 - r})`,
          };
        }
      } else {
        return {
          valid: false,
          error: `Invalid piece symbol '${char}' on rank ${8 - r}`,
        };
      }
    }

    if (squareCount !== 8) {
      return {
        valid: false,
        error: `Rank ${8 - r} has ${squareCount} squares instead of 8`,
      };
    }
  }

  if (whiteKings !== 1) {
    return {
      valid: false,
      error: `Board must have exactly one White King (found ${whiteKings})`,
    };
  }

  if (blackKings !== 1) {
    return {
      valid: false,
      error: `Board must have exactly one Black King (found ${blackKings})`,
    };
  }

  // 2. Validate Active Color
  if (activeColor !== 'w' && activeColor !== 'b') {
    return {
      valid: false,
      error: `Invalid active color '${activeColor}': expected 'w' or 'b'`,
    };
  }

  // 3. Validate Castling Rights
  if (castling !== '-' && !/^[KQkq]+$/.test(castling)) {
    return {
      valid: false,
      error: `Invalid castling availability '${castling}': must be '-' or a subset of 'KQkq'`,
    };
  }

  // Check duplicate castling letters
  if (castling !== '-') {
    const seen = new Set<string>();
    for (const ch of castling) {
      if (seen.has(ch)) {
        return {
          valid: false,
          error: `Duplicate castling symbol '${ch}' in '${castling}'`,
        };
      }
      seen.add(ch);
    }
  }

  // 4. Validate En Passant
  if (enPassant !== '-') {
    if (!/^[a-h][36]$/.test(enPassant)) {
      return {
        valid: false,
        error: `Invalid en-passant square '${enPassant}': must be '-' or on 3rd/6th rank (e.g. e3, d6)`,
      };
    }

    const targetRank = enPassant[1];
    if (activeColor === 'w' && targetRank !== '6') {
      return {
        valid: false,
        error: `When White is to move, en-passant square must be on rank 6 (got ${enPassant})`,
      };
    }
    if (activeColor === 'b' && targetRank !== '3') {
      return {
        valid: false,
        error: `When Black is to move, en-passant square must be on rank 3 (got ${enPassant})`,
      };
    }
  }

  // 5. Validate Halfmove Clock
  const halfmoveInt = parseInt(halfmove, 10);
  if (isNaN(halfmoveInt) || halfmoveInt < 0 || !/^\d+$/.test(halfmove)) {
    return {
      valid: false,
      error: `Invalid halfmove clock '${halfmove}': must be a non-negative integer`,
    };
  }

  // 6. Validate Fullmove Number
  const fullmoveInt = parseInt(fullmove, 10);
  if (isNaN(fullmoveInt) || fullmoveInt < 1 || !/^\d+$/.test(fullmove)) {
    return {
      valid: false,
      error: `Invalid fullmove number '${fullmove}': must be a positive integer (>= 1)`,
    };
  }

  return { valid: true };
}

export function isKingInCheck(_piecePlacement: string, _kingColor: Color): boolean {
  // Simple check verification on FEN string representation if needed
  return false;
}

