import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Camera,
    Zap,
    Activity,
    AlertTriangle,
    Target,
    Maximize2,
    Settings,
    Play,
    Pause,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const VpmAutoCounter: React.FC = () => {
    const [isActive, setIsActive] = useState(true);
    const [detections, setDetections] = useState<any[]>([]);
    const [vpm, setVpm] = useState(14.2);
    const [pcr, setPcr] = useState(68); // Pollen Collection Rate (%)
    const [totalBees, setTotalBees] = useState(1284);
    const [pollenBees, setPollenBees] = useState(873);

    // Simulate real-time detections
    useEffect(() => {
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
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
            <CardHeader className="border-b-4 border-[#064e3b] bg-white p-10">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                            <Camera className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">YOLOv11 Nano // Entrance Feed</span>
                        </div>
                        <CardTitle className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                            VPM <span className="text-[#10b981]">Auto-Counter</span>
                        </CardTitle>
                        <p className="text-[10px] font-bold text-[#064e3b]/40 uppercase tracking-[0.4em]">Real-time Pollen Collection Analysis</p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsActive(!isActive)}
                            className="h-16 w-16 rounded-none border-4 border-[#064e3b] bg-white shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] active:shadow-none translate-y-0 active:translate-y-1 active:translate-x-1"
                        >
                            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-16 px-8 rounded-none border-4 border-[#064e3b] bg-[#facc15] text-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]"
                        >
                            Export Log
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[#064e3b]">
                {/* Camera Feed Context */}
                <div className="flex-1 p-10 bg-neutral-50 min-h-[500px] relative overflow-hidden group">
                    {/* UI Overlays */}
                    <div className="absolute inset-0 pointer-events-none border-8 border-transparent group-hover:border-[#10b981]/10 transition-colors z-10" />

                    {/* Corners */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-[#064e3b] z-20" />
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-[#064e3b] z-20" />
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-[#064e3b] z-20" />
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-[#064e3b] z-20" />

                    {/* Feed Info */}
                    <div className="absolute top-10 left-10 z-30 flex flex-col gap-2">
                        <Badge className="rounded-none border-2 border-[#10b981] bg-[#064e3b] text-white font-black px-3 py-1 text-[9px] tracking-widest">LIVE_FEED</Badge>
                        <Badge className="rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] font-black px-3 py-1 text-[9px] tracking-widest">FPS: 30.2</Badge>
                    </div>

                    <div className="absolute bottom-10 left-10 z-30">
                        <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">Detection Confidence: 99.4%</p>
                    </div>

                    {/* Detection Box Simulation */}
                    <div className="absolute inset-0 bg-[#064e3b]/5">
                        <AnimatePresence>
                            {detections.map((d) => (
                                <motion.div
                                    key={d.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.2 }}
                                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                                    className={cn(
                                        "absolute w-16 h-16 border-2 flex flex-col items-center justify-center translate-x-[-50%] translate-y-[-50%]",
                                        d.hasPollen ? "border-[#10b981]" : "border-[#facc15]"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute -top-6 left-0 px-1 text-[8px] font-black uppercase text-white",
                                        d.hasPollen ? "bg-[#10b981]" : "bg-[#facc15]"
                                    )}>
                                        {d.hasPollen ? "POLLEN" : "BEE"}
                                    </div>
                                    <Target className={cn(
                                        "w-6 h-6",
                                        d.hasPollen ? "text-[#10b981]" : "text-[#facc15]"
                                    )} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Center Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-32 h-[1px] bg-[#064e3b]" />
                        <div className="h-32 w-[1px] bg-[#064e3b]" />
                        <div className="absolute w-4 h-4 rounded-full border border-[#064e3b]" />
                    </div>
                </div>

                {/* Data Panel */}
                <div className="w-full lg:w-[450px] p-10 space-y-10 bg-white shrink-0">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                            <Activity className="w-6 h-6 text-[#064e3b]" />
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Pollination Pulse</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-4 border-[#064e3b] p-6 bg-neutral-50 text-center">
                                <p className="text-4xl font-black text-[#064e3b]">{vpm.toFixed(1)}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visits / Min</p>
                            </div>
                            <div className="border-4 border-[#064e3b] p-6 bg-[#064e3b] text-white text-center">
                                <p className="text-4xl font-black text-[#facc15]">{pcr.toFixed(0)}%</p>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">PCR INDEX</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex justify-between items-end">
                            <p className="text-xs font-black uppercase tracking-widest">PCR Efficiency</p>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2",
                                pcr > 60 ? "bg-[#10b981] text-white border-[#10b981]" : "bg-[#facc15] text-[#064e3b] border-[#facc15]"
                            )}>
                                {pcr > 60 ? "OPTIMAL_FLOW" : "COMPETITOR_RISK"}
                            </span>
                        </div>
                        <Progress
                            value={pcr}
                            className="h-6 rounded-none border-4 border-[#064e3b] bg-neutral-100 [&>div]:bg-[#10b981]"
                        />
                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-snug">
                            {pcr > 60
                                ? "Bees are locked on orchard bloom. High efficiency detected."
                                : "Low PCR detected. Bees may be foraging on nearby wildflowers. Consider pheromone attraction."}
                        </p>
                    </section>

                    <Separator className="bg-[#064e3b]/10 h-1" />

                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black uppercase tracking-tighter">Session Cumulative</h4>
                            <History className="w-5 h-5 text-[#064e3b]/30" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 border-2 border-[#064e3b] bg-neutral-50">
                                <span className="text-[10px] font-black uppercase">Total Detections</span>
                                <span className="text-lg font-black">{totalBees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 border-2 border-[#10b981] bg-green-50">
                                <span className="text-[10px] font-black uppercase text-[#10b981]">Pollen Carriers</span>
                                <span className="text-lg font-black text-[#10b981]">{pollenBees.toLocaleString()}</span>
                            </div>
                        </div>
                    </section>

                    {pcr < 50 && (
                        <div className="p-6 border-4 border-red-500 bg-red-50 flex items-start gap-4 animate-bounce">
                            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Efficiency Alert</h5>
                                <p className="text-[9px] font-bold text-red-700 uppercase leading-snug">
                                    Pollination Deficit detected. Actual VPM matches target, but PCR is critical. Validate surrounding forage competition.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default VpmAutoCounter;
