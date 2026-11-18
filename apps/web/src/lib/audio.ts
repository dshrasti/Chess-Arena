export type SoundEvent =
  | 'move'
  | 'capture'
  | 'check'
  | 'castle'
  | 'promote'
  | 'game-start'
  | 'game-end'
  | 'low-time'
  | 'illegal-move';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private volume = 0.5;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public play(event: SoundEvent): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.volume, now);
      gainNode.connect(ctx.destination);

      switch (event) {
        case 'move': {
          // Subtle crisp wooden click (bandpass filtered pop)
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);

          gainNode.gain.setValueAtTime(this.volume * 0.7, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'capture': {
          // Punchy heavier knock
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

          gainNode.gain.setValueAtTime(this.volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'check': {
          // Attention-grabbing dual ping
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(784, now); // G5
          osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5

          gainNode.gain.setValueAtTime(this.volume * 0.8, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          osc1.start(now);
          osc1.stop(now + 0.2);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.35);
          break;
        }

        case 'castle': {
          // Rapid double glide
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
          osc.frequency.setValueAtTime(350, now + 0.09);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);

          gainNode.gain.setValueAtTime(this.volume * 0.8, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }

        case 'promote': {
          // Triumphant rising chime
          const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const toneGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            toneGain.gain.setValueAtTime(this.volume * 0.5, now + idx * 0.06);
            toneGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

            osc.connect(toneGain);
            toneGain.connect(gainNode);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.25);
          });
          break;
        }

        case 'game-start': {
          // Warm harmonic chime
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

          gainNode.gain.setValueAtTime(this.volume * 0.6, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'game-end': {
          // Resolving minor-to-major cadence
          const freqs = [440, 349.23, 261.63];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            g.gain.setValueAtTime(this.volume * 0.6, now + idx * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
            osc.connect(g);
            g.connect(gainNode);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.4);
          });
          break;
        }

        case 'low-time': {
          // Low urgency pulse
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, now);

          gainNode.gain.setValueAtTime(this.volume * 0.4, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'illegal-move': {
          // Gentle low error thud
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(130, now);
          osc.frequency.exponentialRampToValueAtTime(65, now + 0.15);

          gainNode.gain.setValueAtTime(this.volume * 0.5, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
      }
    } catch {
      // Audio playback fails silently without interrupting game loop
    }
  }
}

export const soundManager = new SoundManager();

