# The Side Quest (Codex Notes)

This file contains project guidance for Codex agents working in this repository.

## Quick start

```bash
make install
make server   # static app at http://localhost:8044
```

For local API + scores:

```bash
make dev      # runs via Vercel dev
```

## Security checklist for Codex changes

- Keep score APIs constrained to expected payload shapes (numeric score, bounded player name length).
- Never commit secrets (`.env.local`, KV tokens, API keys) or hardcode credentials in source.
- Prefer server-side validation in `api/scores.js` for all user-provided input.
- Avoid introducing dynamic code execution (`eval`, `Function`, or unsanitized HTML injection).
- If adding dependencies, choose actively maintained packages and run:

```bash
npm audit --omit=dev
```

## Tests

```bash
make test        # run unit tests
make coverage    # coverage report
make pre-commit  # test + coverage (same as pre-commit hook)
```

Tests live in `tests/` (Vitest): config shape and content, scores API (CORS, methods, no-KV behaviour, `sanitizeName`), game helpers (`zoneDisplayName`, `mixHex`), and index.html structure. A **pre-commit hook** (husky) runs tests and coverage on each commit; coverage thresholds in `vitest.config.js` must pass. Run `make pre-commit` for the same check without committing.

## Project layout

- `index.html` — app shell and script/style includes.
- `styles/global.css` — game and UI styling.
- `config.js` — user-facing text/config.
- `scripts/game.js` — gameplay loop and rendering.
- `scripts/game-utils.js` — pure helpers (mixHex, zoneDisplayName).
- `api/scores.js` — serverless leaderboard API.
- `tests/` — Vitest unit tests.
