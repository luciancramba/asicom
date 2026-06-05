/**
 * Three-state trust model. The whole product hinges on this:
 *   🟢 verified   — a deterministic check passed (e.g. CNP control digit). Trust it.
 *   🟡 unverified — extracted but no checksum exists. Eyeball it.
 *   🔴 failed     — a validator failed, or two documents disagree. Do not trust.
 *
 * "verified" must mean machine-verified, never machine-guessed.
 */
export type ConfidenceState = "verified" | "unverified" | "failed";

export interface FieldConfidence {
  state: ConfidenceState;
  /** Short reason, shown on hover / used for the alert list, e.g. "CNP control digit OK". */
  reason: string;
}

export const verified = (reason: string): FieldConfidence => ({ state: "verified", reason });
export const unverified = (reason: string): FieldConfidence => ({ state: "unverified", reason });
export const failed = (reason: string): FieldConfidence => ({ state: "failed", reason });

/** A field is an "alert" on the dashboard if it isn't verified. */
export const isAlert = (c: FieldConfidence): boolean => c.state !== "verified";
