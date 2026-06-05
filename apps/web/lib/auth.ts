import { cookies } from "next/headers";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { signSession, verifySession } from "./session";

const SESSION_COOKIE = "asicom_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

/** Constant-time scrypt check against ASICOM_PASSWORD_HASH ("salt:hash" hex). */
export function verifyPassword(password: string): boolean {
  const stored = process.env.ASICOM_PASSWORD_HASH;
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  let actual: Buffer;
  try {
    actual = scryptSync(password, salt, expected.length);
  } catch {
    return false;
  }
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function login(user: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ASICOM_USER ?? "tripon";
  if (user !== expectedUser || !verifyPassword(password)) return false;
  const token = await signSession(expectedUser, SESSION_TTL_SECONDS);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return (await verifySession(token))?.user ?? null;
}
