// FILE: src/middlewares/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import RedisClient from '../lib/RedisClient';

interface RateLimitOptions {
  keyPrefix: string;   // e.g., "reviews"
  limit: number;       // e.g., 5
  windowSeconds: number; // e.g., 3600
}

export const rateLimiter = ({ keyPrefix, limit, windowSeconds }: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const redis = RedisClient.getInstance();
      const key = `rate:user:${user.id}:${keyPrefix}`;

      // Increment the counter
      const current = await redis.incr(key);

      if (current === 1) {
        // First time, set TTL
        await redis.expire(key, windowSeconds);
      }

      if (current > limit) {
        return res.status(429).json({
          message: `Rate limit exceeded. Max ${limit} ${keyPrefix} per ${windowSeconds / 60} minutes.`,
        });
      }

      next();
    } catch (err: any) {
      console.error('RateLimiter Error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
