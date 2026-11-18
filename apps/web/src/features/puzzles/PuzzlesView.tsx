import React, { useState } from 'react';
import { Board } from '../board/Board';
import { useGameStore } from '../game/gameStore';

export interface PuzzleItem {
  id: string;
  fen: string;
  title: string;
  theme: string;
  rating: number;
  toMove: 'w' | 'b';
  solutionSan: string[];
}

export const SAMPLE_PUZZLES: PuzzleItem[] = [
  {
    id: 'pz-01',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    title: 'Tactical Trapping in Giuoco Piano',
    theme: 'Fork / Discovery',
    rating: 1850,
    toMove: 'w',
    solutionSan: ['Qe2', 'd5', 'Nxe5'],
  },
  {
    id: 'pz-02',
    fen: 'r1b2rk1/pp1p1ppp/2n1p3/q7/2B1n3/2P2N2/PB2QPPP/R4RK1 w - - 0 12',
    title: 'Smothered Mate Threat in Open File',
    theme: 'Mating Net',
    rating: 2150,
    toMove: 'w',
    solutionSan: ['Qxe4', 'd5', 'Bxd5'],
  },
  {
    id: 'pz-03',
    fen: '6k1/5ppp/8/8/8/8/4Q3/4K3 w - - 0 1',
    title: 'Back Rank Precision',
    theme: 'Back Rank Mate',
    rating: 1200,
    toMove: 'w',
    solutionSan: ['Qe8#'],
  },
];

export const PuzzlesView: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(18);
  const { loadFen } = useGameStore();

  const puzzle = SAMPLE_PUZZLES[currentIdx]!;

  const handleLoadPuzzle = (idx: number) => {
    setCurrentIdx(idx);
    setSolved(false);
    loadFen(SAMPLE_PUZZLES[idx]!.fen);
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentIdx + 1) % SAMPLE_PUZZLES.length;
    handleLoadPuzzle(nextIdx);
  };

  const handleRevealSolution = () => {
    setSolved(true);
    setStreak((s) => s + 1);
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-space-xl">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="px-2 py-0.5 rounded text-gold-light bg-surface-card font-label-notation text-[11px] tracking-widest uppercase font-semibold border border-border-subtle">
              Grandmaster Tactics Trainer
            </span>
            <span className="text-outline font-label-notation text-body-sm">•</span>
            <span className="font-label-notation text-[11px] text-mint-bright flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              Streak {streak}
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Tactical Puzzles & Mating Nets
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadPuzzle(currentIdx)}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated text-outline hover:text-on-surface text-xs font-label-notation flex items-center gap-1.5 border border-border-subtle"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Puzzle
          </button>
          <button
            onClick={handleNextPuzzle}
            className="px-4 py-1.5 rounded-lg bg-secondary-container hover:bg-secondary text-surface-deep text-xs font-title-md font-bold flex items-center gap-1.5 transition-all shadow"
          >
            Next Puzzle
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Board on Left + Tactics Panel on Right */}
      <div className="flex flex-col lg:flex-row gap-space-lg items-start">
        {/* Board Stage */}
        <div className="flex-1 w-full max-w-[700px] mx-auto">
          <div className="relative aspect-square bg-surface-deep p-1.5 rounded-xl shadow-2xl overflow-hidden border border-border-subtle">
            <Board />
          </div>
        </div>

        {/* Puzzle Card & Instructions */}
        <div className="w-full lg:w-[420px] flex flex-col gap-space-md">
          <div className="bg-surface-card p-space-md rounded-xl shadow-xl border border-border-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-label-notation font-bold uppercase bg-surface-elevated text-primary">
                {puzzle.theme}
              </span>
              <span className="font-label-notation text-xs font-bold text-secondary">
                Rating: {puzzle.rating}
              </span>
            </div>

            <h3 className="font-title-md text-base font-bold text-on-surface">
              {puzzle.title}
            </h3>

            <div className="p-3 rounded-lg bg-surface-elevated flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border border-border-subtle flex-shrink-0 ${
                  puzzle.toMove === 'w' ? 'bg-white' : 'bg-black'
                }`}
              />
              <span className="font-body-md text-xs font-semibold text-on-surface">
                {puzzle.toMove === 'w' ? 'White to move and win material' : 'Black to move and deliver mate'}
              </span>
            </div>

            <div className="text-xs font-body-sm text-on-surface-variant leading-relaxed">
              Find the most forceful sequence. Punish your opponent's tactical overextension with
              grandmaster precision.
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-border-subtle">
              <button
                onClick={handleRevealSolution}
                className="flex-1 py-2 rounded-lg bg-surface-elevated text-outline hover:text-primary text-xs font-label-notation border border-border-subtle flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                Reveal Solution
              </button>
            </div>

            {solved && (
              <div className="p-3 rounded-lg bg-secondary-container/20 border border-secondary text-secondary font-label-notation text-xs">
                <strong>Solution:</strong> {puzzle.solutionSan.join(' ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
