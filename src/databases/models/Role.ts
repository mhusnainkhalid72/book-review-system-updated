// src/databases/models/Role.ts


import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string; 
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
