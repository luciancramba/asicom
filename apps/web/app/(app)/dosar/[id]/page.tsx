import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { buildFisa, type ExtractionResult, type FieldOverrides } from "@asicom/shared";
import { StatusChip } from "@/components/status-chip";
import { FisaView } from "@/components/fisa-view";
import { ProcessButton } from "@/components/process-button";
import { ProcessingBar } from "@/components/processing-bar";
import { StatusAdvance } from "@/components/status-advance";
import { PhotoClassification } from "@/components/photo-classification";
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
  const extractionRows = db
    .select()
    .from(schema.extractions)
    .where(eq(schema.extractions.dosarId, id))
    .all();

  const extractions: ExtractionResult[] = extractionRows.map(
    (r) => JSON.parse(r.fieldsJson) as ExtractionResult,
  );
  const processed = extractions.length > 0;

  const photoByDoc: Record<string, string | undefined> = {};
  for (const p of photos) {
    if (p.docType && !photoByDoc[p.docType]) photoByDoc[p.docType] = p.id;
  }
  const overrides = parseOverrides(dosar.fieldOverridesJson);
  const fields = processed ? buildFisa(extractions, overrides) : [];
  const unverifiedCount = fields.filter((f) => f.value && f.confidence.state !== "verified").length;

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
          <PhotoClassification photos={photos.map((p) => ({ id: p.id, docType: p.docType }))} />
          <FisaView fields={fields} photoByDoc={photoByDoc} dosarId={dosar.id} />
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
