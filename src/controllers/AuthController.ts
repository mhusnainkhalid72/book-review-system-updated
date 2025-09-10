// src/controllers/AuthController.ts
import { Request, Response } from "express";
import crypto from "crypto";
import { AuthService } from "../services/AuthService";
import { SessionService } from "../services/SessionService";
import { UserModel } from "../databases/models/User";
import { AppError } from "../error/AppError";
import { SessionModel } from "../databases/models/Session";
import { RoleModel } from "../databases/models/Role";
import { RefreshTokenModel } from "../databases/models/RefreshToken";

import { sendMailViaMailcow } from "../services/mailcowService";


const ACCESS_TTL_MS = 15 * 60 * 1000;           // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function newOpaqueToken(len = 32) {
  return crypto.randomBytes(len).toString("base64url"); // opaque (not JWT)
}

export class AuthController {
  constructor(private auth: AuthService, private sessions: SessionService) {}

  // REGISTER -> returns opaque access + opaque refresh
  public async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await UserModel.create({ email, password, name });

    // Access token (session-based)
    const { token } = await this.sessions.createForLogin(newUser._id.toString(), req);

    // Refresh token (opaque, 7 days)
    const refreshToken = newOpaqueToken();
    await RefreshTokenModel.create({
      user: newUser._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      revoked: false,
    });

    res.setHeader("Authorization", `Bearer ${token}`);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken: token,
      refreshToken,
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
      expiresIn: ACCESS_TTL_MS / 1000,
    });
    
  }

  // LOGIN -> returns opaque access + opaque refresh
// LOGIN -> returns opaque access + opaque refresh

  public async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = newOpaqueToken();
    const refreshToken = newOpaqueToken();

    await RefreshTokenModel.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      revoked: false,
    });

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      success: true,
      accessToken: token,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name },
      expiresIn: ACCESS_TTL_MS / 1000,
    });

    // Fire and forget mail
    (async () => {
      try {
        const subject = "New login to your account";
        const text = `Hello ${user.name || user.email},

A login to your account was detected.
Time: ${new Date().toISOString()}
IP: ${req.ip || req.connection.remoteAddress}`;

        const result = await sendMailViaMailcow({
          to: user.email,
          subject,
          text,
        });

        if (!result.ok) {
          console.error("Login mail via Mailcow failed:", result.error);
        }
      } catch (err: any) {
        console.error("Unexpected error while sending login mail:", err?.message || err);
      }
    })();
  }

 
  public async logout(req: Request, res: Response) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    try {
      const session = await this.sessions.findByToken(token);
      if (!session) {
        return res.status(400).json({ message: "Session not found" });
      }

      const userId = session.user.toString();
      await this.sessions.revoke(userId, session._id.toString());

      // Optional refresh token revocation on logout:
      const body = req.body as { refreshToken?: string };
      if (body?.refreshToken && body.refreshToken.trim()) {
        await RefreshTokenModel.updateOne(
          { user: userId, token: body.refreshToken.trim(), revoked: false },
          { $set: { revoked: true } }
        );
      }

      return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err: any) {
      return res.status(500).json({ message: "Error logging out", error: err.message });
    }
  }

  // Inspect current session by access token
  public async getSession(req: Request, res: Response) {
    try {
      const header = req.headers["authorization"];
      const token = typeof header === "string" ? header.split(" ")[1] : undefined;
      if (!token) {
        return res.status(400).json({ success: false, message: "Token missing" });
      }

      const session = await SessionModel.findOne({ token, revoked: false }).lean();
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }

      const user = await UserModel.findById(session.user).lean();
      let role = null;
      if (user && (user as any).role) {
        role = await RoleModel.findById((user as any).role).lean();
      }

      return res.status(200).json({
        success: true,
        session: {
          ...session,
          extraPermissions: (session as any).extraPermissions || [],
          user: user
            ? { _id: user._id, name: user.name, email: user.email, role: role ? role.name : null }
            : null,
          rolePermissions: role ? role.permissions : [],
        },
      });
    } catch (err: any) {
      console.error("Get session error:", err);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
}
