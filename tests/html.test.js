import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(join(__dirname, '..', 'index.html'), 'utf-8');

describe('index.html', () => {
  it('loads without throwing when parsed', () => {
    const dom = new JSDOM(indexHtml);
    expect(dom.window.document).toBeDefined();
  });

  it('has game canvas', () => {
    const dom = new JSDOM(indexHtml);
    const canvas = dom.window.document.getElementById('game');
    expect(canvas).not.toBeNull();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('has minimap canvas', () => {
    const dom = new JSDOM(indexHtml);
    const minimap = dom.window.document.getElementById('minimap');
    expect(minimap).not.toBeNull();
    expect(minimap.getAttribute('width')).toBe('120');
    expect(minimap.getAttribute('height')).toBe('80');
  });

  it('includes config and game script', () => {
    expect(indexHtml).toContain('config.js');
    expect(indexHtml).toContain('scripts/game.js');
  });

  it('game script is loaded as module', () => {
    expect(indexHtml).toMatch(/type="module".*scripts\/game\.js|scripts\/game\.js.*type="module"/);
  });

  it('has overlay and start button', () => {
    const dom = new JSDOM(indexHtml);
    expect(dom.window.document.getElementById('overlay')).not.toBeNull();
    expect(dom.window.document.getElementById('startBtn')).not.toBeNull();
  });

  it('links global.css', () => {
    expect(indexHtml).toContain('styles/global.css');
  });
});
