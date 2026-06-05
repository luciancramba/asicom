import { readFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { ExtractionResultSchema, validateCnp, type ExtractionResult } from "@asicom/shared";

// Sonnet by default; escalate to Opus on a cheap high-signal failure (the spec's choice).
const SONNET = "claude-sonnet-4-6";
const OPUS = "claude-opus-4-8";

const SUPPORTED: Record<string, "image/jpeg" | "image/png" | "image/webp" | "image/gif"> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const SYSTEM = `Ești un extractor de date pentru documente românești folosite la emiterea polițelor de asigurare.

Primești o singură imagine. Mai întâi clasifică documentul în "docType":
- "buletin" — carte de identitate / buletin (CNP, nume, prenume, sex, data nașterii, serie, număr, adresă)
- "talon" — certificat de înmatriculare (număr înmatriculare, serie șasiu/VIN, marca, model, an, masă, cilindree, locuri, kW, combustibil, serie CIV, data primei înmatriculări)
- "permis" — permis de conducere (nume, prenume, CNP, serie/număr, date, categorii)
- "policy" — poliță de asigurare emisă (PDF/foto)
- "junk" — orice altceva sau imagine necitibilă

Apoi completează DOAR sub-obiectul care corespunde lui docType (lasă celelalte goale).

Reguli stricte:
- Extrage NUMAI ce este clar vizibil. NU ghici și NU inventa valori.
- Dacă un câmp nu se poate citi, omite-l (nu pune text inventat).
- Datele calendaristice se scriu în format ISO: AAAA-LL-ZZ.
- Sexul: "M" sau "F".
- CNP-ul are 13 cifre, fără spații.
- Transcrie exact (diacritice, majuscule) ce scrie pe document.`;

/**
 * The extraction schema is supplied to the model as a (non-strict) TOOL, not as a strict
 * structured-output format. Structured outputs are grammar-compiled and cap optional parameters
 * at 24; our four optional doc sub-objects (every field optional by design) total 48, which the
 * API rejects ("too many optional parameters"). Tool use carries no such limit. The returned
 * input is validated with the SAME zod schema, so the shared schema stays the single source of truth.
 */
function toInputSchema(schema: z.ZodType): { type: "object"; [k: string]: unknown } {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema; // Anthropic's input_schema is plain JSON Schema; the $schema key is noise
  return json as { type: "object"; [k: string]: unknown };
}

export const EXTRACT_TOOL = {
  name: "extrage_date_document",
  description: "Înregistrează tipul documentului și câmpurile extrase din imaginea documentului.",
  input_schema: toInputSchema(ExtractionResultSchema),
};

let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY nu este setat — extragerea nu poate rula.");
  }
  client ??= new Anthropic();
  return client;
}

function mediaType(filepath: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  const ext = filepath.slice(filepath.lastIndexOf(".")).toLowerCase();
  const media = SUPPORTED[ext];
  if (!media) {
    throw new Error(`Format imagine neacceptat (${ext || "necunoscut"}) — folosește JPEG, PNG sau WebP.`);
  }
  return media;
}

type ImageMedia = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

async function callModel(
  model: string,
  base64: string,
  media: ImageMedia,
): Promise<ExtractionResult | null> {
  const res = await getClient().messages.create({
    model,
    max_tokens: 2048,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: EXTRACT_TOOL.name },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: media, data: base64 },
          },
          { type: "text", text: "Clasifică și extrage datele din această imagine." },
        ],
      },
    ],
  });

  // Forced tool_choice → the model answers with a single tool_use block carrying the data.
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") return null;
  const parsed = ExtractionResultSchema.safeParse(block.input);
  return parsed.success ? parsed.data : null;
}

/**
 * Extract one image. Sonnet first; escalate to Opus when the cheapest high-signal check fails —
 * a buletin whose CNP doesn't satisfy its control digit usually means a misread digit.
 */
export async function extractDocument(
  filepath: string,
): Promise<{ result: ExtractionResult; model: string }> {
  const media = mediaType(filepath);
  const base64 = (await readFile(filepath)).toString("base64");

  const sonnet = await callModel(SONNET, base64, media);
  if (sonnet && !shouldEscalate(sonnet)) return { result: sonnet, model: SONNET };

  const opus = await callModel(OPUS, base64, media);
  const result = opus ?? sonnet;
  if (!result) throw new Error("Extragerea nu a returnat date structurate.");
  return { result, model: opus ? OPUS : SONNET };
}

function shouldEscalate(r: ExtractionResult): boolean {
  if (r.docType === "buletin" && r.buletin?.cnp) {
    return !validateCnp(r.buletin.cnp).valid;
  }
  return false;
}
