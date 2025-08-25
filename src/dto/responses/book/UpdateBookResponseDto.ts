import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class UpdateBookResponseDto extends BaseResponseDto {
  constructor(
    res: Response,
    success: boolean,
    message: string,
    updatedBook?: any
  ) {
    if (success) {
      super(res, 200, "pass", message, updatedBook || {});
    } else {
      super(res, 404, "fail", message, null);
    }
  }
}
