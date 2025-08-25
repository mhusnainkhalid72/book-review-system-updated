import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import LoginResponseDto from '../dto/responses/LoginResponseDto';
import RegisterResponseDto from '../dto/responses/RegisterResponseDto';

export class AuthController {
  constructor(private auth: AuthService) {}

  public async register(req: Request, res: Response) {
    try {
      const { name, email, password } = res.locals.validated;
      const result = await this.auth.register(name, email, password);

      new RegisterResponseDto(res, true, 'User registered successfully', result.name, result.email);
    } catch (err: any) {
      console.error('Registration error:', err);
      new RegisterResponseDto(res, false, err.message || 'Registration failed');
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, password } = res.locals.validated;
      const result = await this.auth.login(email, password);

      new LoginResponseDto(res, true, 'Login successful', result.token, result.name);
    } catch (err: any) {
      console.error('Login error:', err);
      new LoginResponseDto(res, false, err.message || 'Login failed');
    }
  }
}
