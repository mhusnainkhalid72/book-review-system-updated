import { Request, Response } from "express";
import { BookService } from "../services/BookService";
import RedisClient from "../lib/RedisClient";

import ListBooksResponseDto from "../dto/responses/book/ListBooksResponseDto";
import MineBooksResponseDto from "../dto/responses/book/MineBooksResponseDto";
import CreateBookResponseDto from "../dto/responses/book/CreateBookResponseDto";
import UpdateBookResponseDto from "../dto/responses/book/UpdateBookResponseDto";
import DeleteBookResponseDto from "../dto/responses/book/DeleteBookResponseDto";

type SortKey = "recent" | "high" | "low";

export class BookController {
  constructor(private books: BookService) {}


  public async list(req: Request, res: Response) {
    try {
      const sort: SortKey = (req.query.sort as SortKey) || "recent";

      const redis = RedisClient.getInstance();
      const cacheKey = `books:${sort}`;

      // try cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return new ListBooksResponseDto(
          res,
          true,
          "Books fetched successfully (from cache)",
          JSON.parse(cached)
        );
      }

   
      const result = await this.books.listAll(sort);
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

      return new ListBooksResponseDto( res, true, "Books fetched successfully",result
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
      const user = res.locals.user;
      const result = await this.books.mine(user.id);

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

   
      const redis = RedisClient.getInstance();
      await redis.del("books:recent", "books:high", "books:low");

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

      const redis = RedisClient.getInstance();
      await redis.del("books:recent", "books:high", "books:low");

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

      const redis = RedisClient.getInstance();
      await redis.del("books:recent", "books:high", "books:low");

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
