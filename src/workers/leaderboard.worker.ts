// FILE: src/workers/leaderboard.worker.ts
// [NEW] Worker that processes the hourly job and warms the cache.
import { Worker } from 'bullmq';
import RedisClient from '../lib/RedisClient';
import { BooksPopularityService } from '../services/BooksPopularityService';
import { RedisCache } from '../lib/RedisCache';
import { CacheKeys } from '../cache/cache.keys';
import { TTL } from '../cache/cache.ttl';
import { HOT_BOOKS_JOB } from '../queues/hotBooks.queue';

const connection = (RedisClient.getInstance() as any).options;
const service = new BooksPopularityService();

// Decide how many pages & categories to precompute
const PAGES = [1, 2, 3];
const LIMIT = 10;
const CATEGORIES: (string | undefined)[] = [undefined]; // later: ['Sci-Fi','Fantasy']

export const leaderboardWorker = new Worker(
  'leaderboard',
  async (job) => {
    if (job.name !== HOT_BOOKS_JOB) return;

    for (const cat of CATEGORIES) {
      for (const page of PAGES) {
        const data = await service.computeHot(page, LIMIT, cat);
        const key = CacheKeys.hotBooks(page, LIMIT, cat);
        await RedisCache.set(key, data, TTL.HOT_BOOKS);
      }
    }
  },
  { connection }
);

// Optional logs
leaderboardWorker.on('completed', (job) => {
  console.log(`[worker] ${job.name} completed`);
});
leaderboardWorker.on('failed', (job, err) => {
  console.error(`[worker] ${job?.name} failed:`, err?.message);
});
