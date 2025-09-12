// FILE: src/jobs/scheduleDailyEmail.ts
import { notificationQueue, DAILY_EMAIL_JOB } from '../queues/notification.queue';

export function scheduleDailyEmail() {
  const HOURS_TWETNYTHREE = 23 * 60 * 60 * 1000;


  setTimeout(async () => {
    try {
      await notificationQueue.add(DAILY_EMAIL_JOB, {}, { removeOnComplete: true, removeOnFail: 100 }); // [CHANGED]
      console.log('[Jobs] DAILY_EMAIL_JOB enqueued (initial)');
    } catch (err: any) {
      console.error('[Jobs] Failed to enqueue initial DAILY_EMAIL_JOB', { message: err?.message });
    }

    // Repeat every 5 minutes
    setInterval(async () => {
      try {
        await notificationQueue.add(DAILY_EMAIL_JOB, {}, { removeOnComplete: true, removeOnFail: 100 });
        console.log('[Jobs] DAILY_EMAIL_JOB enqueued (repeat)');
      } catch (err: any) {
        console.error('[Jobs] Failed to enqueue repeat DAILY_EMAIL_JOB', { message: err?.message });
      }
    }, HOURS_TWETNYTHREE );

  },HOURS_TWETNYTHREE );

  console.log('[Jobs] Daily email scheduler initialized for every 23 HOUR');
}
