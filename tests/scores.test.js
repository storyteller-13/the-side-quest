import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../api/scores.js';
import { sanitizeName } from '../api/scores.js';

const mockZrange = vi.fn();
const mockZadd = vi.fn();

vi.mock('@vercel/kv', () => ({
  kv: {
    get zrange() { return mockZrange; },
    get zadd() { return mockZadd; },
  },
}));

const redisClient = {
  connect: vi.fn().mockResolvedValue(undefined),
  zRange: vi.fn().mockResolvedValue([]),
  zAdd: vi.fn().mockResolvedValue(undefined),
};
vi.mock('redis', () => ({
  createClient: () => redisClient,
}));

import { kv } from '@vercel/kv';

describe('sanitizeName', () => {
  it('returns default for non-string', () => {
    expect(sanitizeName(null)).toBe('Anonymous');
    expect(sanitizeName(undefined)).toBe('Anonymous');
    expect(sanitizeName(42)).toBe('Anonymous');
  });

  it('trims whitespace', () => {
    expect(sanitizeName('  Player  ')).toBe('Player');
  });

  it('truncates to 32 chars', () => {
    const long = 'a'.repeat(40);
    expect(sanitizeName(long)).toHaveLength(32);
    expect(sanitizeName(long)).toBe('a'.repeat(32));
  });

  it('returns Anonymous for empty or whitespace-only', () => {
    expect(sanitizeName('')).toBe('Anonymous');
    expect(sanitizeName('   ')).toBe('Anonymous');
  });

  it('keeps valid name unchanged when under 32 chars', () => {
    expect(sanitizeName('Princess')).toBe('Princess');
  });
});

function mockRes() {
  const res = {
    statusCode: 200,
    _headers: {},
    _body: null,
    setHeader(k, v) {
      this._headers[k] = v;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

describe('scores API handler', () => {
  let envBackup;

  beforeEach(() => {
    envBackup = { ...process.env };
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('sets CORS headers', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res._headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res._headers['Access-Control-Allow-Methods']).toContain('GET');
    expect(res._headers['Access-Control-Allow-Methods']).toContain('POST');
  });

  it('OPTIONS returns 204', async () => {
    const res = mockRes();
    await handler({ method: 'OPTIONS' }, res);
    expect(res.statusCode).toBe(204);
  });

  it('non-GET/POST returns 405', async () => {
    const res = mockRes();
    await handler({ method: 'PUT' }, res);
    expect(res.statusCode).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  it('GET without KV env returns 200 with empty scores', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body).toEqual({ scores: [] });
  });

  it('POST without KV env returns 503 with message', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'P', score: 100 } }, res);
    expect(res.statusCode).toBe(503);
    expect(res._body.error).toContain('Scores unavailable');
    expect(res._body.error).toMatch(/KV_REST_API|REDIS_URL/);
  });
});

describe('scores API handler with KV mocked', () => {
  let envBackup;

  beforeEach(() => {
    envBackup = { ...process.env };
    process.env.KV_REST_API_URL = 'https://test.kv';
    process.env.KV_REST_API_TOKEN = 'token';
    vi.mocked(kv.zrange).mockReset();
    vi.mocked(kv.zadd).mockReset();
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('GET returns 200 and parses score entries', async () => {
    vi.mocked(kv.zrange).mockResolvedValue([
      JSON.stringify({ n: 'Alice', s: 500 }),
      JSON.stringify({ n: 'Bob', s: 300 }),
    ]);
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body.scores).toEqual([
      { name: 'Alice', score: 500 },
      { name: 'Bob', score: 300 },
    ]);
  });

  it('GET returns ? and 0 for malformed members', async () => {
    vi.mocked(kv.zrange).mockResolvedValue(['not-json', JSON.stringify({})]);
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body.scores).toEqual([
      { name: '?', score: 0 },
      { name: '?', score: 0 },
    ]);
  });

  it('GET handles null/undefined members as empty array', async () => {
    vi.mocked(kv.zrange).mockResolvedValue(null);
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body.scores).toEqual([]);
  });

  it('POST returns 200 and ok true', async () => {
    vi.mocked(kv.zadd).mockResolvedValue(undefined);
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'Princess', score: 999 } }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body).toEqual({ ok: true });
  });

  it('POST parses string body', async () => {
    vi.mocked(kv.zadd).mockResolvedValue(undefined);
    const res = mockRes();
    await handler({
      method: 'POST',
      body: JSON.stringify({ name: 'Player', score: 100 }),
    }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body).toEqual({ ok: true });
  });

  it('POST clamps negative score to 0', async () => {
    vi.mocked(kv.zadd).mockResolvedValue(undefined);
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'P', score: -50 } }, res);
    expect(res.statusCode).toBe(200);
    const member = JSON.parse(vi.mocked(kv.zadd).mock.calls[0][1].member);
    expect(member.s).toBe(0);
  });

  it('POST uses sanitized name in stored member', async () => {
    vi.mocked(kv.zadd).mockResolvedValue(undefined);
    const res = mockRes();
    await handler({ method: 'POST', body: { name: '  LongName  ', score: 10 } }, res);
    expect(res.statusCode).toBe(200);
    const member = JSON.parse(vi.mocked(kv.zadd).mock.calls[0][1].member);
    expect(member.n).toBe('LongName');
  });

  it('GET when zrange throws returns 500', async () => {
    vi.mocked(kv.zrange).mockRejectedValue(new Error('kv error'));
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(500);
    expect(res._body).toEqual({ error: 'Server error' });
  });

  it('POST when zadd throws returns 500', async () => {
    vi.mocked(kv.zadd).mockRejectedValue(new Error('kv write error'));
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'P', score: 1 } }, res);
    expect(res.statusCode).toBe(500);
    expect(res._body).toEqual({ error: 'Server error' });
  });
});

describe('scores API handler with REDIS_URL mocked', () => {
  let envBackup;

  beforeEach(() => {
    envBackup = { ...process.env };
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.REDIS_URL = 'redis://localhost:6379';
    redisClient.zRange.mockReset();
    redisClient.zAdd.mockReset();
    redisClient.zRange.mockResolvedValue([]);
    redisClient.zAdd.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('GET uses redis client and returns scores', async () => {
    redisClient.zRange.mockResolvedValue([
      JSON.stringify({ n: 'RedisUser', s: 200 }),
    ]);
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body.scores).toEqual([{ name: 'RedisUser', score: 200 }]);
    expect(redisClient.zRange).toHaveBeenCalled();
  });

  it('POST uses redis client zAdd', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'R', score: 50 } }, res);
    expect(res.statusCode).toBe(200);
    expect(res._body).toEqual({ ok: true });
    expect(redisClient.zAdd).toHaveBeenCalled();
  });
});
