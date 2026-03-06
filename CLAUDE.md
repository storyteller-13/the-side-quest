# The Side Quest

HTML5 canvas game with production-style layout: separate CSS, config, and scripts.

## Install

```bash
# Clone (or cd into project), then install Node deps
make install    # or: npm install
```

Optional (for local score API): install [Vercel CLI](https://vercel.com/docs/cli) and pull env for KV/Redis:

```bash
npm install -g vercel   # or use npx vercel
vercel link            # link this folder to a Vercel project
vercel env pull        # pull KV_REST_API_URL, KV_REST_API_TOKEN into .env.local
```

## Running

```bash
make server   # http://localhost:8044  (static only; no /api/scores)
```

To run with the score API locally:

```bash
make dev      # or: vercel dev  (serves app + api, uses .env.local)
```

## Game

Top-down GTA-style action game. The princess fights monsters to reach the prince.

**Controls**
- `WASD` / Arrow Keys — Move
- `Space` / Left Click — Melee attack
- `E` / Right Click — Boom attack (tap for quick shot, hold to charge)

**Boom attack**
- Tap: quick heart (35 dmg)
- Hold ~1s: charged gold heart (115 dmg, pierces up to 3 enemies)
- Ammo regenerates at +1 per 5 seconds (max 10)

## Deploy (Vercel + scores)

- `api/scores.js` — Serverless API: GET top 10 scores, POST to save (uses Vercel KV).
- In Vercel dashboard: add a KV/Redis store (Storage → KV, or Redis from Integrations/Marketplace) and link the project; env vars are set automatically.
- Deploy: `make deploy` or `npm run deploy` (uses Vercel CLI from `package.json` devDependencies).
- Local: `make server` has no API; use `make dev` (or `vercel dev`) and `vercel env pull` once to test scores locally.

## Structure

- `index.html` — Markup only; links to CSS, config, and script
- `styles/global.css` — All styles
- `config.js` — All user-facing text and content (zones, monster types, UI strings)
- `scripts/game.js` — Game logic: constants, audio, canvas, entities, rendering, game loop
