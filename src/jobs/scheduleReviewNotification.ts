// FILE: src/jobs/scheduleReviewNotification.ts
import { notificationQueue, PUSH_JOB } from '../queues/notification.queue';

export async function scheduleReviewNotification(userId: string, bookId: string, reviewerName: string) {
  try {
    await notificationQueue.add(
      PUSH_JOB,
      { userId, message: `Your book got a new review by ${reviewerName}!`, bookId },
    );
  } catch (err: any) {
    console.error('[scheduleReviewNotification] failed to enqueue', { message: err?.message });
  }
}
