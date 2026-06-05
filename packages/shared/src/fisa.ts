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

const normalizeName = (s: string | undefined): string =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

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
 * Map a dosar's extractions onto the field registry (Insuretech order) and compute the
 * three-state confidence per field. This is the trust engine: green = machine-verified.
 */
export function buildFisa(extractions: ExtractionResult[]): FieldResult[] {
  const docs: Docs = {
    buletin: extractions.find((e) => e.docType === "buletin")?.buletin,
    talon: extractions.find((e) => e.docType === "talon")?.talon,
    permis: extractions.find((e) => e.docType === "permis")?.permis,
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
