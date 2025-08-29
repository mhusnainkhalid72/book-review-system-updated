// FILE: src/jobs/scheduleHotBooks.ts
// [NEW] Cron scheduler — registers hourly job (env-guarded).
import { leaderboardQueue, HOT_BOOKS_JOB } from '../queues/hotBooks.queue';

export async function scheduleHotBooks() {
  // ✅ Your requested env toggle:
  if (process.env.ENABLE_HOTBOOKS_CRON === '0') return;

  // top of every hour (00 minutes)
  await leaderboardQueue.add(
    HOT_BOOKS_JOB,
    {}, // no payload; worker computes everything
    {
      repeat: { pattern: '0 * * * *' }, // <-- FIX: BullMQ uses `pattern`
      removeOnComplete: true,
      removeOnFail: true,
      jobId: `${HOT_BOOKS_JOB}-hourly`, // idempotent
    }
  );
}
