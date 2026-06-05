/**
 * Asicom brand constants (Brand Book v1.0 final, 5 Jun 2026).
 * Visual tokens (colors, fonts) live in app/globals.css @theme; this is the copy/voice layer.
 */
export const BRAND = {
  name: "Asicom",
  descriptor: "Emitere asistată",
  /** Permanent lockup — sits under the wordmark. */
  lockup: "Asicom · Emitere asistată",
  /** Headline slogan — sales/site. Always with a period. */
  slogan: "Documentul devine poliță.",
  /** Secondary slogan — accuracy / MRZ / trust contexts only. */
  sloganSecondary: "Datele nu se transcriu. Se verifică.",
  builtBy: "Cramba App Studio",
  url: "cramba.ro",
} as const;
