// src/databases/models/User.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId; 
  name: string;
  email: string;
  password: string;
   role?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
  deviceToken?: string;
   extraPermissions?: string[]; 
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
     deviceToken: { type: String },
      role: { type: Schema.Types.ObjectId, ref: "Role", default: null }, 
       extraPermissions: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
