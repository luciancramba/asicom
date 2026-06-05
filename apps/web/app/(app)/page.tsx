import Link from "next/link";
import { StatusChip } from "@/components/status-chip";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusPipeline } from "@/components/status-pipeline";
import { getDosare, getKpis } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const kpis = getKpis();
  const dosare = getDosare(q);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Panou</p>
          <h1 className="font-display text-3xl font-light text-ink">Dosare</h1>
        </div>
        <Link
          href="/nou"
          className="shrink-0 rounded-lg bg-asicom px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-asicom-mid"
        >
          + Dosar nou
        </Link>
      </div>

      <KpiStrip kpis={kpis} />
      <StatusPipeline byStatus={kpis.byStatus} />

      <div className="flex flex-col gap-3">
        <form action="/" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Caută după nume, CNP sau număr…"
            aria-label="Caută dosare"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-asicom-mid"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-medium text-asicom transition-colors hover:bg-cloud"
          >
            Caută
          </button>
        </form>

        {dosare.length === 0 ? (
          <p className="rounded-xl border border-line bg-cloud px-4 py-8 text-center text-sm text-ink/50">
            {q ? `Niciun dosar pentru „${q}”.` : "Niciun dosar încă. Apasă „Dosar nou”."}
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {dosare.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dosar/${d.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-cloud"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">
                      {d.clientName ?? <span className="text-ink/40">Fără client</span>}
                    </div>
                    <div className="truncate font-mono text-xs text-ink/50">
                      {d.cnp ?? d.id.slice(0, 8)}
                      {d.plates.length ? ` · ${d.plates.join(", ")}` : ""}
                    </div>
                  </div>
                  <StatusChip status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
