import { ISession } from "../../databases/models/Session";

export interface ISessionRepository {
  create(data: Partial<ISession>): Promise<ISession>;
  findByToken(token: string): Promise<ISession | null>;
  findById(id: string): Promise<ISession | null>;
  listByUser(userId: string): Promise<ISession[]>;
  touch(token: string, patch: Partial<ISession>): Promise<void>;
  revokeById(id: string): Promise<void>;
  revokeByToken(token: string): Promise<void>;
}
