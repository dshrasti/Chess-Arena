import React, { useState } from 'react';

export interface BotProfile {
  id: string;
  name: string;
  title: string;
  elo: number;
  category: 'masters' | 'coaches' | 'novice';
  style: string;
  stars: number;
  quote: string;
  description: string;
  colorLabel: string;
  engineLevel: number;
}

export const COMPUTER_BOTS: BotProfile[] = [
  {
    id: 'deep-arena',
    name: 'Deep Arena AI',
    title: 'ULTIMATE ENGINE',
    elo: 3500,
    category: 'masters',
    style: 'Deep Calculation',
    stars: 10,
    quote: 'Every inaccuracy within 40 ply guarantees an asymptotic loss.',
    description: 'Ruthless calculation, impenetrable defense, and algorithmic mastery from move one.',
    colorLabel: 'SF16 Lvl 8',
    engineLevel: 8,
  },
  {
    id: 'tal-ai',
    name: 'Tal AI',
    title: 'THE MAGICIAN OF RIGA',
    elo: 2600,
    category: 'masters',
    style: 'Intuitive Sacrifices',
    stars: 9,
    quote: 'You must take your opponent into a deep dark forest where 2+2=5.',
    description: 'Relentless dynamic sacrifices, chaotic complexities, and tactical fireworks.',
    colorLabel: 'Legend',
    engineLevel: 7,
  },
  {
    id: 'morphy-ai',
    name: 'Morphy AI',
    title: 'PRIDE OF NEW ORLEANS',
    elo: 2400,
    category: 'masters',
    style: 'Romantic Attack',
    stars: 8,
    quote: 'Open lines and rapid development are worth any sacrifice.',
    description: 'Pure 19th-century romantic chess: king hunts, gambits, and open file assaults.',
    colorLabel: '1858',
    engineLevel: 6,
  },
  {
    id: 'capablanca-ai',
    name: 'Capablanca AI',
    title: 'THE CHESS MACHINE',
    elo: 2500,
    category: 'masters',
    style: 'Endgame Precision',
    stars: 8,
    quote: 'In order to improve your game, you must study the endgame before anything else.',
    description: 'Crystal-clear positional intuition, prophylactic play, and flawless endgames.',
    colorLabel: 'World Champ',
    engineLevel: 6,
  },
  {
    id: 'coach-magnus',
    name: 'Coach Magnus',
    title: 'ADAPTIVE MENTOR',
    elo: 2200,
    category: 'coaches',
    style: 'Grind & Pressure',
    stars: 7,
    quote: 'Some people think that if their opponent plays a beautiful game, it is okay to lose. I do not.',
    description: 'Relentless squeezer of microscopic advantages, adapting depth to challenge your current form.',
    colorLabel: 'Coach',
    engineLevel: 5,
  },
  {
    id: 'sparring-leo',
    name: 'Sparring Bot Leo',
    title: 'CLUB CHALLENGER',
    elo: 1400,
    category: 'novice',
    style: 'Solid Classical',
    stars: 5,
    quote: 'Control the center, develop knights before bishops, and castle early.',
    description: 'Standard textbook openings with human-like tactical blind spots and occasional blunders.',
    colorLabel: 'Club',
    engineLevel: 3,
  },
  {
    id: 'novice-maya',
    name: 'Novice Maya',
    title: 'TACTICAL TRAINEE',
    elo: 900,
    category: 'novice',
    style: 'Friendly Sparring',
    stars: 3,
    quote: 'Chess is fun! Watch out for my queen raids.',
    description: 'Playful early attacks, aggressive pawn storms, and generous tactical opportunities.',
    colorLabel: 'Beginner',
    engineLevel: 1,
  },
];

export interface ComputerBotsViewProps {
  onChallengeBot: (bot: BotProfile, userColor: 'w' | 'b') => void;
}

export const ComputerBotsView: React.FC<ComputerBotsViewProps> = ({ onChallengeBot }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'masters' | 'coaches' | 'novice'>('all');
  const [activeBot, setActiveBot] = useState<BotProfile>(COMPUTER_BOTS[0]!);

  const filteredBots = COMPUTER_BOTS.filter(
    (b) => selectedCategory === 'all' || b.category === selectedCategory
  );

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-space-xl">
      {/* Top Editorial Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-space-sm">
            <span className="px-2 py-0.5 rounded text-gold-light bg-surface-card font-label-notation text-[11px] tracking-widest uppercase font-semibold border border-border-subtle">
              Stockfish 16.1 WASM Core
            </span>
            <span className="text-outline font-label-notation text-body-sm">•</span>
            <span className="font-label-notation text-[11px] text-mint-bright flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-bright animate-ping" />
              {COMPUTER_BOTS.length} Neural Avatars Online
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Computer Opponents & Neural Avatars
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
            Spar against custom-tuned grandmaster personalities, historical romantic engines, and
            dynamic neural trainers calibrated to test your exact tactical limits.
          </p>
        </div>

        {/* Quick Metrics Counter Strip */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-card shadow-lg border border-border-subtle">
          <div className="px-3 py-1.5 rounded-lg bg-surface-elevated flex flex-col text-center">
            <span className="font-label-notation text-[9px] uppercase text-outline tracking-wider">
              Wins
            </span>
            <span className="font-clock-display text-sm font-bold text-gold-light">14</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-elevated flex flex-col text-center">
            <span className="font-label-notation text-[9px] uppercase text-outline tracking-wider">
              Draws
            </span>
            <span className="font-clock-display text-sm font-bold text-on-surface">3</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-elevated flex flex-col text-center">
            <span className="font-label-notation text-[9px] uppercase text-outline tracking-wider">
              Losses
            </span>
            <span className="font-clock-display text-sm font-bold text-error">29</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Bot List on Left + Selected Bot Focus on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left: Filter Tabs & Bot Cards Grid */}
        <div className="xl:col-span-8 flex flex-col space-y-space-md">
          {/* Category Tabs */}
          <div className="flex items-center justify-between gap-space-sm p-1.5 rounded-xl bg-surface-card border border-border-subtle">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'All Personalities', icon: 'grid_view' },
                { id: 'masters', label: 'Grandmasters', icon: 'military_tech' },
                { id: 'coaches', label: 'Adaptive Coaches', icon: 'school' },
                { id: 'novice', label: 'Sparring Club', icon: 'fitness_center' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-title-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-elevated'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <span className="hidden md:inline-flex font-label-notation text-[11px] text-outline px-3 py-1">
              Sorted by ELO
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {filteredBots.map((bot) => {
              const isSelected = activeBot.id === bot.id;
              return (
                <div
                  key={bot.id}
                  onClick={() => setActiveBot(bot)}
                  className={`relative p-space-md rounded-xl bg-surface-card hover:bg-surface-elevated transition-all cursor-pointer group shadow-xl border ${
                    isSelected
                      ? 'border-secondary ring-2 ring-secondary/50'
                      : 'border-border-subtle'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-notation text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Active Selection
                    </div>
                  )}

                  <div className="flex items-start gap-space-md">
                    {/* Bot Avatar Icon Box */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-deep shrink-0 flex items-center justify-center font-display font-black text-xl text-primary border border-border-subtle">
                      {bot.name.slice(0, 2).toUpperCase()}
                      <span className="absolute bottom-1 left-1 px-1 rounded text-[9px] font-label-notation font-bold bg-primary/20 text-gold-light">
                        {bot.colorLabel}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-title-md text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                        {bot.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-label-notation text-xs text-secondary font-bold">
                          {bot.elo} ELO
                        </span>
                        <span className="text-outline text-[10px]">•</span>
                        <span className="font-label-notation text-[11px] text-on-surface-variant truncate">
                          {bot.style}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-primary mt-1 text-[11px]">
                        {Array.from({ length: Math.min(bot.stars, 5) }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[13px] fill-current">
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="font-body-sm text-xs text-on-surface-variant mt-3 line-clamp-2">
                    {bot.description}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-border-subtle/50 text-[11px] font-label-notation">
                    <span className="px-2 py-0.5 rounded uppercase bg-surface-elevated text-on-surface-variant">
                      {bot.title}
                    </span>
                    <span className="text-outline">Engine Level {bot.engineLevel}/8</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Bot Combat Deploy Panel */}
        <div className="xl:col-span-4 bg-surface-card p-space-lg rounded-2xl shadow-2xl border border-border-subtle flex flex-col gap-space-md sticky top-20">
          <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
            <span className="px-2 py-0.5 rounded text-[10px] font-label-notation font-bold uppercase bg-surface-elevated text-primary tracking-wider">
              {activeBot.title}
            </span>
            <span className="font-label-notation text-xs font-bold text-secondary">
              {activeBot.elo} ELO
            </span>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="w-16 h-16 rounded-xl bg-surface-deep border border-border-subtle flex items-center justify-center font-display font-black text-2xl text-primary">
              {activeBot.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-title-md text-lg font-bold text-on-surface leading-tight">
                {activeBot.name}
              </h3>
              <p className="font-label-notation text-xs text-secondary mt-0.5">
                {activeBot.style} • Level {activeBot.engineLevel}
              </p>
            </div>
          </div>

          <blockquote className="p-3 rounded-lg bg-surface-deep/80 border-l-2 border-secondary italic font-body-sm text-xs text-on-surface-variant">
            "{activeBot.quote}"
          </blockquote>

          <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
            {activeBot.description}
          </p>

          {/* Deploy Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
            <span className="text-[11px] font-label-notation text-outline uppercase tracking-wider text-center">
              Choose Your Color to Deploy Match
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChallengeBot(activeBot, 'w')}
                className="py-3 px-3 rounded-xl bg-secondary-container hover:bg-secondary text-surface-deep font-title-md text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">chess</span>
                Play as White
              </button>
              <button
                onClick={() => onChallengeBot(activeBot, 'b')}
                className="py-3 px-3 rounded-xl bg-surface-elevated hover:bg-surface-bright text-on-surface font-title-md text-xs font-bold flex items-center justify-center gap-2 border border-border-subtle shadow-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">sports_esports</span>
                Play as Black
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
