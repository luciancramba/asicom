import Link from "next/link";
import { UploadForm } from "@/components/upload-form";

export const dynamic = "force-dynamic";

export default function NewDosarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Dosar nou</p>
        <h1 className="font-display text-3xl font-light text-ink">Încarcă documentele</h1>
        <p className="mt-2 text-ink/60">
          Buletin, talon, permis — până la 5 poze. Le citim și verificăm automat.
        </p>
      </div>

      <UploadForm />

      <Link href="/" className="text-sm text-asicom transition-colors hover:underline">
        ← Înapoi la dosare
      </Link>
    </div>
  );
}
