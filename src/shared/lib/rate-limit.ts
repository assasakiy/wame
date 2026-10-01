import { AppError } from "@/shared/lib/http";

type Bucket = { count: number; resetAt: number };
const g = globalThis as typeof globalThis & { __wameRate?: Map<string, Bucket> };
const buckets = (g.__wameRate ??= new Map<string, Bucket>());

/** Fixed-window in-memory limiter. Swap for Redis when running multiple instances. */
export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new AppError(`Rate limit exceeded. Retry in ${Math.ceil((bucket.resetAt - now) / 1000)}s`, 429, "rate_limited");
  }
}
