import { Request, Response } from "express";
import { BookService } from "../services/BookService";
import { Types } from "mongoose";

import ListBooksResponseDto from "../dto/responses/book/ListBooksResponseDto";
import MineBooksResponseDto from "../dto/responses/book/MineBooksResponseDto";
import CreateBookResponseDto from "../dto/responses/book/CreateBookResponseDto";
import UpdateBookResponseDto from "../dto/responses/book/UpdateBookResponseDto";
import DeleteBookResponseDto from "../dto/responses/book/DeleteBookResponseDto";

import { RedisCache } from "../lib/RedisCache";
import { CacheKeys } from "../cache/cache.keys";
import { TTL } from "../cache/cache.ttl";
import { withJitter } from "../cache/cache.jitter";

import { BookModel } from "../databases/models/Book";
import { RoleModel } from "../databases/models/Role";
import { UserModel } from "../databases/models/User";
import { anyPermissionMatches } from "../lib/RBAC";
import { dot } from "node:test/reporters";

type SortKey = "recent" | "high" | "low";

export class BookController {
  constructor(private books: BookService) {}

  // LIST BOOKS - anyone can list
  public async list(req: Request, res: Response) {
    try {
      const sort: SortKey = (req.query.sort as SortKey) || "recent";
      const key = CacheKeys.booksList(sort);

      const result = await RedisCache.wrap(
        key,
        withJitter(TTL.BOOK_LIST),
        () => this.books.listAll(sort)
      );

      return new ListBooksResponseDto(
        res,
        true,
        "Books fetched successfully",
        result
      );
    } catch (err: any) {
      return new ListBooksResponseDto(res, false, err.message || "Failed to fetch books");
    }
  }

  
  public async mine(req: Request, res: Response) {
    try {
      console.log("user in res.locals:", res.locals.user); 
      const user = res.locals.user;

      // handle both _id and id
      const userId = user._id
        ? user._id.toString()
        : new Types.ObjectId(user.id).toString();

      const result = await this.books.mine(userId);

      return new MineBooksResponseDto(
        res,
        true,
        "Your books fetched successfully",
        result
      );
    } catch (err: any) {
      return new MineBooksResponseDto(
        res,
        false,
        err.message || "Failed to fetch your books"
      );
    }
  }

  // CREATE BOOK - users can create their own
  public async create(req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const dto = res.locals.validated; // validated data from middleware

      const created = await this.books.create(user.id, dto);

      // 🔹 Clear caches after creation
      await RedisCache.del(CacheKeys.patterns.allBooksLists());
      await RedisCache.del(CacheKeys.patterns.hotBooksAll());

      return new CreateBookResponseDto(
        res,
        true,
        "Book created successfully",
        created
      );
    } catch (err: any) {
      return new CreateBookResponseDto(
        res,
        false,
        err.message || "Book creation failed"
      );
    }
  }


  public async update(req: Request, res: Response) {
    try {
      const userRef = res.locals.user;
      const dto = res.locals.validated;
      const bookId = req.params.id;

      const book = await BookModel.findById(bookId).lean();
      if (!book) return new UpdateBookResponseDto(res, false, "Book not found");

      const isOwner = book.user.toString() === userRef.id;

     
      const userDoc = await UserModel.findById(userRef.id).lean();
      const role = userDoc?.role ? await RoleModel.findById(userDoc.role).lean() : null;
      const userPermissions = [
        ...(role?.permissions || []),
        ...(userDoc?.extraPermissions || []),
      ];

      if (!isOwner) {
        if (
          !anyPermissionMatches(userPermissions, 'books.update.any') &&
          !anyPermissionMatches(userPermissions, '*')
        ) {
          return new UpdateBookResponseDto(
            res,
            false,
            "Forbidden: insufficient permissions to update others' books"
          );
        }
      }

      const updated = await this.books.update(
        userRef.id,
        bookId,
        dto,
        userPermissions
      );

     
      await RedisCache.del(CacheKeys.patterns.allBooksLists());
      await RedisCache.del(CacheKeys.patterns.hotBooksAll());

      return new UpdateBookResponseDto(
        res,
        true,
        "Book updated successfully",
        updated
      );
    } catch (err: any) {
      return new UpdateBookResponseDto(
        res,
        false,
        err.message || "Book update failed"
      );
    }
  }

  
  public async remove(req: Request, res: Response) {
    try {
      const userRef = res.locals.user;
     
      const bookId = req.params.id;

      const book = await BookModel.findById(bookId).lean();
      if (!book) return new DeleteBookResponseDto(res, false, "Book not found");

      const isOwner = book.user.toString() === userRef.id;

     
      const userDoc = await UserModel.findById(userRef.id).lean();
      const role = userDoc?.role ? await RoleModel.findById(userDoc.role).lean() : null;
      const userPermissions = [
        ...(role?.permissions || []),
        ...(userDoc?.extraPermissions || []),
      ];

      if (!isOwner) {
        if (
          !anyPermissionMatches(userPermissions, 'books.delete.any') &&
          !anyPermissionMatches(userPermissions, '*')
        ) {
          return new DeleteBookResponseDto(
            res,
            false,
            "Forbidden: insufficient permissions to delete others' books"
          );
        }
      }

     const updated = await this.books.delete(userRef.id, bookId,  userPermissions);
      
      await RedisCache.del(CacheKeys.patterns.allBooksLists());
      await RedisCache.del(CacheKeys.patterns.hotBooksAll());

      return new DeleteBookResponseDto(
        res,
        true,
        "Book deleted successfully",
      
      );
    } catch (err: any) {
      return new DeleteBookResponseDto(
        res,
        false,
        err.message || "Book deletion failed"
      );
    }
  }
}
