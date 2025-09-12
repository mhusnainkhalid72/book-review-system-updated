import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { ReportService } from "../services/ReportService";
import { ReviewService } from "../services/ReviewService";
import { ReviewRepository } from "../repositories/implementations/ReviewRepository";
import { BookRepository } from "../repositories/implementations/BookRepository";
import { asyncHandler } from "../lib/asyncHandler";
import { requireToken } from "../middlewares/requireToken";
import { io } from "../socket";
const router = Router();

const reviewRepo = new ReviewRepository();
const bookRepo = new BookRepository();
const reviewService = new ReviewService(reviewRepo, bookRepo);
const reportService = new ReportService();

const controller = new ReportController(reportService, reviewService);

// Report review
router.post("/", requireToken, asyncHandler(controller.reportReview.bind(controller)));

// List pending reports (admin)
router.get("/", requireToken, asyncHandler(controller.listReports.bind(controller)));

// Resolve report (admin)
router.post("/:id/resolve", requireToken, asyncHandler(controller.resolveReport.bind(controller)));

// Chat APIs
router.post("/chat/send", requireToken, asyncHandler(controller.sendMessage.bind(controller)));
router.get("/chat/history/:userId", requireToken, asyncHandler(controller.getChatHistory.bind(controller)));

export default router;
