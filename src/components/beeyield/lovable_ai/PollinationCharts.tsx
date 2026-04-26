import { useState } from "react";
import { X } from "lucide-react";
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
const COLORS = ["hsl(45, 93%, 47%)", "hsl(30, 90%, 50%)", "hsl(142, 71%, 45%)", "hsl(200, 80%, 50%)", "hsl(280, 60%, 55%)", "hsl(0, 70%, 55%)", "hsl(10, 80%, 60%)"];

interface PollinationChartsProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function PollinationCharts({ isOpen, onClose, embedded = false }: PollinationChartsProps) {
  const [activeTab, setActiveTab] = useState("value");

  const content = (
    <div className={embedded ? "" : "max-h-[85vh] overflow-y-auto custom-scroll p-1"}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Pollination Analytics</h2>
          <p className="text-sm text-muted-foreground">Economic value and biological dependency analysis</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
          {[
            { id: "value", label: "Value" },
            { id: "dependency", label: "Dependency" },
            { id: "seasonal", label: "Seasonal" },
            { id: "losses", label: "Losses" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === "value" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">Economic Value of Pollination (US$ Billions)</h3>
              <p className="text-xs text-muted-foreground mb-4">Total annual benefit to crop production by sector</p>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CROP_DATA} layout="vertical" margin={{ left: 30, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="crop" type="category" width={80} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(var(--honey))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Global Value", value: "$577B" },
                { label: "Need Pollinators", value: "75%" },
                { label: "Food Crops", value: "87" },
                { label: "Food from Bees", value: "35%" }
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-border p-3 text-center">
                  <div className="text-xl font-bold text-honey">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "dependency" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">Apid Pollination Dependency (%)</h3>
              <p className="text-xs text-muted-foreground mb-4">Percentage of crop production requiring insect pollination</p>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CROP_DATA.slice(0, 7)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="dependency"
                  >
                    {CROP_DATA.slice(0, 7).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "seasonal" && (
          <div className="space-y-4">
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
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COLONY_LOSS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[30, 55]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Colony Loss"]} />
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
                <div className="text-xs text-muted-foreground">Threshold</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative transition-all transform ${isOpen ? 'scale-100' : 'scale-95'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
}
