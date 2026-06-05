import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Preview-only customer-perspective page. Shows what a client would see when logging into the
 * Asicom portal at asicom.cramba.ro/portal — their personal data, vehicle data, expiry timeline,
 * active policies, and an AI-driven dashboard inferred from the extracted CI/talon/permis data.
 *
 * Hardcoded with Tripon's actual data so the demo feels real. A prominent banner makes the
 * mockup status explicit. Frame is: "this is what your client sees, not what you the broker see."
 */
export default function PortalClientPreview() {
  return (
    <div className="flex flex-col gap-8">
      {/* Preview banner */}
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — vederea clientului.</span> Așa va arăta
        portalul pentru clienții emiși: după ce primesc polița, primesc și un cont la
        asicom.cramba.ro/portal cu toate datele lor, expirările documentelor și un panou AI
        pentru mașina lor. Datele sunt cele extrase real din actele lui Tripon — demonstrăm cu
        un client real cum arată experiența.
      </div>

      {/* Welcome header — personalized */}
      <div className="rounded-2xl bg-asicom-gradient px-6 py-5 text-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
              Portalul tău Asicom
            </p>
            <h1 className="mt-1 font-display text-3xl font-light">Bună, Lucian-Nicolae</h1>
            <p className="mt-1 text-sm text-white/80">
              Documentele și mașina ta, gata pregătite. Brokerul tău: Lucian (Tripon · ASICOM Alba).
            </p>
          </div>
          <Link
            href="/automatizari"
            className="shrink-0 rounded-lg border border-white/40 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            ← Vezi automatizări
          </Link>
        </div>
      </div>

      {/* Quick stats / status snapshot */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Polițe active" value="2" hint="RCA + PAD" accent="text-ok" />
        <StatCard label="Documente valabile" value="4/4" hint="toate OK" accent="text-ok" />
        <StatCard label="Expiră în 60 zile" value="2" hint="rovinietă · ITP" accent="text-warn" />
        <StatCard label="Cost mașină / an" value="8,420 €" hint="estimat AI" accent="text-asicom" />
      </div>

      {/* AI dashboard — the magical card */}
      <section className="overflow-hidden rounded-2xl border border-asicom/20 bg-gradient-to-br from-cloud via-white to-asicom/5">
        <header className="flex items-center justify-between border-b border-asicom/20 px-5 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-asicom-mid">
              Asistent AI
            </p>
            <h2 className="font-display text-xl text-ink">Mașina ta — rezumat inteligent</h2>
          </div>
          <span className="rounded-full bg-asicom/10 px-2.5 py-1 text-xs font-medium text-asicom">
            actualizat azi
          </span>
        </header>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Insight
            icon="💰"
            title="Valoare estimată"
            value="5.200 – 7.800 €"
            note="Mercedes-Benz B 180 CDI 2010, 80 kW, motorină — preț median pe piață, ajustat pentru județul Alba."
          />
          <Insight
            icon="📊"
            title="Cost total anual estimat"
            value="8.420 €"
            note="RCA 280 € + PAD 32 € + Casco 1.200 € + ITP 200 € + rovinietă 28 € + combustibil 5.800 € + service mediu 880 €."
          />
          <Insight
            icon="🌱"
            title="Norma de poluare"
            value="Euro 5"
            note="Diesel 2010 — încadrare Euro 5. Atenție: zona STR-2025 București (centru) va restricționa Euro 5 începând cu 2027."
          />
          <Insight
            icon="🛣️"
            title="Bonus-malus estimat"
            value="Clasa B6"
            note="Conform istoricului tău fără daună (4 ani), beneficiezi de un discount de ~25% la reînnoirea RCA."
          />
          <Insight
            icon="🔧"
            title="Următoarea revizie majoră"
            value="≈ Q1 2027"
            note="Estimat la 220.000 km. Recomandăm verificare filtru particule (DPF) la 200.000 km — tipic pentru OM640."
          />
          <Insight
            icon="⛽"
            title="Optimizare combustibil"
            value="−18% potențial"
            note="Conducere conservativă + presiune corectă cauciucuri = -1.000 € pe an. Conversia GPL nu se recomandă pentru CDI."
          />
        </div>
      </section>

      {/* Two-column: vehicle + personal */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Mașina mea" pill="AB-17-VIP">
          <DataRow label="Marca / model" value="MERCEDES-BENZ B 180 CDI" mono />
          <DataRow label="An fabricație" value="2010" mono />
          <DataRow label="VIN" value="WDD2452071J648520" mono small />
          <DataRow label="Combustibil" value="Motorină" />
          <DataRow label="Cilindree / putere" value="1.991 cm³ · 80 kW (109 CP)" />
          <DataRow label="Locuri" value="5" />
          <DataRow label="Categorie" value="Autoturism M1" />
          <DataRow label="Prima înmatriculare" value="19.10.2010" mono />
        </Section>

        <Section title="Datele mele" pill="verificate">
          <DataRow label="Nume" value="TRIPON LUCIAN-NICOLAE" />
          <DataRow label="CNP" value="1711016011090" mono />
          <DataRow label="Data nașterii" value="16.10.1971 (54 ani)" />
          <DataRow label="Sex" value="M" />
          <DataRow label="Cetățenie" value="Română" />
          <DataRow label="Adresă" value="Alba Iulia, Str. Barbu Lăutaru nr. 23, jud. Alba" />
          <DataRow label="Telefon" value="—" hint="de completat" />
          <DataRow label="Email" value="—" hint="de completat" />
        </Section>
      </div>

      {/* Documents & expiration timeline */}
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <header className="border-b border-line bg-cloud px-4 py-3">
          <h2 className="font-display text-lg text-ink">Documente și expirări</h2>
          <p className="mt-0.5 text-xs text-ink/55">
            Toate documentele și polițele tale, sortate după prima dată care expiră.
          </p>
        </header>
        <ul className="divide-y divide-line">
          <ExpiryRow
            icon="🛣️"
            title="Rovinietă AB-17-VIP"
            expires="15.07.2026"
            daysLeft={40}
            action="Reînnoiește (28 €)"
          />
          <ExpiryRow
            icon="🔧"
            title="ITP — AB-17-VIP"
            expires="22.07.2026"
            daysLeft={47}
            action="Programează la service"
          />
          <ExpiryRow
            icon="📄"
            title="Polița RCA — Allianz Țiriac"
            expires="18.07.2026"
            daysLeft={43}
            action="Cere ofertă reînnoire"
          />
          <ExpiryRow
            icon="🛡️"
            title="Polița PAD"
            expires="12.04.2027"
            daysLeft={311}
            action="Activă"
            tone="ok"
          />
          <ExpiryRow
            icon="🪪"
            title="Buletin — AX 878144"
            expires="03.08.2031"
            daysLeft={1885}
            action="Valabil"
            tone="ok"
          />
          <ExpiryRow
            icon="🚗"
            title="Permis de conducere"
            expires="03.08.2031"
            daysLeft={1885}
            action="Valabil"
            tone="ok"
          />
        </ul>
      </section>

      {/* Active policies */}
      <Section title="Polițe active" pill="2">
        <PolicyCard
          type="RCA"
          insurer="ALLIANZ TIRIAC"
          number="RO/A/12345/2025"
          plate="AB-17-VIP"
          validFrom="18.07.2025"
          validTo="18.07.2026"
          premium="280 €"
          status="active"
        />
        <PolicyCard
          type="PAD"
          insurer="PAID Asigurări"
          number="PAD-2026-00128844"
          plate="—"
          validFrom="12.04.2026"
          validTo="12.04.2027"
          premium="32 €"
          status="active"
        />
      </Section>

      {/* Quick actions */}
      <Section title="Acțiuni rapide" subtitle="Ce poți face acum, fără să suni brokerul.">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <ActionCard
            icon="🛣️"
            title="Cumpără rovinietă"
            body="28 € pentru 12 luni — emisă instant pe AB-17-VIP."
            cta="Cumpără acum"
          />
          <ActionCard
            icon="🔧"
            title="Programează ITP"
            body="Auto Service Alba, str. Lalelelor 12 — disponibil 8–17."
            cta="Vezi sloturi"
          />
          <ActionCard
            icon="📑"
            title="Cere ofertă RCA"
            body="3 asigurători comparați automat. Ofertă în 2 minute."
            cta="Cere cotații"
          />
          <ActionCard
            icon="🆘"
            title="Anunță o daună"
            body="Pași simpli, încărcare poze, brokerul te contactează în 15 min."
            cta="Începe procedura"
          />
          <ActionCard
            icon="📞"
            title="Contactează brokerul"
            body="Lucian Tripon · 0745 123 456 · lucian@asicom.ro"
            cta="Sună / scrie"
          />
          <ActionCard
            icon="📥"
            title="Descarcă documente"
            body="Polițele tale în PDF, gata de printat."
            cta="Descarcă (.zip)"
          />
        </div>
      </Section>

      {/* History */}
      <Section title="Istoric recent" subtitle="Tot ce s-a întâmplat în contul tău în ultimele luni.">
        <ul className="flex flex-col gap-2">
          <HistoryRow
            date="22.05.2026"
            text="Brokerul Lucian a emis polița PAD-2026-00128844 (PAID Asigurări, 32 €)."
          />
          <HistoryRow
            date="18.07.2025"
            text="RCA reînnoit la ALLIANZ ȚIRIAC (280 €, valabilă până 18.07.2026)."
          />
          <HistoryRow
            date="22.07.2025"
            text="ITP trecut la Auto Service Alba. Următoarea inspecție: 22.07.2026."
          />
          <HistoryRow
            date="14.04.2025"
            text="Rovinietă reînnoită pentru 12 luni (28 €)."
          />
          <HistoryRow
            date="03.08.2024"
            text="Buletin reînnoit (serie AX, număr 878144) — valabil până 03.08.2031."
          />
        </ul>
      </Section>

      <p className="px-1 text-center text-[11px] text-ink/35">
        Asicom · Cramba App Studio · Datele tale rămân private. Doar tu și brokerul vostru le veți vedea.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presentational helpers — local to this preview page.
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  hint,
  accent = "text-ink",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</div>
      <div className={`mt-1 font-mono text-2xl ${accent}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-ink/40">{hint}</div> : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  pill,
  children,
}: {
  title: string;
  subtitle?: string;
  pill?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-3">
        <div>
          <h2 className="font-display text-lg text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-ink/55">{subtitle}</p> : null}
        </div>
        {pill ? (
          <span className="font-mono text-xs text-ink/50">{pill}</span>
        ) : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DataRow({
  label,
  value,
  mono,
  small,
  hint,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/40 py-2 last:border-b-0">
      <span className="shrink-0 text-xs text-ink/55">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono" : ""} ${small ? "text-xs" : "text-sm"} text-ink`}
      >
        {value}
        {hint ? <span className="ml-2 text-[10px] text-ink/40">({hint})</span> : null}
      </span>
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

function ExpiryRow({
  icon,
  title,
  expires,
  daysLeft,
  action,
  tone = "warn",
}: {
  icon: string;
  title: string;
  expires: string;
  daysLeft: number;
  action: string;
  tone?: "ok" | "warn" | "fail";
}) {
  const toneCls =
    tone === "ok"
      ? "border-ok/40 bg-ok/5 text-ok"
      : tone === "fail"
        ? "border-fail/40 bg-fail/5 text-fail"
        : "border-warn/40 bg-warn/5 text-warn";

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink/55">
          Expiră {expires} · {daysLeft > 0 ? `în ${daysLeft} zile` : "azi"}
        </div>
      </div>
      <button
        type="button"
        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${toneCls}`}
      >
        {action}
      </button>
    </li>
  );
}

function PolicyCard({
  type,
  insurer,
  number,
  plate,
  validFrom,
  validTo,
  premium,
  status,
}: {
  type: string;
  insurer: string;
  number: string;
  plate: string;
  validFrom: string;
  validTo: string;
  premium: string;
  status: "active" | "expired";
}) {
  return (
    <div className="mb-3 last:mb-0 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-asicom px-2.5 py-0.5 text-xs font-bold text-white">
            {type}
          </span>
          <span className="text-sm font-medium text-ink">{insurer}</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "active" ? "bg-ok/10 text-ok" : "bg-fail/10 text-fail"
          }`}
        >
          {status === "active" ? "✓ Activă" : "✗ Expirată"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <KV label="Număr" value={number} mono />
        <KV label="Vehicul" value={plate} mono />
        <KV label="Valabilă" value={`${validFrom} → ${validTo}`} />
        <KV label="Primă" value={premium} mono />
      </div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink/40">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} text-ink`}>{value}</div>
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
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-white p-3.5">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-ink">{title}</span>
      </div>
      <p className="flex-1 text-xs text-ink/55">{body}</p>
      <button
        type="button"
        className="self-start rounded-md border border-asicom px-2.5 py-1 text-xs font-medium text-asicom transition-colors hover:bg-asicom hover:text-white"
      >
        {cta}
      </button>
    </div>
  );
}

function HistoryRow({ date, text }: { date: string; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-md border border-line/60 bg-cloud/40 px-3 py-2 text-xs">
      <span className="shrink-0 font-mono text-ink/50">{date}</span>
      <span className="flex-1 text-ink/75">{text}</span>
    </li>
  );
}
