// FILE: src/jobs/scheduleDailyEmail.ts
import { notificationQueue, DAILY_EMAIL_JOB } from '../queues/notification.queue';

export function scheduleDailyEmail() {
  const FIVE_MINUTES = 5 * 60 * 1000;

  // Start first run after 5 minutes (so app can fully boot)
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
    }, FIVE_MINUTES);

  }, FIVE_MINUTES);

  console.log('[Jobs] Daily email scheduler initialized for every 5 minutes');
}
