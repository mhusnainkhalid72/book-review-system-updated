// dto/responses/login.response.dto.ts
import { Response } from 'express';
import BaseResponseDto from './BaseResponseDto';

export default class LoginResponseDto extends BaseResponseDto {
  constructor(res: Response, message: string, token: string, name: string) {
    super(res, 200, 'pass', message, {
      token,
      name,
    });
  }
}

