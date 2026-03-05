# The Side Quest

HTML5 canvas game with production-style layout: separate CSS, config, and scripts.

## Running

```
make server   # http://localhost:8044
```

## Game

Top-down GTA-style action game. The princess fights monsters to reach the prince.

**Controls**
- `WASD` / Arrow Keys — Move
- `Space` / Left Click — Melee attack
- `E` / Right Click — Throw heart (tap for quick shot, hold to charge)

**Heart throw**
- Tap: quick heart (35 dmg)
- Hold ~1s: charged gold heart (115 dmg, pierces up to 3 enemies)
- Ammo regenerates at +1 per 5 seconds (max 10)

## Structure

- `index.html` — Markup only; links to CSS, config, and script
- `styles/style.css` — All styles
- `config.js` — All user-facing text and content (zones, monster types, UI strings)
- `scripts/game.js` — Game logic: constants, audio, canvas, entities, rendering, game loop
