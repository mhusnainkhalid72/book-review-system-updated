import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  description?: string;
  user: Types.ObjectId; // owner
  averageRating: number; // denormalized for sorting
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const BookModel = mongoose.model<IBook>('Book', BookSchema);
