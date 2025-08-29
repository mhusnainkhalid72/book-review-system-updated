// FILE: src/cache/cache.jitter.ts
// [NEW] Add ±% jitter to prevent thundering herd on expiry.
export function withJitter(baseSeconds: number, percent = 0.15): number {
  const jitter = baseSeconds * percent;
  const min = Math.max(1, Math.floor(baseSeconds - jitter));
  const max = Math.floor(baseSeconds + jitter);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
