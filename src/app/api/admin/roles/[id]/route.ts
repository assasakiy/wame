import { z } from "zod";
import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { deleteRole, updateRolePermissions } from "@/modules/rbac/application/rbac.service";

export const PATCH = route(async (req, ctx) => {
  await requireApiUser("permissions.manage");
  const { permissions } = await readJson(req, z.object({ permissions: z.array(z.string()) }));
  await updateRolePermissions((await ctx.params).id, permissions);
  return { ok: true };
});

export const DELETE = route(async (_req, ctx) => {
  await requireApiUser("roles.manage");
  await deleteRole((await ctx.params).id);
  return { ok: true };
});
