# Chess Arena

Chess Arena is a modern, high-performance, full-stack chess web application.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript (Strict), Tailwind CSS, Zustand, Lucide Icons
- **Chess Core**: Pure TypeScript engine (`@chess-arena/chess-core`) wrapping `chess.js`
- **Engine**: Stockfish WASM Web Worker with UCI queue and difficulty presets
- **Backend**: Fastify, WebSocket (`ws`), TypeScript, Pino logging
- **Database / Auth**: Supabase (PostgreSQL + Row-Level Security + Supabase Auth)
- **Testing**: Vitest, React Testing Library, Playwright E2E

## Getting Started

### Prerequisites
- Node.js 20+ (v22 recommended)
- npm 10+ or pnpm 9+

### Installation
```bash
npm install
```

### Development
Run the web application:
```bash
npm run dev
```

Run the game server:
```bash
npm run dev:server
```

### Quality & Testing
```bash
npm test         # Run unit and rules test suites
npm run typecheck # Strict TypeScript check
npm run lint      # ESLint validation
npm run build     # Production builds
```

## Documentation
- [docs/PLAN.md](docs/PLAN.md) — Master implementation plan and phase roadmap
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture, eval classification, Glicko-2
- [docs/DESIGN.md](docs/DESIGN.md) — Visual identity, design tokens, typography, theme sets
- [docs/DECISIONS.md](docs/DECISIONS.md) — Architectural decision records (ADRs)
- [docs/CREDITS.md](docs/CREDITS.md) — License attribution (Stockfish GPL-3.0, pieces, audio)
- [docs/VERIFICATION.md](docs/VERIFICATION.md) — Test results and verification checklist

