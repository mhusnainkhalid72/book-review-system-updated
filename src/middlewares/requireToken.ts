// src/middlewares/requireToken.ts
import { Request, Response, NextFunction } from "express";
import { SessionModel } from "../databases/models/Session";
import { AppError } from "../error/AppError";

// Middleware to validate session token
export const requireToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get the token from Authorization header

  if (!token) return next(new AppError("No token provided", 401));

  const session = await SessionModel.findOne({ token, revoked: false });

  if (!session) {
    return next(new AppError("Invalid or expired session token", 401));
  }

  res.locals.user = session.user;  // Attach user data to the request

  await session.updateOne({ lastActive: new Date() });  // Update last active timestamp

  next();
};
