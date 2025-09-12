import { Request, Response } from "express";
import { ReportService } from "../services/ReportService";
import { ReviewService } from "../services/ReviewService";

export class ReportController {
  constructor(private reports: ReportService, private reviews: ReviewService) {}

  public async reportReview(req: Request, res: Response) {
    try {
      const user = res.locals.user;
      const { reviewId, reason } = req.body;

      const review = await this.reviews.getById(reviewId);
      if (!review) return res.status(404).json({ success: false, message: "Review not found" });

      if (review.user.toString() === user.id)
        return res.status(400).json({ success: false, message: "Cannot report your own review" });

      const report = await this.reports.createReport(reviewId, review.book.toString(), user.id, reason);

      res.json({ success: true, message: "Report submitted", report });
    } catch (err: any) {
      console.error("Error in reportReview controller:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async listReports(req: Request, res: Response) {
    try {
      const reports = await this.reports.getPendingReports();
      res.json({ success: true, reports });
    } catch (err: any) {
      console.error("Error in listReports controller:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async resolveReport(req: Request, res: Response) {
    try {
      const admin = res.locals.user;
      const { action, message } = req.body;
      const { id } = req.params;

      const report = await this.reports.resolveReport(id, action, admin.id, message);

      res.json({ success: true, message: "Report resolved", report });
    } catch (err: any) {
      console.error("Error in resolveReport controller:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async sendMessage(req: Request, res: Response) {
    try {
      const { toUserId, message } = req.body;
      const fromUserId = res.locals.user.id;

      const msg = await this.reports.sendMessage(fromUserId, toUserId, message);

      res.json({ success: true, message: "Message sent", msg });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const adminId = res.locals.user.id; // assuming admin fetching

      const messages = await this.reports.getChatHistory(userId, adminId);

      res.json({ success: true, messages });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
