import React, { useState } from 'react';
import { useGameStore } from './gameStore';
import { BOARD_THEMES, PIECE_THEMES } from '../../config/themes';

export const GameControls: React.FC = () => {
  const {
    turn,
    status,
    isAtLive,
    boardTheme,
    pieceTheme,
    isMuted,
    flipBoard,
    undo,
    redo,
    resign,
    agreeDraw,
    claimDraw,
    restartGame,
    setBoardTheme,
    setPieceTheme,
    toggleSound,
    history,
    currentPly,
  } = useGameStore();

  const [confirmResign, setConfirmResign] = useState(false);
  const [drawOffered, setDrawOffered] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const isGameOver = status.isGameOver;
  const canUndo = currentPly > 0 && !isGameOver;
  const canRedo = !isAtLive;

  const handleResignClick = () => {
    if (!confirmResign) {
      setConfirmResign(true);
      setTimeout(() => setConfirmResign(false), 3500);
    } else {
      setConfirmResign(false);
      resign(turn);
    }
  };

  const handleDrawClick = () => {
    if (claimDraw()) return;
    agreeDraw();
    setDrawOffered(true);
    setTimeout(() => setDrawOffered(false), 3000);
  };

  return (
    <div className="bg-surface-card p-space-md rounded-xl shadow-xl flex flex-col gap-space-sm border border-border-subtle">
      {/* Primary Match Action Buttons */}
      {!isGameOver ? (
        <div className="grid grid-cols-2 gap-space-xs">
          {/* Offer Draw */}
          <button
            onClick={handleDrawClick}
            disabled={history.length < 2}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-colors font-title-md text-sm font-medium ${
              drawOffered
                ? 'bg-secondary-container text-on-secondary-container font-bold'
                : 'bg-surface-elevated text-on-surface hover:bg-surface-bright disabled:opacity-40 disabled:pointer-events-none'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              {drawOffered ? 'check' : 'handshake'}
            </span>
            {drawOffered ? 'Draw Sent' : 'Offer Draw'}
          </button>

          {/* Resign with Safety Trigger */}
          <button
            onClick={handleResignClick}
            disabled={history.length < 2}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-colors font-title-md text-sm font-medium ${
              confirmResign
                ? 'bg-error-container text-on-error-container animate-pulse font-bold'
                : 'bg-surface-elevated text-error hover:bg-error-container hover:text-on-error-container disabled:opacity-40 disabled:pointer-events-none'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span>{confirmResign ? 'Confirm?' : 'Resign'}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated border border-border-subtle">
          <span className="font-label-notation text-xs text-primary font-bold">
            Game Over • {status.result}
          </span>
          <button
            onClick={restartGame}
            className="px-3 py-1.5 rounded bg-secondary-container hover:bg-secondary text-surface-deep text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            New Match
          </button>
        </div>
      )}

      {/* Secondary Match Utility Buttons: Flip, Takeback, Redo, Sound, Theme */}
      <div className="grid grid-cols-5 gap-space-xs pt-1">
        <button
          onClick={flipBoard}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-elevated/70 text-outline hover:text-primary hover:bg-surface-elevated transition-colors"
          title="Flip Chessboard (F)"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">cached</span>
          <span className="font-label-notation text-[10px] mt-0.5">Flip</span>
        </button>

        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-elevated/70 text-outline hover:text-on-surface hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Request Takeback / Undo"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">undo</span>
          <span className="font-label-notation text-[10px] mt-0.5">Undo</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-elevated/70 text-outline hover:text-on-surface hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Redo move"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">redo</span>
          <span className="font-label-notation text-[10px] mt-0.5">Redo</span>
        </button>

        <button
          onClick={toggleSound}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
            isMuted
              ? 'bg-surface-elevated/70 text-outline hover:text-on-surface hover:bg-surface-elevated'
              : 'bg-surface-elevated/70 text-secondary hover:bg-surface-elevated'
          }`}
          title="Toggle Board Audio"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
          <span className="font-label-notation text-[10px] mt-0.5">
            {isMuted ? 'Muted' : 'Sound'}
          </span>
        </button>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
            showConfig
              ? 'bg-surface-elevated text-primary ring-1 ring-primary/40'
              : 'bg-surface-elevated/70 text-outline hover:text-on-surface hover:bg-surface-elevated'
          }`}
          title="Match Settings & Board Theme"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">palette</span>
          <span className="font-label-notation text-[10px] mt-0.5">Theme</span>
        </button>
      </div>

      {/* Collapsible Theme & Settings Configuration */}
      {showConfig && (
        <div className="border-t border-border-subtle pt-3 space-y-3">
          {/* Board Themes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-label-notation uppercase tracking-wider text-outline">
                Board Theme
              </span>
              <span className="text-[10px] font-label-notation text-primary">
                {BOARD_THEMES.find((t) => t.id === boardTheme)?.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {BOARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setBoardTheme(theme.id)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                    boardTheme === theme.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border-subtle bg-surface-elevated/50 text-on-surface hover:border-outline'
                  }`}
                >
                  <div className="w-5 h-5 rounded grid grid-cols-2 grid-rows-2 overflow-hidden flex-shrink-0">
                    <div style={{ backgroundColor: theme.preview[0] }} />
                    <div style={{ backgroundColor: theme.preview[1] }} />
                    <div style={{ backgroundColor: theme.preview[1] }} />
                    <div style={{ backgroundColor: theme.preview[0] }} />
                  </div>
                  <span className="text-[10px] font-label-notation truncate">
                    {theme.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Themes */}
          <div>
            <span className="text-[10px] font-label-notation uppercase tracking-wider text-outline block mb-1.5">
              Piece Theme
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PIECE_THEMES.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setPieceTheme(pt.id)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-label-notation transition-all text-center ${
                    pieceTheme === pt.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border-subtle bg-surface-elevated/50 text-outline hover:text-on-surface'
                  }`}
                >
                  {pt.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Engine Depth & Live Performance Ticker */}
      <div className="bg-surface-deep/60 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-label-notation text-outline">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>Stockfish 16.1 WASM</span>
        </div>
        <span className="text-secondary font-medium">6-man Tablebase</span>
      </div>
    </div>
  );
};
