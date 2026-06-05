export const dynamic = "force-dynamic";

/**
 * Preview-only Cramba Admin — what Lucian Cramba (the platform owner) sees as Asicom scales to
 * multiple brokers. Multi-tenant SaaS dashboard with revenue, broker stats, system health, and a
 * pipeline of brokers under onboarding. Hardcoded vision; meant to communicate the SaaS upside.
 */
export default function CrambaAdminPreview() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — Cramba App Studio admin.</span>{" "}
        Așa arată Asicom văzut din perspectiva platformei: mai mulți brokeri, MRR, sănătatea
        sistemului. Vizionează scala — Asicom ca SaaS pentru rețeaua de 50+ brokeri ASICOM,
        Asigest, OmniCredit etc.
      </div>

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">
          Cramba App Studio · Admin
        </p>
        <h1 className="font-display text-3xl font-light text-ink">Tabloul de bord platformă</h1>
        <p className="mt-1 text-sm text-ink/60">
          Sănătate, venit, brokeri activi, ingestie AI. Iunie 2026.
        </p>
      </div>

      {/* Top-line metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="MRR" value="2.480 €" hint="+18% față de mai" accent="text-ok" />
        <Stat label="Brokeri activi" value="8" hint="2 înrolare săptămâna asta" accent="text-asicom" />
        <Stat label="Polițe emise / lună" value="1.247" hint="~155 per broker" accent="text-asicom" />
        <Stat label="AI extraction success" value="94.7%" hint="prag SLA 90%" accent="text-ok" />
      </div>

      {/* Revenue chart placeholder */}
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <header className="border-b border-line bg-cloud px-4 py-3">
          <h2 className="font-display text-lg text-ink">Venit lunar (ultimele 6 luni)</h2>
          <p className="mt-0.5 text-xs text-ink/55">
            29 € / broker lunar — toți pe planul standard. Plan enterprise (49 €) lansare Q3.
          </p>
        </header>
        <div className="p-4">
          <BarChart />
        </div>
      </section>

      {/* Broker list */}
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-3">
          <div>
            <h2 className="font-display text-lg text-ink">Brokeri</h2>
            <p className="mt-0.5 text-xs text-ink/55">
              Volum, activare, retenție. Sortat după ARR.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-asicom px-3 py-1 text-xs font-medium text-asicom hover:bg-asicom hover:text-white"
          >
            + Invită broker
          </button>
        </header>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Broker", "Companie", "Locație", "Plan", "Polițe lună", "ARR", "Stare"].map((h) => (
                <th key={h} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <BrokerRow
              name="Lucian Tripon"
              company="ASICOM"
              location="Alba Iulia"
              plan="Standard"
              policies={139}
              arr="348 €"
              status="active"
              tag="alpha"
            />
            <BrokerRow
              name="Mihai Popescu"
              company="Asigest"
              location="București"
              plan="Standard"
              policies={211}
              arr="348 €"
              status="active"
            />
            <BrokerRow
              name="Andreea Iliescu"
              company="OmniCredit"
              location="Cluj-Napoca"
              plan="Standard"
              policies={184}
              arr="348 €"
              status="active"
            />
            <BrokerRow
              name="Dorel Mihăilescu"
              company="ASICOM"
              location="Sibiu"
              plan="Standard"
              policies={167}
              arr="348 €"
              status="active"
            />
            <BrokerRow
              name="Roxana Dumitrescu"
              company="Asigest"
              location="Iași"
              plan="Standard"
              policies={142}
              arr="348 €"
              status="active"
            />
            <BrokerRow
              name="Bogdan Stoica"
              company="EUROINS-broker"
              location="Constanța"
              plan="Standard"
              policies={128}
              arr="348 €"
              status="active"
            />
            <BrokerRow
              name="Maria Costache"
              company="ASICOM"
              location="Brașov"
              plan="Standard"
              policies={156}
              arr="348 €"
              status="active"
            />
            <BrokerRow
              name="Alexandru Munteanu"
              company="Asigest"
              location="Timișoara"
              plan="Standard"
              policies={120}
              arr="348 €"
              status="trial"
              tag="ziua 11/14"
            />
          </tbody>
        </table>
      </section>

      {/* Two-column: pipeline + system health */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-line bg-white">
          <header className="border-b border-line bg-cloud px-4 py-3">
            <h2 className="font-display text-lg text-ink">Pipeline brokeri</h2>
            <p className="mt-0.5 text-xs text-ink/55">
              Discuții și demo-uri planificate. Conversie aprox. 65% după demo.
            </p>
          </header>
          <ul className="divide-y divide-line">
            <PipelineRow
              name="ASICOM Oradea"
              stage="Demo programat"
              date="08.06.2026, 10:00"
              tone="info"
            />
            <PipelineRow
              name="Asigest Pitești"
              stage="Trimitere ofertă"
              date="cu Tripon ca referință"
              tone="info"
            />
            <PipelineRow
              name="UNIQA-broker Galați"
              stage="Negociere"
              date="3 sedii, ofertă enterprise"
              tone="warn"
            />
            <PipelineRow
              name="OmniCredit Suceava"
              stage="Onboarding"
              date="setări active, primul dosar mâine"
              tone="ok"
            />
            <PipelineRow
              name="ASICOM Botoșani"
              stage="Demo solicitat"
              date="aștept confirmare"
              tone="info"
            />
          </ul>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-white">
          <header className="border-b border-line bg-cloud px-4 py-3">
            <h2 className="font-display text-lg text-ink">Sănătate sistem</h2>
            <p className="mt-0.5 text-xs text-ink/55">
              Uptime, latențe AI, alerte. Ultimele 30 zile.
            </p>
          </header>
          <ul className="divide-y divide-line">
            <HealthRow label="Uptime API" value="99.94%" tone="ok" hint="SLA 99.5%" />
            <HealthRow label="Uptime portal client" value="100.00%" tone="ok" />
            <HealthRow
              label="Latență extragere foto (p50)"
              value="6.2s"
              tone="ok"
              hint="target < 10s"
            />
            <HealthRow
              label="Latență extragere foto (p99)"
              value="28.1s"
              tone="warn"
              hint="ușor sub țintă (30s)"
            />
            <HealthRow
              label="AI extraction success"
              value="94.7%"
              tone="ok"
              hint="prag 90%"
            />
            <HealthRow
              label="Cheltuieli Anthropic (luna)"
              value="186.20 €"
              tone="info"
              hint="≈ 7.5% din MRR"
            />
            <HealthRow
              label="Storage uploads (total)"
              value="14.8 GB"
              tone="info"
              hint="retenție 14 zile post-Emis"
            />
            <HealthRow
              label="Alerte deschise"
              value="0"
              tone="ok"
            />
          </ul>
        </section>
      </div>

      {/* Insurer integrations */}
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <header className="border-b border-line bg-cloud px-4 py-3">
          <h2 className="font-display text-lg text-ink">Integrări asigurători</h2>
          <p className="mt-0.5 text-xs text-ink/55">
            Asicom emite la 3 asigurători. Adăugare integrări noi via API parteneriat ASF.
          </p>
        </header>
        <div className="grid gap-3 p-4 sm:grid-cols-4">
          <InsurerCard name="Allianz Țiriac" status="live" policies="492" />
          <InsurerCard name="Asirom Vienna" status="live" policies="384" />
          <InsurerCard name="Groupama" status="live" policies="241" />
          <InsurerCard name="Omniasig" status="testare" policies="130 (sandbox)" />
        </div>
      </section>

      <p className="px-1 text-center text-[11px] text-ink/35">
        Cramba App Studio · cramba.ro · Asicom Platform v1.0
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Stat({
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

function BarChart() {
  const data = [
    { month: "ian", value: 870 },
    { month: "feb", value: 1080 },
    { month: "mar", value: 1450 },
    { month: "apr", value: 1820 },
    { month: "mai", value: 2100 },
    { month: "iun", value: 2480 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-mono text-ink/55">{d.value}€</span>
          <div
            className="w-full rounded-t bg-asicom-gradient transition-all hover:opacity-80"
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`${d.value}€`}
          />
          <span className="text-[10px] uppercase tracking-wide text-ink/50">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function BrokerRow({
  name,
  company,
  location,
  plan,
  policies,
  arr,
  status,
  tag,
}: {
  name: string;
  company: string;
  location: string;
  plan: string;
  policies: number;
  arr: string;
  status: "active" | "trial" | "paused";
  tag?: string;
}) {
  const statusCls = {
    active: "bg-ok/10 text-ok",
    trial: "bg-warn/10 text-warn",
    paused: "bg-fail/10 text-fail",
  }[status];
  return (
    <tr className="hover:bg-cloud/40">
      <td className="px-4 py-2 text-sm text-ink">
        {name}
        {tag ? <span className="ml-2 text-[10px] font-medium text-asicom">· {tag}</span> : null}
      </td>
      <td className="px-4 py-2 text-xs text-ink/70">{company}</td>
      <td className="px-4 py-2 text-xs text-ink/70">{location}</td>
      <td className="px-4 py-2 text-xs text-ink/70">{plan}</td>
      <td className="px-4 py-2 text-right font-mono text-xs text-ink">{policies}</td>
      <td className="px-4 py-2 text-right font-mono text-xs text-ink">{arr}</td>
      <td className="px-4 py-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusCls}`}>
          {status === "active" ? "✓ Activ" : status === "trial" ? "Trial" : "Pauză"}
        </span>
      </td>
    </tr>
  );
}

function PipelineRow({
  name,
  stage,
  date,
  tone,
}: {
  name: string;
  stage: string;
  date: string;
  tone: "ok" | "warn" | "info";
}) {
  const cls = {
    ok: "border-l-ok",
    warn: "border-l-warn",
    info: "border-l-asicom",
  }[tone];
  return (
    <li className={`border-l-4 px-4 py-2.5 ${cls}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{name}</span>
        <span className="text-[11px] text-ink/45">{stage}</span>
      </div>
      <div className="mt-0.5 text-xs text-ink/55">{date}</div>
    </li>
  );
}

function HealthRow({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "fail" | "info";
  hint?: string;
}) {
  const dot = {
    ok: "bg-ok",
    warn: "bg-warn",
    fail: "bg-fail",
    info: "bg-asicom",
  }[tone];
  return (
    <li className="flex items-center justify-between px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-ink/75">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-mono text-ink">{value}</span>
        {hint ? <span className="ml-2 text-[10px] text-ink/40">({hint})</span> : null}
      </div>
    </li>
  );
}

function InsurerCard({
  name,
  status,
  policies,
}: {
  name: string;
  status: "live" | "testare";
  policies: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-cloud/30 p-3">
      <div className="text-sm font-medium text-ink">{name}</div>
      <div
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
          status === "live" ? "bg-ok/10 text-ok" : "bg-warn/10 text-warn"
        }`}
      >
        {status === "live" ? "✓ Live" : "🧪 Testare"}
      </div>
      <div className="mt-2 text-[11px] text-ink/55">{policies} polițe</div>
    </div>
  );
}
