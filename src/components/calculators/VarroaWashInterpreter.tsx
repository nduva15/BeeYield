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
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VarroaWashInterpreter: React.FC = () => {
    const [miteCount, setMiteCount] = React.useState('4');
    const [sampleSize, setSampleSize] = React.useState('300');

    const infestationRate = (parseInt(miteCount) / parseInt(sampleSize)) * 100;
    const isCritical = infestationRate > 3;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Flame className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Varroa Diagnostic Module</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Mite <span className="text-[#10b981]">Interpretation</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-sm uppercase tracking-widest mt-2 px-1">
                        Wash Matrix · Seasonal Thresholds · Treatment Recommendation Engine
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 px-8 rounded-none border-4 border-[#064e3b] font-black uppercase tracking-widest text-xs">
                        <History className="w-4 h-4 mr-2" />
                        Treatment History
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Form */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                    <CardHeader className="p-10 border-b-4 border-[#064e3b]/5 bg-neutral-50/30">
                        <CardTitle className="text-3xl font-black text-[#064e3b] uppercase tracking-tighter italic">Wash Parameters</CardTitle>
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/30">Input raw field data for mathematical normalization</p>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-[#064e3b]/60 tracking-widest">Mite Count (Observed)</label>
                                <Input
                                    type="number"
                                    value={miteCount}
                                    onChange={(e) => setMiteCount(e.target.value)}
                                    className="h-16 rounded-none border-4 border-[#064e3b] text-xl font-black focus-visible:ring-0 focus-visible:bg-[#facc15]/10"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-[#064e3b]/60 tracking-widest">Sample Size (Bees)</label>
                                <Input
                                    type="number"
                                    value={sampleSize}
                                    onChange={(e) => setSampleSize(e.target.value)}
                                    className="h-16 rounded-none border-4 border-[#064e3b] text-xl font-black focus-visible:ring-0 focus-visible:bg-[#facc15]/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <label className="text-[10px] font-black uppercase text-[#064e3b]/60 tracking-widest">Current Season Threshold (Late Summer)</label>
                            <div className="h-4 w-full bg-neutral-100 border-2 border-[#064e3b] relative">
                                <div className="absolute top-0 left-0 bottom-0 bg-[#facc15] w-[3%]" />
                                <div className="absolute top-0 left-[3%] bottom-0 bg-red-500 w-[97%]" />
                                <div className="absolute top-[-8px] left-[3%] w-1 h-8 bg-[#064e3b]" />
                                <span className="absolute top-[-24px] left-[3%] translate-x-[-50%] text-[8px] font-black uppercase">T: 3.0%</span>
                            </div>
                        </div>

                        <Button className="w-full h-16 rounded-none bg-[#064e3b] text-white font-black uppercase tracking-[0.2em] text-xs shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] hover:translate-y-1 hover:shadow-none transition-all">
                            <Save className="w-4 h-4 mr-2" />
                            Serialize to Hive History
                        </Button>
                    </CardContent>
                </Card>

                {/* Interpretation Results */}
                <div className="space-y-8">
                    <Card className={cn(
                        "rounded-none border-4 shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] flex flex-col items-center justify-center py-16 transition-colors",
                        isCritical ? "border-red-500 bg-red-50" : "border-[#10b981] bg-[#10b981]/5"
                    )}>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Calculated Infestation</h4>
                        <div className="flex items-end gap-1">
                            <span className={cn("text-8xl font-black italic tracking-tighter", isCritical ? "text-red-500" : "text-[#10b981]")}>
                                {infestationRate.toFixed(1)}
                            </span>
                            <span className="text-4xl font-black mb-3">%</span>
                        </div>
                        <Badge className={cn(
                            "mt-6 rounded-none px-6 py-2 text-xs font-black uppercase italic tracking-widest",
                            isCritical ? "bg-red-500 text-white" : "bg-[#10b981] text-white"
                        )}>
                            {isCritical ? "ABOVE THRESHOLD" : "UNDER THRESHOLD"}
                        </Badge>
                    </Card>

                    <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] text-white p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Zap className="w-8 h-8 text-[#facc15]" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">AI Protocol Suggestion</h3>
                        </div>
                        <p className="text-sm font-bold uppercase leading-relaxed text-white/60">
                            {isCritical
                                ? "Infestation exceeds late-season economic threshold. Recommend Formic Pro or Oxalic Acid vapor treatment cycle within 48 hours to minimize winter losses."
                                : "Infestation is managed. Continue monitoring at 2-week intervals. No immediate chemical intervention required for this colony."
                            }
                        </p>
                        <div className="mt-8 pt-8 border-t-2 border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                                <span className="text-[10px] font-black uppercase">Confidence Score: 0.99</span>
                            </div>
                            <Button variant="outline" className="rounded-none border-2 border-white text-white hover:bg-white hover:text-[#064e3b] font-black uppercase text-[10px] px-6">
                                Order Treatment Kit
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VarroaWashInterpreter;
