import { IReviewRepository } from '../repositories/interfaces/IReviewRepository';
import { IBookRepository } from '../repositories/interfaces/IBookRepository';
import { AppError } from '../error/AppError';
import { Types } from 'mongoose'; 
import { ReviewModel } from '../databases/models/Review';
import { DAILY_EMAIL_JOB, notificationQueue, PUSH_JOB } from '../queues/notification.queue';
import { analyzeReview } from '../lib/aiSentiment';

export class ReviewService {
  constructor(private reviews: IReviewRepository, private books: IBookRepository) {}
  async create(userId: string, data: { bookId: string; rating: number; message?: string }) {
    try {
      const book = await this.books.findById(data.bookId);
      if (!book) throw new AppError('Book not found', 404);
      if (book.user.toString() === userId) throw new AppError('Cannot review your own book', 400);

      const existing = await this.reviews.findUserReviewForBook(userId, data.bookId);

      if (existing) throw new AppError('You already reviewed this book', 409);

       // [AI INTEGRATION] Analyze before saving
  let aiSummary = "";
      let aiSentiment = "neutral";
      if (data.message) {
        const aiResult = await analyzeReview(data.message);
        aiSummary = aiResult.summary;
        aiSentiment = aiResult.sentiment;
      }
      const review = await this.reviews.create({
        user: new Types.ObjectId(userId),
        book: new Types.ObjectId(data.bookId),
        rating: data.rating,
        message: data.message,
        summary: aiSummary,   
        sentiment: aiSentiment,
      });

      const avg = await this.reviews.calcBookAverage(data.bookId);
      await this.books.updateAverageRating(data.bookId, avg);

      // Push (5 min delay)
      try {
        await notificationQueue.add(
          PUSH_JOB,
          {
            userId: book.user.toString(),
            message: `Your book "${book.title}" got a new review!`,
            bookId: data.bookId,
          },
          { delay: 5 * 60 * 1000, removeOnComplete: true, removeOnFail: 50 }
        );
      } catch (qErr: any) {
        console.error('[ReviewService.create] failed to enqueue push', { message: qErr?.message });
      }

      // Targeted daily digest (owner-only) with short window (e.g., 10 minutes)
      try {
        await notificationQueue.add(
          DAILY_EMAIL_JOB,
          { userId: book.user.toString(), windowMinutes: 10 }, // [ADDED] target + short window
          { delay: 5 * 60 * 1000, removeOnComplete: true, removeOnFail: 50 }
        );
      } catch (qErr: any) {
        console.error('[ReviewService.create] failed to enqueue daily summary', { message: qErr?.message });
      }

      return review;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      console.error('[ReviewService.create] fatal', { message: err?.message, stack: err?.stack });
      throw new AppError('Failed to create review', 500);
    }
  }

  async getById(id: string) {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }
async getByBookId(
  bookId: string,
  sort: 'recent' | 'popular' = 'recent',
  page = 1,
  limit = 20
) {
  const docs = await this.reviews.findByBookId(bookId, sort, page, limit);
  if (!docs || docs.length === 0) throw new AppError('No reviews for this book', 404);

  const sentimentStats = { positive: 0, neutral: 0, negative: 0 };
  for (const r of docs) {
    if (r.sentiment === "positive") sentimentStats.positive++;
    else if (r.sentiment === "negative") sentimentStats.negative++;
    else sentimentStats.neutral++;
  }

  const total = sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative;
  const score = total > 0 ? sentimentStats.positive / total : 0;
  const verdict = score >= 0.5 ? "Worthy to Read" : "Not Worthy";

  return {
    reviews: docs,
    sentimentStats,
    overall: { verdict, score },
  };
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

  async delete(userId: string, id: string): Promise<{ bookId: string }> {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.user.toString() !== userId) throw new AppError('Forbidden', 403);

    const bookId = review.book.toString();

    await this.reviews.deleteById(id);

    const avg = await this.reviews.calcBookAverage(bookId);
    await this.books.updateAverageRating(bookId, avg);

    return { bookId };
  }
  
}