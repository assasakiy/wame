import { AppError, readJson, route } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { can, requireApiUser } from "@/modules/auth/presentation/guards";
import { adminUpdateUser, adminUserUpdateSchema } from "@/modules/users/application/admin.service";

export const PATCH = route(async (req, ctx) => {
  const actor = await requireApiUser();
  const input = await readJson(req, adminUserUpdateSchema);
  if ((input.roleId || input.status) && !can(actor, "users.manage")) throw new AppError("Forbidden", 403, "forbidden");
  if (input.planCode && !can(actor, "subscription.manage")) throw new AppError("Forbidden", 403, "forbidden");
  const { id } = await ctx.params;
  await adminUpdateUser(actor, id, input);
  await logger.info("admin.user_updated", { target: id, ...input }, { userId: actor.id, tenantId: actor.tenantId });
  return { ok: true };
});
