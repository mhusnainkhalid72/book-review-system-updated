import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class ListReviewsByBookResponseDto extends BaseResponseDto {
  constructor(res: Response, success: boolean, message: string, reviews?: any[]) {
    super(
      res,
      success ? 200 : 404, // 404 when "No reviews for this book"
      success ? "pass" : "fail",
      message,
      reviews ?? []
    );
  }
}
