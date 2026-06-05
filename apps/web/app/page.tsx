export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Issuedoc</h1>
      <p className="text-base text-zinc-600 dark:text-zinc-400">
        Extragere documente → fișă de emitere. Schelet inițial (PR1).
      </p>
      <p className="text-sm text-zinc-500">
        Urmează: autentificare + încărcare documente (PR2).
      </p>
    </main>
  );
}
