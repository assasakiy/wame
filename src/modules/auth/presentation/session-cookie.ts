import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/modules/auth/domain/types";
import type { IssuedSession } from "@/modules/auth/application/auth.service";

export async function setSessionCookie(session: IssuedSession) {
  (await cookies()).set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
