// src/dto/auth/responses/RegisterResponseDto.ts
import { Response } from 'express';
import BaseResponseDto from './BaseResponseDto';

export default class RegisterResponseDto extends BaseResponseDto {
  constructor(res: Response, message: string, token: string, name: string) {
    super(res, 201, 'pass', message, {
      token,
      name,
    });
  }
}
