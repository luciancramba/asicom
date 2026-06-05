import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Preview-only page for post-emis customer automation. Everything here is HARD-CODED MOCKUP
 * — birthday touches, rovinietă reminders, ITP, policy renewals, license expiry, etc. The
 * intent is to show Tripon the direction beyond PR5 (issuance) toward a sustained
 * relationship-management layer, without committing to a backend yet. A prominent banner
 * makes the mock status explicit.
 */
export default function AutomatizariPreview() {
  return (
    <div className="flex flex-col gap-8">
      {/* Preview banner — never let the broker confuse mockup for live */}
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — nu este încă activă.</span>{" "}
        Datele de mai jos sunt exemplificative. Această pagină arată cum vor arăta automatizările
        pentru clienții emiși: aniversări, reînnoiri rovinietă, ITP, polițe, permise. Le activăm
        pe rând după ce sistemul de emitere este testat în producție.
      </div>

      {/* Title */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Preview</p>
          <h1 className="font-display text-3xl font-light text-ink">Automatizări</h1>
          <p className="mt-1 text-sm text-ink/60">
            {'Atingeri automate cu clienții emiși. „Documentul devine poliță" continuă cu „polița devine relație".'}
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-asicom transition-colors hover:bg-cloud"
        >
          ← Înapoi
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Clienți emiși" value="38" hint="cu poliță activă" />
        <StatCard label="Reminder-uri active" value="23" accent="text-asicom" />
        <StatCard label="Mesaje trimise (30 zile)" value="46" accent="text-ok" />
        <StatCard label="Acțiuni de atenție" value="2" accent="text-warn" hint="expiră în 7 zile" />
      </div>

      {/* Aniversări */}
      <Section
        title="Aniversări"
        subtitle="Mesaj cald, brand Asicom, programat automat în ziua de naștere a clientului. Email + SMS opțional."
      >
        <Table headers={["Client", "Naștere", "Mesaj programat", "Canal", "Status"]}>
          <Row cells={[
            "TRIPON LUCIAN-NICOLAE",
            "16.10",
            "16.10.2026 (azi în 132 zile)",
            "Email + SMS",
            <Badge key="t" tone="info">Programat</Badge>,
          ]} />
          <Row cells={[
            "SECHERNEȘ SIMION",
            "29.09",
            "29.09.2026 (azi în 116 zile)",
            "Email",
            <Badge key="s" tone="info">Programat</Badge>,
          ]} />
          <Row cells={[
            "CRAMBA LUCIAN-CORNEL",
            "26.03",
            "Trimis 26.03.2026",
            "Email + SMS",
            <Badge key="c" tone="ok">Livrat ✓</Badge>,
          ]} />
          <Row cells={[
            "FILIP-CHIȘ NORA-CARMEN",
            "09.11",
            "09.11.2026 (azi în 157 zile)",
            "Email",
            <Badge key="f" tone="info">Programat</Badge>,
          ]} />
        </Table>
        <Hint>
          {`Șablon implicit: „La mulți ani, [Prenume]! Asicom îți dorește un an plin pe drumuri sigure. Polița ta {tip} expiră pe {data} — sună-ne din timp dacă vrei să o reînnoim."`}
        </Hint>
      </Section>

      {/* Rovinietă */}
      <Section
        title="Rovinietă"
        subtitle="Reminder înainte de expirarea rovinietei, cu calcul automat al costului (12 luni vs 30 zile) și ofertă de cumpărare prin broker."
      >
        <Table headers={["Vehicul", "Client", "Expiră", "Cost (12 luni)", "Status"]}>
          <Row cells={[
            <Plate key="p1" text="AB-17-VIP" />,
            "TRIPON LUCIAN-NICOLAE",
            "15.07.2026 (în 40 zile)",
            <Mono key="c1">28 EUR</Mono>,
            <Badge key="b1" tone="warn">De reînnoit</Badge>,
          ]} />
          <Row cells={[
            <Plate key="p2" text="CJ-14-XMF" />,
            "FILIP-CHIȘ NORA-CARMEN",
            "03.08.2026 (în 59 zile)",
            <Mono key="c2">28 EUR</Mono>,
            <Badge key="b2" tone="info">Reminder programat</Badge>,
          ]} />
          <Row cells={[
            <Plate key="p3" text="AB-19-MXL" />,
            "CRAMBA LUCIAN-CORNEL",
            "12.09.2026 (în 99 zile)",
            <Mono key="c3">28 EUR</Mono>,
            <Badge key="b3" tone="info">OK</Badge>,
          ]} />
          <Row cells={[
            <Plate key="p4" text="CJ-25-VOU" />,
            "FILIP-CHIȘ NORA-CARMEN",
            "13.03.2026",
            <Mono key="c4">96 EUR</Mono>,
            <Badge key="b4" tone="fail">Expirată — anulată ITP</Badge>,
          ]} />
        </Table>
      </Section>

      {/* ITP */}
      <Section
        title="ITP (Inspecția Tehnică Periodică)"
        subtitle="Termen de inspecție urmărit din data primei înmatriculări + datele eliberate de RAR. Reminder cu sugestie de service partener."
      >
        <Table headers={["Vehicul", "Client", "Expiră", "Service propus", "Status"]}>
          <Row cells={[
            <Plate key="p1" text="AB-17-VIP" />,
            "TRIPON LUCIAN-NICOLAE",
            "22.07.2026 (în 47 zile)",
            "AUTO SERVICE ALBA",
            <Badge key="b" tone="warn">Programează</Badge>,
          ]} />
          <Row cells={[
            <Plate key="p2" text="AB-19-MXL" />,
            "CRAMBA LUCIAN-CORNEL",
            "10.08.2026 (în 66 zile)",
            "AUTO CLUJ NAPOCA",
            <Badge key="b2" tone="info">Reminder programat</Badge>,
          ]} />
          <Row cells={[
            <Plate key="p3" text="CJ-14-XMF" />,
            "FILIP-CHIȘ NORA-CARMEN",
            "05.01.2027 (în 214 zile)",
            "—",
            <Badge key="b3" tone="info">OK</Badge>,
          ]} />
        </Table>
      </Section>

      {/* Polițe — reînnoiri */}
      <Section
        title="Polițe — reînnoiri"
        subtitle="RCA și Casco urmărite din registru. Comparator de cotații automat la 30 zile înainte de expirare; ofertă propusă din 3 asigurători."
      >
        <Table headers={["Tip", "Client", "Vehicul", "Expiră", "Status"]}>
          <Row cells={[
            <Badge key="t1" tone="brand">RCA</Badge>,
            "TRIPON LUCIAN-NICOLAE",
            <Plate key="p1" text="AB-17-VIP" />,
            "18.07.2026 (în 43 zile)",
            <Badge key="b1" tone="warn">Cotații pregătite (3)</Badge>,
          ]} />
          <Row cells={[
            <Badge key="t2" tone="brand">Casco</Badge>,
            "SECHERNEȘ SIMION",
            <Plate key="p2" text="CJ-14-XMF" />,
            "02.09.2026 (în 89 zile)",
            <Badge key="b2" tone="info">Activă</Badge>,
          ]} />
          <Row cells={[
            <Badge key="t3" tone="brand">RCA</Badge>,
            "CRAMBA LUCIAN-CORNEL",
            <Plate key="p3" text="AB-19-MXL" />,
            "29.10.2026 (în 146 zile)",
            <Badge key="b3" tone="info">Activă</Badge>,
          ]} />
          <Row cells={[
            <Badge key="t4" tone="brand">PAD</Badge>,
            "TRIPON LUCIAN-NICOLAE",
            "—",
            "12.04.2027 (în 311 zile)",
            <Badge key="b4" tone="info">Activă</Badge>,
          ]} />
        </Table>
        <Hint>
          Asistentul de reînnoire compară 3 oferte (Allianz, Groupama, Asirom) și propune
          implicit cea mai bună acoperire pentru preț. Broker confirmă din 1 click.
        </Hint>
      </Section>

      {/* Permis */}
      <Section
        title="Permis de conducere — expirare"
        subtitle="Permisul are valabilitate 10 ani. Reminder la 6 luni înainte de expirare cu pași pentru reînnoire la Poliție."
      >
        <Table headers={["Client", "Categorii", "Expiră", "Status"]}>
          <Row cells={[
            "TRIPON LUCIAN-NICOLAE",
            "AM B1 B C1 C BE C1E CE",
            "03.08.2031 (peste 5 ani)",
            <Badge key="b" tone="ok">OK</Badge>,
          ]} />
          <Row cells={[
            "SECHERNEȘ SIMION",
            "B",
            "21.05.2027 (în 350 zile)",
            <Badge key="b2" tone="info">Reminder activ</Badge>,
          ]} />
          <Row cells={[
            "CRAMBA LUCIAN-CORNEL",
            "B B1",
            "14.11.2026 (în 162 zile)",
            <Badge key="b3" tone="warn">Reminder programat</Badge>,
          ]} />
        </Table>
      </Section>

      {/* Future / "în pregătire" */}
      <Section
        title="În pregătire"
        subtitle="Idei pentru următoarele iterații, după ce primele patru module sunt activate."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          <FutureItem
            icon="🚗"
            title="Daune — follow-up post-eveniment"
            body="După o daună RCA, mesaj automat la 7 / 14 / 30 zile cu pași și documente."
          />
          <FutureItem
            icon="👨‍👩‍👧"
            title="Cross-sell familie"
            body="Propunere automată pentru polițe ale altor membri (soț/soție, copii) pe baza CNP-urilor cunoscute."
          />
          <FutureItem
            icon="📅"
            title="Aniversare client"
            body={'„1 an cu Asicom" — mesaj de mulțumire la aniversarea primei polițe emise.'}
          />
          <FutureItem
            icon="📲"
            title="WhatsApp Business"
            body="Toate comunicările (reminder, ofertă, confirmare) prin canalul preferat al clientului."
          />
          <FutureItem
            icon="🛣️"
            title="Vinietă străine"
            body="Italia, Austria, Ungaria — propus la planificarea unei călătorii."
          />
          <FutureItem
            icon="🧾"
            title="Bonus-malus tracker"
            body="Urmărire clase B-M pentru fiecare client + estimare cost RCA în următorul an."
          />
        </ul>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presentational helpers — kept local to this preview page (won't reuse).
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
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <header className="border-b border-line bg-cloud px-4 py-3">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-ink/55">{subtitle}</p> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {headers.map((h) => (
              <th key={h} className="px-2 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink/40">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Row({ cells }: { cells: React.ReactNode[] }) {
  return (
    <tr className="border-b border-line/50 last:border-b-0 hover:bg-cloud/40">
      {cells.map((c, i) => (
        <td key={i} className="px-2 py-2.5 align-middle text-ink/85">
          {c}
        </td>
      ))}
    </tr>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "fail" | "info" | "brand";
  children: React.ReactNode;
}) {
  const cls = {
    ok: "bg-ok/10 text-ok",
    warn: "bg-warn/10 text-warn",
    fail: "bg-fail/10 text-fail",
    info: "bg-asicom/10 text-asicom",
    brand: "bg-asicom text-white",
  }[tone];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

function Plate({ text }: { text: string }) {
  return (
    <span className="rounded-md bg-cloud px-2 py-0.5 font-mono text-xs font-medium text-ink">
      {text}
    </span>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-sm">{children}</span>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-md border border-line bg-cloud/50 px-3 py-2 text-xs italic text-ink/55">
      {children}
    </p>
  );
}

function FutureItem({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3 rounded-lg border border-line bg-cloud/40 px-3 py-2.5">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="mt-0.5 text-xs text-ink/55">{body}</div>
      </div>
    </li>
  );
}
