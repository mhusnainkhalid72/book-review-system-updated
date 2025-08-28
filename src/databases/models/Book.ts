import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description?: string;
  user: Types.ObjectId;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
  createdAtPKT: string;   
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    averageRating: { type: Number, default: 0 },
    createdAtPKT: { type: String }, 
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

BookSchema.pre<IBook>("save", function (next) {
  const nowUTC = this.createdAt || new Date();

  this.createdAtPKT = new Date(nowUTC).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi", 
    hour12: true,
  });

  next();
});

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
