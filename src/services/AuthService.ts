import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { AppError } from '../error/AppError';
import { env } from '../config/env';  // Ensure that env variables are properly set
import { Types } from 'mongoose'; // Import Types for ObjectId handling

export class AuthService {
  constructor(private users: IUserRepository) {}

  // Register a new user
  async register(name: string, email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, password: hash });

    // Type assertion to let TypeScript know _id is an ObjectId
    const userId = user._id as Types.ObjectId;

    return {
      id: userId.toString(),  // Convert ObjectId to string
      name: user.name,
      email: user.email,
      token: this.sign(userId.toString())  // Pass ObjectId as string for JWT
    };
  }

  // Login the user
  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError('Invalid credentials', 401);

    // Type assertion to let TypeScript know _id is an ObjectId
    const userId = user._id as Types.ObjectId;

    return {
      id: userId.toString(),  // Convert ObjectId to string
      name: user.name,
      email: user.email,
      token: this.sign(userId.toString())  // Pass ObjectId as string for JWT
    };
  }

  // Generate JWT token
  private sign(id: string) {
    if (!env.JWT_SECRET || !env.JWT_EXPIRES_IN) {
      throw new AppError('JWT configuration is missing in environment variables', 500);
    }

    // The correct usage of jwt.sign
    const options = { expiresIn: env.JWT_EXPIRES_IN };
    return jwt.sign({ id }, env.JWT_SECRET);
  }
}
