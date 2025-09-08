// src/repositories/interfaces/IRoleRepository.ts
import { IRole } from "../../databases/models/Role";

export interface IRoleRepository {
  findByName(name: string): Promise<IRole | null>;
  findById(id: string): Promise<IRole | null>;
  getAll(): Promise<IRole[]>;
}
