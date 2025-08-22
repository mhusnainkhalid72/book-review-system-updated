import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewRepository } from '../repositories/implementations/ReviewRepository';
import { BookRepository } from '../repositories/implementations/BookRepository';
import { ReviewService } from '../services/ReviewService';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { CreateReviewDTOSchema } from '../dto/review/CreateReviewDTO';
import { UpdateReviewDTOSchema } from '../dto/review/UpdateReviewDTO';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

const reviewRepo = new ReviewRepository();
const bookRepo = new BookRepository();
const service = new ReviewService(reviewRepo, bookRepo);
const controller = new ReviewController(service);

router.post('/', requireAuth, validate(CreateReviewDTOSchema), asyncHandler(controller.create));
router.get('/book/:bookId', asyncHandler(controller.getByBookId));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', requireAuth, validate(UpdateReviewDTOSchema), asyncHandler(controller.update));
router.delete('/:id', requireAuth, asyncHandler(controller.remove));

export default router;
