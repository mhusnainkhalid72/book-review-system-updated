import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class GetReviewByIdResponseDto extends BaseResponseDto<any> {
  constructor(res: Response, success: boolean, message: string, review?: any) {
    super(
      res,
      success ? 200 : 404,
      success ? "pass" : "fail",
      message,
      review ?? null
    );
  }
}
