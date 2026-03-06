/**
 * Pure game helpers (testable without DOM).
 */

export function zoneDisplayName(name) {
  return (name || '').replace(/\u{1F4CD}/gu, '').trim();
}

export function mixHex(hex1, hex2, t) {
  const parse = (h) => ({
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  });
  const a = parse(hex1);
  const b = parse(hex2);
  const r = Math.round(a.r * (1 - t) + b.r * t);
  const g = Math.round(a.g * (1 - t) + b.g * t);
  const b_ = Math.round(a.b * (1 - t) + b.b * t);
  return (
    '#' +
    [r, g, b_]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
      .join('')
  );
}
