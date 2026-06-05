import { z } from "zod";

/** What pass-1 vision classifies each photo as. */
export const DocType = z.enum(["buletin", "talon", "permis", "policy", "junk"]);
export type DocType = z.infer<typeof DocType>;

export const Sex = z.enum(["M", "F"]);
export type Sex = z.infer<typeof Sex>;

/**
 * Buletin / carte de identitate.
 * All fields optional — extraction may legitimately miss a field, and a missing
 * value is handled by the confidence layer, not by a schema error.
 */
export const BuletinSchema = z
  .object({
    cnp: z.string(),
    nume: z.string(),
    prenume: z.string(),
    sex: Sex,
    dataNasterii: z.string(), // ISO yyyy-mm-dd
    cetatenie: z.string(),
    serie: z.string(),
    numar: z.string(),
    valabilitate: z.string(), // expiry, ISO
    adresa: z
      .object({
        judet: z.string(),
        localitate: z.string(),
        strada: z.string(),
        numar: z.string(),
        detalii: z.string(),
      })
      .partial(),
    mrz: z.string(), // raw MRZ lines, if the card has them (newer eID/CI)
  })
  .partial();
export type Buletin = z.infer<typeof BuletinSchema>;

/** Talon / certificat de înmatriculare. */
export const TalonSchema = z
  .object({
    numarInmatriculare: z.string(),
    vin: z.string(),
    marca: z.string(),
    model: z.string(),
    anFabricatie: z.string(),
    masaMaxima: z.string(),
    cilindree: z.string(),
    locuri: z.string(),
    putereKw: z.string(),
    categorie: z.string(),
    combustibil: z.string(),
    serieCiv: z.string(),
    dataPrimaInmatriculare: z.string(),
  })
  .partial();
export type Talon = z.infer<typeof TalonSchema>;

/** Permis de conducere. */
export const PermisSchema = z
  .object({
    nume: z.string(),
    prenume: z.string(),
    cnp: z.string(),
    dataNasterii: z.string(),
    serieNumar: z.string(),
    dataEmitere: z.string(),
    dataExpirare: z.string(),
    categorii: z.array(z.string()),
  })
  .partial();
export type Permis = z.infer<typeof PermisSchema>;

/** Issued policy PDF — parsed from text on "Emis", not from a photo. */
export const PolicySchema = z
  .object({
    policyNumber: z.string(),
    insurer: z.string(),
    type: z.enum(["rca", "pad", "facultativ"]),
    validFrom: z.string(),
    validTo: z.string(),
    insuredName: z.string(),
    plate: z.string(),
  })
  .partial();
export type Policy = z.infer<typeof PolicySchema>;

/** Map a classified doc type to its extraction schema. */
export const SCHEMA_BY_DOC_TYPE = {
  buletin: BuletinSchema,
  talon: TalonSchema,
  permis: PermisSchema,
  policy: PolicySchema,
} as const;
