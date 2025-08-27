// src/controllers/AuthController.ts
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { SessionService } from "../services/SessionService";
import { UserModel } from "../databases/models/User";
import LoginResponseDto from "../dto/responses/auth/LoginResponseDto";
import RegisterResponseDto from "../dto/responses/auth/RegisterResponseDto";

export class AuthController {
  constructor(private auth: AuthService, private sessions: SessionService) {}

  // Handle register
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

  // Handle login
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

  // Handle logout
  public async logout(req: Request, res: Response) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (token) {
      await this.sessions.revokeByToken(token);
    }

    res.status(200).json({ message: "Logged out successfully" });
  }
}
