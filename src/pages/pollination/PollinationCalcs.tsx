import React, { useState, useMemo } from 'react';
import {
    Calculator,
    Plus,
    Minus,
    AlertTriangle,
    CheckCircle2,
    Zap,
    ShieldCheck,
    Flower2,
    Activity,
    Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculatePollinationMetrics, CalculationInputs } from '@/lib/pollinationCalculations';
import { BeeYieldPageShell, BeeYieldPageHeader } from '@/components/beeyield/BeeYieldUI';
import { glass } from '@/components/beeyield/GlassTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NumberField = ({ label, value, min, max, step = 1, suffix, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; suffix?: string; onChange: (value: number) => void }) => (
    <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">{label}</span>
        <div className={cn(glass.input, "px-4 py-3 border-transparent bg-white/50")}>
            <div className="flex items-center justify-between gap-3">
                <input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="w-full bg-transparent text-lg font-black text-[#1A1A1A] outline-none" />
                {suffix && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{suffix}</span>}
            </div>
        </div>
    </label>
);

const RangeField = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
    <label className="space-y-3">
        <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">{label}</span>
            <span className="text-[10px] font-black text-[#1B9157]">{Math.round(value * 100)}%</span>
        </div>
        <input type="range" min="0.1" max="1" step="0.05" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#1B9157]" />
    </label>
);

const PollinationCalcs: React.FC = () => {
    // Calc Engine State
    const [calcInputs, setCalcInputs] = useState<CalculationInputs>({
        totalAcres: 50,
        targetFpa: 10,
        hives: Array(10).fill(null).map((_, i) => ({
            frameCount: 8,
            isStrong: i % 3 !== 0,
            isLarge: i % 2 === 0
        })),
        forageCondition: 0.8,
        bloomIntensity: 0.9,
        weatherRisk: 0.2
    });

    const metrics = useMemo(() => calculatePollinationMetrics(calcInputs), [calcInputs]);

    return (
        <BeeYieldPageShell className="space-y-6">
            <BeeYieldPageHeader
                icon={Calculator}
                label="Pollination Calcs"
                title={<>Precision <span className="text-primary">Yield Engine</span></>}
                subtitle="v2.4.0 • Dynamics & Forecast"
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Parameters Panel */}
                <Card className={cn(glass.card, 'xl:col-span-5 bg-white/50 border-primary/10')}>
                    <CardHeader className="border-b border-white/20">
                        <CardTitle className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-primary" />
                            Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <NumberField 
                                label="Total Area" 
                                value={calcInputs.totalAcres} 
                                min={1} 
                                step={5} 
                                suffix="ac" 
                                onChange={(val) => setCalcInputs(prev => ({ ...prev, totalAcres: val }))} 
                            />
                            <NumberField 
                                label="Target FPA" 
                                value={calcInputs.targetFpa} 
                                min={4} 
                                max={16} 
                                step={1} 
                                suffix="fpa" 
                                onChange={(val) => setCalcInputs(prev => ({ ...prev, targetFpa: val }))} 
                            />
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-white/20">
                            <RangeField 
                                label="Bloom Intensity" 
                                value={calcInputs.bloomIntensity || 0.9} 
                                onChange={(val) => setCalcInputs(prev => ({ ...prev, bloomIntensity: val }))} 
                            />
                            <RangeField 
                                label="Forage Condition" 
                                value={calcInputs.forageCondition || 0.8} 
                                onChange={(val) => setCalcInputs(prev => ({ ...prev, forageCondition: val }))} 
                            />
                            <label className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Weather Risk</span>
                                    <span className="text-[10px] font-black text-[#1B9157]">{Math.round((calcInputs.weatherRisk || 0) * 100)}%</span>
                                </div>
                                <input type="range" min="0.05" max="0.6" step="0.05" value={calcInputs.weatherRisk} onChange={(event) => setCalcInputs(prev => ({ ...prev, weatherRisk: Number(event.target.value) }))} className="w-full accent-amber-500" />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics Output */}
                <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={cn(glass.card, 'bg-white/50 border-primary/10')}>
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={glass.microLabel}>Effective Frames (Adjusted)</span>
                                <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-4xl font-black tracking-tighter text-primary">{metrics.effectiveFrames}</p>
                            <p className="text-[10px] text-muted-foreground font-bold pt-1 border-t border-black/5 mt-2">
                                Base frames: {metrics.totalFrames}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={cn(glass.card, 'bg-white/50 border-primary/10')}>
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={glass.microLabel}>Effective FPA</span>
                                <Activity className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black tracking-tighter text-[#1B9157]">{metrics.effectiveFPA}</p>
                                <p className="text-sm font-bold text-muted-foreground pb-1">/ {metrics.framesPerAcre} raw</p>
                            </div>
                        </CardContent>
                    </Card>

                    {[
                        { label: 'Readiness Score', value: `${metrics.readinessScore}%`, icon: ShieldCheck, tone: 'text-[#1B9157]' },
                        { label: 'Efficacy Index', value: `${metrics.pollinationEfficacy}%`, icon: Gauge, tone: 'text-sky-600' },
                        { label: 'Yield Lift', value: `${metrics.projectedYieldLiftPercent}%`, icon: TrendingUp, tone: 'text-[#1A1A1A]' },
                        { label: 'Coverage Gap', value: `${metrics.coverageGapHives} hives`, icon: Flower2, tone: 'text-amber-600' },
                    ].map((item) => (
                        <Card key={item.label} className={cn(glass.card, 'bg-white/50 border-primary/10')}>
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between"><span className={glass.microLabel}>{item.label}</span><item.icon className={cn('w-4 h-4', item.tone)} /></div>
                                <p className={cn('text-3xl font-black tracking-tighter', item.tone)}>{item.value}</p>
                            </CardContent>
                        </Card>
                    ))}

                    <Card className={cn(glass.card, 'md:col-span-2 bg-[#1A1A1A] border-transparent text-white')}>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Recommendation</p>
                                    <h3 className="mt-2 text-xl font-black tracking-tight">{metrics.recommendation}</h3>
                                </div>
                                {metrics.pollinationEfficacy < 60 ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <CheckCircle2 className="w-8 h-8 text-primary" />}
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <Badge className="bg-white/10 text-white border-white/10">{metrics.totalFramesRequired} required frames</Badge>
                                <Badge className="bg-white/10 text-white border-white/10">{metrics.normalizedFlightHours} flight hrs</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Hive Inventory */}
            <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tighter">Colony Inventory & Logic</h3>
                    <button
                        onClick={() => setCalcInputs(prev => ({
                            ...prev,
                            hives: [...(prev.hives || []), { frameCount: 8, isStrong: true, isLarge: false }]
                        }))}
                        className={cn(glass.btnSecondary, "text-[10px]")}
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Unit
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {(calcInputs.hives || []).map((hive, idx) => (
                        <Card key={idx} className={cn(glass.card, "relative group border-primary/20 bg-white/60")}>
                            <button
                                onClick={() => setCalcInputs(prev => ({ ...prev, hives: (prev.hives || []).filter((_, i) => i !== idx) }))}
                                aria-label={`Remove unit ${idx + 1}`}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <CardContent className="p-4 space-y-3">
                                <div className={glass.microLabel}>Unit #{idx + 1}</div>
                                <div className="font-black text-2xl flex items-end gap-1">
                                    {hive.frameCount} <span className="text-[10px] text-muted-foreground pb-1">FR</span>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            const hives = calcInputs.hives || [];
                                            const newHives = [...hives];
                                            if (newHives[idx]) newHives[idx].isStrong = !newHives[idx].isStrong;
                                            setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                        }}
                                        className={cn("w-full py-1.5 rounded-lg text-[9px] font-bold border transition-colors", hive.isStrong ? "bg-[#1B9157]/10 border-[#1B9157]/30 text-[#1B9157]" : "bg-transparent border-black/10 text-muted-foreground")}
                                    >
                                        Strong Flight
                                    </button>
                                    <button
                                        onClick={() => {
                                            const hives = calcInputs.hives || [];
                                            const newHives = [...hives];
                                            if (newHives[idx]) newHives[idx].isLarge = !newHives[idx].isLarge;
                                            setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                        }}
                                        className={cn("w-full py-1.5 rounded-lg text-[9px] font-bold border transition-colors", hive.isLarge ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" : "bg-transparent border-black/10 text-muted-foreground")}
                                    >
                                        Large Box
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default PollinationCalcs;
