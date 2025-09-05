// src/middlewares/authorization.ts
import { Request, Response, NextFunction } from "express";
import { UserModel } from "../databases/models/User";
import { RoleModel } from "../databases/models/Role";
import { anyPermissionMatches } from "../lib/RBAC";
import { AppError } from "../error/AppError";

function hasAnyPermission(rolePermissions: string[], required: string[]): boolean {
  return required.some(p => anyPermissionMatches(rolePermissions, p));
}

export async function userHasPermission(
  req: Request,
  requiredPermission: string,
  resourceOwnerId?: string
): Promise<boolean> {
  const sessionExtra: string[] = (req.res as any)?.locals?.sessionExtraPermissions || [];

  
  if (hasAnyPermission(sessionExtra, [requiredPermission, '*'])) return true;

  const userRef = (req.res as any)?.locals?.user;
  if (!userRef || !userRef.id) return false;

  const user = await UserModel.findById(userRef.id).lean();
  if (!user || !user.role) return false;

  const role = await RoleModel.findById(user.role).lean();
  if (!role || !role.permissions) return false;


  if (hasAnyPermission(role.permissions, [requiredPermission, '*'])) return true;


  if (requiredPermission.endsWith('.own') && resourceOwnerId && resourceOwnerId === userRef.id) {
    if (hasAnyPermission(role.permissions, [requiredPermission])) return true;
  }

  return false;
}

export function requirePermission(
  requiredPermission: string,
  resourceOwnerIdGetter?: (req: Request) => Promise<string | null> | string | null
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let ownerId: string | undefined;
      if (resourceOwnerIdGetter) {
        const maybe =
          typeof resourceOwnerIdGetter === "function"
            ? await (resourceOwnerIdGetter as any)(req)
            : resourceOwnerIdGetter;
        if (maybe) ownerId = maybe as string;
      }

      const ok = await userHasPermission(req, requiredPermission, ownerId);
      if (ok) return next();

      return next(new AppError("Forbidden: insufficient permissions", 403));
    } catch (err: any) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
  };
}
