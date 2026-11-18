import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from './gameStore';
import { toFigurine } from '@chess-arena/chess-core';

export const MoveList: React.FC = () => {
  const { history, currentPly, isAtLive, jumpToPly, first, prev, next, last, engine } =
    useGameStore();
  const [useFigurine, setUseFigurine] = useState(false);
  const [copied, setCopied] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  // Group moves into turns: [turnNumber, whiteMove, blackMove]
  const rows: Array<{
    turnNumber: number;
    white: { san: string; ply: number };
    black?: { san: string; ply: number };
  }> = [];

  for (let i = 0; i < history.length; i += 2) {
    const whiteMove = history[i]!;
    const blackMove = history[i + 1];
    rows.push({
      turnNumber: Math.floor(i / 2) + 1,
      white: { san: whiteMove.san, ply: i + 1 },
      black: blackMove ? { san: blackMove.san, ply: i + 2 } : undefined,
    });
  }

  // Auto-scroll when viewing live
  useEffect(() => {
    if (isAtLive && listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, isAtLive]);

  // Keyboard navigation for history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Home') first();
      else if (e.key === 'End') last();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [first, prev, next, last]);

  const handleCopyPgn = () => {
    const pgn = engine.toPgn();
    navigator.clipboard.writeText(pgn).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPgn = () => {
    const pgn = engine.toPgn();
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chess_arena_game_${Date.now()}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface-card rounded-xl shadow-xl flex flex-col overflow-hidden border border-border-subtle h-full">
      {/* Header & Depth Telemetry */}
      <div className="px-space-md py-2.5 bg-surface-elevated/50 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">
            format_list_numbered
          </span>
          <span className="font-title-md text-sm font-semibold text-on-surface">Move Ledger</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseFigurine(!useFigurine)}
            className="px-1.5 py-0.5 rounded text-[10px] font-label-notation font-semibold bg-surface-card text-on-surface-variant hover:text-primary transition-colors border border-border-subtle"
            title="Toggle figurine notation"
          >
            {useFigurine ? '♘ Figurine' : 'SAN'}
          </button>
          <span className="font-label-notation text-[10px] text-outline bg-surface-card px-2 py-0.5 rounded border border-border-subtle">
            Depth 36/40
          </span>
          <span className="font-label-notation text-[10px] text-mint-bright font-semibold hidden sm:inline">
            3.8 MNPS
          </span>
        </div>
      </div>

      {/* Reviewing history banner */}
      {!isAtLive && (
        <div className="bg-primary-container/20 border-b border-primary-container/40 px-3 py-1.5 flex items-center justify-between text-xs text-gold-light">
          <span>Reviewing history (Board read-only)</span>
          <button
            onClick={last}
            className="font-label-notation text-[11px] font-semibold underline hover:text-white"
          >
            Return to Live
          </button>
        </div>
      )}

      {/* Scrollable Notation Table */}
      <div
        className="flex-1 max-h-[310px] min-h-[220px] overflow-y-auto px-space-md py-space-xs font-label-notation text-[13px] space-y-0.5"
        id="notationList"
      >
        {rows.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-outline italic">
            Moves will be recorded here
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.turnNumber}
              className="grid grid-cols-12 py-1 px-1.5 rounded hover:bg-surface-elevated/50 transition-colors items-center text-on-surface"
            >
              <span className="col-span-2 text-outline font-bold text-xs select-none">
                {row.turnNumber}.
              </span>
              <button
                onClick={() => jumpToPly(row.white.ply)}
                className={`col-span-5 text-left px-1.5 py-0.5 rounded transition-all truncate ${
                  currentPly === row.white.ply
                    ? 'bg-surface-elevated text-gold-light font-extrabold ring-1 ring-gold-light/40'
                    : 'text-on-surface hover:text-gold-light'
                }`}
              >
                {useFigurine ? toFigurine(row.white.san) : row.white.san}
              </button>
              {row.black ? (
                <button
                  onClick={() => jumpToPly(row.black!.ply)}
                  className={`col-span-5 text-left px-1.5 py-0.5 rounded transition-all truncate ${
                    currentPly === row.black.ply
                      ? 'bg-surface-elevated text-gold-light font-extrabold ring-1 ring-gold-light/40'
                      : 'text-on-surface hover:text-gold-light'
                  }`}
                >
                  {useFigurine ? toFigurine(row.black.san) : row.black.san}
                </button>
              ) : (
                <div className="col-span-5 text-secondary animate-pulse font-bold tracking-widest pl-1">
                  ...
                </div>
              )}
            </div>
          ))
        )}
        <div ref={listEndRef} />
      </div>

      {/* Navigation Controls: Move Steppers */}
      <div className="px-space-md py-2 bg-surface-deep/80 flex items-center justify-between border-t border-border-subtle">
        <div className="flex items-center gap-1">
          <button
            onClick={first}
            disabled={currentPly <= 0}
            className="p-1.5 rounded bg-surface-elevated/60 text-outline hover:text-on-surface hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="First Move (Home)"
          >
            <span className="material-symbols-outlined text-[18px]">first_page</span>
          </button>
          <button
            onClick={prev}
            disabled={currentPly <= 0}
            className="p-1.5 rounded bg-surface-elevated/60 text-outline hover:text-on-surface hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Previous Move (Left Arrow)"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            onClick={next}
            disabled={currentPly >= history.length}
            className="p-1.5 rounded bg-surface-elevated/60 text-outline hover:text-on-surface hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Next Move (Right Arrow)"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <button
            onClick={last}
            disabled={isAtLive}
            className="p-1.5 rounded bg-surface-elevated/60 text-primary hover:text-gold-light hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Live Move (End)"
          >
            <span className="material-symbols-outlined text-[18px]">last_page</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPgn}
            className="text-[11px] font-label-notation text-outline hover:text-primary transition-colors flex items-center gap-1"
            title="Copy PGN to clipboard"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadPgn}
            className="text-[11px] font-label-notation text-outline hover:text-primary transition-colors flex items-center gap-1"
            title="Download PGN file"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            PGN
          </button>
        </div>
      </div>
    </div>
  );
};
