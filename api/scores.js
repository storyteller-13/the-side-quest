const KEY = 'sidequest:scores';
const TOP_N = 10;
const NAME_MAX_LEN = 32;
const DEFAULT_NAME = 'Anonymous';

function hasKvEnv() {
  return (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) || process.env.REDIS_URL;
}

export function sanitizeName(name) {
  if (typeof name !== 'string') return DEFAULT_NAME;
  const t = name.trim().slice(0, NAME_MAX_LEN);
  return t || DEFAULT_NAME;
}

async function getKv() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    return {
      zrange: (k, start, stop, opts) => kv.zrange(k, start, stop, opts),
      zadd: (k, opts) => kv.zadd(k, opts)
    };
  }
  if (process.env.REDIS_URL) {
    const { createClient } = await import('redis');
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    return {
      zrange: async (k, start, stop, opts) => {
        const rev = opts && opts.rev;
        const list = await client.zRange(k, start, stop, rev ? { REV: true } : {});
        return list;
      },
      zadd: async (k, opts) => {
        await client.zAdd(k, [{ score: opts.score, value: opts.member }]);
      }
    };
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasKvEnv()) {
    if (req.method === 'GET') return res.status(200).json({ scores: [] });
    return res.status(503).json({ error: 'Scores unavailable: set KV_REST_API_URL and KV_REST_API_TOKEN, or REDIS_URL in .env.local' });
  }

  const kv = await getKv();
  if (!kv) {
    if (req.method === 'GET') return res.status(200).json({ scores: [] });
    return res.status(503).json({ error: 'Scores unavailable' });
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
