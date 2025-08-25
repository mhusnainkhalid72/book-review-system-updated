import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class CreateReviewResponseDto extends BaseResponseDto {
  constructor(res: Response, success: boolean, message: string, review?: any) {
    super(
      res,
      success ? 201 : 400,
      success ? "pass" : "fail",
      message,
      review ?? null
    );
  }
}
