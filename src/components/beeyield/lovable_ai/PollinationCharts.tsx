import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";

const CROP_DATA = [
  { crop: "Almonds", dependency: 100, value: 5.6 },
  { crop: "Apples", dependency: 90, value: 4.1 },
  { crop: "Blueberries", dependency: 90, value: 1.2 },
  { crop: "Cherries", dependency: 90, value: 1.8 },
  { crop: "Avocados", dependency: 80, value: 2.9 },
  { crop: "Cucumbers", dependency: 80, value: 1.1 },
  { crop: "Watermelon", dependency: 70, value: 0.9 },
  { crop: "Soybeans", dependency: 50, value: 46.8 },
  { crop: "Canola", dependency: 50, value: 4.2 },
  { crop: "Coffee", dependency: 40, value: 19.3 },
  { crop: "Cocoa", dependency: 30, value: 5.1 },
  { crop: "Cotton", dependency: 20, value: 8.7 },
];

const REGIONAL_VALUE = [
  { region: "Asia-Pacific", value: 198 },
  { region: "Europe", value: 142 },
  { region: "North America", value: 89 },
  { region: "Latin America", value: 71 },
  { region: "Africa", value: 48 },
  { region: "Middle East", value: 29 },
];

const SEASONAL_DATA = [
  { month: "Jan", wildBees: 5, honeyBees: 15, bumblebees: 2, total: 22 },
  { month: "Feb", wildBees: 10, honeyBees: 20, bumblebees: 5, total: 35 },
  { month: "Mar", wildBees: 30, honeyBees: 45, bumblebees: 15, total: 90 },
  { month: "Apr", wildBees: 60, honeyBees: 75, bumblebees: 40, total: 175 },
  { month: "May", wildBees: 85, honeyBees: 95, bumblebees: 70, total: 250 },
  { month: "Jun", wildBees: 95, honeyBees: 100, bumblebees: 85, total: 280 },
  { month: "Jul", wildBees: 90, honeyBees: 98, bumblebees: 90, total: 278 },
  { month: "Aug", wildBees: 75, honeyBees: 90, bumblebees: 80, total: 245 },
  { month: "Sep", wildBees: 50, honeyBees: 70, bumblebees: 55, total: 175 },
  { month: "Oct", wildBees: 25, honeyBees: 45, bumblebees: 20, total: 90 },
  { month: "Nov", wildBees: 10, honeyBees: 25, bumblebees: 5, total: 40 },
  { month: "Dec", wildBees: 3, honeyBees: 12, bumblebees: 1, total: 16 },
];

const COLONY_LOSS = [
  { year: "2015", loss: 42.1 },
  { year: "2016", loss: 44.1 },
  { year: "2017", loss: 40.7 },
  { year: "2018", loss: 38.0 },
  { year: "2019", loss: 37.7 },
  { year: "2020", loss: 43.7 },
  { year: "2021", loss: 45.5 },
  { year: "2022", loss: 39.0 },
  { year: "2023", loss: 48.2 },
  { year: "2024", loss: 46.1 },
];

const PIE_COLORS = ["hsl(45, 93%, 47%)", "hsl(30, 90%, 50%)", "hsl(142, 71%, 45%)", "hsl(200, 80%, 50%)", "hsl(280, 60%, 55%)", "hsl(0, 70%, 55%)"];

const tabs = [
  { id: "crops", label: "Crop Dependencies" },
  { id: "regions", label: "Economic Value" },
  { id: "seasonal", label: "Seasonal Patterns" },
  { id: "losses", label: "Colony Losses" },
];

interface PollinationChartsProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function PollinationCharts({ isOpen, onClose, embedded = false }: PollinationChartsProps) {
  const [activeTab, setActiveTab] = useState("crops");

  if (!isOpen) return null;

  return (
    <div className={embedded ? "relative z-0 bg-background flex items-center justify-center pt-6" : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"} onClick={embedded ? undefined : onClose}>
      <div className={`bg-card border border-border rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden mx-4 flex flex-col ${embedded ? "" : "max-h-[90vh]"}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">🌸 Pollination Data & Analytics</h2>
            <p className="text-xs text-muted-foreground">Interactive charts • Crop dependencies • Economic impact • Seasonal trends</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 flex gap-2 flex-shrink-0 border-b border-border pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeTab === t.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Chart content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6">
          {activeTab === "crops" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">Crop Pollination Dependency (%)</h3>
                <p className="text-xs text-muted-foreground mb-4">Percentage of crop yield dependent on bee pollination</p>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CROP_DATA} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="crop" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} width={75} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Dependency"]} />
                    <Bar dataKey="dependency" fill="hsl(45, 93%, 47%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="rounded-xl border border-border p-3 text-center">
                  <div className="text-xl font-bold text-honey">$577B</div>
                  <div className="text-xs text-muted-foreground">Global pollination value/yr</div>
                </div>
                <div className="rounded-xl border border-border p-3 text-center">
                  <div className="text-xl font-bold text-honey">75%</div>
                  <div className="text-xs text-muted-foreground">Crops need pollinators</div>
                </div>
                <div className="rounded-xl border border-border p-3 text-center">
                  <div className="text-xl font-bold text-honey">87</div>
                  <div className="text-xs text-muted-foreground">Leading food crops</div>
                </div>
                <div className="rounded-xl border border-border p-3 text-center">
                  <div className="text-xl font-bold text-honey">35%</div>
                  <div className="text-xs text-muted-foreground">Global food from bees</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "regions" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">Economic Value of Pollination by Region</h3>
                <p className="text-xs text-muted-foreground mb-4">Annual pollination services value in billions USD</p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="h-[350px] w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={REGIONAL_VALUE} dataKey="value" nameKey="region" cx="50%" cy="50%" outerRadius={130} label={({ region, value }) => `${region}: $${value}B`} labelLine={{ stroke: "hsl(var(--muted-foreground))" }} style={{ fontSize: 10 }}>
                        {REGIONAL_VALUE.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`$${v}B`, "Value"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-2">
                  {REGIONAL_VALUE.map((r, i) => (
                    <div key={r.region} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-sm text-foreground flex-1">{r.region}</span>
                      <span className="text-sm font-bold text-foreground">${r.value}B</span>
                    </div>
                  ))}
                  <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 mt-3">
                    <span className="text-sm font-bold text-honey">Total: $577B/year</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seasonal" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">Seasonal Pollination Activity Index</h3>
                <p className="text-xs text-muted-foreground mb-4">Relative pollination activity by pollinator type throughout the year (Northern Hemisphere)</p>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SEASONAL_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="honeyBees" stackId="1" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%)" fillOpacity={0.6} name="Honey Bees" />
                    <Area type="monotone" dataKey="wildBees" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.6} name="Wild Bees" />
                    <Area type="monotone" dataKey="bumblebees" stackId="1" stroke="hsl(280, 60%, 55%)" fill="hsl(280, 60%, 55%)" fillOpacity={0.6} name="Bumblebees" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "losses" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">US Annual Colony Loss Rate (%)</h3>
                <p className="text-xs text-muted-foreground mb-4">Managed honey bee colony losses reported by the Bee Informed Partnership</p>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={COLONY_LOSS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[30, 55]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Colony Loss"]} />
                    <Line type="monotone" dataKey="loss" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ fill: "hsl(0, 70%, 55%)", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-center">
                  <div className="text-xl font-bold text-destructive">48.2%</div>
                  <div className="text-xs text-muted-foreground">Peak loss (2023)</div>
                </div>
                <div className="rounded-xl border border-border p-3 text-center">
                  <div className="text-xl font-bold text-foreground">42.4%</div>
                  <div className="text-xs text-muted-foreground">10-year average</div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                  <div className="text-xl font-bold text-honey">~15%</div>
                  <div className="text-xs text-muted-foreground">Acceptable threshold</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
