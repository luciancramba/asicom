import { verified, unverified, failed, type FieldConfidence } from "../confidence";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a strict ISO yyyy-mm-dd into a UTC Date, or null if it isn't a real calendar date. */
export function parseIsoDate(value: string): Date | null {
  const s = (value ?? "").trim();
  if (!ISO_DATE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== m || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

/** Expiry / validity date — must be a real date in the future. */
export function validateExpiry(value: string, now: number = Date.now()): FieldConfidence {
  const d = parseIsoDate(value);
  if (!d) return failed("Dată invalidă");
  return d.getTime() > now
    ? verified("Valabil (expiră în viitor)")
    : failed("Document expirat");
}

/** Birth date sanity — plausible range. Real confirmation comes from the CNP cross-check. */
export function validateBirthDate(value: string, now: number = Date.now()): FieldConfidence {
  const d = parseIsoDate(value);
  if (!d) return failed("Dată invalidă");
  const year = d.getUTCFullYear();
  const nowYear = new Date(now).getUTCFullYear();
  if (year < 1900 || year > nowYear || nowYear - year > 120) {
    return failed("Dată nașterii implauzibilă");
  }
  return unverified("Dată plauzibilă");
}
