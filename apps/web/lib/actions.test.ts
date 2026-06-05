import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regression guard for the missing-ANTHROPIC_API_KEY short-circuit in processDosar.
 *
 * In the first live-extraction session the guard appeared not to fire: a long-running dev server
 * was executing a STALE compiled Server Action (the guard was added after that server started), so
 * the per-photo loop ran and every photo threw "ANTHROPIC_API_KEY nu este setat" from getClient().
 * A freshly compiled server fires the guard correctly (verified end-to-end). This test locks the
 * source-level invariant so the guard can't be silently weakened — moved below the loop, wrapped in
 * a try/catch that swallows redirect(), or have its env read captured at module load: a missing key
 * must redirect to ?err=nokey BEFORE any DB work or photo processing.
 */
const { getCurrentUser, getDb, extractDocument, redirect } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(async (): Promise<string | null> => "tripon"),
  getDb: vi.fn(() => {
    throw new Error("getDb() must not run when ANTHROPIC_API_KEY is missing");
  }),
  extractDocument: vi.fn(),
  // next/navigation's redirect() halts execution by throwing; mirror that so callers short-circuit.
  redirect: vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("./auth", () => ({ getCurrentUser }));
vi.mock("./db", () => ({ getDb, schema: {} }));
vi.mock("./vision", () => ({ extractDocument }));

import { processDosar } from "./actions";

describe("processDosar — missing ANTHROPIC_API_KEY guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("redirects to ?err=nokey and never enters the photo loop", async () => {
    const fd = new FormData();
    fd.set("dosarId", "abc123");

    // The guard runs redirect(), which throws — so the action rejects. That rejection IS the short-circuit.
    await expect(processDosar(fd)).rejects.toThrow(/\?err=nokey$/);

    expect(redirect).toHaveBeenCalledWith("/dosar/abc123?err=nokey");
    expect(getDb).not.toHaveBeenCalled(); // short-circuited before the DB work
    expect(extractDocument).not.toHaveBeenCalled(); // ...and before the per-photo loop
  });
});
