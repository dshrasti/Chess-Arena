import { PgnHeader } from './types.js';

export interface PgnMoveNode {
  san: string;
  ply: number;
  comment?: string;
  nag?: string;
  clock?: string;
  eval?: string;
  variations: PgnMoveNode[][];
}

export interface ParsedPgnGame {
  headers: PgnHeader;
  moves: PgnMoveNode[];
  rawPgn: string;
  result: string;
}

/**
 * Splits a PGN string that may contain multiple games into individual game PGN strings.
 */
export function splitMultiGamePgn(pgnText: string): string[] {
  if (!pgnText) return [];

  const lines = pgnText.replace(/\r\n/g, '\n').split('\n');
  const games: string[] = [];
  let currentGameLines: string[] = [];
  let inHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[Event ') && currentGameLines.length > 0 && !inHeader) {
      games.push(currentGameLines.join('\n').trim());
      currentGameLines = [];
    }

    if (trimmed.startsWith('[')) {
      inHeader = true;
    } else if (trimmed.length > 0) {
      inHeader = false;
    }

    currentGameLines.push(line);
  }

  if (currentGameLines.length > 0) {
    const remaining = currentGameLines.join('\n').trim();
    if (remaining.length > 0) {
      games.push(remaining);
    }
  }

  return games.length > 0 ? games : [pgnText.trim()];
}

/**
 * Parses headers from PGN string.
 */
export function parsePgnHeaders(pgnText: string): PgnHeader {
  const headers: PgnHeader = {};
  const headerRegex = /^\s*\[([A-Za-z0-9_]+)\s+"([^"]*)"\]\s*$/gm;
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(pgnText)) !== null) {
    const key = match[1]!;
    const val = match[2]!;
    headers[key] = val;
  }

  return headers;
}

/**
 * Formats headers into standard PGN string block.
 */
export function formatPgnHeaders(headers: PgnHeader): string {
  const standardOrder = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result', 'TimeControl', 'SetUp', 'FEN'];
  const written = new Set<string>();
  const lines: string[] = [];

  for (const key of standardOrder) {
    if (headers[key] !== undefined) {
      lines.push(`[${key} "${headers[key]}"]`);
      written.add(key);
    }
  }

  for (const [key, val] of Object.entries(headers)) {
    if (!written.has(key)) {
      lines.push(`[${key} "${val}"]`);
    }
  }

  return lines.join('\n');
}

/**
 * Parses PGN body extracting moves, comments, NAGs, clock annotations, and eval annotations.
 */
export function parsePgnBody(pgnBodyText: string): PgnMoveNode[] {
  // Strip comments, extract annotations
  const tokens = pgnBodyText
    .replace(/;.*$/gm, '') // Strip end of line comments
    .trim();

  const moves: PgnMoveNode[] = [];
  let i = 0;
  let ply = 0;

  while (i < tokens.length) {
    // Skip whitespace
    while (i < tokens.length && /\s/.test(tokens[i]!)) i++;
    if (i >= tokens.length) break;

    // Handle comments { ... }
    if (tokens[i] === '{') {
      const start = i + 1;
      let depth = 1;
      i++;
      while (i < tokens.length && depth > 0) {
        if (tokens[i] === '{') depth++;
        if (tokens[i] === '}') depth--;
        i++;
      }
      const comment = tokens.slice(start, i - 1).trim();
      const lastMove = moves[moves.length - 1];
      if (lastMove) {
        // Extract [%clk ...] or [%eval ...] if inside comment
        const clkMatch = comment.match(/\[%clk\s+([^\]]+)\]/);
        const evalMatch = comment.match(/\[%eval\s+([^\]]+)\]/);
        if (clkMatch) lastMove.clock = clkMatch[1];
        if (evalMatch) lastMove.eval = evalMatch[1];
        lastMove.comment = comment;
      }
      continue;
    }

    // Skip variations ( ... ) for main line parsing
    if (tokens[i] === '(') {
      let depth = 1;
      i++;
      while (i < tokens.length && depth > 0) {
        if (tokens[i] === '(') depth++;
        if (tokens[i] === ')') depth--;
        i++;
      }
      continue;
    }

    // Skip move numbers (e.g. "1.", "1...", "12.")
    if (/\d/.test(tokens[i]!)) {
      while (i < tokens.length && !/\s/.test(tokens[i]!) && tokens[i] !== '{' && tokens[i] !== '(') {
        i++;
      }
      continue;
    }

    // Read move or NAG or result
    const start = i;
    while (i < tokens.length && !/\s/.test(tokens[i]!) && tokens[i] !== '{' && tokens[i] !== '(' && tokens[i] !== ')') {
      i++;
    }
    const token = tokens.slice(start, i);

    // If result
    if (token === '1-0' || token === '0-1' || token === '1/2-1/2' || token === '*') {
      break;
    }

    // If NAG (e.g. $1, $2, or symbols !, ?, etc.)
    if (token.startsWith('$')) {
      const lastMove = moves[moves.length - 1];
      if (lastMove) lastMove.nag = token;
      continue;
    }

    // It is a SAN move
    ply++;
    moves.push({
      san: token,
      ply,
      variations: [],
    });
  }

  return moves;
}

