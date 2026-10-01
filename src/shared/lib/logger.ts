import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type Level = "info" | "warn" | "error";
type Scope = { tenantId?: string | null; userId?: string | null };

async function write(level: Level, action: string, detail?: Record<string, unknown>, scope: Scope = {}) {
  const line = `[wame] ${level.toUpperCase()} ${action}`;
  if (level === "error") console.error(line, detail ?? "");
  else if (process.env.NODE_ENV !== "production" || level === "warn") console.log(line, detail ?? "");
  try {
    await db.insert(auditLogs).values({ level, action, detail: detail ?? null, tenantId: scope.tenantId ?? null, userId: scope.userId ?? null });
  } catch {
    /* logging must never break the request */
  }
}

export const logger = {
  info: (action: string, detail?: Record<string, unknown>, scope?: Scope) => write("info", action, detail, scope),
  warn: (action: string, detail?: Record<string, unknown>, scope?: Scope) => write("warn", action, detail, scope),
  error: (action: string, detail?: Record<string, unknown>, scope?: Scope) => write("error", action, detail, scope),
};
