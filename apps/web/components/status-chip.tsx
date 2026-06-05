const LABELS: Record<string, string> = {
  primit: "Primit",
  in_procesare: "În procesare",
  de_verificat: "De verificat",
  gata: "Gata de emitere",
  emis: "Emis",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-asicom">
      {LABELS[status] ?? status}
    </span>
  );
}
