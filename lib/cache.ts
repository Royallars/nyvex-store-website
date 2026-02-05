import Redis from 'ioredis';

let redis: Redis | null = null;
const mem = new Map<string, { value: string; expires: number }>();

function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!redis) redis = new Redis(process.env.REDIS_URL);
  return redis;
}

export async function cacheSet(key: string, value: string, ttlSec: number) {
  const r = getRedis();
  if (r) return r.set(key, value, 'EX', ttlSec);
  mem.set(key, { value, expires: Date.now() + ttlSec * 1000 });
}

export async function cacheGet(key: string) {
  const r = getRedis();
  if (r) return r.get(key);
  const found = mem.get(key);
  if (!found || found.expires < Date.now()) return null;
  return found.value;
}
