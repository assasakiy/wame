import { logger } from "@/shared/lib/logger";
import { ensureSeed } from "@/modules/rbac/application/seed";
import { expireSubscriptions } from "@/modules/subscription/application/subscription.service";
import { processDueMessages } from "@/modules/messages/application/message.service";
import { heartbeat, restoreSessions } from "@/modules/whatsapp/application/engine";

export interface WorkerState {
  started: boolean;
  ready: boolean;
  startedAt: number;
  lastTick: number;
  ticks: number;
  processed: number;
}

const g = globalThis as typeof globalThis & { __wameWorker?: WorkerState };
export const workerState = (): WorkerState =>
  (g.__wameWorker ??= { started: false, ready: false, startedAt: 0, lastTick: 0, ticks: 0, processed: 0 });

let running = false;
let nextBootstrapAttempt = 0;
const BOOTSTRAP_RETRY_MS = 10_000;

async function tick() {
  if (running) return;
  running = true;
  const state = workerState();
  try {
    // A database can be temporarily unavailable while a container is starting or
    // during a failover. Keep retrying bootstrap instead of hammering every query
    // once per second, and resume the queue automatically when it comes back.
    if (!state.ready) {
      if (Date.now() < nextBootstrapAttempt) return;
      try {
        await ensureSeed();
        await restoreSessions();
        state.ready = true;
        nextBootstrapAttempt = 0;
        await logger.info("worker.started");
      } catch (e) {
        nextBootstrapAttempt = Date.now() + BOOTSTRAP_RETRY_MS;
        console.error("[wame] worker bootstrap failed", e instanceof Error ? e.message : e);
      }
      return;
    }

    state.processed += await processDueMessages(); // queue + scheduler + broadcast (scheduled_at)
    if (state.ticks % 20 === 0) await heartbeat(); // device health monitoring
    if (state.ticks % 600 === 0) await expireSubscriptions(); // subscription expiration
    state.ticks += 1;
    state.lastTick = Date.now();
  } catch (e) {
    state.ready = false;
    nextBootstrapAttempt = Date.now() + BOOTSTRAP_RETRY_MS;
    console.error("[wame] worker tick failed", e instanceof Error ? e.message : e);
  } finally {
    running = false;
  }
}

/** Starts the in-process background worker (called once from instrumentation.ts). */
export function startWorker() {
  const state = workerState();
  if (state.started) return;
  state.started = true;
  state.ready = false;
  state.startedAt = Date.now();
  void tick();
  setInterval(() => void tick(), 1000);
}
