import React from 'react';
import { useGameStore } from '../game/gameStore';

export type NavTab =
  | 'dashboard'
  | 'play'
  | 'puzzles'
  | 'analyze'
  | 'bots'
  | 'tournaments'
  | 'leaderboards'
  | 'profile';

export interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { isMuted, toggleSound, boardTheme, setBoardTheme } = useGameStore();

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-surface-card z-50 flex flex-col justify-between overflow-y-auto border-r border-border-subtle transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Top Brand & Version Header */}
          <div className="h-16 px-space-md flex items-center justify-between bg-surface-deep/40 border-b border-border-subtle/50">
            <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => handleTabClick('dashboard')}>
              <img
                src="/emblem.png"
                alt="Chess Arena Emblem"
                className="h-8 w-auto object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-headline-lg text-base font-bold tracking-tight text-primary leading-none">
                  CHESS ARENA
                </span>
                <span className="font-label-notation text-[10px] text-outline tracking-widest uppercase mt-0.5">
                  Grandmaster Club
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-label-notation font-semibold bg-surface-container-high text-secondary border border-border-subtle">
              v4.2
            </span>
          </div>

          {/* User Mini Profile Card */}
          <div className="p-space-md bg-surface-dim/70 m-space-sm rounded-xl border border-border-subtle/60">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-surface-elevated ring-2 ring-primary/40 flex items-center justify-center font-display font-bold text-sm text-primary">
                  AK
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-label-notation font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    GM
                  </span>
                  <span className="font-body-md text-sm font-semibold text-on-surface truncate">
                    A. Kasparov
                  </span>
                </div>
                <span className="font-label-notation text-[11px] text-secondary flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  Online
                </span>
              </div>
            </div>

            {/* Rating Badges */}
            <div className="grid grid-cols-2 gap-space-xs pt-space-xs border-t border-border-subtle/40">
              <div className="bg-surface-elevated/80 px-2 py-1.5 rounded flex flex-col">
                <span className="font-label-notation text-[9px] uppercase text-outline tracking-wider">
                  Blitz
                </span>
                <span className="font-clock-display text-sm font-bold text-primary">2482</span>
              </div>
              <div className="bg-surface-elevated/80 px-2 py-1.5 rounded flex flex-col">
                <span className="font-label-notation text-[9px] uppercase text-outline tracking-wider">
                  Rapid
                </span>
                <span className="font-clock-display text-sm font-bold text-on-surface">2540</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-space-sm space-y-1 mt-space-xs">
            {/* Arena Dashboard / Matchmaking */}
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">sports_esports</span>
                <span className="font-body-md text-sm">Play / Seek</span>
              </div>
              <span className="font-label-notation text-[10px] uppercase px-1.5 py-0.5 rounded bg-primary-container/20 text-gold-light font-bold tracking-wider">
                Arena
              </span>
            </button>

            {/* Live Matchroom */}
            <button
              onClick={() => handleTabClick('play')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'play'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">swords</span>
                <span className="font-body-md text-sm">Live Matchroom</span>
              </div>
              <span className="font-label-notation text-[10px] uppercase px-1.5 py-0.5 rounded bg-secondary-container/20 text-secondary font-bold tracking-wider">
                Active
              </span>
            </button>

            {/* Puzzles Tab */}
            <button
              onClick={() => handleTabClick('puzzles')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'puzzles'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">extension</span>
                <span className="font-body-md text-sm">Puzzles</span>
              </div>
              <span className="font-label-notation text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-secondary flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                18
              </span>
            </button>

            {/* Learn & Analyze */}
            <button
              onClick={() => handleTabClick('analyze')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'analyze'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                <span className="font-body-md text-sm">Learn & Analyze</span>
              </div>
            </button>

            {/* Computer Bots */}
            <button
              onClick={() => handleTabClick('bots')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'bots'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                <span className="font-body-md text-sm">Computer Bots</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-label-notation bg-secondary-container/20 text-secondary font-bold">
                WASM
              </span>
            </button>

            {/* Tournaments */}
            <button
              onClick={() => handleTabClick('tournaments')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'tournaments'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                <span className="font-body-md text-sm">Tournaments</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            </button>

            {/* Leaderboards */}
            <button
              onClick={() => handleTabClick('leaderboards')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'leaderboards'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                <span className="font-body-md text-sm">Leaderboards</span>
              </div>
            </button>

            {/* Profile */}
            <button
              onClick={() => handleTabClick('profile')}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors ${
                currentTab === 'profile'
                  ? 'bg-surface-elevated text-primary font-semibold border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">person</span>
                <span className="font-body-md text-sm">Profile</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Footer Quick Controls */}
        <div className="p-space-sm bg-surface-deep/60 space-y-1 border-t border-border-subtle/50">
          <div className="grid grid-cols-2 gap-1 mb-1">
            <button
              onClick={toggleSound}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-colors text-[11px] font-label-notation ${
                isMuted
                  ? 'bg-surface-container-low text-outline'
                  : 'bg-surface-container-low text-secondary'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
              {isMuted ? 'Muted' : 'Sound'}
            </button>

            <button
              onClick={() =>
                setBoardTheme(boardTheme === 'grandmaster' ? 'emerald' : 'grandmaster')
              }
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-[11px] font-label-notation"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">palette</span>
              Theme
            </button>
          </div>

          <div className="flex items-center justify-between px-space-xs pt-1 text-[11px] text-outline font-body-sm">
            <span className="hover:text-on-surface transition-colors cursor-pointer">
              Shortcuts [?]
            </span>
            <span className="hover:text-on-surface transition-colors cursor-pointer">Settings</span>
          </div>
        </div>
      </aside>
    </>
  );
};
