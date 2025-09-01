import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewRepository } from '../repositories/implementations/ReviewRepository';
import { BookRepository } from '../repositories/implementations/BookRepository';
import { ReviewService } from '../services/ReviewService';

import { validate } from '../middlewares/validationMiddleware';
import { CreateReviewDTOSchema } from '../dto/request/review/CreateReviewDTO';
import { UpdateReviewDTOSchema } from '../dto/request/review/UpdateReviewDTO';
import { asyncHandler } from '../lib/asyncHandler';
import { requireToken } from '../middlewares/requireToken';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = Router();

const reviewRepo = new ReviewRepository();
const bookRepo = new BookRepository();
const service = new ReviewService(reviewRepo, bookRepo);
const controller = new ReviewController(service);

const reviewRateLimit = rateLimiter({
  keyPrefix: 'reviews',
  limit: Number(process.env.REVIEW_RATE_LIMIT || 2),
  windowSeconds: Number(process.env.REVIEW_RATE_LIMIT_WINDOW || 600)
});


router.post('/', requireToken, reviewRateLimit, validate(CreateReviewDTOSchema), asyncHandler(controller.create.bind(controller)));
router.get('/book/:bookId', asyncHandler(controller.getByBookId.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', requireToken, validate(UpdateReviewDTOSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', requireToken, asyncHandler(controller.remove.bind(controller)));

export default router;
