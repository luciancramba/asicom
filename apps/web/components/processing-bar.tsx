"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

/** Indeterminate loading bar + elapsed timer, shown while the processDosar action runs. */
export function ProcessingBar({ count }: { count: number }) {
  const { pending } = useFormStatus();
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [pending]);

  if (!pending) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-cloud">
        <div
          className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-asicom"
          style={{ animation: "asicom-loading 1.2s ease-in-out infinite" }}
        />
      </div>
      <p className="text-sm text-ink/60">
        Se procesează {count} {count === 1 ? "document" : "documente"}… {secs}s
        <span className="text-ink/40"> (citire + verificare, ~5–30s)</span>
      </p>
    </div>
  );
}
