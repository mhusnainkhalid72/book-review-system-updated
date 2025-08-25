// src/dto/auth/responses/BaseResponseDto.ts
import { Response } from 'express';

export default class BaseResponseDto {
  constructor(
    res: Response,
    statusCode: number,
    status: 'pass' | 'fail',
    message: string,
    data: any = null
  ) {
    res.status(statusCode).json({
      statusCode,
      status,
      message,
      data,
    });
  }
}
