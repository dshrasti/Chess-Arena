# Architecture Decision Records (ADR) — Chess Arena

## ADR-001: Monorepo Structure & Package Boundaries
- **Date**: 2026-11-02
- **Context**: The product consists of a high-performance React web client, a Node.js WebSocket/HTTP game server, and shared chess domain logic and schemas.
- **Decision**: Adopt an npm workspace monorepo with `apps/web`, `apps/server`, `packages/chess-core`, and `packages/shared`.
- **Consequences**:
  - `packages/chess-core` has zero DOM/React/Node dependencies, ensuring it can run identically in browser, worker, server, and unit test environments.
  - `packages/shared` acts as the single contract for WebSocket messages (Zod validated) and data transfer objects.
  - No duplicated types or logic between frontend and backend.

## ADR-002: Chess Core Wrapper over chess.js
- **Date**: 2026-11-02
- **Context**: We need complete control over move generation, history traversal, branching, SAN disambiguation, and custom events, without coupling our application code directly to any third-party chess library API.
- **Decision**: Encapsulate `chess.js` inside a custom `GameEngine` class exposing a strictly typed, immutable/event-driven API.
- **Consequences**:
  - The UI and server interact solely with `GameEngine`.
  - Simplifies testing, mock substitution, and future engine enhancements (e.g. Chess960 support) without touching UI components.

## ADR-003: Stockfish Loading & Worker Architecture
- **Date**: 2026-11-02
- **Context**: Modern Stockfish WASM builds offer multi-threading (via SharedArrayBuffer) but require specific COOP/COEP HTTP headers which can break third-party iframes or CDNs if not configured. Furthermore, Stockfish is licensed under GPL-3.0.
- **Decision**:
  1. License isolation: Run Stockfish as a standalone Web Worker using standard UCI text protocol across `postMessage()`. No proprietary code links directly to Stockfish internals.
  2. Compatibility: Load single-threaded NNUE "lite" build by default; detect `window.crossOriginIsolated` before initiating multi-threaded worker pools.
  3. Queued UCI client: Implement a strict serial UCI queue with command IDs and cancellation on user move/undo to prevent stale search race conditions.

## ADR-004: Board Interaction Model & Drag Performance
- **Date**: 2026-11-02
- **Context**: Chess players demand snappy, sub-100ms interactions on both desktop and touch devices. Rerendering an 8x8 grid on pointer move causes frame drops on mobile.
- **Decision**:
  - Use unified Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`).
  - Decouple the dragging piece from the board grid: the board squares stay static, and a floating `<DragLayer />` renders only the active dragged piece using GPU-accelerated CSS `transform: translate3d(...)`.
  - Provide full click-to-move support and keyboard accessibility (arrow navigation, Enter to pick/place).

## ADR-005: Server-Authoritative Clock & Game State
- **Date**: 2026-11-02
- **Context**: Client timers drift when tabs are backgrounded or throttled by operating systems. In online play, players could tamper with client clocks.
- **Decision**:
  - The server holds the canonical clock state using high-resolution monotonic timestamps (`performance.now()` / server epoch).
  - Time elapsed is calculated on the server upon receipt of each move, factoring in a capped network latency allowance (max 200ms).
  - The client runs a display-only interpolation clock synchronized to server timestamps on every state broadcast.

## ADR-006: Computer Opponent & Stockfish 19 Web Worker Engine
- **Date**: 2026-11-19
- **Context**: The Computer Bot feature previously only contained mockup bot definitions with zero move calculation logic. We needed a fully functional, responsive, non-blocking computer opponent capable of playing as either color across 4 distinct difficulty tiers (Easy, Medium, Hard, Expert).
- **Decision**:
  1. Engine Asset Deployment: Packaged official Stockfish 19 single-threaded NNUE WASM binary (`stockfish.wasm`, ~1.8MB) and glue loader (`stockfish.js`) into `apps/web/public/`, paired with pure ASM-JS fallback (`stockfish-asm.js`).
  2. Single-Threaded Lite Advantage: Eliminates any strict COOP/COEP or SharedArrayBuffer dependencies while preserving high-speed neural network evaluation and UCI standard communication.
  3. Strict Legality Verification: Every UCI move candidate returned by the engine is re-validated through `GameEngine.legalMoves()` before executing to ensure 100% legal moves under all FIDE conditions.
  4. Reactive Board Locking & UX: While the computer calculates, pointer events are blocked (`isHumanTurn = false`), square cursor displays `cursor-wait`, opponent card displays pulsating `Thinking...`, and engine telemetry shows real-time search depth.
  5. Color Reversal Automation: When a player challenges a bot as Black, board flips automatically and the engine automatically triggers move 1 without requiring any user input.
  6. Memory Management: Active searches are halted (`stop`) on undo/resign/restart/tab navigation, and worker instances terminate cleanly on unmount.

