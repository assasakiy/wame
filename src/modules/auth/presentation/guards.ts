import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppError } from "@/shared/lib/http";
import { getSessionUser } from "@/modules/auth/application/auth.service";
import { SESSION_COOKIE, type AuthUser } from "@/modules/auth/domain/types";
import type { PermissionKey } from "@/modules/rbac/domain/permissions";

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? getSessionUser(token) : null;
});

export const can = (user: AuthUser, permission: PermissionKey) => user.permissions.includes(permission);

/** Server-component guard: redirects anonymous visitors to /login. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Server-component guard: redirects users that lack the permission. */
export async function requirePagePermission(permission: PermissionKey, fallback = "/dashboard"): Promise<AuthUser> {
  const user = await requireUser();
  if (!can(user, permission)) redirect(fallback);
  return user;
}

/** Route-handler guard: throws 401/403 as JSON errors. */
export async function requireApiUser(permission?: PermissionKey): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized", 401, "unauthorized");
  if (permission && !can(user, permission)) throw new AppError("Forbidden", 403, "forbidden");
  return user;
}
