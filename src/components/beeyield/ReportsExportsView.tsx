import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Grid3X3, Box, Check, LayoutGrid,
    Calendar, History, Plus, Bell, ExternalLink,
    Clock, Sparkles, X, Trash2, Shield, Loader2, FileBarChart,
    Settings,
    Mail,
    ChevronRight,
    Search,
    Zap,
    Cpu,
    Database,
    FileSpreadsheet,
    FileJson,
    PieChart,
    BarChart3,
    ArrowRight,
    ShieldCheck,
    Layers,
    MapPin,
    Network,
    Terminal,
    Fingerprint,
    Lock,
    SearchCode,
    Activity,
    Radio,
    Info,
    RefreshCw,
    ChevronDown
} from 'lucide-react';
import beeyieldService, { Apiary, Hive, GeneratedReport, ScheduledReport } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

interface ReportsExportsViewProps {
    onTabChange?: (tab: string, message?: string) => void;
}

const ReportsExportsView: React.FC<ReportsExportsViewProps> = () => {
    const { t } = useLanguage();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const [reportScope, setReportScope] = React.useState('30');
    const [selectedFormat, setSelectedFormat] = React.useState<'PDF' | 'XLSX'>('PDF');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isAISynthesizing, setIsAISynthesizing] = React.useState(false);
    const [genProgress, setGenProgress] = React.useState(0);

    const [isLoading, setIsLoading] = React.useState(true);

    const [reports, setReports] = React.useState<GeneratedReport[]>([]);
    const [schedules, setSchedules] = React.useState<ScheduledReport[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);

    const [selectedPlace, setSelectedPlace] = React.useState<string>('');
    const [selectedHive, setSelectedHive] = React.useState<string>('');

    // Schedule Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
    const [isSavingSchedule, setIsSavingSchedule] = React.useState(false);
    const [newSchedule, setNewSchedule] = React.useState({
        name: "",
        report_type: "full_summary",
        frequency: "weekly" as 'daily' | 'weekly' | 'monthly',
        recipients: [] as string[],
        is_active: true
    });

    // Checkboxes for sections
    const [sections, setSections] = React.useState({
        apiaries: true,
        hives: true,
        overview: true,
        notes: true,
        inspections: false,
        harvests: true,
        my_requests: false,
        tasks: false
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [apiariesData, hivesData, reportsData, schedulesData] = await Promise.all([
                beeyieldService.getApiaries(),
                beeyieldService.getHives(),
                beeyieldService.getGeneratedReports(),
                beeyieldService.getScheduledReports()
            ]);

            if (userId) {
                setApiaries(apiariesData.filter(a => !a.user_id || a.user_id === userId));
                setHives(hivesData.filter(h => !h.user_id || h.user_id === userId));
                setReports(reportsData.filter(r => !r.user_id || r.user_id === userId));
                setSchedules(schedulesData.filter(s => s.is_active && (!s.user_id || s.user_id === userId)));
            } else {
                setApiaries(apiariesData || []);
                setHives(hivesData || []);
                setReports(reportsData || []);
                setSchedules(schedulesData || []);
            }
        } catch (error) {
            console.error('Data sync failed', error);
            toast.error('Sync failure: Industrial vault unreachable');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, [userId]);

    const handleGenerateReport = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setGenProgress(10);
        const toastId = toast.loading('Initializing data extraction...');

        try {
            const interval = setInterval(() => {
                setGenProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(interval);
                        return 95;
                    }
                    return prev + Math.random() * 15;
                });
            }, 500);

            const { data, error } = await beeyieldService.generateReport({
                report_type: 'full_summary',
                user_id: userId || undefined,
                parameters: {
                    scope_days: parseInt(reportScope),
                    sections: Object.keys(sections).filter(k => sections[k as keyof typeof sections]),
                    place_id: selectedPlace || undefined,
                    hive_id: selectedHive || undefined,
                    user_id: userId
                },
                file_format: selectedFormat
            } as any);

            clearInterval(interval);
            setGenProgress(100);

            if (error) throw error;
            toast.success('Extraction successful', { id: toastId });
            loadData();
        } catch (error) {
            console.error('Extraction failed', error);
            toast.error('Extraction failure', { id: toastId });
        } finally {
            setTimeout(() => {
                setIsGenerating(false);
                setGenProgress(0);
            }, 1000);
        }
    };

    const handleGenerateAIInsights = async () => {
        if (isAISynthesizing) return;
        setIsAISynthesizing(true);
        const toastId = toast.loading("Synthesizing neural insights...");

        try {
            const { error } = await beeyieldService.generateReport({
                report_type: 'ai_analysis',
                user_id: userId || undefined,
                parameters: {
                    analysis_mode: 'deep_scan',
                    place_id: selectedPlace || undefined,
                    hive_id: selectedHive || undefined,
                    historical_scope_days: 365,
                    user_id: userId
                },
                file_format: 'PDF'
            } as any);

            if (error) throw error;
            toast.success('Insights archived', { id: toastId });
            loadData();
        } catch (error) {
            console.error('Synthesis failed', error);
            toast.error('Neural engine failure', { id: toastId });
        } finally {
            setIsAISynthesizing(false);
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.name) {
            toast.error("Schedule identifier required");
            return;
        }

        setIsSavingSchedule(true);
        const toastId = toast.loading('Syncing node...');
        try {
            const { error } = await beeyieldService.createScheduledReport({
                ...newSchedule,
                user_id: userId || undefined,
                report_config: {
                    sections: Object.keys(sections).filter(k => sections[k as keyof typeof sections]),
                    scope_days: 30,
                    user_id: userId
                }
            } as any);

            if (error) throw error;
            toast.success('Sync node online', { id: toastId });
            setIsScheduleModalOpen(false);
            setNewSchedule({
                name: "",
                report_type: "full_summary",
                frequency: "weekly",
                recipients: [],
                is_active: true
            });
            loadData();
        } catch (error) {
            console.error('Node failure', error);
            toast.error('Sync node failure', { id: toastId });
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        const toastId = toast.loading('Purging sync node...');
        try {
            const { error } = await beeyieldService.deleteScheduledReport(id);
            if (error) throw error;
            toast.success('Node purged', { id: toastId });
            loadData();
        } catch (error) {
            toast.error('Purge failure', { id: toastId });
        }
    };

    const sectionOptions = [
        { id: 'apiaries', label: 'Sector_Log', icon: MapPin },
        { id: 'hives', label: 'Fleet_Audit', icon: Box },
        { id: 'overview', label: 'Topology', icon: LayoutGrid },
        { id: 'notes', label: 'Journal', icon: FileText },
        { id: 'inspections', label: 'Bio_Audit', icon: ShieldCheck },
        { id: 'harvests', label: 'Yield_DB', icon: BarChart3 },
        { id: 'my_requests', label: 'Assets', icon: ExternalLink },
        { id: 'tasks', label: 'Ops_Flow', icon: Check },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-24")}
        >
            <PageHeader
                icon={FileBarChart}
                label="Registry Node"
                title={<>Audit <span className="text-[#F4D03F]">Archive</span></>}
                subtitle="Synthesize historical yield vectors and industrial audit trails."
                actions={
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className={cn(glass.btnPrimary, "h-9 px-4 text-[9px] italic flex items-center gap-2")}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Sync Node
                    </button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={cn(glass.card, "p-4 flex flex-col items-center text-center")}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-30 italic mb-1">Total Audits</p>
                    <p className="text-[20px] font-black italic">{reports.length}</p>
                </div>
                <div className={cn(glass.card, "p-4 flex flex-col items-center text-center")}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-30 italic mb-1">Active Nodes</p>
                    <p className="text-[20px] font-black italic text-[#1B9157]">{schedules.length}</p>
                </div>
                <div className={cn(glass.card, "p-4 flex flex-col items-center text-center")}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-30 italic mb-1">Queue Size</p>
                    <p className="text-[20px] font-black italic text-[#F4D03F]">{reports.filter(r => r.status === 'processing').length}</p>
                </div>
                <div className={cn(glass.card, "p-4 flex flex-col items-center text-center")}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-30 italic mb-1">AI Modules</p>
                    <p className="text-[20px] font-black italic">04</p>
                </div>
            </div>

            {/* Neural Insights Intelligence Banner */}
            <div className={cn(glass.card, "p-6 bg-gradient-to-br from-[#1B9157] to-[#0A5D3B] border-none flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32" />
                <div className="space-y-2 flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white/10 text-[8px] font-black uppercase tracking-widest text-white italic">
                        <Zap className="w-3 h-3 text-[#F4D03F]" />
                        Neural Engine Active
                    </div>
                    <h2 className="text-[18px] font-black italic text-white uppercase tracking-tight">Synthesize <span className="text-[#F4D03F]">Intelligence</span></h2>
                    <p className="text-[10px] uppercase font-medium text-white/60 italic leading-tight max-w-md">Predictive yield analysis and geospatial bloom trajectors via Neural MoE.</p>
                </div>
                <button
                    onClick={handleGenerateAIInsights}
                    disabled={isAISynthesizing}
                    className={cn(glass.btnSecondary, "h-10 px-6 bg-white text-[#1B9157] border-none italic text-[10px] shadow-xl relative z-10")}
                >
                    {isAISynthesizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2 inline" />}
                    Deep Analysis
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Synthesis Parameters */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={cn(glass.section, "bg-white/40")}>
                        <div className="p-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-[11px] font-black uppercase italic tracking-widest text-[#1A1A1A]">Extraction Parameters</h3>
                                <p className="text-[8px] font-black opacity-30 uppercase italic">Configure audit trajectories</p>
                            </div>
                            <Terminal className="w-4 h-4 text-[#F4D03F]" />
                        </div>

                        <div className="p-5 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 italic ml-1">Vector Selection</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {sectionOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSections({ ...sections, [opt.id]: !sections[opt.id as keyof typeof sections] })}
                                            className={cn(
                                                "p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all group",
                                                sections[opt.id as keyof typeof sections] ? "bg-[#F4D03F]/10 border-[#F4D03F]/20" : "bg-white/20 border-transparent hover:border-[#F4D03F]/10"
                                            )}
                                        >
                                            <opt.icon className={cn("w-4 h-4 transition-colors", sections[opt.id as keyof typeof sections] ? "text-[#F4D03F]" : "text-gray-300")} />
                                            <span className="text-[8px] font-black uppercase tracking-tight italic opacity-40 group-hover:opacity-100">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#F4D03F]/10">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 italic ml-1">Temporal Audit</label>
                                    <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#F4D03F]/10 gap-1 overflow-x-auto">
                                        {['7', '30', '90', '365'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setReportScope(d)}
                                                className={cn(
                                                    "h-8 px-4 rounded-lg text-[8px] font-black uppercase italic transition-all whitespace-nowrap",
                                                    reportScope === d ? "bg-[#F4D03F] text-[#1A1A1A]" : "text-gray-400"
                                                )}
                                            >
                                                {d === '365' ? 'Annual Cycle' : `${d}_Day`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 italic ml-1">Archive Format</label>
                                    <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#F4D03F]/10 gap-1">
                                        {['PDF', 'XLSX'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setSelectedFormat(f as any)}
                                                className={cn(
                                                    "flex-1 h-8 rounded-lg text-[8px] font-black uppercase italic transition-all",
                                                    selectedFormat === f ? "bg-white text-[#F4D03F] shadow-sm border border-[#F4D03F]/10" : "text-gray-400"
                                                )}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isGenerating}
                                    className={cn(glass.btnPrimary, "w-full h-11 italic flex items-center justify-center gap-3 relative overflow-hidden")}
                                >
                                    {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                    <span>Initialize Data Extraction</span>
                                    {isGenerating && (
                                        <motion.div 
                                            className="absolute bottom-0 left-0 h-1 bg-[#F4D03F] shadow-[0_0_8px_#F4D03F]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${genProgress}%` }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-l-2 border-[#F4D03F] pl-4">
                            <h3 className="text-[12px] font-black uppercase italic tracking-tight text-[#1A1A1A]">Processed Archives</h3>
                            <p className="text-[8px] font-black opacity-30 uppercase italic">Historical Registry</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reports.slice(0, 6).map((r, i) => (
                                <div key={r.id} className={cn(glass.card, "p-3 bg-white/60 border-[#F4D03F]/10 hover:border-[#F4D03F]/40 transition-all flex items-center justify-between group")}>
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 border border-[#F4D03F]/10 flex items-center justify-center text-[#F4D03F]/40 group-hover:text-[#F4D03F] transition-all">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black uppercase italic text-[#1A1A1A] truncate max-w-[120px]">{r.report_type}</p>
                                            <p className="text-[7px] font-black uppercase opacity-20 italic">{new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => r.file_url && window.open(r.file_url, '_blank')}
                                        className="w-8 h-8 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center text-gray-400 hover:text-[#F4D03F] transition-all"
                                     >
                                        <Download className="w-3.5 h-3.5" />
                                     </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Registry Nodes */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={cn(glass.section, "bg-white/40 h-full flex flex-col min-h-[400px]")}>
                        <div className="p-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-[11px] font-black uppercase italic tracking-widest text-[#1A1A1A]">Registry Nodes</h3>
                                <p className="text-[8px] font-black opacity-30 uppercase italic">Automated Sync Flow</p>
                            </div>
                            <Network className="w-4 h-4 text-[#F4D03F]" />
                        </div>

                        <div className="p-4 space-y-3 flex-1">
                            {schedules.map((s) => (
                                <div key={s.id} className="p-3 rounded-xl bg-white/60 border border-[#F4D03F]/10 flex items-center justify-between group hover:border-[#F4D03F]/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#1B9157]/10 flex items-center justify-center text-[#1B9157]">
                                            <Radio className="w-4 h-4 animate-pulse" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase italic text-[#1A1A1A]">{s.name}</p>
                                            <p className="text-[7px] font-black uppercase opacity-30 italic">{s.frequency}_Cycle</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteSchedule(s.id)}
                                        className="w-7 h-7 rounded-md bg-red-500/5 text-red-500 opacity-20 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                onClick={() => setIsScheduleModalOpen(true)}
                                className="w-full h-10 border border-dashed border-[#F4D03F]/30 rounded-xl flex items-center justify-center gap-2 group hover:border-[#F4D03F]/60 transition-all mt-4"
                            >
                                <Plus className="w-3.5 h-3.5 text-[#F4D03F] group-hover:rotate-90 transition-transform" />
                                <span className="text-[9px] font-black uppercase italic opacity-40">Establish Sync</span>
                            </button>
                        </div>

                        <div className="p-4 bg-[#F4D03F]/5 border-t border-[#F4D03F]/10 rounded-b-3xl space-y-2">
                             <div className="flex items-center gap-2 text-[#F4D03F]">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase italic">Secure Tunnel</span>
                             </div>
                             <p className="text-[8px] font-medium opacity-40 leading-tight uppercase italic pr-4">Deep-encrypted SMTP tunnel dissemination active for kernel node_ST.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-md" 
                            onClick={() => setIsScheduleModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(glass.card, "w-full max-w-xl p-0 overflow-hidden shadow-2xl relative z-10 rounded-3xl border-[#F4D03F]/20")}
                        >
                            <div className="p-6 border-b border-[#F4D03F]/10 bg-[#F4D03F]/10 flex justify-between items-center">
                                <h3 className="text-[16px] font-black italic uppercase italic tracking-tight">Sync <span className="text-[#F4D03F]">Kernel</span></h3>
                                <button onClick={() => setIsScheduleModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/40 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSchedule} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase italic opacity-40 ml-1">Sync Identifier</Label>
                                    <div className="relative">
                                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]" />
                                        <input 
                                            value={newSchedule.name}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                            className={cn(glass.input, "h-11 pl-12 text-[12px] italic font-black uppercase placeholder:opacity-20")}
                                            placeholder="IDENTIFIER_NODE_V5..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase italic opacity-40 ml-1">Pulse Cycle</Label>
                                        <div className="relative">
                                            <select 
                                                value={newSchedule.frequency}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                                                className={cn(glass.input, "h-11 px-4 text-[10px] font-black uppercase italic appearance-none pr-10")}
                                            >
                                                <option value="daily">Daily_Burst</option>
                                                <option value="weekly">Weekly_Audit</option>
                                                <option value="monthly">Monthly_Cycle</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase italic opacity-40 ml-1">Kernel Status</Label>
                                        <div className={cn(glass.input, "h-11 px-4 flex items-center justify-between")}>
                                            <span className="text-[9px] font-black uppercase italic opacity-30">Active_Node</span>
                                            <Checkbox 
                                                checked={newSchedule.is_active}
                                                onCheckedChange={(c) => setNewSchedule({ ...newSchedule, is_active: !!c })}
                                                className="w-5 h-5 border-2 border-[#F4D03F]/20 data-[state=checked]:bg-[#F4D03F]"
                                            />
                                        </div>
                                     </div>
                                </div>
                                <button type="submit" disabled={isSavingSchedule} className={cn(glass.btnPrimary, "w-full h-11 italic text-[11px] shadow-xl flex items-center justify-center gap-3 mt-4")}>
                                    {isSavingSchedule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Establish Data Sync Flow
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReportsExportsView;
