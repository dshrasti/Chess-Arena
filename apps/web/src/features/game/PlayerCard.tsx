import React from 'react';
import { Color, PieceType } from '@chess-arena/chess-core';
import { PieceRenderer } from '../board/PieceRenderer';
import { PieceThemeId } from '../../config/themes';

export interface PlayerCardProps {
  color: Color;
  name: string;
  title?: string;
  rating?: number;
  isTurn: boolean;
  capturedPieces: PieceType[];
  materialDiff: number; // Positive if this player has material advantage
  pieceTheme: PieceThemeId;
  timeRemaining?: string; // e.g. "03:14" or "00:45.2"
  latencyMs?: number;
  avatarUrl?: string;
  isThinking?: boolean;
  isBot?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  color,
  name,
  title = 'GM',
  rating = 2500,
  isTurn,
  capturedPieces,
  materialDiff,
  pieceTheme,
  timeRemaining = '05:00',
  latencyMs = 24,
  avatarUrl,
  isThinking = false,
  isBot = false,
}) => {
  const isWhite = color === 'w';

  // Sort captured pieces: q, r, b, n, p
  const sortOrder: Record<PieceType, number> = { q: 5, r: 4, b: 3, n: 2, p: 1, k: 0 };
  const sortedPieces = [...capturedPieces].sort(
    (a, b) => (sortOrder[b] || 0) - (sortOrder[a] || 0)
  );

  return (
    <div className="w-full flex items-center justify-between bg-surface-card px-space-md py-space-sm rounded-xl shadow-xl border border-border-subtle transition-all duration-200">
      <div className="flex items-center gap-space-sm min-w-0">
        {/* Avatar with Status Ring */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className={`w-11 h-11 rounded-lg object-cover ring-1 ${
                isTurn ? 'ring-secondary' : 'ring-border-subtle'
              }`}
            />
          ) : (
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center font-display font-bold text-sm ring-1 ${
                isWhite
                  ? 'bg-zinc-200 text-zinc-900 ring-zinc-300'
                  : 'bg-zinc-800 text-zinc-100 ring-zinc-700'
              } ${isTurn ? 'ring-secondary' : ''}`}
            >
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-surface-card rounded-full flex items-center justify-center">
            <span
              className={`w-2 h-2 rounded-full ${
                isTurn ? 'bg-secondary animate-pulse' : 'bg-secondary/60'
              }`}
            />
          </span>
        </div>

        {/* Player Info & Captured Tray */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-label-notation font-bold uppercase bg-primary/15 text-primary tracking-wider">
              {title}
            </span>
            {isBot && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-label-notation font-extrabold uppercase bg-gold-light/15 text-gold-light border border-gold-light/30">
                AI BOT
              </span>
            )}
            <span
              className={`font-body-md text-sm font-semibold truncate ${
                isTurn ? 'text-primary' : 'text-on-surface'
              }`}
            >
              {name}
            </span>
            <span className="text-[11px] text-outline font-label-notation hidden sm:inline">
              {isBot ? 'STOCKFISH' : 'FIDE'}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-secondary font-label-notation pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {isBot ? 'Local WASM' : `${latencyMs}ms`}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-label-notation text-xs text-outline font-medium">
              {rating} Blitz
            </span>
            <span className="text-outline/40 text-[10px]">•</span>

            {/* Captured Pieces Tray */}
            <div className="flex items-center min-h-[16px]">
              {sortedPieces.map((p, idx) => (
                <div key={idx} className="w-3.5 h-3.5 -ml-1 first:ml-0" title={`Captured ${p}`}>
                  <PieceRenderer
                    type={p}
                    color={isWhite ? 'b' : 'w'} // White displays black pieces they captured
                    set={pieceTheme}
                  />
                </div>
              ))}
              {materialDiff > 0 && (
                <span className="ml-1 px-1 py-0.2 rounded bg-surface-elevated text-secondary text-[10px] font-bold font-label-notation">
                  +{materialDiff}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clock Box */}
      <div className="flex items-center gap-space-sm pl-space-md flex-shrink-0">
        <div
          className={`relative px-space-md py-1.5 rounded-lg flex flex-col items-end transition-all ${
            isTurn
              ? 'bg-surface-elevated ring-1 ring-secondary/50 shadow-2xl overflow-hidden'
              : 'bg-surface-elevated/80 shadow-inner'
          }`}
        >
          {isTurn && (
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 ${
                isThinking ? 'bg-primary animate-ping' : 'bg-secondary animate-pulse'
              }`}
            />
          )}
          <span
            className={`text-[9px] uppercase font-label-notation tracking-widest flex items-center gap-1 ${
              isThinking
                ? 'text-primary font-bold animate-pulse'
                : isTurn
                ? 'text-secondary font-semibold'
                : 'text-outline'
            }`}
          >
            {isThinking ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                Thinking...
              </>
            ) : isTurn ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                Turn Active
              </>
            ) : (
              `${isWhite ? 'White' : 'Black'} • Inactive`
            )}
          </span>
          <div className="flex items-baseline">
            <span
              className={`font-clock-display text-xl sm:text-2xl font-bold tracking-wider ${
                isTurn ? 'text-secondary' : 'text-on-surface/90'
              }`}
            >
              {timeRemaining}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
