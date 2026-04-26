import { useState } from "react";
import { X, BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

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

const COLORS = ["hsl(45, 93%, 47%)", "hsl(30, 90%, 50%)", "hsl(142, 71%, 45%)", "hsl(200, 80%, 50%)", "hsl(280, 60%, 55%)", "hsl(0, 70%, 55%)", "hsl(10, 80%, 60%)"];

export default function PollinationCharts({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState("value");

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={BarChart3}
        label="Analytics"
        title="Pollination Charts"
        subtitle="Economic value mapping and biological dependency distribution."
        onBack={onClose}
        actions={
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
                {[
                    { id: "value", label: "Value", icon: BarChart3 },
                    { id: "dependency", label: "Dependency", icon: PieChartIcon },
                    { id: "seasonal", label: "Seasonal", icon: Calendar },
                    { id: "losses", label: "Losses", icon: TrendingUp }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn("px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                            activeTab === tab.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="w-3 h-3" /> {tab.label}
                    </button>
                ))}
            </div>
        }
      />

      <div className="mt-8">
        {activeTab === "value" && (
          <div className="space-y-6">
            <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6">Economic Value of Pollination (US$ Billions)</h3>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CROP_DATA} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                    <YAxis dataKey="crop" type="category" width={90} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--honey)/0.05)' }} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 10, fontWeight: "bold" }} />
                    <Bar dataKey="value" fill="hsl(var(--honey))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </BeeYieldCard>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               <SummaryStat label="Global Value" value="$577B" />
               <SummaryStat label="Pollinator Need" value="75%" />
               <SummaryStat label="Food Crops" value="87 Items" />
               <SummaryStat label="Food from Bees" value="35%" />
            </div>
          </div>
        )}

        {activeTab === "dependency" && (
          <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6">Apid Pollination Dependency Matrix (%)</h3>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CROP_DATA.slice(0, 7)}
                    cx="50%" cy="50%"
                    innerRadius={80} outerRadius={140}
                    paddingAngle={8}
                    dataKey="dependency"
                    nameKey="crop"
                  >
                    {CROP_DATA.slice(0, 7).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11, fontWeight: "bold" }} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </BeeYieldCard>
        )}

        {activeTab === "seasonal" && (
          <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6 border-b border-border pb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-honey" /> Seasonal Biotic Dynamics</h3>
            <div className="h-[450px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SEASONAL_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 10, fontWeight: "bold" }} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }} />
                  <Area type="monotone" dataKey="honeyBees" stackId="1" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%)" fillOpacity={0.6} name="Managed Honey Bees" />
                  <Area type="monotone" dataKey="wildBees" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.6} name="Wild Solitary Bees" />
                  <Area type="monotone" dataKey="bumblebees" stackId="1" stroke="hsl(280, 60%, 55%)" fill="hsl(280, 60%, 55%)" fillOpacity={0.6} name="Bombus Augmentation" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BeeYieldCard>
        )}

        {activeTab === "losses" && (
          <div className="space-y-6">
            <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
               <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6 border-b border-border pb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-500" /> Global Colony Attrition Rates</h3>
               <div className="h-[450px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={COLONY_LOSS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                    <YAxis domain={[30, 55]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 10, fontWeight: "bold" }} formatter={(v: any) => [`${v}%`, "Colony Loss"]} />
                    <Line type="monotone" dataKey="loss" stroke="hsl(0, 70%, 55%)" strokeWidth={3} dot={{ fill: "hsl(0, 70%, 55%)", r: 5, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
               </div>
            </BeeYieldCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BeeYieldCard className="p-5 border-red-500/20 bg-red-50">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Peak Critical Loss</div>
                    <div className="text-2xl font-black text-red-700">48.2% <span className="text-sm opacity-50">(2023)</span></div>
                </BeeYieldCard>
                <BeeYieldCard className="p-5 border-border bg-muted/5">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">10-Year Average</div>
                    <div className="text-2xl font-black text-foreground">42.4%</div>
                </BeeYieldCard>
                <BeeYieldCard className="p-5 border-honey/20 bg-honey/5">
                    <div className="text-[10px] font-black text-honey uppercase tracking-widest mb-1">Stability Threshold</div>
                    <div className="text-2xl font-black text-honey">~15.0%</div>
                </BeeYieldCard>
            </div>
          </div>
        )}
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[90vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
        <button onClick={onClose} className="absolute top-10 right-10 p-2 rounded-full hover:bg-muted transition-colors z-50 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <div className="h-full overflow-y-auto custom-scroll p-10">
          {content}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <BeeYieldCard className="p-5 border-border/50 bg-muted/10 text-center">
            <div className="text-xl font-black text-honey mb-1">{value}</div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</div>
        </BeeYieldCard>
    );
}
