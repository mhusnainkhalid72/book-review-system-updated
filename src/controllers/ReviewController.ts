import { Request, Response } from "express";
import { ReviewService } from "../services/ReviewService";
import RedisClient from "../lib/RedisClient";

// Import DTOs
import CreateReviewResponseDto from "../dto/responses/review/CreateReviewResponseDto";
import GetReviewByIdResponseDto from "../dto/responses/review/GetReviewByIdResponseDto";
import ListReviewsByBookResponseDto from "../dto/responses/review/ListReviewsByBookResponseDto";
import UpdateReviewResponseDto from "../dto/responses/review/UpdateReviewResponseDto";
import DeleteReviewResponseDto from "../dto/responses/review/DeleteReviewResponseDto";

export class ReviewController {
  constructor(private reviews: ReviewService) {}


  public async create(_req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const dto = res.locals.validated;
      const review = await this.reviews.create(user.id, dto);

      // invalidate book lists because average rating changes
      const redis = RedisClient.getInstance();
      await redis.del("books:recent", "books:high", "books:low");

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
      const reviews = await this.reviews.getByBookId(req.params.bookId);
      return new ListReviewsByBookResponseDto(res, true, "Reviews fetched successfully", reviews);
    } catch (err: any) {
      return new ListReviewsByBookResponseDto(res, false, err.message || "Failed to fetch reviews");
    }
  }

 
  public async update(req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const dto = res.locals.validated;
      const review = await this.reviews.update(user.id, req.params.id, dto);

      const redis = RedisClient.getInstance();
      await redis.del("books:recent", "books:high", "books:low");

      return new UpdateReviewResponseDto(res, true, "Review updated successfully", review);
    } catch (err: any) {
      return new UpdateReviewResponseDto(res, false, err.message || "Failed to update review");
    }
  }

  

  
  public async remove(req: Request, res: Response) {
    try {
      const user = res.locals.user;
      await this.reviews.delete(user.id, req.params.id);

      const redis = RedisClient.getInstance();
      await redis.del("books:recent", "books:high", "books:low");

      return new DeleteReviewResponseDto(res, true, "Review deleted successfully");
    } catch (err: any) {
      return new DeleteReviewResponseDto(res, false, err.message || "Failed to delete review");
    }
  }
}
