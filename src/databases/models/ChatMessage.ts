import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChatMessage extends Document {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  message: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const ChatMessageModel = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
