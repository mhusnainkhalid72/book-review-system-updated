import { Request, Response, NextFunction } from "express";
import { RefreshTokenService } from "../services/RefreshTokenService";

export class RefreshTokenController {
  private refreshTokenService: RefreshTokenService;

  constructor(refreshTokenService: RefreshTokenService) {
    this.refreshTokenService = refreshTokenService;
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
     try {
    
      const { refreshToken } = req.body as { refreshToken?: unknown };
      if (typeof refreshToken !== "string" || !refreshToken.trim()) {
        return res.status(400).json({ success: false, message: "refreshToken is required" });
      }

     const tokens = await this.refreshTokenService.refreshAccessToken(refreshToken.trim(), req);


      res.json({
        success: true,
        ...tokens, 
      });
    } catch (err) {
      next(err);
    }
  }
}
