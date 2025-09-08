import jwt from "jsonwebtoken";
import { UserModel } from "../databases/models/User";

export class RefreshTokenService {
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret");
      const user = await UserModel.findById(decoded.userId).populate("role");
      if (!user) throw new Error("User not found");

      if (!user.refreshTokens.includes(refreshToken)) {
        throw new Error("Refresh token revoked");
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET || "refresh_secret",
        { expiresIn: "7d" }
      );

      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
  }
}
