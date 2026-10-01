import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { devices } from "@/db/schema";
import { env } from "@/shared/config/env";
import { queueDepth } from "@/modules/messages/application/message.service";
import { getDriver } from "@/modules/whatsapp/infrastructure/driver-factory";
import { workerState } from "@/modules/automation/infrastructure/worker";

export async function getSystemHealth() {
  const t0 = Date.now();
  let dbOk = true;
  try {
    await db.execute(sql`select 1`);
  } catch {
    dbOk = false;
  }
  const dbLatencyMs = Date.now() - t0;
  const [depth, connected] = await Promise.all([
    queueDepth().catch(() => -1),
    db.select({ n: sql<number>`count(*)::int` }).from(devices).where(eq(devices.status, "connected")).then((r) => r[0]?.n ?? 0).catch(() => 0),
  ]);
  const worker = workerState();
  const mem = process.memoryUsage();
  return {
    database: { ok: dbOk, latencyMs: dbLatencyMs },
    worker: { running: worker.started, lastTickAgoMs: worker.lastTick ? Date.now() - worker.lastTick : null, ticks: worker.ticks, processed: worker.processed },
    queueDepth: depth,
    connectedDevices: connected,
    driver: getDriver().name,
    aiMode: env.openai.apiKey ? `LLM (${env.openai.model})` : "offline rules engine",
    uptimeSeconds: Math.floor(process.uptime()),
    memoryMb: Math.round(mem.rss / 1024 / 1024),
    heapMb: Math.round(mem.heapUsed / 1024 / 1024),
    node: process.version,
  };
}
