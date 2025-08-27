import { Request, Response } from "express";
import { SessionService } from "../services/SessionService";
import BaseResponseDto from "../dto/responses/BaseResponseDto";

export class SessionController {
  constructor(private sessions: SessionService) {}

  public async listMine(req: Request, res: Response) {
    const user = res.locals.user;
    const data = await this.sessions.listByUser(user.id); 
    new BaseResponseDto(res, 200, "pass", "Sessions fetched", data);
  }

public async revoke(req: Request, res: Response) {
    try {
      const user = res.locals.user;  // Get user from session
      const sessionId = req.params.id; // Get sessionId from URL parameters

      // Pass both userId and sessionId to the revoke method
      await this.sessions.revoke(user.id, sessionId);

      res.status(200).json({ message: "Session revoked" });
    } catch (err: any) {
      return res.status(500).json({ message: "Failed to revoke session", error: err.message });
    }
  }



  public async revokeCurrent(req: Request, res: Response) {
    try {
      const token = (req.headers["x-session-token"] as string) || null;
      if (!token) return new BaseResponseDto(res, 400, "fail", "Missing X-Session-Token");
      await this.sessions.revokeByToken(token);
      new BaseResponseDto(res, 200, "pass", "Current session revoked");
    } catch (err: any) {
      new BaseResponseDto(res, 500, "fail", err.message || "Failed to revoke current session");
    }
  }
}
