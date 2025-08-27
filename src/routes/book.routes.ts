import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { BookRepository } from '../repositories/implementations/BookRepository';
import { BookService } from '../services/BookService';

import { validate } from '../middlewares/validationMiddleware';
import { CreateBookDTOSchema } from '../dto/request/book/CreateBookDTO';
import { UpdateBookDTOSchema } from '../dto/request/book/UpdateBookDTO';
import { asyncHandler } from '../lib/asyncHandler';
import { requireToken } from '../middlewares/requireToken';


const router = Router();

const bookRepo = new BookRepository();
const bookService = new BookService(bookRepo);
const controller = new BookController(bookService);

router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/mine', requireToken, asyncHandler(controller.mine.bind(controller)));
router.post('/', requireToken, validate(CreateBookDTOSchema), asyncHandler(controller.create.bind(controller)));
router.put('/:id', requireToken, validate(UpdateBookDTOSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', requireToken, asyncHandler(controller.remove.bind(controller)));

export default router;
