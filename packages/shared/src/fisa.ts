import { FIELD_REGISTRY, type FieldDef } from "./fields";
import { verified, unverified, failed, type FieldConfidence } from "./confidence";

/**
 * Broker-side override for one field on one dosar. Two independent flags:
 *  - `value`     → broker-typed value replaces the extracted one (e.g. corrected name)
 *  - `confirmed` → broker vouches that the (extracted or typed) value is correct
 * Both, either, or neither may be set. When neither is set the entry is just dropped — the
 * absence of an override is the canonical "no broker action" state.
 */
export interface FieldOverride {
  value?: string;
  confirmed?: boolean;
}
export type FieldOverrides = Record<string, FieldOverride | undefined>;
import { validateCnp, type CnpDecoded } from "./validators/cnp";
import { validateVin } from "./validators";
import { validateExpiry, validateBirthDate, isValidIsoDate } from "./validators/dates";
import type { Buletin, Talon, Permis, ExtractionResult, BBox } from "./schemas";

export interface FieldResult {
  id: string;
  label: string;
  group: string;
  source: string;
  /** extracted / derived value, or null if missing */
  value: string | null;
  confidence: FieldConfidence;
  /** Approximate location of this value on the source photo (normalized [0,1]). Best-effort. */
  bbox?: BBox;
  /** Which uploaded photo this field's value was read from. Used for the per-field crop URL. */
  sourcePhotoId?: string;
}

export interface Docs {
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

/**
 * Broker convention for Serie CIV when the talon doesn't carry it: new-format talons no longer
 * have the Y rubric, and the working default in Insuretech is the placeholder "A000000". Applied
 * only when a talon was actually read — if there is no talon at all, the field stays empty so the
 * fišă renders an honest "lipsește" amber.
 */
const CIV_NEW_TALON_PLACEHOLDER = "A000000";

/** Read a registry field's raw value from the extracted documents. */
function readValue(field: FieldDef, docs: Docs): string | null {
  if (!field.extract) return null;
  if (field.extract.key === "adresa") return flattenAddress(docs.buletin?.adresa);
  const doc = docs[field.extract.doc] as Record<string, unknown> | undefined;
  const raw = doc?.[field.extract.key];
  const value = raw == null ? null : String(raw).trim();

  if (
    field.id === "vehicul.serieCiv" &&
    (value == null || value === "") &&
    docs.talon != null
  ) {
    return CIV_NEW_TALON_PLACEHOLDER;
  }

  return value == null || value === "" ? null : value;
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
    case "vehicul.serieCiv":
      if (value === CIV_NEW_TALON_PLACEHOLDER) {
        return unverified("Talon fără rubrică CIV — implicit A000000");
      }
      return unverified("Extras, neverificat");
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
 * Collect a dosar's extractions into one merged document per type (front + back photos combined).
 * Shared by the fišă (confidence) and the client registry (auto-create / match by CNP).
 */
export function collectDocs(extractions: ExtractionResult[]): Docs {
  return {
    buletin: mergeParts(extractions.filter((e) => e.docType === "buletin").map((e) => e.buletin)),
    talon: mergeParts(extractions.filter((e) => e.docType === "talon").map((e) => e.talon)),
    permis: mergeParts(extractions.filter((e) => e.docType === "permis").map((e) => e.permis)),
  };
}

/**
 * Map a dosar's extractions onto the field registry (Insuretech order) and compute the
 * three-state confidence per field. This is the trust engine: green = machine-verified OR
 * broker-confirmed. The `overrides` argument layers operator decisions on top of the machine
 * extraction. `photoIds` (parallel to `extractions`) is optional — when provided, each
 * FieldResult is enriched with the bbox and source photo id from the extraction that contributed
 * its value, so the UI can render a per-field crop and a spotlight on the source photo.
 */
export function buildFisa(
  extractions: ExtractionResult[],
  overrides: FieldOverrides = {},
  photoIds?: string[],
): FieldResult[] {
  const docs = collectDocs(extractions);
  const cnp = docs.buletin?.cnp ? validateCnp(docs.buletin.cnp) : undefined;
  const ctx: Ctx = { ...docs, cnp };

  return FIELD_REGISTRY.map((field) => {
    const override = overrides[field.id];

    // Broker-typed value (if any) wins over the extracted one.
    const extractedValue = readValue(field, docs);
    const hasOverrideValue = typeof override?.value === "string";
    const value = hasOverrideValue ? (override!.value as string).trim() || null : extractedValue;

    // Provenance: find the first extraction of the matching docType whose sub-object has a
    // non-empty value for this field's key. That mirrors the merge rule ("first non-empty wins")
    // and lets us pull the bbox + source photo id from the actual contributor.
    let bbox: BBox | undefined;
    let sourcePhotoId: string | undefined;
    if (field.extract && !hasOverrideValue) {
      const targetDoc = field.extract.doc;
      const key = field.extract.key;
      for (let i = 0; i < extractions.length; i++) {
        const ex = extractions[i];
        if (ex.docType !== targetDoc) continue;
        const sub = (ex as unknown as Record<string, unknown>)[targetDoc] as
          | Record<string, unknown>
          | undefined;
        const raw = sub?.[key];
        if (raw == null || raw === "") continue;
        if (typeof raw === "object" && Object.keys(raw as object).length === 0) continue;
        bbox = ex.bbox?.[key];
        sourcePhotoId = photoIds?.[i];
        break;
      }
    }

    // Confidence: compute as normal, then let a confirmed override stamp it broker-green.
    let confidence = computeConfidence(field, value, ctx);
    if (override?.confirmed && value !== null && value !== "") {
      confidence = verified("Confirmat de operator", "broker");
    }

    return {
      id: field.id,
      label: field.label,
      group: field.group,
      source: field.source,
      value,
      confidence,
      bbox,
      sourcePhotoId,
    };
  });
}
