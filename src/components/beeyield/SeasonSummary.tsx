import React from 'react';
import { Calculator, TrendingUp, ArrowRight, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

interface SeasonSummaryProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

// Simulated season data
const blockResults = [
    { block: 'Block 1C', contracted: 1.0, delivered: 0.94, peakFlightDay: 12, peakBloomDay: 13, coverageVariance: 8 },
    { block: 'Block 2D', contracted: 0.9, delivered: 0.71, peakFlightDay: 11, peakBloomDay: 10, coverageVariance: 23 },
    { block: 'Block 3A', contracted: 1.0, delivered: 0.37, peakFlightDay: 9, peakBloomDay: 12, coverageVariance: 41 },
    { block: 'Block 4B', contracted: 0.8, delivered: 1.00, peakFlightDay: 13, peakBloomDay: 13, coverageVariance: 5 },
];

function calcGrade(score: number): { letter: string; color: string; bg: string } {
    if (score >= 90) return { letter: 'A', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/ border-[#1B9157]/ shadow-emerald-500/10' };
    if (score >= 75) return { letter: 'B', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/ border-[#1B9157]/ shadow-emerald-400/10' };
    if (score >= 60) return { letter: 'C', color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/10 border-[#F4D03F]/30 shadow-honey/10' };
    if (score >= 45) return { letter: 'D', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30 shadow-orange-500/10' };
    return { letter: 'F', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30 shadow-red-500/10' };
}

// Circular gauge SVG
const CircularGauge: React.FC<{ value: number; max: number; label: string; sublabel: string }> = ({ value, max, label, sublabel }) => {
    const pct = Math.min(1, value / max);
    const R = 44;
    const circumference = 2 * Math.PI * R;
    const dash = circumference * pct;
    const color = pct >= 0.85 ? '#10b981' : pct >= 0.6 ? '#f59e0b' : '#ef4444';

    return (
        <div className="flex flex-col items-center gap-4 group">
            <div className="relative">
                <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-sm">
                    {/* Background track */}
                    <circle cx="60" cy="60" r={R} fill="none" className="stroke-muted/50" strokeWidth="12" />
                    {/* Progress arc */}
                    <circle
                        cx="60" cy="60" r={R}
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        className="group-hover:opacity-90 transition-opacity"
                    />
                    <text x="60" y="56" textAnchor="middle" dominantBaseline="central" className="font-serif text-2xl font-black fill-foreground">
                        {Math.round(pct * 100)}<tspan fontSize="12">%</tspan>
                    </text>
                    <text x="60" y="74" textAnchor="middle" className="text-[9px] font-semibold uppercase tracking-widest fill-muted-foreground/80">
                        {sublabel}
                    </text>
                </svg>
            </div>
            <p className={cn(glass.microLabel, "normal-case font-bold opacity-80")}>{label}</p>
        </div>
    );
};

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ onTabChange }) => {
    const [exportDone, setExportDone] = React.useState(false);

    const pillarScores = React.useMemo(() => {
        // Uniformity: 100 minus average coverage variance
        const avgVariance = blockResults.reduce((s, b) => s + b.coverageVariance, 0) / blockResults.length;
        const uniformity = Math.max(0, 100 - avgVariance);

        // Strength: average (delivered/contracted) × 100
        const strength = (blockResults.reduce((s, b) => s + b.delivered / b.contracted, 0) / blockResults.length) * 100;

        // Timing: 100 minus average |peakFlight - peakBloom| × 10
        const avgTimingDelta = blockResults.reduce((s, b) => s + Math.abs(b.peakFlightDay - b.peakBloomDay), 0) / blockResults.length;
        const timing = Math.max(0, 100 - avgTimingDelta * 10);

        const composite = Math.round((uniformity * 0.35) + (strength * 0.45) + (timing * 0.2));
        return { uniformity: Math.round(uniformity), strength: Math.round(strength), timing: Math.round(timing), composite };
    }, []);

    const grade = calcGrade(pillarScores.composite);

    const handleExportCSV = () => {
        const header = 'Block,Contracted FPA,Delivered FPA,Peak Flight Day,Peak Bloom Day,Timing Delta,Coverage Variance\n';
        const rows = blockResults.map(b =>
            `${b.block},${b.contracted},${b.delivered},${b.peakFlightDay},${b.peakBloomDay},${Math.abs(b.peakFlightDay - b.peakBloomDay)},${b.coverageVariance}%`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beeyield-season-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportDone(true);
        setTimeout(() => setExportDone(false), 2500);
    };

    return (
        <div className={cn(glass.page, "p-8 -m-8 min-h-screen")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20')}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-[0.1em]">End-of-Season Pollination Report</span>
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Season <span className="text-[#F4D03F]">Summary</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>
                        Performance summary
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className={cn(glass.btnPrimary, "h-14 px-8 text-xs bg-[#F4D03F] text-white border-[#F4D03F] hover:bg-amber-600 shadow-honey/20")}
                >
                    {exportDone ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    {exportDone ? 'Data Exported' : 'Export CSV Dataset'}
                </button>
            </div>

            {/* Composite Grade Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
                <div className={cn(glass.card, "lg:col-span-1 p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all", grade.bg)}>
                    <div className={cn("absolute inset-0 opacity-20 blur-3xl", grade.bg.replace('border-', 'bg-'))} />
                    <p className={cn(glass.microLabel, "text-muted-foreground opacity-80 mb-6 relative z-10")}>Performance Grade</p>
                    <p className={cn("text-9xl font-serif font-black leading-none relative z-10 drop-shadow-md", grade.color)}>{grade.letter}</p>
                    <p className={cn(glass.sectionTitle, "text-4xl normal-case mt-4 tabular-nums relative z-10")}>{pillarScores.composite}<span className="text-2xl text-muted-foreground">/100</span></p>
                    <p className={cn(glass.microLabel, "normal-case italic opacity-60 mt-6 text-center relative z-10")}>Composite score across Uniformity, Strength & Timing</p>
                </div>

                {/* Pillar Gauges */}
                <div className={cn(glass.card, "lg:col-span-2 p-10 flex flex-col justify-center relative shadow-lg")}>
                    <div className="flex items-center justify-between mb-10">
                        <p className={cn(glass.sectionTitle, "text-2xl normal-case")}>Performance Pillars</p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 justify-items-center mb-8">
                        <CircularGauge value={pillarScores.uniformity} max={100} label="Uniformity" sublabel="Coverage" />
                        <CircularGauge value={pillarScores.strength} max={100} label="Strength" sublabel="FPA Delivery" />
                        <CircularGauge value={pillarScores.timing} max={100} label="Timing" sublabel="Bloom Sync" />
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
                        {[
                            { label: 'Uniformity', sub: '35% weight — Coverage variance across blocks', val: pillarScores.uniformity },
                            { label: 'Strength', sub: '45% weight — Delivered vs. contracted FPA', val: pillarScores.strength },
                            { label: 'Timing', sub: '20% weight — Peak flight vs. peak bloom alignment', val: pillarScores.timing },
                        ].map(p => (
                            <div key={p.label} className="space-y-2">
                                <p className={cn(glass.microLabel, "font-bold opacity-80")}>{p.label}</p>
                                <p className={cn(
                                    glass.sectionTitle, "text-xl tabular-nums tracking-tight",
                                    p.val >= 85 ? "text-[#1B9157]" : p.val >= 60 ? "text-[#F4D03F]" : "text-red-500"
                                )}>{p.val}<span className="text-sm text-muted-foreground">/100</span></p>
                                <p className="text-[10px] text-muted-foreground/60 italic leading-tight pt-1">{p.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Block Data Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    <Calculator className="w-6 h-6 text-[#F4D03F]" />
                    <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Block Performance Data</h3>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl")}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    {['Block', 'Contracted FPA', 'Delivered FPA', 'Strength %', 'Timing Δ (days)', 'Coverage Variance', 'Status'].map((h, i) => (
                                        <th key={h} className={cn("px-8 py-5 text-left", glass.microLabel, i === 0 && "pl-8", i === 6 && "pr-8")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 bg-gray-300">
                                {blockResults.map(b => {
                                    const strengthPct = Math.round((b.delivered / b.contracted) * 100);
                                    const timingDelta = Math.abs(b.peakFlightDay - b.peakBloomDay);
                                    const isGood = strengthPct >= 85 && timingDelta <= 1 && b.coverageVariance <= 15;
                                    const isWarn = !isGood && strengthPct >= 60;
                                    return (
                                        <tr key={b.block} className="hover:bg-[#F9F7F2]0:bg-[#F9F7F2] transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className={cn(glass.sectionTitle, "text-lg normal-case")}>{b.block}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold tabular-nums")}>{b.contracted.toFixed(2)}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(glass.sectionTitle, "text-xl tabular-nums tracking-tight", b.delivered >= b.contracted ? "text-[#1B9157]" : b.delivered >= b.contracted * 0.8 ? "text-[#F4D03F]" : "text-red-500")}>
                                                    {b.delivered.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", strengthPct >= 85 ? "bg-[#1B9157]" : strengthPct >= 60 ? "bg-[#F4D03F]" : "bg-red-500")}
                                                            style={{ width: `${Math.min(100, strengthPct)}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold tabular-nums")}>{strengthPct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn("text-xs font-bold tabular-nums flex items-center gap-2", timingDelta > 2 ? "text-red-500" : timingDelta > 0 ? "text-[#F4D03F]" : "text-[#1B9157]")}>
                                                    {timingDelta === 0 ? <><CheckCircle2 className="w-3.5 h-3.5" /> Aligned</> : `+${timingDelta} days`}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(glass.microLabel, "normal-case font-bold tabular-nums opacity-80")}>{b.coverageVariance}%</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(glass.badge, "border-transparent px-3",
                                                    isGood ? "bg-[#1B9157]/ text-[#1B9157] font-bold" :
                                                        isWarn ? "bg-[#F4D03F]/ text-[#F4D03F] font-bold" :
                                                            "bg-red-500/10 text-red-500 font-bold"
                                                )}>
                                                    {isGood ? 'Optimal' : isWarn ? 'Deficit' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-2 text-muted-foreground/60">
                    <AlertTriangle className="w-4 h-4" />
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-100")}>
                        Data suitable for insurance claims and organic certification compliance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SeasonSummary;
