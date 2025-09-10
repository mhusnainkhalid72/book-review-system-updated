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

  async listAll(
    sort: "recent" | "high" | "low",
    search: string = ""
  ): Promise<IBook[]> {
    const query: any = {};


    if (search && search.trim() !== "") {
      query.title = { $regex: search, $options: "i" };

    }

    // Sorting logic
    let sortStage: { [key: string]: 1 | -1 } = {};

    if (sort === "high") {
      sortStage = { averageRating: -1, createdAt: -1 };
    } else if (sort === "low") {
      sortStage = { averageRating: 1, createdAt: -1 };
    } else {
      sortStage = { createdAt: -1 };
    }

    return await BookModel.find(query).sort(sortStage).lean();
  }

  async updateAverageRating(bookId: string, avg: number): Promise<void> {
    await BookModel.findByIdAndUpdate(bookId, { averageRating: avg });
  }
}
