import { useState } from "react";
import { Calculator, Save, Beaker, Box, DollarSign, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";

// Beeyield-flavored calculators (distinct from screenshot reference).
// Categories: Feeding, Equipment & sizing, Economics & ROI, Quizzes & decision tools.

const TABS = [
  { key: "feed", label: "Feeding", Icon: Beaker },
  { key: "equip", label: "Equipment & sizing", Icon: Box },
  { key: "econ", label: "Economics & ROI", Icon: DollarSign },
  { key: "quiz", label: "Quizzes & decisions", Icon: HelpCircle },
];

export default function BeeyieldCalculators({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [tab, setTab] = useState("feed");

  const saveRun = async (key: string, label: string, inputs: object, outputs: object) => {
    const { error } = await supabase.from("calculator_runs").insert([{
      device_id: deviceId, calculator_key: key, label,
      inputs: inputs as never, outputs: outputs as never,
    }]);
    if (error) toast.error(error.message); else toast.success("Saved to history");
  };

  if (!isOpen) return null;
  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Beeyield Calculators</h1>
              <p className="text-xs text-muted-foreground">Quick numbers for feeding, equipment sizing, ROI & beekeeper decisions</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${tab === key ? "bg-honey text-honey-foreground border-honey" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {tab === "feed" && <FeedingCalcs onSave={saveRun} />}
        {tab === "equip" && <EquipCalcs onSave={saveRun} />}
        {tab === "econ" && <EconCalcs onSave={saveRun} />}
        {tab === "quiz" && <QuizDeck />}
      </div>
    </div>
  );
}

// ==========================================================================
function FeedingCalcs({ onSave }: { onSave: (k: string, l: string, i: object, o: object) => void }) {
  // Sugar syrup (1:1, 2:1, fondant), winter store gap.
  const [hives, setHives] = useState(10);
  const [ratio, setRatio] = useState<"1:1" | "2:1" | "fondant">("2:1");
  const [perHiveKg, setPerHiveKg] = useState(8);
  // Winter
  const [storeKg, setStoreKg] = useState(12);
  const [targetKg, setTargetKg] = useState(20);
  const [winterHives, setWinterHives] = useState(10);

  const sugarKg = hives * perHiveKg * (ratio === "1:1" ? 0.5 : ratio === "2:1" ? 0.667 : 0.85);
  const waterL = hives * perHiveKg * (ratio === "1:1" ? 0.5 : ratio === "2:1" ? 0.333 : 0.15);
  const gapKg = Math.max(0, (targetKg - storeKg) * winterHives);

  return (
    <div className="space-y-4">
      <Card title="Sugar syrup / fondant" subtitle="Mixes ratio sugar:water by mass; fondant assumes 85% sugar">
        <Row>
          <Field label="Hives"><input type="number" value={hives} onChange={(e) => setHives(+e.target.value)} className={inp} /></Field>
          <Field label="kg per hive"><input type="number" value={perHiveKg} onChange={(e) => setPerHiveKg(+e.target.value)} className={inp} /></Field>
          <Field label="Mix"><select value={ratio} onChange={(e) => setRatio(e.target.value as "1:1" | "2:1" | "fondant")} className={inp}><option value="1:1">1:1 (spring stim)</option><option value="2:1">2:1 (autumn store)</option><option value="fondant">Fondant (winter)</option></select></Field>
        </Row>
        <Result>
          <Stat label="Sugar" value={`${sugarKg.toFixed(1)} kg`} />
          <Stat label={ratio === "fondant" ? "Water (knead)" : "Water"} value={`${waterL.toFixed(1)} L`} />
          <Stat label="Total feed" value={`${(hives * perHiveKg).toFixed(1)} kg`} />
        </Result>
        <SaveBtn onClick={() => onSave("feeding_syrup", `${ratio} for ${hives} hives`, { hives, perHiveKg, ratio }, { sugarKg, waterL })} />
      </Card>

      <Card title="Winter store gap" subtitle="Are colonies short of stores before wintering?">
        <Row>
          <Field label="Hives going into winter"><input type="number" value={winterHives} onChange={(e) => setWinterHives(+e.target.value)} className={inp} /></Field>
          <Field label="Current stores per hive (kg)"><input type="number" value={storeKg} onChange={(e) => setStoreKg(+e.target.value)} className={inp} /></Field>
          <Field label="Target per hive (kg)"><input type="number" value={targetKg} onChange={(e) => setTargetKg(+e.target.value)} className={inp} /></Field>
        </Row>
        <Result>
          <Stat label="Total gap" value={`${gapKg.toFixed(0)} kg`} accent={gapKg > 0 ? "warn" : "ok"} />
          <Stat label="Sugar needed (2:1)" value={`${(gapKg * 0.667).toFixed(0)} kg`} />
          <Stat label="Recommendation" value={gapKg > 0 ? "Feed before first frost" : "OK — no extra feed"} accent={gapKg > 0 ? "warn" : "ok"} />
        </Result>
        <SaveBtn onClick={() => onSave("feeding_winter", `Winter gap ${gapKg}kg`, { winterHives, storeKg, targetKg }, { gapKg })} />
      </Card>
    </div>
  );
}

function EquipCalcs({ onSave }: { onSave: (k: string, l: string, i: object, o: object) => void }) {
  const [hives, setHives] = useState(20);
  const [supersPerHive, setSupersPerHive] = useState(2);
  const [framesPerSuper, setFramesPerSuper] = useState(10);
  const [yearlyRequeenPct, setYearlyRequeenPct] = useState(50);

  const totalSupers = hives * supersPerHive;
  const totalFrames = totalSupers * framesPerSuper;
  const queens = Math.ceil(hives * (yearlyRequeenPct / 100));
  const wax = totalFrames * 0.07; // ~70 g/frame foundation
  const veils = Math.ceil(hives / 25);

  return (
    <Card title="Apiary equipment sizing" subtitle="Estimate supers, frames, foundation wax, queens & gear">
      <Row>
        <Field label="Hives"><input type="number" value={hives} onChange={(e) => setHives(+e.target.value)} className={inp} /></Field>
        <Field label="Supers per hive"><input type="number" value={supersPerHive} onChange={(e) => setSupersPerHive(+e.target.value)} className={inp} /></Field>
        <Field label="Frames/super"><input type="number" value={framesPerSuper} onChange={(e) => setFramesPerSuper(+e.target.value)} className={inp} /></Field>
        <Field label="Yearly requeen %"><input type="number" value={yearlyRequeenPct} onChange={(e) => setYearlyRequeenPct(+e.target.value)} className={inp} /></Field>
      </Row>
      <Result>
        <Stat label="Supers" value={totalSupers} />
        <Stat label="Frames" value={totalFrames} />
        <Stat label="Foundation wax" value={`${wax.toFixed(1)} kg`} />
        <Stat label="Queens / yr" value={queens} />
        <Stat label="Bee suits" value={veils} />
      </Result>
      <SaveBtn onClick={() => onSave("equipment_sizing", `${hives} hives sizing`, { hives, supersPerHive, framesPerSuper, yearlyRequeenPct }, { totalSupers, totalFrames, wax, queens })} />
    </Card>
  );
}

function EconCalcs({ onSave }: { onSave: (k: string, l: string, i: object, o: object) => void }) {
  const [hives, setHives] = useState(50);
  const [yieldKg, setYieldKg] = useState(20);
  const [pricePerKg, setPricePerKg] = useState(800); // KES default
  const [hiveCost, setHiveCost] = useState(8000);
  const [annualOpex, setAnnualOpex] = useState(2500);
  const [pollContractPerHive, setPollContractPerHive] = useState(3000);
  const [pollHives, setPollHives] = useState(20);

  const honeyRevenue = hives * yieldKg * pricePerKg;
  const pollRevenue = pollHives * pollContractPerHive;
  const opex = hives * annualOpex;
  const capex = hives * hiveCost;
  const profit = honeyRevenue + pollRevenue - opex;
  const roi = capex > 0 ? (profit / capex) * 100 : 0;
  const payback = profit > 0 ? capex / profit : Infinity;

  return (
    <Card title="Apiary economics" subtitle="Honey + pollination revenue vs setup & ongoing costs (KES default — change anywhere)">
      <Row>
        <Field label="Hives"><input type="number" value={hives} onChange={(e) => setHives(+e.target.value)} className={inp} /></Field>
        <Field label="Yield kg/hive/yr"><input type="number" value={yieldKg} onChange={(e) => setYieldKg(+e.target.value)} className={inp} /></Field>
        <Field label="Price/kg"><input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(+e.target.value)} className={inp} /></Field>
        <Field label="Capex / hive"><input type="number" value={hiveCost} onChange={(e) => setHiveCost(+e.target.value)} className={inp} /></Field>
        <Field label="Opex / hive / yr"><input type="number" value={annualOpex} onChange={(e) => setAnnualOpex(+e.target.value)} className={inp} /></Field>
        <Field label="Pollination hives"><input type="number" value={pollHives} onChange={(e) => setPollHives(+e.target.value)} className={inp} /></Field>
        <Field label="Contract per hive"><input type="number" value={pollContractPerHive} onChange={(e) => setPollContractPerHive(+e.target.value)} className={inp} /></Field>
      </Row>
      <Result>
        <Stat label="Honey revenue" value={fmt(honeyRevenue)} />
        <Stat label="Pollination revenue" value={fmt(pollRevenue)} />
        <Stat label="Annual profit" value={fmt(profit)} accent={profit > 0 ? "ok" : "warn"} />
        <Stat label="ROI" value={`${roi.toFixed(1)}%`} accent={roi > 20 ? "ok" : "warn"} />
        <Stat label="Payback" value={isFinite(payback) ? `${payback.toFixed(1)} yr` : "—"} />
      </Result>
      <SaveBtn onClick={() => onSave("economics", `ROI ${roi.toFixed(0)}%`, { hives, yieldKg, pricePerKg, hiveCost, annualOpex, pollHives, pollContractPerHive }, { honeyRevenue, pollRevenue, profit, roi, payback })} />
    </Card>
  );
}

function QuizDeck() {
  return (
    <div className="space-y-4">
      <BeekeeperStyleQuiz />
      <WeatherGoNoGo />
      <HarvestReadinessQuiz />
    </div>
  );
}

function BeekeeperStyleQuiz() {
  const Q = [
    { q: "Inspections per month?", opts: [["1 or fewer", 0], ["2", 1], ["3+", 2]] },
    { q: "Mite-count cadence?", opts: [["Never", 0], ["Twice a year", 1], ["Monthly", 2]] },
    { q: "Records?", opts: [["Memory", 0], ["Notes", 1], ["Spreadsheet/app", 2]] },
  ] as const;
  const [ans, setAns] = useState<number[]>([0, 0, 0]);
  const score = ans.reduce((a, b) => a + b, 0);
  const style = score < 2 ? "Hands-off / observational" : score < 4 ? "Balanced / seasonal" : "Intensive / data-driven";
  return (
    <Card title="Beekeeper style profile" subtitle="3 quick questions — get a profile">
      {Q.map((item, i) => (
        <div key={i} className="mb-2">
          <div className="text-xs font-semibold text-foreground mb-1">{item.q}</div>
          <div className="flex gap-1.5 flex-wrap">{item.opts.map(([label, val]) => (
            <button key={label} onClick={() => setAns(ans.map((a, j) => (j === i ? (val as number) : a)))} className={`text-xs px-3 py-1.5 rounded-full border ${ans[i] === val ? "bg-honey text-honey-foreground border-honey" : "border-border text-muted-foreground"}`}>{label}</button>
          ))}</div>
        </div>
      ))}
      <Result><Stat label="Your style" value={style} accent="ok" /></Result>
    </Card>
  );
}

function WeatherGoNoGo() {
  const [tempC, setTempC] = useState(22);
  const [windKmh, setWindKmh] = useState(10);
  const [precipMm, setPrecipMm] = useState(0);
  const ok = tempC >= 14 && windKmh < 25 && precipMm < 1;
  return (
    <Card title="Inspection weather go / no-go" subtitle="Quick check before opening colonies">
      <Row>
        <Field label="Temp (°C)"><input type="number" value={tempC} onChange={(e) => setTempC(+e.target.value)} className={inp} /></Field>
        <Field label="Wind (km/h)"><input type="number" value={windKmh} onChange={(e) => setWindKmh(+e.target.value)} className={inp} /></Field>
        <Field label="Precip (mm)"><input type="number" value={precipMm} onChange={(e) => setPrecipMm(+e.target.value)} className={inp} /></Field>
      </Row>
      <Result><Stat label={ok ? "GO" : "NO-GO"} value={ok ? "Open hives" : "Postpone — keep cluster intact"} accent={ok ? "ok" : "warn"} /></Result>
    </Card>
  );
}

function HarvestReadinessQuiz() {
  const [capped, setCapped] = useState(75);
  const [moisture, setMoisture] = useState(18);
  const [supers, setSupers] = useState(2);
  const ready = capped >= 80 && moisture <= 18.6 && supers >= 1;
  return (
    <Card title="Harvest readiness" subtitle="Frame inspection check for extraction">
      <Row>
        <Field label="Capped honey %"><input type="number" value={capped} onChange={(e) => setCapped(+e.target.value)} className={inp} /></Field>
        <Field label="Moisture %"><input type="number" value={moisture} onChange={(e) => setMoisture(+e.target.value)} className={inp} /></Field>
        <Field label="Full supers"><input type="number" value={supers} onChange={(e) => setSupers(+e.target.value)} className={inp} /></Field>
      </Row>
      <Result><Stat label={ready ? "READY" : "WAIT"} value={ready ? "Extract this week" : capped < 80 ? "Wait until ≥80% capped" : "Lower moisture under 18.6%"} accent={ready ? "ok" : "warn"} /></Result>
    </Card>
  );
}

// ============================== shared bits ==============================
function fmt(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <h3 className="font-display text-base font-bold text-honey">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1 block">{label}</label>{children}</div>;
}
function Result({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-lg bg-muted/40 border border-border">{children}</div>;
}
function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "ok" | "warn" }) {
  const cls = accent === "ok" ? "text-emerald-500" : accent === "warn" ? "text-destructive" : "text-honey";
  return <div><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className={`text-lg font-display font-bold ${cls}`}>{value}</div></div>;
}
function SaveBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="mt-3 px-3 py-2 rounded-lg border border-honey/40 text-honey text-xs flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />Save run to history</button>;
}
