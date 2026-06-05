import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { buildFisa, type ExtractionResult, type FieldOverrides } from "@asicom/shared";
import { StatusChip } from "@/components/status-chip";
import { FisaView } from "@/components/fisa-view";
import { ProcessButton } from "@/components/process-button";
import { ProcessingBar } from "@/components/processing-bar";
import { StatusAdvance } from "@/components/status-advance";
import { PhotoClassification } from "@/components/photo-classification";
import { PolicyUpload } from "@/components/policy-upload";
import { PolicyCard } from "@/components/policy-card";
import { processDosar } from "@/lib/actions";
import { getDb, schema } from "@/lib/db";

function parseOverrides(json: string | null): FieldOverrides {
  if (!json) return {};
  try {
    const v = JSON.parse(json);
    return typeof v === "object" && v !== null ? (v as FieldOverrides) : {};
  } catch {
    return {};
  }
}

export const dynamic = "force-dynamic";

export default async function DosarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; warn?: string }>;

}) {
  const { id } = await params;
  const { err, warn } = await searchParams;
  const db = getDb();

  const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
  if (!dosar) notFound();

  const photos = db.select().from(schema.photos).where(eq(schema.photos.dosarId, id)).all();
  // Order by creation time so the parallel photoIds array lines up with extractions in the
  // same order the processing loop produced them — buildFisa relies on this for provenance.
  const extractionRows = db
    .select()
    .from(schema.extractions)
    .where(eq(schema.extractions.dosarId, id))
    .orderBy(asc(schema.extractions.createdAt))
    .all();

  const extractions: ExtractionResult[] = extractionRows.map(
    (r) => JSON.parse(r.fieldsJson) as ExtractionResult,
  );
  const photoIdsByExtraction = extractionRows.map((r) => r.photoId ?? "");
  const processed = extractions.length > 0;

  // Group ALL photos by their classified doc-type. The fišă panel for each group renders one
  // sticky image per source photo, stacked — so a "Date vehicul" panel built from a talon + a CIV
  // book shows both images, making the multi-photo merge visually obvious.
  const photosByDoc: Record<string, string[]> = {};
  for (const p of photos) {
    if (!p.docType) continue;
    (photosByDoc[p.docType] ??= []).push(p.id);
  }
  // Per-photo extraction map for the inspection panel (click thumbnail → see fields for that photo).
  const extractionByPhotoId = new Map<string, ExtractionResult>();
  for (const r of extractionRows) {
    if (r.photoId) extractionByPhotoId.set(r.photoId, JSON.parse(r.fieldsJson) as ExtractionResult);
  }
  const processedPhotos = photos.map((p) => ({
    id: p.id,
    docType: p.docType,
    extraction: extractionByPhotoId.get(p.id) ?? null,
  }));

  const overrides = parseOverrides(dosar.fieldOverridesJson);
  const fields = processed ? buildFisa(extractions, overrides, photoIdsByExtraction) : [];
  const unverifiedCount = fields.filter((f) => f.value && f.confidence.state !== "verified").length;

  // Policies attached to this dosar — surfaced when status is gata (upload form) or emis (cards).
  const policies = db
    .select()
    .from(schema.policies)
    .where(eq(schema.policies.dosarId, id))
    .all();
  const showPolicyArea = dosar.status === "gata" || dosar.status === "emis";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Dosar</p>
          <h1 className="font-mono text-2xl text-ink">{dosar.id.slice(0, 8)}</h1>
        </div>
        <StatusChip status={dosar.status} />
      </div>

      {err === "nokey" ? (
        <div className="rounded-lg border border-fail/30 bg-fail/5 px-4 py-3 text-sm text-fail">
          Cheia <span className="font-mono">ANTHROPIC_API_KEY</span> lipsește. Adaug-o în{" "}
          <span className="font-mono">apps/web/.env.local</span> și repornește serverul
          (<span className="font-mono">npm run dev</span>), apoi reîncearcă.
        </div>
      ) : null}
      {err === "extract" ? (
        <div className="rounded-lg border border-fail/30 bg-fail/5 px-4 py-3 text-sm text-fail">
          Niciun document nu a putut fi citit. Verifică pozele sau cheia API (detalii în consola serverului).
        </div>
      ) : null}
      {err === "pdf" ? (
        <div className="rounded-lg border border-fail/30 bg-fail/5 px-4 py-3 text-sm text-fail">
          Fișierul atașat nu este un PDF valid. Încearcă din nou cu o poliță în format PDF.
        </div>
      ) : null}
      {warn ? (
        <div className="rounded-lg border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
          {warn} {Number(warn) === 1 ? "document nu a putut fi citit" : "documente nu au putut fi citite"};
          restul apar mai jos.
        </div>
      ) : null}

      <form action={processDosar} className="flex flex-col gap-3">
        <input type="hidden" name="dosarId" value={dosar.id} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/60">
            {photos.length} {photos.length === 1 ? "document încărcat" : "documente încărcate"}.
          </p>
          <ProcessButton processed={processed} />
        </div>
        <ProcessingBar count={photos.length} />
      </form>

      {processed ? (
        <>
          <PhotoClassification photos={processedPhotos} dosarId={dosar.id} />
          <FisaView fields={fields} photosByDoc={photosByDoc} dosarId={dosar.id} />

          {showPolicyArea ? (
            <section className="overflow-hidden rounded-xl border border-line bg-white">
              <header className="border-b border-line bg-cloud px-4 py-3">
                <h2 className="font-display text-lg text-ink">
                  {policies.length > 0 ? "Polițe atașate" : "Atașează polița emisă"}
                </h2>
                <p className="mt-0.5 text-xs text-ink/55">
                  {dosar.status === "emis"
                    ? "Polița a fost emisă. PDF-ul este în arhivă conform GDPR și se purjează după 14 zile."
                    : "Trage aici PDF-ul poliței după ce o emiți în Insuretech. AI-ul citește numărul, asigurătorul, datele de valabilitate și o leagă de dosar."}
                </p>
              </header>
              <div className="space-y-3 p-4">
                {policies.map((p) => (
                  <PolicyCard key={p.id} dosarId={dosar.id} policy={p} />
                ))}
                {policies.length === 0 && dosar.status === "gata" ? (
                  <PolicyUpload dosarId={dosar.id} />
                ) : null}
              </div>
            </section>
          ) : null}

          <StatusAdvance
            dosarId={dosar.id}
            status={dosar.status}
            unverifiedCount={unverifiedCount}
          />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-line bg-cloud">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photo/${p.id}`}
                alt="document"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
