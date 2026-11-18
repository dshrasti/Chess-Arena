import React from 'react';
import { identifyOpening } from '@chess-arena/chess-core';
import { useGameStore } from './gameStore';

export const OpeningCard: React.FC = () => {
  const { history } = useGameStore();

  const sanMoves = history.map((m) => m.san);
  const opening = identifyOpening(sanMoves);

  const eco = opening?.eco || 'A00';
  const name = opening?.name || (history.length === 0 ? 'Starting Position' : 'Standard Game');
  const isBook = !!opening;

  return (
    <div className="bg-surface-card p-space-md rounded-xl shadow-xl flex flex-col gap-2 border border-border-subtle">
      {/* Top Cadence & Match ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-label-notation font-bold uppercase bg-surface-elevated text-secondary tracking-wider">
            Rated Blitz
          </span>
          <span className="font-label-notation text-xs text-outline">5+3 Inc</span>
        </div>
        <span className="font-label-notation text-[11px] text-outline hover:text-on-surface transition-colors cursor-pointer">
          #CHA-8924
        </span>
      </div>

      {/* Opening Classification Card */}
      <div className="bg-surface-elevated/70 p-2.5 rounded-lg flex flex-col gap-1 border border-border-subtle/50">
        <div className="flex items-center justify-between">
          <span className="font-label-notation text-[11px] font-bold text-primary uppercase tracking-wider">
            ECO {eco}
          </span>
          {isBook ? (
            <span className="font-label-notation text-[10px] text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              Book Move
            </span>
          ) : (
            <span className="font-label-notation text-[10px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Live Game
            </span>
          )}
        </div>
        <p className="font-body-md text-sm font-semibold text-on-surface leading-tight truncate">
          {name}
        </p>
        <span className="font-body-sm text-xs text-outline">
          {history.length > 0 ? `Move ${Math.ceil(history.length / 2)} in progress` : 'White to open'}
        </span>
      </div>

      {/* Spectators & Live Pulse */}
      <div className="flex items-center justify-between pt-1 text-outline font-label-notation text-[11px]">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[15px] text-gold-light">visibility</span>
          <span>
            <strong className="text-on-surface font-semibold">1,420</strong> Grandmasters & Fans
          </span>
        </div>
        <span className="text-secondary flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          Live Telemetry
        </span>
      </div>
    </div>
  );
};
