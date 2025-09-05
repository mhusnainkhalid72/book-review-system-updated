// src/middlewares/requireToken.ts
import { Request, Response, NextFunction } from "express";
import { SessionModel } from "../databases/models/Session";
import { AppError } from "../error/AppError";

export const requireToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return next(new AppError("No token provided", 401));

  const session = await SessionModel.findOne({ token, revoked: false });
  if (!session) return next(new AppError("Invalid or expired session token", 401));

  res.locals.user = { id: session.user.toString(), sessionId: session._id.toString() };
  res.locals.sessionExtraPermissions = session.extraPermissions || [];

  session.lastActive = new Date();
  await session.save().catch(err => console.warn("Failed to update session.lastActive:", err.message));

  next();
};
