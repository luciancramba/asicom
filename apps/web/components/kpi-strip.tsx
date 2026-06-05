import type { Kpis } from "@/lib/dashboard";

function Stat({
  label,
  value,
  hint,
  accent = "text-ink",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</div>
      <div className={`mt-1 font-mono text-2xl ${accent}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-ink/40">{hint}</div> : null}
    </div>
  );
}

/** Headline metrics across the top of the dashboard. */
export function KpiStrip({ kpis }: { kpis: Kpis }) {
  const hours = Math.round(kpis.minutesSaved / 6) / 10; // minutes → hours, one decimal
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Dosare" value={kpis.total} />
      <Stat label="De verificat" value={kpis.deVerificat} hint="așteaptă verificare" accent="text-warn" />
      <Stat label="Emise" value={kpis.emis} accent="text-ok" />
      <Stat
        label="Timp economisit"
        value={`${hours} h`}
        hint={`~${kpis.minutesSaved} min (est.)`}
        accent="text-asicom"
      />
    </div>
  );
}
