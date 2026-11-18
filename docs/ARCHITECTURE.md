# System Architecture — Chess Arena

## 1. High-Level Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    React Client (apps/web)                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Custom Board │  │  Game Store  │  │ Stockfish Worker  │  │
│  │ (Pointer/DOM)│  │   (Zustand)  │  │   (UCI / WASM)    │  │
│  └───────┬──────┘  └──────┬───────┘  └─────────┬─────────┘  │
│          │                │                    │            │
│          └───────────────►├────────────────────┘            │
│                           ▼                                 │
│              packages/chess-core (GameEngine)               │
│                                                             │
│              packages/shared (Protocol / Types)             │
└───────────────────────────┬─────────────────────────────────┘
                            │ WebSocket / REST (JWT Auth)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Game Server (apps/server)                  │
│                                                             │
│  ┌───────────────────────┐         ┌─────────────────────┐  │
│  │ Fastify HTTP Handler  │         │ WebSocket Manager   │  │
│  └───────────┬───────────┘         └──────────┬──────────┘  │
│              │                                │             │
│              ▼                                ▼             │
│     ┌─────────────────────────────────────────────────┐     │
│     │   GameManager / GameSession (Authoritative)     │     │
│     │   - packages/chess-core validation              │     │
│     │   - High-resolution clock authority             │     │
│     │   - Glicko-2 rating engine                      │     │
│     │   - Matchmaking queue                           │     │
│     └────────────────────────┬────────────────────────┘     │
│                              │                              │
│                              ▼                              │
│                   Supabase (PostgreSQL + RLS)               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Evaluation & Move Quality Classification
For game analysis and review, moves are evaluated based on centipawn loss ($\Delta cp$) and winning probability changes ($\Delta P$):
- **Brilliant (!!) `brilliant`**: Found a sacrifice or decisive tactic that is uniquely winning ($\Delta P \ge 0$, material temporarily surrendered).
- **Great (!) `great`**: Found an exceptional, critical move that maintains the advantage in a complex position.
- **Best `best`**: Matches engine's top choice ($\Delta cp \le 10$).
- **Excellent `excellent`**: Very strong move with minimal evaluation loss ($\Delta cp \le 25$).
- **Good `good`**: Solid, acceptable move ($\Delta cp \le 50$).
- **Book `book`**: Move matches standard ECO opening book database.
- **Inaccuracy (?!) `inaccuracy`**: Noticeable drop in advantage ($50 < \Delta cp \le 120$).
- **Mistake (?) `mistake`**: Serious error compromising position ($120 < \Delta cp \le 250$).
- **Miss `miss`**: Overlooked an immediate winning tactic or free capture.
- **Blunder (??) `blunder`**: Catastrophic blunder changing game outcome ($\Delta cp > 250$ or swinging win probability $> 25\%$).

## 3. Glicko-2 Rating Engine Implementation
- Initial parameters: Rating $\mu = 1500$, Rating Deviation $RD = 350$, Volatility $\sigma = 0.06$.
- System constant $\tau = 0.5$.
- A player is marked **provisional** while $RD > 110$.
- Computed independently for: Bullet, Blitz, Rapid, Classical, and Puzzles.

## 4. Web Worker Stockfish Pipeline
- The engine executes inside a dedicated Web Worker (`/stockfish.js`).
- Commands are queued and tagged with a monotonically increasing `searchId`.
- When a user moves, plays takeback, or restarts, `stop` is issued immediately, and any subsequent evaluation events with mismatched `searchId` are discarded.
- Engine moves are *always* re-verified by `GameEngine.legalMoves()` before updating state.

