import { eq } from "drizzle-orm";
import { db } from "@/db";
import { permissions, plans, rolePermissions, roles, tenants, users } from "@/db/schema";
import { env } from "@/shared/config/env";
import { hashPassword } from "@/shared/lib/crypto";
import { logger } from "@/shared/lib/logger";
import { ALL_PERMISSIONS, PERMISSIONS, SYSTEM_ROLES } from "@/modules/rbac/domain/permissions";
import { DEFAULT_PLANS } from "@/modules/subscription/domain/plans";
import { createSubscription } from "@/modules/subscription/application/subscription.service";

const g = globalThis as typeof globalThis & { __wameSeed?: Promise<void> };

/** Idempotent bootstrap of permissions, system roles, plans and the first super administrator. */
export function ensureSeed(): Promise<void> {
  if (!g.__wameSeed) {
    g.__wameSeed = runSeed().catch((error) => {
      g.__wameSeed = undefined;
      throw error;
    });
  }
  return g.__wameSeed;
}

async function runSeed(): Promise<void> {
  await db
    .insert(permissions)
    .values(ALL_PERMISSIONS.map((key) => ({ key, description: PERMISSIONS[key] })))
    .onConflictDoNothing();
  const allPerms = await db.select().from(permissions);

  for (const [name, def] of Object.entries(SYSTEM_ROLES)) {
    let [role] = await db.select().from(roles).where(eq(roles.name, name));
    if (!role) {
      [role] = await db.insert(roles).values({ name, description: def.description, isSystem: true }).returning();
      await db
        .insert(rolePermissions)
        .values(allPerms.filter((p) => def.permissions.includes(p.key as never)).map((p) => ({ roleId: role.id, permissionId: p.id })))
        .onConflictDoNothing();
    }
    if (name === "SUPER_ADMIN") {
      // the super administrator always holds every permission, including newly added ones
      await db.insert(rolePermissions).values(allPerms.map((p) => ({ roleId: role.id, permissionId: p.id }))).onConflictDoNothing();
    }
  }

  for (const plan of DEFAULT_PLANS) {
    await db
      .insert(plans)
      .values(plan)
      .onConflictDoUpdate({
        target: plans.code,
        set: { name: plan.name, description: plan.description, priceMonthly: plan.priceMonthly, limits: plan.limits, sortOrder: plan.sortOrder },
      });
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, env.seedAdminEmail));
  if (!existing) {
    const [superRole] = await db.select().from(roles).where(eq(roles.name, "SUPER_ADMIN"));
    const [tenant] = await db.insert(tenants).values({ name: "WAME Administration" }).returning();
    await db.insert(users).values({
      tenantId: tenant.id, roleId: superRole.id, email: env.seedAdminEmail, name: "Super Administrator", passwordHash: hashPassword(env.seedAdminPassword),
    });
    await createSubscription(tenant.id, "PLUS");
    await logger.info("seed.admin_created", { email: env.seedAdminEmail });
  }
}
