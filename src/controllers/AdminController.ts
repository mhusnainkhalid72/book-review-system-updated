// src/controllers/AdminController.ts
import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/AdminService";
import { UserRepository } from "../repositories/implementations/UserRepository";
import { RoleRepository } from "../repositories/implementations/RoleRepository";
import { AppError } from "../error/AppError";


const adminService = new AdminService(new UserRepository(), new RoleRepository());

export class AdminController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.listUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

 static async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleName } = req.body; // must be { "roleName": "admin" }
      const userId = req.params.id;

      if (!roleName) {
        throw new AppError("Role name is required", 400);
      }

      const user = await adminService.assignRole(userId, roleName);
      if (!user) {
        throw new AppError("User or role not found", 404);
      }

      res.json({
        success: true,
        message: ` Assigned role '${roleName}' to user ${user.email}`,
        user,
      });
    } catch (err) {
      next(err);
    }
  }
}