import { kv } from '@vercel/kv';

const KEY = 'sidequest:scores';
const TOP_N = 10;
const NAME_MAX_LEN = 32;
const DEFAULT_NAME = 'Anonymous';

function sanitizeName(name) {
  if (typeof name !== 'string') return DEFAULT_NAME;
  const t = name.trim().slice(0, NAME_MAX_LEN);
  return t || DEFAULT_NAME;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      const members = await kv.zrange(KEY, 0, TOP_N - 1, { rev: true });
      const scores = (members || []).map((m) => {
        try {
          const o = typeof m === 'string' ? JSON.parse(m) : m;
          return { name: o.n || '?', score: Number(o.s) || 0 };
        } catch {
          return { name: '?', score: 0 };
        }
      });
      return res.status(200).json({ scores });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const score = Math.max(0, Math.floor(Number(body.score)) || 0);
      const name = sanitizeName(body.name);
      const member = JSON.stringify({ n: name, s: score, id: Date.now() });
      await kv.zadd(KEY, { score, member });
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    console.error('scores api', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
