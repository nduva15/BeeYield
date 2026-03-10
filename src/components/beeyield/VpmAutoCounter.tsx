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
import { glass } from './GlassTheme';

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
        <div className={cn(glass.page, "p-8 -m-8 min-h-screen")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20')}>
                        <Camera className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-[0.1em]">YOLOv11 Nano // Entrance Feed</span>
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        VPM <span className="text-honey">Auto-Counter</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>Real-time Pollen Collection Analysis</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-black/40 border border-border backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-honey/40 transition-all shadow-lg active:scale-95"
                    >
                        {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button className={cn(glass.btnPrimary, "px-8")}>
                        Export Log
                    </button>
                </div>
            </div>

            <div className={cn(glass.card, "flex flex-col lg:flex-row overflow-hidden p-0")}>
                {/* Camera Feed Context */}
                <div className="flex-1 p-10 bg-black/[0.02] dark:bg-white/[0.02] min-h-[500px] relative overflow-hidden group">
                    {/* UI Overlays */}
                    <div className="absolute inset-0 pointer-events-none rounded-[2rem] border-4 border-transparent group-hover:border-honey/20 transition-all duration-500 z-10 m-4" />

                    {/* Feed Info */}
                    <div className="absolute top-10 left-10 z-30 flex flex-col gap-3">
                        <Badge className={cn(glass.badge, "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20")}>LIVE_FEED</Badge>
                        <Badge className={cn(glass.badge, "bg-white/60 dark:bg-black/40 text-foreground border-border backdrop-blur-md")}>FPS: 30.2</Badge>
                    </div>

                    <div className="absolute bottom-10 left-10 z-30">
                        <p className={cn(glass.microLabel, "text-emerald-500 shadow-sm drop-shadow-md")}>Detection Confidence: 99.4%</p>
                    </div>

                    {/* Detection Box Simulation */}
                    <div className="absolute inset-0 bg-transparent rounded-[2.5rem] overflow-hidden">
                        <AnimatePresence>
                            {detections.map((d) => (
                                <motion.div
                                    key={d.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.2 }}
                                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                                    className={cn(
                                        "absolute w-16 h-16 border-[1.5px] rounded-2xl flex flex-col items-center justify-center translate-x-[-50%] translate-y-[-50%] backdrop-blur-[2px] shadow-2xl",
                                        d.hasPollen ? "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20" : "border-honey bg-honey/10 shadow-honey/20"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-sm whitespace-nowrap",
                                        d.hasPollen ? "bg-emerald-500" : "bg-honey"
                                    )}>
                                        {d.hasPollen ? "POLLEN" : "BEE"}
                                    </div>
                                    <Target className={cn(
                                        "w-6 h-6 absolute opacity-50",
                                        d.hasPollen ? "text-emerald-500" : "text-honey"
                                    )} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Center Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none mix-blend-difference dark:mix-blend-screen">
                        <div className="w-32 h-[1px] bg-foreground/50" />
                        <div className="h-32 w-[1px] bg-foreground/50 absolute" />
                        <div className="absolute w-4 h-4 rounded-full border border-foreground/50" />
                    </div>
                </div>

                {/* Data Panel */}
                <div className="w-full lg:w-[450px] p-10 space-y-10 bg-transparent border-t lg:border-t-0 lg:border-l border-border shrink-0">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-honey" />
                            <h3 className={cn(glass.sectionTitle, 'text-3xl normal-case')}>Pollination Pulse</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={cn(glass.card, "p-6 text-center bg-white/40 dark:bg-white/5 border-border hover:shadow-none hover:border-honey/20 transition-all")}>
                                <p className={cn(glass.sectionTitle, "text-4xl tabular-nums leading-none mb-2")}>{vpm.toFixed(1)}</p>
                                <p className={cn(glass.microLabel, "text-muted-foreground opacity-70")}>Visits / Min</p>
                            </div>
                            <div className={cn(glass.card, "p-6 text-center border-none bg-gradient-to-br from-honey to-amber-600 text-white shadow-xl shadow-honey/20")}>
                                <p className={cn(glass.sectionTitle, "text-4xl tabular-nums leading-none mb-2 text-white")}>{pcr.toFixed(0)}%</p>
                                <p className={cn(glass.microLabel, "text-white/80")}>PCR INDEX</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex justify-between items-end">
                            <p className={cn(glass.microLabel, "font-semibold")}>PCR Efficiency</p>
                            <span className={cn(
                                glass.badge,
                                pcr > 60 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-honey/10 text-honey border-honey/20"
                            )}>
                                {pcr > 60 ? "OPTIMAL FLOW" : "COMPETITOR RISK"}
                            </span>
                        </div>
                        <Progress
                            value={pcr}
                            className={cn("h-6 rounded-full bg-muted/50 overflow-hidden", pcr > 60 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-honey")}
                        />
                        <p className={cn(glass.microLabel, "text-muted-foreground opacity-80 leading-relaxed italic normal-case font-medium")}>
                            {pcr > 60
                                ? "Bees are locked on orchard bloom. High efficiency detected."
                                : "Low PCR detected. Bees may be foraging on nearby wildflowers. Consider pheromone attraction."}
                        </p>
                    </section>

                    <Separator className="bg-border" />

                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className={cn(glass.microLabel, "opacity-60 text-lg normal-case")}>Session Cumulative</h4>
                            <History className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-muted/20">
                                <span className={cn(glass.microLabel, "text-muted-foreground")}>Total Detections</span>
                                <span className={cn(glass.sectionTitle, "text-xl tabular-nums leading-none")}>{totalBees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                <span className={cn(glass.microLabel, "text-emerald-500")}>Pollen Carriers</span>
                                <span className={cn(glass.sectionTitle, "text-xl tabular-nums leading-none text-emerald-50")}>{pollenBees.toLocaleString()}</span>
                            </div>
                        </div>
                    </section>

                    {pcr < 50 && (
                        <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                            <div>
                                <h5 className={cn(glass.microLabel, "text-red-500 mb-2")}>Efficiency Alert</h5>
                                <p className={cn(glass.microLabel, "text-red-600/90 dark:text-red-400 normal-case italic font-bold leading-relaxed")}>
                                    Pollination Deficit detected. Actual VPM matches target, but PCR is critical. Validate surrounding forage competition.
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
