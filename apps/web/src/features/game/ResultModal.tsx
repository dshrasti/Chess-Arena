import React, { useState } from 'react';
import { useGameStore } from './gameStore';
import { Trophy, RotateCcw, Copy, Check, Eye } from 'lucide-react';

export const ResultModal: React.FC = () => {
  const { status, restartGame, engine } = useGameStore();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!status.isGameOver || dismissed) return null;

  let title = 'Game Drawn';
  let subtitle = 'Peaceful agreement';

  if (status.status === 'checkmate') {
    title = status.winner === 'w' ? 'White Won by Checkmate!' : 'Black Won by Checkmate!';
    subtitle = 'Decisive victory on the board';
  } else if (status.termination === 'resignation') {
    title = status.winner === 'w' ? 'White Won by Resignation' : 'Black Won by Resignation';
    subtitle = 'Opponent conceded the game';
  } else if (status.termination === 'timeout') {
    title = status.winner === 'w' ? 'White Won on Time' : 'Black Won on Time';
    subtitle = 'Clock expired';
  } else if (status.drawReason === 'stalemate') {
    title = 'Draw by Stalemate';
    subtitle = 'No legal moves remaining and not in check';
  } else if (status.drawReason === 'threefold_repetition') {
    title = 'Draw by Threefold Repetition';
    subtitle = 'Same position repeated 3 times';
  } else if (status.drawReason === 'fifty_move') {
    title = 'Draw by 50-Move Rule';
    subtitle = '50 moves played without pawn move or capture';
  } else if (status.drawReason === 'insufficient_material') {
    title = 'Draw by Insufficient Material';
    subtitle = 'Neither player has mating material';
  }

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(engine.toPgn()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-arena-card border border-arena-border rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-arena-accent-subtle text-arena-accent mx-auto flex items-center justify-center">
          <Trophy className="w-7 h-7" />
        </div>

        <div>
          <span className="text-3xl font-display font-black text-arena-text tracking-tight">
            {status.result}
          </span>
          <h3 className="text-lg font-bold font-display text-arena-text mt-1">{title}</h3>
          <p className="text-xs text-arena-muted mt-0.5">{subtitle}</p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              setDismissed(false);
              restartGame();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-display font-semibold text-sm bg-arena-accent text-white hover:bg-arena-accent-hover active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Rematch / New Game
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyPgn}
              className="py-2 px-3 rounded-lg border border-arena-border text-arena-text bg-arena-bg hover:bg-arena-card text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied PGN' : 'Copy PGN'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="py-2 px-3 rounded-lg border border-arena-border text-arena-muted hover:text-arena-text bg-arena-bg hover:bg-arena-card text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

