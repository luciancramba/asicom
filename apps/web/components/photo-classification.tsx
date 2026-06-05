"use client";

import { useState } from "react";
import type { ExtractionResult } from "@asicom/shared";

interface ProcessedPhoto {
  id: string;
  docType: string | null;
  /** The structured fields the model returned for THIS photo. Null when not yet extracted. */
  extraction: ExtractionResult | null;
}

const LABELS: Record<string, { ro: string; cls: string }> = {
  buletin: { ro: "Buletin", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  talon: { ro: "Talon", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  permis: { ro: "Permis", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  policy: { ro: "Poliță", cls: "border-asicom/40 bg-asicom/5 text-asicom" },
  junk: { ro: "Necitibil", cls: "border-fail/40 bg-fail/5 text-fail" },
};

/** Get the doc-type sub-object out of an ExtractionResult, e.g. talon for docType="talon". */
function getDocFields(ex: ExtractionResult | null): Record<string, unknown> {
  if (!ex) return {};
  const block = (ex as unknown as Record<string, unknown>)[ex.docType];
  return block && typeof block === "object" ? (block as Record<string, unknown>) : {};
}

/** Friendly Romanian labels for the structured fields, in display order. */
const FIELD_LABELS: Record<string, string> = {
  cnp: "CNP",
  nume: "Nume",
  prenume: "Prenume",
  sex: "Sex",
  dataNasterii: "Data nașterii",
  cetatenie: "Cetățenie",
  serie: "Serie",
  numar: "Număr",
  valabilitate: "Valabilitate",
  adresa: "Adresă",
  numarInmatriculare: "Nr. înmatriculare",
  vin: "Serie șasiu (VIN)",
  marca: "Marca",
  model: "Model",
  anFabricatie: "An fabricație",
  masaMaxima: "Masă maximă",
  cilindree: "Cilindree",
  locuri: "Locuri",
  putereKw: "Putere (kW)",
  categorie: "Categorie",
  combustibil: "Combustibil",
  serieCiv: "Serie CIV",
  dataPrimaInmatriculare: "Data primei înmatriculări",
  serieNumar: "Serie/Număr",
  dataEmitere: "Data emiterii",
  dataExpirare: "Data expirării",
  categorii: "Categorii",
};

function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>).filter(([, val]) => val);
    return entries.map(([k, val]) => `${k}: ${val}`).join(", ");
  }
  return String(v);
}

/**
 * Detect whether multiple talon photos report *different* non-empty plates or VINs — typically a
 * sign the broker uploaded two different cars by accident. Returns the conflicting values so the
 * UI can surface them.
 */
function detectTalonConflicts(photos: ProcessedPhoto[]): { plates: string[]; vins: string[] } {
  const plates = new Set<string>();
  const vins = new Set<string>();
  for (const p of photos) {
    if (p.docType !== "talon" || !p.extraction) continue;
    const fields = getDocFields(p.extraction);
    const plate = String(fields.numarInmatriculare ?? "").trim();
    const vin = String(fields.vin ?? "").trim();
    if (plate) plates.add(plate);
    if (vin) vins.add(vin);
  }
  return {
    plates: plates.size > 1 ? [...plates] : [],
    vins: vins.size > 1 ? [...vins] : [],
  };
}

/**
 * Above-the-fišă strip that tells the broker *exactly* what happened to each uploaded photo:
 * the classification label, a click-to-inspect panel showing the structured fields read from THAT
 * specific photo, and a banner when two talons disagree on plate/VIN (likely two cars uploaded by
 * mistake). Closes the "I uploaded 4 but only 2 are in the fišă" perception — nothing disappears
 * silently and the broker can drill into every photo's contribution.
 */
export function PhotoClassification({ photos }: { photos: ProcessedPhoto[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (photos.length === 0) return null;

  const counts = photos.reduce<Record<string, number>>((acc, p) => {
    const k = p.docType ?? "necunoscut";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const summary = Object.entries(counts)
    .map(([k, n]) => `${n} ${LABELS[k]?.ro.toLowerCase() ?? k}`)
    .join(" · ");

  const conflicts = detectTalonConflicts(photos);
  const hasConflicts = conflicts.plates.length > 0 || conflicts.vins.length > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-line">
      <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-asicom">
          Documente procesate
        </span>
        <span className="text-xs text-ink/50">
          {photos.length} {photos.length === 1 ? "poză" : "poze"} · {summary} · apasă orice
          poză pentru detalii
        </span>
      </header>

      {hasConflicts ? (
        <div className="border-b border-fail/30 bg-fail/5 px-4 py-2.5 text-xs text-fail">
          <span className="font-bold">Atenție:</span>{" "}
          {conflicts.plates.length > 0 ? (
            <>
              ai încărcat taloane pentru numere diferite (
              <span className="font-mono">{conflicts.plates.join(", ")}</span>) — fișa s-a făcut
              pe primul. Verifică să nu fie două mașini într-un dosar.
            </>
          ) : null}
          {conflicts.vins.length > 0 ? (
            <>
              {conflicts.plates.length > 0 ? " " : null}
              VIN-uri diferite în taloane: <span className="font-mono">{conflicts.vins.join(", ")}</span>.
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-6">
        {photos.map((p) => {
          const label = p.docType ? LABELS[p.docType] : null;
          const isOpen = openId === p.id;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => setOpenId((o) => (o === p.id ? null : p.id))}
              className={`flex flex-col gap-1.5 rounded-lg p-1 text-left transition-colors hover:bg-cloud ${
                isOpen ? "bg-cloud ring-1 ring-asicom/40" : ""
              }`}
            >
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
            </button>
          );
        })}
      </div>

      {openId ? <InspectionPanel photo={photos.find((p) => p.id === openId)!} /> : null}
    </section>
  );
}

function InspectionPanel({ photo }: { photo: ProcessedPhoto }) {
  const fields = getDocFields(photo.extraction);
  const entries = Object.entries(fields).filter(
    ([, v]) => v != null && v !== "" && !(typeof v === "object" && Object.keys(v as object).length === 0),
  );
  const label = photo.docType ? LABELS[photo.docType]?.ro ?? photo.docType : "necunoscut";

  return (
    <div className="border-t border-line bg-cloud/40 px-4 py-3">
      <p className="mb-2 text-xs text-ink/60">
        Câmpuri citite din această poză (<span className="font-medium text-ink">{label}</span>):
      </p>
      {entries.length === 0 ? (
        <p className="text-xs text-ink/40">
          Modelul nu a extras niciun câmp util — probabil poză neclară sau document necunoscut.
        </p>
      ) : (
        <dl className="grid gap-1 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2 text-xs">
              <dt className="shrink-0 text-ink/50">{FIELD_LABELS[k] ?? k}:</dt>
              <dd className="truncate font-mono text-ink">{formatValue(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
