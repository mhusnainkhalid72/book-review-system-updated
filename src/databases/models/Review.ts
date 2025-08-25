import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  book: Types.ObjectId;
  user: Types.ObjectId;
  rating: number; // 0..5 inclusive
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    message: { type: String, default: '' }
  },
  { timestamps: true ,
      versionKey: false   }
);

// One review per user per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
