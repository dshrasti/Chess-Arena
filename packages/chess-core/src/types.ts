export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square =
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type MoveErrorCode =
  | 'ILLEGAL_MOVE'
  | 'GAME_OVER'
  | 'NOT_YOUR_TURN'
  | 'PROMOTION_REQUIRED'
  | 'INVALID_SQUARE';

export interface GameError {
  code: MoveErrorCode;
  message: string;
}

export interface MoveInput {
  from: Square | string;
  to: Square | string;
  promotion?: PieceType;
}

export interface CastlingDetails {
  side: 'k' | 'q';
  rookFrom: Square;
  rookTo: Square;
}

export interface MoveResult {
  from: Square;
  to: Square;
  piece: PieceType;
  color: Color;
  san: string;
  uci: string;
  captured?: PieceType;
  capturedSquare?: Square;
  promotion?: PieceType;
  castling?: CastlingDetails;
  isEnPassant?: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  fenBefore: string;
  fenAfter: string;
  ply: number;
}

export interface LegalMoveInfo {
  from: Square;
  to: Square;
  piece: PieceType;
  color: Color;
  san: string;
  uci: string;
  captured?: PieceType;
  promotion?: PieceType;
  flags: string;
}

export type PlayStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw';

export type DrawReason =
  | 'stalemate'
  | 'threefold_repetition'
  | 'fifty_move'
  | 'insufficient_material'
  | 'agreement';

export type GameResultString = '1-0' | '0-1' | '1/2-1/2' | '*';

export type TerminationReason =
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'stalemate'
  | 'repetition'
  | 'fifty-move'
  | 'insufficient-material'
  | 'timeout-vs-insufficient-material'
  | 'agreement'
  | 'abandonment';

export interface GameEngineStatus {
  status: PlayStatus;
  isGameOver: boolean;
  drawReason?: DrawReason;
  result: GameResultString;
  termination?: TerminationReason;
  winner?: Color;
}

export interface CapturedPieces {
  w: PieceType[];
  b: PieceType[];
}

export interface MaterialBalance {
  diff: number; // positive = white advantage, negative = black advantage
  whiteValue: number;
  blackValue: number;
}

export interface HistoryItem {
  ply: number;
  move: MoveResult;
  fen: string;
}

export interface PgnHeader {
  [key: string]: string;
}

export interface FenValidationResult {
  valid: boolean;
  error?: string;
}

