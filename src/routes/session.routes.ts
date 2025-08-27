import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { SessionService } from "../services/SessionService";
import { SessionController } from "../controllers/SessionController";
import { requireToken } from "../middlewares/requireToken";
import { SessionRepository } from "../repositories/implementations/SessionRepository";

const sessionRepository = new SessionRepository(); // Create an instance of SessionService
const sessionService = new SessionService(sessionRepository);

const router = Router();
const sessionController = new SessionController(sessionService);
// Route to list active sessions for the logged-in user
router.get("/", requireToken, asyncHandler(sessionController.listMine.bind(SessionController)));


// Route to revoke a specific session by session ID
router.post("/revoke/:id", requireToken, asyncHandler(sessionController.revoke.bind(SessionController)));

// Route to revoke the current session based on the session token
router.post("/revoke-current", requireToken, asyncHandler(sessionController.revokeCurrent.bind(SessionController)));

export default router;
