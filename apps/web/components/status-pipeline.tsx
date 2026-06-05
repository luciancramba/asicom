import { Fragment } from "react";

const STAGES: { key: string; label: string }[] = [
  { key: "primit", label: "Primit" },
  { key: "in_procesare", label: "În procesare" },
  { key: "de_verificat", label: "De verificat" },
  { key: "gata", label: "Gata" },
  { key: "emis", label: "Emis" },
];

/** The five-stage dosar pipeline with a live count under each stage. */
export function StatusPipeline({ byStatus }: { byStatus: Record<string, number> }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {STAGES.map((s, i) => (
        <Fragment key={s.key}>
          <div className="min-w-[4.75rem] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-center">
            <div className="font-mono text-lg text-ink">{byStatus[s.key] ?? 0}</div>
            <div className="whitespace-nowrap text-[11px] text-ink/50">{s.label}</div>
          </div>
          {i < STAGES.length - 1 ? <span className="shrink-0 text-ink/25">→</span> : null}
        </Fragment>
      ))}
    </div>
  );
}
