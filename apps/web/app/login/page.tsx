import { AsicomLogo } from "@/components/asicom-logo";
import { BRAND } from "@/lib/brand";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-asicom-gradient flex items-center px-6 py-4 sm:px-10">
        <AsicomLogo className="h-9 w-auto text-white" />
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">
          {BRAND.descriptor}
        </p>
        <h1 className="font-display text-3xl font-light text-ink">Autentificare</h1>

        <form action={loginAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink/70">
            Utilizator
            <input
              name="user"
              defaultValue="tripon"
              autoComplete="username"
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-asicom-mid"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink/70">
            Parolă
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-asicom-mid"
            />
          </label>

          {error ? <p className="text-sm text-warn">Utilizator sau parolă incorecte.</p> : null}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-asicom px-4 py-2.5 font-semibold text-white transition-colors hover:bg-asicom-mid"
          >
            Intră
          </button>
        </form>

        <p className="mt-10 font-display text-lg italic text-ink/40">„{BRAND.sloganSecondary}”</p>
      </main>
    </div>
  );
}
