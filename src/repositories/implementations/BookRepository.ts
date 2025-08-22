import { IBook, BookModel } from '../../databases/models/Book';
import { IBookRepository } from '../interfaces/IBookRepository';

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

  async listAll(sort: 'recent' | 'high' | 'low'): Promise<IBook[]> {
    // Adjust the sorting logic to match MongoDB's expected sort format
    let sortStage: { [key: string]: 1 | -1 } = {};

    if (sort === 'high') {
      sortStage = { averageRating: -1, createdAt: -1 }; // descending by averageRating, then createdAt
    } else if (sort === 'low') {
      sortStage = { averageRating: 1, createdAt: -1 }; // ascending by averageRating, descending by createdAt
    } else {
      sortStage = { createdAt: -1 }; // descending by createdAt (recent)
    }

    return await BookModel.find().sort(sortStage);
  }

  async updateAverageRating(bookId: string, avg: number): Promise<void> {
    await BookModel.findByIdAndUpdate(bookId, { averageRating: avg });
  }
}
