import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private auth: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { name, email, password } = res.locals.validated;
    const result = await this.auth.register(name, email, password);
    res.status(201).json({ success: true, data: result });
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = res.locals.validated;
    const result = await this.auth.login(email, password);
    res.status(200).json({ success: true, data: result });
  };
}
