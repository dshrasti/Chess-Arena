import { GameEngine, PieceType, Square } from '@chess-arena/chess-core';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyConfig {
  name: string;
  skillLevel: number; // 0..20 Stockfish Skill Level
  limitStrength: boolean;
  elo: number; // 1320..3190
  depth: number;
  maxTimeMs: number;
  minThinkingMs: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: 'Easy (Club Novice)',
    skillLevel: 2,
    limitStrength: true,
    elo: 1350,
    depth: 4,
    maxTimeMs: 800,
    minThinkingMs: 350,
  },
  medium: {
    name: 'Medium (Intermediate)',
    skillLevel: 8,
    limitStrength: true,
    elo: 1750,
    depth: 8,
    maxTimeMs: 1200,
    minThinkingMs: 500,
  },
  hard: {
    name: 'Hard (Master)',
    skillLevel: 15,
    limitStrength: true,
    elo: 2250,
    depth: 12,
    maxTimeMs: 2000,
    minThinkingMs: 650,
  },
  expert: {
    name: 'Expert (Grandmaster)',
    skillLevel: 20,
    limitStrength: false,
    elo: 3000,
    depth: 18,
    maxTimeMs: 3000,
    minThinkingMs: 800,
  },
};

export interface EngineMoveResult {
  uci: string;
  from: Square;
  to: Square;
  promotion?: PieceType;
  depth: number;
  scoreCp?: number;
}

export interface EngineEvaluation {
  scoreCp: number; // Centipawns from White's perspective
  scoreMate?: number; // Mate in N from White's perspective
  depth: number;
  nps?: number;
  pv?: string;
}

export class StockfishService {
  private worker: Worker | null = null;
  private isReady = false;
  private isInitializing = false;
  private initPromise: Promise<boolean> | null = null;
  private searchId = 0;
  private activeResolve: ((result: EngineMoveResult) => void) | null = null;
  private activeReject: ((reason?: any) => void) | null = null;
  private onEvalCallback: ((evalData: EngineEvaluation) => void) | null = null;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private activeSideToMove: 'w' | 'b' = 'w';
  private currentDifficulty: DifficultyLevel = 'medium';

  public get ready(): boolean {
    return this.isReady;
  }

  public get initializing(): boolean {
    return this.isInitializing;
  }

  /**
   * Initializes the Stockfish Web Worker.
   * Tries WebAssembly lite-single build first, falls back to ASM-JS build if needed.
   */
  public async init(): Promise<boolean> {
    if (this.isReady && this.worker) return true;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<boolean>((resolve) => {
      this.isInitializing = true;

      const setupWorker = (scriptPath: string): boolean => {
        try {
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }

          this.worker = new Worker(scriptPath);

          this.worker.onmessage = (e: MessageEvent) => {
            this.handleWorkerMessage(e.data);
          };

          this.worker.onerror = (err) => {
            console.warn(`Stockfish worker error from ${scriptPath}:`, err);
            if (scriptPath === '/stockfish.js') {
              console.log('Falling back to /stockfish-asm.js...');
              if (!setupWorker('/stockfish-asm.js')) {
                this.isReady = false;
                this.isInitializing = false;
                resolve(false);
              }
            } else {
              this.isReady = false;
              this.isInitializing = false;
              resolve(false);
            }
          };

          // Send UCI handshake
          this.worker.postMessage('uci');
          this.worker.postMessage('isready');

          // Timeout if worker doesn't respond within 5s
          setTimeout(() => {
            if (!this.isReady) {
              if (scriptPath === '/stockfish.js') {
                console.log('Stockfish wasm timed out. Falling back to asm.js...');
                setupWorker('/stockfish-asm.js');
              } else {
                this.isInitializing = false;
                resolve(false);
              }
            }
          }, 5000);

          return true;
        } catch (err) {
          console.error(`Failed to instantiate Stockfish worker at ${scriptPath}:`, err);
          return false;
        }
      };

      const success = setupWorker('/stockfish.js');
      if (!success) {
        this.isInitializing = false;
        resolve(false);
      }

      // Check for ready state periodically or on message
      const checkReadyInterval = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReadyInterval);
          this.isInitializing = false;
          resolve(true);
        }
      }, 50);
    });

    return this.initPromise;
  }

  /**
   * Handles incoming text messages from the Stockfish worker.
   */
  private handleWorkerMessage(message: unknown): void {
    if (typeof message !== 'string') return;
    const line = message.trim();

    if (line === 'readyok' || line === 'uciok') {
      this.isReady = true;
      return;
    }

    // Parse live evaluation: info depth X ... score cp Y ...
    if (line.startsWith('info') && line.includes('score')) {
      const depthMatch = line.match(/depth\s+(\d+)/);
      const scoreCpMatch = line.match(/score\s+cp\s+(-?\d+)/);
      const scoreMateMatch = line.match(/score\s+mate\s+(-?\d+)/);
      const npsMatch = line.match(/nps\s+(\d+)/);
      const pvMatch = line.match(/pv\s+(.+)/);

      const depth = depthMatch ? parseInt(depthMatch[1]!, 10) : 0;
      const nps = npsMatch ? parseInt(npsMatch[1]!, 10) : undefined;
      const pv = pvMatch ? pvMatch[1] : undefined;

      // Invert score if Black to move so evaluation is always from White's perspective
      const multiplier = this.activeSideToMove === 'w' ? 1 : -1;

      let scoreCp = 0;
      let scoreMate: number | undefined;

      if (scoreCpMatch) {
        scoreCp = (parseInt(scoreCpMatch[1]!, 10) / 100) * multiplier;
      } else if (scoreMateMatch) {
        scoreMate = parseInt(scoreMateMatch[1]!, 10) * multiplier;
        scoreCp = scoreMate > 0 ? 10 : -10;
      }

      if (this.onEvalCallback) {
        this.onEvalCallback({
          scoreCp,
          scoreMate,
          depth,
          nps,
          pv,
        });
      }
    }

    // Parse bestmove: bestmove e2e4 [ponder e7e5]
    if (line.startsWith('bestmove')) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }

      const parts = line.split(' ');
      const uciMove = parts[1];

      if (uciMove && uciMove !== '(none)' && this.activeResolve) {
        const from = uciMove.slice(0, 2) as Square;
        const to = uciMove.slice(2, 4) as Square;
        const promotion =
          uciMove.length === 5 ? (uciMove[4]!.toLowerCase() as PieceType) : undefined;

        const result: EngineMoveResult = {
          uci: uciMove,
          from,
          to,
          promotion,
          depth: 0,
        };

        const resolveFn = this.activeResolve;
        this.activeResolve = null;
        this.activeReject = null;
        resolveFn(result);
      } else if (this.activeReject) {
        const rejectFn = this.activeReject;
        this.activeResolve = null;
        this.activeReject = null;
        rejectFn(new Error(`No bestmove found (game may be over): ${line}`));
      }
    }
  }

  /**
   * Configures Stockfish UCI difficulty options.
   */
  public setDifficulty(level: DifficultyLevel): void {
    this.currentDifficulty = level;
    if (!this.worker || !this.isReady) return;

    const config = DIFFICULTY_PRESETS[level];
    this.worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
    this.worker.postMessage(`setoption name UCI_LimitStrength value ${config.limitStrength}`);
    if (config.limitStrength) {
      this.worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
    }
    this.worker.postMessage('isready');
  }

  /**
   * Sets custom difficulty parameters (e.g. from a bot profile).
   */
  public setCustomDifficulty(skillLevel: number, elo: number, limitStrength = true): void {
    if (!this.worker || !this.isReady) return;
    const clampedSkill = Math.max(0, Math.min(20, skillLevel));
    const clampedElo = Math.max(1320, Math.min(3190, elo));

    this.worker.postMessage(`setoption name Skill Level value ${clampedSkill}`);
    this.worker.postMessage(`setoption name UCI_LimitStrength value ${limitStrength}`);
    if (limitStrength) {
      this.worker.postMessage(`setoption name UCI_Elo value ${clampedElo}`);
    }
    this.worker.postMessage('isready');
  }

  /**
   * Calculates the best move for the given board position.
   */
  public async calculateMove(
    fen: string,
    difficulty: DifficultyLevel = this.currentDifficulty,
    onEval?: (evalData: EngineEvaluation) => void
  ): Promise<EngineMoveResult> {
    const ready = await this.init();
    if (!ready || !this.worker) {
      throw new Error('Stockfish engine is not ready');
    }

    // Cancel any pending calculation
    this.stop();

    const config = DIFFICULTY_PRESETS[difficulty];
    this.setDifficulty(difficulty);

    // Track active side to move from FEN for evaluation polarity
    const fenParts = fen.trim().split(' ');
    this.activeSideToMove = (fenParts[1] as 'w' | 'b') || 'w';
    this.onEvalCallback = onEval || null;

    const currentSearchId = ++this.searchId;
    const startTime = Date.now();

    return new Promise<EngineMoveResult>((resolve, reject) => {
      this.activeResolve = (res) => {
        if (currentSearchId !== this.searchId) return;

        // Ensure minimum thinking delay for human-like pacing
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, config.minThinkingMs - elapsed);

        if (remainingDelay > 0) {
          setTimeout(() => resolve(res), remainingDelay);
        } else {
          resolve(res);
        }
      };

      this.activeReject = (err) => {
        if (currentSearchId !== this.searchId) return;
        reject(err);
      };

      // Set timeout safeguard: maxTime + 3000ms
      this.searchTimeout = setTimeout(() => {
        if (currentSearchId === this.searchId && this.activeReject) {
          this.stop();
          const rejectFn = this.activeReject;
          this.activeResolve = null;
          this.activeReject = null;
          rejectFn(new Error(`Stockfish search timed out after ${config.maxTimeMs + 3000}ms`));
        }
      }, config.maxTimeMs + 3000);

      // Issue UCI search commands
      this.worker?.postMessage(`position fen ${fen}`);
      this.worker?.postMessage(`go depth ${config.depth} movetime ${config.maxTimeMs}`);
    });
  }

  /**
   * Re-validates and safely executes an engine move on the given GameEngine instance.
   * Guarantees that illegal moves can NEVER be played.
   */
  public validateAndExecuteMove(
    engine: GameEngine,
    moveResult: EngineMoveResult
  ): { from: Square; to: Square; promotion?: PieceType } | null {
    if (engine.status().isGameOver) return null;

    const { from, to, promotion } = moveResult;
    const legalMoves = engine.legalMoves(from);
    const matchingMove = legalMoves.find(
      (m) => m.to === to && (!promotion || m.promotion === promotion)
    );

    if (matchingMove) {
      return { from, to, promotion };
    }

    // Safety fallback: if Stockfish's suggested move is somehow illegal, pick first legal move
    console.warn(`Stockfish suggested move ${moveResult.uci} was invalid in current position!`);
    const allLegals = engine.legalMoves();
    if (allLegals.length > 0) {
      const fallback = allLegals[0]!;
      return {
        from: fallback.from,
        to: fallback.to,
        promotion: fallback.promotion,
      };
    }

    return null;
  }

  /**
   * Immediately halts current search.
   */
  public stop(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    if (this.worker && this.isReady) {
      this.worker.postMessage('stop');
    }
    this.activeResolve = null;
    this.activeReject = null;
    this.onEvalCallback = null;
  }

  /**
   * Cleans up and completely terminates the Web Worker.
   * Prevents memory leaks.
   */
  public terminate(): void {
    this.stop();
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.isInitializing = false;
    this.initPromise = null;
  }
}

// Export singleton instance for convenient access across components
export const stockfishService = new StockfishService();
