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
                subtitle="Farm analytics and bee activity intelligence."
                actions={
                    <div className="flex items-center gap-2 bg-[#F9F7F2] px-3 py-1.5 rounded-lg border border-[#F4D03F]/10">
                        <Sparkles className="w-3.5 h-3.5 text-[#1B9157]" />
                        <span className="text-[10px] font-bold text-gray-500">Confidence: <span className="text-[#1B9157]">94%</span></span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                {/* Farms Hub */}
                <div className="lg:col-span-1 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={glass.card}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Active Hubs</h3>
                            </div>
                            <span className="text-xs font-medium text-gray-400">{apiaries.length} Connected</span>
                        </div>
                        
                        <div className="space-y-2 max-h-[400px] overflow-y-auto thin-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
                            ) : apiaries.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <Building2 className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs font-medium text-gray-400">No hubs registered</p>
                                </div>
                            ) : apiaries.map((apiary) => (
                                <button
                                    key={apiary.id}
                                    onClick={() => setActiveHub(apiary.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all border group",
                                        activeHub === apiary.id
                                            ? "bg-[#F9F7F2] border-[#F4D03F]/30"
                                            : "bg-white border-transparent hover:border-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", activeHub === apiary.id ? "bg-white border-[#F4D03F]/20" : "bg-[#F9F7F2] border-transparent")}>
                                            <Activity className={cn("w-4 h-4", activeHub === apiary.id ? "text-[#1A1A1A]" : "text-gray-400")} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-[#1A1A1A] truncate max-w-[120px]">{apiary.name}</p>
                                            <p className="text-[10px] font-medium text-gray-500 mt-0.5">ID: {apiary.id.split('-')[0]}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeHub === apiary.id ? "translate-x-0 text-[#1A1A1A]" : "translate-x-0 text-gray-300 group-hover:text-gray-400")} />
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <button className="w-full h-10 border border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50 transition-all">
                                <Plus className="w-3.5 h-3.5" />
                                Add Hub
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "bg-[#F9F7F2] border-[#F4D03F]/10 relative overflow-hidden group")}
                    >
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Cpu className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Protocol Audit</h3>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 leading-relaxed pl-3 border-l-2 border-[#F4D03F] relative z-10">
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
                        <div className="p-5 border-b border-[#F4D03F]/10 flex items-center justify-between bg-[#F9F7F2]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#1B9157]/20 shadow-sm">
                                    <TrendingUp className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Growth <span className="text-[#F4D03F]">Dynamics</span></h3>
                                    <p className="text-[10px] font-medium text-gray-500">Seasonal Pulse v4.2</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#1B9157]" />
                                    <span className="text-[10px] font-bold text-gray-500">Projected</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#F4D03F]" />
                                    <span className="text-[10px] font-bold text-gray-500">Current</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full p-6 relative bg-white">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PREDICTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="stage" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} 
                                        dy={10} 
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #E5E7EB', 
                                            borderRadius: '12px', 
                                            padding: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                        itemStyle={{ 
                                            fontSize: '11px', 
                                            fontWeight: 700, 
                                            color: '#1A1A1A' 
                                        }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="yield" 
                                        fill="url(#yieldGrad)" 
                                        stroke="#1B9157" 
                                        strokeWidth={2} 
                                        animationDuration={1500} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bfh" 
                                        stroke="#F4D03F" 
                                        strokeWidth={2} 
                                        dot={{ fill: '#fff', stroke: '#F4D03F', strokeWidth: 2, r: 4 }} 
                                        activeDot={{ r: 5, strokeWidth: 0, fill: '#F4D03F' }} 
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
                            className={cn(glass.card, "bg-white border-l-4 border-l-red-500 shadow-sm")}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                                <h4 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Anomalies Detected</h4>
                            </div>
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                Density deficiency at <span className="text-red-600 font-bold">Sector B-12</span>. Incremental deployment recommended.
                            </p>
                        </motion.div>

                        {/* Audit Summary */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className={cn(glass.card, "bg-white border-[#F4D03F]/10 shadow-sm relative overflow-hidden group")}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20">
                                    <CheckCircle2 className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <h4 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Intelligence Sync</h4>
                            </div>
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed mb-4">
                                Validation completed against <span className="text-[#1A1A1A] font-bold">telemetry data</span>.
                            </p>
                            <button
                                onClick={handleGetReport}
                                className={cn(glass.btnSecondary, "h-8 w-full text-[10px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 relative z-10")}
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
