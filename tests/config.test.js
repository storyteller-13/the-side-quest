import { describe, it, expect } from 'vitest';
import CONFIG from '../config.js';

describe('CONFIG', () => {
  describe('shape', () => {
    it('has required top-level keys', () => {
      expect(CONFIG).toHaveProperty('title');
      expect(CONFIG).toHaveProperty('overlayTitle');
      expect(CONFIG).toHaveProperty('subtitle');
      expect(CONFIG).toHaveProperty('startButton');
      expect(CONFIG).toHaveProperty('controls');
      expect(CONFIG).toHaveProperty('hud');
      expect(CONFIG).toHaveProperty('buttons');
      expect(CONFIG).toHaveProperty('messages');
      expect(CONFIG).toHaveProperty('cutscene');
      expect(CONFIG).toHaveProperty('death');
      expect(CONFIG).toHaveProperty('zones');
      expect(CONFIG).toHaveProperty('monsterTypes');
    });

    it('has non-empty title and overlay strings', () => {
      expect(typeof CONFIG.title).toBe('string');
      expect(CONFIG.title.length).toBeGreaterThan(0);
      expect(typeof CONFIG.overlayTitle).toBe('string');
      expect(CONFIG.overlayTitle.length).toBeGreaterThan(0);
    });

    it('controls is array of { keys, action }', () => {
      expect(Array.isArray(CONFIG.controls)).toBe(true);
      expect(CONFIG.controls.length).toBeGreaterThan(0);
      CONFIG.controls.forEach((c) => {
        expect(c).toHaveProperty('keys');
        expect(c).toHaveProperty('action');
      });
    });

    it('hud has required labels', () => {
      expect(CONFIG.hud).toHaveProperty('health');
      expect(CONFIG.hud).toHaveProperty('loveMeter');
      expect(CONFIG.hud).toHaveProperty('ammo');
      expect(CONFIG.hud).toHaveProperty('ammoFormat');
      expect(CONFIG.hud.ammoFormat).toContain('%d');
    });

    it('buttons has pause and resume', () => {
      expect(CONFIG.buttons).toHaveProperty('pause');
      expect(CONFIG.buttons).toHaveProperty('resume');
    });

    it('messages has required keys', () => {
      const required = ['reachMe', 'ranAway', 'entering', 'paused', 'pressResume', 'boom', 'heartPickup', 'fullHealth'];
      required.forEach((k) => expect(CONFIG.messages).toHaveProperty(k));
      expect(CONFIG.messages.entering).toContain('%s');
    });

    it('cutscene has required keys', () => {
      const required = ['finally', 'trueLove', 'winSubtitle', 'playAgain', 'supportWork', 'supportWorkUrl', 'saveScore', 'namePlaceholder', 'saveSuccess', 'saveFailed', 'leaderboardTitle', 'saveUnavailable'];
      required.forEach((k) => expect(CONFIG.cutscene).toHaveProperty(k));
    });

    it('death has title, subtitle, retry', () => {
      expect(CONFIG.death).toHaveProperty('title');
      expect(CONFIG.death).toHaveProperty('subtitle');
      expect(CONFIG.death).toHaveProperty('retry');
    });
  });

  describe('zones', () => {
    it('has 7 zones', () => {
      expect(Array.isArray(CONFIG.zones)).toBe(true);
      expect(CONFIG.zones).toHaveLength(7);
    });

    it('each zone has required fields', () => {
      const required = ['name', 'bg', 'mapEmoji', 'monsterCount', 'monsterSpeed', 'fleeSpeed', 'excuse', 'taunts'];
      CONFIG.zones.forEach((z, i) => {
        required.forEach((k) => expect(z, `zone ${i}`).toHaveProperty(k));
        expect(Array.isArray(z.mapEmoji)).toBe(true);
        expect(z.mapEmoji).toHaveLength(3);
        expect(Array.isArray(z.taunts)).toBe(true);
        expect(typeof z.monsterCount).toBe('number');
        expect(typeof z.monsterSpeed).toBe('number');
        expect(typeof z.fleeSpeed).toBe('number');
      });
    });

    it('last zone has fleeSpeed 0 (final)', () => {
      const last = CONFIG.zones[CONFIG.zones.length - 1];
      expect(last.fleeSpeed).toBe(0);
      expect(last.excuse).toBeNull();
    });

    it('zone bg values are hex colors', () => {
      CONFIG.zones.forEach((z) => {
        expect(z.bg).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('monsterTypes', () => {
    it('has at least one monster type', () => {
      expect(Array.isArray(CONFIG.monsterTypes)).toBe(true);
      expect(CONFIG.monsterTypes.length).toBeGreaterThanOrEqual(1);
    });

    it('each type has required fields', () => {
      const required = ['name', 'color', 'eyeColor', 'hp', 'speed', 'damage', 'size', 'loot'];
      CONFIG.monsterTypes.forEach((m, i) => {
        required.forEach((k) => expect(m, `monster ${i}`).toHaveProperty(k));
        expect(typeof m.hp).toBe('number');
        expect(typeof m.speed).toBe('number');
        expect(typeof m.damage).toBe('number');
        expect(typeof m.size).toBe('number');
        expect(typeof m.loot).toBe('number');
      });
    });

    it('colors are hex', () => {
      CONFIG.monsterTypes.forEach((m) => {
        expect(m.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(m.eyeColor).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });
});
