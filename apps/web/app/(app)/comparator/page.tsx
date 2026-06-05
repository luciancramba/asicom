export const dynamic = "force-dynamic";

/**
 * Preview-only comparator de oferte RCA — AI-driven decision tool. Shows three quotes side by
 * side for Tripon's Mercedes, ranked by an AI score that explains its rationale based on the
 * client's profile (age, county, bonus-malus, history). Hardcoded mock.
 */
export default function ComparatorPreview() {
  const offers: Offer[] = [
    {
      insurer: "ALLIANZ ȚIRIAC",
      brand: "from-blue-700 to-blue-500",
      premium: 280,
      premiumLabel: "280 €",
      monthlyOpt: "24 €/lună (12 rate)",
      coverage: "Standard",
      score: 84,
      best: false,
      pros: ["Furnizorul tău anterior", "Constatare amiabilă rapidă", "Rețea service extinsă"],
      cons: ["Asistență rutieră 24/7 cu cost suplimentar", "Despăgubire tipic în 15-21 zile"],
      perks: ["Constatare la fața locului", "Asistență rutieră opțională (+15 €)"],
    },
    {
      insurer: "GROUPAMA",
      brand: "from-emerald-700 to-emerald-500",
      premium: 305,
      premiumLabel: "305 €",
      monthlyOpt: "26 €/lună (12 rate)",
      coverage: "Standard + ✓",
      score: 78,
      best: false,
      pros: ["Despăgubire rapidă", "Aplicație mobilă bine evaluată", "Suport telefonic 24/7"],
      cons: ["Cel mai scump dintre cele 3", "Mai puține service partenere în Alba"],
      perks: ["Asistență rutieră inclusă", "Mașină de schimb la daune > 1000 €"],
    },
    {
      insurer: "ASIROM VIENNA",
      brand: "from-asicom to-asicom-mid",
      premium: 270,
      premiumLabel: "270 €",
      monthlyOpt: "23 €/lună (12 rate)",
      coverage: "Standard + bonus",
      score: 92,
      best: true,
      pros: [
        "Cel mai bun preț",
        "Bonus loialitate 5% după 2 ani fără daună",
        "Constatare digitală (poze pe app)",
        "Asistență rutieră inclusă",
      ],
      cons: ["Brand mai puțin cunoscut local", "Rețea service medie în Alba"],
      perks: ["Asistență rutieră inclusă", "Constatare digitală", "Plată în 12 rate fără dobândă"],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — comparator RCA.</span>{" "}
        AI-ul compară 3 cotații pe baza profilului clientului (vârstă, județ, bonus-malus,
        istoric) și recomandă varianta optimă cu argument. Cifrele sunt simulare bazate pe
        Mercedes-ul lui Tripon.
      </div>

      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">
          Asistent decizie
        </p>
        <h1 className="font-display text-3xl font-light text-ink">Comparator RCA</h1>
        <p className="mt-1 text-sm text-ink/60">
          Pentru AB-17-VIP, valabilitate 1 an de la 19.07.2026.
        </p>
      </div>

      {/* Driver context */}
      <section className="rounded-xl border border-line bg-white p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-asicom">
          Profil pentru calcul
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <KV label="Vehicul" value="MERCEDES B 180 CDI" />
          <KV label="An / Cilindree" value="2010 · 1991 cm³" />
          <KV label="Județ" value="Alba" />
          <KV label="Permis" value="12 ani · cat. B+C" />
          <KV label="Bonus-malus" value="Clasa B6 (-25%)" />
          <KV label="Daune ultim an" value="0" />
          <KV label="Vârstă conducător" value="54" />
          <KV label="Norme poluare" value="Euro 5" />
        </div>
      </section>

      {/* The 3 offers */}
      <div className="grid gap-4 sm:grid-cols-3">
        {offers.map((o) => (
          <OfferCard key={o.insurer} o={o} />
        ))}
      </div>

      {/* AI rationale */}
      <section className="overflow-hidden rounded-2xl border border-asicom/30 bg-gradient-to-br from-cloud via-white to-asicom/5">
        <header className="flex items-center justify-between border-b border-asicom/20 px-5 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-asicom-mid">
              Asistent AI · recomandare
            </p>
            <h2 className="font-display text-xl text-ink">De ce Asirom Vienna?</h2>
          </div>
          <span className="rounded-full bg-asicom/10 px-2.5 py-1 text-xs font-medium text-asicom">
            scor 92/100
          </span>
        </header>
        <div className="space-y-2.5 p-5 text-sm text-ink/75">
          <p>
            <strong className="text-ink">Combinația preț + acoperire este cea mai bună pentru profilul tău.</strong>{" "}
            La 270 € primești asistență rutieră inclusă (15 € economisiți față de Allianz) și
            constatare digitală — pentru o daună mică, te scutește de drumul la sediu.
          </p>
          <p>
            <strong className="text-ink">Bonus-malus B6 + 0 daune ultim an</strong> te califică pentru
            bonusul Asirom de loialitate (5% al doilea an). Estimat economisești 27 € la
            reînnoirea din 2027.
          </p>
          <p>
            <strong className="text-ink">Rețea service medie în Alba</strong> este singura
            considerație — dar 4 dintre cele 6 service-uri pe care le-ai folosit anterior lucrează
            cu Asirom. Probabilitate de a întâmpina o frecare: scăzută.
          </p>
          <p className="text-xs italic text-ink/55">
            Calculul folosește datele din fișa ta de emitere și statisticile publice ASF. Brokerul
            poate ajusta criteriile dacă ai preferințe.
          </p>
        </div>
      </section>

      {/* Side-by-side matrix */}
      <section className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-cloud">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-ink/55">
                Caracteristică
              </th>
              {offers.map((o) => (
                <th key={o.insurer} className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-ink/55">
                  {o.insurer.split(" ")[0]}
                  {o.best ? <span className="ml-1 text-ok">★</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <Row label="Primă anuală" cells={offers.map((o) => o.premiumLabel)} mono />
            <Row label="Plată în rate" cells={offers.map((o) => o.monthlyOpt)} />
            <Row label="Acoperire" cells={offers.map((o) => o.coverage)} />
            <Row
              label="Asistență rutieră"
              cells={[
                "opțional (+15 €)",
                <Yes key="g" />,
                <Yes key="a" />,
              ]}
            />
            <Row
              label="Constatare digitală"
              cells={[<No key="al" />, <Yes key="g" />, <Yes key="a" />]}
            />
            <Row
              label="Mașină de schimb"
              cells={[<No key="al" />, "daune > 1.000 €", <No key="a" />]}
            />
            <Row
              label="Scor AI"
              cells={offers.map((o) => (
                <ScoreBar key={o.insurer} score={o.score} />
              ))}
            />
          </tbody>
        </table>
      </section>

      {/* CTA */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-asicom bg-asicom/5 p-5">
        <div>
          <p className="font-display text-lg text-ink">
            Alege Asirom Vienna — 270 € pe an
          </p>
          <p className="mt-1 text-xs text-ink/60">
            Emite acum și plătești în 12 rate fără dobândă. Polița ajunge pe email în 2 minute.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud"
          >
            Alt comparator
          </button>
          <button
            type="button"
            className="rounded-lg bg-asicom px-5 py-2 text-sm font-bold text-white hover:bg-asicom-mid"
          >
            Cumpără Asirom — 270 €
          </button>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
interface Offer {
  insurer: string;
  brand: string;
  premium: number;
  premiumLabel: string;
  monthlyOpt: string;
  coverage: string;
  score: number;
  best: boolean;
  pros: string[];
  cons: string[];
  perks: string[];
}

function OfferCard({ o }: { o: Offer }) {
  return (
    <div
      className={`flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white transition-shadow ${
        o.best ? "border-asicom shadow-lg ring-2 ring-asicom/30" : "border-line"
      }`}
    >
      {o.best ? (
        <div className="bg-asicom px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-white">
          ★ Recomandat de AI
        </div>
      ) : null}
      <div className={`bg-gradient-to-br ${o.brand} p-5 text-white`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          Cotație RCA
        </div>
        <div className="mt-1 font-display text-xl">{o.insurer}</div>
        <div className="mt-3 font-mono text-3xl">{o.premiumLabel}</div>
        <div className="mt-0.5 text-xs text-white/80">{o.monthlyOpt}</div>
      </div>
      <div className="px-4 pb-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wider text-ink/50">Scor AI</span>
          <span className="font-mono text-sm font-bold text-asicom">{o.score}/100</span>
        </div>
        <ScoreBar score={o.score} />
      </div>
      <div className="space-y-2 px-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ok">Avantaje</p>
          <ul className="mt-1 space-y-0.5 text-xs text-ink/75">
            {o.pros.map((p, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-ok">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-warn">De luat în calcul</p>
          <ul className="mt-1 space-y-0.5 text-xs text-ink/75">
            {o.cons.map((p, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-warn">−</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        className={`mx-4 mb-4 mt-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          o.best
            ? "bg-asicom text-white hover:bg-asicom-mid"
            : "border border-asicom text-asicom hover:bg-asicom hover:text-white"
        }`}
      >
        Alege {o.insurer.split(" ")[0]}
      </button>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full bg-asicom"
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink/40">{label}</div>
      <div className="mt-0.5 text-sm text-ink">{value}</div>
    </div>
  );
}

function Row({
  label,
  cells,
  mono,
}: {
  label: string;
  cells: React.ReactNode[];
  mono?: boolean;
}) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-xs text-ink/55">{label}</td>
      {cells.map((c, i) => (
        <td
          key={i}
          className={`px-4 py-2.5 text-center text-sm text-ink ${mono ? "font-mono" : ""}`}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

function Yes() {
  return <span className="text-ok">✓ inclus</span>;
}
function No() {
  return <span className="text-ink/40">—</span>;
}
