import { IBookRepository } from '../repositories/interfaces/IBookRepository';
import { AppError } from '../error/AppError';
import { Types } from 'mongoose';
import { anyPermissionMatches } from '../lib/RBAC';

export class BookService {
  constructor(private books: IBookRepository) {}

  /**
   * Create a new book
   */
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
    data: Partial<{ title: string; author: string; description?: string }>,
    userPermissions: string[] // 
  ) {
    const book = await this.books.findById(bookId);
    if (!book) throw new AppError('Book not found', 404);

  
    const canUpdateAny =
      anyPermissionMatches(userPermissions, 'books.update.any') ||
      anyPermissionMatches(userPermissions, 'books.*') ||
      anyPermissionMatches(userPermissions, '*');

    if (!canUpdateAny && book.user.toString() !== userId) {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }

    return await this.books.updateById(bookId, data);
  }

  /**
   
    @param userId
    @param bookId 
   *@param userPermissions 
   */
  async delete(
    userId: string,
    bookId: string,
    userPermissions: string[] // ⭐ NEW
  ) {
    const book = await this.books.findById(bookId);
    if (!book) throw new AppError('Book not found', 404);

    // ⭐ NEW: check if user has 'delete:any' permission
 const canDeleteAny = anyPermissionMatches(userPermissions, 'books.delete.any') ||
                     anyPermissionMatches(userPermissions, 'books.*') ||
                     anyPermissionMatches(userPermissions, '*');
if (!canDeleteAny && book.user.toString() !== userId) {
  throw new AppError('Forbidden: insufficient permissions', 403);
}

    await this.books.deleteById(bookId);
    return book; // optionally return deleted book
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
