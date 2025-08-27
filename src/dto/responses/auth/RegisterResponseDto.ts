import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class RegisterResponseDto extends BaseResponseDto {
  constructor(res: Response, success: boolean, message: string, name?: string, email?: string, sessionToken?: string) {
    if (success) {
      super(res, 201, "pass", message, { name, email, sessionToken });
    } else {
      super(res, 400, "fail", message, null);
    }
  }
}
