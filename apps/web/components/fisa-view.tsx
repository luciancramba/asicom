import { fieldsByGroup, type FieldResult, type FieldGroup } from "@asicom/shared";
import { ConfidenceBadge } from "./confidence-badge";

const GROUPS: { key: FieldGroup; title: string; source?: "buletin" | "talon" }[] = [
  { key: "client", title: "Date asigurat", source: "buletin" },
  { key: "vehicul", title: "Date vehicul", source: "talon" },
  { key: "valabilitate", title: "Valabilitate" },
];

/** Rough fišă de emitere — fields in Insuretech order, badges, source document beside each group.
 *  Copy-per-field + Insuretech adapter come in PR4. */
export function FisaView({
  fields,
  photoByDoc,
}: {
  fields: FieldResult[];
  photoByDoc: Record<string, string | undefined>;
}) {
  const byId = new Map(fields.map((f) => [f.id, f]));

  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map((g) => {
        const rows = fieldsByGroup(g.key)
          .map((def) => byId.get(def.id))
          .filter((f): f is FieldResult => Boolean(f));
        const photoId = g.source ? photoByDoc[g.source] : undefined;

        return (
          <section key={g.key} className="overflow-hidden rounded-xl border border-line">
            <header className="border-b border-line bg-cloud px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-asicom">
                {g.title}
              </span>
            </header>
            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto]">
              <ul className="flex flex-col divide-y divide-line">
                {rows.map((f) => (
                  <li key={f.id} className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-xs text-ink/50">{f.label}</div>
                      <div className="truncate font-mono text-sm text-ink">{f.value ?? "—"}</div>
                    </div>
                    <ConfidenceBadge state={f.confidence.state} reason={f.confidence.reason} />
                  </li>
                ))}
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
