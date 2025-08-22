import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/reviews', reviewRoutes);

export default router;
