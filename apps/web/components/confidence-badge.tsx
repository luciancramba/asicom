import type { ConfidenceState } from "@asicom/shared";

const STYLES: Record<ConfidenceState, { cls: string; icon: string; label: string }> = {
  verified: { cls: "bg-ok/10 text-ok", icon: "✓", label: "Verificat" },
  unverified: { cls: "bg-warn/10 text-warn", icon: "⚠", label: "Verifică" },
  failed: { cls: "bg-fail/10 text-fail", icon: "✗", label: "Eroare" },
};

export function ConfidenceBadge({ state, reason }: { state: ConfidenceState; reason?: string }) {
  const s = STYLES[state];
  return (
    <span
      title={reason}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}
    >
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}
