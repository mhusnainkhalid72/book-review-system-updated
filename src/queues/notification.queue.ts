// FILE: src/queues/notification.queue.ts
import 'dotenv/config';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';
import { NotificationService } from '../services/notification.service';

export const DAILY_EMAIL_JOB = 'daily-email';
export const PUSH_JOB = 'push-notification';

function buildRedisOptions(): RedisOptions {
  const common: Partial<RedisOptions> = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
  };

  if (process.env.REDIS_URL) {
    return common as RedisOptions;
  }

  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    ...common,
  } as RedisOptions;
}

function createRedis(): IORedis {
  const opts = buildRedisOptions();
  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL as string, opts);
  }
  return new IORedis(opts);
}

const queueConnection = createRedis();
const workerConnection = createRedis();
const eventsConnection = createRedis();

export const notificationQueue = new Queue('notification-queue', {
  connection: queueConnection,
});

const queueEvents = new QueueEvents('notification-queue', { connection: eventsConnection });
queueEvents.on('completed', ({ jobId }) => {
  console.log('[notification.queue] job completed', { jobId });
});
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error('[notification.queue] job failed', { jobId, failedReason });
});

new Worker(
  'notification-queue',
  async (job) => {
    try {
      switch (job.name) {
        case DAILY_EMAIL_JOB: {
          // Expect targeted payload; fallback to global only if explicitly desired
          const { userId, windowMinutes } = job.data || {};
          await NotificationService.sendDailyEmail(userId, windowMinutes ?? 10);
          return { ok: true };
        }
        case PUSH_JOB: {
          const { userId, message } = job.data || {};
          if (!userId || !message) throw new Error('PUSH_JOB missing userId or message');
          await NotificationService.sendPushNotification(userId, message);
          return { ok: true };
        }
        default:
          throw new Error(`Unknown job: ${job.name}`);
      }
    } catch (err: any) {
      console.error('[notification.worker] handler error', {
        name: job.name,
        id: job.id,
        message: err?.message,
        stack: err?.stack,
      });
      throw err;
    }
  },
  { connection: workerConnection }
);

// Helper to enqueue
export const enqueue = (name: string, data: any = {}, opts: JobsOptions = {}) =>
  notificationQueue.add(name, data, {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    ...opts,
  });
