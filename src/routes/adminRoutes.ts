// src/routes/adminRoutes.ts
import express from "express";
import { requirePermission } from "../middlewares/authorization";
import { requireToken } from "../middlewares/requireToken";
import { AdminController } from "../controllers/AdminController";

const router = express.Router();

// ✅ All admin routes require authentication first
router.use(requireToken);

// ✅ Get all users (requires "users.read.any")
router.get(
  "/users",
  requirePermission("users.read.any"),
  AdminController.getAllUsers
);

// ✅ Assign a role to a user (requires "roles.assign")
router.post(
  "/users/:id/assign-role",
  requirePermission("roles.assign"),
  AdminController.assignRole
);

export default router;
