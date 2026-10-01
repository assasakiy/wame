import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, permissions, rolePermissions, roles, sessions, tenants, users } from "@/db/schema";
import { env } from "@/shared/config/env";
import { hashPassword, randomToken, sha256, verifyPassword } from "@/shared/lib/crypto";
import { AppError } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { ensureSeed } from "@/modules/rbac/application/seed";
import { createSubscription, getSubscription } from "@/modules/subscription/application/subscription.service";
import type { PermissionKey } from "@/modules/rbac/domain/permissions";
import type { AuthUser } from "@/modules/auth/domain/types";

interface SessionMeta {
  userAgent?: string | null;
  ip?: string | null;
}

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

async function issueSession(userId: string, meta: SessionMeta): Promise<IssuedSession> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + env.sessionDays * 86_400_000);
  await db.insert(sessions).values({ userId, tokenHash: sha256(token), expiresAt, userAgent: meta.userAgent ?? null, ip: meta.ip ?? null });
  return { token, expiresAt };
}

export async function register(input: { name: string; email: string; password: string; workspace?: string }, meta: SessionMeta) {
  await ensureSeed();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email));
  if (existing) throw new AppError("Email is already registered", 409, "email_taken");
  const [role] = await db.select().from(roles).where(eq(roles.name, "USER"));
  const [tenant] = await db.insert(tenants).values({ name: input.workspace ?? `${input.name}'s workspace` }).returning();
  const [user] = await db
    .insert(users)
    .values({ tenantId: tenant.id, roleId: role.id, email: input.email, name: input.name, passwordHash: hashPassword(input.password) })
    .returning();
  await createSubscription(tenant.id, "FREE");
  await logger.info("auth.register", { email: input.email }, { tenantId: tenant.id, userId: user.id });
  return issueSession(user.id, meta);
}

export async function login(email: string, password: string, meta: SessionMeta) {
  await ensureSeed();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    await logger.warn("auth.login_failed", { email, ip: meta.ip });
    throw new AppError("Invalid email or password", 401, "invalid_credentials");
  }
  if (user.status !== "active") throw new AppError("Your account is suspended", 403, "suspended");
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await logger.info("auth.login", { email }, { tenantId: user.tenantId, userId: user.id });
  return issueSession(user.id, meta);
}

export async function logout(token: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
}

/** Refresh-token rotation: the old token is invalidated and a new one with a fresh expiry is issued. */
export async function rotateSession(token: string, meta: SessionMeta): Promise<IssuedSession | null> {
  const user = await getSessionUser(token);
  if (!user) return null;
  await logout(token);
  return issueSession(user.id, meta);
}

export async function getSessionUser(token: string): Promise<AuthUser | null> {
  const [row] = await db
    .select({ user: users, role: roles })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())));
  if (!row || row.user.status !== "active") return null;

  const perms = await db
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, row.role.id));
  const sub = await getSubscription(row.user.tenantId);
  return {
    id: row.user.id,
    tenantId: row.user.tenantId,
    email: row.user.email,
    name: row.user.name,
    role: row.role.name,
    permissions: perms.map((p) => p.key as PermissionKey),
    planCode: sub.planCode,
  };
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return null;
  const token = randomToken(32);
  await db.insert(passwordResets).values({ userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3_600_000) });
  await logger.info("auth.password_reset_requested", { email }, { tenantId: user.tenantId, userId: user.id });
  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, sha256(token)), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())));
  if (!reset) throw new AppError("Reset link is invalid or expired", 400, "invalid_token");
  await db.update(users).set({ passwordHash: hashPassword(newPassword) }).where(eq(users.id, reset.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, reset.id));
  await db.delete(sessions).where(eq(sessions.userId, reset.userId));
  await logger.info("auth.password_reset", {}, { userId: reset.userId });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) throw new AppError("Current password is incorrect", 400, "invalid_credentials");
  await db.update(users).set({ passwordHash: hashPassword(newPassword) }).where(eq(users.id, userId));
}
