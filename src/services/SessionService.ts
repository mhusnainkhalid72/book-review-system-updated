// src/services/SessionService.ts
import { ISessionRepository } from "../repositories/interfaces/ISessionRepository";
import { ISession } from "../databases/models/Session";
import { Types } from "mongoose";
import { AppError } from "../error/AppError";

export class SessionService {
  constructor(private sessions: ISessionRepository) {}

  // Generate a new session token (non-JWT token) using crypto
  generateToken(bytes: number = 32) {
    return require("crypto").randomBytes(bytes).toString("hex");
  }

  // Create session after login
  async createForLogin(userId: string, req: any, lifetimeMs = 2 * 60 * 60 * 1000) {
    const token = this.generateToken(32); // Generate session token

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || null;
    const mac = req.headers["x-client-mac"] || null; // Ensure this header is passed by the client
    const userAgent = req.get("user-agent") || null;

    const now = new Date();
    const expiresAt = lifetimeMs ? new Date(now.getTime() + lifetimeMs) : null;

    const sessionDoc = await this.sessions.create({
      user: new Types.ObjectId(userId),
      token,
      ip,
      mac,
      userAgent,
      lastActive: now,
      expiresAt,
      revoked: false,
      isOnline: true, // Active session initially
    } as Partial<ISession>);

    return { token, session: sessionDoc };
  }

  // Touch session activity (update session with latest activity)
  async touchActivity(token: string, req: any) {
    const session = await this.sessions.findByToken(token);
    if (!session || session.revoked) return;

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || null;
    const mac = req.headers["x-client-mac"] || session.mac || null;
    const userAgent = req.get("user-agent") || session.userAgent || null;

    // Update session activity
    await this.sessions.touch(token, {
      lastActive: new Date(),
      ip,
      mac,
      userAgent,
    });
  }

  // List all sessions for a user
  async listByUser(userId: string) {
    const sessions = await this.sessions.listByUser(userId);
    return sessions.map(session => ({
      id: session._id.toString(),
      token: session.token,
      ip: session.ip,
      mac: session.mac,
      userAgent: session.userAgent,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      revoked: session.revoked,
      isOnline: session.isOnline,
    }));
  }

// src/services/SessionService.ts
async revoke(userId: string, sessionId: string): Promise<void> {
  // Find the session by sessionId
  const session = await this.sessions.findById(sessionId);
  if (!session || session.user.toString() !== userId) {
    throw new Error("Unauthorized or Session not found");
  }

  // Revoke the session (mark it as revoked)
  await this.sessions.revokeById(sessionId); 
}


  // Revoke session by token
  async revokeByToken(token: string) {
    await this.sessions.revokeByToken(token);
  }
 async listMy(userId: string): Promise<ISession[]> {
    // Fetch all sessions for the given user
    return await this.sessions.listByUser(userId);
  }

  // Find a session by token
  async findByToken(token: string): Promise<ISession | null> {
    return this.sessions.findByToken(token);
  }
}
