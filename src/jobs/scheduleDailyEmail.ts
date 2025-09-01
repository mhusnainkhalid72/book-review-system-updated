// ./jobs/scheduleDailyEmail.ts
import { notificationQueue, DAILY_EMAIL_JOB } from '../queues/notification.queue';

export function scheduleDailyEmail() {
  const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Run first job after 5 minutes
  setTimeout(() => {
    notificationQueue.add(DAILY_EMAIL_JOB, {}); // job data empty, worker handles all users

    // Repeat every 5 minutes
    setInterval(() => {
      notificationQueue.add(DAILY_EMAIL_JOB, {});
    }, FIVE_MINUTES);

  }, FIVE_MINUTES);

  console.log('[Jobs] Daily email scheduler initialized for every 5 minutes');
}
