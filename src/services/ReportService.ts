// src/services/ReportService.ts
import { ReviewReportModel, IReviewReport } from "../databases/models/ReviewReport";
import { ReviewModel } from "../databases/models/Review";
import { ChatMessageModel } from "../databases/models/ChatMessage";
import { AppError } from "../error/AppError";
import { Server } from "socket.io";
import { Types } from "mongoose";
import { io } from "../socket";

export class ReportService {
  // Lazy getter ensures io is initialized
  private getIO(): Server {
    if (!io) throw new Error("Socket.IO not initialized yet");
    return io;
  }

  // Create a new report
  async createReport(
    reviewId: string,
    bookId: string,
    reportedByUserId: string,
    reason?: string
  ): Promise<IReviewReport> {
    const report = await ReviewReportModel.create({ reviewId, bookId, reportedByUserId, reason });

    try {
      this.getIO().to("adminRoom").emit("newReport", report);
      console.log("New report emitted to adminRoom:", report._id);
    } catch (err) {
      console.error("Error emitting report to adminRoom:", err);
    }

    return report;
  }

  // Fetch pending reports for admin
  async getPendingReports() {
    return await ReviewReportModel.find({ status: "pending" })
      .populate("reviewId")
      .populate("reportedByUserId")
      .populate("bookId")
      .lean();
  }

  // Resolve a report (admin action)
  async resolveReport(
    reportId: string,
    action: "delete" | "warn",
    adminId: string,
    message?: string
  ) {
    const report = await ReviewReportModel.findById(reportId);
    if (!report) throw new AppError("Report not found", 404);

    report.status = "resolved";
    report.resolvedByAdminId = new Types.ObjectId(adminId);

    if (action === "delete") {
      await ReviewModel.findByIdAndDelete(report.reviewId);
      console.log(`Review ${report.reviewId} deleted by admin ${adminId}`);
    } else if (action === "warn" && message) {
      try {
        const chatMsg = await ChatMessageModel.create({
          fromUserId: adminId,
          toUserId: report.reportedByUserId,
          message,
        });
        console.log("Warning message saved to DB:", chatMsg._id);

        const roomSockets = this.getIO().sockets.adapter.rooms.get(report.reportedByUserId.toString());
        if (!roomSockets || roomSockets.size === 0) {
          console.log(`Reviewer ${report.reportedByUserId} is offline. Message stored for later.`);
        }

        this.getIO().to(report.reportedByUserId.toString()).emit("sendMessage", {
          fromUserId: adminId,
          toUserId: report.reportedByUserId,
          message,
        });
      } catch (err) {
        console.error("Error sending warning message:", err);
      }
    }

    await report.save();
    return report;
  }

  // Send chat message between user and admin
  async sendMessage(fromUserId: string, toUserId: string, message: string) {
    try {
      const msg = await ChatMessageModel.create({ fromUserId, toUserId, message });

      const roomSockets = this.getIO().sockets.adapter.rooms.get(toUserId.toString());
      if (!roomSockets || roomSockets.size === 0) {
        console.log(`Recipient ${toUserId} is offline. Message stored in DB: ${msg._id}`);
      }

      this.getIO().to(toUserId.toString()).emit("sendMessage", msg);
      return msg;
    } catch (err) {
      console.error("Error sending chat message:", err);
      throw new AppError("Failed to send message", 500);
    }
  }

  // Fetch chat history between user and admin
  async getChatHistory(userId: string, adminId: string) {
    return await ChatMessageModel.find({
      $or: [
        { fromUserId: userId, toUserId: adminId },
        { fromUserId: adminId, toUserId: userId },
      ],
    }).sort({ createdAt: 1 }).lean();
  }
}
