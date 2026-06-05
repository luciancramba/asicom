"use client";

import { useState } from "react";
import { fieldsByGroup, type FieldResult, type FieldGroup } from "@asicom/shared";
import { ConfidenceBadge } from "./confidence-badge";

const GROUPS: { key: FieldGroup; title: string; source?: "buletin" | "talon" }[] = [
  { key: "client", title: "Date asigurat", source: "buletin" },
  { key: "vehicul", title: "Date vehicul", source: "talon" },
  { key: "valabilitate", title: "Valabilitate" },
];

/**
 * Fišă de emitere — fields in Insuretech order, three-state badges, source document beside each
 * group, copy-per-field with auto-advance, and copy-all. The trust machine + the time-saver.
 */
export function FisaView({
  fields,
  photoByDoc,
}: {
  fields: FieldResult[];
  photoByDoc: Record<string, string | undefined>;
}) {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const copyable = fields.filter((f) => f.value); // ordered, for auto-advance
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(copyable[0]?.id ?? null);

  async function flash(id: string) {
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  }

  async function copyField(f: FieldResult) {
    if (!f.value) return;
    try {
      await navigator.clipboard.writeText(f.value);
    } catch {
      /* clipboard unavailable (insecure context) — ignore */
    }
    const idx = copyable.findIndex((x) => x.id === f.id);
    setActiveId(copyable[idx + 1]?.id ?? null);
    void flash(f.id);
  }

  async function copyAll() {
    const text = copyable.map((f) => `${f.label}: ${f.value}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    void flash("__all__");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={copyAll}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-asicom transition-colors hover:bg-cloud"
        >
          {copiedId === "__all__" ? "✓ Copiat" : "Copiază tot"}
        </button>
      </div>

      {GROUPS.map((g) => {
        const rows = fieldsByGroup(g.key)
          .map((def) => byId.get(def.id))
          .filter((f): f is FieldResult => Boolean(f));
        const photoId = g.source ? photoByDoc[g.source] : undefined;

        return (
          <section key={g.key} className="overflow-hidden rounded-xl border border-line">
            <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-asicom">
                {g.title}
              </span>
              {photoId ? <span className="font-mono text-xs text-ink/40">sursă: {g.source}</span> : null}
            </header>

            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto]">
              <ul className="flex flex-col divide-y divide-line">
                {rows.map((f) => {
                  const isActive = f.id === activeId;
                  return (
                    <li
                      key={f.id}
                      className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 ${
                        isActive ? "-mx-2 rounded-md bg-asicom/5 px-2" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-ink/50">{f.label}</div>
                        <div className="truncate font-mono text-sm text-ink">{f.value ?? "—"}</div>
                      </div>
                      <ConfidenceBadge state={f.confidence.state} reason={f.confidence.reason} />
                      <button
                        type="button"
                        onClick={() => copyField(f)}
                        disabled={!f.value}
                        aria-label={`Copiază ${f.label}`}
                        className="w-20 rounded-md border border-line px-2 py-1 text-xs font-medium text-asicom transition-colors hover:bg-cloud disabled:opacity-30"
                      >
                        {copiedId === f.id ? "✓ Copiat" : "Copiază"}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {photoId ? (
                <div className="hidden w-40 shrink-0 sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/photo/${photoId}`}
                    alt={g.title}
                    className="w-full rounded-lg border border-line object-cover"
                  />
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
