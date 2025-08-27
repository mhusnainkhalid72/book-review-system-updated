import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class LoginResponseDto extends BaseResponseDto {
  constructor(res: Response, success: boolean, message: string, name?: string, sessionToken?: string) {
    if (success) {
      super(res, 200, "pass", message, { name, sessionToken });
    } else {
      super(res, 401, "fail", message, null);
    }
  }
}
