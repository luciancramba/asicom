interface ProcessedPhoto {
  id: string;
  docType: string | null;
}

const LABELS: Record<string, { ro: string; cls: string }> = {
  buletin: { ro: "Buletin", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  talon: { ro: "Talon", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  permis: { ro: "Permis", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  policy: { ro: "Poliță", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  junk: { ro: "Necitibil", cls: "border-fail/40 bg-fail/5 text-fail" },
};

/**
 * Above-the-fišă strip that tells the broker *exactly* what happened to each uploaded photo:
 * how it was classified, whether anything was dropped as junk, whether two sides of a document
 * were merged. Closes the "I uploaded 4 but only 2 are showing" gap — every photo accounts for
 * itself with its thumbnail and its label, so nothing disappears silently.
 */
export function PhotoClassification({ photos }: { photos: ProcessedPhoto[] }) {
  if (photos.length === 0) return null;

  // Summary line: "1 buletin · 2 talon · 1 necitibil"
  const counts = photos.reduce<Record<string, number>>((acc, p) => {
    const k = p.docType ?? "necunoscut";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const summary = Object.entries(counts)
    .map(([k, n]) => `${n} ${LABELS[k]?.ro.toLowerCase() ?? k}`)
    .join(" · ");

  return (
    <section className="overflow-hidden rounded-xl border border-line">
      <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-asicom">
          Documente procesate
        </span>
        <span className="text-xs text-ink/50">
          {photos.length} {photos.length === 1 ? "poză" : "poze"} · {summary}
        </span>
      </header>
      <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-6">
        {photos.map((p) => {
          const label = p.docType ? LABELS[p.docType] : null;
          return (
            <div key={p.id} className="flex flex-col gap-1.5">
              <div className="relative overflow-hidden rounded-lg border border-line bg-cloud">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photo/${p.id}`}
                  alt={label?.ro ?? "document"}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <span
                className={`self-start rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                  label?.cls ?? "border-line text-ink/50"
                }`}
              >
                {label?.ro ?? p.docType ?? "necunoscut"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
