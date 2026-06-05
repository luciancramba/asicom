"use client";

import type { ConfidenceState } from "@asicom/shared";

const STYLES: Record<ConfidenceState, { cls: string; icon: string; label: string }> = {
  verified: { cls: "bg-ok/10 text-ok", icon: "✓", label: "Verificat" },
  unverified: { cls: "bg-warn/10 text-warn", icon: "⚠", label: "Verifică" },
  failed: { cls: "bg-fail/10 text-fail", icon: "✗", label: "Eroare" },
};

interface Props {
  state: ConfidenceState;
  reason?: string;
  /** When given, the badge becomes a clickable button (broker confirm / unconfirm). */
  onClick?: () => void;
  /** Disable interaction (e.g. while a toggle is in flight). */
  disabled?: boolean;
  /** Optional tooltip override — shown when the broker-confirm hint matters more than the reason. */
  hint?: string;
}

export function ConfidenceBadge({ state, reason, onClick, disabled, hint }: Props) {
  const s = STYLES[state];
  const cls = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`;

  if (!onClick) {
    return (
      <span title={reason} className={cls}>
        <span aria-hidden>{s.icon}</span>
        {s.label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint ?? reason}
      aria-label={`${s.label}${hint ? ` — ${hint}` : ""}`}
      className={`${cls} cursor-pointer transition-opacity hover:opacity-75 disabled:opacity-50`}
    >
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </button>
  );
}
