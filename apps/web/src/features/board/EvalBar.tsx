import React from 'react';

export interface EvalBarProps {
  score?: number; // In centipawns or pawns (e.g. +1.5 means White +1.5 pawns)
  isFlipped?: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({ score = 0, isFlipped = false }) => {
  // Clamp score between -10 and +10 for visual bar percentage
  const clampedScore = Math.max(-10, Math.min(10, score));
  // Map -10..+10 to 5%..95% (50% is equal 0.0)
  const whitePercent = Math.round(50 + (clampedScore / 10) * 45);
  const displayScore = score > 0 ? `+${score.toFixed(1)}` : score < 0 ? score.toFixed(1) : '0.0';

  const topLabel = isFlipped ? 'W' : 'B';
  const bottomLabel = isFlipped ? 'B' : 'W';
  const fillHeight = isFlipped ? 100 - whitePercent : whitePercent;

  return (
    <div
      className="relative w-8 bg-surface-card rounded-lg flex flex-col justify-between items-center py-2 overflow-hidden shadow-lg border border-border-subtle flex-shrink-0 select-none"
      title={`Live Evaluation: ${displayScore}`}
    >
      <span className="font-label-notation text-[10px] font-bold text-outline-variant z-10 select-none">
        {topLabel}
      </span>

      {/* Eval fill gauge: bottom to top */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-end bg-board-dark">
        <div
          className="w-full bg-board-light transition-all duration-500 ease-out shadow-[0_0_12px_rgba(232,237,249,0.3)] flex items-start justify-center pt-1"
          style={{ height: `${fillHeight}%` }}
        >
          <span className="font-label-notation text-[9px] font-extrabold text-surface-deep tracking-tighter leading-none">
            {displayScore}
          </span>
        </div>
      </div>

      <span className="font-label-notation text-[10px] font-bold text-surface-deep z-10 select-none">
        {bottomLabel}
      </span>
    </div>
  );
};
