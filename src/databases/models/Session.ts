
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  token: string;
  ip?: string | null;
  mac?: string | null;
  userAgent?: string | null;
  lastActive: Date;
  createdAt: Date;
  expiresAt?: Date | null;
  revoked: boolean;
  isOnline: boolean;
}

const SessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    ip: { type: String, default: null },
    mac: { type: String, default: null },
    userAgent: { type: String, default: null },
    lastActive: { type: Date, required: true, default: () => new Date() },
    expiresAt: { type: Date, default: null },
    revoked: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

SessionSchema.virtual("isOnline").get(function (this: ISession) {
  const FIVE_MIN = 5 * 60 * 1000;  // 5 minutes in milliseconds
  const diff = Date.now() - new Date(this.lastActive).getTime();
  return !this.revoked && diff <= FIVE_MIN;
});

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<ISession>("Session", SessionSchema);
