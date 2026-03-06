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

## Project layout

- `index.html` — app shell and script/style includes.
- `styles/global.css` — game and UI styling.
- `config.js` — user-facing text/config.
- `scripts/game.js` — gameplay loop and rendering.
- `api/scores.js` — serverless leaderboard API.
