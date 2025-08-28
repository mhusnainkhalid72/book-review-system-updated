import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  rating: number;
  message: string;
  createdAt: Date;      
  updatedAt: Date;      
  createdAtPKT: string; 
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, trim: true },
    createdAtPKT: { type: String }, 
  },
  { timestamps: true } 
);


ReviewSchema.pre<IReview>("save", function (next) {
  const nowUTC = this.createdAt || new Date();

  this.createdAtPKT = new Date(nowUTC).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    hour12: true,
  });

  next();
});

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
