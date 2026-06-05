export const dynamic = "force-dynamic";

/**
 * Preview-only customer-perspective claim flow ("daună" = damage report). Shows what a client
 * sees the moment they need the broker most — after an accident — and how AI assistance turns
 * a painful, paperwork-heavy process into a 3-step phone interaction. Hardcoded mock; banner
 * makes the demo status explicit.
 */
export default function DaunePreview() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — flux de daună.</span> Așa va arăta procesul
        de raportare a unei daune din perspectiva clientului. AI-ul analizează pozele și
        generează un raport tehnic, brokerul este notificat instant, iar clientul nu are nimic
        de scris sau de printat. Cazul afișat este o simulare cu Mercedes-ul lui Tripon.
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-asicom-gradient px-6 py-7 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
          Ajutor instant
        </p>
        <h1 className="mt-1 font-display text-4xl font-light">Ai avut un accident?</h1>
        <p className="mt-2 max-w-prose text-sm text-white/85">
          Respiră. Suntem aici. În 3 pași simpli înregistrezi dauna, primești evaluarea inițială și
          brokerul te sună înapoi în maxim 15 minute.
        </p>
      </div>

      {/* Progress stepper */}
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Step n={1} title="Spune ce s-a întâmplat" state="done" />
        <Step n={2} title="Trimite pozele" state="active" />
        <Step n={3} title="Primește raportul" state="pending" />
      </ol>

      {/* Step 1 — completed summary */}
      <Section title="1. Spune ce s-a întâmplat" pill="✓ completat">
        <div className="grid gap-3 sm:grid-cols-3">
          <KV label="Data și ora" value="05.06.2026, 14:32" mono />
          <KV label="Loc" value="DN1, Alba Iulia → Sebeș, km 387" />
          <KV label="Vehicul" value="MERCEDES-BENZ B 180 CDI · AB-17-VIP" mono />
          <KV label="Tip eveniment" value="Coliziune ușoară din spate" />
          <KV label="Părți implicate" value="2 vehicule, fără victime" />
          <KV label="Poliție anunțată" value="Da · proces-verbal #1234/2026" mono />
        </div>
        <Hint>
          {'Descriere completă: „Coliziune la semafor în intersecția cu Str. Republicii. Mașina din spate (Dacia Logan, CJ-99-XYZ) nu a frânat la timp și mi-a lovit bara din spate. Fără răniți. Conducătorul celuilalt vehicul a recunoscut vina."'}
        </Hint>
      </Section>

      {/* Step 2 — uploaded photos with AI analysis */}
      <Section title="2. Pozele tale + analiza AI" pill="în curs">
        <p className="mb-4 text-xs text-ink/55">
          AI-ul a analizat 4 poze și a identificat zonele afectate. Estimările sunt orientative; raportul
          final îl primește service-ul partener.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <DamagePhoto
            label="Bară spate stânga"
            severity="moderată"
            cost="850 – 1.200 €"
            findings={[
              "Bară fisurată în zona dispozitivului de remorcare",
              "Suport bară crăpat — necesită înlocuire",
              "Lampa stop dreapta — zgârieri ușoare, fără spargere",
            ]}
            tone="warn"
          />
          <DamagePhoto
            label="Capota portbagaj"
            severity="ușoară"
            cost="200 – 350 €"
            findings={[
              "Lovitură superficială în zona inferioară",
              "Vopsea afectată pe ~12 cm²",
              "Tabla nu este deformată — poate fi doar redresată",
            ]}
            tone="info"
          />
          <DamagePhoto
            label="Eșapament"
            severity="minoră"
            cost="0 – 150 €"
            findings={[
              "Tobă spate aliniere ușor afectată",
              "Recomandare: verificare la service",
            ]}
            tone="info"
          />
          <DamagePhoto
            label="Cauciuc spate dreapta"
            severity="fără daună"
            cost="0 €"
            findings={["Presiune corectă", "Fără tăieturi sau deformații"]}
            tone="ok"
          />
        </div>
      </Section>

      {/* Step 3 — AI report */}
      <section className="overflow-hidden rounded-2xl border border-asicom/30 bg-gradient-to-br from-cloud via-white to-asicom/5">
        <header className="flex items-center justify-between border-b border-asicom/20 px-5 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-asicom-mid">
              Asistent AI
            </p>
            <h2 className="font-display text-xl text-ink">3. Raport tehnic preliminar</h2>
          </div>
          <span className="rounded-full bg-asicom/10 px-2.5 py-1 text-xs font-medium text-asicom">
            generat în 12s
          </span>
        </header>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Insight
            icon="💸"
            title="Cost estimat total"
            value="1.050 – 1.700 €"
            note="Sumă orientativă bazată pe poze și prețuri service partener Auto Service Alba."
          />
          <Insight
            icon="🛡️"
            title="Acoperire Casco"
            value="DA · franșiză 250 €"
            note="Polița ta Casco activă acoperă acest tip de daună. Ai franșiză 250 € la prima daună din an."
          />
          <Insight
            icon="📋"
            title="Vinovăție"
            value="Terță parte (RCA contraparte)"
            note="Procesul-verbal indică vinovăția conducătorului CJ-99-XYZ. Despăgubirea vine din RCA-ul lor; nu pierzi bonus."
          />
          <Insight
            icon="🛠️"
            title="Service recomandat"
            value="Auto Service Alba"
            note="Distanță 4,2 km · Slot disponibil mâine 09:30 sau azi 14:30. Lucrează cu Allianz pentru constatare."
          />
          <Insight
            icon="📅"
            title="Estimare livrare"
            value="3 – 5 zile lucrătoare"
            note="Mașină de schimb gratuită (acoperită prin Casco) — comand-o cu un click mai jos."
          />
          <Insight
            icon="⚖️"
            title="Următorii pași"
            value="Brokerul te sună în 15 min"
            note="Lucian Tripon a primit deja raportul. Te sună la numărul de pe fișa ta în max 15 minute."
          />
        </div>
      </section>

      {/* Action bar */}
      <section className="rounded-xl border border-line bg-white p-4">
        <h3 className="mb-3 font-display text-lg text-ink">Acum poți</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <ActionCard
            icon="🛠️"
            title="Programează la service"
            body="Auto Service Alba, slot 14:30 azi."
            cta="Rezervă"
          />
          <ActionCard
            icon="🚗"
            title="Cere mașină de schimb"
            body="Acoperit prin Casco · 3-5 zile · livrare la adresa ta."
            cta="Solicită"
          />
          <ActionCard
            icon="📞"
            title="Sună brokerul acum"
            body="Lucian Tripon · disponibil până 20:00."
            cta="0745 123 456"
          />
        </div>
      </section>

      {/* Reassurance footer */}
      <div className="rounded-xl border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">
        <span className="font-bold">✓ Cazul tău este înregistrat (#D-2026-0047).</span>{" "}
        Brokerul tău a fost notificat instant. Vei primi confirmare prin SMS și email în câteva
        minute. Nu trebuie să suni — te sună el.
      </div>

      <p className="px-1 text-center text-[11px] text-ink/35">
        Asicom · Daune asistate de AI · Acoperire 24/7 prin brokerul tău
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Step({ n, title, state }: { n: number; title: string; state: "done" | "active" | "pending" }) {
  const styles = {
    done: { circle: "bg-ok text-white", text: "text-ink", icon: "✓" },
    active: { circle: "bg-asicom text-white ring-4 ring-asicom/20", text: "text-asicom", icon: String(n) },
    pending: { circle: "bg-cloud text-ink/40", text: "text-ink/40", icon: String(n) },
  }[state];
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${styles.circle}`}>
        {styles.icon}
      </span>
      <span className={`text-sm font-medium ${styles.text}`}>{title}</span>
    </li>
  );
}

function Section({ title, pill, children }: { title: string; pill?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-3">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {pill ? <span className="text-xs font-medium text-ink/55">{pill}</span> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink/40">{label}</div>
      <div className={`mt-0.5 text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-md border border-line bg-cloud/50 px-3 py-2 text-xs italic text-ink/65">
      {children}
    </p>
  );
}

function DamagePhoto({
  label,
  severity,
  cost,
  findings,
  tone,
}: {
  label: string;
  severity: string;
  cost: string;
  findings: string[];
  tone: "ok" | "warn" | "fail" | "info";
}) {
  const toneCls = {
    ok: "border-ok/40 bg-ok/5 text-ok",
    warn: "border-warn/40 bg-warn/5 text-warn",
    fail: "border-fail/40 bg-fail/5 text-fail",
    info: "border-asicom/40 bg-asicom/5 text-asicom",
  }[tone];

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      {/* Placeholder photo — gray with overlay box marking damage area */}
      <div className="relative h-32 bg-gradient-to-br from-ink/20 to-ink/40">
        <div className="absolute inset-x-6 top-6 h-16 rounded border-2 border-amber-400/80 bg-amber-400/10" />
        <span className="absolute right-2 top-2 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          poza {label.toLowerCase().slice(0, 12)}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink">{label}</span>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${toneCls}`}>
            {severity}
          </span>
        </div>
        <div className="font-mono text-sm text-asicom">{cost}</div>
        <ul className="space-y-0.5 text-[11px] text-ink/60">
          {findings.map((f, i) => (
            <li key={i} className="flex gap-1">
              <span className="text-ink/40">·</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Insight({
  icon,
  title,
  value,
  note,
}: {
  icon: string;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-white/80 p-3.5">
      <div className="flex items-baseline gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-ink/50">{title}</span>
      </div>
      <div className="mt-1 font-mono text-lg text-asicom">{value}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink/60">{note}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  body,
  cta,
}: {
  icon: string;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-cloud/30 p-3.5">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-ink">{title}</span>
      </div>
      <p className="flex-1 text-xs text-ink/55">{body}</p>
      <button
        type="button"
        className="self-start rounded-md bg-asicom px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-asicom-mid"
      >
        {cta}
      </button>
    </div>
  );
}
