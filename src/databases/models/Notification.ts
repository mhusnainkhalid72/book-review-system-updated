// FILE: src/databases/models/Notification.ts
import { Schema, model, Types } from 'mongoose';

interface Notification {
  user: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'review' | 'daily';
}

const NotificationSchema = new Schema<Notification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['review', 'daily'], default: 'review' },
});

export const NotificationModel = model<Notification>('Notification', NotificationSchema);
