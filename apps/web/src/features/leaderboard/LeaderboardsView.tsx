import React from 'react';

export interface LeaderboardUser {
  rank: number;
  name: string;
  country: string;
  title: string;
  blitzRating: number;
  rapidRating: number;
  winRate: string;
}

export const LEADERBOARD_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Magnus Carlsen', country: 'NOR', title: 'GM', blitzRating: 2886, rapidRating: 2830, winRate: '78%' },
  { rank: 2, name: 'Hikaru Nakamura', country: 'USA', title: 'GM', blitzRating: 2875, rapidRating: 2802, winRate: '76%' },
  { rank: 3, name: 'Alireza Firouzja', country: 'FRA', title: 'GM', blitzRating: 2820, rapidRating: 2790, winRate: '73%' },
  { rank: 4, name: 'A. Kasparov', country: 'INT', title: 'GM', blitzRating: 2812, rapidRating: 2785, winRate: '74%' },
  { rank: 5, name: 'Ding Liren', country: 'CHN', title: 'GM', blitzRating: 2805, rapidRating: 2795, winRate: '71%' },
  { rank: 6, name: 'Ian Nepomniachtchi', country: 'FID', title: 'GM', blitzRating: 2798, rapidRating: 2780, winRate: '70%' },
  { rank: 7, name: 'Fabiano Caruana', country: 'USA', title: 'GM', blitzRating: 2795, rapidRating: 2776, winRate: '69%' },
  { rank: 8, name: 'Gukesh D', country: 'IND', title: 'GM', blitzRating: 2790, rapidRating: 2775, winRate: '72%' },
];

export const LeaderboardsView: React.FC = () => {
  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-space-xl">
      <div className="flex flex-col space-y-1 mb-space-lg">
        <div className="flex items-center gap-space-sm">
          <span className="px-2 py-0.5 rounded text-gold-light bg-surface-card font-label-notation text-[11px] tracking-widest uppercase font-semibold border border-border-subtle">
            FIDE International Rankings
          </span>
          <span className="text-outline font-label-notation text-body-sm">•</span>
          <span className="font-label-notation text-[11px] text-secondary">Updated Real-Time</span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Grandmaster Leaderboards
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
          Global ratings across classical blitz, hyper-bullet, and rapid championship tournaments.
        </p>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-2xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-sm">
            <thead>
              <tr className="bg-surface-elevated/70 border-b border-border-subtle font-label-notation text-xs text-outline uppercase tracking-wider">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-right">Blitz ELO</th>
                <th className="py-3 px-4 text-right">Rapid ELO</th>
                <th className="py-3 px-4 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {LEADERBOARD_DATA.map((player) => (
                <tr
                  key={player.rank}
                  className="hover:bg-surface-elevated/50 transition-colors text-on-surface"
                >
                  <td className="py-3 px-4 text-center font-label-notation font-bold">
                    {player.rank === 1 ? (
                      <span className="text-gold-light">🥇 1</span>
                    ) : player.rank === 2 ? (
                      <span className="text-zinc-300">🥈 2</span>
                    ) : player.rank === 3 ? (
                      <span className="text-amber-600">🥉 3</span>
                    ) : (
                      <span className="text-outline">#{player.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-on-surface">{player.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-label-notation font-bold uppercase bg-primary/10 text-primary">
                      {player.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-label-notation text-xs text-outline">
                    {player.country}
                  </td>
                  <td className="py-3 px-4 text-right font-clock-display font-bold text-secondary">
                    {player.blitzRating}
                  </td>
                  <td className="py-3 px-4 text-right font-clock-display font-bold text-on-surface">
                    {player.rapidRating}
                  </td>
                  <td className="py-3 px-4 text-right font-label-notation text-mint-bright font-bold">
                    {player.winRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
