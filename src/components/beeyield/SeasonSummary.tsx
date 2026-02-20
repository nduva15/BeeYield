import React from 'react';
import { Calculator, TrendingUp, ArrowRight, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    if (score >= 90) return { letter: 'A', color: 'text-[#10b981]', bg: 'bg-[#10b981]/10' };
    if (score >= 75) return { letter: 'B', color: 'text-[#10b981]', bg: 'bg-[#10b981]/5' };
    if (score >= 60) return { letter: 'C', color: 'text-[#b45309]', bg: 'bg-[#facc15]/15' };
    if (score >= 45) return { letter: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { letter: 'F', color: 'text-red-600', bg: 'bg-red-50' };
}

// Circular gauge SVG
const CircularGauge: React.FC<{ value: number; max: number; label: string; sublabel: string }> = ({ value, max, label, sublabel }) => {
    const pct = Math.min(1, value / max);
    const R = 44;
    const circumference = 2 * Math.PI * R;
    const dash = circumference * pct;
    const color = pct >= 0.85 ? '#10b981' : pct >= 0.6 ? '#facc15' : '#ef4444';

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={R} fill="none" stroke="#064e3b10" strokeWidth="10" />
                <circle
                    cx="55" cy="55" r={R}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeDasharray={`${dash} ${circumference}`}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <text x="55" y="50" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="900" fill="#064e3b">
                    {Math.round(pct * 100)}%
                </text>
                <text x="55" y="68" textAnchor="middle" fontSize="7" fontWeight="700" fill="#064e3b80" style={{ letterSpacing: '0.1em' }}>
                    {sublabel}
                </text>
            </svg>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/50">{label}</p>
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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Season <span className="text-[#10b981]">Summary</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        End-of-Season Pollination Performance Grade
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-3 px-7 py-4 bg-[#064e3b] border-4 border-[#064e3b] text-white text-[10px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#10b981] hover:shadow-[3px_3px_0px_0px_#10b981] transition-shadow"
                >
                    {exportDone ? <CheckCircle2 className="w-4 h-4 text-[#facc15]" /> : <Download className="w-4 h-4 text-[#facc15]" />}
                    {exportDone ? 'Exported!' : 'Export CSV'}
                </button>
            </div>

            {/* Composite Grade Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={cn("lg:col-span-1 border-8 border-[#064e3b] p-10 flex flex-col items-center justify-center shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]", grade.bg)}>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#064e3b]/40 mb-4">Performance Grade</p>
                    <p className={cn("text-9xl font-black leading-none", grade.color)}>{grade.letter}</p>
                    <p className="text-3xl font-black text-[#064e3b] mt-2 tabular-nums">{pillarScores.composite}/100</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30 mt-4 text-center">Composite score across Uniformity, Strength & Timing</p>
                </div>
                {/* Pillar Gauges */}
                <div className="lg:col-span-2 border-4 border-[#064e3b] p-10 shadow-[6px_6px_0px_0px_rgba(6,78,59,0.1)] flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/30 mb-8">Performance Pillars</p>
                    <div className="grid grid-cols-3 gap-6 justify-items-center">
                        <CircularGauge value={pillarScores.uniformity} max={100} label="Uniformity" sublabel="Coverage" />
                        <CircularGauge value={pillarScores.strength} max={100} label="Strength" sublabel="FPA Delivery" />
                        <CircularGauge value={pillarScores.timing} max={100} label="Timing" sublabel="Bloom Sync" />
                    </div>
                    <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t-2 border-[#064e3b]/5">
                        {[
                            { label: 'Uniformity', sub: '35% weight — Coverage variance across blocks', val: pillarScores.uniformity },
                            { label: 'Strength', sub: '45% weight — Delivered vs. contracted FPA', val: pillarScores.strength },
                            { label: 'Timing', sub: '20% weight — Peak flight vs. peak bloom alignment', val: pillarScores.timing },
                        ].map(p => (
                            <div key={p.label}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30">{p.label}</p>
                                <p className={cn("text-sm font-black", p.val >= 85 ? "text-[#10b981]" : p.val >= 60 ? "text-[#b45309]" : "text-red-600")}>{p.val}/100</p>
                                <p className="text-[8px] text-[#064e3b]/30 mt-0.5">{p.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Block Data Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-4">
                    <Calculator className="w-5 h-5 text-[#10b981]" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Block Performance Data</h3>
                </div>
                <div className="border-4 border-[#064e3b] overflow-hidden shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                    <table className="w-full">
                        <thead className="bg-[#064e3b]">
                            <tr>
                                {['Block', 'Contracted FPA', 'Delivered FPA', 'Strength %', 'Timing Δ (days)', 'Coverage Variance', 'Status'].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[9px] font-black text-white/40 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-[#064e3b]/5">
                            {blockResults.map(b => {
                                const strengthPct = Math.round((b.delivered / b.contracted) * 100);
                                const timingDelta = Math.abs(b.peakFlightDay - b.peakBloomDay);
                                const isGood = strengthPct >= 85 && timingDelta <= 1 && b.coverageVariance <= 15;
                                const isWarn = !isGood && strengthPct >= 60;
                                return (
                                    <tr key={b.block} className="hover:bg-[#064e3b]/2 transition-none">
                                        <td className="px-5 py-4 text-xs font-black text-[#064e3b]">{b.block}</td>
                                        <td className="px-5 py-4 text-xs font-bold tabular-nums">{b.contracted.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-xs font-black tabular-nums text-[#10b981]">{b.delivered.toFixed(2)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 bg-[#064e3b]/10">
                                                    <div className={cn("h-full", strengthPct >= 85 ? "bg-[#10b981]" : strengthPct >= 60 ? "bg-[#facc15]" : "bg-red-500")} style={{ width: `${Math.min(100, strengthPct)}%` }} />
                                                </div>
                                                <span className="text-xs font-black tabular-nums">{strengthPct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={cn("text-xs font-black tabular-nums", timingDelta > 2 ? "text-red-600" : timingDelta > 0 ? "text-[#b45309]" : "text-[#10b981]")}>
                                                {timingDelta === 0 ? '✓ Aligned' : `+${timingDelta}d`}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold">{b.coverageVariance}%</td>
                                        <td className="px-5 py-4">
                                            <span className={cn("px-3 py-1.5 text-[9px] font-black uppercase tracking-wider",
                                                isGood ? "bg-[#10b981]/10 text-[#10b981]" : isWarn ? "bg-[#facc15]/20 text-[#b45309]" : "bg-red-50 text-red-600"
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
                <p className="text-[9px] font-bold text-[#064e3b]/30 uppercase tracking-widest">
                    Data suitable for insurance claims and organic certification compliance. Use Export CSV for submission.
                </p>
            </div>
        </div>
    );
};

export default SeasonSummary;
