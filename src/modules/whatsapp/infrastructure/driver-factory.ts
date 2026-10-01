import { env } from "@/shared/config/env";
import type { WhatsAppDriver } from "@/modules/whatsapp/domain/driver";
import { SimulatedDriver } from "@/modules/whatsapp/infrastructure/simulated-driver";

const g = globalThis as typeof globalThis & { __wameDriver?: WhatsAppDriver };

function createDriver(): WhatsAppDriver {
  switch (env.waDriver) {
    // case "baileys": return new BaileysDriver();  // implement WhatsAppDriver with @whiskeysockets/baileys
    default:
      return new SimulatedDriver();
  }
}

/** Process-wide singleton: sessions must survive across route bundles. */
export const getDriver = (): WhatsAppDriver => (g.__wameDriver ??= createDriver());

/** Name-based check: `instanceof` breaks when instrumentation and route bundles load separate class copies. */
export const isSimulated = (driver: WhatsAppDriver): driver is SimulatedDriver => driver.name === "simulated";
