import React, { useState } from 'react';

export interface CadencePreset {
  id: string;
  name: string;
  sub: string;
  timeStr: string;
  icon: string;
  baseMinutes: number;
  incrementSeconds: number;
  popular?: boolean;
}

export const CADENCE_PRESETS: CadencePreset[] = [
  { id: '1-0', name: 'Bullet', sub: 'Sub-minute', timeStr: '1 min', icon: 'electric_bolt', baseMinutes: 1, incrementSeconds: 0 },
  { id: '3-0', name: 'Blitz', sub: 'Pure Instinct', timeStr: '3 min', icon: 'bolt', baseMinutes: 3, incrementSeconds: 0 },
  { id: '5-3', name: 'Popular', sub: 'Championship', timeStr: '5 + 3', icon: 'timer', baseMinutes: 5, incrementSeconds: 3, popular: true },
  { id: '10-0', name: 'Rapid', sub: 'Tournament', timeStr: '10 min', icon: 'schedule', baseMinutes: 10, incrementSeconds: 0 },
  { id: '15-10', name: 'Classical', sub: 'Deep Tactics', timeStr: '15 + 10', icon: 'hourglass_empty', baseMinutes: 15, incrementSeconds: 10 },
  { id: 'daily', name: 'Daily', sub: 'Correspondence', timeStr: '24 hrs', icon: 'calendar_today', baseMinutes: 1440, incrementSeconds: 0 },
];

export interface DashboardViewProps {
  onStartMatch: (preset: CadencePreset) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartMatch, onNavigateTab }) => {
  const [selectedCadence, setSelectedCadence] = useState<CadencePreset>(CADENCE_PRESETS[2]!);
  const [ratedFilter, setRatedFilter] = useState<'rated' | 'casual' | 'titled'>('rated');

  return (
    <div className="flex flex-col w-full max-w-[1720px] mx-auto pb-space-xl space-y-space-lg">
      {/* Dynamic Top Ambient Aura & Lead */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-surface-card border border-border-subtle p-space-lg shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-stretch justify-between gap-space-lg">
          {/* Quick Play Launchpad Lead */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-space-sm mb-space-xs">
                <span className="px-2 py-0.5 rounded bg-primary-container/20 text-gold-light font-label-notation text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-ping" />
                  Live Matchmaking Arena
                </span>
                <span className="text-outline font-label-notation text-body-sm">•</span>
                <span className="text-outline font-label-notation text-body-sm">
                  Global FIDE Regulations
                </span>
              </div>
              <h1 className="font-headline-lg text-3xl sm:text-4xl font-bold text-on-surface tracking-tight leading-tight">
                Command the 64 Squares.
              </h1>
              <p className="font-body-md text-sm text-on-surface-variant max-w-xl mt-1">
                Engineered for grandmaster precision. Select your cadence and deploy into real-time
                pairings with zero latency.
              </p>
            </div>

            {/* Cadence selector & primary action */}
            <div className="mt-space-md pt-space-sm">
              <div className="text-[11px] font-label-notation uppercase tracking-wider text-outline mb-2 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-outline">Select Cadence Preset</span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRatedFilter('rated')}
                      className={`px-2 py-0.5 rounded text-[10px] font-label-notation font-semibold flex items-center gap-1 transition-colors ${
                        ratedFilter === 'rated'
                          ? 'bg-primary/20 text-gold-light border border-primary/30'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-light" />
                      Rated
                    </button>
                    <button
                      onClick={() => setRatedFilter('titled')}
                      className={`px-2 py-0.5 rounded text-[10px] font-label-notation font-semibold flex items-center gap-1 transition-colors ${
                        ratedFilter === 'titled'
                          ? 'bg-primary/20 text-gold-light border border-primary/30'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">military_tech</span>
                      Title Holders Only
                    </button>
                  </div>
                </div>
                <span className="text-gold-light font-medium">Fastest Pair: &lt; 2.4s</span>
              </div>

              {/* Cadence Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-space-md">
                {CADENCE_PRESETS.map((preset) => {
                  const isSelected = selectedCadence.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedCadence(preset)}
                      className={`group p-2.5 rounded-xl text-left transition-all active:scale-[0.98] border ${
                        isSelected
                          ? 'bg-secondary-container text-on-secondary-container border-secondary shadow-lg'
                          : 'bg-surface-container-high hover:bg-surface-elevated text-on-surface border-border-subtle'
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            isSelected ? 'text-on-secondary-container' : 'text-outline group-hover:text-primary'
                          }`}
                        >
                          {preset.icon}
                        </span>
                        <span
                          className={`text-[9px] font-label-notation uppercase tracking-wider font-bold ${
                            isSelected ? 'text-on-secondary-container' : 'text-outline'
                          }`}
                        >
                          {preset.name}
                        </span>
                      </div>
                      <div
                        className={`font-clock-display text-[15px] font-bold ${
                          isSelected ? 'text-on-secondary-container' : 'text-on-surface group-hover:text-gold-light'
                        }`}
                      >
                        {preset.timeStr}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Special Match Modes & Odds */}
              <div className="mb-space-md">
                <span className="text-[10px] font-label-notation uppercase tracking-wider text-outline font-semibold block mb-1.5">
                  Special Match Modes & Odds:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      onStartMatch({
                        id: 'armageddon',
                        name: 'Armageddon',
                        sub: 'Draw Odds',
                        timeStr: '5 vs 4m',
                        icon: 'swords',
                        baseMinutes: 5,
                        incrementSeconds: 0,
                      })
                    }
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-elevated text-left transition-all flex items-center justify-between border border-border-subtle group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-surface-elevated flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[16px]">swords</span>
                      </div>
                      <div>
                        <div className="font-title-md text-[12px] font-semibold text-on-surface group-hover:text-gold-light leading-tight">
                          Armageddon
                        </div>
                        <div className="font-label-notation text-[10px] text-outline">
                          5m vs 4m • Draw Odds
                        </div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-gold-shadow/20 text-gold-light font-label-notation text-[9px] font-bold">
                      Blitz Tiebreak
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      onStartMatch({
                        id: 'blindfold',
                        name: 'Blindfold',
                        sub: 'No Visuals',
                        timeStr: '10 min',
                        icon: 'visibility_off',
                        baseMinutes: 10,
                        incrementSeconds: 0,
                      })
                    }
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-elevated text-left transition-all flex items-center justify-between border border-border-subtle group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-surface-elevated flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                      </div>
                      <div>
                        <div className="font-title-md text-[12px] font-semibold text-on-surface group-hover:text-secondary leading-tight">
                          Grandmaster Blindfold
                        </div>
                        <div className="font-label-notation text-[10px] text-outline">
                          Audio Notation
                        </div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-secondary/10 text-secondary font-label-notation text-[9px] font-bold">
                      Master Class
                    </span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('analyze')}
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-elevated text-left transition-all flex items-center justify-between border border-border-subtle group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-surface-elevated flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      </div>
                      <div>
                        <div className="font-title-md text-[12px] font-semibold text-on-surface group-hover:text-primary leading-tight">
                          Custom Opening Drill
                        </div>
                        <div className="font-label-notation text-[10px] text-outline">
                          Play Tabiyas (e.g. Najdorf)
                        </div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-outline font-label-notation text-[9px]">
                      FEN Presets
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-space-sm">
                <button
                  onClick={() => onStartMatch(selectedCadence)}
                  className="px-space-lg py-3 rounded-xl bg-secondary-container hover:bg-secondary text-surface-deep font-title-md text-sm font-bold flex items-center justify-center gap-space-sm shadow-xl transition-all active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">play_circle</span>
                  Play Online Now
                  <span className="font-label-notation text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/20">
                    {selectedCadence.timeStr}
                  </span>
                </button>

                <button
                  onClick={() => onStartMatch(selectedCadence)}
                  className="px-space-md py-3 rounded-xl bg-surface-elevated hover:bg-surface-bright text-primary font-body-md text-sm font-medium flex items-center gap-2 border border-border-subtle transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Custom Match / Odds
                </button>

                <div className="px-space-md py-3 rounded-xl bg-surface-elevated text-gold-light border border-primary/20 font-body-md text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-gold-light">toll</span>
                  <span>Arena Stakes</span>
                  <span className="font-label-notation text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-gold-light">
                    500 GP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Quick Launch Cards Triad */}
          <div className="xl:w-80 flex flex-col gap-2.5">
            {/* Play vs Computer */}
            <div
              onClick={() => onNavigateTab('bots')}
              className="p-space-sm rounded-xl bg-surface-elevated hover:bg-surface-bright transition-all cursor-pointer group shadow-sm flex items-center gap-space-sm border border-border-subtle"
            >
              <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Adaptive AI Coach
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-[9px] font-label-notation text-outline">
                    NNUE v16
                  </span>
                </div>
                <p className="font-body-sm text-xs text-outline truncate">
                  Simulate Magnus, Tal, or Stockfish 16
                </p>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>

            {/* Play with a Friend */}
            <div
              onClick={() => onStartMatch(selectedCadence)}
              className="p-space-sm rounded-xl bg-surface-elevated hover:bg-surface-bright transition-all cursor-pointer group shadow-sm flex items-center gap-space-sm border border-border-subtle"
            >
              <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">share_location</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                    Play with a Friend
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-secondary/10 text-[9px] font-label-notation text-secondary">
                    Local / Duel
                  </span>
                </div>
                <p className="font-body-sm text-xs text-outline truncate">
                  Direct challenge on 1-on-1 board
                </p>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>

            {/* Solve Daily Tactics Banner */}
            <div
              onClick={() => onNavigateTab('puzzles')}
              className="p-space-sm rounded-xl bg-surface-elevated hover:bg-surface-bright transition-all cursor-pointer group shadow-sm flex items-center gap-space-sm border border-border-subtle"
            >
              <div className="w-11 h-11 rounded-lg bg-gold-shadow/20 flex items-center justify-center text-gold-light group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-sm font-semibold text-on-surface group-hover:text-gold-light transition-colors">
                    Tactics Rush
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-primary/20 text-[10px] font-label-notation text-gold-light font-bold">
                    18d Streak
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-clock-display text-xs text-primary">Rating 2240</span>
                  <span className="text-outline text-[10px]">•</span>
                  <span className="font-body-sm text-xs text-outline truncate">+35 today</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Time Control Cards & Pacing Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Bullet Section */}
        <div className="p-space-md rounded-2xl bg-surface-card border border-border-subtle shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">bolt</span>
              <h3 className="font-title-md text-base font-bold text-on-surface">Bullet & Hyperspeed</h3>
            </div>
            <span className="font-label-notation text-xs text-outline">3,480 in queue</span>
          </div>

          <div className="space-y-2">
            {[
              { id: '1-0', name: '1 min', sub: 'Hyper Bullet', players: '1,410 Playing' },
              { id: '1-1', name: '1 min + 1s', sub: 'FIDE Arena Bullet', players: '1,120 Playing' },
              { id: '2-1', name: '2 min + 1s', sub: 'Strategic Speed', players: '950 Playing' },
            ].map((tc) => (
              <div
                key={tc.id}
                onClick={() =>
                  onStartMatch({
                    id: tc.id,
                    name: tc.name,
                    sub: tc.sub,
                    timeStr: tc.name,
                    icon: 'electric_bolt',
                    baseMinutes: 1,
                    incrementSeconds: 1,
                  })
                }
                className="p-3 rounded-xl bg-surface-elevated hover:bg-surface-bright cursor-pointer transition-all border border-border-subtle/50 flex items-center justify-between group"
              >
                <div>
                  <span className="font-clock-display text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    {tc.name}
                  </span>
                  <span className="font-label-notation text-[11px] text-outline block">
                    {tc.sub}
                  </span>
                </div>
                <span className="font-label-notation text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                  {tc.players}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blitz Section */}
        <div className="p-space-md rounded-2xl bg-surface-card border border-border-subtle shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                workspace_premium
              </span>
              <h3 className="font-title-md text-base font-bold text-on-surface">
                Blitz (Grandmaster Choice)
              </h3>
            </div>
            <span className="font-label-notation text-xs text-secondary font-semibold">
              8,940 in queue
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: '3-0', name: '3 min', sub: 'Pure Instinct', players: '3,240 Playing' },
              { id: '3-2', name: '3 min + 2s', sub: 'Championship Standard', players: '4,110 Playing', highlight: true },
              { id: '5-0', name: '5 min', sub: 'Classic Blitz', players: '1,590 Playing' },
            ].map((tc) => (
              <div
                key={tc.id}
                onClick={() =>
                  onStartMatch({
                    id: tc.id,
                    name: tc.name,
                    sub: tc.sub,
                    timeStr: tc.name,
                    icon: 'bolt',
                    baseMinutes: 3,
                    incrementSeconds: 2,
                  })
                }
                className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${
                  tc.highlight
                    ? 'bg-surface-elevated border-secondary ring-1 ring-secondary/50 shadow-md'
                    : 'bg-surface-elevated hover:bg-surface-bright border-border-subtle/50'
                }`}
              >
                <div>
                  <span className="font-clock-display text-sm font-bold text-secondary">
                    {tc.name}
                  </span>
                  <span className="font-label-notation text-[11px] text-outline block">
                    {tc.sub}
                  </span>
                </div>
                <span className="font-label-notation text-xs text-on-primary bg-secondary px-2 py-0.5 rounded font-bold">
                  {tc.players}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid & Classical Section */}
        <div className="p-space-md rounded-2xl bg-surface-card border border-border-subtle shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                hourglass_empty
              </span>
              <h3 className="font-title-md text-base font-bold text-on-surface">
                Rapid & Classical
              </h3>
            </div>
            <span className="font-label-notation text-xs text-outline">4,200 in queue</span>
          </div>

          <div className="space-y-2">
            {[
              { id: '10-0', name: '10 min', sub: 'Rapid Tournament', players: '2,800 Playing' },
              { id: '15-10', name: '15 min + 10s', sub: 'FIDE Rapid', players: '980 Playing' },
              { id: '30-0', name: '30 min', sub: 'Deep Calculation', players: '420 Playing' },
            ].map((tc) => (
              <div
                key={tc.id}
                onClick={() =>
                  onStartMatch({
                    id: tc.id,
                    name: tc.name,
                    sub: tc.sub,
                    timeStr: tc.name,
                    icon: 'schedule',
                    baseMinutes: 10,
                    incrementSeconds: 0,
                  })
                }
                className="p-3 rounded-xl bg-surface-elevated hover:bg-surface-bright cursor-pointer transition-all border border-border-subtle/50 flex items-center justify-between group"
              >
                <div>
                  <span className="font-clock-display text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    {tc.name}
                  </span>
                  <span className="font-label-notation text-[11px] text-outline block">
                    {tc.sub}
                  </span>
                </div>
                <span className="font-label-notation text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                  {tc.players}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

