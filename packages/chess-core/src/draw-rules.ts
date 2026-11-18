import { DrawReason } from './types.js';

export interface PositionFingerprint {
  piecePlacement: string;
  turn: 'w' | 'b';
  castling: string;
  hasRealEnPassant: boolean;
  enPassantSquare?: string;
}

/**
 * Checks whether a board state represents insufficient mating material according to FIDE rules:
 * - K vs K
 * - K+B vs K
 * - K+N vs K
 * - K+B vs K+B (when bishops are on the same color squares)
 */
export function isInsufficientMaterial(piecePlacement: string): boolean {
  const pieces: Array<{ type: string; color: string; squareIndex: number }> = [];

  const ranks = piecePlacement.split('/');
  for (let r = 0; r < 8; r++) {
    const rank = ranks[r]!;
    let col = 0;
    for (let c = 0; c < rank.length; c++) {
      const char = rank[c]!;
      if (char >= '1' && char <= '8') {
        col += parseInt(char, 10);
      } else {
        const squareIndex = r * 8 + col;
        pieces.push({
          type: char.toLowerCase(),
          color: char === char.toUpperCase() ? 'w' : 'b',
          squareIndex,
        });
        col++;
      }
    }
  }

  // Any pawns, rooks, or queens automatically means sufficient material
  if (pieces.some((p) => p.type === 'p' || p.type === 'r' || p.type === 'q')) {
    return false;
  }

  // King vs King
  if (pieces.length === 2) {
    return true;
  }

  // King + Minor vs King (3 pieces total: 2 kings + 1 bishop/knight)
  if (pieces.length === 3) {
    return pieces.some((p) => p.type === 'b' || p.type === 'n');
  }

  // King + Bishop vs King + Bishop (4 pieces total: 2 kings, 1 white bishop, 1 black bishop)
  if (pieces.length === 4) {
    const whiteBishops = pieces.filter((p) => p.type === 'b' && p.color === 'w');
    const blackBishops = pieces.filter((p) => p.type === 'b' && p.color === 'b');

    if (whiteBishops.length === 1 && blackBishops.length === 1) {
      const wSq = whiteBishops[0]!.squareIndex;
      const bSq = blackBishops[0]!.squareIndex;

      const wRank = Math.floor(wSq / 8);
      const wCol = wSq % 8;
      const bRank = Math.floor(bSq / 8);
      const bCol = bSq % 8;

      const wIsLight = (wRank + wCol) % 2 === 0;
      const bIsLight = (bRank + bCol) % 2 === 0;

      // Same color bishops -> insufficient material
      return wIsLight === bIsLight;
    }
  }

  return false;
}

/**
 * Normalizes a position for threefold repetition checking.
 */
export function getPositionKey(fen: string, hasRealEnPassant = false): string {
  const parts = fen.trim().split(/\s+/);
  const placement = parts[0] || '';
  const turn = parts[1] || 'w';
  const castling = parts[2] || '-';
  const ep = hasRealEnPassant ? parts[3] || '-' : '-';

  return `${placement} ${turn} ${castling} ${ep}`;
}

export function classifyDraw(
  halfmoveClock: number,
  isStalemate: boolean,
  isRepetition: boolean,
  insufficient: boolean
): DrawReason | undefined {
  if (isStalemate) return 'stalemate';
  if (isRepetition) return 'threefold_repetition';
  if (halfmoveClock >= 100) return 'fifty_move';
  if (insufficient) return 'insufficient_material';
  return undefined;
}

