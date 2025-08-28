import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { SessionService } from "../services/SessionService";
import { SessionController } from "../controllers/SessionController";
import { requireToken } from "../middlewares/requireToken";
import { SessionRepository } from "../repositories/implementations/SessionRepository";

const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);

const router = Router();
const sessionController = new SessionController(sessionService);

router.get("/", requireToken, asyncHandler(sessionController.listMine.bind(sessionController)));
router.post("/revoke/:id", requireToken, asyncHandler(sessionController.revoke.bind(sessionController)));
router.post("/revoke-current", requireToken, asyncHandler(sessionController.revokeCurrent.bind(sessionController)));

export default router;
