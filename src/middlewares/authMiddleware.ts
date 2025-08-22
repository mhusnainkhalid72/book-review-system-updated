import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../databases/models/User';
import { AppError } from '../error/AppError';

export interface JwtPayload {
  id: string;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(new AppError('No token provided', 401));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await UserModel.findById(decoded.id).lean();
    if (!user) return next(new AppError('User not found', 401));

    // Attach to res.locals (as requested)
    res.locals.user = { id: user._id.toString(), email: user.email, name: user.name };
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
};
