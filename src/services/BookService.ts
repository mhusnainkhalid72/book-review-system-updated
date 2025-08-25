import { IBookRepository } from '../repositories/interfaces/IBookRepository';
import { AppError } from '../error/AppError';
import { Types } from 'mongoose';   

export class BookService {
  constructor(private books: IBookRepository) {}

  async create(
    userId: string,
    data: { title: string; author: string; description?: string }
  ) {
    return await this.books.create({
      ...data,
      user: new Types.ObjectId(userId),  
    });
  }

  async update(
    userId: string,
    bookId: string,
    data: Partial<{ title: string; author: string; description?: string }>
  ) {
    const book = await this.books.findById(bookId);
    if (!book) throw new AppError('Book not found', 404);
    if (book.user.toString() !== userId) throw new AppError('Forbidden', 403);
    return await this.books.updateById(bookId, data);
  }

  async delete(userId: string, bookId: string) {
    const book = await this.books.findById(bookId);
    if (!book) throw new AppError('Book not found', 404);
    if (book.user.toString() !== userId) throw new AppError('Forbidden', 403);
    await this.books.deleteById(bookId);
  }

  async mine(userId: string) {
    return await this.books.findByOwner(userId);
  }

  async listAll(sort: 'recent' | 'high' | 'low') {
    return await this.books.listAll(sort);
  }

  async updateAverage(bookId: string, avg: number) {
    await this.books.updateAverageRating(bookId, avg);
  }
}
