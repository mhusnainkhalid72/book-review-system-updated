import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReviewReport extends Document {
  reviewId: Types.ObjectId;
  bookId: Types.ObjectId;
  reportedByUserId: Types.ObjectId;
  status: "pending" | "resolved" | "rejected";
  reason?: string;
  resolvedByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewReportSchema = new Schema<IReviewReport>(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    reportedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "resolved", "rejected"], default: "pending" },
    reason: { type: String },
    resolvedByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const ReviewReportModel = mongoose.model<IReviewReport>(
  "ReviewReport",
  ReviewReportSchema
);
