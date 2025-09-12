import { IReview } from '../../databases/models/Review';

export interface IReviewRepository {
  create(data: Partial<IReview>): Promise<IReview>;
  findById(id: string): Promise<IReview | null>;
  updateById(id: string, data: Partial<IReview>): Promise<IReview | null>;
  deleteById(id: string): Promise<void>;
  findUserReviewForBook(userId: string, bookId: string): Promise<IReview | null>;
  calcBookAverage(bookId: string): Promise<number>;

  //  unified signature with pagination + sorting
  findByBookId(
    bookId: string,
    sort: "recent" | "popular",
    page: number,
    limit: number
  ): Promise<IReview[]>;
}
