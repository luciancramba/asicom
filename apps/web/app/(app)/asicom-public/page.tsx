export const dynamic = "force-dynamic";

/**
 * Preview-only public landing — what a prospect would see at asicom.cramba.ro before they sign up.
 * Hardcoded marketing copy aligned with the Asicom brand voice ("Documentul devine poliță",
 * "Datele nu se transcriu. Se verifică."). Demo-only for now; in production this would live
 * outside the auth gate at the apex domain.
 */
export default function AsicomPublicPreview() {
  return (
    <div className="flex flex-col gap-12">
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — landing public.</span> Așa va arăta
        homepage-ul public asicom.cramba.ro pentru prospecții care nu au cont. Conținutul de
        mai jos este final ca tonalitate, doar copy-paste într-un viitor site marketing.
      </div>

      {/* HERO */}
      <section className="rounded-3xl bg-asicom-gradient px-6 py-14 text-white sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/70">
            Asicom · Emitere asistată
          </p>
          <h1 className="mt-3 font-display text-5xl font-light leading-tight sm:text-6xl">
            Documentul devine poliță.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Asigurare auto fără hârțogărie. Trimite o poză cu buletinul și talonul, restul facem noi.
            Datele nu se transcriu — se verifică.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-asicom shadow-sm transition-transform hover:scale-105"
            >
              Cere ofertă în 2 minute
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Vezi cum funcționează
            </button>
          </div>
          <p className="mt-5 text-[11px] uppercase tracking-wider text-white/55">
            Folosit zilnic de Lucian Tripon · ASICOM Alba · 139 polițe/lună
          </p>
        </div>
      </section>

      {/* 3 VALUE PROPS */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Prop
          icon="📱"
          title="2 minute, de pe telefon"
          body="Trimite poze cu buletinul, talonul și permisul. AI-ul citește, verifică și pregătește polița. Tu doar semnezi."
        />
        <Prop
          icon="✓"
          title="Verificare deterministă"
          body="Codul de control al CNP-ului, datele de pe MRZ, ITP-ul, anul mașinii — toate trecute prin reguli matematice. Verde înseamnă demonstrat, nu ghicit."
        />
        <Prop
          icon="📞"
          title="Brokerul tău, un apel distanță"
          body="După ce primești polița primești și un cont la portal.asicom.cramba.ro cu toate datele tale și un panou AI pentru mașina ta. Brokerul tău e mereu disponibil."
        />
      </section>

      {/* HOW IT WORKS */}
      <section>
        <h2 className="text-center font-display text-3xl font-light text-ink">Cum funcționează</h2>
        <p className="mt-2 text-center text-sm text-ink/60">
          3 pași simpli. Niciunul nu cere să scrii ceva la mână.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          <Step
            n={1}
            title="Trimite pozele"
            body="Buletinul, talonul, permisul. De pe telefon, drag-drop pe site, sau WhatsApp brokerului tău."
          />
          <Step
            n={2}
            title="AI-ul verifică"
            body="Citim 28 de câmpuri, validăm CNP-ul, comparăm cu permisul, verificăm că documentele nu sunt expirate. ~30 de secunde."
          />
          <Step
            n={3}
            title="Primești polița"
            body="PDF semnat, plus acces la portalul tău cu toate documentele și expirările urmărite automat."
          />
        </ol>
      </section>

      {/* CALCULATOR / SOCIAL PROOF */}
      <section className="grid gap-6 rounded-2xl border border-line bg-cloud/40 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-asicom-mid">Cât economisești</p>
          <h2 className="mt-2 font-display text-3xl font-light text-ink">
            ~13 minute per poliță emisă
          </h2>
          <p className="mt-3 max-w-prose text-sm text-ink/65">
            Înainte de Asicom: ~15 minute de re-tastat date în Insuretech. Cu Asicom: ~2 minute de
            verificat ce s-a citit deja. La 139 polițe pe lună (cazul lui Lucian Tripon), asta înseamnă
            <span className="font-bold text-ink"> 30 ore lunar </span>
            întoarse în relația cu clientul, nu în formulare.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric value="139" label="polițe/lună" />
          <Metric value="30h" label="economisite lunar" />
          <Metric value="28" label="câmpuri verificate" />
          <Metric value="3-state" label="trust model" />
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8 text-center">
        <p className="font-display text-2xl font-light italic leading-snug text-ink">
          {`„Asicom mi-a întors timpul. Înainte pierdeam o zi pe săptămână cu re-tastatul în Insuretech. Acum vorbesc cu clienții."`}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-asicom-gradient" />
          <div className="text-left">
            <div className="text-sm font-medium text-ink">Lucian Tripon</div>
            <div className="text-xs text-ink/55">Broker ASICOM · Alba Iulia · 12 ani experiență</div>
          </div>
        </div>
      </section>

      {/* PRICING / SIGN UP */}
      <section className="rounded-2xl border border-line bg-white p-8">
        <h2 className="text-center font-display text-3xl font-light text-ink">
          Începe gratuit
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/60">
          Asicom e disponibil prin brokerul tău. Dacă încă nu ai unul, te punem în legătură cu
          partenerii noștri ASICOM.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <PriceCard
            tier="Client"
            price="Gratuit"
            bullets={[
              "Trimite poze, primește polița",
              "Portal personal cu toate datele",
              "AI dashboard pentru mașina ta",
              "WhatsApp / SMS reminder-uri",
            ]}
            cta="Sună brokerul tău"
          />
          <PriceCard
            tier="Broker (parteneriat)"
            price="29 EUR / lună"
            bullets={[
              "Emitere asistată nelimitată",
              "Inbox unificat WhatsApp + SMS + Email",
              "Automatizări: aniversări, rovinietă, ITP",
              "Comparator RCA cu 3 asigurători",
              "Dashboard KPI și portal client",
            ]}
            cta="Începe perioada de test"
            highlighted
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line pt-6 text-center text-xs text-ink/50">
        <p>
          <span className="font-display italic text-asicom">Asicom</span> · Emitere asistată ·
          un produs Cramba App Studio · cramba.ro
        </p>
        <p className="mt-2 italic text-ink/40">{`„Datele nu se transcriu. Se verifică."`}</p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Prop({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-display text-lg text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="rounded-xl border border-line bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-asicom-gradient font-mono text-sm font-bold text-white">
        {n}
      </div>
      <h3 className="mt-4 font-display text-lg text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </li>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3 text-center">
      <div className="font-mono text-2xl text-asicom">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-ink/50">{label}</div>
    </div>
  );
}

function PriceCard({
  tier,
  price,
  bullets,
  cta,
  highlighted,
}: {
  tier: string;
  price: string;
  bullets: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        highlighted ? "border-asicom bg-asicom/5 shadow-md" : "border-line bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xl text-ink">{tier}</h3>
        <div className="text-right">
          <div className="font-mono text-2xl text-ink">{price}</div>
        </div>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-ink/75">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-ok">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          highlighted
            ? "bg-asicom text-white hover:bg-asicom-mid"
            : "border border-asicom text-asicom hover:bg-asicom hover:text-white"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
