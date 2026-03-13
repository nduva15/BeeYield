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
            className={glass.page}
        >
            <PageHeader
                icon={Brain}
                label="Intelligence"
                title={<>Pollination <span className="text-[#F4D03F]">Intelligence</span></>}
                subtitle="Advanced analytics and colony trajectory intelligence system."
                actions={
                    <div className={cn(glass.badge, "bg-[#1B9157]/5 text-[#1B9157] border-[#1B9157]/20 py-1.5")}>
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                        System Confidence: 94%
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
                {/* Farms Hub */}
                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.section, "flex flex-col")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Registered Hubs</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{apiaries.length} Connected</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto thin-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]/40" />
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Scanning Nodes...</span>
                                </div>
                            ) : apiaries.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-[#F4D03F]/20 rounded-xl bg-[#F9F7F2]/50">
                                    <Building2 className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No hubs registered</p>
                                </div>
                            ) : apiaries.map((apiary) => (
                                <button
                                    key={apiary.id}
                                    onClick={() => setActiveHub(apiary.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all border group",
                                        activeHub === apiary.id
                                            ? "bg-[#F9F7F2] border-[#F4D03F]/30 shadow-sm"
                                            : "bg-white border-transparent hover:bg-[#F9F7F2] hover:border-[#F4D03F]/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                         <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border transition-colors", activeHub === apiary.id ? "bg-white border-[#F4D03F]/30" : "bg-[#F9F7F2] border-[#F4D03F]/10")}>
                                             <Activity className={cn("w-4 h-4", activeHub === apiary.id ? "text-[#F4D03F]" : "text-gray-300")} />
                                         </div>
                                         <div className="text-left">
                                             <p className="text-xs font-bold text-[#1A1A1A] truncate max-w-[140px] leading-tight mb-0.5">{apiary.name}</p>
                                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Node: {apiary.id.split('-')[0]}</p>
                                         </div>
                                     </div>
                                     <ChevronRight className={cn("w-4 h-4 transition-transform", activeHub === apiary.id ? "translate-x-0.5 text-[#F4D03F]" : "text-gray-200")} />
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t border-[#F4D03F]/10">
                            <button className={cn(glass.btnSecondary, "w-full border-dashed")}>
                                <Plus className="w-4 h-4" />
                                Register Hub
                            </button>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-6 bg-gradient-to-br from-[#F4D03F]/5 to-transparent border-[#F4D03F]/20")}>
                        <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Cpu className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Protocol Audit</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed border-l-2 border-[#F4D03F]/30 pl-3">
                            Farms are synchronized for real-time <span className="text-[#1A1A1A] font-bold">pollination telemetry</span>. All nodes nominal.
                        </p>
                    </div>
                </div>

                {/* Insights Visuals */}
                <div className="xl:col-span-8 space-y-6">
                    <div className={cn(glass.section, "overflow-hidden flex flex-col")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/10">
                                    <TrendingUp className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Growth Dynamics</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Seasonal Pulse v4.2</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#1B9157]" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Projected</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#F4D03F]" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[340px] w-full p-6 relative bg-[#FFF9F0]">
                            <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PREDICTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#00000008" strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="stage" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                                        dy={10} 
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #F4D03F30', 
                                            borderRadius: '12px', 
                                            padding: '12px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                                        }}
                                        itemStyle={{ 
                                            fontSize: '11px', 
                                            fontWeight: 700, 
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
                                        strokeWidth={2} 
                                        animationDuration={1500} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bfh" 
                                        stroke="#F4D03F" 
                                        strokeWidth={3} 
                                        dot={{ fill: '#fff', stroke: '#F4D03F', strokeWidth: 3, r: 4 }} 
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#F4D03F' }} 
                                        animationDuration={1500} 
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={cn(glass.section, "p-5 border-l-4 border-l-red-400 group")}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 shadow-sm transition-transform group-hover:scale-105">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#1A1A1A]">Saturation Anomalies</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Alerts</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Density deficiency detected at <span className="text-red-600 font-bold">Sector B-12</span>. Incremental deployment recommended for node stability.
                            </p>
                        </div>

                        <div className={cn(glass.section, "p-5 border-l-4 border-l-[#1B9157] group")}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/10 shadow-sm transition-transform group-hover:scale-105">
                                        <CheckCircle2 className="w-5 h-5 text-[#1B9157]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#1A1A1A]">Intelligence Sync</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Validation Complete</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGetReport}
                                className={cn(glass.btnSecondary, "w-full")}
                            >
                                <FileDown className="w-4 h-4" />
                                Export Intelligence
                            </button>
                        </div>
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
