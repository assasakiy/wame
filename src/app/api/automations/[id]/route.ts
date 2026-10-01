import { z } from "zod";
import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { deleteAutomation, setAutomationEnabled } from "@/modules/automation/application/automation.service";

export const PATCH = route(async (req, ctx) => {
  const user = await requireApiUser("automation.manage");
  const { enabled } = await readJson(req, z.object({ enabled: z.boolean() }));
  await setAutomationEnabled(user.tenantId, (await ctx.params).id, enabled);
  return { ok: true };
});

export const DELETE = route(async (_req, ctx) => {
  const user = await requireApiUser("automation.manage");
  await deleteAutomation(user.tenantId, (await ctx.params).id);
  return { ok: true };
});
