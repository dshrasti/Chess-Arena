import { describe, it, expect } from 'vitest';
import { deriveCategory, formatClockTime, applyMoveIncrement, ClockState } from '../src/clock-math';

describe('Clock Math & Time Controls', () => {
  it('correctly categorizes standard time controls', () => {
    // Bullet (total estimate <= 179s)
    expect(deriveCategory(1, 0)).toBe('bullet'); // 60s
    expect(deriveCategory(2, 1)).toBe('bullet'); // 120 + 40 = 160s

    // Blitz (total estimate 180s - 479s)
    expect(deriveCategory(3, 0)).toBe('blitz'); // 180s
    expect(deriveCategory(3, 2)).toBe('blitz'); // 180 + 80 = 260s
    expect(deriveCategory(5, 0)).toBe('blitz'); // 300s
    expect(deriveCategory(5, 3)).toBe('blitz'); // 300 + 120 = 420s

    // Rapid (total estimate 480s - 1499s)
    expect(deriveCategory(10, 0)).toBe('rapid'); // 600s
    expect(deriveCategory(10, 5)).toBe('rapid'); // 600 + 200 = 800s
    expect(deriveCategory(15, 10)).toBe('rapid'); // 900 + 400 = 1300s

    // Classical (total estimate >= 1500s)
    expect(deriveCategory(30, 0)).toBe('classical'); // 1800s
    expect(deriveCategory(30, 20)).toBe('classical'); // 1800 + 800 = 2600s
  });

  it('formats clock times correctly with tenths of a second under 10 seconds', () => {
    expect(formatClockTime(300000)).toBe('05:00');
    expect(formatClockTime(65000)).toBe('01:05');
    expect(formatClockTime(45000)).toBe('00:45');
    expect(formatClockTime(9400)).toBe('09.4');
    expect(formatClockTime(2150)).toBe('02.1');
    expect(formatClockTime(0)).toBe('00.0');
  });

  it('applies Fischer increment accurately upon move completion', () => {
    const start: ClockState = {
      whiteTimeMs: 180000, // 3 minutes
      blackTimeMs: 180000,
      activeColor: 'w',
      lastMoveTimestamp: 1000,
      isRunning: true,
    };

    // White plays after 5 seconds (5000ms), 2 second (2000ms) increment
    const updated = applyMoveIncrement(start, 2000, 6000);
    // Elapsed = 6000 - 1000 = 5000ms
    // New White = 180000 - 5000 + 2000 = 177000ms
    expect(updated.whiteTimeMs).toBe(177000);
    expect(updated.blackTimeMs).toBe(180000);
    expect(updated.activeColor).toBe('b');
    expect(updated.lastMoveTimestamp).toBe(6000);
  });
});

