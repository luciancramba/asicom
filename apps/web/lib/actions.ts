"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import type {
  BBox,
  ExtractionResult,
  FieldOverride,
  FieldOverrides,
} from "@asicom/shared";
import { FIELD_REGISTRY } from "@asicom/shared";
import { getCurrentUser } from "./auth";
import { getDb, schema } from "./db";
import { saveUpload } from "./storage";
import { extractDocument } from "./vision";
import { syncClientFromExtractions } from "./clients";

const execFileAsync = promisify(execFile);

const MAX_PHOTOS = 6;

/** Create a dosar from uploaded photos: store files, insert dosar + photo rows, go to the dosar. */
export async function createDosar(formData: FormData): Promise<void> {
  if (!(await getCurrentUser())) redirect("/login");

  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0 && f.type.startsWith("image/"))
    .slice(0, MAX_PHOTOS);

  if (files.length === 0) redirect("/?error=empty");

  const dosarId = randomUUID();
  const db = getDb();
  db.insert(schema.dosare).values({ id: dosarId, status: "primit" }).run();

  for (const file of files) {
    const photoId = randomUUID();
    const filepath = await saveUpload(dosarId, photoId, file);
    db.insert(schema.photos).values({ id: photoId, dosarId, filepath }).run();
  }

  redirect(`/dosar/${dosarId}`);
}

/**
 * Run the vision pipeline over a dosar's photos: classify + extract each image, store the
 * structured result, and advance the status. Confidence is recomputed on render from the
 * stored extractions (single source of truth). Re-processing replaces prior extractions.
 */
export async function processDosar(formData: FormData): Promise<void> {
  if (!(await getCurrentUser())) redirect("/login");
  const dosarId = String(formData.get("dosarId") ?? "");
  if (!dosarId) redirect("/");

  // No silent failures: if the key is missing, say so instead of redirecting to an unchanged page.
  if (!process.env.ANTHROPIC_API_KEY) redirect(`/dosar/${dosarId}?err=nokey`);

  const db = getDb();
  const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, dosarId)).get();
  if (!dosar) redirect("/");

  db.update(schema.dosare).set({ status: "in_procesare" }).where(eq(schema.dosare.id, dosarId)).run();
  db.delete(schema.extractions).where(eq(schema.extractions.dosarId, dosarId)).run();

  const photos = db.select().from(schema.photos).where(eq(schema.photos.dosarId, dosarId)).all();
  const results: ExtractionResult[] = [];
  let extracted = 0;
  let failed = 0;
  for (const photo of photos) {
    if (photo.purgedAt) continue;
    try {
      const { result, model } = await extractDocument(photo.filepath);
      db.insert(schema.extractions)
        .values({
          id: randomUUID(),
          dosarId,
          photoId: photo.id,
          docType: result.docType,
          fieldsJson: JSON.stringify(result),
          modelUsed: model,
        })
        .run();
      db.update(schema.photos).set({ docType: result.docType }).where(eq(schema.photos.id, photo.id)).run();
      results.push(result);
      if (result.docType !== "junk") extracted += 1;
    } catch (err) {
      failed += 1;
      console.error(`[process] photo ${photo.id}:`, err instanceof Error ? err.message : err);
    }
  }

  // Auto-create / match the client + vehicle from what we read (keyed by a verified CNP).
  // A sync failure must not fail the whole run — the extractions are already saved.
  try {
    syncClientFromExtractions(db, dosarId, results);
  } catch (err) {
    console.error(`[process] client sync ${dosarId}:`, err instanceof Error ? err.message : err);
  }

  db.update(schema.dosare)
    .set({
      status: extracted > 0 ? "de_verificat" : "primit",
      processedAt: new Date().toISOString(),
    })
    .where(eq(schema.dosare.id, dosarId))
    .run();

  const params = new URLSearchParams();
  if (extracted === 0) params.set("err", "extract");
  else if (failed > 0) params.set("warn", String(failed));
  const qs = params.toString();
  redirect(`/dosar/${dosarId}${qs ? `?${qs}` : ""}`);
}

// ---------- Broker overrides ----------

const VALID_FIELD_IDS = new Set(FIELD_REGISTRY.map((f) => f.id));
const VALID_STATUSES = new Set(["de_verificat", "gata", "emis"]);

/** Load + safely parse the override map for a dosar. Null/garbage JSON → empty map. */
function readOverrides(json: string | null): FieldOverrides {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? (parsed as FieldOverrides) : {};
  } catch {
    return {};
  }
}

/** Persist a patched override map, dropping fully-empty entries so the JSON stays tidy. */
function writeOverrides(dosarId: string, next: FieldOverrides): void {
  const cleaned: FieldOverrides = {};
  for (const [k, v] of Object.entries(next)) {
    if (!v) continue;
    const hasValue = typeof v.value === "string" && v.value.length > 0;
    const hasConfirmed = v.confirmed === true;
    if (hasValue || hasConfirmed) {
      cleaned[k] = {
        ...(hasValue ? { value: v.value } : {}),
        ...(hasConfirmed ? { confirmed: true } : {}),
      };
    }
  }
  const json = Object.keys(cleaned).length === 0 ? null : JSON.stringify(cleaned);
  getDb()
    .update(schema.dosare)
    .set({ fieldOverridesJson: json })
    .where(eq(schema.dosare.id, dosarId))
    .run();
}

function guardAuth(dosarId: string): asserts dosarId is string {
  if (!dosarId) redirect("/");
}

/**
 * Toggle a broker confirmation on one field. Click 🟡 once → confirmed green; click again → revert.
 * Editing a value is a separate action (setFieldValue) that auto-confirms — that's the broker rule.
 */
export async function toggleFieldConfirmed(formData: FormData): Promise<void> {
  if (!(await getCurrentUser())) redirect("/login");
  const dosarId = String(formData.get("dosarId") ?? "");
  const fieldId = String(formData.get("fieldId") ?? "");
  guardAuth(dosarId);
  if (!VALID_FIELD_IDS.has(fieldId)) return;

  const db = getDb();
  const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, dosarId)).get();
  if (!dosar) redirect("/");

  const overrides = readOverrides(dosar.fieldOverridesJson);
  const existing = overrides[fieldId] ?? {};
  const next: FieldOverride = existing.confirmed
    ? { ...existing, confirmed: false } // un-confirm — keep any value override
    : { ...existing, confirmed: true };
  writeOverrides(dosarId, { ...overrides, [fieldId]: next });
  revalidatePath(`/dosar/${dosarId}`);
}

/**
 * Save a broker-typed value. By product rule, saving an edit auto-confirms the field (the broker
 * already vouched by typing). An empty submitted value clears any prior override, reverting to
 * the original extraction — this is how a broker "undoes" a previous edit.
 */
export async function setFieldValue(formData: FormData): Promise<void> {
  if (!(await getCurrentUser())) redirect("/login");
  const dosarId = String(formData.get("dosarId") ?? "");
  const fieldId = String(formData.get("fieldId") ?? "");
  const raw = String(formData.get("value") ?? "").trim();
  guardAuth(dosarId);
  if (!VALID_FIELD_IDS.has(fieldId)) return;

  const db = getDb();
  const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, dosarId)).get();
  if (!dosar) redirect("/");

  const overrides = readOverrides(dosar.fieldOverridesJson);
  const next: FieldOverride = raw === "" ? {} : { value: raw, confirmed: true };
  writeOverrides(dosarId, { ...overrides, [fieldId]: next });
  revalidatePath(`/dosar/${dosarId}`);
}

/**
 * Advance the dosar status. de_verificat → gata when the broker says "ready to issue"; gata →
 * emis when the policy is issued. Both directions are reversible (broker can step back). The
 * confidence gate is enforced in the UI (soft warning) — this action trusts the caller.
 */
export async function advanceDosarStatus(formData: FormData): Promise<void> {
  if (!(await getCurrentUser())) redirect("/login");
  const dosarId = String(formData.get("dosarId") ?? "");
  const to = String(formData.get("to") ?? "");
  guardAuth(dosarId);
  if (!VALID_STATUSES.has(to)) return;

  const db = getDb();
  const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, dosarId)).get();
  if (!dosar) redirect("/");

  const patch: { status: string; emisAt?: string | null } = { status: to };
  if (to === "emis") patch.emisAt = new Date().toISOString();
  else if (dosar.status === "emis") patch.emisAt = null; // stepping back from emis

  db.update(schema.dosare).set(patch).where(eq(schema.dosare.id, dosarId)).run();
  revalidatePath(`/dosar/${dosarId}`);
  revalidatePath("/"); // dashboard counts change
}

// ---------- Photo rotation ----------

/** Rotate a normalized bbox by 90° clockwise. Coordinate system: top-left origin, [0,1]. */
function rotateBBox90CW(b: BBox): BBox {
  return {
    x: Math.max(0, Math.min(1, 1 - b.y - b.h)),
    y: Math.max(0, Math.min(1, b.x)),
    w: Math.max(0, Math.min(1, b.h)),
    h: Math.max(0, Math.min(1, b.w)),
  };
}

/**
 * Rotate one uploaded photo 90° clockwise — IMAGE BYTES + EXTRACTION BBOXES together so the
 * spotlight + crops remain aligned with the new orientation without another vision call.
 * Phones often capture talons / passports in landscape, and Claude's bbox accuracy collapses
 * on rotated documents (it sees the rotated raster, not the broker's mental "right way up").
 */
export async function rotatePhoto(formData: FormData): Promise<void> {
  if (!(await getCurrentUser())) redirect("/login");
  const dosarId = String(formData.get("dosarId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  if (!dosarId || !photoId) return;

  const db = getDb();
  const photo = db.select().from(schema.photos).where(eq(schema.photos.id, photoId)).get();
  if (!photo || !photo.filepath) return;
  if (photo.dosarId !== dosarId) return; // tampering / wrong dosar

  // Rotate the file in place. Prefer jpegtran for JPEG (lossless), fall back to sips (macOS
  // native, works for any format). Production VPS will need libjpeg-turbo or imagemagick.
  const ext = photo.filepath.slice(photo.filepath.lastIndexOf(".")).toLowerCase();
  const isJpeg = ext === ".jpg" || ext === ".jpeg";
  try {
    if (isJpeg) {
      // jpegtran can't overwrite the input directly — write to .tmp, then mv.
      const tmp = `${photo.filepath}.rot.tmp`;
      await execFileAsync("jpegtran", [
        "-rotate",
        "90",
        "-copy",
        "none",
        "-outfile",
        tmp,
        photo.filepath,
      ]);
      await execFileAsync("mv", [tmp, photo.filepath]);
    } else {
      await execFileAsync("sips", ["-r", "90", photo.filepath]);
    }
  } catch (err) {
    console.error(`[rotate] photo ${photoId}:`, err instanceof Error ? err.message : err);
    return; // don't touch the extraction if the file rotation failed
  }

  // Rotate the stored extraction's bboxes by the same 90° CW so spotlight + crops stay aligned.
  const extraction = db
    .select()
    .from(schema.extractions)
    .where(eq(schema.extractions.photoId, photoId))
    .get();
  if (extraction?.fieldsJson) {
    try {
      const parsed = JSON.parse(extraction.fieldsJson) as ExtractionResult;
      if (parsed.bbox) {
        const next: Record<string, BBox> = {};
        for (const [k, b] of Object.entries(parsed.bbox)) {
          next[k] = rotateBBox90CW(b as BBox);
        }
        parsed.bbox = next;
        db.update(schema.extractions)
          .set({ fieldsJson: JSON.stringify(parsed) })
          .where(eq(schema.extractions.id, extraction.id))
          .run();
      }
    } catch (err) {
      console.error(`[rotate] bbox transform ${photoId}:`, err instanceof Error ? err.message : err);
    }
  }

  revalidatePath(`/dosar/${dosarId}`);
}
