import { Chess, Square as ChessJsSquare, Move as ChessJsMove } from 'chess.js';
import {
  Color,
  PieceType,
  Square,
  MoveInput,
  MoveResult,
  LegalMoveInfo,
  GameEngineStatus,
  CapturedPieces,
  MaterialBalance,
  CastlingDetails,
  GameError,
} from './types.js';
import { validateFen } from './fen.js';
import { toUci } from './notation.js';
import { isInsufficientMaterial } from './draw-rules.js';

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export type GameEventListener = (engine: GameEngine) => void;

export class GameEngine {
  private chess: Chess;
  private redoStack: MoveInput[] = [];
  private historyStack: MoveResult[] = [];
  private currentPlyIndex = -1; // -1 means start position
  private initialFen: string;
  private listeners = new Set<GameEventListener>();

  // Game over overrides (e.g. resignation, draw agreement, timeout)
  private resignationWinner?: Color;
  private drawAgreed = false;
  private timeoutWinner?: Color;

  constructor(fen?: string) {
    if (fen) {
      const val = validateFen(fen);
      if (!val.valid) {
        throw new Error(`Cannot initialize GameEngine: ${val.error}`);
      }
      this.chess = new Chess(fen);
      this.initialFen = fen;
    } else {
      this.chess = new Chess();
      this.initialFen = this.chess.fen();
    }
  }

  // --- Static Factories ---
  public static fromFen(fen: string): GameEngine {
    return new GameEngine(fen);
  }

  // --- Board State & Turn ---
  public toFen(): string {
    return this.chess.fen();
  }

  public getInitialFen(): string {
    return this.initialFen;
  }

  public turn(): Color {
    return this.chess.turn() as Color;
  }

  public inCheck(): boolean {
    return this.chess.inCheck();
  }

  public kingSquare(color: Color): Square {
    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r]?.[c];
        if (piece && piece.type === 'k' && piece.color === color) {
          return piece.square as Square;
        }
      }
    }
    throw new Error(`King for color '${color}' not found on board.`);
  }

  public getPiece(square: Square): { type: PieceType; color: Color } | null {
    const p = this.chess.get(square as ChessJsSquare);
    if (!p) return null;
    return { type: p.type as PieceType, color: p.color as Color };
  }

  // --- Legal Moves ---
  public legalMoves(square?: Square): LegalMoveInfo[] {
    const moves = this.chess.moves({
      square: square ? (square as ChessJsSquare) : undefined,
      verbose: true,
    }) as ChessJsMove[];

    return moves.map((m) => ({
      from: m.from as Square,
      to: m.to as Square,
      piece: m.piece as PieceType,
      color: m.color as Color,
      san: m.san,
      uci: toUci(m.from, m.to, m.promotion as PieceType | undefined),
      captured: m.captured as PieceType | undefined,
      promotion: m.promotion as PieceType | undefined,
      flags: m.flags,
    }));
  }

  // --- Move Execution ---
  public move(input: MoveInput): MoveResult | GameError {
    const currentStatus = this.status();
    if (currentStatus.isGameOver) {
      return { code: 'GAME_OVER', message: 'Game is already over' };
    }

    // If navigating history in the past and a new move is played, truncate forward history
    if (this.currentPlyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.currentPlyIndex + 1);
    }

    const fenBefore = this.chess.fen();
    const activeColor = this.turn();

    // Check if moving to 8th rank (w) or 1st rank (b) without promotion specified
    const fromPiece = this.chess.get(input.from as ChessJsSquare);
    if (
      fromPiece &&
      fromPiece.type === 'p' &&
      !input.promotion &&
      ((activeColor === 'w' && input.to.endsWith('8')) ||
        (activeColor === 'b' && input.to.endsWith('1')))
    ) {
      // Check if it's a legal move target first
      const legals = this.legalMoves(input.from as Square);
      const isTargetLegal = legals.some((m) => m.to === input.to);
      if (isTargetLegal) {
        return {
          code: 'PROMOTION_REQUIRED',
          message: 'Pawn promotion piece must be specified (q, r, b, n)',
        };
      }
    }

    let appliedMove: ChessJsMove;
    try {
      appliedMove = this.chess.move({
        from: input.from as ChessJsSquare,
        to: input.to as ChessJsSquare,
        promotion: input.promotion,
      });
    } catch {
      return {
        code: 'ILLEGAL_MOVE',
        message: `Illegal move from ${input.from} to ${input.to}`,
      };
    }

    if (!appliedMove) {
      return {
        code: 'ILLEGAL_MOVE',
        message: `Illegal move from ${input.from} to ${input.to}`,
      };
    }

    // Calculate castling details if applicable
    let castling: CastlingDetails | undefined;
    if (appliedMove.flags.includes('k')) {
      const rank = activeColor === 'w' ? '1' : '8';
      castling = {
        side: 'k',
        rookFrom: `h${rank}` as Square,
        rookTo: `f${rank}` as Square,
      };
    } else if (appliedMove.flags.includes('q')) {
      const rank = activeColor === 'w' ? '1' : '8';
      castling = {
        side: 'q',
        rookFrom: `a${rank}` as Square,
        rookTo: `d${rank}` as Square,
      };
    }

    // Calculate en passant captured square
    const isEnPassant = appliedMove.flags.includes('e');
    let capturedSquare: Square | undefined;
    if (appliedMove.captured) {
      if (isEnPassant) {
        const file = input.to[0];
        const rank = activeColor === 'w' ? '5' : '4';
        capturedSquare = `${file}${rank}` as Square;
      } else {
        capturedSquare = input.to as Square;
      }
    }

    const fenAfter = this.chess.fen();
    const result: MoveResult = {
      from: appliedMove.from as Square,
      to: appliedMove.to as Square,
      piece: appliedMove.piece as PieceType,
      color: appliedMove.color as Color,
      san: appliedMove.san,
      uci: toUci(appliedMove.from, appliedMove.to, appliedMove.promotion as PieceType | undefined),
      captured: appliedMove.captured as PieceType | undefined,
      capturedSquare,
      promotion: appliedMove.promotion as PieceType | undefined,
      castling,
      isEnPassant,
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      fenBefore,
      fenAfter,
      ply: this.historyStack.length + 1,
    };

    this.historyStack.push(result);
    this.currentPlyIndex = this.historyStack.length - 1;
    this.redoStack = []; // Clear redo stack on new move

    this.notifyListeners();
    return result;
  }

  // --- Undo & Redo ---
  public undo(): boolean {
    if (this.historyStack.length === 0) return false;

    const lastMove = this.historyStack[this.historyStack.length - 1]!;
    this.redoStack.push({
      from: lastMove.from,
      to: lastMove.to,
      promotion: lastMove.promotion,
    });

    this.chess.undo();
    this.historyStack.pop();
    this.currentPlyIndex = this.historyStack.length - 1;

    // Reset resignations/agreements if undone
    this.resignationWinner = undefined;
    this.drawAgreed = false;
    this.timeoutWinner = undefined;

    this.notifyListeners();
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const nextMove = this.redoStack.pop()!;
    const res = this.move(nextMove);
    return !('code' in res);
  }

  public canUndo(): boolean {
    return this.historyStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // --- History Navigation (Without destroying main line) ---
  public jumpToPly(ply: number): void {
    if (ply < 0 || ply > this.historyStack.length) return;

    // Replay from initial Fen to target ply
    this.chess = new Chess(this.initialFen);
    for (let i = 0; i < ply; i++) {
      const m = this.historyStack[i]!;
      this.chess.move({
        from: m.from as ChessJsSquare,
        to: m.to as ChessJsSquare,
        promotion: m.promotion,
      });
    }
    this.currentPlyIndex = ply - 1;
    this.notifyListeners();
  }

  public first(): void {
    this.jumpToPly(0);
  }

  public prev(): void {
    if (this.currentPlyIndex >= 0) {
      this.jumpToPly(this.currentPlyIndex);
    }
  }

  public next(): void {
    if (this.currentPlyIndex < this.historyStack.length - 1) {
      this.jumpToPly(this.currentPlyIndex + 2);
    }
  }

  public last(): void {
    this.jumpToPly(this.historyStack.length);
  }

  public isAtLivePosition(): boolean {
    return this.currentPlyIndex === this.historyStack.length - 1;
  }

  public getHistory(): MoveResult[] {
    return [...this.historyStack];
  }

  public getCurrentPly(): number {
    return this.currentPlyIndex + 1;
  }

  // --- Captured Pieces & Material Balance ---
  public capturedPieces(): CapturedPieces {
    const captured: CapturedPieces = { w: [], b: [] };

    // Standard starting set
    const startingPieces: Record<Color, Record<PieceType, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    const currentPieces: Record<Color, Record<PieceType, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r]?.[c];
        if (p) {
          const col = p.color as Color;
          const typ = p.type as PieceType;
          currentPieces[col][typ]++;
        }
      }
    }

    // Pieces missing from Black are White's captured pieces
    for (const [typ, count] of Object.entries(startingPieces.b)) {
      const type = typ as PieceType;
      if (type !== 'k') {
        const diff = count - (currentPieces.b[type] || 0);
        for (let i = 0; i < diff; i++) {
          captured.w.push(type);
        }
      }
    }

    // Pieces missing from White are Black's captured pieces
    for (const [typ, count] of Object.entries(startingPieces.w)) {
      const type = typ as PieceType;
      if (type !== 'k') {
        const diff = count - (currentPieces.w[type] || 0);
        for (let i = 0; i < diff; i++) {
          captured.b.push(type);
        }
      }
    }

    return captured;
  }

  public materialBalance(): MaterialBalance {
    const board = this.chess.board();
    let whiteVal = 0;
    let blackVal = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r]?.[c];
        if (p) {
          const val = PIECE_VALUES[p.type as PieceType] || 0;
          if (p.color === 'w') whiteVal += val;
          else blackVal += val;
        }
      }
    }

    return {
      diff: whiteVal - blackVal,
      whiteValue: whiteVal,
      blackValue: blackVal,
    };
  }

  // --- Status & Termination ---
  public status(): GameEngineStatus {
    if (this.resignationWinner) {
      return {
        status: 'playing',
        isGameOver: true,
        winner: this.resignationWinner,
        result: this.resignationWinner === 'w' ? '1-0' : '0-1',
        termination: 'resignation',
      };
    }

    if (this.timeoutWinner) {
      return {
        status: 'playing',
        isGameOver: true,
        winner: this.timeoutWinner,
        result: this.timeoutWinner === 'w' ? '1-0' : '0-1',
        termination: 'timeout',
      };
    }

    if (this.drawAgreed) {
      return {
        status: 'draw',
        isGameOver: true,
        result: '1/2-1/2',
        drawReason: 'agreement',
        termination: 'agreement',
      };
    }

    if (this.chess.isCheckmate()) {
      const winner: Color = this.turn() === 'w' ? 'b' : 'w';
      return {
        status: 'checkmate',
        isGameOver: true,
        winner,
        result: winner === 'w' ? '1-0' : '0-1',
        termination: 'checkmate',
      };
    }

    if (this.chess.isStalemate()) {
      return {
        status: 'stalemate',
        isGameOver: true,
        result: '1/2-1/2',
        drawReason: 'stalemate',
        termination: 'stalemate',
      };
    }

    if (this.chess.isThreefoldRepetition()) {
      return {
        status: 'draw',
        isGameOver: true,
        result: '1/2-1/2',
        drawReason: 'threefold_repetition',
        termination: 'repetition',
      };
    }

    // Halfmove >= 100 is 50 full moves
    const fen = this.chess.fen();
    const parts = fen.split(' ');
    const halfmove = parseInt(parts[4] || '0', 10);
    if (halfmove >= 100) {
      return {
        status: 'draw',
        isGameOver: true,
        result: '1/2-1/2',
        drawReason: 'fifty_move',
        termination: 'fifty-move',
      };
    }

    const placement = parts[0] || '';
    if (this.chess.isInsufficientMaterial() || isInsufficientMaterial(placement)) {
      return {
        status: 'draw',
        isGameOver: true,
        result: '1/2-1/2',
        drawReason: 'insufficient_material',
        termination: 'insufficient-material',
      };
    }

    return {
      status: 'playing',
      isGameOver: false,
      result: '*',
    };
  }

  // --- External Game Termination Triggers ---
  public resign(resigningColor: Color): void {
    if (this.status().isGameOver) return;
    this.resignationWinner = resigningColor === 'w' ? 'b' : 'w';
    this.notifyListeners();
  }

  public agreeDraw(): void {
    if (this.status().isGameOver) return;
    this.drawAgreed = true;
    this.notifyListeners();
  }

  public flagTimeout(losingColor: Color): void {
    if (this.status().isGameOver) return;
    // Check if opponent has sufficient material to mate
    const winningColor: Color = losingColor === 'w' ? 'b' : 'w';
    const placement = this.chess.fen().split(' ')[0] || '';
    if (isInsufficientMaterial(placement)) {
      // Timeout vs Insufficient Material is a draw under FIDE rules
      this.drawAgreed = true;
    } else {
      this.timeoutWinner = winningColor;
    }
    this.notifyListeners();
  }

  public claimDraw(): boolean {
    const status = this.status();
    if (status.drawReason === 'threefold_repetition' || status.drawReason === 'fifty_move') {
      return true;
    }
    const fen = this.chess.fen();
    const halfmove = parseInt(fen.split(' ')[4] || '0', 10);
    if (this.chess.isThreefoldRepetition() || halfmove >= 100) {
      this.drawAgreed = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // --- PGN & FEN IO ---
  public reset(): void {
    this.chess.reset();
    this.initialFen = this.chess.fen();
    this.historyStack = [];
    this.redoStack = [];
    this.currentPlyIndex = -1;
    this.resignationWinner = undefined;
    this.drawAgreed = false;
    this.timeoutWinner = undefined;
    this.notifyListeners();
  }

  public loadPgn(pgn: string): boolean {
    try {
      this.reset();
      this.chess.loadPgn(pgn);
      this.initialFen = new Chess().fen(); // Standard or extracted FEN
      const history = this.chess.history({ verbose: true }) as ChessJsMove[];

      // Rebuild history stack
      this.reset();
      for (const m of history) {
        this.move({
          from: m.from as Square,
          to: m.to as Square,
          promotion: m.promotion as PieceType | undefined,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  public toPgn(headers?: Record<string, string>): string {
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        this.chess.header(key, value);
      }
    }
    return this.chess.pgn();
  }

  // --- Subscriptions ---
  public subscribe(listener: GameEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (e) {
        console.error('Error in GameEngine listener:', e);
      }
    }
  }
}
