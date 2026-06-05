import { AsicomLogo } from "@/components/asicom-logo";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* App header — official gradient, white logo left, white nav right (Brand Book §6) */}
      <header className="bg-asicom-gradient flex items-center justify-between px-6 py-4 sm:px-10">
        <AsicomLogo className="h-9 w-auto text-white" />
        <nav className="hidden gap-7 text-sm font-medium sm:flex">
          <span className="border-b-2 border-white pb-0.5 text-white">Dosar nou</span>
          <span className="text-white/85">Fișa de emitere</span>
          <span className="text-white/85">Panou admin</span>
        </nav>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-20 sm:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">
          {BRAND.descriptor}
        </p>
        <h1 className="font-display text-5xl font-light leading-[1.08] tracking-tight text-ink sm:text-6xl">
          Documentul devine <em className="font-normal italic text-asicom">poliță</em>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/60">
          Pozele documentelor (buletin, talon, permis) sunt citite automat, verificate matematic și
          transformate în fișa de emitere — fără nicio literă tastată manual.
        </p>

        <blockquote className="mt-12 border-l-[3px] border-asicom-light pl-7 font-display text-2xl italic text-ink">
          „{BRAND.sloganSecondary}”
          <footer className="mt-3 font-sans text-xs not-italic uppercase tracking-[0.18em] text-ink/50">
            Principiul {BRAND.name}
          </footer>
        </blockquote>

        <p className="mt-12 font-mono text-xs text-ink/40">
          Schelet inițial · autentificare + încărcare documente urmează (PR2)
        </p>
      </main>

      <footer className="border-t border-cloud px-6 py-6 text-sm text-ink/50 sm:px-10">
        <span className="font-display italic text-asicom">{BRAND.name}</span> · {BRAND.descriptor} —
        construit de {BRAND.builtBy} · {BRAND.url}
      </footer>
    </div>
  );
}
