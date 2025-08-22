import { Request, Response } from 'express';
import { BookService } from '../services/BookService';
import RedisClient from '../lib/RedisClient';

export class BookController {
  constructor(private books: BookService) {}

  create = async (req: Request, res: Response) => {
    const user = res.locals.user;
    const dto = res.locals.validated;
    const book = await this.books.create(user.id, dto);
    // invalidate cached lists
    const redis = RedisClient.getInstance();
    await redis.del('books:recent', 'books:high', 'books:low');
    res.status(201).json({ success: true, data: book });
  };

  update = async (req: Request, res: Response) => {
    const user = res.locals.user;
    const dto = res.locals.validated;
    const updated = await this.books.update(user.id, req.params.id, dto);
    const redis = RedisClient.getInstance();
    await redis.del('books:recent', 'books:high', 'books:low');
    res.json({ success: true, data: updated });
  };

  remove = async (req: Request, res: Response) => {
    const user = res.locals.user;
    await this.books.delete(user.id, req.params.id);
    const redis = RedisClient.getInstance();
    await redis.del('books:recent', 'books:high', 'books:low');
    res.status(204).send();
  };

  mine = async (_req: Request, res: Response) => {
    const user = res.locals.user;
    const result = await this.books.mine(user.id);
    res.json({ success: true, data: result });
  };

  list = async (req: Request, res: Response) => {
    const sort = (req.query.sort as 'recent' | 'high' | 'low') || 'recent';
    const redis = RedisClient.getInstance();
    const cacheKey = `books:${sort}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const result = await this.books.listAll(sort);
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60); // 1 min cache
    res.json({ success: true, data: result, cached: false });
  };
}
