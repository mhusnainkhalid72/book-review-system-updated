import { IBook, BookModel } from "../../databases/models/Book";
import { IBookRepository } from "../interfaces/IBookRepository";

export class BookRepository implements IBookRepository {
  async create(data: Partial<IBook>): Promise<IBook> {
    return await BookModel.create(data);
  }

  async findById(id: string): Promise<IBook | null> {
    return await BookModel.findById(id);
  }

  async findByOwner(userId: string): Promise<IBook[]> {
    return await BookModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async updateById(id: string, data: Partial<IBook>): Promise<IBook | null> {
    return await BookModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<void> {
    await BookModel.findByIdAndDelete(id);
  }

  // Cursor-based pagination + sorting + search
  async listAll(
    sort: "recent" | "high" | "low",
    search: string = "",
    cursor?: string,
    limit: number = 10
  ): Promise<{ books: IBook[]; nextCursor?: string }> {
    const query: any = {};

    // 🔍 Search by title
    if (search && search.trim() !== "") {
      query.title = { $regex: search, $options: "i" };
    }

    // Cursor logic
    if (cursor) {
      const lastBook = await BookModel.findById(cursor).lean();
      if (lastBook) {
        if (sort === "recent") {
          query.createdAt = { $lt: lastBook.createdAt };
        } else if (sort === "high") {
          query.$or = [
            { averageRating: { $lt: lastBook.averageRating } },
            {
              averageRating: lastBook.averageRating,
              createdAt: { $lt: lastBook.createdAt },
            },
          ];
        } else if (sort === "low") {
          query.$or = [
            { averageRating: { $gt: lastBook.averageRating } },
            {
              averageRating: lastBook.averageRating,
              createdAt: { $lt: lastBook.createdAt },
            },
          ];
        }
      }
    }

    // Sorting logic
    let sortStage: any = {};
    if (sort === "high") sortStage = { averageRating: -1, createdAt: -1 };
    else if (sort === "low") sortStage = { averageRating: 1, createdAt: -1 };
    else sortStage = { createdAt: -1 };

    //  Fetch one extra to check for next cursor
    const books = await BookModel.find(query)
      .sort(sortStage)
      .limit(limit + 1)
      .lean();

    let nextCursor: string | undefined = undefined;
    if (books.length > limit) {
      const nextBook = books.pop(); // remove extra item
      nextCursor = nextBook!._id.toString();
    }

    //  Return object with books + nextCursor
    return { books, nextCursor };
  }

  async updateAverageRating(bookId: string, avg: number): Promise<void> {
    await BookModel.findByIdAndUpdate(bookId, { averageRating: avg });
  }
}
