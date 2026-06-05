import Link from "next/link";
import { desc } from "drizzle-orm";
import { UploadForm } from "@/components/upload-form";
import { StatusChip } from "@/components/status-chip";
import { getDb, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = getDb();
  const recent = db
    .select()
    .from(schema.dosare)
    .orderBy(desc(schema.dosare.createdAt))
    .limit(8)
    .all();

  return (
    <div className="flex flex-col gap-12">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">
          Dosar nou
        </p>
        <h1 className="font-display text-3xl font-light text-ink">Încarcă documentele</h1>
        <p className="mt-2 text-ink/60">
          Buletin, talon, permis — până la 5 poze. Le citim și verificăm automat.
        </p>
        <div className="mt-6">
          <UploadForm />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">Dosare recente</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">Niciun dosar încă.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {recent.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dosar/${d.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-cloud"
                >
                  <span className="font-mono text-sm text-ink">{d.id.slice(0, 8)}</span>
                  <StatusChip status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
