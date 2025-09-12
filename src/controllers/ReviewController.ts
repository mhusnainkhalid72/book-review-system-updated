import { Request, Response } from "express";
import { ReviewService } from "../services/ReviewService";

import { RedisCache } from "../lib/RedisCache";
import { CacheKeys } from "../cache/cache.keys";
import { TTL } from "../cache/cache.ttl";
import { withJitter } from "../cache/cache.jitter";

import CreateReviewResponseDto from "../dto/responses/review/CreateReviewResponseDto";
import GetReviewByIdResponseDto from "../dto/responses/review/GetReviewByIdResponseDto";
import ListReviewsByBookResponseDto from "../dto/responses/review/ListReviewsByBookResponseDto";
import UpdateReviewResponseDto from "../dto/responses/review/UpdateReviewResponseDto";
import DeleteReviewResponseDto from "../dto/responses/review/DeleteReviewResponseDto";
import { NotificationService } from "../services/notification.service";
import { IReview } from "../databases/models/Review";



export class ReviewController {
  constructor(private reviews: ReviewService) {}

 private service = NotificationService;
  public async create(_req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const dto = res.locals.validated;

     if (!user?.id) throw new Error('Authenticated user not in res.locals') // [ADDED]
     if (!dto?.bookId) throw new Error('Validated DTO missing bookId');     
      
     const review = await this.reviews.create(user.id, dto);

    try {
        await RedisCache.del(CacheKeys.patterns.bookAllReviews(review.book.toString()));
        await RedisCache.del(CacheKeys.patterns.allBooksLists());
        await RedisCache.del(CacheKeys.patterns.hotBooksAll());
      } catch (cacheErr: any) {
        console.error('[ReviewController.create] cache invalidation failed', { message: cacheErr?.message });
      }

      return new CreateReviewResponseDto(res, true, "Review created successfully", review);
    } catch (err: any) {
      return new CreateReviewResponseDto(res, false, err.message || "Failed to create review");
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const review = await this.reviews.getById(req.params.id);
      return new GetReviewByIdResponseDto(res, true, "Review fetched successfully", review);
    } catch (err: any) {
      return new GetReviewByIdResponseDto(res, false, err.message || "Failed to fetch review");
    }
  }

  public async getByBookId(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const sort = (req.query.sort as "recent" | "popular") || "recent";
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.min(
        100,
        Math.max(1, parseInt((req.query.limit as string) || "20", 10))
      );

      // ✅ FIXED: Explicitly type the return value from service
      const data: {
        reviews: IReview[];
        sentimentStats: { positive: number; neutral: number; negative: number };
        overall: { verdict: string; score: number };
      } = await this.reviews.getByBookId(bookId, sort, page, limit);

      return new ListReviewsByBookResponseDto(
        res,
        true,
        "Reviews fetched successfully",
        data
      );
    } catch (err: any) {
      return new ListReviewsByBookResponseDto(
        res,
        false,
        err.message || "Failed to fetch reviews"
      );
    }
  }
  public async update(req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const dto = res.locals.validated;
      const review = await this.reviews.update(user.id, req.params.id, dto);

 try {
        await RedisCache.del(CacheKeys.patterns.bookAllReviews(review.book.toString()));
        await RedisCache.del(CacheKeys.patterns.allBooksLists());
        await RedisCache.del(CacheKeys.patterns.hotBooksAll());
      } catch (cacheErr: any) {
        console.error('[ReviewController.update] cache invalidation failed', { message: cacheErr?.message });
      }
      return new UpdateReviewResponseDto(res, true, "Review updated successfully", review);
    } catch (err: any) {
      return new UpdateReviewResponseDto(res, false, err.message || "Failed to update review");
    }
  }

  

 public async remove(req: Request, res: Response) {
  try {
    const user = res.locals.user;

 
    const review = await this.reviews.getById(req.params.id);

    await this.reviews.delete(user.id, req.params.id);

    if (review?.book) {
      await RedisCache.del(CacheKeys.patterns.bookAllReviews(review.book.toString()));
    }
    await RedisCache.del(CacheKeys.patterns.allBooksLists());
    await RedisCache.del(CacheKeys.patterns.hotBooksAll());

    return new DeleteReviewResponseDto(res, true, "Review deleted successfully");
  } catch (err: any) {
    return new DeleteReviewResponseDto(res, false, err.message || "Failed to delete review");
  }
}
}