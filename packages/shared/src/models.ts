export type Color = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type RatingCategory = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'puzzle';

export type GameMode = 'local_pvp' | 'local_engine' | 'online' | 'analysis' | 'practice';

export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

export type TerminationReason =
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'stalemate'
  | 'repetition'
  | 'fifty-move'
  | 'insufficient-material'
  | 'timeout-vs-insufficient-material'
  | 'agreement'
  | 'abandonment';

export type DrawReason =
  | 'stalemate'
  | 'threefold_repetition'
  | 'fifty_move'
  | 'insufficient_material'
  | 'agreement';

export interface TimeControlConfig {
  name: string;
  category: RatingCategory;
  baseSeconds: number;
  incrementSeconds: number;
  delaySeconds?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  country?: string;
  bio?: string;
  rating: Record<RatingCategory, number>;
  ratingDeviation: Record<RatingCategory, number>;
  isProvisional: Record<RatingCategory, boolean>;
  createdAt: string;
}

export type MoveQuality =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'miss'
  | 'blunder';

export interface MoveAnnotation {
  ply: number;
  comment?: string;
  nag?: string;
  quality?: MoveQuality;
  arrows?: Array<{ from: string; to: string; color: string }>;
  squares?: Array<{ square: string; color: string }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
}

