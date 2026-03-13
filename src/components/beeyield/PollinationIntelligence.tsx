import React from 'react';
import { Brain, TrendingUp, AlertCircle, Building2, FileText, Activity, Cpu, Loader2, FileDown, Plus, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

interface PollinationIntelligenceProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const PREDICTION_DATA = [
    { stage: 'Bloom Start', yield: 400, bfh: 12 },
    { stage: '10% Bloom', yield: 650, bfh: 28 },
    { stage: 'Full Bloom', yield: 1800, bfh: 84 },
    { stage: 'Fall', yield: 2200, bfh: 120 },
];

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
    const [activeHub, setActiveHub] = React.useState<string | null>(null);
    const [apiaries, setApiaries] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = async () => {
        setLoading(true);
        const data = await beeyieldService.getApiaries();
        setApiaries(data);
        if (data.length > 0) setActiveHub(data[0].id);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleGetReport = async () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Preparing Intelligence...',
                success: 'Seasonal intel ready',
                error: 'Intel sync failed'
            }
        );

        await beeyieldService.logExport({
            export_type: 'PDF',
            entity_scope: 'Intelligence',
            file_name: `Intel_${activeHub}_${new Date().toISOString().slice(0, 10)}.pdf`,
            record_count: 1
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Brain}
                label="Pollination Intelligence"
                title={<>Farm <span className="text-[#F4D03F]">Intelligence</span></>}
                subtitle="Farm analytics and bee activity intelligence system."
                actions={
                    <div className="flex items-center gap-2 bg-[#F9F7F2]/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-[#F4D03F]/10">
                        <Sparkles className="w-3.5 h-3.5 text-[#1B9157]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Confidence: <span className="text-[#1B9157]">94%</span></span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                {/* Farms Hub */}
                <div className="lg:col-span-1 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card)}
                    >
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className={glass.sectionTitle}>Active Hubs</h3>
                            </div>
                            <span className={glass.microLabel}>{apiaries.length} Connected</span>
                        </div>
                        
                        <div className="space-y-1.5 max-h-[380px] overflow-y-auto thin-scrollbar pr-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]/40" />
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Scanning Nodes...</span>
                                </div>
                            ) : apiaries.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                    <Building2 className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No hubs registered</p>
                                </div>
                            ) : apiaries.map((apiary) => (
                                <button
                                    key={apiary.id}
                                    onClick={() => setActiveHub(apiary.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2.5 rounded-xl transition-all border group",
                                        activeHub === apiary.id
                                            ? "bg-[#F9F7F2] border-[#F4D03F]/20 shadow-sm"
                                            : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                         <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border transition-colors", activeHub === apiary.id ? "bg-[#F9F7F2] border-[#F4D03F]/30" : "bg-[#F9F7F2]/50 border-[#F4D03F]/10 group-hover:border-[#F4D03F]/20")}>
                                             <Activity className={cn("w-3.5 h-3.5 transition-colors", activeHub === apiary.id ? "text-[#F4D03F]" : "text-[#1A1A1A]/30 group-hover:text-[#1A1A1A]/50")} />
                                         </div>
                                         <div className="text-left">
                                             <p className="text-xs font-bold text-[#1A1A1A] truncate max-w-[140px] leading-none mb-1">{apiary.name}</p>
                                              <p className={glass.microLabel}>Node ID: {apiary.id.split('-')[0]}</p>
                                         </div>
                                     </div>
                                     <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeHub === apiary.id ? "translate-x-0 text-[#1A1A1A]" : "translate-x-0 text-gray-300 group-hover:text-gray-400")} />
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 mt-4 px-1">
                            <button className="w-full h-9 border border-dashed border-[#F4D03F]/30 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/5 hover:border-[#F4D03F]/50 transition-all uppercase tracking-widest">
                                <Plus className="w-3.5 h-3.5" />
                                Add Active Hub
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "bg-[#F9F7F2]/50 border-[#F4D03F]/10 relative overflow-hidden group")}
                    >
                        <div className="flex items-center gap-3 mb-2.5 relative z-10">
                             <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20">
                                <Cpu className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-xs font-bold text-[#1A1A1A] tracking-tight uppercase">Protocol Audit</h3>
                        </div>
                        <p className="text-[10px] font-medium text-gray-500 leading-relaxed pl-3 border-l-2 border-[#F4D03F] relative z-10 uppercase tracking-tighter">
                            Farms are synchronized for real-time <span className="text-[#1A1A1A] font-bold">pollination telemetry</span>.
                        </p>
                    </motion.div>
                </div>

                {/* Insights Visuals */}
                <div className="lg:col-span-2 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden")}
                    >
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#1B9157]/20">
                                    <TrendingUp className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className={glass.sectionTitle}>Growth <span className="text-[#F4D03F]">Dynamics</span></h3>
                                    <p className={glass.microLabel}>Seasonal Pulse v4.2</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-3 bg-[#F9F7F2] px-2.5 py-1.5 rounded-lg border border-[#F4D03F]/20">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] shadow-[0_0_6px_rgba(27,145,87,0.3)]" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Projected</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Current</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px] w-full p-4 relative bg-[#FFF9F0]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PREDICTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="stage" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }} 
                                        dy={10} 
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                            backdropFilter: 'blur(4px)',
                                            border: '1px solid #F3F4F6', 
                                            borderRadius: '14px', 
                                            padding: '10px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                                        }}
                                        itemStyle={{ 
                                            fontSize: '10px', 
                                            fontWeight: 800, 
                                            color: '#1A1A1A',
                                            textTransform: 'uppercase'
                                        }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="yield" 
                                        fill="url(#yieldGrad)" 
                                        stroke="#1B9157" 
                                        strokeWidth={1.5} 
                                        animationDuration={1500} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bfh" 
                                        stroke="#F4D03F" 
                                        strokeWidth={2} 
                                        dot={{ fill: '#fff', stroke: '#F4D03F', strokeWidth: 2, r: 3 }} 
                                        activeDot={{ r: 4, strokeWidth: 0, fill: '#F4D03F' }} 
                                        animationDuration={1500} 
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gap Alert */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className={cn(glass.card, "border-l-4 border-l-red-500/50 py-4")}
                        >
                            <div className="flex items-center gap-3 mb-2 px-1">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-red-200">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                                <h4 className="text-[11px] font-bold text-[#1A1A1A] tracking-tight uppercase">Anomalies Detected</h4>
                            </div>
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed px-1">
                                Density deficiency at <span className="text-red-600 font-bold">Sector B-12</span>. Incremental deployment recommended for node stability.
                            </p>
                        </motion.div>

                        {/* Audit Summary */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className={cn(glass.card, "relative overflow-hidden group py-4")}
                        >
                            <div className="flex items-center gap-3 mb-2 px-1">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20">
                                    <CheckCircle2 className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <h4 className="text-[11px] font-bold text-[#1A1A1A] tracking-tight uppercase">Intelligence Sync</h4>
                            </div>
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed mb-3 px-1 uppercase tracking-tighter">
                                Validation completed against <span className="text-[#1A1A1A] font-bold">telemetry data</span>.
                            </p>
                            <button
                                onClick={handleGetReport}
                                className={cn(glass.btnSecondary, "h-9 w-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 relative z-10")}
                            >
                                <FileDown className="w-3.5 h-3.5" />
                                Export Node Map
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default PollinationIntelligence;
