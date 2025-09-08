import { Request, Response, NextFunction } from "express";
import { RefreshTokenService } from "../services/RefreshTokenService";

export class RefreshTokenController {
  private refreshTokenService: RefreshTokenService;

  constructor(refreshTokenService: RefreshTokenService) {
    this.refreshTokenService = refreshTokenService;
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Refresh token required" });
      }

      const tokens = await this.refreshTokenService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        ...tokens, // { accessToken, refreshToken }
      });
    } catch (err) {
      next(err);
    }
  }
}
