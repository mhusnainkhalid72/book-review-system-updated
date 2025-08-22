import { IReview, ReviewModel } from '../../databases/models/Review';
import { IReviewRepository } from '../interfaces/IReviewRepository';
import { Types } from 'mongoose'; // Import mongoose.Types for casting ObjectId
import { AppError } from '../../error/AppError';

export class ReviewRepository implements IReviewRepository {
  async create(data: Partial<IReview>): Promise<IReview> {
    return await ReviewModel.create(data);
  }

  async findById(id: string): Promise<IReview | null> {
    return await ReviewModel.findById(id);
  }
async findByBookId(bookId: string): Promise<IReview[]> {
  if (!Types.ObjectId.isValid(bookId)) {
    throw new AppError('Invalid bookId format', 400);
  }
  return await ReviewModel.find({ book: new Types.ObjectId(bookId) });
}

  async updateById(id: string, data: Partial<IReview>): Promise<IReview | null> {
    return await ReviewModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<void> {
    await ReviewModel.findByIdAndDelete(id);
  }

  async findUserReviewForBook(userId: string, bookId: string): Promise<IReview | null> {
    // Check if bookId is a valid ObjectId before casting
    if (!Types.ObjectId.isValid(bookId)) {
      throw new Error('Invalid bookId format');
    }

    return await ReviewModel.findOne({ user: userId, book: new Types.ObjectId(bookId) });
  }

  async calcBookAverage(bookId: string): Promise<number> {
    // Check if bookId is a valid ObjectId before casting
    if (!Types.ObjectId.isValid(bookId)) {
      throw new Error('Invalid bookId format');
    }

    const res = await ReviewModel.aggregate([
      { $match: { book: new Types.ObjectId(bookId) } }
    ]);

    // Alternative aggregate pipeline for avg:
    const agg = await ReviewModel.aggregate([
      { $match: { book: new Types.ObjectId(bookId) } },
      { $group: { _id: '$book', avg: { $avg: '$rating' } } }
    ]);

    const avg = agg.length ? agg[0].avg : 0;
    return Number(avg.toFixed(2)); // Ensure the average is rounded to 2 decimal places
  }
}
