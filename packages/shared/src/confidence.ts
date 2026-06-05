/**
 * Three-state trust model. The whole product hinges on this:
 *   🟢 verified   — a deterministic check passed (e.g. CNP control digit). Trust it.
 *   🟡 unverified — extracted but no checksum exists. Eyeball it.
 *   🔴 failed     — a validator failed, or two documents disagree. Do not trust.
 *
 * "verified" must mean machine-verified, never machine-guessed.
 */
export type ConfidenceState = "verified" | "unverified" | "failed";
/** Who said the field is trustworthy. "machine" = an algorithm proved it; "broker" = an operator
 * confirmed it manually. Visually identical greens — the difference only shows in the reason. */
export type ConfidenceBy = "machine" | "broker";

export interface FieldConfidence {
  state: ConfidenceState;
  /** Short reason, shown on hover / used for the alert list, e.g. "CNP control digit OK". */
  reason: string;
  /** Who confirmed it. Absent = machine (the default for backwards-compat callers). */
  by?: ConfidenceBy;
}

export const verified = (reason: string, by: ConfidenceBy = "machine"): FieldConfidence => ({
  state: "verified",
  reason,
  by,
});
export const unverified = (reason: string): FieldConfidence => ({ state: "unverified", reason });
export const failed = (reason: string): FieldConfidence => ({ state: "failed", reason });

/** A field is an "alert" on the dashboard if it isn't verified. */
export const isAlert = (c: FieldConfidence): boolean => c.state !== "verified";
