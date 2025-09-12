import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import reviewRoutes from './review.routes';
import sessionRoutes from './session.routes';
import reportRoutes from "./report.routes"

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/reviews', reviewRoutes);
router.use('/sessions', sessionRoutes);
router.use('/reports' , reportRoutes)

export default router;
