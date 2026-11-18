import { PieceType, Square } from './types.js';

export const FIGURINES: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

export const FIGURINE_WHITE: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
};

/**
 * Converts standard SAN (e.g. "Nf3", "Rad1", "Qxd4+") into figurine notation ("♘f3", "♖ad1", "♕xd4+").
 */
export function toFigurine(san: string): string {
  if (!san) return '';
  const firstChar = san[0];
  if (firstChar && FIGURINE_WHITE[firstChar]) {
    return FIGURINE_WHITE[firstChar] + san.slice(1);
  }
  return san;
}

/**
 * Converts {from, to, promotion} to UCI string (e.g. "e2e4", "e7e8q").
 */
export function toUci(from: string, to: string, promotion?: PieceType): string {
  return `${from}${to}${promotion ? promotion.toLowerCase() : ''}`;
}

/**
 * Parses UCI string into from, to, promotion components.
 */
export function parseUci(uci: string): { from: Square; to: Square; promotion?: PieceType } {
  if (!uci || uci.length < 4 || uci.length > 5) {
    throw new Error(`Invalid UCI move string: "${uci}"`);
  }
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = (uci.length === 5 ? uci[4]?.toLowerCase() : undefined) as PieceType | undefined;
  return { from, to, promotion };
}

