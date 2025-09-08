import { Request, Response, NextFunction } from "express";
import { SessionModel } from "../databases/models/Session";
import { UserModel } from "../databases/models/User";
import { AppError } from "../error/AppError";
import { IRole } from "../databases/models/Role";

export const requireToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return next(new AppError("No token provided", 401));

    const session = await SessionModel.findOne({ token, revoked: false });
    if (!session) return next(new AppError("Invalid or expired session token", 401));

    
    const user = await UserModel.findById(session.user).populate("role");
    if (!user) return next(new AppError("User not found", 404));

    
    const role = user.role as unknown as IRole | null;

    
    res.locals.user = {
      id: user._id.toString(),
      email: user.email,
      role: role ? role.name : null,
      permissions: role ? role.permissions : [],
      sessionId: session._id.toString(),
    };

    res.locals.sessionExtraPermissions = session.extraPermissions || [];

  
    session.lastActive = new Date();
    await session.save().catch((err) =>
      console.warn("Failed to update session.lastActive:", err.message)
    );

    next();
  } catch (err: any) {
    console.error("requireToken error:", err);
    return next(new AppError("Authentication failed", 401));
  }
};
