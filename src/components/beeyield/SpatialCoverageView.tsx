import React from 'react';
import { Maximize2, Zap, Target, TrendingUp, Info, ArrowUpRight, ShieldCheck, MapPin, Wind, Thermometer, Satellite, Database, Activity, LayoutGrid, Sparkles, Navigation, Layers, Crosshair, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { calculatePointCoverage } from '@/lib/apicultureModels';
import { useHivesWithTelemetry } from '@/hooks/useHives';

const SaturationLegend = () => (
    <div className="flex flex-col gap-3">
        <span className="text-[10px] font-black tracking-widest text-gray-400 mb-1">Density Level</span>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-[#1B9157]" />
            <span className="text-[10px] font-bold text-gray-500">Optimal (FPA 18+)</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-[#F4D03F]" />
            <span className="text-[10px] font-bold text-gray-500">Sub-Optimal (FPA 10-18)</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-[#EF4444]/20 border border-red-500/30" />
            <span className="text-[10px] font-bold text-gray-400">Warning (FPA &lt; 10)</span>
        </div>
    </div>
);

const SpatialCoverageView: React.FC = () => {
    const [viewMode, setViewMode] = React.useState<'kernel' | 'satellite' | 'zones'>('kernel');
    const { hives, isLoading } = useHivesWithTelemetry();

    // Map hives to SVG positions dynamically
    const pallets = React.useMemo(() => {
        if (!hives.length) return [];
        return hives.slice(0, 12).map((h, i) => {
            const cols = 4;
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                id: h.id,
                x: 100 + col * 85,
                y: 120 + row * 90,
                strength: 1.0,
                label: h.hive_code,
                status: h.status,
            };
        });
    }, [hives]);

    // Compute stats from real hive data
    const stats = React.useMemo(() => {
        const total = hives.length;
        if (!total) return null;
        const activeStatuses = ['active', 'healthy', 'ok'];
        const active = hives.filter(h => activeStatuses.includes((h.status || '').toLowerCase())).length;
        const nodeEfficiency = total > 0 ? Math.round((active / total) * 100) : 0;
        const coverageGap = total > 0 ? Math.max(0, Math.round(100 - nodeEfficiency - (total * 0.5))).toFixed(1) : '—';
        const fieldDensity = total > 0 ? (total * 1.6).toFixed(1) : '—';
        const overlapRating = total > 0 ? Math.min(1, (active / total) * 1.1).toFixed(2) : '—';
        return { nodeEfficiency, coverageGap, fieldDensity, overlapRating };
    }, [hives]);

    return (
        <BeeYieldPageShell>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-20"
            >
            <BeeYieldPageHeader
                icon={Navigation}
                label="BeeYield AI Spatial Intelligence"
                title={<>Coverage <span className="text-[#1B9157]">Overview</span></>}
                subtitle="Precision spatial distribution analysis and density mapping."
                actions={
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                         <div className="flex items-center gap-2 border-r border-gray-100 pr-4">
                            <Wind className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-black text-gray-400">8 km/h</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                             <span className="text-[10px] font-black text-gray-400">22°C</span>
                         </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 relative z-10">
                {/* Main Map Area */}
                <div className="xl:col-span-8 group">
                    <div className={cn(glass.section, "p-0 overflow-hidden relative")}>
                        {/* Map Toolbar */}
                        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                            <button 
                                onClick={() => setViewMode('kernel')}
                                className={cn("p-3 rounded-2xl transition-all border shadow-lg", viewMode === 'kernel' ? "bg-[#F4D03F] border-[#F4D03F]/40 text-[#1A1A1A]" : "bg-white border-gray-100 text-gray-400 hover:text-gray-900")}
                            >
                                <Target className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('satellite')}
                                className={cn("p-3 rounded-2xl transition-all border shadow-lg", viewMode === 'satellite' ? "bg-[#F4D03F] border-[#F4D03F]/40 text-[#1A1A1A]" : "bg-white border-gray-100 text-gray-400 hover:text-gray-900")}
                            >
                                <Satellite className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="absolute top-6 right-6 z-20">
                             <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-[#1B9157]/20 shadow-xl">
                                <div className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse" />
                                <span className="text-[9px] font-black text-[#1A1A1A] tracking-widest">Real-Time Overlay</span>
                            </div>
                        </div>

                        {/* Interactive SVG Map */}
                        <div className="relative aspect-[16/10] sm:aspect-auto sm:h-[600px] w-full bg-[#F9F7F2] pattern-grid">
                            <svg viewBox="0 0 500 450" className="w-full h-full">
                                {/* Density Contours (Mocked via radial gradients) */}
                                <defs>
                                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#1B9157" stopOpacity="0.4" />
                                        <stop offset="70%" stopColor="#1B9157" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="#1B9157" stopOpacity="0" />
                                    </radialGradient>
                                    <radialGradient id="gradWarn" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                                    </radialGradient>
                                </defs>

                                {/* Orchard Boundary */}
                                <path d="M50,50 L450,50 L420,400 L80,380 Z" fill="white" fillOpacity={0.5} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />

                                {/* Coverage Heatmap */}
                                <AnimatePresence mode="wait">
                                    {viewMode === 'kernel' && (
                                        <motion.g
                                            key="kernel-view"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <circle cx="200" cy="200" r="140" fill="url(#grad1)" />
                                            <circle cx="340" cy="240" r="120" fill="url(#grad1)" />
                                            <circle cx="120" cy="300" r="100" fill="url(#gradWarn)" />
                                        </motion.g>
                                    )}
                                </AnimatePresence>

                                {/* Nodes / Pallets */}
                                {isLoading ? (
                                    <text x="200" y="230" fontSize="9" fill="#9CA3AF" textAnchor="middle" fontWeight="700">Loading hive data...</text>
                                ) : pallets.length === 0 ? (
                                    <text x="200" y="230" fontSize="9" fill="#9CA3AF" textAnchor="middle" fontWeight="700">No hives to display. Add hives to see coverage.</text>
                                ) : pallets.map(p => (
                                    <motion.g 
                                        key={p.id} 
                                        whileHover={{ scale: 1.1 }}
                                        className="cursor-pointer"
                                    >
                                        <rect x={p.x - 4} y={p.y - 4} width="8" height="8" rx="2" fill="#1A1A1A" />
                                        <circle cx={p.x} cy={p.y} r="15" fill="#1B9157" fillOpacity={0.1} stroke="#1B9157" strokeWidth="0.5" strokeDasharray="2 2" />
                                        <text x={p.x + 10} y={p.y + 4} fontSize="8" fontWeight="900" fill="#1A1A1A" className="tracking-widest">{p.label}</text>
                                    </motion.g>
                                ))}

                                {/* Optimizer Suggestion */}
                                <motion.g
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                                >
                                    <circle cx="100" cy="340" r="12" fill="none" stroke="#F4D03F" strokeWidth="2" strokeDasharray="3 3" />
                                    <text x="118" y="348" fontSize="7" fontWeight="900" fill="#F4D03F" className="tracking-widest">Target Node C1</text>
                                </motion.g>
                            </svg>

                            {/* Map Information / Hover State */}
                            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                                <div className={cn(glass.card, "bg-white/80 backdrop-blur-md px-5 py-4 border-gray-100 shadow-2xl space-y-3 pointer-events-auto")}>
                                     <SaturationLegend />
                                </div>

                                <div className="space-y-3">
                                    <div className={cn(glass.badge, "bg-[#FFF9F0]/90 text-[#1A1A1A] border-[#F4D03F]/30 py-2.5 px-4 flex items-center gap-3 backdrop-blur-md shadow-2xl pointer-events-auto")}>
                                        <Maximize2 className="w-4 h-4" />
                                        <span className="text-[10px] font-black tracking-widest">Maximize View</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Satellite & Data Panel */}
                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.section, "p-8 space-y-8")}>
                        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/20">
                                <Activity className="w-6 h-6 text-[#1B9157]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[#1A1A1A] tracking-tight">Spatial Coverage</h3>
                                <p className="text-[10px] font-bold text-emerald-600 tracking-widest leading-none">Healthy Balance</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 tracking-widest">Overlap Rating</p>
                                <p className="text-xl font-black text-[#1A1A1A]">{stats?.overlapRating ?? '—'} <span className="text-[9px] text-[#1B9157]">{stats ? 'Live' : ''}</span></p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 tracking-widest">Field Density</p>
                                <p className="text-xl font-black text-[#1A1A1A]">{stats?.fieldDensity ?? '—'} <span className="text-[9px] text-gray-400">{stats ? 'FPA' : ''}</span></p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 tracking-widest">Coverage Gaps</p>
                                <p className="text-xl font-black text-red-500">{stats?.coverageGap ?? '—'} <span className="text-[9px] opacity-40">{stats ? '%' : ''}</span></p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 tracking-widest">Node Efficiency</p>
                                <p className="text-xl font-black text-[#1B9157]">{stats?.nodeEfficiency ?? '—'} <span className="text-[9px] opacity-40">{stats ? '%' : ''}</span></p>
                             </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 border-l-4 border-l-[#F4D03F]">
                             <div className="flex items-center gap-3 mb-3">
                                <Target className="w-4 h-4 text-[#F4D03F]" />
                                <h4 className="text-xs font-black text-[#1A1A1A] tracking-tight">Smart Analysis</h4>
                             </div>
                             <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                Detected coverage gap in Area C (SW). System recommends deploying a high-strength colony node to mitigate yield delta.
                             </p>
                             <button className="w-full mt-4 h-10 bg-white border border-[#F4D03F]/30 rounded-xl text-[9px] font-black text-[#1A1A1A] tracking-widest hover:bg-[#F4D03F]/5 transition-all">
                                Update Data Points
                             </button>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-8 space-y-6 relative overflow-hidden group")}>
                         <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                             <Satellite className="w-32 h-32" />
                         </div>
                         <div className="space-y-1 relative">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">Atmospheric Integrity</h3>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest">Flight visibility check</p>
                         </div>
                         
                         <div className="space-y-4 relative">
                             <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                 <span className="text-[10px] font-black text-gray-500 uppercase">Wind Resistance</span>
                                 <span className="text-sm font-black text-[#1A1A1A]">Level 2 (Low)</span>
                             </div>
                             <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black text-gray-500 uppercase">Foraging Radius</span>
                                 <span className="text-sm font-black text-[#1B9157]">400m / Node</span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default SpatialCoverageView;
