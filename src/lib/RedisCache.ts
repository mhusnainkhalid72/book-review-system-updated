// FILE: src/lib/RedisCache.ts

import RedisClient from './RedisClient';
import { cacheMetric } from '../cache/cache.metrics';

export class RedisCache {
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const client = RedisClient.getInstance();
      const raw = await client.get(key);
      if (!raw) { cacheMetric('miss', key); return null; }
      cacheMetric('hit', key, { size: raw.length });
      return JSON.parse(raw) as T;
    } catch (err: any) {
      cacheMetric('error', key, { msg: err?.message });
      return null; 
    }
  }

  static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const client = RedisClient.getInstance();
      const str = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, str, 'EX', ttlSeconds);
      } else {
        await client.set(key, str);
      }
      cacheMetric('set', key, { ttl: ttlSeconds, size: str.length });
    } catch (err: any) {
      cacheMetric('error', key, { msg: err?.message });
    }
  }

 
  static async del(keyOrPattern: string): Promise<void> {
    try {
      const client = RedisClient.getInstance();
      if (keyOrPattern.includes('*')) {
        const stream = client.scanStream({ match: keyOrPattern, count: 200 });
        const keys: string[] = [];
        for await (const chunk of stream) keys.push(...chunk);
        if (keys.length) await client.del(...keys);
        cacheMetric('del', keyOrPattern, { count: keys.length, pattern: true });
      } else {
        await client.del(keyOrPattern);
        cacheMetric('del', keyOrPattern);
      }
    } catch (err: any) {
      cacheMetric('error', keyOrPattern, { msg: err?.message });
    }
  }


  static async wrap<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;
    const fresh = await loader();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
