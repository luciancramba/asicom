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
  const [errorId, setErrorId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(copyable[0]?.id ?? null);

  /**
   * Copy text to the clipboard reliably. Try the modern async API first; if that fails
   * (focus, permission, or insecure context), fall back to a hidden textarea + execCommand,
   * which works in iframes and on older Safari. Returns whether the copy actually succeeded
   * — we surface that to the user rather than silently flashing "Copiat" on a failed copy.
   */
  async function writeClipboard(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through to legacy fallback */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  function flash(id: string) {
    setErrorId((e) => (e === id ? null : e));
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  }

  function flashError(id: string) {
    setCopiedId((c) => (c === id ? null : c));
    setErrorId(id);
    setTimeout(() => setErrorId((e) => (e === id ? null : e)), 2400);
  }

  async function copyField(f: FieldResult) {
    if (!f.value) return;
    const ok = await writeClipboard(f.value);
    if (ok) {
      const idx = copyable.findIndex((x) => x.id === f.id);
      setActiveId(copyable[idx + 1]?.id ?? null);
      flash(f.id);
    } else {
      flashError(f.id);
    }
  }

  async function copyAll() {
    const text = copyable.map((f) => `${f.label}: ${f.value}`).join("\n");
    const ok = await writeClipboard(text);
    if (ok) flash("__all__");
    else flashError("__all__");
  }

  const verifiedCount = fields.filter((f) => f.confidence.state === "verified").length;
  const totalWithValue = fields.filter((f) => f.value).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cloud px-4 py-3 text-xs text-ink/70">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <span className="font-bold text-ok">✓</span> Verificat — confirmat de un calcul (ex. CNP)
          </span>
          <span>
            <span className="font-bold text-warn">⚠</span> Verifică — extras corect, controlează cu ochiul
          </span>
          <span>
            <span className="font-bold text-fail">✗</span> Eroare — nepotrivire sau invalid
          </span>
        </div>
        <span className="font-mono">
          {verifiedCount}/{totalWithValue} verificate
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={copyAll}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            errorId === "__all__"
              ? "border-fail/40 bg-fail/5 text-fail"
              : "border-line text-asicom hover:bg-cloud"
          }`}
        >
          {copiedId === "__all__"
            ? "✓ Copiat"
            : errorId === "__all__"
              ? "✗ Copierea a eșuat"
              : "Copiază tot"}
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
                        className={`w-20 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-30 ${
                          errorId === f.id
                            ? "border-fail/40 bg-fail/5 text-fail"
                            : "border-line text-asicom hover:bg-cloud"
                        }`}
                      >
                        {copiedId === f.id ? "✓ Copiat" : errorId === f.id ? "✗ Eroare" : "Copiază"}
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
