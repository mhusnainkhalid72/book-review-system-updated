import { IBook } from '../../databases/models/Book';

export interface IBookRepository {
  create(data: Partial<IBook>): Promise<IBook>;
  findById(id: string): Promise<IBook | null>;
  findByOwner(userId: string): Promise<IBook[]>;
  updateById(id: string, data: Partial<IBook>): Promise<IBook | null>;
  deleteById(id: string): Promise<void>;
  listAll(
    sort: "recent" | "high" | "low",
    search?: string,
    cursor?: string,
    limit?: number
  ): Promise<{ books: IBook[]; nextCursor?: string }>;

  updateAverageRating(bookId: string, avg: number): Promise<void>;
}
