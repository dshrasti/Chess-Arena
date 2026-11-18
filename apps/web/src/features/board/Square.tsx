import React from 'react';
import { Square as ChessSquare, PieceType, Color } from '@chess-arena/chess-core';
import { PieceRenderer } from './PieceRenderer';
import { PieceThemeId } from '../../config/themes';

export interface SquareProps {
  square: ChessSquare;
  piece: { type: PieceType; color: Color } | null;
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  isLegalTarget: boolean;
  isCaptureTarget: boolean;
  showCoordRank?: string;
  showCoordFile?: string;
  themeLightColor: string;
  themeDarkColor: string;
  themeHighlight: string;
  pieceTheme: PieceThemeId;
  isGhost: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Square: React.FC<SquareProps> = React.memo(
  ({
    square,
    piece,
    isLight,
    isSelected,
    isLastMove,
    isCheck,
    isLegalTarget,
    isCaptureTarget,
    showCoordRank,
    showCoordFile,
    themeLightColor,
    themeDarkColor,
    themeHighlight,
    pieceTheme,
    isGhost,
    onPointerDown,
    onPointerUp,
    onContextMenu,
  }) => {
    const bgColor = isLight ? themeLightColor : themeDarkColor;

    return (
      <div
        data-square={square}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onContextMenu={onContextMenu}
        style={{ backgroundColor: bgColor }}
        className="relative w-full h-full flex items-center justify-center select-none cursor-pointer overflow-hidden transition-colors duration-100"
        aria-label={`${square} ${piece ? `${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : 'empty'}`}
      >
        {/* Last Move Overlay */}
        {isLastMove && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: themeHighlight }}
          />
        )}

        {/* Selected Square Highlight */}
        {isSelected && (
          <div className="absolute inset-0 bg-emerald-500/40 pointer-events-none ring-2 ring-emerald-400 inset-ring" />
        )}

        {/* King Check Red Glow */}
        {isCheck && (
          <div className="absolute inset-0 bg-red-600/50 animate-check-pulse rounded-full pointer-events-none filter blur-sm" />
        )}

        {/* Legal Move Target: Empty Square Dot */}
        {isLegalTarget && !isCaptureTarget && (
          <div className="absolute z-10 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-black/25 dark:bg-white/35 pointer-events-none transform transition-transform hover:scale-125" />
        )}

        {/* Legal Move Target: Capture Ring */}
        {isCaptureTarget && (
          <div className="absolute z-10 inset-1 rounded-full border-4 border-black/25 dark:border-white/35 pointer-events-none" />
        )}

        {/* Coordinate Labels */}
        {showCoordRank && (
          <span
            className={`absolute top-0.5 left-1 text-[10px] md:text-xs font-mono font-bold select-none pointer-events-none ${
              isLight ? 'text-black/50' : 'text-white/60'
            }`}
          >
            {showCoordRank}
          </span>
        )}
        {showCoordFile && (
          <span
            className={`absolute bottom-0.5 right-1 text-[10px] md:text-xs font-mono font-bold select-none pointer-events-none ${
              isLight ? 'text-black/50' : 'text-white/60'
            }`}
          >
            {showCoordFile}
          </span>
        )}

        {/* The Piece Component */}
        {piece && (
          <div
            className={`w-[85%] h-[85%] flex items-center justify-center transition-opacity duration-100 ${
              isGhost ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <PieceRenderer type={piece.type} color={piece.color} set={pieceTheme} />
          </div>
        )}
      </div>
    );
  }
);

