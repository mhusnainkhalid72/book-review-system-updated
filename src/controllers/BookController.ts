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

type SortKey = "recent" | "high" | "low";

export class BookController {
  constructor(private books: BookService) {}


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
      return new ListBooksResponseDto(
        res,
        false,
        err.message || "Failed to fetch books"
      );
    }
  }
 public async mine(_req: Request, res: Response) {
  try {
    console.log("user in res.locals:", res.locals.user); // DEBUG
    const user = res.locals.user;

    // handle both cases
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

    
  


  public async create(req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const dto = res.locals.validated; 

      const created = await this.books.create(user.id, dto);

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
      const user = res.locals.user;
      const dto = res.locals.validated;
      const bookId = req.params.id;

      const updated = await this.books.update(user.id, bookId, dto);
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
      const user = res.locals.user;
      const bookId = req.params.id;

      await this.books.delete(user.id, bookId);

       await RedisCache.del(CacheKeys.patterns.allBooksLists());
      await RedisCache.del(CacheKeys.patterns.hotBooksAll());

     
      return new DeleteBookResponseDto(res, true, "Book deleted successfully");
    } catch (err: any) {
      return new DeleteBookResponseDto(
        res,
        false,
        err.message || "Book deletion failed"
      );
    }
  }
}
