import { useState, useMemo } from "react";
import { X, Sparkles, Calendar, Target, MapPin, Search, ChevronRight, Info, AlertTriangle, Layers, Droplets } from "lucide-react";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

type BloomEvent = {
  id: string;
  crop: string;
  region: string;
  stage: "pre-bloom" | "early" | "peak" | "late" | "petal-fall";
  intensity: number;
  startDate: string;
  forecastedEnd: string;
};

export default function BloomPhenology({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const [search, setSearch] = useState("");
  
  const events: BloomEvent[] = [
    { id: "1", crop: "Almonds", region: "Central Valley", stage: "early", intensity: 30, startDate: "2024-02-12", forecastedEnd: "2024-03-05" },
    { id: "2", crop: "Macadamia", region: "Kiambu", stage: "peak", intensity: 85, startDate: "2024-08-15", forecastedEnd: "2024-09-10" },
    { id: "3", crop: "Coffee", region: "Nyeri", stage: "pre-bloom", intensity: 5, startDate: "2024-10-01", forecastedEnd: "2024-10-20" },
  ];

  const filtered = events.filter(e => e.crop.toLowerCase().includes(search.toLowerCase()) || e.region.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Sparkles}
        label="Ecology"
        title="Bloom Phenology"
        subtitle="Real-time tracking of floral stage transitions and nectar load availability."
        onBack={onClose}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-4 space-y-6">
            <BeeYieldSection title="Field Monitoring" icon={Search}>
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter crop patterns..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white text-sm font-bold outline-none focus:border-honey/40 shadow-sm transition-all" />
                </div>
                <div className="space-y-3">
                    {filtered.map((e) => (
                        <BeeYieldCard key={e.id} className="p-4 border-border/60 bg-white hover:border-honey/40 transition-all group cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{e.crop}</h4>
                                <BeeYieldBadge className={cn("text-[8px] font-black uppercase tracking-widest", 
                                    e.stage === 'peak' ? "bg-honey text-white" : "bg-muted text-muted-foreground"
                                )}>{e.stage}</BeeYieldBadge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                <MapPin className="w-3 h-3 text-honey" /> {e.region}
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground tracking-widest px-0.5">
                                    <span>Bloom Density</span>
                                    <span className="text-honey">{e.intensity}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-honey/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-honey" style={{ width: `${e.intensity}%` }} />
                                </div>
                            </div>
                        </BeeYieldCard>
                    ))}
                </div>
            </BeeYieldSection>
        </div>

        <div className="lg:col-span-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Forecast Accuracy" value="94.2%" icon={Target} />
                <StatCard label="Critical Windows" value="3 Sites" icon={AlertTriangle} highlight />
                <StatCard label="Nectar Saturation" value="Low Risk" icon={Droplets} />
             </div>

             <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Temporal Phase Shift</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">2024 Phenological Progression</p>
                    </div>
                    <Calendar className="w-5 h-5 text-honey" />
                </div>
                
                <div className="relative h-48 flex items-center justify-between px-8">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />
                    
                    <TimelineNode label="Dormant" active />
                    <TimelineNode label="Bud Swell" active />
                    <TimelineNode label="Popcorn" active highlight />
                    <TimelineNode label="Bloom" />
                    <TimelineNode label="Petal Fall" />
                </div>
                
                <div className="mt-8 p-6 rounded-2xl bg-muted/20 border border-border">
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold italic">Current cooling curve suggests a 4-day delay in Peak Bloom vs 5-year averages. Recalibrate hive deployment logistics for T+96hr.</p>
                </div>
             </BeeYieldCard>

             <BeeYieldSection title="Ecological Impact Analysis" icon={Layers}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BeeYieldCard className="p-6 border-honey/20 bg-honey/5">
                        <h4 className="text-[10px] font-black text-honey uppercase tracking-widest mb-2">Pollen Bioavailability</h4>
                        <p className="text-xs text-foreground/80 font-bold leading-relaxed">Early stage bloom profile shows high protein content, ideal for colony brood escalation prior to main harvest window.</p>
                    </BeeYieldCard>
                    <BeeYieldCard className="p-6 border-border/50 bg-muted/5">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Weather Sensitivity</h4>
                        <p className="text-xs text-muted-foreground font-bold leading-relaxed">Forecasted frost on Feb 22 poses moderate risk to stigma receptivity. 40% yield attrition possible if unprotected.</p>
                    </BeeYieldCard>
                </div>
             </BeeYieldSection>
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[85vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
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

function StatCard({ label, value, icon: Icon, highlight = false }: any) {
    return (
        <BeeYieldCard className={cn("p-5 border-border/50 bg-muted/10", highlight && "border-red-500/20 bg-red-50")}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("w-3.5 h-3.5", highlight ? "text-red-500" : "text-honey")} />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
            </div>
            <div className={cn("text-2xl font-black", highlight ? "text-red-600" : "text-foreground")}>{value}</div>
        </BeeYieldCard>
    );
}

function TimelineNode({ label, active = false, highlight = false }: any) {
    return (
        <div className="relative z-10 flex flex-col items-center">
            <div className={cn("w-5 h-5 rounded-full border-4 shadow-sm mb-2 transition-all", 
                active ? "bg-honey border-white ring-4 ring-honey/10" : "bg-white border-border"
            )} />
            <span className={cn("text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap", 
                active ? "text-honey" : "text-muted-foreground opacity-50",
                highlight && "ring-4 ring-honey/20 p-1 rounded-lg"
            )}>{label}</span>
        </div>
    );
}
