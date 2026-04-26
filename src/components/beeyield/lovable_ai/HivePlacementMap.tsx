import { useState, useEffect, useCallback } from "react";
import { X, MapPin, Plus, Trash2, Crosshair, Map as MapIcon, Layers, Settings, Save, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

type HivePoint = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  status: "active" | "planned" | "needs-attention";
  hhi: number;
  created_at: string;
};

export default function HivePlacementMap({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [points, setPoints] = useState<HivePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<HivePoint | null>(null);
  const [mapType, setMapType] = useState<"satellite" | "streets">("satellite");
  const [showNew, setShowNew] = useState(false);
  
  const [draft, setDraft] = useState<Partial<HivePoint>>({
    label: "Hive Site A",
    status: "planned",
    hhi: 80,
    lat: -2.4078,
    lng: 37.9658
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("hive_placements").select("*").eq("device_id", deviceId).order("created_at", { ascending: false });
    if (data) setPoints(data as HivePoint[]);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const savePoint = async () => {
    const { error } = await supabase.from("hive_placements").insert({ ...draft, device_id: deviceId });
    if (error) { toast.error(error.message); return; }
    toast.success("Site mapped");
    setShowNew(false); load();
  };

  const deletePoint = async (id: string) => {
    await supabase.from("hive_placements").delete().eq("id", id);
    if (selectedPoint?.id === id) setSelectedPoint(null);
    load();
  };

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={MapIcon}
        label="Geospatial"
        title="Hive Placement Map"
        subtitle="Precision coordinates and health metrics across the forage matrix."
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setMapType(mapType === "satellite" ? "streets" : "satellite")} className="px-3 py-1.5 rounded-xl border border-border bg-white text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all">
                <Layers className="w-3.5 h-3.5" /> {mapType}
            </button>
            <button onClick={() => setShowNew(true)} className="px-3 py-1.5 rounded-xl bg-honey text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
              <Plus className="w-3.5 h-3.5" /> Add Site
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
            <BeeYieldCard className="relative h-[600px] border-border/60 bg-muted/5 overflow-hidden group">
                 {/* Mock Map Background */}
                 <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                    <div className="text-center opacity-20 pointer-events-none">
                        <MapIcon className="w-24 h-24 mx-auto mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">Map Satellite Load...</p>
                    </div>
                 </div>
                 
                 {/* Points on Mock Map */}
                 {points.map((p) => (
                    <button 
                        key={p.id}
                        onClick={() => setSelectedPoint(p)}
                        className={cn("absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-xl transition-transform hover:scale-125 z-10", 
                            p.status === 'active' ? "bg-green-500" : p.status === 'needs-attention' ? "bg-red-500" : "bg-honey"
                        )}
                        style={{ 
                            left: `${50 + (p.lng - draft.lng!) * 1000}%`, 
                            top: `${50 - (p.lat - draft.lat!) * 1000}%` 
                        }}
                    >
                        <MapPin className="w-3 h-3 text-white m-auto" />
                    </button>
                 ))}

                 {/* Map Overlays */}
                 <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <button className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-white transition-all"><Crosshair className="w-5 h-5" /></button>
                 </div>

                 {showNew && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <BeeYieldCard className="w-full max-w-md border-honey/40 bg-white animate-in zoom-in-95 duration-200">
                             <h4 className="text-sm font-black text-honey uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> New Placement Site
                             </h4>
                             <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Site Label</label>
                                    <input value={draft.label} onChange={(e) => setDraft({...draft, label: e.target.value})} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lat</label>
                                    <input type="number" step="0.0001" value={draft.lat} onChange={(e) => setDraft({...draft, lat: +e.target.value})} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lng</label>
                                    <input type="number" step="0.0001" value={draft.lng} onChange={(e) => setDraft({...draft, lng: +e.target.value})} className={inputCls} />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deployment Status</label>
                                    <select value={draft.status} onChange={(e) => setDraft({...draft, status: e.target.value as any})} className={inputCls}>
                                        <option value="planned">Planned</option>
                                        <option value="active">Active</option>
                                        <option value="needs-attention">Needs Attention</option>
                                    </select>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <button onClick={savePoint} className="px-6 py-3 rounded-2xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex-1 shadow-md hover:opacity-90 transition-all">Mark Location</button>
                                <button onClick={() => setShowNew(false)} className="px-6 py-3 rounded-2xl bg-white text-muted-foreground text-[11px] font-black uppercase tracking-widest border border-border hover:bg-muted transition-all">Cancel</button>
                             </div>
                        </BeeYieldCard>
                    </div>
                 )}
            </BeeYieldCard>

            <BeeYieldCard className="p-6 border-border/50 bg-muted/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-honey/10 text-honey flex items-center justify-center border border-honey/20">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Spatial Coverage Analysis</h4>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">{(points.length * 4.2).toFixed(1)} hectares within foraging radius based on {points.length} sites.</p>
                        </div>
                    </div>
                </div>
            </BeeYieldCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <BeeYieldSection title="Site Inventory" icon={Settings}>
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scroll pr-2">
                    {points.map((p) => (
                        <BeeYieldCard 
                            key={p.id} 
                            className={cn("p-4 border-border/60 bg-white hover:border-honey/40 transition-all group flex items-start justify-between", selectedPoint?.id === p.id && "border-honey bg-honey/5 shadow-md shadow-honey/10")}
                            onClick={() => setSelectedPoint(p)}
                        >
                            <div className="min-w-0 cursor-pointer">
                                <h4 className="text-xs font-black text-foreground uppercase truncate tracking-tight">{p.label}</h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className={cn("w-2 h-2 rounded-full", p.status === 'active' ? "bg-green-500" : p.status === 'needs-attention' ? "bg-red-500" : "bg-honey")} />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{p.status}</span>
                                </div>
                                <div className="text-[9px] text-muted-foreground font-bold mt-2 uppercase tabular-nums">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deletePoint(p.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </BeeYieldCard>
                    ))}
                    {points.length === 0 && <p className="py-12 text-center text-xs text-muted-foreground italic border-2 border-dashed border-border rounded-2xl">No mapped placements yet.</p>}
                </div>
            </BeeYieldSection>

            {selectedPoint && (
                <BeeYieldCard className="p-6 border-honey/30 bg-card animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-honey/10 pb-4">
                        <h4 className="text-xs font-black text-honey uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4" /> Site Intel</h4>
                        <button onClick={() => setSelectedPoint(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Label</span>
                            <span className="text-foreground">{selectedPoint.label}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Coordinates</span>
                            <span className="text-foreground">{selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">HHI Score</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-honey/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-honey" style={{ width: `${selectedPoint.hhi}%` }} />
                                </div>
                                <span className="text-honey">{selectedPoint.hhi}%</span>
                            </div>
                        </div>
                        <button className="w-full py-2.5 rounded-xl border border-honey/20 bg-honey text-white text-[10px] font-black uppercase tracking-widest shadow-md hover:opacity-90 transition-all mt-2">View Detail Profile</button>
                    </div>
                </BeeYieldCard>
            )}
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

const inputCls = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-honey/40 transition-all shadow-sm";
