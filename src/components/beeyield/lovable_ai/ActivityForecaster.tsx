import { useState, useMemo } from "react";
import { X, TrendingUp, Sparkles, Loader2, Info, Calendar, BarChart3, CloudRain, Sun, Wind } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ActivityForecaster({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const [temp, setTemp] = useState(24);
  const [wind, setWind] = useState(12);
  const [precip, setPrecip] = useState(0);
  const [bloomIntensity, setBloomIntensity] = useState(70);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const forecast = useMemo(() => {
    return DAYS.map((day, idx) => {
      const tempFactor = Math.max(0, 1 - Math.abs(temp - 25) / 20);
      const windFactor = Math.max(0, 1 - wind / 40);
      const rainFactor = Math.max(0, 1 - precip / 10);
      const bloomFactor = bloomIntensity / 100;
      
      const v = 80 * tempFactor * windFactor * rainFactor * bloomFactor;
      const variation = 1 + (Math.sin(idx * 1.5) * 0.15);
      return { day, score: Math.round(v * variation) };
    });
  }, [temp, wind, precip, bloomIntensity]);

  const runAI = async () => {
    setLoading(true); setAiText("");
    try {
      const prompt = `As Beeyield AI, forecast forager activity based on:\n- Temp: ${temp}°C\n- Wind: ${wind} km/h\n- Precip: ${precip}mm\n- Bloom: ${bloomIntensity}%\n\nProvide a 7-day outlook, explain the weather-flight tradeoffs, and suggest hive movement or forager-day contract timing.`;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI error"); setLoading(false); return; }
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { acc += c; setAiText(acc); } } catch {}
          }
        }
      }
    } catch { toast.error("Inference failed"); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={TrendingUp}
        label="Analytics"
        title="Activity Forecaster"
        subtitle="Climate-driven flight simulation and forager-day projections."
        onBack={onClose}
        actions={
          <button onClick={runAI} disabled={loading} className="px-4 py-2 rounded-xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Neural Outlook
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-5 space-y-6">
          <BeeYieldSection title="Environmental Drivers" icon={Sun}>
             <div className="space-y-6">
                <Slider label="Ambient Temp" icon={Sun} value={temp} unit="°C" min={10} max={45} onChange={setTemp} />
                <Slider label="Wind Velocity" icon={Wind} value={wind} unit=" km/h" min={0} max={50} onChange={setWind} />
                <Slider label="Precipitation" icon={CloudRain} value={precip} unit="mm" min={0} max={30} onChange={setPrecip} />
                <Slider label="Bloom Load" icon={Sparkles} value={bloomIntensity} unit="%" min={0} max={100} onChange={setBloomIntensity} />
             </div>
          </BeeYieldSection>

          <BeeYieldCard className="p-6 border-border/50 bg-muted/10">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Modeling Logic
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">
                  Flight efficiency drops geometrically above 35°C or in winds exceeding 20km/h. Bloom load interacts with temperature to determine the 'Foraging Magnetism' score.
              </p>
          </BeeYieldCard>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <BeeYieldCard className="p-6 border-border/60 bg-white shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">7-Day Activity Projection</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Standardized Forager-Performance Units (FPU)</p>
                </div>
                <BarChart3 className="w-5 h-5 text-honey" />
             </div>
             <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} fontWeight="900" />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} fontWeight="900" />
                        <Tooltip cursor={{ fill: 'hsl(var(--honey)/0.05)' }} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 10, borderRadius: 12 }} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                            {forecast.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score > 50 ? 'hsl(var(--honey))' : 'hsl(var(--muted-foreground))'} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </BeeYieldCard>

          {aiText || loading ? (
              <BeeYieldCard className="p-8 border-honey/30 bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center gap-2 mb-4 border-b border-honey/10 pb-4">
                        <Sparkles className="w-4 h-4 text-honey" />
                        <h3 className="text-xs font-black text-honey uppercase tracking-widest">Neural Flight Analysis</h3>
                   </div>
                   {loading && !aiText ? (
                       <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-honey mb-4" />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Scanning Satellite Weather...</p>
                       </div>
                   ) : (
                       <div className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-honey">
                            <MarkdownRenderer content={aiText} />
                       </div>
                   )}
              </BeeYieldCard>
          ) : (
            <BeeYieldCard className="p-8 border-border/40 bg-muted/5 text-center flex flex-col items-center">
                 <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-honey" />
                 </div>
                 <p className="text-xs font-bold text-muted-foreground max-w-[280px]">Run the AI Outlook to get climate-specific hive deployment and contract timing recommendations.</p>
            </BeeYieldCard>
          )}
        </div>
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

function Slider({ label, icon: Icon, value, unit, min, max, onChange }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                </div>
                <span className="text-honey">{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} className="w-full h-1.5 bg-honey/10 rounded-full appearance-none cursor-pointer accent-honey" />
        </div>
    );
}
