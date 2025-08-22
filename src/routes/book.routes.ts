import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { BookRepository } from '../repositories/implementations/BookRepository';
import { BookService } from '../services/BookService';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { CreateBookDTOSchema } from '../dto/book/CreateBookDTO';
import { UpdateBookDTOSchema } from '../dto/book/UpdateBookDTO';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

const bookRepo = new BookRepository();
const bookService = new BookService(bookRepo);
const controller = new BookController(bookService);

router.get('/', asyncHandler(controller.list));
router.get('/mine', requireAuth, asyncHandler(controller.mine));
router.post('/', requireAuth, validate(CreateBookDTOSchema), asyncHandler(controller.create));
router.put('/:id', requireAuth, validate(UpdateBookDTOSchema), asyncHandler(controller.update));
router.delete('/:id', requireAuth, asyncHandler(controller.remove));

export default router;
