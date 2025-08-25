// src/dto/responses/LoginResponseDto.ts
import { Response } from 'express';
import BaseResponseDto from './BaseResponseDto';

export default class LoginResponseDto extends BaseResponseDto {
  constructor(
    res: Response,
    success: boolean,
    message: string,
    token?: string,
    name?: string
  ) {
    if (success) {
      super(res, 200, 'pass', message, { token, name });
    } else {
      super(res, 401, 'fail', message, null);
    }
  }
}
