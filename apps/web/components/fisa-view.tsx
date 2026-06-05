"use client";

import { useState, useTransition } from "react";
import { fieldsByGroup, type FieldResult, type FieldGroup } from "@asicom/shared";
import { ConfidenceBadge } from "./confidence-badge";
import { ImageViewer } from "./image-viewer";
import { setFieldValue, toggleFieldConfirmed } from "@/lib/actions";

const GROUPS: { key: FieldGroup; title: string; source?: "buletin" | "talon" }[] = [
  { key: "client", title: "Date asigurat", source: "buletin" },
  { key: "vehicul", title: "Date vehicul", source: "talon" },
  { key: "valabilitate", title: "Valabilitate" },
];

/**
 * Fišă de emitere — fields in Insuretech order, three-state badges, source document beside each
 * group, copy-per-field with auto-advance, copy-all, click-to-confirm broker greens, and inline
 * edit on missing/wrong values. The trust machine + the time-saver.
 */
export function FisaView({
  fields,
  photoByDoc,
  dosarId,
}: {
  fields: FieldResult[];
  photoByDoc: Record<string, string | undefined>;
  dosarId: string;
}) {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const copyable = fields.filter((f) => f.value); // ordered, for auto-advance
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(copyable[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function writeClipboard(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through */
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

  /** Toggle broker-confirmed via Server Action; uses startTransition so the click feels immediate. */
  function onBadgeClick(f: FieldResult) {
    setPendingId(f.id);
    const fd = new FormData();
    fd.set("dosarId", dosarId);
    fd.set("fieldId", f.id);
    startTransition(async () => {
      try {
        await toggleFieldConfirmed(fd);
      } finally {
        setPendingId((p) => (p === f.id ? null : p));
      }
    });
  }

  function startEdit(f: FieldResult) {
    setEditingId(f.id);
    setEditValue(f.value ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  function saveEdit(f: FieldResult) {
    setPendingId(f.id);
    const fd = new FormData();
    fd.set("dosarId", dosarId);
    fd.set("fieldId", f.id);
    fd.set("value", editValue);
    startTransition(async () => {
      try {
        await setFieldValue(fd);
      } finally {
        setEditingId((e) => (e === f.id ? null : e));
        setPendingId((p) => (p === f.id ? null : p));
      }
    });
  }

  const verifiedCount = fields.filter((f) => f.confidence.state === "verified").length;
  const totalWithValue = fields.filter((f) => f.value).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cloud px-4 py-3 text-xs text-ink/70">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <span className="font-bold text-ok">✓</span> Verificat — apasă pe ⚠ pentru a confirma manual
          </span>
          <span>
            <span className="font-bold text-warn">⚠</span> Verifică — extras corect, controlează cu ochiul
          </span>
          <span>
            <span className="font-bold text-fail">✗</span> Eroare — nepotrivire sau invalid (poți edita)
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

            <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_22rem]">
              <ul className="flex flex-col divide-y divide-line">
                {rows.map((f) => {
                  const isActive = f.id === activeId;
                  const isEditing = editingId === f.id;
                  const isPending = pendingId === f.id;
                  const isBrokerGreen = f.confidence.state === "verified" && f.confidence.by === "broker";
                  const canConfirm = f.confidence.state !== "verified" && Boolean(f.value);
                  const badgeHint = isBrokerGreen
                    ? "Apasă pentru a anula confirmarea"
                    : canConfirm
                      ? "Apasă pentru a confirma manual"
                      : f.confidence.reason;

                  return (
                    <li
                      key={f.id}
                      className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 ${
                        isActive ? "-mx-2 rounded-md bg-asicom/5 px-2" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-ink/50">
                          {f.label}
                          {!isEditing ? (
                            <button
                              type="button"
                              onClick={() => startEdit(f)}
                              disabled={isPending}
                              aria-label={`Editează ${f.label}`}
                              className="text-ink/30 transition-colors hover:text-asicom disabled:opacity-30"
                            >
                              ✎
                            </button>
                          ) : null}
                        </div>
                        {isEditing ? (
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(f);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-full rounded border border-line bg-white px-2 py-1 font-mono text-sm text-ink outline-none focus:border-asicom-mid"
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(f)}
                              disabled={isPending}
                              className="rounded-md bg-asicom px-2 py-1 text-xs font-medium text-white hover:bg-asicom-mid disabled:opacity-50"
                            >
                              Salvează
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-xs text-ink/60 hover:text-ink"
                            >
                              Anulează
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(f)}
                            disabled={isPending}
                            title="Apasă pentru a edita"
                            className="-mx-1 block w-full truncate rounded px-1 text-left font-mono text-sm text-ink transition-colors hover:bg-asicom/5 disabled:opacity-50"
                          >
                            {f.value ?? <span className="text-ink/40">—</span>}
                          </button>
                        )}
                      </div>
                      <ConfidenceBadge
                        state={f.confidence.state}
                        reason={f.confidence.reason}
                        hint={badgeHint}
                        onClick={canConfirm || isBrokerGreen ? () => onBadgeClick(f) : undefined}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => copyField(f)}
                        disabled={!f.value || isEditing}
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
                <div className="hidden sm:block">
                  <div className="sticky top-4">
                    <ImageViewer
                      src={`/api/photo/${photoId}`}
                      alt={g.title}
                      caption={g.title}
                    />
                    <p className="mt-1.5 text-center text-[11px] text-ink/40">
                      Apasă pe imagine pentru a o mări
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
