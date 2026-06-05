import { describe, it, expect, beforeEach } from "vitest";
import { signSession, verifySession } from "./session";

const SECRET_A = "a".repeat(64);
const SECRET_B = "b".repeat(64);

describe("session", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET_A;
  });

  it("round-trips a valid session", async () => {
    const token = await signSession("tripon");
    const payload = await verifySession(token);
    expect(payload?.user).toBe("tripon");
  });

  it("rejects a tampered token", async () => {
    const token = await signSession("tripon");
    const last = token[token.length - 1];
    const tampered = token.slice(0, -1) + (last === "A" ? "B" : "A");
    expect(await verifySession(tampered)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSession("tripon");
    process.env.SESSION_SECRET = SECRET_B;
    expect(await verifySession(token)).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await verifySession("not-a-jwt")).toBeNull();
  });
});
