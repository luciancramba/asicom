import { FIELD_REGISTRY, type FieldDef } from "./fields";
import { verified, unverified, failed, type FieldConfidence } from "./confidence";
import { validateCnp, type CnpDecoded } from "./validators/cnp";
import { validateVin } from "./validators";
import { validateExpiry, validateBirthDate, isValidIsoDate } from "./validators/dates";
import type { Buletin, Talon, Permis, ExtractionResult } from "./schemas";

export interface FieldResult {
  id: string;
  label: string;
  group: string;
  source: string;
  /** extracted / derived value, or null if missing */
  value: string | null;
  confidence: FieldConfidence;
}

interface Docs {
  buletin?: Buletin;
  talon?: Talon;
  permis?: Permis;
}

interface Ctx extends Docs {
  cnp?: CnpDecoded;
}

/**
 * Normalize a name for cross-document comparison: fold diacritics, lowercase, and treat hyphen
 * and whitespace as the same separator. Real documents disagree on formatting — a buletin reads
 * "LUCIAN-NICOLAE" while the permis reads "Lucian Nicolae", and an older permis drops diacritics
 * ("STEFAN" vs "Ștefan"). Those are the same name; only a genuine difference should fail the check.
 */
const normalizeName = (s: string | undefined): string =>
  (s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, " ");

function flattenAddress(adr: Buletin["adresa"]): string | null {
  if (!adr) return null;
  const parts = [adr.judet, adr.localitate, adr.strada, adr.numar, adr.detalii].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

/** Read a registry field's raw value from the extracted documents. */
function readValue(field: FieldDef, docs: Docs): string | null {
  if (!field.extract) return null;
  if (field.extract.key === "adresa") return flattenAddress(docs.buletin?.adresa);
  const doc = docs[field.extract.doc] as Record<string, unknown> | undefined;
  const raw = doc?.[field.extract.key];
  return raw == null ? null : String(raw);
}

function computeConfidence(field: FieldDef, value: string | null, ctx: Ctx): FieldConfidence {
  if (value == null || value === "") {
    return field.source === "manual"
      ? unverified("De completat manual")
      : unverified("Lipsește — verifică documentul");
  }

  switch (field.id) {
    case "client.cnp": {
      const r = validateCnp(value);
      return r.valid
        ? verified("CNP corect (cifră de control)")
        : failed("Cifra de control CNP nu corespunde");
    }
    case "client.sex":
      if (ctx.cnp?.valid && ctx.cnp.sex) {
        return ctx.cnp.sex === value
          ? verified("Confirmat de CNP")
          : failed("Nu corespunde cu sexul din CNP");
      }
      return unverified("Extras, neverificat");
    case "client.dataNasterii":
      if (ctx.cnp?.valid && ctx.cnp.birthDate) {
        return ctx.cnp.birthDate === value
          ? verified("Confirmat de CNP")
          : failed("Nu corespunde cu data din CNP");
      }
      return validateBirthDate(value);
    case "client.nume":
    case "client.prenume": {
      const key = field.id === "client.nume" ? "nume" : "prenume";
      const onPermis = ctx.permis?.[key];
      if (onPermis) {
        return normalizeName(onPermis) === normalizeName(value)
          ? verified("Se potrivește cu permisul")
          : failed("Diferă de permis");
      }
      return unverified("Extras, neverificat");
    }
  }

  switch (field.validator) {
    case "vin":
      return validateVin(value);
    case "date":
      // expiry must be in the future; other dates only need to be a real date
      if (field.id === "client.actExpirare") return validateExpiry(value);
      return isValidIsoDate(value) ? unverified("Dată plauzibilă") : failed("Dată invalidă");
    default:
      return unverified("Extras, neverificat");
  }
}

/**
 * Merge several extractions of the same document type into one — first non-empty value per field
 * wins. A client often photographs both sides of a document (the back of a permis carries the
 * category table, the front carries the name), so the name we cross-check against may live on a
 * different photo than the one `.find()` would pick. Single-extraction inputs pass through unchanged.
 */
function mergeParts<T extends object>(parts: (T | undefined)[]): T | undefined {
  const present = parts.filter((p): p is T => p != null);
  if (present.length <= 1) return present[0];
  const out: Record<string, unknown> = {};
  for (const part of present) {
    for (const [key, value] of Object.entries(part)) {
      const current = out[key];
      if ((current == null || current === "") && value != null && value !== "") {
        out[key] = value;
      }
    }
  }
  return out as T;
}

/**
 * Map a dosar's extractions onto the field registry (Insuretech order) and compute the
 * three-state confidence per field. This is the trust engine: green = machine-verified.
 */
export function buildFisa(extractions: ExtractionResult[]): FieldResult[] {
  const docs: Docs = {
    buletin: mergeParts(extractions.filter((e) => e.docType === "buletin").map((e) => e.buletin)),
    talon: mergeParts(extractions.filter((e) => e.docType === "talon").map((e) => e.talon)),
    permis: mergeParts(extractions.filter((e) => e.docType === "permis").map((e) => e.permis)),
  };
  const cnp = docs.buletin?.cnp ? validateCnp(docs.buletin.cnp) : undefined;
  const ctx: Ctx = { ...docs, cnp };

  return FIELD_REGISTRY.map((field) => {
    const value = readValue(field, docs);
    return {
      id: field.id,
      label: field.label,
      group: field.group,
      source: field.source,
      value,
      confidence: computeConfidence(field, value, ctx),
    };
  });
}
