// FILE: src/cache/cache.metrics.ts

type MetricEvent = 'hit' | 'miss' | 'set' | 'del' | 'error';

export function cacheMetric(ev: MetricEvent, key: string, extra?: Record<string, any>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ev, key, ...extra });
  // eslint-disable-next-line no-console
  console.log(`[cache] ${line}`);
}
