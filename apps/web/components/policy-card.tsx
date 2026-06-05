"use client";

import { useTransition } from "react";
import { deletePolicy } from "@/lib/actions";

interface PolicyRow {
  id: string;
  policyNumber: string | null;
  insurer: string | null;
  type: string | null;
  validFrom: string | null;
  validTo: string | null;
  source: string | null;
  filepath: string | null;
  purgedAt: string | null;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  rca: "RCA",
  pad: "PAD",
  facultativ: "CASCO",
};

/**
 * Display card for an attached policy. Shows the AI-extracted metadata, with delete + (future)
 * re-extract actions. After purge expires, the file is gone but the metadata stays — we mark
 * the card with a discreet "PDF arhivat (GDPR)" pill so the broker knows why the download
 * disappeared.
 */
export function PolicyCard({ dosarId, policy }: { dosarId: string; policy: PolicyRow }) {
  const [pending, startTransition] = useTransition();
  const typeLabel = policy.type ? TYPE_LABEL[policy.type] ?? policy.type.toUpperCase() : "—";
  const purged = Boolean(policy.purgedAt);

  function onDelete() {
    if (!confirm("Sigur ștergi polița atașată?")) return;
    const fd = new FormData();
    fd.set("dosarId", dosarId);
    fd.set("policyId", policy.id);
    startTransition(async () => {
      await deletePolicy(fd);
    });
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-asicom px-2.5 py-0.5 text-xs font-bold text-white">
            {typeLabel}
          </span>
          <span className="text-sm font-medium text-ink">{policy.insurer ?? "Asigurător necunoscut"}</span>
        </div>
        <div className="flex items-center gap-2">
          {purged ? (
            <span className="rounded-full bg-cloud px-2 py-0.5 text-[10px] font-medium text-ink/55">
              📂 PDF arhivat (GDPR)
            </span>
          ) : policy.filepath ? (
            <a
              href={`/api/policy/${policy.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-asicom hover:bg-cloud"
            >
              Deschide PDF
            </a>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-fail hover:bg-fail/5 disabled:opacity-50"
          >
            {pending ? "…" : "Șterge"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KV label="Număr poliță" value={policy.policyNumber} mono />
        <KV label="Valabilă de la" value={policy.validFrom} mono />
        <KV label="Valabilă până la" value={policy.validTo} mono />
        <KV label="Sursă" value={policy.source === "pdf" ? "PDF (AI)" : "Manual"} />
      </div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink/40">{label}</div>
      <div className={`mt-0.5 text-sm text-ink ${mono ? "font-mono" : ""}`}>
        {value ?? <span className="text-ink/40">—</span>}
      </div>
    </div>
  );
}
