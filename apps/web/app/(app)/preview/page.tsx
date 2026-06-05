import Link from "next/link";

export const dynamic = "force-dynamic";

const SURFACES: {
  href: string;
  title: string;
  audience: "broker" | "client" | "public";
  what: string;
  why: string;
  icon: string;
}[] = [
  {
    href: "/automatizari",
    title: "Automatizări",
    audience: "broker",
    icon: "🔁",
    what:
      "Reminder-uri și mesaje automate către clienți: aniversări, rovinietă, ITP, polițe expirate, permis.",
    why: "Vândem brokerului scala — 30 ore/lună întoarse în relații.",
  },
  {
    href: "/portal-client",
    title: "Portal client",
    audience: "client",
    icon: "🪪",
    what:
      "Vederea clientului după emitere: datele lui, mașina lui, expirările, polițele active, panou AI cu cost de proprietate.",
    why: "Vândem clientului relația — polița nu se termină când o primește.",
  },
  {
    href: "/daune",
    title: "Daune asistate",
    audience: "client",
    icon: "🆘",
    what:
      "Flux de raportare daună de pe telefon. AI-ul analizează pozele, generează raport tehnic, brokerul te sună în 15 min.",
    why: "Vândem clientului liniștea — momentul cel mai stresant devine 3 pași.",
  },
  {
    href: "/inbox",
    title: "Inbox conversații",
    audience: "broker",
    icon: "💬",
    what:
      "Toate WhatsApp / SMS / Email de la clienți într-un loc. AI sugerează răspunsuri, mesajele automate sunt logate transparent.",
    why: "Vândem brokerului ordinea — fără context switching între 5 aplicații.",
  },
  {
    href: "/asicom-public",
    title: "Landing public",
    audience: "public",
    icon: "🌍",
    what:
      "Homepage asicom.cramba.ro pentru prospecți. Hero, value props, cum funcționează, testimonial Tripon, prețuri.",
    why: 'Vândem prospectului promisiunea — „Documentul devine poliță".',
  },
];

const AUDIENCE_LABEL: Record<string, { ro: string; cls: string }> = {
  broker: { ro: "BROKER", cls: "bg-asicom/10 text-asicom" },
  client: { ro: "CLIENT", cls: "bg-ok/10 text-ok" },
  public: { ro: "PROSPECT", cls: "bg-warn/10 text-warn" },
};

export default function PreviewHub() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PREVIEW SURFACES.</span> Mai jos sunt toate paginile demo
        — mockup-uri în brand Asicom care arată unde merge produsul după PR5 (emitere) și PR6
        (emis + purge). Datele sunt hardcodate, ancorate la clienții noștri de test (Tripon,
        Filip-Chiș, Cramba, Secherneș) ca să fie credibile pentru demonstrație.
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Roadmap</p>
          <h1 className="font-display text-3xl font-light text-ink">Vizionează viitorul</h1>
          <p className="mt-1 text-sm text-ink/60">
            5 suprafețe demo care arată cum se conectează emitere → relație → reînnoire → daună →
            scale.
          </p>
        </div>
      </div>

      {/* The 5 surfaces */}
      <ul className="grid gap-3 sm:grid-cols-2">
        {SURFACES.map((s) => {
          const a = AUDIENCE_LABEL[s.audience];
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                className="flex h-full flex-col gap-3 rounded-xl border border-line bg-white p-5 transition-colors hover:border-asicom/40 hover:bg-cloud/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{s.icon}</span>
                    <h2 className="font-display text-xl text-ink">{s.title}</h2>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${a.cls}`}>
                    {a.ro}
                  </span>
                </div>
                <p className="flex-1 text-sm text-ink/70">{s.what}</p>
                <p className="rounded-md border border-line bg-cloud/50 px-3 py-2 text-xs italic text-ink/55">
                  <span className="font-medium not-italic">De ce contează:</span> {s.why}
                </p>
                <span className="self-end text-sm text-asicom">Deschide →</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* The pitch */}
      <section className="rounded-2xl border border-asicom/20 bg-gradient-to-br from-cloud via-white to-asicom/5 p-6">
        <h2 className="font-display text-2xl text-ink">Cum se leagă</h2>
        <p className="mt-2 text-sm text-ink/70">
          Cele 5 suprafețe spun aceeași poveste, văzută din 3 perspective: clientul (portal,
          daune), brokerul (automatizări, inbox) și prospectul (landing). Toate au la bază
          aceeași spină — fișa de emitere și datele structurate — iar emiterea este momentul care
          deschide toate celelalte fluxuri.
        </p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <Pill icon="📄" text="Emitere asistată" />
          <Arrow />
          <Pill icon="🪪" text="Portal client + AI" />
          <Pill icon="🆘" text="Daune asistate" />
          <Arrow />
          <Pill icon="🔁" text="Automatizări reînnoire" />
          <Pill icon="💬" text="Inbox unificat" />
          <Arrow />
          <Pill icon="🌍" text="Landing → noi clienți" />
        </div>
      </section>
    </div>
  );
}

function Pill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-center text-xs font-medium text-ink">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-asicom/50">↓</div>
  );
}
