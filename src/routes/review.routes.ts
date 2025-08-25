import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewRepository } from '../repositories/implementations/ReviewRepository';
import { BookRepository } from '../repositories/implementations/BookRepository';
import { ReviewService } from '../services/ReviewService';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { CreateReviewDTOSchema } from '../dto/request/review/CreateReviewDTO';
import { UpdateReviewDTOSchema } from '../dto/request/review/UpdateReviewDTO';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

const reviewRepo = new ReviewRepository();
const bookRepo = new BookRepository();
const service = new ReviewService(reviewRepo, bookRepo);
const controller = new ReviewController(service);

router.post('/', requireAuth, validate(CreateReviewDTOSchema), asyncHandler(controller.create.bind(controller)));
router.get('/book/:bookId', asyncHandler(controller.getByBookId.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', requireAuth, validate(UpdateReviewDTOSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', requireAuth, asyncHandler(controller.remove.bind(controller)));

export default router;
