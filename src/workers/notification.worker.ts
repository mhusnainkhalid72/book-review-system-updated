import { Worker, Job } from 'bullmq';
import RedisClient from '../lib/RedisClient';
import { notificationQueue, PUSH_JOB, DAILY_EMAIL_JOB } from '../queues/notification.queue';
import { NotificationService } from '../services/notification.service';

const connection = (RedisClient.getInstance() as any).options;

export const notificationWorker = new Worker(
  'notifications',
  async (job: Job) => {
    switch (job.name) {
      case PUSH_JOB:
        await NotificationService.sendPushNotification(job.data.userId, job.data.message);
        break;
      case DAILY_EMAIL_JOB:
        await NotificationService.sendDailyEmail(job.data.userId); // handles undefined userId
        break;
    }
  },
  { connection }
);

notificationWorker.on('completed', (job) => console.log(`[notifications] ${job.name} completed`));
notificationWorker.on('failed', (job, err) => console.error(`[notifications] ${job?.name} failed:`, err?.message));
