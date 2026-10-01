import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { randomToken, sha256 } from "@/shared/lib/crypto";
import { AppError } from "@/shared/lib/http";
import { assertFeature } from "@/modules/subscription/application/limits";

export const apiKeyInputSchema = z.object({ name: z.string().min(2).max(60) });

export const listApiKeys = (tenantId: string) =>
  db
    .select({ id: apiKeys.id, name: apiKeys.name, prefix: apiKeys.prefix, lastUsedAt: apiKeys.lastUsedAt, revokedAt: apiKeys.revokedAt, createdAt: apiKeys.createdAt })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenantId))
    .orderBy(desc(apiKeys.createdAt));

/** The raw key is returned exactly once; only its SHA-256 hash is stored. */
export async function createApiKey(tenantId: string, userId: string, name: string) {
  await assertFeature(tenantId, "apiAccess");
  const key = `wame_${randomToken(30)}`;
  const [row] = await db.insert(apiKeys).values({ tenantId, userId, name, prefix: key.slice(0, 12), keyHash: sha256(key) }).returning({ id: apiKeys.id });
  return { id: row.id, key };
}

export async function revokeApiKey(tenantId: string, id: string) {
  const res = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, tenantId)))
    .returning({ id: apiKeys.id });
  if (!res.length) throw new AppError("API key not found", 404, "not_found");
}

export async function findActiveKey(raw: string) {
  const [row] = await db.select().from(apiKeys).where(and(eq(apiKeys.keyHash, sha256(raw)), isNull(apiKeys.revokedAt)));
  return row ?? null;
}

export const touchApiKey = (id: string) => db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
