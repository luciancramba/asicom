"use client";

import { useFormStatus } from "react-dom";

export function ProcessButton({ processed }: { processed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-asicom px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-asicom-mid disabled:opacity-50"
    >
      {pending ? "Se procesează…" : processed ? "Reprocesează" : "Procesează documentele"}
    </button>
  );
}
