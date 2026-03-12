import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Camera, Zap, Activity, AlertTriangle, Target, Maximize2, Settings, Play, Pause, History
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';

const VpmAutoCounter: React.FC = () => {
    const [isActive, setIsActive] = React.useState(true);
    const [detections, setDetections] = React.useState<any[]>([]);
    const [vpm, setVpm] = React.useState(14.2);
    const [pcr, setPcr] = React.useState(68); // Pollen Collection Rate (%)
    const [totalBees, setTotalBees] = React.useState(1284);
    const [pollenBees, setPollenBees] = React.useState(873);

    // Simulate real-time detections
    React.useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            const newDetection = {
                id: Math.random(),
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                hasPollen: Math.random() > 0.3,
                timestamp: Date.now()
            };

            setDetections(prev => [...prev.slice(-10), newDetection]);
            setTotalBees(prev => prev + 1);
            if (newDetection.hasPollen) {
                setPollenBees(prev => prev + 1);
            }

            // Fluctuating VPM
            setVpm(prev => Math.max(8, Math.min(22, prev + (Math.random() - 0.5) * 0.5)));

            // Slowly update PCR based on recent window
            setPcr(prev => Math.max(30, Math.min(95, prev + (newDetection.hasPollen ? 0.2 : -0.5))));

        }, 800);

        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div className={cn(glass.page, "space-y-8 pb-24")}>
            <PageHeader
                icon={Camera}
                label="YOLOv11 Nano // Entrance Feed"
                title={<>VPM <span className="text-[#F4D03F]">Auto-Counter</span></>}
                subtitle="Real-time Pollen Collection Analysis."
                actions={
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="w-12 h-12 rounded-xl bg-white/50 border border-border backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#F4D03F]/40 transition-all shadow-sm active:scale-95"
                        >
                            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button className={cn(glass.btnPrimary, "px-6 h-12 rounded-xl text-xs uppercase tracking-widest")}>
                            Export Log
                        </button>
                    </div>
                }
            />

            <div className={cn(glass.card, "flex flex-col lg:flex-row overflow-hidden p-0 rounded-3xl shadow-sm border-[#F4D03F]/10")}>
                {/* Camera Feed Context */}
                <div className="flex-1 p-6 bg-[#F9F7F2] min-h-[450px] relative overflow-hidden group">
                    {/* UI Overlays */}
                    <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent group-hover:border-[#F4D03F]/20 transition-all duration-500 z-10 m-2" />

                    {/* Feed Info */}
                    <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                        <Badge className={cn(glass.badge, "bg-emerald-500 text-white border-none shadow-sm")}>LIVE</Badge>
                        <Badge className={cn(glass.badge, "bg-white/60 text-foreground border-border backdrop-blur-md py-0.5 text-[8px]")}>FPS: 30.2</Badge>
                    </div>

                    <div className="absolute bottom-6 left-6 z-30">
                        <p className={cn(glass.microLabel, "text-emerald-600 font-black text-[8px]")}>Confidence: 99.4%</p>
                    </div>

                    {/* Detection Box Simulation */}
                    <div className="absolute inset-0 bg-transparent rounded-2xl overflow-hidden">
                        <AnimatePresence>
                            {detections.map((d) => (
                                <motion.div
                                    key={d.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.2 }}
                                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                                    className={cn(
                                        "absolute w-12 h-12 border-[1.5px] rounded-xl flex flex-col items-center justify-center translate-x-[-50%] translate-y-[-50%] backdrop-blur-[1px]",
                                        d.hasPollen ? "border-emerald-500 bg-emerald-500/10" : "border-[#F4D03F] bg-[#F4D03F]/10"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase text-[#1A1A1A] shadow-sm whitespace-nowrap",
                                        d.hasPollen ? "bg-emerald-500" : "bg-[#F4D03F]"
                                    )}>
                                        {d.hasPollen ? "POLLEN" : "BEE"}
                                    </div>
                                    <Target className={cn(
                                        "w-4 h-4 absolute opacity-50",
                                        d.hasPollen ? "text-emerald-500" : "text-[#F4D03F]"
                                    )} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Center Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none mix-blend-difference">
                        <div className="w-32 h-[1px] bg-foreground/50" />
                        <div className="h-32 w-[1px] bg-foreground/50 absolute" />
                        <div className="absolute w-4 h-4 rounded-full border border-foreground/50" />
                    </div>
                </div>

                {/* Data Panel */}
                <div className="w-full lg:w-[400px] p-8 space-y-8 bg-white/30 border-t lg:border-t-0 lg:border-l border-border shrink-0">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-[#F4D03F]" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Pollination Pulse</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={cn(glass.card, "p-4 text-center bg-white/50 border-border shadow-sm")}>
                                <p className="text-2xl font-black tabular-nums leading-none mb-1">{vpm.toFixed(1)}</p>
                                <p className="text-[10px] font-bold uppercase opacity-40">Visits / Min</p>
                            </div>
                            <div className={cn(glass.card, "p-4 text-center border-none bg-emerald-500 text-white shadow-sm")}>
                                <p className="text-2xl font-black tabular-nums leading-none mb-1">{pcr.toFixed(0)}%</p>
                                <p className="text-[10px] font-bold uppercase opacity-80">PCR INDEX</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Capture Efficiency</p>
                            <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                                pcr > 60 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20"
                            )}>
                                {pcr > 60 ? "OPTIMAL FLOW" : "LOW PCR"}
                            </span>
                        </div>
                        <Progress
                            value={pcr}
                            className={cn("h-2 rounded-full bg-black/5 overflow-hidden", pcr > 60 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-[#F4D03F]")}
                        />
                        <p className="text-[10px] font-bold text-muted-foreground opacity-80 leading-relaxed uppercase tracking-tight">
                            {pcr > 60
                                ? "Bees are locked on orchard bloom. High efficiency detected."
                                : "Low PCR detected. Bees may be foraging on competitive flora."}
                        </p>
                    </section>

                    <Separator className="bg-border" />

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Cumulative Feed</h4>
                            <History className="w-4 h-4 text-muted-foreground/20" />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-black/5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Bees</span>
                                <span className="text-lg font-black tabular-nums">{totalBees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Pollen Load</span>
                                <span className="text-lg font-black tabular-nums text-emerald-600">{pollenBees.toLocaleString()}</span>
                            </div>
                        </div>
                    </section>

                    {pcr < 50 && (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Efficiency Risk</h5>
                                <p className="text-[10px] font-bold text-red-600/80 leading-relaxed uppercase tracking-tight">
                                    Low PCR index detected. Check for weed bloom competition.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VpmAutoCounter;
