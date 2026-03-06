import { describe, it, expect } from 'vitest';
import { zoneDisplayName, mixHex } from '../scripts/game-utils.js';

describe('zoneDisplayName', () => {
  it('returns empty string for null/undefined', () => {
    expect(zoneDisplayName(null)).toBe('');
    expect(zoneDisplayName(undefined)).toBe('');
  });

  it('trims whitespace', () => {
    expect(zoneDisplayName('  THE DARK STREETS  ')).toBe('THE DARK STREETS');
  });

  it('strips Unicode location pin (U+1F4CD)', () => {
    expect(zoneDisplayName('\u{1F4CD} BERLIN')).toBe('BERLIN');
    expect(zoneDisplayName('THE \u{1F4CD} CAVE')).toBe('THE  CAVE');
  });

  it('returns name unchanged when no pin or extra spaces', () => {
    expect(zoneDisplayName('THE HAUNTED CAVE OF OAHU')).toBe('THE HAUNTED CAVE OF OAHU');
  });
});

describe('mixHex', () => {
  it('returns first color at t=0', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixHex('#ff0000', '#00ff00', 0)).toBe('#ff0000');
  });

  it('returns second color at t=1', () => {
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mixHex('#ff0000', '#00ff00', 1)).toBe('#00ff00');
  });

  it('returns midpoint at t=0.5', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixHex('#ff0000', '#0000ff', 0.5)).toBe('#800080');
  });

  it('clamps components to 0-255', () => {
    const result = mixHex('#000000', '#ffffff', 1.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    expect(parseInt(result.slice(1, 3), 16)).toBeLessThanOrEqual(255);
  });

  it('produces valid hex strings', () => {
    expect(mixHex('#1a0028', '#2d2d2d', 0.35)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
