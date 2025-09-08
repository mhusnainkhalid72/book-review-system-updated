// src/services/AdminService.ts
import { IUser } from "../databases/models/User";
import { IRole } from "../databases/models/Role";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IRoleRepository } from "../repositories/interfaces/IRoleRepository";

export class AdminService {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository
  ) {}

  async listUsers(): Promise<IUser[]> {
    return await this.userRepository.findAllWithRoles();
  }

  async assignRole(userId: string, roleName: string): Promise<IUser> {
    const role = await this.roleRepository.findByName(roleName);
    if (!role) throw new Error("Role not found");

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    user.role = role._id;
    await (user as any).save();

    return user;
  }
}
