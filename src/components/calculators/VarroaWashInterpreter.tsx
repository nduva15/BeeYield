import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Flame,
    Zap,
    ShieldCheck,
    Activity,
    Scale,
    ArrowRight,
    Search,
    AlertTriangle,
    Save,
    History,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '../beeyield/GlassTheme';
import { motion } from 'framer-motion';

const VarroaWashInterpreter: React.FC = () => {
    const [miteCount, setMiteCount] = React.useState('4');
    const [sampleSize, setSampleSize] = React.useState('300');

    const infestationRate = (parseInt(miteCount) || 0) / (parseInt(sampleSize) || 1) * 100;
    const isCritical = infestationRate > 3;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card className={cn(glass.card, "bg-white/40 border-[#F4D03F]/10 backdrop-blur-md")}>
                    <CardHeader className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 shadow-sm">
                                <History className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]">Wash Parameters</CardTitle>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Normalize field data for analysis</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={glass.microLabel}>Mite Count (Observed)</label>
                                <Input
                                    type="number"
                                    value={miteCount}
                                    onChange={(e) => setMiteCount(e.target.value)}
                                    className={cn(glass.input, "h-10 text-base font-black")}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={glass.microLabel}>Sample Size (Bees)</label>
                                <Input
                                    type="number"
                                    value={sampleSize}
                                    onChange={(e) => setSampleSize(e.target.value)}
                                    className={cn(glass.input, "h-10 text-base font-black")}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <label className={glass.microLabel}>Seasonal Threshold</label>
                                <span className="text-[10px] font-black text-red-500">LATE SUMMER: 3.0%</span>
                            </div>
                            <div className="h-2 w-full bg-[#1A1A1A]/5 rounded-full relative overflow-hidden border border-[#F4D03F]/10">
                                <div className="absolute top-0 left-0 bottom-0 bg-[#F4D03F] w-[3%]" />
                                <div className="absolute top-0 left-[3%] bottom-0 bg-red-400/20 w-[97%]" />
                                <div className="absolute top-0 left-[3%] w-[1px] h-full bg-[#1A1A1A]/20" />
                            </div>
                        </div>

                        <button className={cn(glass.btnPrimary, "w-full h-10 text-[10px] tracking-[0.2em]")}>
                            <Save className="w-4 h-4" />
                            Serialize to Hive History
                        </button>
                    </CardContent>
                </Card>

                {/* Interpretation Results */}
                <div className="space-y-6">
                    <Card className={cn(
                        glass.card,
                        "flex flex-col items-center justify-center py-10 transition-all duration-500 border-2",
                        isCritical ? "border-red-500/30 bg-red-50/40" : "border-[#1B9157]/30 bg-[#1B9157]/[0.02]"
                    )}>
                        <h4 className={glass.microLabel}>Calculated Infestation</h4>
                        <div className="flex items-end gap-1 my-2">
                            <span className={cn("text-7xl font-black tabular-nums tracking-tighter", isCritical ? "text-red-500" : "text-[#1B9157]")}>
                                {infestationRate.toFixed(1)}
                            </span>
                            <span className="text-2xl font-black mb-2">%</span>
                        </div>
                        <div className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm",
                            isCritical ? "bg-red-500 text-white" : "bg-[#1B9157] text-white"
                        )}>
                            {isCritical ? "ALERT: OVER THRESHOLD" : "SECURE: UNDER THRESHOLD"}
                        </div>
                    </Card>

                    <Card className={cn(glass.card, "bg-[#1A1A1A] text-white border-transparent shadow-xl p-5")}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                <Zap className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#F4D03F]">AI Protocol Suggestion</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse" />
                                    <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">Recommendation Active</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold uppercase leading-relaxed text-gray-300">
                            {isCritical
                                ? "Infestation exceeds late-season economic threshold. Recommend Formic Pro or Oxalic Acid vapor treatment cycle within 48 hours to minimize winter losses."
                                : "Infestation is managed. Continue monitoring at 2-week intervals. No immediate chemical intervention required for this colony."
                            }
                        </p>
                        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Confidence: 99.8%</span>
                            </div>
                            <button className={cn(glass.btnSecondary, "h-8 bg-white border-transparent text-[#1A1A1A] hover:bg-gray-100 px-4 text-[9px] font-black tracking-widest")}>
                                Order Kit
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VarroaWashInterpreter;

