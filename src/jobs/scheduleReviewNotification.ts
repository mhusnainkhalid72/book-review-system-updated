import { notificationQueue, PUSH_JOB } from '../queues/notification.queue';

export async function scheduleReviewNotification(userId: string, bookId: string, reviewerName: string) {
  await notificationQueue.add(
    PUSH_JOB,
    { userId, message: `Your book got a new review by ${reviewerName}!` },
    { delay: 5 * 60 * 1000 } // 5 minutes delay
  );
}
