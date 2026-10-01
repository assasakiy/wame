import { route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";

export const dynamic = "force-dynamic";

export const GET = route(async () => ({ user: await requireApiUser() }));
