import { IReviewRepository } from '../repositories/interfaces/IReviewRepository';
import { IBookRepository } from '../repositories/interfaces/IBookRepository';
import { AppError } from '../error/AppError';
import { Types } from 'mongoose';  // Import Types from mongoose for ObjectId casting

export class ReviewService {
  constructor(private reviews: IReviewRepository, private books: IBookRepository) {}

  async create(userId: string, data: { bookId: string; rating: number; message?: string }) {
    const book = await this.books.findById(data.bookId);
    if (!book) throw new AppError('Book not found', 404);

    // user cannot review their own book
    if (book.user.toString() === userId) throw new AppError('Cannot review your own book', 400);

    // only one review per user per book
    const existing = await this.reviews.findUserReviewForBook(userId, data.bookId);
    if (existing) throw new AppError('You already reviewed this book', 409);

    // Convert userId and bookId to ObjectId
    const review = await this.reviews.create({ 
      user: new Types.ObjectId(userId),  // Convert userId to ObjectId
      book: new Types.ObjectId(data.bookId),  // Convert bookId to ObjectId
      rating: data.rating, 
      message: data.message 
    });

    // recalculate average rating
    const avg = await this.reviews.calcBookAverage(data.bookId);
    await this.books.updateAverageRating(data.bookId, avg);

    return review;
  }

  async getById(id: string) {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }
async getByBookId(bookId: string) {
  const reviews = await this.reviews.findByBookId(bookId);
  if (!reviews || reviews.length === 0) throw new AppError('No reviews for this book', 404);
  return reviews;
}

  async update(userId: string, id: string, data: Partial<{ rating: number; message?: string }>) {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.user.toString() !== userId) throw new AppError('Forbidden', 403);

    const updated = await this.reviews.updateById(id, data);

    // recalculate average rating
    const avg = await this.reviews.calcBookAverage(review.book.toString());
    await this.books.updateAverageRating(review.book.toString(), avg);

    return updated!;
  }

  async delete(userId: string, id: string) {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.user.toString() !== userId) throw new AppError('Forbidden', 403);

    await this.reviews.deleteById(id);

    // recalculate average rating
    const avg = await this.reviews.calcBookAverage(review.book.toString());
    await this.books.updateAverageRating(review.book.toString(), avg);
  }
}
