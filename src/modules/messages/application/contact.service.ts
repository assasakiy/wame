import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { assertWithin, getUsage } from "@/modules/subscription/application/limits";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import { normalizeRecipient } from "@/modules/messages/application/message.service";

export const contactInputSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(32),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
});

export const importSchema = z.object({ csv: z.string().min(3).max(200_000) });

export const listContacts = (tenantId: string) =>
  db.select().from(contacts).where(eq(contacts.tenantId, tenantId)).orderBy(desc(contacts.createdAt)).limit(500);

export async function createContact(tenantId: string, input: z.infer<typeof contactInputSchema>) {
  await assertWithin(tenantId, "contacts");
  const [row] = await db
    .insert(contacts)
    .values({ tenantId, name: input.name, phone: normalizeRecipient(input.phone), tags: input.tags })
    .onConflictDoNothing()
    .returning();
  if (!row) throw new AppError("A contact with this phone already exists", 409, "conflict");
  return row;
}

/** Imports lines of `name,phone,tag1|tag2`. Skips invalid rows and duplicates; respects the plan limit. */
export async function importContacts(tenantId: string, csv: string) {
  const [sub, usage] = await Promise.all([getSubscription(tenantId), getUsage(tenantId)]);
  let room = sub.limits.contacts - usage.contacts;
  let imported = 0;
  let skipped = 0;
  for (const line of csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const [name, phone, tags] = line.split(",").map((s) => s.trim());
    if (!name || !phone || room <= 0) { skipped++; continue; }
    try {
      const rows = await db
        .insert(contacts)
        .values({ tenantId, name, phone: normalizeRecipient(phone), tags: tags ? tags.split("|").map((t) => t.trim()).filter(Boolean) : [] })
        .onConflictDoNothing()
        .returning({ id: contacts.id });
      if (rows.length) { imported++; room--; } else skipped++;
    } catch {
      skipped++;
    }
  }
  return { imported, skipped };
}

export async function deleteContact(tenantId: string, id: string) {
  const res = await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))).returning({ id: contacts.id });
  if (!res.length) throw new AppError("Contact not found", 404, "not_found");
}

export async function listSegments(tenantId: string): Promise<{ tag: string; count: number }[]> {
  const rows = await db.select({ tags: contacts.tags }).from(contacts).where(eq(contacts.tenantId, tenantId));
  const counts = new Map<string, number>();
  for (const r of rows) for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}
