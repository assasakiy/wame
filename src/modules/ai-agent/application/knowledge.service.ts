import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { AppError } from "@/shared/lib/http";

export const knowledgeInputSchema = z.object({ title: z.string().min(2).max(120), content: z.string().min(5).max(4000) });

export const listKnowledge = (tenantId: string) =>
  db.select().from(knowledgeBase).where(eq(knowledgeBase.tenantId, tenantId)).orderBy(desc(knowledgeBase.createdAt));

export async function addKnowledge(tenantId: string, input: z.infer<typeof knowledgeInputSchema>) {
  const [row] = await db.insert(knowledgeBase).values({ tenantId, ...input }).returning();
  return row;
}

export async function deleteKnowledge(tenantId: string, id: string) {
  const res = await db.delete(knowledgeBase).where(and(eq(knowledgeBase.id, id), eq(knowledgeBase.tenantId, tenantId))).returning({ id: knowledgeBase.id });
  if (!res.length) throw new AppError("Entry not found", 404, "not_found");
}

const tokenize = (s: string) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);

/** Lightweight keyword retrieval (title matches weigh double). Swap for pgvector when needed. */
export async function searchKnowledge(tenantId: string, query: string, limit = 3) {
  const words = [...new Set(tokenize(query))];
  if (!words.length) return [];
  const entries = await listKnowledge(tenantId);
  return entries
    .map((e) => {
      const title = e.title.toLowerCase();
      const body = e.content.toLowerCase();
      const score = words.reduce((s, w) => s + (title.includes(w) ? 2 : 0) + (body.includes(w) ? 1 : 0), 0);
      return { ...e, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
