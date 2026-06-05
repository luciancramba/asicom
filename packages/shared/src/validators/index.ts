import { unverified, failed, type FieldConfidence } from "../confidence";

export { validateCnp } from "./cnp";
export type { CnpDecoded } from "./cnp";

// --- Stubs fleshed out in the pipeline PR (PR3). They already return honest
// three-state results so the fišă can render against them today. ---

/** MRZ checksum validation — TD1 format, newer eID/CI only. */
export function validateMrz(_mrz: string): FieldConfidence {
  return unverified("MRZ validation not yet implemented");
}

/**
 * VIN check. Format only — the ISO 3779 check digit is unreliable on European
 * VINs, so we never hard-fail on it; passing the format is weak (amber) evidence.
 */
export function validateVin(vin: string): FieldConfidence {
  const ok = /^[A-HJ-NPR-Z0-9]{17}$/i.test((vin ?? "").trim());
  return ok
    ? unverified("VIN format OK (check digit not enforced)")
    : failed("VIN must be 17 chars and exclude I, O, Q");
}

// Date validators (expiry-in-future, birth-date sanity) + ISO helpers.
export * from "./dates";
