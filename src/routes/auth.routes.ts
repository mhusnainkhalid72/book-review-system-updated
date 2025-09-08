// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { SessionService } from "../services/SessionService";
import { asyncHandler } from "../lib/asyncHandler";
import { validate } from "../middlewares/validationMiddleware";
import { RegisterDTOSchema } from "../dto/request/auth/RegisterDTO";
import { LoginDTOSchema } from "../dto/request/auth/LoginDTO";
import { UserRepository } from "../repositories/implementations/UserRepository";
import { SessionRepository } from "../repositories/implementations/SessionRepository";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { RefreshTokenService } from "../services/RefreshTokenService";

const router = Router();

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const authService = new AuthService(userRepository);
const sessionService = new SessionService(sessionRepository);
const controller = new AuthController(authService, sessionService);
const refreshTokenService = new RefreshTokenService();
const refreshController = new RefreshTokenController(refreshTokenService);


router.post("/register", validate(RegisterDTOSchema), asyncHandler(controller.register.bind(controller)));
router.post("/login", validate(LoginDTOSchema), asyncHandler(controller.login.bind(controller)));
router.post("/logout", asyncHandler(controller.logout.bind(controller)));
router.post("/refresh", asyncHandler(refreshController.refresh.bind(refreshController)));



export default router;
