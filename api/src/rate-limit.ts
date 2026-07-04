const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function allow(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_PER_WINDOW) {
    hits.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(ip, timestamps);
  return true;
}
