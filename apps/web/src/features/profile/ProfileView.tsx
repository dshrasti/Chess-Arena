import React from 'react';

export const ProfileView: React.FC = () => {
  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-space-xl space-y-space-lg">
      {/* Profile Banner & Hero */}
      <div className="relative rounded-2xl bg-surface-card border border-border-subtle p-space-lg shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-space-lg">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-surface-deep border-2 border-primary/50 flex items-center justify-center font-display font-black text-3xl text-primary shadow-xl">
              AK
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label-notation text-[10px] font-bold uppercase shadow">
              GM
            </span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
                Alexander Kasparov
              </h1>
              <span className="font-label-notation text-xs text-outline font-medium">
                @a_kasparov
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary text-[10px] font-label-notation font-semibold">
                FIDE Master #14892
              </span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant max-w-xl">
              International Grandmaster & Tactician. Aggressive Sicilian specialist with an appetite
              for dynamic pawn play and complex endgames.
            </p>
          </div>
        </div>

        {/* Rating Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-space-lg pt-space-md border-t border-border-subtle/50">
          <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
            <span className="font-label-notation text-[10px] uppercase text-outline">Blitz</span>
            <div className="font-clock-display text-xl font-bold text-primary mt-0.5">2482</div>
            <span className="font-label-notation text-[10px] text-mint-bright font-semibold">
              Peak: 2510
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
            <span className="font-label-notation text-[10px] uppercase text-outline">Rapid</span>
            <div className="font-clock-display text-xl font-bold text-secondary mt-0.5">2540</div>
            <span className="font-label-notation text-[10px] text-mint-bright font-semibold">
              Peak: 2565
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
            <span className="font-label-notation text-[10px] uppercase text-outline">Classical</span>
            <div className="font-clock-display text-xl font-bold text-gold-light mt-0.5">2615</div>
            <span className="font-label-notation text-[10px] text-mint-bright font-semibold">
              Peak: 2620
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
            <span className="font-label-notation text-[10px] uppercase text-outline">Bullet</span>
            <div className="font-clock-display text-xl font-bold text-on-surface mt-0.5">2390</div>
            <span className="font-label-notation text-[10px] text-outline font-semibold">
              Peak: 2420
            </span>
          </div>
        </div>
      </div>

      {/* Match Record & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-card border border-border-subtle shadow-xl">
          <span className="font-label-notation text-xs uppercase text-outline font-semibold">
            Overall Record
          </span>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-xs font-label-notation">
              <span className="text-secondary font-bold">142 Wins (68%)</span>
              <span className="text-error font-bold">48 Losses</span>
              <span className="text-outline">19 Draws</span>
            </div>
            <div className="h-2 w-full bg-surface-deep rounded-full overflow-hidden flex">
              <div style={{ width: '68%' }} className="bg-secondary h-full" />
              <div style={{ width: '23%' }} className="bg-error h-full" />
              <div style={{ width: '9%' }} className="bg-outline h-full" />
            </div>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-card border border-border-subtle shadow-xl">
          <span className="font-label-notation text-xs uppercase text-outline font-semibold">
            Favorite Opening
          </span>
          <div className="mt-2">
            <div className="font-title-md text-sm font-bold text-primary">
              Sicilian: Najdorf (B97)
            </div>
            <p className="font-body-sm text-xs text-outline mt-1">
              74% win rate across 89 competitive tournament games.
            </p>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-card border border-border-subtle shadow-xl">
          <span className="font-label-notation text-xs uppercase text-outline font-semibold">
            Tournament Honours
          </span>
          <div className="mt-2 space-y-1">
            <div className="text-xs font-label-notation text-gold-light font-bold flex items-center gap-1.5">
              <span>🏆 1st Place</span>
              <span className="text-on-surface font-normal">Winter Rapid Invitational</span>
            </div>
            <div className="text-xs font-label-notation text-zinc-300 font-bold flex items-center gap-1.5">
              <span>🥈 2nd Place</span>
              <span className="text-on-surface font-normal">Master Blitz Championship</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
