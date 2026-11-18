export type TimeCategory = 'bullet' | 'blitz' | 'rapid' | 'classical';

export interface ClockState {
  whiteTimeMs: number;
  blackTimeMs: number;
  lastMoveTimestamp?: number;
  activeColor: 'w' | 'b';
  isRunning: boolean;
}

/**
 * Derives chess rating category based on base minutes and increment:
 * standard estimate = baseSeconds + 40 * incrementSeconds
 * <= 179s: Bullet
 * <= 479s: Blitz
 * <= 1499s: Rapid
 * >= 1500s: Classical
 */
export function deriveCategory(baseMinutes: number, incrementSeconds: number): TimeCategory {
  const baseSeconds = baseMinutes * 60;
  const totalEstimate = baseSeconds + 40 * incrementSeconds;

  if (totalEstimate <= 179) return 'bullet';
  if (totalEstimate <= 479) return 'blitz';
  if (totalEstimate <= 1499) return 'rapid';
  return 'classical';
}

/**
 * Formats milliseconds into clean chess clock string:
 * >= 60s: mm:ss (e.g. "05:00", "01:23")
 * < 10s: ss.t (tenth of a second, e.g. "09.4", "02.1")
 * 10s - 59s: 00:ss (e.g. "00:45")
 */
export function formatClockTime(ms: number): string {
  const clampedMs = Math.max(0, ms);
  const totalSeconds = clampedMs / 1000;

  if (totalSeconds < 10) {
    const s = Math.floor(totalSeconds);
    const tenths = Math.floor((clampedMs % 1000) / 100);
    return `0${s}.${tenths}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${mm}:${ss}`;
}

/**
 * Computes updated clock times after a move with Fischer increment.
 */
export function applyMoveIncrement(
  clock: ClockState,
  incrementMs: number,
  nowTimestamp: number
): ClockState {
  if (!clock.isRunning || clock.lastMoveTimestamp === undefined) {
    return {
      ...clock,
      lastMoveTimestamp: nowTimestamp,
      activeColor: clock.activeColor === 'w' ? 'b' : 'w',
    };
  }

  const elapsed = Math.max(0, nowTimestamp - clock.lastMoveTimestamp);

  let newWhiteTime = clock.whiteTimeMs;
  let newBlackTime = clock.blackTimeMs;

  if (clock.activeColor === 'w') {
    newWhiteTime = Math.max(0, newWhiteTime - elapsed + incrementMs);
  } else {
    newBlackTime = Math.max(0, newBlackTime - elapsed + incrementMs);
  }

  return {
    whiteTimeMs: newWhiteTime,
    blackTimeMs: newBlackTime,
    lastMoveTimestamp: nowTimestamp,
    activeColor: clock.activeColor === 'w' ? 'b' : 'w',
    isRunning: newWhiteTime > 0 && newBlackTime > 0,
  };
}

