// FILE: src/jobs/scheduleReviewNotification.ts
import { notificationQueue, PUSH_JOB } from '../queues/notification.queue';

export async function scheduleReviewNotification(userId: string, bookId: string, reviewerName: string) {
  try {
    await notificationQueue.add(
      PUSH_JOB,
      { userId, message: `Your book got a new review by ${reviewerName}!`, bookId }, // [CHANGED] carry bookId for context if needed
      { delay: 5 * 60 * 1000, removeOnComplete: true, removeOnFail: 50 } // [CHANGED]
    );
  } catch (err: any) {
    console.error('[scheduleReviewNotification] failed to enqueue', { message: err?.message });
  }
}
