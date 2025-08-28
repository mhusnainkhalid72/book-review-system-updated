// src/controllers/AuthController.ts
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { SessionService } from "../services/SessionService";
import { UserModel } from "../databases/models/User";
import LoginResponseDto from "../dto/responses/auth/LoginResponseDto";
import RegisterResponseDto from "../dto/responses/auth/RegisterResponseDto";
import { AppError } from "../error/AppError"; // Assuming you have an AppError class for error handling

export class AuthController {
  constructor(private auth: AuthService, private sessions: SessionService) {}

  // Handle user registration
  public async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await UserModel.create({ email, password, name });
    const { token, session } = await this.sessions.createForLogin(newUser._id.toString(), req);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  }

  // Handle user login
  public async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { token, session } = await this.sessions.createForLogin(user._id.toString(), req);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({ token, user });
  }

  // Handle user logout
public async logout(req: Request, res: Response) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Get the token from the Authorization header

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    try {
      // Find the session using the token
      const session = await this.sessions.findByToken(token);  // This will find the session from the database based on the token

      if (!session) {
        return res.status(400).json({ message: "Session not found" });
      }

      const userId = session.user.toString();  // Get userId from the session

      // Revoke the session using both userId and sessionId
      await this.sessions.revoke(userId, session._id.toString());  // Pass both userId and sessionId to revoke the session

      res.status(200).json({ message: "Logged out successfully" });
    } catch (err: any) {
      return res.status(500).json({ message: "Error logging out", error: err.message });
    }
  }
  // Add inside AuthController class
public async getSession(req: Request, res: Response) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    const session = await this.sessions.findByToken(token);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    return res.status(200).json({ success: true, session });
  } catch (err: any) {
    console.error("Get session error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

}