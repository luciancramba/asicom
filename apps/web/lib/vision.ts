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
- Transcrie exact (diacritice, majuscule) ce scrie pe document.

Coordonate (bbox) — pe lângă valorile extrase, completează „bbox" cu coordonate exacte pentru fiecare câmp:
- Cheia este aceeași cu numele câmpului din sub-obiect (ex.: „cnp", „nume", „numarInmatriculare", „vin").
- Coordonate normalizate [0,1] cu originea în colțul stânga-sus: x = stânga, y = sus, w = lățime, h = înălțime.
- IMPORTANT — bbox-ul trebuie să încadreze STRICT TEXTUL CITIT, nu eticheta („CNP", „Nume", etc.). Doar valoarea propriu-zisă.
- Pentru fiecare câmp, identifică ÎNTÂI poziția pe imagine raportată la repere vizibile (ex.: „SERIE și NUMĂR sunt sus în dreapta, pe linia de sub titlu", „CNP-ul e o linie sub seria"), apoi convertește în coordonate normalizate.
- Atenție la fundal: documentul poate fi fotografiat pe o masă/față de masă, deci nu ocupă întreaga imagine. y=0 este partea de SUS A FOTOGRAFIEI, nu a documentului. Dacă documentul începe la y=0.15 (15% de jos sus apare fundalul), atunci primul rând de text e probabil la y~0.20-0.25, NU la y=0.05.
- Înălțimea unui rând de text este de obicei 0.02-0.04 (2-4% din înălțimea fotografiei). Nu pune h>0.10 pentru câmpuri pe o singură linie.
- Pentru câmpuri care nu apar pe imagine sau nu le poți localiza, omite-le din bbox.

Talon — câmpuri pe certificatul de înmatriculare (CI) românesc. Folosește codurile EU-armonizate de pe document ca ancore — sunt tipărite înaintea fiecărei valori (litera A, B, D.1, etc.). Bbox-ul trebuie să încadreze VALOAREA, nu litera/eticheta.

  Câmpuri principale:
- "numarInmatriculare" = codul **A**. Format: 2 litere județ + 2-3 cifre + 3 litere (ex.: „AB-19-MXL", „CJ-14-XMF", „B-123-ABC"). Păstrează exact cum scrie pe talon, cu sau fără cratime.
- "vin" (serie șasiu) = codul **E**. EXACT 17 caractere alfanumerice, fără literele I, O, Q. Atenție mare la transcriere — confuzia 0/O, 1/I, B/8 e cea mai frecventă greșeală. Numără caracterele înainte de a confirma.
- "marca" = codul **D.1**. Producătorul vehiculului (ex.: „MERCEDES-BENZ", „RENAULT", „AUDI", „DACIA"). NU este modelul.
- "model" = codul **D.3** (denumirea comercială). Dacă D.3 nu există pe talon, folosește D.2 (tipul). Exemple: „B 180 CDI", „SYMBOL", „LOGAN". NU este marca.
- "anFabricatie" = anul fabricației — NU este garantat ca cod separat. Dacă talonul nu are explicit „An fabricație", folosește anul din **dataPrimaInmatriculare** (codul B) sau lasă gol. Format: AAAA.
- "dataPrimaInmatriculare" = codul **B**. Data primei înmatriculări a vehiculului. Format ISO AAAA-LL-ZZ.
- "categorie" = codul **J**. Categoria vehiculului (ex.: „M1", „AUTOTURISM M1", „N1"). Include și descrierea dacă apare.

  Câmpuri motor:
- "cilindree" = codul **P.1** (capacitate cilindrică, cm³). DOAR P.1. Codul G este masa proprie, NU cilindreea — nu confunda.
- "putereKw" = codul **P.2** (puterea maximă netă, kW). Doar numărul în kW, NU și CP-urile dacă sunt afișate separat.
- "combustibil" = codul **P.3** (tipul de combustibil). Exemple: „BENZINA", „MOTORINA", „GPL", „ELECTRIC", „HIBRID".

  Câmpuri masă și locuri:
- "masaMaxima" = codul **F.1** (masa maximă tehnic admisă, kg). DOAR F.1. NU F.2 (masa de înmatriculare) și NU G (masa proprie).
- "locuri" = codul **S.1** (numărul locurilor pe scaune, incluzând conducătorul).

  Serie CIV (atenție mare — câmp problematic):
- "serieCiv" = SERIA Cărții de Identitate a Vehiculului — un document SEPARAT de talon. Pe talonul nou apare la codul **Y**, etichetată „Seria și nr. CIV" sau „CIV".
- **Format obligatoriu**: o literă majusculă urmată de exact 6 cifre (ex.: „G502721", „R262160", „A123456"). Înainte de a completa, VERIFICĂ că valoarea se potrivește cu acest model. Dacă nu se potrivește, LASĂ CÂMPUL GOL.
- NU confunda cu:
  • „Numărul certificatului" (jos pe talon, format AXXXXXXXXB cu literă+7cifre+literă) — este seria TALONULUI, nu a CIV.
  • Codul **Z** „SRPCIV [Județ]" (ex.: „SRPCIV Alba", „SRPCIV Cluj") — este SUBUNITATEA EMITENTĂ (instituția RAR care a emis talonul), NU serieCiv. SRPCIV nu e niciodată un număr.
  • Codul **K** (numărul de omologare, format „e1*2001/116*XXXX*XX") — NU este serieCiv.
- Dacă rubrica Y nu se vede clar sau valoarea găsită nu respectă formatul „1 literă + 6 cifre", LASĂ CÂMPUL GOL — buildFisa pune implicit „A000000". Mai bine gol decât greșit.

  Atenție generală pe talon:
- Tipul/Variantă (codul D.2) NU este un câmp separat în schemă; rămâne în model/marca după caz.
- Culoarea (codul R), număr omologare (K), data eliberării (I), valabilitate (H) NU se extrag.
- Talonul poate fi fotografiat în orientare landscape (sideways); citește valorile în ordinea lor reală pe document, nu după orientarea fotografiei.`;

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
