// FILE: src/controllers/BooksPopularityController.ts

import { Request, Response } from 'express';
import { BooksPopularityService } from '../services/BooksPopularityService';
import { RedisCache } from '../lib/RedisCache';
import { CacheKeys } from '../cache/cache.keys';
import { TTL } from '../cache/cache.ttl';
import { withJitter } from '../cache/cache.jitter';

export class BooksPopularityController {
  constructor(private service: BooksPopularityService) {}

  // GET /books/hot?category=&page=&limit=
  async hot(req: Request, res: Response) {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const category = (req.query.category as string) || undefined;
    const key = CacheKeys.hotBooks(page, limit, category);

    const data = await RedisCache.wrap(
      key,
      withJitter(TTL.HOT_BOOKS),
      () => this.service.computeHot(page, limit, category)
    );

    return res.json({ source: 'cache-or-db', data });
  }
}
