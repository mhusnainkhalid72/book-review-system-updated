import { Request, Response } from 'express';
import { ReviewService } from '../services/ReviewService';
import RedisClient from '../lib/RedisClient';

export class ReviewController {
  constructor(private reviews: ReviewService) {}

  create = async (_req: Request, res: Response) => {
    const user = res.locals.user;
    const dto = res.locals.validated;
    const review = await this.reviews.create(user.id, dto);
    // invalidate book lists because average changes
    const redis = RedisClient.getInstance();
    await redis.del('books:recent', 'books:high', 'books:low');
    res.status(201).json({ success: true, data: review });
  };

  getById = async (req: Request, res: Response) => {
    const review = await this.reviews.getById(req.params.id);
    res.json({ success: true, data: review });
  };
getByBookId = async (req: Request, res: Response) => {
  const reviews = await this.reviews.getByBookId(req.params.bookId);
  res.json({ success: true, data: reviews });
};

  update = async (req: Request, res: Response) => {
    const user = res.locals.user;
    const dto = res.locals.validated;
    const review = await this.reviews.update(user.id, req.params.id, dto);
    const redis = RedisClient.getInstance();
    await redis.del('books:recent', 'books:high', 'books:low');
    res.json({ success: true, data: review });
  };

  remove = async (req: Request, res: Response) => {
    const user = res.locals.user;
    await this.reviews.delete(user.id, req.params.id);
    const redis = RedisClient.getInstance();
    await redis.del('books:recent', 'books:high', 'books:low');
    res.status(204).send();
  };
}
