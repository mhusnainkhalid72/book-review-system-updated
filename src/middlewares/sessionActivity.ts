// src/middlewares/sessionActivity.ts
import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/SessionService";
import { SessionRepository } from "../repositories/implementations/SessionRepository"; // 
const sessionRepository = new SessionRepository(); 
const sessionService = new SessionService(sessionRepository); 
export async function sessionActivity(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-session-token"] as string | undefined;

  if (token) {
    try {
      await sessionService.touchActivity(token, req); // Update the session's last active time
    } catch (err) {
      console.warn("⚠️ sessionActivity failed:", (err as Error).message);
    }
  }
  next();
}
