import React from 'react';
import { Brain, TrendingUp, AlertCircle, Building2, FileText, Activity, Cpu, Loader2, FileDown, Plus, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface PollinationIntelligenceProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
    const [activeHub, setActiveHub] = React.useState<string | null>(null);
    const [apiaries, setApiaries] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [exporting, setExporting] = React.useState(false);

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
        if (exporting) return;
        if (!activeHub) {
            toast.error('Select a hub first');
            return;
        }

        const tid = toast.loading('Preparing intelligence…');
        setExporting(true);
        try {
            const { data, error } = await beeyieldService.generateReport({
                report_type: 'season',
                parameters: {
                    scope_days: 365,
                    place_id: activeHub,
                    sections: ['overview', 'apiaries', 'hives', 'harvests', 'inspections'],
                },
                file_format: 'PDF',
            } as any);
            if (error || !data?.id) throw error || new Error('Report job could not be created');

            const status = await beeyieldService.waitForReport(String(data.id), { timeoutMs: 90_000 });
            if (status?.file_url) window.open(status.file_url, '_blank');

            await beeyieldService.logExport({
                export_type: 'PDF',
                entity_scope: 'Intelligence',
                file_name: status?.file_name || `Intel_${activeHub}_${new Date().toISOString().slice(0, 10)}.pdf`,
                record_count: 1,
            });

            toast.success('Seasonal intel ready', { id: tid });
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Intel sync failed', { id: tid });
        } finally {
            setExporting(false);
        }
    };

    return (
        <BeeYieldPageShell>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
            <BeeYieldPageHeader
                icon={Brain}
                label="Intelligence"
                title={<>Pollination <span className="text-[#F4D03F]">Intelligence</span></>}
                subtitle="Reports and analytics from real apiary + telemetry data."
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
                                    <p className="text-[10px] text-gray-500">{apiaries.length} Connected</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto thin-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]/40" />
                                    <span className="text-[10px] font-bold text-gray-300">Scanning Nodes...</span>
                                </div>
                            ) : apiaries.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-[#F4D03F]/20 rounded-xl bg-[#F9F7F2]/50">
                                    <Building2 className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400">No hubs registered</p>
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
                                              <p className="text-[9px] text-gray-400 font-bold">Site: {apiary.id.split('-')[0]}</p>
                                         </div>
                                     </div>
                                     <ChevronRight className={cn("w-4 h-4 transition-transform", activeHub === apiary.id ? "translate-x-0.5 text-[#F4D03F]" : "text-gray-200")} />
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t border-[#F4D03F]/10">
                            <button
                                type="button"
                                onClick={() => onTabChange?.('places')}
                                className={cn(glass.btnSecondary, "w-full border-dashed")}
                            >
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
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Status</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed border-l-2 border-[#F4D03F]/30 pl-3">
                            Farms are synced for live <span className="text-[#1A1A1A] font-bold">pollination data</span>. All sites look normal.
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
                                    <p className="text-[10px] text-gray-500">Seasonal Pulse v4.2</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-4">
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

                        <div className="h-[340px] w-full p-6 relative bg-[#FFF9F0]">
                            <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            <div className={cn(glass.card, "h-full w-full flex items-center justify-center bg-white/50 border border-[#F4D03F]/10")}>
                                <div className="text-center space-y-2 p-6">
                                    <div className="inline-flex items-center gap-2 justify-center text-[#1A1A1A]">
                                        <TrendingUp className="w-4 h-4 text-[#1B9157]" />
                                        <span className="text-sm font-bold">No intelligence curves yet</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 max-w-md">
                                        This chart requires real bloom stage inputs and telemetry-derived activity/flight hours. It no longer displays simulated curves.
                                    </p>
                                </div>
                            </div>
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
                                        <p className="text-[10px] text-gray-500">Active Alerts</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Alerts will appear here when real coverage and activity data is available.
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
                                        <p className="text-[10px] text-gray-500">Validation Complete</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGetReport}
                                disabled={exporting}
                                className={cn(glass.btnSecondary, "w-full", exporting && "opacity-60 cursor-not-allowed")}
                            >
                                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                {exporting ? 'Exporting…' : 'Export Intelligence'}
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
        </BeeYieldPageShell>
    );
};

export default PollinationIntelligence;
