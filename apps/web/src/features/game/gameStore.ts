import { create } from 'zustand';
import {
  GameEngine,
  Square,
  Color,
  PieceType,
  MoveResult,
  GameEngineStatus,
  CapturedPieces,
  MaterialBalance,
} from '@chess-arena/chess-core';
import { soundManager } from '../../lib/audio';
import { PieceThemeId } from '../../config/themes';

const STORAGE_KEY = 'chess_arena_saved_game_v1';
const THEME_STORAGE_KEY = 'chess_arena_theme_prefs_v1';

export interface GameStoreState {
  engine: GameEngine;
  fen: string;
  turn: Color;
  inCheck: boolean;
  status: GameEngineStatus;
  capturedPieces: CapturedPieces;
  materialBalance: MaterialBalance;
  history: MoveResult[];
  currentPly: number;
  isAtLive: boolean;
  lastMove: { from: Square; to: Square } | null;

  // Board UI state
  isFlipped: boolean;
  selectedSquare: Square | null;
  legalTargets: Square[];
  pendingPromotion: { from: Square; to: Square } | null;
  boardTheme: string;
  pieceTheme: PieceThemeId;
  isMuted: boolean;
  isDark: boolean;

  // Actions
  selectSquare: (square: Square | null) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceType) => boolean;
  confirmPromotion: (piece: PieceType) => void;
  cancelPromotion: () => void;
  undo: () => void;
  redo: () => void;
  jumpToPly: (ply: number) => void;
  first: () => void;
  prev: () => void;
  next: () => void;
  last: () => void;
  flipBoard: () => void;
  restartGame: () => void;
  resign: (color: Color) => void;
  agreeDraw: () => void;
  claimDraw: () => boolean;
  loadFen: (fen: string) => boolean;
  loadPgn: (pgn: string) => boolean;
  setBoardTheme: (themeId: string) => void;
  setPieceTheme: (theme: PieceThemeId) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
}

function getInitialStoredThemes() {
  if (typeof window === 'undefined') {
    return { boardTheme: 'grandmaster', pieceTheme: 'grandmaster' as PieceThemeId, isDark: true };
  }
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { boardTheme: 'grandmaster', pieceTheme: 'grandmaster' as PieceThemeId, isDark: true };
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialThemes = getInitialStoredThemes();
  const engine = new GameEngine();

  const syncState = (eng: GameEngine) => {
    const fen = eng.toFen();
    const turn = eng.turn();
    const inCheck = eng.inCheck();
    const status = eng.status();
    const capturedPieces = eng.capturedPieces();
    const materialBalance = eng.materialBalance();
    const history = eng.getHistory();
    const currentPly = eng.getCurrentPly();
    const isAtLive = eng.isAtLivePosition();
    const lastMoveResult = history[currentPly - 1];
    const lastMove = lastMoveResult ? { from: lastMoveResult.from, to: lastMoveResult.to } : null;

    // Auto-save game to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            fen: eng.toFen(),
            pgn: eng.toPgn(),
            history: eng.getHistory(),
          })
        );
      } catch {}
    }

    return {
      fen,
      turn,
      inCheck,
      status,
      capturedPieces,
      materialBalance,
      history,
      currentPly,
      isAtLive,
      lastMove,
      selectedSquare: null,
      legalTargets: [],
      pendingPromotion: null,
    };
  };

  return {
    engine,
    ...syncState(engine),
    isFlipped: false,
    selectedSquare: null,
    legalTargets: [],
    pendingPromotion: null,
    boardTheme: initialThemes.boardTheme || 'emerald',
    pieceTheme: initialThemes.pieceTheme || 'staunton',
    isMuted: false,
    isDark: initialThemes.isDark ?? true,

    selectSquare: (sq: Square | null) => {
      const state = get();
      if (!sq) {
        set({ selectedSquare: null, legalTargets: [] });
        return;
      }

      // If board is viewed at a past ply, selection is disallowed until returning to live
      if (!state.isAtLive) return;

      const currentPiece = state.engine.getPiece(sq);
      const isCurrentPlayerPiece = currentPiece && currentPiece.color === state.turn;

      // If already selected the same square, deselect
      if (state.selectedSquare === sq) {
        set({ selectedSquare: null, legalTargets: [] });
        return;
      }

      // If clicking an existing own piece, switch selection and show legal targets
      if (isCurrentPlayerPiece) {
        const legalMoves = state.engine.legalMoves(sq);
        set({
          selectedSquare: sq,
          legalTargets: legalMoves.map((m) => m.to),
        });
        return;
      }

      // If previously selected and now clicking a legal target, make the move!
      if (state.selectedSquare && state.legalTargets.includes(sq)) {
        state.makeMove(state.selectedSquare, sq);
      } else {
        set({ selectedSquare: null, legalTargets: [] });
      }
    },

    makeMove: (from: Square, to: Square, promotion?: PieceType) => {
      const state = get();
      if (!state.isAtLive) return false;

      // Check if moving pawn to 8th / 1st rank requires promotion
      const piece = state.engine.getPiece(from);
      if (
        piece &&
        piece.type === 'p' &&
        !promotion &&
        ((piece.color === 'w' && to.endsWith('8')) || (piece.color === 'b' && to.endsWith('1')))
      ) {
        const legals = state.engine.legalMoves(from);
        if (legals.some((m) => m.to === to)) {
          set({ pendingPromotion: { from, to } });
          return true;
        }
      }

      const res = state.engine.move({ from, to, promotion });
      if ('code' in res) {
        soundManager.play('illegal-move');
        set({ selectedSquare: null, legalTargets: [] });
        return false;
      }

      // Play appropriate sound
      if (res.isCheckmate) {
        soundManager.play('game-end');
      } else if (res.isCheck) {
        soundManager.play('check');
      } else if (res.castling) {
        soundManager.play('castle');
      } else if (res.promotion) {
        soundManager.play('promote');
      } else if (res.captured) {
        soundManager.play('capture');
      } else {
        soundManager.play('move');
      }

      set(syncState(state.engine));
      return true;
    },

    confirmPromotion: (piece: PieceType) => {
      const state = get();
      if (!state.pendingPromotion) return;
      const { from, to } = state.pendingPromotion;
      set({ pendingPromotion: null });
      state.makeMove(from, to, piece);
    },

    cancelPromotion: () => {
      set({ pendingPromotion: null, selectedSquare: null, legalTargets: [] });
    },

    undo: () => {
      const state = get();
      if (state.engine.undo()) {
        soundManager.play('move');
        set(syncState(state.engine));
      }
    },

    redo: () => {
      const state = get();
      if (state.engine.redo()) {
        soundManager.play('move');
        set(syncState(state.engine));
      }
    },

    jumpToPly: (ply: number) => {
      const state = get();
      state.engine.jumpToPly(ply);
      set(syncState(state.engine));
    },

    first: () => {
      const state = get();
      state.engine.first();
      set(syncState(state.engine));
    },

    prev: () => {
      const state = get();
      state.engine.prev();
      set(syncState(state.engine));
    },

    next: () => {
      const state = get();
      state.engine.next();
      set(syncState(state.engine));
    },

    last: () => {
      const state = get();
      state.engine.last();
      set(syncState(state.engine));
    },

    flipBoard: () => {
      set((s) => ({ isFlipped: !s.isFlipped }));
    },

    restartGame: () => {
      const state = get();
      state.engine.reset();
      soundManager.play('game-start');
      set(syncState(state.engine));
    },

    resign: (color: Color) => {
      const state = get();
      state.engine.resign(color);
      soundManager.play('game-end');
      set(syncState(state.engine));
    },

    agreeDraw: () => {
      const state = get();
      state.engine.agreeDraw();
      soundManager.play('game-end');
      set(syncState(state.engine));
    },

    claimDraw: () => {
      const state = get();
      const claimed = state.engine.claimDraw();
      if (claimed) {
        soundManager.play('game-end');
        set(syncState(state.engine));
      }
      return claimed;
    },

    loadFen: (fen: string) => {
      try {
        const newEngine = new GameEngine(fen);
        soundManager.play('game-start');
        set({ engine: newEngine, ...syncState(newEngine) });
        return true;
      } catch {
        return false;
      }
    },

    loadPgn: (pgn: string) => {
      const state = get();
      const ok = state.engine.loadPgn(pgn);
      if (ok) {
        soundManager.play('game-start');
        set(syncState(state.engine));
      }
      return ok;
    },

    setBoardTheme: (themeId: string) => {
      set({ boardTheme: themeId });
      const prefs = getInitialStoredThemes();
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prefs, boardTheme: themeId }));
    },

    setPieceTheme: (theme: 'staunton' | 'neo' | 'alpha') => {
      set({ pieceTheme: theme });
      const prefs = getInitialStoredThemes();
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prefs, pieceTheme: theme }));
    },

    toggleSound: () => {
      const state = get();
      const nextMuted = !state.isMuted;
      soundManager.setMuted(nextMuted);
      set({ isMuted: nextMuted });
    },

    toggleTheme: () => {
      const state = get();
      const nextDark = !state.isDark;
      set({ isDark: nextDark });
      if (typeof document !== 'undefined') {
        if (nextDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
      const prefs = getInitialStoredThemes();
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prefs, isDark: nextDark }));
    },
  };
});

