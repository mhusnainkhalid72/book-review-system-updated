import crypto from "crypto";
import { Request } from "express";
import { RefreshTokenModel } from "../databases/models/RefreshToken";
import { SessionService } from "./SessionService";
import { SessionRepository } from "../repositories/implementations/SessionRepository";
import { AppError } from "../error/AppError";

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function newOpaqueToken(len = 32) {
  return crypto.randomBytes(len).toString("base64url");
}

export class RefreshTokenService {
  private sessionService: SessionService;

  constructor() {
    // build a sessionService instance internally (matches how routes create this service)
    const sessionRepository = new SessionRepository();
    this.sessionService = new SessionService(sessionRepository);
  }

  public async refreshAccessToken(refreshToken: string, req?: Request) {
    const rt = await RefreshTokenModel.findOne({ token: refreshToken, revoked: false });
    if (!rt) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Check expiry (TTL will delete eventually, but enforce now)
    if (rt.expiresAt.getTime() <= Date.now()) {
      rt.revoked = true;
      await rt.save();
      throw new AppError("Refresh token expired", 401);
    }

    // Rotate refresh token (best practice)
    rt.revoked = true;
    await rt.save();

    const newRefresh = newOpaqueToken();
    await RefreshTokenModel.create({
      user: rt.user,
      token: newRefresh,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      revoked: false,
    });

    // Mint a new access token (opaque session token)
    const { token: accessToken } = await this.sessionService.createForLogin(rt.user.toString(), req!);

    return {
      accessToken,
      refreshToken: newRefresh,
      expiresIn: ACCESS_TTL_MS / 1000,
    };
  }
}
