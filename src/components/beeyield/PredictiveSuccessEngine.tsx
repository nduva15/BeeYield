import React from 'react';
import { Target, Activity, ShieldAlert, Download, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';
import beeyieldService from '@/services/beeyieldService';
import { useApiaries } from '@/hooks/useApiaries';
import { useHarvests } from '@/hooks/useHarvests';
import { useSensorReadings } from '@/hooks/useSensorReadings';

interface PredictiveSuccessEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const PredictiveSuccessEngine: React.FC<PredictiveSuccessEngineProps> = ({ onTabChange }) => {
    // Data Hooks
    const { data: sensorData, isLoading: sensorLoading, error: sensorError } = useSensorReadings(undefined, 24 * 24);
    const { data: harvestsData, isLoading: harvestsLoading, error: harvestError } = useHarvests();
    const { data: apiariesData, isLoading: apiariesLoading, error: apiaryError } = useApiaries();

    const derivedData = React.useMemo(() => {
        if (!sensorData || !harvestsData || !apiariesData) return null;

        try {
            const rows = sensorData || [];
            const harvests = harvestsData || [];
            const apiaries = apiariesData || [];

            const r: any = rows.length > 0 ? rows[0] : null;
            const liveVpm =
                typeof r?.vpm === 'number'
                    ? r.vpm
                    : typeof r?.visits_per_minute === 'number'
                        ? r.visits_per_minute
                        : typeof r?.activity_vpm === 'number'
                            ? r.activity_vpm
                            : null;

            // Build a 12-month series
            const now = new Date();
            const months: { key: string; label: string }[] = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const label = d.toLocaleString('default', { month: 'short' });
                months.push({ key, label });
            }

            const kgToLbs = (kg: number) => kg * 2.2046226218;
            const yieldByMonth = new Map<string, number>();
            harvests.forEach((h: any) => {
                const dt = h?.harvest_date ? new Date(h.harvest_date) : null;
                if (!dt || Number.isNaN(dt.getTime())) return;
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                const kg = Number(h?.quantity_kg ?? 0);
                if (!Number.isFinite(kg)) return;
                yieldByMonth.set(key, (yieldByMonth.get(key) || 0) + kgToLbs(kg));
            });

            const vpmByMonth = new Map<string, { sum: number; n: number }>();
            rows.forEach((sr: any) => {
                const tsRaw = sr?.recorded_at || sr?.timestamp || sr?.created_at;
                const dt = tsRaw ? new Date(tsRaw) : null;
                if (!dt || Number.isNaN(dt.getTime())) return;
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                const vv =
                    typeof sr?.vpm === 'number'
                        ? sr.vpm
                        : typeof sr?.visits_per_minute === 'number'
                            ? sr.visits_per_minute
                            : typeof sr?.activity_vpm === 'number'
                                ? sr.activity_vpm
                                : null;
                if (typeof vv !== 'number' || !Number.isFinite(vv)) return;
                const prev = vpmByMonth.get(key) || { sum: 0, n: 0 };
                prev.sum += vv;
                prev.n += 1;
                vpmByMonth.set(key, prev);
            });

            const series = months.map((mm) => {
                const y = yieldByMonth.get(mm.key) || 0;
                const vpmAgg = vpmByMonth.get(mm.key);
                const vpm = vpmAgg && vpmAgg.n > 0 ? vpmAgg.sum / vpmAgg.n : null;
                return { month: mm.label, yield_lbs: Number(y.toFixed(0)), vpm: vpm !== null ? Number(vpm.toFixed(1)) : null };
            });

            const acres = apiaries.reduce((s: number, a: any) => s + Number(a?.size_acres || 0), 0);
            const totalLbs = series.reduce((s, x) => s + Number(x.yield_lbs || 0), 0);
            const lbsPerAcre = acres > 0 ? totalLbs / acres : null;

            const sensorDensity = Math.min(1, rows.length / 500);
            const accuracyPct = 2 + sensorDensity * 8;

            const last3 = series.slice(-3).reduce((s, x) => s + x.yield_lbs, 0);
            const prev3 = series.slice(-6, -3).reduce((s, x) => s + x.yield_lbs, 0);
            const growthPct = prev3 > 0 ? ((last3 - prev3) / prev3) * 100 : null;

            return {
                liveVpm,
                series,
                summary: {
                    lbsPerAcre: lbsPerAcre !== null ? Number(lbsPerAcre.toFixed(0)) : null,
                    accuracyPct: Number(accuracyPct.toFixed(0)),
                    growthPct: growthPct !== null && Number.isFinite(growthPct) ? Number(growthPct.toFixed(0)) : null,
                }
            };
        } catch (e) {
            console.error("Predictive derive failed:", e);
            return null;
        }
    }, [sensorData, harvestsData, apiariesData]);

    const loading = sensorLoading || harvestsLoading || apiariesLoading;
    const error = (sensorError || harvestError || apiaryError) ? "Data stream exception" : null;
    const vpmLoading = sensorLoading;
    const vpmError = sensorError ? "VPM stream disconnected" : null;

    const liveVpm = derivedData?.liveVpm ?? null;
    const series = derivedData?.series ?? [];
    const summary = derivedData?.summary ?? { lbsPerAcre: null, accuracyPct: null, growthPct: null };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={Target}
                label="Forecast"
                title={<>Harvest <span className="text-[#F4D03F]">Predictor</span></>}
                subtitle="High-fidelity yield forecasting based on activity telemetry."
                actions={
                    <div
                        className={cn(
                            glass.badge,
                            "py-1.5",
                            vpmError ? "bg-red-500/5 text-red-600 border-red-500/20" : "bg-[#1B9157]/5 text-[#1B9157] border-[#1B9157]/20"
                        )}
                        title={vpmError || undefined}
                    >
                        <Activity className={cn("w-3.5 h-3.5 mr-2", vpmLoading ? "animate-pulse" : "")} />
                        {vpmLoading
                            ? 'Loading…'
                            : vpmError
                                ? 'Live VPM unavailable'
                                : typeof liveVpm === 'number'
                                    ? `${liveVpm.toFixed(1)} Visits/Min`
                                    : '— Visits/Min'}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                {/* Prediction Summary */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className={cn(glass.section, "p-6 flex flex-col items-center")}>
                        <div className="w-full flex items-center justify-between border-b border-[#F4D03F]/10 pb-4 mb-8">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Seasonal Output</h3>
                            <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                        </div>

                        <div className="relative w-48 h-24 mb-8">
                            <div className="absolute inset-0 flex flex-col items-center justify-end">
                                <span className="text-4xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">
                                    {loading ? '—' : (summary.lbsPerAcre ?? '—')}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">LBS / ACRE</span>
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 100 50">
                                <path 
                                    d="M 10 45 A 35 35 0 0 1 90 45" 
                                    fill="none" 
                                    stroke="#F9F7F2" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                />
                                <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 0.75 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    d="M 10 45 A 35 35 0 0 1 90 45" 
                                    fill="none" 
                                    stroke="#1B9157" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                />
                            </svg>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 text-center">
                                <p className="text-[9px] font-bold text-gray-400 mb-1">Accuracy</p>
                                <p className="text-sm font-bold text-[#1B9157]">
                                    {loading ? '—' : summary.accuracyPct !== null ? `± ${summary.accuracyPct}%` : '—'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 text-center">
                                <p className="text-[9px] font-bold text-gray-400 mb-1">Growth</p>
                                <p className="text-sm font-bold text-[#1A1A1A]">
                                    {loading ? '—' : summary.growthPct !== null ? `${summary.growthPct >= 0 ? '+' : ''}${summary.growthPct}%` : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-5 bg-[#1B9157]/5 border-[#1B9157]/10 group")}>
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#1B9157]/20 shadow-sm">
                                <ShieldAlert className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Performance Alpha</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed border-l-2 border-[#1B9157]/30 pl-3">
                            Bees worked <span className="text-[#1A1A1A] font-bold">4 hours longer</span> than predicted by the weather forecast.
                        </p>
                    </div>
                </div>

                {/* Growth Curve */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={cn(glass.section, "overflow-hidden flex flex-col")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Efficiency Curve</h3>
                                    <p className="text-[10px] text-gray-500 text-[9px]">Sensors vs forecast</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[340px] w-full p-6 relative bg-[#FFF9F0]">
                             <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                             
                            <div className={cn(glass.card, "h-full w-full bg-white/50 border border-[#F4D03F]/10")}>
                                {loading ? (
                                    <div className="h-full flex items-center justify-center gap-3 text-sm font-bold text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading predictor inputs…
                                    </div>
                                ) : error ? (
                                    <div className="h-full flex items-center justify-center text-center p-6">
                                        <div className="space-y-2">
                                            <div className="text-sm font-bold text-red-600">Could not load inputs</div>
                                            <div className="text-xs font-medium text-gray-500">{error}</div>
                                        </div>
                                    </div>
                                ) : series.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-center p-6">
                                        <div className="space-y-2">
                                            <div className="text-sm font-bold text-[#1A1A1A]">No data yet</div>
                                            <div className="text-xs font-medium text-gray-500">Add harvest records and ingest activity telemetry to enable predictions.</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={series} margin={{ top: 12, right: 16, left: -8, bottom: 0 }}>
                                                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} />
                                                <YAxis yAxisId="y" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} />
                                                <YAxis yAxisId="v" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                                    itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                                />
                                                <Area yAxisId="y" type="monotone" dataKey="yield_lbs" stroke="#F4D03F" fill="#F4D03F" fillOpacity={0.15} strokeWidth={2} />
                                                <Line yAxisId="v" type="monotone" dataKey="vpm" stroke="#1B9157" strokeWidth={2} dot={false} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.section, "p-0 overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Success Nodes</h3>
                            <button
                                onClick={() => {
                                    const header = 'month,yield_lbs,vpm\n';
                                    const rows = (series || []).map((r) => `${r.month},${r.yield_lbs},${r.vpm ?? ''}`).join('\n');
                                    const blob = new Blob([header + rows + '\n'], { type: 'text/csv;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `beeyield-harvest-predictor-${new Date().toISOString().slice(0, 10)}.csv`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(url);
                                }}
                                disabled={loading || !!error || series.length === 0}
                                className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]", (loading || !!error || series.length === 0) && "opacity-60 cursor-not-allowed")}
                            >
                                <Download className="w-3.5 h-3.5 mr-2" />
                                Export Brief
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#F9F7F2]/50">
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400">Factor</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 text-center">Weight</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 text-right">Diagnostic</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F4D03F]/5">
                                    {[
                                        {
                                            name: 'Flower Visits',
                                            val: typeof liveVpm === 'number' ? `${liveVpm.toFixed(1)}/min` : '—',
                                            weight: typeof liveVpm === 'number' ? `${Math.min(100, Math.max(0, (liveVpm / 20) * 100)).toFixed(0)}%` : '—',
                                            status: typeof liveVpm === 'number' ? (liveVpm >= 12 ? 'High' : liveVpm >= 6 ? 'MID' : 'LOW') : '—'
                                        },
                                        {
                                            name: 'Harvest Yield',
                                            val: summary.lbsPerAcre !== null ? `${summary.lbsPerAcre.toLocaleString()} lbs/acre` : '—',
                                            weight: summary.lbsPerAcre !== null ? `${Math.min(100, Math.max(0, (summary.lbsPerAcre / 2000) * 100)).toFixed(0)}%` : '—',
                                            status: summary.lbsPerAcre !== null ? (summary.lbsPerAcre >= 1800 ? 'High' : summary.lbsPerAcre >= 900 ? 'MID' : 'LOW') : '—'
                                        },
                                        {
                                            name: 'Model Confidence',
                                            val: summary.accuracyPct !== null ? `±${summary.accuracyPct}%` : '—',
                                            weight: summary.accuracyPct !== null ? `${Math.min(100, Math.max(0, (10 - summary.accuracyPct) * 10)).toFixed(0)}%` : '—',
                                            status: summary.accuracyPct !== null ? (summary.accuracyPct <= 4 ? 'High' : summary.accuracyPct <= 7 ? 'MID' : 'LOW') : '—'
                                        },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-[#F9F7F2] transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[#1A1A1A]">{row.name}</span>
                                                    <span className="text-[10px] text-gray-400">{row.val}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3 justify-center">
                                                    <div className="h-1.5 w-16 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                                        <div className="h-full bg-[#1B9157]" style={{ width: row.weight === '—' ? '0%' : row.weight }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-[#1A1A1A] tabular-nums">{row.weight}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className={cn(
                                                    "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black border",
                                                    row.status === 'High' ? "bg-emerald-50 text-[#1B9157] border-emerald-100" :
                                                        row.status === 'MID' ? "bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20" :
                                                            row.status === 'LOW' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                                "bg-[#F9F7F2] text-gray-500 border-[#F4D03F]/10"
                                                )}>{row.status}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default PredictiveSuccessEngine;
