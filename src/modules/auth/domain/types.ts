import { z } from "zod";
import type { PlanCode } from "@/modules/subscription/domain/plans";
import type { PermissionKey } from "@/modules/rbac/domain/permissions";

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  permissions: PermissionKey[];
  planCode: PlanCode;
}

export const SESSION_COOKIE = "wame_session";

const password = z.string().min(8, "Password must be at least 8 characters").max(128);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160).transform((v) => v.toLowerCase()),
  password,
  workspace: z.string().min(2).max(80).optional(),
});
export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});
export const forgotSchema = z.object({ email: z.string().email().transform((v) => v.toLowerCase()) });
export const resetSchema = z.object({ token: z.string().min(10), password });
export const passwordChangeSchema = z.object({ currentPassword: z.string().min(1), newPassword: password });
