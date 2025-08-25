import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import LoginResponseDto from '../dto/responses/LoginResponseDto';
import BaseResponseDto from '../dto/responses/BaseResponseDto';


export class AuthController {
  constructor(private auth: AuthService) {}

  register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = res.locals.validated;
    const result = await this.auth.register(name, email, password);

    new BaseResponseDto(res, 201, 'pass', 'User registered successfully', result);
  } catch (err) {
    new BaseResponseDto(res, 400, 'fail', 'Registration failed');
  }
};

login = async (req: Request, res: Response) => {
  try {
    const { email, password } = res.locals.validated;
    const result = await this.auth.login(email, password);

    new LoginResponseDto(res, 'Login successful', result.token, result.name);
  } catch (err: any) {
    // If it's your custom AppError
    const status = err.statusCode || 500;
    const message = err.message || 'Something went wrong';

    res.status(status).json({
      status: 'fail',
      message,
    });
  }
};


}
