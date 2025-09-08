import { Request, Response, NextFunction } from "express";
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

  // 🔹 1. Check extra session permissions
  if (hasAnyPermission(sessionExtra, [requiredPermission, '*'])) return true;

  // 🔹 2. Get user from locals (already populated in requireToken.ts)
  const userRef = (req.res as any)?.locals?.user;
  if (!userRef || !userRef.id) return false;

  const rolePermissions: string[] = userRef.permissions || [];

  // 🔹 3. Admin "*" shortcut
  if (hasAnyPermission(rolePermissions, [requiredPermission, '*'])) return true;

  // 🔹 4. Own-resource check
  if (
    requiredPermission.endsWith('.own') &&
    resourceOwnerId &&
    resourceOwnerId === userRef.id
  ) {
    if (hasAnyPermission(rolePermissions, [requiredPermission])) return true;
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
     console.log("PERM DEBUG ->", {
        required: requiredPermission,
        user: res.locals?.user,                          // set by requireToken
        sessionExtra: res.locals?.sessionExtraPermissions
      });

      const ok = await userHasPermission(req, requiredPermission, ownerId);
      if (ok) return next();

      return next(new AppError("Forbidden: insufficient permissions", 403));
    } catch (err: any) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
  };
}
