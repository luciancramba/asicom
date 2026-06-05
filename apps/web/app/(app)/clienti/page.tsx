import Link from "next/link";
import { getClients } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = getClients();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Registru</p>
        <h1 className="font-display text-3xl font-light text-ink">Clienți</h1>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-xl border border-line bg-cloud px-4 py-8 text-center text-sm text-ink/50">
          Niciun client încă. Clienții se creează automat din CNP la procesarea unui dosar.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clienti/${c.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-cloud"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink">
                    {c.name ?? <span className="text-ink/40">Fără nume</span>}
                  </div>
                  <div className="truncate font-mono text-xs text-ink/50">{c.cnp ?? "—"}</div>
                </div>
                <div className="shrink-0 text-xs text-ink/50">
                  {c.vehicleCount} {c.vehicleCount === 1 ? "vehicul" : "vehicule"} · {c.dosarCount}{" "}
                  {c.dosarCount === 1 ? "dosar" : "dosare"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
