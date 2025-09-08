// src/repositories/implementations/RoleRepository.ts
import { IRole, RoleModel } from "../../databases/models/Role";
import { IRoleRepository } from "../interfaces/IRoleRepository";

export class RoleRepository implements IRoleRepository {
  async findByName(name: string): Promise<IRole | null> {
    return await RoleModel.findOne({ name });
  }

  async findById(id: string): Promise<IRole | null> {
    return await RoleModel.findById(id);
  }

  async getAll(): Promise<IRole[]> {
    return await RoleModel.find();
  }
}
