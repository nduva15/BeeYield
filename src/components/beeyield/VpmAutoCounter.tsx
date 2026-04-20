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
import { BeeYieldPageHeader, BeeYieldPageShell } from './BeeYieldUI';

const VpmAutoCounter: React.FC = () => {
    const [isActive, setIsActive] = React.useState(false);

    return (
        <BeeYieldPageShell className="space-y-8 pb-24">
            <BeeYieldPageHeader
                icon={Camera}
                label="Entrance monitor"
                title={<>Activity <span className="text-[#F4D03F]">Counter</span></>}
                subtitle="Shows live activity near the hive entrance and exit."
                actions={
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="w-12 h-12 rounded-xl bg-muted/ border border-border backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/ transition-all shadow-sm active:scale-95"
                        >
                            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button className={cn(glass.btnPrimary, "px-6 h-12 rounded-xl text-xs")}>
                            Export Log
                        </button>
                    </div>
                }
            />

            <div className={cn(glass.card, "flex flex-col lg:flex-row overflow-hidden p-0 rounded-3xl shadow-sm border-border/")}>
                {/* Camera Feed Context */}
                <div className="flex-1 p-6 bg-muted/20 min-h-[450px] relative overflow-hidden group">
                    {/* UI Overlays */}
                    <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent group-hover:border-border/ transition-all duration-500 z-10 m-2" />

                    {/* Feed Info */}
                    <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                        <Badge className={cn(glass.badge, "bg-emerald-500 text-white border-none shadow-sm")}>Live</Badge>
                        <Badge className={cn(glass.badge, "bg-muted/ text-foreground border-border backdrop-blur-md py-0.5 text-[8px]")}>Signal: Stable</Badge>
                    </div>

                    <div className="absolute bottom-6 left-6 z-30">
                        <p className={cn(glass.microLabel, "text-emerald-600 font-black text-[8px]")}>Accuracy: 99.4%</p>
                    </div>

                    {/* Detection Box Simulation */}
                    <div className="absolute inset-0 bg-transparent rounded-2xl overflow-hidden">
                        <AnimatePresence>
                            {isActive ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center p-10"
                                >
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-black tracking-tight">Waiting for sensor feed…</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">
                                            Connect your equipment to see live activity
                                        </p>
                                    </div>
                                </motion.div>
                            ) : null}
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
                <div className="w-full lg:w-[400px] p-8 space-y-8 bg-muted/ border-t lg:border-t-0 lg:border-l border-border shrink-0">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-[#F4D03F]" />
                            <h3 className="text-xl font-black tracking-tight">Activity Status</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={cn(glass.card, "p-4 text-center bg-muted/ border-border shadow-sm")}>
                                <p className="text-2xl font-black tabular-nums leading-none mb-1">—</p>
                                <p className="text-[10px] font-bold opacity-40">Visits / Min</p>
                            </div>
                            <div className={cn(glass.card, "p-4 text-center border-none bg-emerald-500 text-white shadow-sm")}>
                                <p className="text-2xl font-black tabular-nums leading-none mb-1">—</p>
                                <p className="text-[10px] font-bold opacity-80">Activity score</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black opacity-40">Capture Efficiency</p>
                            <span className={cn(
                                "text-[8px] font-black px-2 py-0.5 rounded-full border",
                                "bg-[#F4D03F]/10 text-[#F4D03F] border-border/"
                            )}>
                                NO DATA
                            </span>
                        </div>
                        <Progress
                            value={0}
                            className={cn("h-2 rounded-full bg-black/5 overflow-hidden", "[&>div]:bg-[#F4D03F]")}
                        />
                        <p className="text-[10px] font-bold text-muted-foreground opacity-80 leading-relaxed tracking-tight">
                            Updates will appear here once your sensor data begins synchronized.
                        </p>
                    </section>

                    <Separator className="bg-border" />

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black opacity-40">Cumulative Feed</h4>
                            <History className="w-4 h-4 text-muted-foreground/20" />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-black/5">
                                <span className="text-[10px] font-bold text-muted-foreground">Total Bees</span>
                                <span className="text-lg font-black tabular-nums">—</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                                <span className="text-[10px] font-bold text-emerald-600">Pollen Load</span>
                                <span className="text-lg font-black tabular-nums text-emerald-600">—</span>
                            </div>
                        </div>
                    </section>

                    <div className="p-4 rounded-xl border border-border/ bg-[#F4D03F]/5 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-[#F4D03F] shrink-0 mt-0.5" />
                        <div>
                            <h5 className="text-[10px] font-black text-foreground mb-1">Equipment disconnected</h5>
                            <p className="text-[10px] font-bold text-foreground/70 leading-relaxed tracking-tight">
                                This view shows activity from live sensor feeds. Please connect your equipment to see real-time results.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </BeeYieldPageShell>
    );
};

export default VpmAutoCounter;

