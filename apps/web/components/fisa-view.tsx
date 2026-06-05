"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { fieldsByGroup, type FieldResult, type FieldGroup } from "@asicom/shared";
import { ConfidenceBadge } from "./confidence-badge";
import { ImageViewer } from "./image-viewer";
import { setFieldValue, toggleFieldConfirmed } from "@/lib/actions";

interface PanelDef {
  key: FieldGroup;
  title: string;
  source?: "buletin" | "talon";
}
const PANELS: PanelDef[] = [
  { key: "client", title: "Date asigurat", source: "buletin" },
  { key: "vehicul", title: "Date vehicul", source: "talon" },
  { key: "valabilitate", title: "Valabilitate" },
];

const SECTIONS = [
  { key: "pending", title: "De verificat manual" },
  { key: "manual", title: "Fără sursă pe act" },
  { key: "auto", title: "Verificate automat" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

function sectionOf(f: FieldResult): SectionKey {
  if (f.confidence.state === "verified") return "auto";
  if (f.source === "manual") return "manual";
  return "pending";
}

/**
 * Verification flow inspired by Cramba's prototype (verificare-asigurat-prototip.html):
 *   - One panel at a time, tabs across the top (Asigurat → Vehicul → Valabilitate)
 *   - Fields grouped into 3 sections per panel: pending review / no document source / auto-verified
 *   - Auto-verified rows collapsed by default; click to expand
 *   - Source documents stacked sticky on the right with click-to-zoom lightbox
 *   - Keyboard nav: ↑/↓ move active row, Enter = confirm, E = edit, Esc = cancel
 *   - Progress bar shows N/M verificate for the active panel
 *   - Filter checkbox: "doar neverificate" hides everything already green
 *   - Sticky footer: count of unverified + "Continuă" advances to next tab, last tab routes
 *     status-advance via the StatusAdvance component below (kept untouched).
 * The bbox-based per-field crop + spotlight from the prototype is PR2 (needs bbox in extraction).
 */
export function FisaView({
  fields,
  photosByDoc,
  dosarId,
}: {
  fields: FieldResult[];
  photosByDoc: Record<string, string[]>;
  dosarId: string;
}) {
  const fieldsById = useMemo(() => new Map(fields.map((f) => [f.id, f])), [fields]);
  const [activePanel, setActivePanel] = useState<FieldGroup>("client");
  // Lazy init: first pending field of the first panel, fallback to first row, fallback to null.
  const [activeFieldId, setActiveFieldId] = useState<string | null>(() => {
    const initial = fieldsByGroup("client")
      .map((def) => fields.find((f) => f.id === def.id))
      .filter((f): f is FieldResult => Boolean(f));
    const firstPending = initial.find((f) => f.confidence.state !== "verified");
    return (firstPending ?? initial[0])?.id ?? null;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [onlyUnverified, setOnlyUnverified] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const panelDef = PANELS.find((p) => p.key === activePanel)!;
  const panelFields = useMemo(
    () =>
      fieldsByGroup(activePanel)
        .map((def) => fieldsById.get(def.id))
        .filter((f): f is FieldResult => Boolean(f)),
    [activePanel, fieldsById],
  );

  // ----- Active field / keyboard navigation -----
  const visibleFields = useMemo(
    () =>
      panelFields.filter((f) => {
        if (!onlyUnverified) return true;
        return f.confidence.state !== "verified";
      }),
    [panelFields, onlyUnverified],
  );

  /** Focus first amber/red row of a panel. Called inline on panel/filter change. */
  function refocusForPanel(visible: FieldResult[]) {
    if (!visible.length) {
      setActiveFieldId(null);
    } else {
      const firstPending = visible.find((f) => f.confidence.state !== "verified");
      setActiveFieldId((firstPending ?? visible[0]).id);
    }
    setEditingId(null);
  }
  function switchPanel(key: FieldGroup) {
    setActivePanel(key);
    const next = fieldsByGroup(key)
      .map((def) => fieldsById.get(def.id))
      .filter((f): f is FieldResult => Boolean(f))
      .filter((f) => !onlyUnverified || f.confidence.state !== "verified");
    refocusForPanel(next);
  }
  function toggleFilter(checked: boolean) {
    setOnlyUnverified(checked);
    const next = panelFields.filter((f) => !checked || f.confidence.state !== "verified");
    refocusForPanel(next);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingId) return; // typing in input — let the input handle keys
      if (!activeFieldId) return;
      const idx = visibleFields.findIndex((f) => f.id === activeFieldId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = visibleFields[Math.min(idx + 1, visibleFields.length - 1)];
        if (next) setActiveFieldId(next.id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = visibleFields[Math.max(idx - 1, 0)];
        if (prev) setActiveFieldId(prev.id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const f = visibleFields[idx];
        if (f && f.value && f.confidence.state !== "verified") onBadgeClick(f);
      } else if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        const f = visibleFields[idx];
        if (f) startEdit(f);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFieldId, editingId, visibleFields.map((f) => f.id).join("|")]);

  // ----- Clipboard -----
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
    if (ok) flash(f.id);
    else flashError(f.id);
  }

  // ----- Server actions -----
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
    setActiveFieldId(f.id);
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

  // ----- Per-panel progress -----
  const panelTotal = panelFields.filter((f) => f.value || f.source === "manual").length;
  const panelVerified = panelFields.filter(
    (f) => f.confidence.state === "verified" || (f.source === "manual" && f.value),
  ).length;
  const remaining = panelTotal - panelVerified;
  const panelIdx = PANELS.findIndex((p) => p.key === activePanel);
  const nextPanel = PANELS[panelIdx + 1];

  // ----- Group fields into sections for display -----
  const bySection: Record<SectionKey, FieldResult[]> = { pending: [], manual: [], auto: [] };
  for (const f of visibleFields) bySection[sectionOf(f)].push(f);

  const sourcePhotos = panelDef.source ? (photosByDoc[panelDef.source] ?? []) : [];

  // ----- Copy whole panel -----
  async function copyPanel() {
    const text = panelFields
      .filter((f) => f.value)
      .map((f) => `${f.label}: ${f.value}`)
      .join("\n");
    const ok = await writeClipboard(text);
    if (ok) flash("__panel__");
    else flashError("__panel__");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-white p-1">
        {PANELS.map((p, i) => {
          const isActive = p.key === activePanel;
          const groupFields = fieldsByGroup(p.key)
            .map((def) => fieldsById.get(def.id))
            .filter((f): f is FieldResult => Boolean(f));
          const ver = groupFields.filter(
            (f) => f.confidence.state === "verified" || (f.source === "manual" && f.value),
          ).length;
          const tot = groupFields.filter((f) => f.value || f.source === "manual").length;
          const done = tot > 0 && ver === tot;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => switchPanel(p.key)}
              className={`flex flex-1 min-w-[8rem] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-asicom text-white"
                  : "text-ink/70 hover:bg-cloud"
              }`}
            >
              <span className="font-mono text-xs opacity-70">{i + 1}.</span>
              <span>{p.title}</span>
              {tot > 0 ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : done
                      ? "bg-ok/10 text-ok"
                      : "bg-warn/10 text-warn"
                }`}>{ver}/{tot}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Progress bar + filter */}
      <div className="flex items-center gap-3 rounded-lg border border-line bg-cloud px-3 py-2">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>{panelVerified}/{panelTotal} verificate</span>
            <span>{Math.round((panelVerified / Math.max(1, panelTotal)) * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ok transition-all"
              style={{ width: `${(panelVerified / Math.max(1, panelTotal)) * 100}%` }}
            />
          </div>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-ink/70">
          <input
            type="checkbox"
            checked={onlyUnverified}
            onChange={(e) => toggleFilter(e.target.checked)}
            className="cursor-pointer"
          />
          Doar neverificate
        </label>
        <button
          type="button"
          onClick={copyPanel}
          className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
            errorId === "__panel__"
              ? "border-fail/40 bg-fail/5 text-fail"
              : "border-line text-asicom hover:bg-white"
          }`}
        >
          {copiedId === "__panel__" ? "✓ Copiat" : errorId === "__panel__" ? "✗ Eroare" : "Copiază panoul"}
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[11px] text-ink/40">
        <kbd className="rounded border border-line bg-white px-1 py-0.5 font-mono">↑</kbd>{" "}
        <kbd className="rounded border border-line bg-white px-1 py-0.5 font-mono">↓</kbd>{" "}
        navighează ·{" "}
        <kbd className="rounded border border-line bg-white px-1 py-0.5 font-mono">Enter</kbd>{" "}
        confirmă ·{" "}
        <kbd className="rounded border border-line bg-white px-1 py-0.5 font-mono">E</kbd>{" "}
        editează ·{" "}
        <kbd className="rounded border border-line bg-white px-1 py-0.5 font-mono">Esc</kbd>{" "}
        anulează
      </p>

      {/* Split layout: fields left, sticky images right */}
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Field list */}
        <div className="flex flex-col gap-4">
          {SECTIONS.map((sec) => {
            const list = bySection[sec.key];
            if (!list.length) return null;
            return (
              <div key={sec.key} className="flex flex-col gap-2">
                <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
                  {sec.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {list.map((f) => (
                    <FieldRow
                      key={f.id}
                      f={f}
                      isActive={f.id === activeFieldId}
                      isEditing={f.id === editingId}
                      isPending={f.id === pendingId}
                      copiedId={copiedId}
                      errorId={errorId}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      onActivate={() => setActiveFieldId(f.id)}
                      onConfirm={() => onBadgeClick(f)}
                      onStartEdit={() => startEdit(f)}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={() => saveEdit(f)}
                      onCopy={() => copyField(f)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
          {visibleFields.length === 0 ? (
            <p className="rounded-lg border border-line bg-cloud px-3 py-6 text-center text-sm text-ink/50">
              {onlyUnverified
                ? "Toate câmpurile sunt verificate ✓"
                : "Niciun câmp pentru acest panou."}
            </p>
          ) : null}
        </div>

        {/* Sticky source images */}
        {sourcePhotos.length > 0 ? (
          <div className="hidden sm:block">
            <div className="sticky top-4 flex flex-col gap-3">
              {sourcePhotos.map((photoId, idx) => (
                <div key={photoId}>
                  <ImageViewer
                    src={`/api/photo/${photoId}`}
                    alt={`${panelDef.title} (poza ${idx + 1})`}
                    caption={
                      sourcePhotos.length === 1
                        ? panelDef.title
                        : `${panelDef.title} — sursa ${idx + 1} din ${sourcePhotos.length}`
                    }
                  />
                  <p className="mt-1 text-center text-[11px] text-ink/40">
                    {sourcePhotos.length === 1
                      ? "Apasă pentru zoom"
                      : `Sursa ${idx + 1} din ${sourcePhotos.length}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* In-panel footer: continue to next tab */}
      <div className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
        <p className="text-sm text-ink/60">
          {remaining === 0 ? (
            <span className="text-ok">✓ Toate câmpurile acestui panou sunt verificate.</span>
          ) : (
            <>
              <span className="font-medium text-warn">{remaining}</span>{" "}
              {remaining === 1 ? "câmp încă neverificat" : "câmpuri încă neverificate"}.
            </>
          )}
        </p>
        {nextPanel ? (
          <button
            type="button"
            onClick={() => switchPanel(nextPanel.key)}
            className="rounded-lg border border-asicom px-3 py-1.5 text-sm font-medium text-asicom transition-colors hover:bg-asicom hover:text-white"
          >
            Continuă → {nextPanel.title}
          </button>
        ) : (
          <span className="text-xs text-ink/40">
            {'Foloseşte „Marchează gata" de mai jos.'}
          </span>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FieldRow — one row, supporting collapsed (auto-verified) / expanded states.
// ----------------------------------------------------------------------------
function FieldRow({
  f,
  isActive,
  isEditing,
  isPending,
  copiedId,
  errorId,
  editValue,
  setEditValue,
  onActivate,
  onConfirm,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onCopy,
}: {
  f: FieldResult;
  isActive: boolean;
  isEditing: boolean;
  isPending: boolean;
  copiedId: string | null;
  errorId: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  onActivate: () => void;
  onConfirm: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onCopy: () => void;
}) {
  const isAuto = f.confidence.state === "verified";
  const isManual = f.source === "manual";
  const canConfirm = f.confidence.state !== "verified" && Boolean(f.value);

  // Collapsed auto-verified row: just label, inline value, badge.
  if (isAuto && !isActive) {
    return (
      <li
        onClick={onActivate}
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 hover:border-ok/40"
      >
        <span className="shrink-0 text-xs font-medium text-ink/60">{f.label}</span>
        <span className="truncate font-mono text-sm text-ink">{f.value}</span>
        <span className="ml-auto shrink-0">
          <ConfidenceBadge state={f.confidence.state} reason={f.confidence.reason} />
        </span>
      </li>
    );
  }

  return (
    <li
      onClick={onActivate}
      className={`flex cursor-pointer flex-col gap-2 rounded-lg border bg-white px-3 py-2.5 transition-colors ${
        isActive
          ? "border-asicom shadow-[0_0_0_1px] shadow-asicom/30 ring-1 ring-asicom/20"
          : "border-line"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-ink/60">{f.label}</span>
        {f.confidence.reason ? (
          <span className="text-[10px] text-ink/40">· {f.confidence.reason}</span>
        ) : null}
        <span className="ml-auto">
          <ConfidenceBadge
            state={f.confidence.state}
            reason={f.confidence.reason}
            hint={canConfirm ? "Apasă pentru a confirma" : f.confidence.reason}
            onClick={canConfirm || (isAuto && f.confidence.by === "broker") ? onConfirm : undefined}
            disabled={isPending}
          />
        </span>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            className="w-full rounded border border-asicom bg-white px-2 py-1.5 font-mono text-sm text-ink outline-none"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSaveEdit();
            }}
            disabled={isPending}
            className="rounded-md bg-asicom px-2.5 py-1.5 text-xs font-medium text-white hover:bg-asicom-mid disabled:opacity-50"
          >
            Salvează
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancelEdit();
            }}
            className="text-xs text-ink/60 hover:text-ink"
          >
            Anulează
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          disabled={isPending}
          className="-mx-1 block w-full truncate rounded px-1 py-0.5 text-left font-mono text-lg text-ink transition-colors hover:bg-asicom/5"
        >
          {f.value ?? (
            <span className="text-base text-ink/40">— completează manual —</span>
          )}
        </button>
      )}

      {isActive && !isEditing ? (
        <div className="flex items-center gap-2 pt-1">
          {canConfirm ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              disabled={isPending}
              className="rounded-md bg-ok px-2.5 py-1 text-xs font-medium text-white hover:bg-ok/85 disabled:opacity-50"
            >
              ✓ Confirmă
            </button>
          ) : null}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-asicom hover:bg-cloud"
          >
            ✎ Editează
          </button>
          {f.value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                errorId === f.id
                  ? "border-fail/40 bg-fail/5 text-fail"
                  : "border-line text-asicom hover:bg-cloud"
              }`}
            >
              {copiedId === f.id ? "✓ Copiat" : errorId === f.id ? "✗ Eroare" : "Copiază"}
            </button>
          ) : null}
          {isManual && !f.value ? (
            <span className="text-[11px] text-ink/40">
              Nu există pe act — cere clientului.
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
