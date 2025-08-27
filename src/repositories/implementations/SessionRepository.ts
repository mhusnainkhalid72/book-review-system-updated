// src/repositories/implementations/SessionRepository.ts
import { ISession, SessionModel } from "../../databases/models/Session";
import { ISessionRepository } from "../interfaces/ISessionRepository";
import { Types } from "mongoose";

export class SessionRepository implements ISessionRepository {
  async create(data: Partial<ISession>): Promise<ISession> {
    return await SessionModel.create(data);
  }

  async findByToken(token: string): Promise<ISession | null> {
    return await SessionModel.findOne({ token });
  }

  async findById(id: string): Promise<ISession | null> {
    return await SessionModel.findById(id);
  }

  async listByUser(userId: string): Promise<ISession[]> {
    return await SessionModel.find({ user: new Types.ObjectId(userId) }).sort({ lastActive: -1 });
  }

  async touch(token: string, patch: Partial<ISession>): Promise<void> {
    await SessionModel.updateOne({ token }, { $set: patch });
  }

  async revokeById(id: string): Promise<void> {
    await SessionModel.findByIdAndUpdate(id, { revoked: true });
  }

  async revokeByToken(token: string): Promise<void> {
    await SessionModel.updateOne({ token }, { $set: { revoked: true } });
  }
  
}
