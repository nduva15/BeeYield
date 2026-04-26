import { useState, useMemo } from "react";
import { X, Target, MapPin, Search, ChevronRight, Info, AlertTriangle, Layers, Droplets, Radar, Zap, Activity } from "lucide-react";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

type FlightPath = {
  id: string;
  source: string;
  distance: number;
  intensity: "low" | "medium" | "high";
  status: "safe" | "pesticide-risk" | "resource-exhausted";
};

export default function BeeFlightTracker({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const [search, setSearch] = useState("");
  
  const flightPaths: FlightPath[] = [
    { id: "1", source: "Alpha Orchard", distance: 1.2, intensity: "high", status: "safe" },
    { id: "2", source: "Wild Flower Ridge", distance: 3.5, intensity: "medium", status: "pesticide-risk" },
    { id: "3", source: "River Bed Flora", distance: 0.8, intensity: "high", status: "safe" },
    { id: "4", source: "Industrial Edge", distance: 4.2, intensity: "low", status: "resource-exhausted" },
  ];

  const filtered = flightPaths.filter(p => p.source.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Radar}
        label="Science"
        title="Bee Flight Tracker"
        subtitle="Analyzing forager vectoring, flight radius attrition, and floral magnetics."
        onBack={onClose}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-4 space-y-6">
            <BeeYieldSection title="Vector Monitoring" icon={Target}>
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter active vectors..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white text-sm font-bold outline-none focus:border-honey/40 shadow-sm transition-all" />
                </div>
                <div className="space-y-3">
                    {filtered.map((p) => (
                        <BeeYieldCard key={p.id} className="p-4 border-border/60 bg-white hover:border-honey/40 transition-all group cursor-pointer relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{p.source}</h4>
                                <BeeYieldBadge className={cn("text-[8px] font-black uppercase tracking-widest", 
                                    p.status === 'safe' ? "bg-green-50 text-green-600 border-green-100" : p.status === 'pesticide-risk' ? "bg-red-50 text-red-600 border-red-100" : "bg-muted text-muted-foreground"
                                )}>{p.status}</BeeYieldBadge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                <Activity className="w-3 h-3 text-honey" /> {p.distance} km flight radius
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Intensity</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={cn("w-3 h-3 rounded-sm", 
                                            i === 1 ? "bg-honey" : i === 2 && (p.intensity === 'medium' || p.intensity === 'high') ? "bg-honey" : i === 3 && p.intensity === 'high' ? "bg-honey" : "bg-muted-foreground/10"
                                        )} />
                                    ))}
                                </div>
                            </div>
                        </BeeYieldCard>
                    ))}
                </div>
            </BeeYieldSection>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Radar Uptime" value="99.8%" icon={Radar} />
                <StatCard label="Avg Foraging Radius" value="1.4km" icon={Target} />
                <StatCard label="Magnet Score" value="74" icon={Zap} highlight />
             </div>

             <BeeYieldCard className="relative h-[450px] border-border/60 bg-muted/5 overflow-hidden group p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--honey)/0.1)_0%,transparent_70%)] opacity-50" />
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Real-time Vector Map</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">LIDAR-Calibrated Flight Density</p>
                        </div>
                        <BeeYieldBadge className="bg-honey text-white border-0 font-black px-4 py-1.5 rounded-full text-[10px]">LIVE TELEMETRY</BeeYieldBadge>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* Radar Simulation */}
                        <div className="absolute w-80 h-80 rounded-full border border-honey/20 flex items-center justify-center">
                            <div className="absolute w-64 h-64 rounded-full border border-honey/10" />
                            <div className="absolute w-48 h-48 rounded-full border border-honey/5" />
                            <div className="absolute w-full h-[1px] bg-honey/10" />
                            <div className="absolute h-full w-[1px] bg-honey/10" />
                            
                            {/* Scanning Line */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-honey/20 to-transparent animate-spin-slow origin-center" />
                            
                            {/* Blips */}
                            <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-honey rounded-full animate-pulse shadow-lg shadow-honey/50" />
                            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-honey opacity-60 rounded-full animate-bounce shadow-md" />
                            <div className="absolute bottom-1/2 left-2/3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-md" />
                        </div>
                        <Radar className="w-12 h-12 text-honey opacity-20" />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-8 border-t border-border pt-4">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-honey" /> High Density</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Hazard Zone</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Low Reward</span>
                    </div>
                </div>
             </BeeYieldCard>

             <BeeYieldSection title="Attrition Dashboard" icon={Layers}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BeeYieldCard className="p-6 border-border/50 bg-white">
                        <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-4">Flight Distance vs Return Payload</h4>
                        <div className="space-y-4">
                            {[
                                { range: "0-500m", load: 95 },
                                { range: "500m-1.5km", load: 78 },
                                { range: "1.5km-3km", load: 45 },
                                { range: "3km+", load: 12 },
                            ].map(item => (
                                <div key={item.range} className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground">{item.range}</span>
                                        <span className="text-honey">{item.load}% Eff.</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-honey" style={{ width: `${item.load}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BeeYieldCard>
                    
                    <BeeYieldCard className="p-6 border-honey/20 bg-honey/5 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-honey" />
                            <h4 className="text-xs font-black text-honey uppercase tracking-widest">Optimization Insight</h4>
                        </div>
                        <p className="text-xs text-foreground/80 font-bold leading-relaxed italic">Reducing average flight distance by 400m increases net honey accumulation by 14.8% due to lower metabolic fuel consumption for transport.</p>
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
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[90vh] max-w-7xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
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
        <BeeYieldCard className={cn("p-5 border-border/50 bg-muted/10", highlight && "border-honey bg-honey/5")}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-honey" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-black text-foreground">{value}</div>
        </BeeYieldCard>
    );
}
