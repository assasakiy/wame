import type { NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { logger } from "@/shared/lib/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "bad_request",
  ) {
    super(message);
  }
}

type RouteContext = { params: Promise<Record<string, string>> };

/** Wraps a route handler: uniform JSON responses and error handling (no business logic here). */
export function route(fn: (req: NextRequest, ctx: RouteContext) => Promise<unknown>) {
  return async (req: NextRequest, ctx: RouteContext): Promise<Response> => {
    try {
      const result = await fn(req, ctx);
      if (result instanceof Response) return result;
      return Response.json(result ?? { ok: true });
    } catch (error) {
      if (error instanceof AppError) {
        return Response.json({ error: error.message, code: error.code }, { status: error.status });
      }
      if (error instanceof ZodError) {
        const first = error.issues[0];
        const where = first?.path.join(".");
        return Response.json(
          { error: `${where ? where + ": " : ""}${first?.message ?? "Invalid input"}`, code: "validation_failed", issues: error.issues },
          { status: 422 },
        );
      }
      logger.error("http.unhandled", { message: error instanceof Error ? error.message : String(error), path: req.nextUrl.pathname });
      return Response.json({ error: "Internal server error", code: "internal_error" }, { status: 500 });
    }
  };
}

export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("Request body must be valid JSON", 400, "invalid_json");
  }
  return schema.parse(body);
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
