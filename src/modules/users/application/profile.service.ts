import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";

export const profileSchema = z.object({ name: z.string().min(2).max(80), workspace: z.string().min(2).max(80) });

export async function updateProfile(userId: string, tenantId: string, input: z.infer<typeof profileSchema>) {
  await db.update(users).set({ name: input.name }).where(eq(users.id, userId));
  await db.update(tenants).set({ name: input.workspace }).where(eq(tenants.id, tenantId));
}

export async function getWorkspaceName(tenantId: string): Promise<string> {
  const [row] = await db.select({ name: tenants.name }).from(tenants).where(eq(tenants.id, tenantId));
  return row?.name ?? "";
}
