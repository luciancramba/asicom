import { readFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { PolicySchema, type Policy } from "@asicom/shared";

const SONNET = "claude-sonnet-4-6";

const SYSTEM = `Ești un extractor de date pentru polițe de asigurare auto românești în format PDF.

Primești un PDF cu o poliță (RCA, PAD, Casco sau facultativ) emisă de un asigurător român. Extrage
metadatele necesare pentru registru:

- "policyNumber"  — numărul de poliță complet, exact așa cum apare (poate conține litere, cifre,
  cratime, prefix de serie). Exemple: „RO/A/12345/2025", „CAS-12345678", „PAD-2026-00128844".
- "insurer"       — numele asigurătorului emitent. Exemple: „ALLIANZ ȚIRIAC", „ASIROM VIENNA",
  „GROUPAMA", „OMNIASIG", „EUROINS", „PAID Asigurări".
- "type"          — categoria poliței: „rca" (răspundere civilă auto), „pad" (asigurare obligatorie
  pentru locuință — și nu vehicul, dar tot acceptăm) sau „facultativ" (Casco).
- "validFrom"     — data începerii valabilității, format ISO AAAA-LL-ZZ.
- "validTo"       — data finalizării valabilității, format ISO AAAA-LL-ZZ.
- "insuredName"   — numele asiguratului (persoana fizică sau juridică).
- "plate"         — numărul de înmatriculare a vehiculului asigurat (pentru RCA / Casco). Lasă gol
  pentru PAD.

Reguli stricte:
- Extrage NUMAI ce este clar vizibil pe PDF. Nu inventa. Câmpurile lipsă rămân goale.
- Datele sunt mereu în format ISO AAAA-LL-ZZ (chiar dacă PDF-ul afișează DD.MM.YYYY).
- Pentru "type": dacă PDF-ul scrie „RCA" / „Răspundere Civilă Auto" → „rca". Pentru „CASCO" /
  „Asigurare Casco" → „facultativ". Pentru „PAD" → „pad".`;

let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY nu este setat — extragerea poliței nu poate rula.");
  }
  client ??= new Anthropic();
  return client;
}

function toInputSchema(schema: z.ZodType): { type: "object"; [k: string]: unknown } {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json as { type: "object"; [k: string]: unknown };
}

const EXTRACT_TOOL = {
  name: "extrage_date_polita",
  description: "Înregistrează metadatele extrase dintr-un PDF de poliță de asigurare auto.",
  input_schema: toInputSchema(PolicySchema),
};

/**
 * Extract structured policy metadata from a PDF file. The Anthropic API supports PDF documents
 * directly via the `document` content block; no local pdf-parse needed. Returns null if the
 * model couldn't extract anything (broken PDF, scanned image without OCR, etc.).
 */
export async function extractPolicyFromPdf(filepath: string): Promise<Policy | null> {
  if (!filepath.toLowerCase().endsWith(".pdf")) {
    throw new Error(`Doar PDF-uri sunt acceptate aici (${filepath.split(".").pop()}).`);
  }
  const base64 = (await readFile(filepath)).toString("base64");

  const res = await getClient().messages.create({
    model: SONNET,
    max_tokens: 1024,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: EXTRACT_TOOL.name },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          },
          { type: "text", text: "Extrage metadatele poliței din PDF." },
        ],
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") return null;
  const parsed = PolicySchema.safeParse(block.input);
  return parsed.success ? parsed.data : null;
}
