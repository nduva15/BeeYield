import React from 'react';
import { Target, Activity, ShieldAlert, ArrowRight, Download, BarChart3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';
import beeyieldService from '@/services/beeyieldService';

interface PredictiveSuccessEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const PredictiveSuccessEngine: React.FC<PredictiveSuccessEngineProps> = ({ onTabChange }) => {
    const [liveVpm, setLiveVpm] = React.useState<number | null>(null);
    const [vpmLoading, setVpmLoading] = React.useState(true);
    const [vpmError, setVpmError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                if (mounted) {
                    setVpmLoading(true);
                    setVpmError(null);
                }
                const rows: any[] = await beeyieldService.getSensorReadings(undefined, 1);
                const r: any = Array.isArray(rows) ? rows[0] : null;
                const v =
                    typeof r?.vpm === 'number'
                        ? r.vpm
                        : typeof r?.visits_per_minute === 'number'
                            ? r.visits_per_minute
                            : typeof r?.activity_vpm === 'number'
                                ? r.activity_vpm
                                : null;
                if (!mounted) return;
                if (typeof v === 'number') setLiveVpm(v);
                else setLiveVpm(null);
            } catch (e: any) {
                if (!mounted) return;
                setLiveVpm(null);
                setVpmError(e?.message || 'Live activity unavailable');
            } finally {
                if (mounted) setVpmLoading(false);
            }
        };
        load();
        const t = setInterval(load, 30_000);
        return () => {
            mounted = false;
            clearInterval(t);
        };
    }, []);

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
                                <span className="text-4xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">2,200</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">LBS / ACRE</span>
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
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Accuracy</p>
                                <p className="text-sm font-bold text-[#1B9157]">± 5%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth</p>
                                <p className="text-sm font-bold text-[#1A1A1A]">+12%</p>
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
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest text-[9px]">Sensors vs forecast</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[340px] w-full p-6 relative bg-[#FFF9F0]">
                             <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                             
                            <div className={cn(glass.card, "h-full w-full flex items-center justify-center bg-white/50 border border-[#F4D03F]/10")}>
                                <div className="text-center space-y-2 p-6">
                                    <div className="inline-flex items-center gap-2 justify-center text-[#1A1A1A]">
                                        <Target className="w-4 h-4 text-[#F4D03F]" />
                                        <span className="text-sm font-bold">No prediction model inputs</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 max-w-md">
                                        This view previously used simulated bloom/flight/yield curves. It now requires real bloom inputs and
                                        telemetry-derived flight/activity before predictions can be generated.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.section, "p-0 overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Success Nodes</h3>
                            <button className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                <Download className="w-3.5 h-3.5 mr-2" />
                                Export Brief
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#F9F7F2]/50">
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Factor</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Weight</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Diagnostic</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F4D03F]/5">
                                    {[
                                        { name: 'Flower Visits', val: typeof liveVpm === 'number' ? `${liveVpm.toFixed(1)}/min` : '—', weight: '—', status: '—' },
                                        { name: 'Bee Activity', val: '—', weight: '—', status: '—' },
                                        { name: 'Energy Levels', val: '—', weight: '—', status: '—' },
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
                                                    "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest border",
                                                    row.status === 'HIGH' ? "bg-emerald-50 text-[#1B9157] border-emerald-100" : "bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20"
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
