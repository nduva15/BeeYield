import { useMemo, useState } from "react";
import { Calculator, Flower2, Target, X } from "lucide-react";

import FlorageLibraryPanel from "@/components/beeyield/lovable_ai/FlorageLibraryPanel";
import { useFlorageLibrary } from "@/hooks/useFlorageLibrary";
import { buildFloragePlanSummary } from "@/lib/florage";
import { resolveCropProfile } from "@/lib/pollination";

const CROPS = [
  "Almonds (CA)",
  "Apples",
  "Blueberries (highbush)",
  "Avocado (Hass)",
  "Sunflower (hybrid seed)",
  "Coffee (Arabica)",
  "Macadamia",
  "Mango",
  "Sidr",
];

export default function PollinationCalculations({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const { plants } = useFlorageLibrary();
  const [crop, setCrop] = useState(CROPS[0]);
  const [acres, setAcres] = useState(120);
  const [hives, setHives] = useState(180);
  const [framesPerHive, setFramesPerHive] = useState(9);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10));

  const cropProfile = useMemo(() => resolveCropProfile(crop), [crop]);
  const totalFrames = hives * framesPerHive;
  const baseFpa = acres > 0 ? totalFrames / acres : 0;
  const recommendedHives = Math.ceil(acres * cropProfile.recColoniesPerAcre);
  const coveragePct = Math.min(100, recommendedHives > 0 ? (hives / recommendedHives) * 100 : 0);
  const floragePlan = useMemo(() => buildFloragePlanSummary({
    plants,
    dateFrom,
    dateTo,
    coveragePct,
    hives,
  }), [coveragePct, dateFrom, dateTo, hives, plants]);

  const florageBoost = 0.75 + (floragePlan.weightedScore / 100) * 0.35;
  const effectiveFpa = Number((baseFpa * florageBoost).toFixed(2));
  const hiveGap = recommendedHives - hives;
  const readiness = Math.round(Math.min(100, (effectiveFpa / Math.max(1, cropProfile.recColoniesPerAcre * framesPerHive)) * 100));

  if (!isOpen) return null;

  return (
    <div className={embedded ? "h-full overflow-y-auto rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl custom-scroll" : "fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm custom-scroll"}>
      <div className="mx-auto max-w-7xl p-6">
        {!embedded && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="h-7 w-7 text-honey" />
              <div>
                <h1 className="font-display text-2xl font-bold text-honey">Pollination Calculation</h1>
                <p className="text-sm text-muted-foreground">Coverage math with a florage-weighted plan layered on top of the crop stocking baseline.</p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
              <Field label="Crop">
                <select value={crop} onChange={(event) => setCrop(event.target.value)} className={inputCls}>
                  {CROPS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="Acres">
                <input type="number" min={1} value={acres} onChange={(event) => setAcres(Math.max(1, Number(event.target.value) || 1))} className={inputCls} />
              </Field>
              <Field label="Hives deployed">
                <input type="number" min={1} value={hives} onChange={(event) => setHives(Math.max(1, Number(event.target.value) || 1))} className={inputCls} />
              </Field>
              <Field label="Frames per hive">
                <input type="number" min={1} value={framesPerHive} onChange={(event) => setFramesPerHive(Math.max(1, Number(event.target.value) || 1))} className={inputCls} />
              </Field>
              <Field label="Planning window start">
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={inputCls} />
              </Field>
              <Field label="Planning window end">
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <Metric label="Recommended hives" value={`${recommendedHives}`} emphasize />
              <Metric label="Current coverage" value={`${coveragePct.toFixed(0)}%`} />
              <Metric label="Base FPA" value={baseFpa.toFixed(2)} />
              <Metric label="Effective FPA" value={effectiveFpa.toFixed(2)} emphasize />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-honey" />
                <h2 className="font-display text-base font-bold text-foreground">Florage-weighted plan</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label="Weighted score" value={`${floragePlan.weightedScore}`} emphasize />
                <Metric label="Bloom-active plants" value={`${floragePlan.activePlants.length}`} />
                <Metric label="Readiness" value={`${readiness}%`} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">Plan summary</p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>Crop baseline: {cropProfile.recColoniesPerAcre} colonies/acre for roughly {cropProfile.bloomDays} bloom days.</p>
                    <p>Total frames deployed: {totalFrames}. Hive gap: {hiveGap > 0 ? `${hiveGap} short` : `${Math.abs(hiveGap)} surplus`}.</p>
                    <p>Florage boost factor: {florageBoost.toFixed(2)}x from nectar, pollen, radius, and diversity scoring.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">Recommended actions</p>
                  <div className="mt-3 space-y-2">
                    {floragePlan.actions.map((action) => (
                      <div key={action} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-honey/30 bg-honey/5 p-4">
                <div className="flex items-center gap-2 text-honey">
                  <Flower2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Dominant florage for this window</p>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {floragePlan.dominantPlants.map((plant) => (
                    <div key={plant.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="text-sm font-semibold text-foreground">{plant.name}</div>
                      <div className="text-xs italic text-muted-foreground">{plant.latin}</div>
                      <div className="mt-2 text-xs text-muted-foreground">{plant.bloom} · nectar {plant.nectar}/10 · pollen {plant.pollen}/10</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <FlorageLibraryPanel
            mode="compact"
            title="Embedded Florage CRUD"
            subtitle="Create, update, or delete plants here without leaving the calculation workflow."
            dateFrom={dateFrom}
            dateTo={dateTo}
            coveragePct={coveragePct}
            hives={hives}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${emphasize ? "border-honey/40 bg-honey/5" : "border-border bg-card"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${emphasize ? "text-honey" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none";
