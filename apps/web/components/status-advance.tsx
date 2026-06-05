"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { advanceDosarStatus } from "@/lib/actions";

interface Props {
  dosarId: string;
  status: string;
  /** How many fields have a value but aren't verified or broker-confirmed — drives the soft-gate. */
  unverifiedCount: number;
}

function PrimaryButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-asicom px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-asicom-mid disabled:opacity-50"
    >
      {pending ? "Se actualizează…" : label}
    </button>
  );
}

function GhostButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-cloud disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

/**
 * Sticky bottom row that advances the dosar along the pipeline. Soft-gate on the "Marchează gata"
 * action: if any field is still 🟡/🔴, we ask once and let the broker proceed — brokers sometimes
 * need to ship with incomplete data and we respect that judgement. Step-back is always allowed.
 */
export function StatusAdvance({ dosarId, status, unverifiedCount }: Props) {
  const [confirmingGata, setConfirmingGata] = useState(false);

  return (
    <div className="sticky bottom-0 -mx-2 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white/95 px-2 py-3 backdrop-blur">
      <div className="text-xs text-ink/60">
        {status === "de_verificat" ? (
          unverifiedCount === 0 ? (
            <span>{'Toate câmpurile sunt verificate. Apasă „Marchează gata" pentru a continua.'}</span>
          ) : (
            <span>
              <span className="font-medium text-warn">{unverifiedCount}</span>{" "}
              {unverifiedCount === 1 ? "câmp" : "câmpuri"} încă neverificate.
            </span>
          )
        ) : status === "gata" ? (
          <span>{'Dosar gata de emitere. După ce emiți polița, apasă „Marchează emis".'}</span>
        ) : status === "emis" ? (
          <span className="text-ok">✓ Dosar emis.</span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {status === "de_verificat" ? (
          <form action={advanceDosarStatus} className="flex items-center gap-2">
            <input type="hidden" name="dosarId" value={dosarId} />
            <input type="hidden" name="to" value="gata" />
            {confirmingGata && unverifiedCount > 0 ? (
              <>
                <span className="text-xs text-warn">Continui cu {unverifiedCount} neverificate?</span>
                <button
                  type="button"
                  onClick={() => setConfirmingGata(false)}
                  className="rounded-lg border border-line px-3 py-2 text-sm text-ink/70 hover:bg-cloud"
                >
                  Anulează
                </button>
                <PrimaryButton label="Da, marchează gata" />
              </>
            ) : (
              <button
                type={unverifiedCount > 0 ? "button" : "submit"}
                onClick={unverifiedCount > 0 ? () => setConfirmingGata(true) : undefined}
                className="rounded-lg bg-asicom px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-asicom-mid"
              >
                Marchează gata
              </button>
            )}
          </form>
        ) : null}

        {status === "gata" ? (
          <>
            <form action={advanceDosarStatus}>
              <input type="hidden" name="dosarId" value={dosarId} />
              <input type="hidden" name="to" value="de_verificat" />
              <GhostButton label="← Înapoi la verificare" />
            </form>
            <form action={advanceDosarStatus}>
              <input type="hidden" name="dosarId" value={dosarId} />
              <input type="hidden" name="to" value="emis" />
              <PrimaryButton label="Marchează emis" />
            </form>
          </>
        ) : null}

        {status === "emis" ? (
          <form action={advanceDosarStatus}>
            <input type="hidden" name="dosarId" value={dosarId} />
            <input type="hidden" name="to" value="gata" />
            <GhostButton label={'← Revine la „gata"'} />
          </form>
        ) : null}
      </div>
    </div>
  );
}
