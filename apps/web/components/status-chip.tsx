/** Status chip — colour-coded along the dosar pipeline. Functional colours only (blue/amber/green). */
const STATUS: Record<string, { label: string; cls: string }> = {
  primit: { label: "Primit", cls: "bg-cloud text-ink/60" },
  in_procesare: { label: "În procesare", cls: "bg-asicom/10 text-asicom" },
  de_verificat: { label: "De verificat", cls: "bg-warn/10 text-warn" },
  gata: { label: "Gata de emitere", cls: "bg-asicom/10 text-asicom" },
  emis: { label: "Emis", cls: "bg-ok/10 text-ok" },
};

export function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-cloud text-ink/60" };
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
  );
}
