import React from 'react';

export interface TournamentEvent {
  id: string;
  title: string;
  format: string;
  timeControl: string;
  prizePool: string;
  participants: number;
  maxParticipants: number;
  status: 'Live Now' | 'Registering' | 'Upcoming';
  startsIn: string;
}

export const TOURNAMENT_LIST: TournamentEvent[] = [
  {
    id: 'tr-01',
    title: 'Winter Grandmaster Blitz Arena',
    format: 'Arena Swiss (9 Rounds)',
    timeControl: '3+2 Blitz',
    prizePool: '$15,000 USD',
    participants: 128,
    maxParticipants: 128,
    status: 'Live Now',
    startsIn: 'Round 4 in progress',
  },
  {
    id: 'tr-02',
    title: 'Superbet Classical Invitational',
    format: 'Single Elimination',
    timeControl: '15+10 Rapid',
    prizePool: '$25,000 USD',
    participants: 48,
    maxParticipants: 64,
    status: 'Registering',
    startsIn: 'Starts in 42m',
  },
  {
    id: 'tr-03',
    title: 'Titled Tuesday Championship Qualifier',
    format: 'Swiss System (11 Rounds)',
    timeControl: '1+0 Bullet',
    prizePool: '$10,000 USD',
    participants: 212,
    maxParticipants: 300,
    status: 'Registering',
    startsIn: 'Starts in 3h 15m',
  },
  {
    id: 'tr-04',
    title: 'World Fischer Random Championship',
    format: 'Chess960 Double Round',
    timeControl: '10+5 Rapid',
    prizePool: '$50,000 USD',
    participants: 16,
    maxParticipants: 16,
    status: 'Upcoming',
    startsIn: 'Tomorrow, 18:00 UTC',
  },
];

export const TournamentsView: React.FC = () => {
  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-space-xl space-y-space-lg">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-space-sm">
          <span className="px-2 py-0.5 rounded text-gold-light bg-surface-card font-label-notation text-[11px] tracking-widest uppercase font-semibold border border-border-subtle">
            FIDE Sanctioned Events
          </span>
          <span className="text-outline font-label-notation text-body-sm">•</span>
          <span className="font-label-notation text-[11px] text-mint-bright flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-bright animate-ping" />
            1 Major Arena Live
          </span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Championship Tournaments & Arenas
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
          Compete in cash-prize Swiss arenas, titled qualifiers, and international grandmaster invitational circuits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {TOURNAMENT_LIST.map((t) => (
          <div
            key={t.id}
            className="p-space-md rounded-2xl bg-surface-card border border-border-subtle hover:border-outline transition-all shadow-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-label-notation font-bold uppercase tracking-wider ${
                    t.status === 'Live Now'
                      ? 'bg-secondary-container/20 text-secondary'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {t.status}
                </span>
                <span className="font-label-notation text-xs text-outline">{t.startsIn}</span>
              </div>

              <h3 className="font-title-md text-lg font-bold text-on-surface mt-2">{t.title}</h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                {t.format} • {t.timeControl}
              </p>
            </div>

            <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-label-notation text-outline block">
                  Prize Pool
                </span>
                <span className="font-clock-display text-base font-bold text-gold-light">
                  {t.prizePool}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-label-notation text-outline block">
                  Participants
                </span>
                <span className="font-label-notation text-xs font-bold text-on-surface">
                  {t.participants}/{t.maxParticipants} Registered
                </span>
              </div>
            </div>

            <button
              className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-bright text-on-surface font-title-md text-xs font-bold transition-all border border-border-subtle"
              type="button"
            >
              {t.status === 'Live Now' ? 'Watch Arena Broadcast' : 'Register for Tournament'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
