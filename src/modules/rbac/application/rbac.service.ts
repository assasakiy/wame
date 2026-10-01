import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { permissions, rolePermissions, roles, users } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { ALL_PERMISSIONS } from "@/modules/rbac/domain/permissions";

export const roleInputSchema = z.object({
  name: z.string().min(2).max(40).regex(/^[A-Z0-9_]+$/, "Use UPPER_SNAKE_CASE"),
  description: z.string().max(200).default(""),
  permissions: z.array(z.enum(ALL_PERMISSIONS as [string, ...string[]])),
});

export async function listRolesWithPermissions() {
  const rows = await db
    .select({ role: roles, key: permissions.key, users: sql<number>`(select count(*)::int from ${users} where ${users.roleId} = ${roles.id})` })
    .from(roles)
    .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .leftJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .orderBy(roles.name);
  const map = new Map<string, { id: string; name: string; description: string; isSystem: boolean; users: number; permissions: string[] }>();
  for (const r of rows) {
    const entry = map.get(r.role.id) ?? { id: r.role.id, name: r.role.name, description: r.role.description, isSystem: r.role.isSystem, users: r.users, permissions: [] };
    if (r.key) entry.permissions.push(r.key);
    map.set(r.role.id, entry);
  }
  return [...map.values()];
}

async function setRolePermissions(roleId: string, keys: string[]) {
  const perms = keys.length ? await db.select().from(permissions).where(inArray(permissions.key, keys)) : [];
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (perms.length) await db.insert(rolePermissions).values(perms.map((p) => ({ roleId, permissionId: p.id })));
}

export async function createRole(input: z.infer<typeof roleInputSchema>) {
  const [exists] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, input.name));
  if (exists) throw new AppError("Role name already exists", 409, "conflict");
  const [role] = await db.insert(roles).values({ name: input.name, description: input.description }).returning();
  await setRolePermissions(role.id, input.permissions);
  return role;
}

export async function updateRolePermissions(roleId: string, keys: string[]) {
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
  if (!role) throw new AppError("Role not found", 404, "not_found");
  if (role.name === "SUPER_ADMIN") throw new AppError("SUPER_ADMIN permissions are immutable", 400, "immutable");
  await setRolePermissions(roleId, keys);
}

export async function deleteRole(roleId: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
  if (!role) throw new AppError("Role not found", 404, "not_found");
  if (role.isSystem) throw new AppError("System roles cannot be deleted", 400, "immutable");
  const [inUse] = await db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.roleId, roleId));
  if (inUse.n > 0) throw new AppError("Role is still assigned to users", 409, "conflict");
  await db.delete(roles).where(eq(roles.id, roleId));
}
