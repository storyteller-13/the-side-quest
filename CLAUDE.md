# The Side Quest

Single-file HTML5 canvas game. All code lives in `index.html`.

## Running

```
make serve   # http://localhost:8044
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

Everything is in `index.html`:
- Constants / canvas setup
- Map generation (tile-based grid: roads, walls, castle)
- Entity logic: player, monsters (5 types), prince, projectiles, particles
- Rendering: tiles, characters, HUD, minimap
- Game loop: `requestAnimationFrame`
