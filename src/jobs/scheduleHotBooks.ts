// FILE: src/jobs/scheduleHotBooks.ts

import { leaderboardQueue, HOT_BOOKS_JOB } from '../queues/hotBooks.queue';

export async function scheduleHotBooks() {

  if (process.env.ENABLE_HOTBOOKS_CRON === '0') return;

 
  await leaderboardQueue.add(
    HOT_BOOKS_JOB,
    {},
    {
      repeat: { pattern: '0 * * * *' }, 
      removeOnComplete: true,
      removeOnFail: true,
      jobId: `${HOT_BOOKS_JOB}-hourly`, 
    }
  );
}
