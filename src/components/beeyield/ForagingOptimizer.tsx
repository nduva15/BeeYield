import React from 'react';
import { Target, Move, Zap, TrendingUp, Info, Activity, ShieldAlert, Crosshair, Hexagon, Brain, Map as MapIcon, BarChart3, ArrowRight, Wind, Waves, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ForagingOptimizerProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

// Simulated Data: Honey gain over time
const FORAGING_MATH = [
    { t: 0, phi: 120, baseline: 100 },
    { t: 2, phi: 150, baseline: 100 },
    { t: 4, phi: 310, baseline: 110 },
    { t: 6, phi: 450, baseline: 120 },
    { t: 8, phi: 410, baseline: 120 },
    { t: 10, phi: 520, baseline: 130 },
];

const ForagingOptimizer: React.FC<ForagingOptimizerProps> = ({ onTabChange }) => {
    const [viewMode, setViewMode] = React.useState<'MAP' | 'MATH'>('MAP');
    const [shiftRecentlyCommitted, setShiftRecentlyCommitted] = React.useState(false);
    const shiftTimeoutRef = React.useRef<number | null>(null);

    const commitLocationShift = React.useCallback(() => {
        setShiftRecentlyCommitted(true);
        if (shiftTimeoutRef.current) window.clearTimeout(shiftTimeoutRef.current);
        shiftTimeoutRef.current = window.setTimeout(() => setShiftRecentlyCommitted(false), 10_000);
        try {
            globalThis.localStorage?.setItem('beeyield_location_shift_committed_at', String(Date.now()));
        } catch {
            // ignore (storage disabled)
        }
        toast.success('Location shift committed (local)', {
            description: 'Saved locally (no backend).',
        });
    }, []);
    
    React.useEffect(() => {
        return () => {
            if (shiftTimeoutRef.current) window.clearTimeout(shiftTimeoutRef.current);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Target}
                label="Efficiency Node"
                title={<>Bee <span className="text-[#1B9157]">Efficiency</span></>}
                subtitle="Optimizing bee flight trajectories and mapping high-density floral bloom sectors."
                actions={
                    <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={cn(
                                "h-8 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
                                viewMode === 'MAP' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-500 hover:text-[#1A1A1A] hover:bg-white/50"
                            )}
                        >
                            <MapIcon className="w-3.5 h-3.5" />
                            Flight Map
                        </button>
                        <button
                            onClick={() => setViewMode('MATH')}
                            className={cn(
                                "h-8 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
                                viewMode === 'MATH' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-500 hover:text-[#1A1A1A] hover:bg-white/50"
                            )}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Honey Yield
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Main Visualizer Area */}
                <div className="lg:col-span-8 space-y-4">
                    <AnimatePresence mode="wait">
                        {viewMode === 'MAP' ? (
                            <motion.div
                                key="map"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn(glass.card, "p-0 h-[460px] relative overflow-hidden bg-gray-50 border-gray-200")}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                                <div className="absolute top-8 left-8 p-4 bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-lg group hover:-translate-y-1 transition-transform">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1B9157] mb-1">Primary Sector</p>
                                    <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Healthy Bloom 04</p>
                                </div>

                                <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xl">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                        <Crosshair className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="text-left">
                                    <p className="text-sm font-semibold text-[#1B9157] mb-1 leading-none">Data sync</p>
                                        <p className="text-sm font-semibold text-[#1A1A1A]">Shift to the north-east</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="math"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn(glass.card, "h-[460px] p-6 flex flex-col bg-white")}
                            >
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Honey Gain Profile</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Seasonal Yield Forecast Alpha</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div>
                                                <p className="text-2xl font-bold tracking-tight text-[#1A1A1A] leading-none">520 PTS</p>
                                                <p className="text-[10px] font-bold text-[#1B9157] uppercase tracking-wider mt-1">Efficiency: Peak</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full relative bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={FORAGING_MATH} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                                <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#6B7280' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#6B7280' }} />
                                                <Tooltip 
                                                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                                  itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                                  labelStyle={{ display: 'none' }}
                                                />
                                                <Area type="monotone" dataKey="phi" stroke="#F4D03F" strokeWidth={3} fill="url(#honeyGrad)" animationDuration={1000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-gray-100 pt-6 grid grid-cols-3 gap-6">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Metabolic Cost</p>
                                        <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Normal Ops</p>
                                    </div>
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Honey Velocity</p>
                                        <p className="text-sm font-bold text-amber-700 tracking-tight">High Yield</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Net Score</p>
                                        <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">92% Eff</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar: Science & Alerts */}
                <div className="lg:col-span-4 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden bg-white")}
                    >
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-gray-500" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Colony Activity</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Sensors</span>
                        </div>

                        <div className="p-4 space-y-3">
                             {[
                                { label: 'Active Foragers', val: '84%', status: 'Nominal' },
                                { label: 'Visits/Min', val: '14.8', status: 'Optimal' },
                                { label: 'Floral Wealth', val: '92%', status: 'Peak' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-[#1A1A1A]/10 hover:bg-white transition-all shadow-sm">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">{item.label}</p>
                                        <p className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#1B9157] transition-colors">{item.val}</p>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-md shadow-sm">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className={cn(glass.card, "p-5 bg-red-50/50 border-red-100 shadow-sm")}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-red-200 text-red-500 shadow-sm">
                                <Wind className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-red-600 tracking-tight">Environmental Alert</h3>
                        </div>
                        <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">
                            High-velocity winds in <span className="text-red-600 font-bold">Sector 4</span>. Sector evacuation recommended.
                        </p>
                        <button
                            type="button"
                            onClick={commitLocationShift}
                            className={cn(
                                glass.btnSecondary,
                                "w-full h-9 bg-white text-red-600 border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs font-bold",
                                shiftRecentlyCommitted && "opacity-80"
                            )}
                            aria-label="Commit location shift"
                            title="Commit location shift"
                        >
                           <Move className="w-4 h-4" aria-hidden="true" focusable="false" />
                           {shiftRecentlyCommitted ? 'Location Shift Committed' : 'Commit Location Shift'}
                        </button>
                    </div>

                    <div className={cn(glass.card, "p-5 bg-white border-gray-200 flex items-start gap-4 relative overflow-hidden group shadow-sm")}>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#1B9157]/5 blur-2xl rounded-full" />
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm group-hover:bg-[#1B9157]/10 transition-colors">
                            <Waves className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1 flex-1 relative z-10">
                            <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Acoustic Tracking</p>
                            <p className="text-xs font-medium text-gray-500 leading-relaxed border-l-2 border-[#1B9157]/30 pl-3">
                                Real-time spatial tracking of colony flight maps.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ForagingOptimizer;
