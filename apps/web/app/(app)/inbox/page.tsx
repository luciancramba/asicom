import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Preview-only WhatsApp/SMS inbox for the broker. Shows how every client conversation lands in
 * one place with AI-suggested replies, automated reminders, and clear context per thread. The
 * pitch: Tripon doesn't context-switch between Insuretech, Excel, WhatsApp, mail and phone — it
 * all flows here, and the AI drafts the routine replies.
 */
export default function InboxPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
        <span className="font-bold">📋 PAGINĂ DEMO — inbox conversații.</span>{" "}
        Așa va arăta inbox-ul brokerului cu toate conversațiile WhatsApp/SMS la un loc, cu
        sugestii de răspuns generate de AI și acțiuni rapide. Conversațiile sunt simulate cu
        clienții noștri de test.
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-asicom-mid">Preview</p>
          <h1 className="font-display text-3xl font-light text-ink">Inbox</h1>
          <p className="mt-1 text-sm text-ink/60">
            Toate conversațiile cu clienții, în același loc. AI-ul îți pregătește răspunsuri.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-asicom transition-colors hover:bg-cloud"
        >
          ← Înapoi
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Conversații active" value="7" accent="text-asicom" />
        <StatCard label="Necitite" value="2" accent="text-warn" />
        <StatCard label="Răspunsuri auto azi" value="14" accent="text-ok" />
        <StatCard label="Timp mediu răspuns" value="3m 12s" hint="după AI assist" accent="text-ok" />
      </div>

      {/* Main: 3-column inbox layout */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[18rem_1fr_18rem]">
        {/* Left: conversation list */}
        <aside className="overflow-hidden rounded-xl border border-line bg-white">
          <header className="border-b border-line bg-cloud px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-asicom">
            Conversații
          </header>
          <ul className="divide-y divide-line">
            <Thread
              name="TRIPON LUCIAN-NICOLAE"
              last="Bună Lucian, RCA-ul meu expiră..."
              time="14:32"
              unread
              active
            />
            <Thread
              name="FILIP-CHIȘ NORA-CARMEN"
              last="Mulțumesc pentru rovinietă! 🙏"
              time="13:08"
            />
            <Thread
              name="SECHERNEȘ SIMION"
              last="✓ Programare ITP confirmată"
              time="11:24"
              autoReply
            />
            <Thread
              name="CRAMBA LUCIAN-CORNEL"
              last="Vreau să adaug soția pe poliță"
              time="10:47"
              unread
            />
            <Thread
              name="POPA MARIA"
              last="Câteva întrebări despre Casco"
              time="ieri"
            />
            <Thread
              name="IONESCU CATALIN"
              last="✓ Aniversare — mesaj trimis"
              time="ieri"
              autoReply
            />
            <Thread
              name="DRAGOMIR ELENA"
              last="Mașină de schimb confirmată"
              time="2 zile"
            />
          </ul>
        </aside>

        {/* Center: open conversation */}
        <main className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line bg-cloud px-4 py-2.5">
            <div>
              <div className="text-sm font-medium text-ink">TRIPON LUCIAN-NICOLAE</div>
              <div className="font-mono text-[11px] text-ink/50">0745 123 456 · WhatsApp Business</div>
            </div>
            <span className="rounded-full bg-asicom/10 px-2 py-0.5 text-[10px] font-medium text-asicom">
              Client activ · RCA · PAD
            </span>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-cloud/30 p-4">
            <Bubble side="them" time="13:24">
              {"Bună Lucian! 👋"}
            </Bubble>
            <Bubble side="them" time="13:24">
              {"RCA-ul meu pe AB-17-VIP expiră săptămâna asta. Poți să-mi pregătești o ofertă, te rog?"}
            </Bubble>
            <Bubble side="me" time="13:26" auto>
              {"Bună Lucian! Mulțumesc că ai luat legătura din timp."}
            </Bubble>
            <Bubble side="me" time="13:26" auto>
              {"Am 3 cotații pregătite pentru AB-17-VIP — toate cu aceeași acoperire ca la polița actuală:"}
            </Bubble>
            <Bubble side="me" time="13:27" auto>
              {"• Allianz Țiriac — 280 € (anul trecut)"}
              <br />
              {"• Groupama — 305 €"}
              <br />
              {"• Asirom Vienna — 270 €"}
            </Bubble>
            <Bubble side="me" time="13:27" auto>
              {"Asirom e cea mai bună pentru profilul tău (clasa B6). Confirmi și o emit?"}
            </Bubble>
            <Bubble side="them" time="14:31">
              {"Super! Dar dacă vreau și Casco?"}
            </Bubble>
            <Bubble side="them" time="14:32">
              {"E mult mai scump?"}
            </Bubble>
          </div>

          {/* AI suggested reply panel */}
          <div className="border-t border-asicom/20 bg-asicom/5 p-3">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-asicom">
              <span>✨</span> Răspuns sugerat de AI
            </p>
            <div className="rounded-lg border border-asicom/30 bg-white p-3 text-sm text-ink">
              Cu Casco la Asirom (cu franșiză 250 €) ajungi la 1.150 € total (RCA + Casco). Dacă vrei
              franșiză 500 €, scade la 980 €. Îți recomand 250 € — la o lovitură ușoară (sub 500 €)
              e mai avantajos. Confirmi?
            </div>
            <div className="mt-2 flex gap-2">
              <ReplyBtn primary>📨 Trimite</ReplyBtn>
              <ReplyBtn>✎ Editează</ReplyBtn>
              <ReplyBtn>🔄 Altă variantă</ReplyBtn>
            </div>
          </div>
        </main>

        {/* Right: client context card */}
        <aside className="space-y-3">
          <section className="overflow-hidden rounded-xl border border-line bg-white">
            <header className="border-b border-line bg-cloud px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-asicom">
              Context client
            </header>
            <div className="space-y-1 p-3 text-xs">
              <KV label="CNP" value="1711016011090" mono />
              <KV label="Vehicul" value="MERCEDES B 180 CDI" />
              <KV label="Plate" value="AB-17-VIP" mono />
              <KV label="RCA actual" value="Allianz · 280 € · exp 18.07" />
              <KV label="Bonus-malus" value="B6 (−25%)" />
              <KV label="Daune ultim an" value="Niciuna" />
            </div>
          </section>
          <section className="overflow-hidden rounded-xl border border-line bg-white">
            <header className="border-b border-line bg-cloud px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-asicom">
              Sugestii AI
            </header>
            <ul className="space-y-2 p-3 text-xs">
              <SuggestionItem>Trimite ofertă RCA + Casco completă</SuggestionItem>
              <SuggestionItem>Programează apel telefonic 16:00</SuggestionItem>
              <SuggestionItem>Notează interes pentru Casco în CRM</SuggestionItem>
            </ul>
          </section>
        </aside>
      </div>

      {/* Automatic outgoing reminders log */}
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <header className="border-b border-line bg-cloud px-4 py-3">
          <h2 className="font-display text-lg text-ink">Mesaje automate trimise azi</h2>
          <p className="mt-0.5 text-xs text-ink/55">
            Aniversări, reminder-uri rovinietă/ITP, confirmări — toate logate aici pentru
            transparență.
          </p>
        </header>
        <ul className="divide-y divide-line text-sm">
          <AutoMsg
            time="09:00"
            to="IONESCU CATALIN"
            body="🎂 La mulți ani, Cătălin! Asicom îți dorește un an plin pe drumuri sigure."
            channel="WhatsApp + Email"
            status="✓ Livrat"
          />
          <AutoMsg
            time="10:15"
            to="DRAGOMIR ELENA"
            body="Rovinieta pentru CJ-77-DRG expiră în 30 zile. Vrei să ți-o reînnoiesc automat?"
            channel="WhatsApp"
            status="✓ Citit"
          />
          <AutoMsg
            time="11:23"
            to="SECHERNEȘ SIMION"
            body="ITP-ul pentru CJ-14-XMF a fost programat la 22.07 la Auto Service Alba 09:30. Confirmi?"
            channel="WhatsApp"
            status="✓ Confirmat"
          />
          <AutoMsg
            time="13:40"
            to="FILIP-CHIȘ NORA-CARMEN"
            body="Polița RCA pentru CJ-25-VOU expiră în 60 zile. Îți pregătesc cotații?"
            channel="SMS"
            status="…în așteptare"
          />
        </ul>
      </section>
    </div>
  );
}

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

function Thread({
  name,
  last,
  time,
  unread,
  active,
  autoReply,
}: {
  name: string;
  last: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  autoReply?: boolean;
}) {
  return (
    <li
      className={`cursor-pointer px-3 py-2.5 transition-colors hover:bg-cloud/60 ${
        active ? "bg-asicom/10" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-ink">{name}</span>
        <span className={`shrink-0 text-[10px] ${unread ? "font-bold text-asicom" : "text-ink/40"}`}>
          {time}
        </span>
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">
        {autoReply ? <span className="text-[10px]">🤖</span> : null}
        <span
          className={`truncate text-xs ${
            unread ? "font-medium text-ink/80" : "text-ink/50"
          }`}
        >
          {last}
        </span>
      </div>
    </li>
  );
}

function Bubble({
  side,
  time,
  auto,
  children,
}: {
  side: "me" | "them";
  time: string;
  auto?: boolean;
  children: React.ReactNode;
}) {
  const isMe = side === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
          isMe ? "rounded-br-md bg-asicom text-white" : "rounded-bl-md bg-white text-ink"
        }`}
      >
        {auto ? (
          <div className={`mb-1 text-[9px] font-bold uppercase tracking-wider ${isMe ? "text-white/70" : "text-asicom-mid"}`}>
            ✨ AI assist
          </div>
        ) : null}
        <div>{children}</div>
        <div className={`mt-1 text-right text-[10px] ${isMe ? "text-white/60" : "text-ink/40"}`}>
          {time}
        </div>
      </div>
    </div>
  );
}

function ReplyBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
        primary
          ? "bg-asicom text-white hover:bg-asicom-mid"
          : "border border-line bg-white text-asicom hover:bg-cloud"
      }`}
    >
      {children}
    </button>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-line/40 py-1 last:border-b-0">
      <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink/40">{label}</span>
      <span className={`text-right text-xs text-ink ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function SuggestionItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex cursor-pointer items-start gap-2 rounded-md border border-asicom/20 bg-asicom/5 px-2 py-1.5 hover:bg-asicom/10">
      <span className="text-asicom">→</span>
      <span className="text-ink/80">{children}</span>
    </li>
  );
}

function AutoMsg({
  time,
  to,
  body,
  channel,
  status,
}: {
  time: string;
  to: string;
  body: string;
  channel: string;
  status: string;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3">
      <span className="font-mono text-xs text-ink/50">{time}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-ink">{to}</div>
        <div className="mt-0.5 truncate text-xs text-ink/65">{body}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[10px] uppercase tracking-wide text-ink/40">{channel}</div>
        <div className="text-[11px] text-ok">{status}</div>
      </div>
    </li>
  );
}
