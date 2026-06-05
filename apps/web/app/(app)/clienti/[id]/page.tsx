import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusChip } from "@/components/status-chip";
import { getClient } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="shrink-0 text-xs text-ink/50">{label}</span>
      <span className={`text-right text-sm text-ink ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <header className="border-b border-line bg-cloud px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-asicom">
      {children}
    </header>
  );
}

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const adresa = client.adresa
    ? [
        client.adresa.judet,
        client.adresa.localitate,
        client.adresa.strada,
        client.adresa.numar,
        client.adresa.detalii,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const todo = <span className="text-ink/40">de completat</span>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Client</p>
        <h1 className="font-display text-3xl font-light text-ink">{client.name ?? "Fără nume"}</h1>
        <p className="mt-1 font-mono text-sm text-ink/50">{client.cnp ?? "—"}</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-line">
        <SectionHeader>Contact & identitate</SectionHeader>
        <div className="flex flex-col divide-y divide-line px-4">
          <Row label="Sex" value={client.sex} />
          <Row label="Data nașterii" value={client.dataNasterii} mono />
          <Row label="Telefon" value={client.telefon ?? todo} mono />
          <Row label="Email" value={client.email ?? todo} />
          <Row label="Adresă" value={adresa} />
          <Row
            label="Act identitate"
            value={client.act ? [client.act.serie, client.act.numar].filter(Boolean).join(" ") || null : null}
            mono
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-line">
        <SectionHeader>Vehicule</SectionHeader>
        {client.vehicles.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink/50">Niciun vehicul.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {client.vehicles.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink">
                    {[v.marca, v.model].filter(Boolean).join(" ") || "—"}
                    {v.anFabricatie ? ` · ${v.anFabricatie}` : ""}
                  </div>
                  <div className="truncate font-mono text-xs text-ink/50">{v.vin ?? "—"}</div>
                </div>
                {v.plate ? (
                  <span className="shrink-0 rounded-md bg-cloud px-2 py-1 font-mono text-xs text-ink">
                    {v.plate}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-line">
        <SectionHeader>Polițe</SectionHeader>
        {client.policies.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink/50">Nicio poliță emisă încă.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {client.policies.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-ink">{p.policyNumber ?? "—"}</span>
                <span className="text-ink/50">{[p.insurer, p.type].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-line">
        <SectionHeader>Dosare</SectionHeader>
        {client.dosare.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink/50">Niciun dosar.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {client.dosare.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dosar/${d.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-cloud"
                >
                  <span className="font-mono text-sm text-ink">{d.id.slice(0, 8)}</span>
                  <StatusChip status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/clienti" className="text-sm text-asicom transition-colors hover:underline">
        ← Toți clienții
      </Link>
    </div>
  );
}
