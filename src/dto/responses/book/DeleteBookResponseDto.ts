import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class DeleteBookResponseDto extends BaseResponseDto {
  constructor(res: Response, success: boolean, message: string) {
    if (success) {
      super(res, 200, "pass", message, null);
    } else {
      super(res, 404, "fail", message, null);
    }
  }
}
