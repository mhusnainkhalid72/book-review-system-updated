// FILE: src/queues/hotBooks.queue.ts
// [NEW] BullMQ queue setup for hot-books refresh jobs.
import { Queue } from 'bullmq';
import RedisClient from '../lib/RedisClient';

const connection = (RedisClient.getInstance() as any).options;

export const leaderboardQueue = new Queue('leaderboard', { connection });
export const HOT_BOOKS_JOB = 'refresh-hot-books';
