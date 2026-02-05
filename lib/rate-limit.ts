const bucket = new Map<string, { count: number; reset: number }>();

export function limit(key: string, max = 30, windowMs = 60_000) {
  const now = Date.now();
  const current = bucket.get(key);
  if (!current || current.reset < now) {
    bucket.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= max) return false;
  current.count++;
  return true;
}
