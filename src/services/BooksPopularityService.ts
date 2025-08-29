// FILE: src/services/BooksPopularityService.ts
// [NEW] Keep analytics/leaderboard logic separate from CRUD.
// "Hot books" = good rating + recent activity (last 30 days). Tweak thresholds here.
import { ReviewModel } from '../databases/models/Review';
import { Types } from 'mongoose';

const RATING_THRESHOLD = 4.2;
const WINDOW_DAYS = 30;

export interface HotBook {
  bookId: string;
  title: string;
  author: string;
  averageRating: number;
  totalReviews: number;
  newReviews30d: number;
  hotScore: number;
}

export class BooksPopularityService {
  async computeHot(page = 1, limit = 10, category?: string): Promise<HotBook[]> {
    const skip = (page - 1) * limit;
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const base = await ReviewModel.aggregate([
      {
        $group: {
          _id: '$book',
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          newReviews30d: { $sum: { $cond: [{ $gte: ['$createdAt', since] }, 1, 0] } }
        }
      },
      { $match: { avgRating: { $gte: RATING_THRESHOLD } } },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      // If you add categories to Book schema, enable this:
      ...(category ? [{ $match: { 'book.category': category } }] : []),
      {
        $addFields: {
          hotScore: {
            $add: [
              { $multiply: ['$avgRating', 0.7] },
              { $multiply: [{ $log10: { $add: ['$totalReviews', 1] } }, 0.15] },
              { $multiply: [{ $log10: { $add: ['$newReviews30d', 1] } }, 0.15] }
            ]
          }
        }
      },
      { $sort: { hotScore: -1, avgRating: -1, totalReviews: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          bookId: '$_id',
          title: '$book.title',
          author: '$book.author',
          averageRating: { $round: ['$avgRating', 2] },
          totalReviews: 1,
          newReviews30d: 1,
          hotScore: { $round: ['$hotScore', 4] },
          _id: 0
        }
      }
    ]);

    return base.map((b) => ({
      ...b,
      bookId: (b.bookId as unknown as Types.ObjectId).toString(),
    })) as HotBook[];
  }
}
