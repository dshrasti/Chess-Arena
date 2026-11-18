import React, { useState } from 'react';
import { Board } from '../board/Board';
import { EvalBar } from '../board/EvalBar';
import { MoveList } from '../game/MoveList';
import { OpeningCard } from '../game/OpeningCard';
import { useGameStore } from '../game/gameStore';

export const AnalysisView: React.FC = () => {
  const { fen, loadFen, materialBalance, isFlipped } = useGameStore();
  const [inputFen, setInputFen] = useState(fen);
  const [loadError, setLoadError] = useState(false);

  const handleApplyFen = () => {
    if (!loadFen(inputFen.trim())) {
      setLoadError(true);
      setTimeout(() => setLoadError(false), 3000);
    } else {
      setLoadError(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1720px] mx-auto pb-space-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="px-2 py-0.5 rounded text-gold-light bg-surface-card font-label-notation text-[11px] tracking-widest uppercase font-semibold border border-border-subtle">
              Deep Neural Exploration
            </span>
            <span className="text-outline font-label-notation text-body-sm">•</span>
            <span className="font-label-notation text-[11px] text-mint-bright">
              Infinite Depth Mode
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Learn & Deep Analysis Board
          </h1>
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="flex flex-col lg:flex-row gap-space-lg items-start w-full">
        {/* Board & Eval Bar Area */}
        <div className="flex-1 w-full max-w-[760px] mx-auto flex flex-col gap-2">
          <div className="w-full flex gap-2 items-stretch select-none">
            <EvalBar score={materialBalance.diff} isFlipped={isFlipped} />
            <div className="relative flex-1 aspect-square bg-surface-deep p-1.5 rounded-xl shadow-2xl overflow-hidden border border-border-subtle">
              <Board />
            </div>
          </div>

          {/* FEN Loader Bar */}
          <div className="p-3 bg-surface-card rounded-xl border border-border-subtle flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              value={inputFen}
              onChange={(e) => setInputFen(e.target.value)}
              placeholder="Paste FEN string here..."
              className="flex-1 w-full px-3 py-1.5 rounded-lg bg-surface-deep text-on-surface font-label-notation text-xs border border-border-subtle focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleApplyFen}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-secondary-container hover:bg-secondary text-surface-deep text-xs font-title-md font-bold transition-all shadow"
            >
              Load FEN
            </button>
          </div>
          {loadError && (
            <span className="text-xs text-error font-label-notation">
              Invalid FEN string. Please verify standard 6-field notation.
            </span>
          )}
        </div>

        {/* Right Analysis Panel */}
        <div className="w-full lg:w-[410px] flex flex-col gap-space-sm flex-shrink-0">
          <OpeningCard />
          <div className="h-[360px]">
            <MoveList />
          </div>
        </div>
      </div>
    </div>
  );
};
