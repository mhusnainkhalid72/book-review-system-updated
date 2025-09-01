import { Queue } from 'bullmq';
import RedisClient from '../lib/RedisClient';

const connection = (RedisClient.getInstance() as any).options;

export const notificationQueue = new Queue('notifications', { connection });

// Job names
export const PUSH_JOB = 'push-notification';
export const DAILY_EMAIL_JOB = 'daily-email';
