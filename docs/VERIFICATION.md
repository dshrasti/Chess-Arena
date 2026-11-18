# Verification & Compliance Log — Chess Arena

## 1. Automated Test Suites Status
| Suite | Target | Status | Passing Tests | Notes |
|---|---|---|---|---|
| `packages/chess-core` | Rules, Perft, FEN, PGN, Draws | PENDING | 0 / 150+ | Phase 1 target |
| `packages/shared` | Zod validation schemas | PENDING | - | Phase 1 target |
| `apps/web` Unit/Component | Board, Clocks, Engine Client | PENDING | - | Phase 2–4 target |
| `apps/server` | Glicko-2, Matchmaking, Clocks | PENDING | - | Phase 5–6 target |
| `e2e` Playwright | 2-player multiplayer, game flow | PENDING | - | Phase 6 target |

## 2. Controls Verification Matrix
| UI Control / Feature | Expected Behavior | Phase Verified | Result | Date |
|---|---|---|---|---|
| Board Click-to-Move | Selecting piece highlights legal moves; click destination completes move | Phase 2 | PENDING | - |
| Board Drag-and-Drop | Smooth ghost-piece drag, snaps to target, cancels on Esc/right click | Phase 2 | PENDING | - |
| Promotion Dialog | Popover appears on 8th/1st rank pawn advance; cancels cleanly | Phase 2 | PENDING | - |
| Board Flip (Button + 'F')| Rotates perspective 180 degrees; coordinates update cleanly | Phase 2 | PENDING | - |
| Move Navigation Controls| Jump first, prev, next, last; board becomes read-only with return button | Phase 2 | PENDING | - |
| Resign Game | Shows confirmation dialog; grants win to opponent upon confirmation | Phase 2 | PENDING | - |
| Draw Offer / Claim | Allows threefold or 50-move claim when eligible | Phase 2 | PENDING | - |
| Reset / New Game | Resets board and clock state | Phase 2 | PENDING | - |
| PGN / FEN Import/Export | Exports valid FEN/PGN string and downloads file; imports cleanly | Phase 2 | PENDING | - |
| Theme Selector | Changes board and piece theme instantly without reload | Phase 2 | PENDING | - |
| Sound Toggle & Volume | Plays move/capture/check sounds; respects mute switch | Phase 2 | PENDING | - |
| Engine Difficulty Preset | Adjusts depth, blunder rate, and Elo limits appropriately | Phase 3 | PENDING | - |
| Engine Hint / Best Move | Draws arrow indicating best move from engine evaluation | Phase 3 | PENDING | - |
| Full-Game Analysis | Computes accuracy, move classifications, and generates graph | Phase 4 | PENDING | - |

## 3. Phase Completion Sign-Offs
- [ ] Phase 0: Scaffolding, tooling, typecheck, lint, build baseline
- [ ] Phase 1: Chess core library with 150+ unit tests & Perft validation
- [ ] Phase 2: Fully playable local MVP with board, clocks, themes, sounds, PGN
- [ ] Phase 3: Stockfish computer opponent with difficulty levels & practice mode
- [ ] Phase 4: Analysis screen, eval graph, move quality classification
- [ ] Phase 5: Supabase accounts, Glicko-2 ratings, history, stats, achievements
- [ ] Phase 6: WebSocket server, matchmaking, real-time multiplayer E2E
- [ ] Phase 7: Puzzles, daily challenge, opening explorer
- [ ] Phase 8: Hardening, a11y, PWA, full verification pass

