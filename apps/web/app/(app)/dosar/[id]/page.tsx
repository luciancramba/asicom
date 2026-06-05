import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { buildFisa, type ExtractionResult } from "@asicom/shared";
import { StatusChip } from "@/components/status-chip";
import { FisaView } from "@/components/fisa-view";
import { ProcessButton } from "@/components/process-button";
import { processDosar } from "@/lib/actions";
import { getDb, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DosarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const fields = processed ? buildFisa(extractions) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Dosar</p>
          <h1 className="font-mono text-2xl text-ink">{dosar.id.slice(0, 8)}</h1>
        </div>
        <StatusChip status={dosar.status} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {photos.length} {photos.length === 1 ? "document încărcat" : "documente încărcate"}.
        </p>
        <form action={processDosar}>
          <input type="hidden" name="dosarId" value={dosar.id} />
          <ProcessButton processed={processed} />
        </form>
      </div>

      {processed ? (
        <FisaView fields={fields} photoByDoc={photoByDoc} />
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
