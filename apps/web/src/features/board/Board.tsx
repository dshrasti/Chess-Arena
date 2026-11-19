import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Square as ChessSquare, PieceType, Color } from '@chess-arena/chess-core';
import { useGameStore } from '../game/gameStore';
import { BOARD_THEMES } from '../../config/themes';
import { Square } from './Square';
import { PromotionDialog } from './PromotionDialog';
import { PieceRenderer } from './PieceRenderer';

interface DragState {
  piece: { type: PieceType; color: Color };
  from: ChessSquare;
  x: number;
  y: number;
  pointerId: number;
}

interface Arrow {
  from: ChessSquare;
  to: ChessSquare;
}

export const Board: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [arrowDraftStart, setArrowDraftStart] = useState<ChessSquare | null>(null);

  const {
    engine,
    turn,
    inCheck,
    isFlipped,
    selectedSquare,
    legalTargets,
    lastMove,
    pendingPromotion,
    boardTheme,
    pieceTheme,
    selectSquare,
    makeMove,
    confirmPromotion,
    cancelPromotion,
    isAtLive,
    isBotGame,
    botColor,
    isEngineThinking,
    status,
  } = useGameStore();

  const isHumanTurn =
    !isBotGame ||
    (botColor !== null && turn !== botColor && !isEngineThinking && !status.isGameOver);

  const activeTheme = BOARD_THEMES.find((t) => t.id === boardTheme) || BOARD_THEMES[0]!;

  // Coordinates array based on flip orientation
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Clear arrows when new move is made
  useEffect(() => {
    setArrows([]);
  }, [engine.toFen()]);

  // Convert client (x, y) to ChessSquare
  const getSquareFromCoords = useCallback(
    (clientX: number, clientY: number): ChessSquare | null => {
      if (!boardRef.current) return null;
      const rect = boardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;

      const col = Math.floor((x / rect.width) * 8);
      const row = Math.floor((y / rect.height) * 8);

      if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        const file = files[col]!;
        const rank = ranks[row]!;
        return `${file}${rank}` as ChessSquare;
      }
      return null;
    },
    [files, ranks]
  );

  // Pointer Down handler
  const handlePointerDown = (square: ChessSquare, e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle primary left button for moves
    if (e.button === 0) {
      if (!isAtLive || !isHumanTurn) return;

      const piece = engine.getPiece(square);
      if (piece && piece.color === turn) {
        // Start dragging
        setDragState({
          piece,
          from: square,
          x: e.clientX,
          y: e.clientY,
          pointerId: e.pointerId,
        });
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }
      selectSquare(square);
    } else if (e.button === 2) {
      // Right click: start drawing arrow
      e.preventDefault();
      setArrowDraftStart(square);
    }
  };

  // Pointer Move handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState && isHumanTurn && e.pointerId === dragState.pointerId) {
      setDragState((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
    }
  };

  // Pointer Up handler
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState && isHumanTurn && e.pointerId === dragState.pointerId) {
      const targetSquare = getSquareFromCoords(e.clientX, e.clientY);
      if (targetSquare && targetSquare !== dragState.from) {
        makeMove(dragState.from, targetSquare);
      }
      setDragState(null);
    }

    if (e.button === 2 && arrowDraftStart) {
      const targetSquare = getSquareFromCoords(e.clientX, e.clientY);
      if (targetSquare && targetSquare !== arrowDraftStart) {
        setArrows((prev) => [...prev, { from: arrowDraftStart, to: targetSquare }]);
      }
      setArrowDraftStart(null);
    }
  };

  // Cancel Drag on Escape or Right-Click
  const handlePointerCancel = () => {
    setDragState(null);
    setArrowDraftStart(null);
  };

  // Hotkeys: 'F' flips board, Escape cancels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDragState(null);
        cancelPromotion();
        setArrows([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelPromotion]);

  // King square in check
  let checkedKingSquare: ChessSquare | null = null;
  if (inCheck) {
    try {
      checkedKingSquare = engine.kingSquare(turn);
    } catch {}
  }

  return (
    <div className="relative w-full h-full aspect-square select-none rounded-lg overflow-hidden chess-board-container">
      {/* 8x8 Board Grid */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full grid grid-cols-8 grid-rows-8"
      >
        {ranks.map((r, rIdx) =>
          files.map((f, fIdx) => {
            const sq = `${f}${r}` as ChessSquare;
            const piece = engine.getPiece(sq);
            const isLight = (fIdx + rIdx) % 2 === 0;
            const isSelected = selectedSquare === sq;
            const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
            const isCheckSquare = checkedKingSquare === sq;
            const isLegalTarget = legalTargets.includes(sq);
            const isCaptureTarget = isLegalTarget && piece !== null;
            const isGhost = dragState?.from === sq;

            // Show rank labels on file 0, file labels on rank 7
            const showRank = fIdx === 0 ? r : undefined;
            const showFile = rIdx === 7 ? f : undefined;

            return (
              <Square
                key={sq}
                square={sq}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isLastMove={isLastMove}
                isCheck={isCheckSquare}
                isLegalTarget={isLegalTarget}
                isCaptureTarget={isCaptureTarget}
                showCoordRank={showRank}
                showCoordFile={showFile}
                themeLightColor={activeTheme.lightSquare}
                themeDarkColor={activeTheme.darkSquare}
                themeHighlight={activeTheme.highlight}
                pieceTheme={pieceTheme}
                isGhost={isGhost}
                isInteractive={isHumanTurn}
                onPointerDown={(e) => handlePointerDown(sq, e)}
                onPointerUp={handlePointerUp}
              />
            );
          })
        )}
      </div>

      {/* SVG Arrows Overlay */}
      {arrows.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="2"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill="rgba(16, 185, 129, 0.85)" />
            </marker>
          </defs>
          {arrows.map((arr, idx) => {
            const getSquareCenter = (sq: ChessSquare) => {
              const fileIdx = files.indexOf(sq[0]!);
              const rankIdx = ranks.indexOf(sq[1]!);
              return {
                x: `${(fileIdx + 0.5) * 12.5}%`,
                y: `${(rankIdx + 0.5) * 12.5}%`,
              };
            };
            const start = getSquareCenter(arr.from);
            const end = getSquareCenter(arr.to);
            return (
              <line
                key={idx}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="rgba(16, 185, 129, 0.85)"
                strokeWidth="7"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>
      )}

      {/* Floating Drag Layer (Following pointer) */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 drop-shadow-2xl"
          style={{
            left: `${dragState.x}px`,
            top: `${dragState.y}px`,
          }}
        >
          <PieceRenderer
            type={dragState.piece.type}
            color={dragState.piece.color}
            set={pieceTheme}
          />
        </div>
      )}

      {/* Promotion Dialog Anchor */}
      {pendingPromotion && (
        <PromotionDialog
          square={pendingPromotion.to}
          color={turn}
          pieceTheme={pieceTheme}
          onSelect={confirmPromotion}
          onCancel={cancelPromotion}
        />
      )}
    </div>
  );
};

