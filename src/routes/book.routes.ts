import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { BookRepository } from '../repositories/implementations/BookRepository';
import { BookService } from '../services/BookService';

import { validate } from '../middlewares/validationMiddleware';
import { CreateBookDTOSchema } from '../dto/request/book/CreateBookDTO';
import { UpdateBookDTOSchema } from '../dto/request/book/UpdateBookDTO';
import { asyncHandler } from '../lib/asyncHandler';
import { requireToken } from '../middlewares/requireToken';

import { BooksPopularityService } from '../services/BooksPopularityService';
import { BooksPopularityController } from '../controllers/BooksPopularityController';
import { requirePermission } from '../middlewares/authorization';
const router = Router();

const bookRepo = new BookRepository();
const bookService = new BookService(bookRepo);
const controller = new BookController(bookService);

const hotService = new BooksPopularityService();
const hotController = new BooksPopularityController(hotService);

router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/mine', requireToken, asyncHandler(controller.mine.bind(controller)));
router.post('/', requireToken, validate(CreateBookDTOSchema), asyncHandler(controller.create.bind(controller)));
router.put('/:id', requireToken, requirePermission('books.update.any', async (req) => {

  const id = req.params.id;
  const { BookModel } = require('../databases/models/Book'); 
  const book = await BookModel.findById(id).lean();
  return book ? book.user.toString() : null;
}), validate(UpdateBookDTOSchema), asyncHandler(controller.update.bind(controller)));


router.delete('/:id', requireToken, requirePermission('books.delete.any', async (req) => {
  const id = req.params.id;
  const { BookModel } = require('../databases/models/Book');
  const book = await BookModel.findById(id).lean();
  return book ? book.user.toString() : null;
}), asyncHandler(controller.remove.bind(controller)));
router.get('/hot',asyncHandler(hotController.hot.bind(hotController)));

export default router;
