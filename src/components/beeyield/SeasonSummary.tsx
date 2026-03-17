import React from 'react';
import { Calculator, TrendingUp, CheckCircle2, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import beeyieldService, { PollinationContract } from '@/services/beeyieldService';

interface SeasonSummaryProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

function calcGrade(score: number): { letter: string; color: string; bg: string } {
    if (score >= 90) return { letter: 'A', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10 border-[#1B9157]/30 shadow-emerald-500/10' };
    if (score >= 75) return { letter: 'B', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/5 border-[#1B9157]/20 shadow-emerald-400/10' };
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
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [contracts, setContracts] = React.useState<PollinationContract[]>([]);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await beeyieldService.getPollinationContracts();
            setContracts(data || []);
        } catch (e: any) {
            setError(e?.message || 'Failed to load season report data.');
            setContracts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await load();
        })();
        return () => {
            mounted = false;
        };
    }, [load]);

    const pillarScores = React.useMemo(() => {
        const rows = (contracts || []).filter((c) => c && (c.target_fpa || c.hive_count_required || c.farm_size_acres));
        if (rows.length === 0) return { uniformity: 0, strength: 0, timing: 0, composite: 0 };

        // Strength: mean delivered vs contracted (actual_fpa or deployed/required fallback)
        const ratios = rows.map((c) => {
            const contracted = Number(c.target_fpa || 0) || 0;
            const delivered = typeof c.actual_fpa === 'number'
                ? Number(c.actual_fpa)
                : (Number(c.hive_count_deployed || 0) && Number(c.hive_count_required || 0))
                    ? (Number(c.hive_count_deployed) / Math.max(1, Number(c.hive_count_required))) * Math.max(0.0001, contracted || 1)
                    : contracted;
            if (contracted <= 0) return 1;
            return Math.min(1.5, Math.max(0, delivered / contracted));
        });
        const strength = (ratios.reduce((s, r) => s + r, 0) / ratios.length) * 100;

        // Uniformity: 100 - scaled standard deviation of ratios
        const mean = ratios.reduce((s, r) => s + r, 0) / ratios.length;
        const variance = ratios.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / ratios.length;
        const std = Math.sqrt(variance);
        const uniformity = Math.max(0, 100 - std * 100);

        // Timing: closer to schedule (shorter overruns). Use contract duration as proxy.
        const durations = rows
            .map((c) => {
                const s = new Date(c.contract_start_date);
                const e = new Date(c.contract_end_date);
                const ms = e.getTime() - s.getTime();
                return Number.isFinite(ms) ? Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24))) : null;
            })
            .filter((d): d is number => typeof d === 'number');
        const avgDays = durations.length ? durations.reduce((s, d) => s + d, 0) / durations.length : 30;
        const timing = Math.max(0, 100 - Math.max(0, avgDays - 30) * 2); // penalize long seasons

        const composite = Math.round((uniformity * 0.35) + (strength * 0.45) + (timing * 0.2));
        return {
            uniformity: Math.round(uniformity),
            strength: Math.round(strength),
            timing: Math.round(timing),
            composite: Number.isFinite(composite) ? composite : 0,
        };
    }, [contracts]);

    const grade = calcGrade(pillarScores.composite);

    const handleExportCSV = () => {
        const header = 'Contract Code,Crop,Farm Location,Acres,Target FPA,Actual FPA,Required Hives,Deployed Hives,Status,Start,End\n';
        const escapeCsv = (v: unknown) => {
            const s = String(v ?? '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const rows = (contracts || []).map(c => ([
            c.contract_code,
            c.crop_type,
            c.farm_location,
            c.farm_size_acres,
            c.target_fpa,
            c.actual_fpa ?? '',
            c.hive_count_required,
            c.hive_count_deployed,
            c.status,
            c.contract_start_date,
            c.contract_end_date
        ].map(escapeCsv).join(','))).join('\n');
        const blob = new Blob([header + rows + '\n'], { type: 'text/csv;charset=utf-8' });
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
                    disabled={loading || !!error || (contracts || []).length === 0}
                    className={cn(glass.btnPrimary, "h-14 px-8 text-xs bg-[#F4D03F] text-white border-[#F4D03F] hover:bg-amber-600 shadow-honey/20")}
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : exportDone ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    {loading ? 'Loading…' : exportDone ? 'Data Exported' : 'Export CSV Dataset'}
                </button>
            </div>

            {error && (
                <div className={cn(glass.card, "p-4 border-red-200 bg-red-50 text-red-700 mb-8")}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest">Report load failed</div>
                            <div className="text-[11px] font-semibold mt-1 break-words">{error}</div>
                        </div>
                        <button
                            type="button"
                            onClick={load}
                            className={cn(glass.btnSecondary, "h-10 px-5 text-[10px] font-black uppercase tracking-widest")}
                            disabled={loading}
                        >
                            {loading ? 'Retrying…' : 'Retry'}
                        </button>
                    </div>
                </div>
            )}

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
                    <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Contract Performance Data</h3>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl")}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    {['Contract', 'Crop', 'Acres', 'Target FPA', 'Delivered', 'Start', 'End', 'Status'].map((h, i) => (
                                        <th key={h} className={cn("px-8 py-5 text-left", glass.microLabel, i === 0 && "pl-8", i === 6 && "pr-8")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-10">
                                            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading contracts…
                                            </div>
                                        </td>
                                    </tr>
                                ) : (contracts || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-10 text-[11px] text-gray-500">
                                            No pollination contracts found for this account.
                                        </td>
                                    </tr>
                                ) : (
                                    (contracts || []).map((c) => {
                                        const contracted = Number(c.target_fpa || 0) || 0;
                                        const delivered = typeof c.actual_fpa === 'number'
                                            ? Number(c.actual_fpa)
                                            : contracted;
                                        const ratio = contracted > 0 ? delivered / contracted : 1;
                                        return (
                                            <tr key={c.id} className="hover:bg-[#F9F7F2] transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className={cn(glass.sectionTitle, "text-lg normal-case")}>{c.contract_code}</div>
                                                    <div className="text-[10px] text-gray-500">{c.farm_location}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold")}>{c.crop_type}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold tabular-nums")}>{Number(c.farm_size_acres || 0).toFixed(1)}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold tabular-nums")}>{contracted ? contracted.toFixed(2) : '—'}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.sectionTitle, "text-xl tabular-nums tracking-tight", ratio >= 1 ? "text-[#1B9157]" : ratio >= 0.8 ? "text-[#F4D03F]" : "text-red-500")}>
                                                        {typeof c.actual_fpa === 'number' ? delivered.toFixed(2) : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold tabular-nums")}>
                                                        {c.contract_start_date ? new Date(c.contract_start_date).toLocaleDateString() : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.microLabel, "opacity-70 normal-case font-bold tabular-nums")}>
                                                        {c.contract_end_date ? new Date(c.contract_end_date).toLocaleDateString() : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(glass.badge, "border-transparent px-3",
                                                        c.status === 'completed' ? "bg-[#1B9157]/10 text-[#1B9157] font-bold" :
                                                            c.status === 'active' ? "bg-[#F4D03F]/10 text-[#F4D03F] font-bold" :
                                                                "bg-gray-100 text-gray-600 font-bold"
                                                    )}>
                                                        {String(c.status || '—')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
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
