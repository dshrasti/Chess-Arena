# Chess Arena — Master Project Plan

## 1. Executive Summary & Vision
**Chess Arena** is a modern, high-performance, full-stack chess platform built with strict TypeScript, Vite, React 18, Tailwind CSS, Zustand, Fastify, WebSockets, Supabase (PostgreSQL + Auth + RLS), and an isolated Stockfish Web Worker engine.

It is designed with an uncompromising focus on correctness, speed (< 100ms interactions, 120–250ms animations), zero fake functionality, and strict rules enforcement across all tiers.

---

## 2. Workspace & Environment Inspection Baseline
- **Location**: `C:\Users\shras\OneDrive\Projects\ChessArena`
- **Initial State**: Empty directory `ChessArena/`. Git repository initialized at `Projects/`.
- **Toolchain Identified**:
  - `Node.js`: v22.14.0 (`C:\Users\shras\AppData\Local\Programs\nodejs\node.exe`)
  - `npm`: 10.9.2 (`C:\Users\shras\AppData\Local\Programs\nodejs\npm.cmd`)
  - `pnpm`: 12.16.1 (`C:\Users\shras\AppData\Local\Programs\nodejs\pnpm.cmd`)
  - `git`: 2.56.0.windows.2
- **Shell / OS**: Windows PowerShell 5.1 / Windows 11.
- **Execution Strategy**: Cross-platform npm scripts; execution policy handled via `.cmd` invocation and strict workspace definitions.

---

## 3. Monorepo Architecture & Directory Structure
```
ChessArena/
├── apps/
│   ├── web/                          # React 18 + Vite + Tailwind + Zustand frontend
│   │   ├── public/                   # Favicons, manifest, piece SVGs, sound assets, stockfish worker
│   │   └── src/
│   │       ├── app/                  # Router, Layout, Providers, Navigation
│   │       ├── config/               # brand.ts, env.ts, time-controls.ts, themes.ts
│   │       ├── features/
│   │       │   ├── board/            # SVG/DOM Board, Square, Piece, CoordinateLabels, PromotionDialog, DragLayer, Arrows
│   │       │   ├── game/             # GameStore, GameScreen, MoveList, CapturedPieces, GameControls, ResultModal
│   │       │   ├── clock/            # Clock component, useClock hook, increment/delay math
│   │       │   ├── engine/           # StockfishClient, EvalBar, EngineLines, DifficultyPresets
│   │       │   ├── analysis/         # AnalysisScreen, eval graph, move classification, variations, annotations
│   │       │   ├── puzzles/          # PuzzleScreen, puzzle rush, daily challenge
│   │       │   ├── openings/         # Opening explorer, ECO database tree
│   │       │   ├── online/           # Lobby, matchmaking, room manager, socket client, reconnection
│   │       │   ├── profile/          # Profile screen, stats, heatmap, achievements showcase
│   │       │   ├── leaderboard/      # Category leaderboards (Glicko-2)
│   │       │   ├── chat/             # Room/game chat with rate limits and filtering
│   │       │   ├── settings/         # Theme switcher, audio settings, game preferences
│   │       │   └── auth/             # Supabase auth modal, guest mode, session listener
│   │       ├── components/ui/        # Button, Modal, Tabs, Toggle, Slider, Tooltip, Toast, Dropdown, Skeleton
│   │       ├── lib/                  # Web Audio sound manager, storage, hotkeys, a11y, utils
│   │       └── styles/               # tokens.css, themes, tailwind.css
│   └── server/                       # Node.js Fastify + ws game server
│       └── src/
│           ├── index.ts, app.ts      # Fastify server entry and lifecycle
│           ├── http/                 # REST routes: health, auth, profiles, games, puzzles, leaderboard
│           ├── ws/                   # WebSocket connection manager, heartbeat, message schemas, handlers
│           ├── game/                 # GameSession (server-authoritative), clock authority, GameManager
│           ├── matchmaking/          # Matchmaking queue, rating windows, pairing logic
│           ├── rating/               # Pure Glicko-2 implementation with reference tests
│           ├── db/                   # Supabase service-role client, repositories
│           ├── middleware/           # Auth JWT verification, rate limiting, error handling
│           └── lib/                  # Logger (Pino), config, errors
├── packages/
│   ├── chess-core/                   # Zero-dependency, pure TypeScript GameEngine wrapping chess.js
│   │   ├── src/
│   │   │   ├── GameEngine.ts         # Core engine class
│   │   │   ├── notation.ts           # SAN disambiguation, UCI, Figurine notation
│   │   │   ├── fen.ts                # FEN validation and parsing with human-readable errors
│   │   │   ├── pgn.ts                # PGN parser/serializer (headers, NAGs, comments, clocks, evals)
│   │   │   ├── draw-rules.ts         # Threefold, 50-move, insufficient material detection
│   │   │   ├── clock-math.ts         # Timestamp-based clock delta, increment, delay
│   │   │   ├── opening-book.ts       # ECO opening classifier
│   │   │   ├── types.ts              # GameState, MoveResult, DrawReason, TerminationReason
│   │   │   └── index.ts
│   │   └── tests/                    # ≥150 unit tests + Perft suite (start, Kiwipete, pos 3-6)
│   └── shared/                       # Shared schemas, DTOs, WebSocket protocol types, constants
│       └── src/
│           ├── ws-protocol.ts        # Zod schemas for all client/server WS messages
│           ├── models.ts             # UserProfile, GameRecord, RatingCategory, TimeControl
│           └── index.ts
├── supabase/
│   ├── migrations/                   # SQL migrations with RLS enabled on all tables
│   └── seed/                         # Puzzles, ECO openings, achievements
├── e2e/                              # Playwright end-to-end tests
├── docs/                             # Architecture, Decisions, Design, Credits, Verification, Plan
├── .env.example
├── README.md
└── package.json                      # Root workspace configuration
```

---

## 4. Key Engineering Risks & Mitigation Strategies
1. **Stockfish WASM Headers & SharedArrayBuffer**:
   - *Risk*: Multi-threaded Stockfish requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. If COOP/COEP headers are missing, multi-threaded WASM fails.
   - *Mitigation*: Default to the single-threaded Stockfish NNUE "lite" build for universal compatibility. Only attempt multi-threaded worker when `window.crossOriginIsolated` is strictly true. Configure Vite dev server headers and production headers accordingly.
2. **GPL-3.0 Licensing Compliance**:
   - *Risk*: Stockfish is GPL-3.0. Linking or bundling GPL code directly into proprietary application code can cause license taint.
   - *Mitigation*: Keep Stockfish strictly isolated as an external Web Worker script communicating purely through standard UCI text protocol across the Worker postMessage boundary. Provide clear license notices and source code links in `docs/CREDITS.md` and `LICENSE-NOTES.md`.
3. **Clock Authority & Network Drift**:
   - *Risk*: Client setInterval clocks drift, especially when tabs are backgrounded or network latency fluctuates.
   - *Mitigation*: Use performance.now() and server-authoritative timestamps for every move. Clocks compute elapsed delta on move submission. Server enforces flag falls with server-side timers and a capped lag allowance (e.g. max 200ms).
4. **Mobile Pointer & Drag Performance**:
   - *Risk*: Default browser scrolling/gestures interfere with piece dragging; rerendering the whole board on pointermove causes stutter.
   - *Mitigation*: Use CSS `touch-action: none` on the board container. Implement a dedicated top-level `DragLayer` that translates a floating piece transform using hardware-accelerated CSS transforms (`translate3d`), leaving the 64 square components un-rendered during drag.
5. **Illegal Moves & Game Desync**:
   - *Risk*: Out-of-sync moves in engine or online play could corrupt game state.
   - *Mitigation*: Double-layer validation. Every engine or opponent move is validated against `GameEngine.legalMoves()` before execution. If validation fails, state is rejected, logged, and resynchronized from the authoritative FEN snapshot.

---

## 5. Phase Checklist & Milestones
- [ ] **Phase 0 — Discovery & Setup**: Monorepo scaffolding, TypeScript strict, Tailwind tokens, Vite config, Vitest, ESLint, Prettier, CI scripts.
- [ ] **Phase 1 — Chess Core (`packages/chess-core`)**: `GameEngine` wrapping `chess.js`, pure TS, FEN/PGN parser & serializer, draw rules, clock math, Perft suite, ≥150 unit tests.
- [ ] **Phase 2 — Playable MVP (Local PvP)**: Custom SVG/DOM Board, drag-and-drop + click-to-move, legal move indicators, last move/check pulse, promotion dialog, move list navigation, captured pieces, sound manager, 3 board themes + 2 piece sets, responsive layout, local storage auto-save.
- [ ] **Phase 3 — Computer Opponent & Clocks**: Stockfish Web Worker client, UCI queue, difficulty presets (400 to 2600+), blunder modeling, thinking delay, eval bar, top lines, hints, time controls (Bullet, Blitz, Rapid, Classical, Custom), flag fall detection, board editor & practice drills.
- [ ] **Phase 4 — Analysis & Annotations**: Analysis mode, full-game engine evaluation, eval graph, move quality classification (Brilliant to Blunder), accuracy %, branching variations, NAGs, comments, right-click arrows/highlights, PGN export with annotations.
- [ ] **Phase 5 — Accounts, Ratings, History, Stats**: Supabase auth, guest mode, user profiles, Glicko-2 rating engine (server-side with pure unit tests), game history, opening ECO tagging, stats & heatmap, achievements engine with idempotent evaluators, leaderboards.
- [ ] **Phase 6 — Online Multiplayer**: Fastify + WebSocket server, Zod message validation, matchmaking queue with rating windows, private rooms with invite links, authoritative clock management, reconnection & state sync, chat with moderation.
- [ ] **Phase 7 — Puzzles, Daily Challenge, Opening Explorer**: Lichess CC0 puzzle database seed & solver, daily puzzle with streaks, ECO opening database tree with win rates and quiz mode.
- [ ] **Phase 8 — Hardening & Release**: Accessibility audit (keyboard navigation, ARIA labels, contrast AA), Lighthouse score optimization (≥90 perf, ≥95 a11y), PWA manifest/service worker, comprehensive security review, full checklist verification report.

