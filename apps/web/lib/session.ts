import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload {
  user: string;
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 12; // 12h

function key(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(
  user: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(key());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.user === "string" ? (payload as SessionPayload) : null;
  } catch {
    return null;
  }
}
