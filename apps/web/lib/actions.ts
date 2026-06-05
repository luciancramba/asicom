"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { getDb, schema } from "./db";
import { saveUpload } from "./storage";
import { extractDocument } from "./vision";

const MAX_PHOTOS = 5;

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

  const db = getDb();
  const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, dosarId)).get();
  if (!dosar) redirect("/");

  db.update(schema.dosare).set({ status: "in_procesare" }).where(eq(schema.dosare.id, dosarId)).run();
  db.delete(schema.extractions).where(eq(schema.extractions.dosarId, dosarId)).run();

  const photos = db.select().from(schema.photos).where(eq(schema.photos.dosarId, dosarId)).all();
  let extracted = 0;
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
      if (result.docType !== "junk") extracted += 1;
    } catch (err) {
      console.error(`[process] photo ${photo.id}:`, err instanceof Error ? err.message : err);
    }
  }

  db.update(schema.dosare)
    .set({
      status: extracted > 0 ? "de_verificat" : "primit",
      processedAt: new Date().toISOString(),
    })
    .where(eq(schema.dosare.id, dosarId))
    .run();

  redirect(`/dosar/${dosarId}`);
}
