import React, { useState } from 'react';
import { useGameStore } from '../game/gameStore';

export interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onNewGame }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { restartGame } = useGameStore();

  const handleCreateGame = () => {
    restartGame();
    onNewGame();
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-deep/90 backdrop-blur-xl z-40 px-space-md lg:px-space-lg flex items-center justify-between border-b border-border-subtle">
      {/* Left: Mobile hamburger + Playing now + Search */}
      <div className="flex items-center gap-space-sm lg:gap-space-lg flex-1 max-w-xl">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg bg-surface-card text-on-surface-variant hover:text-on-surface lg:hidden border border-border-subtle"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Live Active Player Counter */}
        <div className="hidden sm:flex items-center gap-2 px-space-sm py-1 rounded bg-surface-card border border-border-subtle flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="font-label-notation text-xs text-on-surface-variant">
            <strong className="text-on-surface font-semibold">14,290</strong> Playing Now
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players, openings (e.g. Sicilian Defense)..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-surface-card text-on-surface placeholder:text-outline font-body-sm text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 border border-border-subtle"
          />
        </div>
      </div>

      {/* Right: Quick actions & profile */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <button
          onClick={handleCreateGame}
          className="px-3 sm:px-space-md py-1.5 rounded bg-secondary-container hover:bg-secondary text-surface-deep font-title-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">Create Game</span>
          <span className="sm:hidden">New</span>
        </button>

        <div className="h-5 w-px bg-surface-container-high hidden sm:block" />

        <button
          className="relative p-2 rounded-lg bg-surface-card text-on-surface-variant hover:text-on-surface transition-colors border border-border-subtle"
          type="button"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* Profile Avatar Badge */}
        <div className="flex items-center gap-2 pl-space-xs">
          <div className="w-8 h-8 rounded-full bg-surface-elevated ring-1 ring-primary/40 flex items-center justify-center font-display font-bold text-xs text-primary">
            AK
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-body-md text-xs font-semibold text-on-surface leading-tight">
              Kasparov
            </span>
            <span className="font-label-notation text-[10px] text-gold-light uppercase">
              GM • 2540
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
