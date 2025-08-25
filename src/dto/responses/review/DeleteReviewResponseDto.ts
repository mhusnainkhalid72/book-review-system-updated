import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class DeleteReviewResponseDto extends BaseResponseDto {
  constructor(res: Response, success: boolean, message: string) {
    super(
      res,
      success ? 200 : 404, 
      success ? "pass" : "fail",
      message,
      null
    );
  }
}
