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
    FileText, Download, Check, LayoutGrid,
    Calendar, Plus, ExternalLink,
    Clock, Sparkles, X, Trash2, Shield, Loader2, FileBarChart,
    ChevronRight, Search, Zap, Cpu, Database, FileSpreadsheet,
    FileJson, PieChart, BarChart3, ArrowRight, ShieldCheck,
    Layers, MapPin, Network, Terminal, Fingerprint, Lock,
    SearchCode, Activity, Radio, Info, RefreshCw, ChevronDown, Box
} from 'lucide-react';
import beeyieldService, { Apiary, Hive, GeneratedReport, ScheduledReport } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { glass, PageHeader } from './GlassTheme';

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
            className={glass.page}
        >
            <PageHeader
                icon={FileBarChart}
                label="Registry Node"
                title={<>Audit <span className="text-[#1B9157]">Archive</span></>}
                subtitle="Synthesize historical yield vectors and industrial audit trails."
                actions={
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className={cn(glass.btnPrimary, "h-9 px-4 text-xs font-bold flex items-center gap-2")}
                    >
                        <Plus className="w-4 h-4" />
                        Sync Node
                    </button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Audits', value: reports.length, color: 'text-[#1A1A1A]' },
                    { label: 'Active Nodes', value: schedules.length, color: 'text-emerald-600' },
                    { label: 'Queue Size', value: reports.filter(r => r.status === 'processing').length, color: 'text-amber-500' },
                    { label: 'AI Modules', value: '04', color: 'text-gray-400' }
                ].map((stat, i) => (
                    <div key={i} className={cn(glass.card, "p-4 flex flex-col items-center text-center bg-white shadow-sm")}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                        <p className={cn("text-xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Neural Insights Intelligence Banner */}
            <div className={cn(glass.card, "p-5 bg-emerald-600 border-none flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-lg")}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32" />
                <div className="space-y-1.5 flex-1 relative z-10 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
                        <Zap className="w-3 h-3 text-amber-300" />
                        Neural Engine Active
                    </div>
                    <h2 className="text-base font-bold text-white tracking-tight">Synthesize Intelligence</h2>
                    <p className="text-[11px] font-medium text-emerald-100/70 max-w-md">Predictive yield analysis and geospatial bloom trajectories via Neural MoE.</p>
                </div>
                <button
                    onClick={handleGenerateAIInsights}
                    disabled={isAISynthesizing}
                    className={cn(glass.btnSecondary, "h-9 px-6 bg-white text-emerald-700 border-none font-bold text-xs shadow-xl relative z-10 shrink-0")}
                >
                    {isAISynthesizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Deep Analysis
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Synthesis Parameters */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={cn(glass.card, "p-0 overflow-hidden bg-white border-gray-200 shadow-sm")}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Extraction Parameters</h3>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Configure audit trajectories</p>
                            </div>
                            <Terminal className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="p-5 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Vector Selection</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {sectionOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSections({ ...sections, [opt.id]: !sections[opt.id as keyof typeof sections] })}
                                            className={cn(
                                                "p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all group",
                                                sections[opt.id as keyof typeof sections] ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <opt.icon className={cn("w-5 h-5 transition-colors", sections[opt.id as keyof typeof sections] ? "text-emerald-500" : "text-gray-300")} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter sm:tracking-normal">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-gray-100">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Temporal Audit</label>
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1 overflow-x-auto">
                                        {['7', '30', '90', '365'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setReportScope(d)}
                                                className={cn(
                                                    "h-7 px-3 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all whitespace-nowrap",
                                                    reportScope === d ? "bg-white text-[#1A1A1A] shadow-sm border border-gray-100" : "text-gray-400 hover:text-[#1A1A1A]"
                                                )}
                                            >
                                                {d === '365' ? 'Annual' : `${d}D`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Archive Format</label>
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1">
                                        {['PDF', 'XLSX'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setSelectedFormat(f as any)}
                                                className={cn(
                                                    "flex-1 h-7 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all",
                                                    selectedFormat === f ? "bg-white text-emerald-600 shadow-sm border border-emerald-100" : "text-gray-400 hover:text-emerald-600"
                                                )}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isGenerating}
                                    className={cn(glass.btnPrimary, "w-full relative shadow-lg")}
                                >
                                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    <span>Initialize Data Extraction</span>
                                    {isGenerating && (
                                        <motion.div 
                                            className="absolute bottom-0 left-0 h-1 bg-amber-400 shadow-[0_0_8px_#F4D03F]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${genProgress}%` }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Processed Archives</h3>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historical Registry</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {reports.slice(0, 6).map((r, i) => (
                                <div key={r.id} className={cn(glass.card, "p-4 bg-white border-gray-100 hover:border-emerald-200 transition-all flex items-center justify-between group shadow-sm")}>
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-all shadow-sm">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-[#1A1A1A] truncate max-w-[140px] uppercase tracking-tighter">{r.report_type.replace('_', ' ')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => r.file_url && window.open(r.file_url, '_blank')}
                                        className="w-9 h-9 rounded-xl bg-gray-50 border border-transparent hover:border-emerald-200 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all shadow-sm"
                                     >
                                        <Download className="w-4 h-4" />
                                     </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Registry Nodes */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={cn(glass.card, "p-0 overflow-hidden bg-white border-gray-200 shadow-sm flex flex-col h-full min-h-[460px]")}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Registry Nodes</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Automated Sync Flow</p>
                            </div>
                            <Network className="w-4 h-4 text-gray-300" />
                        </div>

                        <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {schedules.map((s) => (
                                <div key={s.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                                            <Radio className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-tight">{s.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{s.frequency} Cycle</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteSchedule(s.id)}
                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                onClick={() => setIsScheduleModalOpen(true)}
                                className={cn(glass.btnSecondary, "w-full border-dashed group")}
                            >
                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:rotate-90 transition-all" />
                                <span className={cn(glass.microLabel, "group-hover:text-emerald-600")}>Establish Sync</span>
                            </button>
                        </div>

                        <div className="p-5 bg-emerald-50/50 border-t border-gray-50 space-y-2">
                             <div className="flex items-center gap-2 text-emerald-700">
                                <Lock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Tunnel</span>
                             </div>
                             <p className="text-[10px] font-medium text-emerald-600/60 leading-relaxed uppercase tracking-tighter">Deep-encrypted SMTP tunnel dissemination active for kernel node_ST.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isScheduleModalOpen && (
                    <div className={glass.modalOverlay} onClick={() => setIsScheduleModalOpen(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className={cn(glass.modalCard, "p-0")}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-[#F4D03F]/20 bg-[#F9F7F2] flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shadow-sm">
                                        <Network className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <h3 className={glass.sectionTitle}>Sync Kernel Configuration</h3>
                                </div>
                                <button onClick={() => setIsScheduleModalOpen(false)} className="w-8 h-8 rounded-md hover:bg-white text-gray-400 hover:text-red-500 transition-all flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSchedule} className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Sync Identifier</Label>
                                    <div className="relative">
                                        <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/40" />
                                        <input 
                                            value={newSchedule.name}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                            className={cn(glass.input, "w-full pl-9")}
                                            placeholder="IDENTIFIER_NODE_V5..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label className={glass.microLabel}>Pulse Cycle</Label>
                                        <div className="relative">
                                            <select 
                                                value={newSchedule.frequency}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                                                className={cn(glass.select, "w-full appearance-none pr-8 cursor-pointer")}
                                            >
                                                <option value="daily">Daily Burst</option>
                                                <option value="weekly">Weekly Audit</option>
                                                <option value="monthly">Monthly Cycle</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/40 pointer-events-none" />
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label className={glass.microLabel}>Kernel Status</Label>
                                        <div className={cn(glass.input, "w-full flex items-center justify-between")}>
                                            <span className="text-[10px] font-bold uppercase text-[#1A1A1A]/60">Active Node</span>
                                            <Switch 
                                                checked={newSchedule.is_active}
                                                onCheckedChange={(c) => setNewSchedule({ ...newSchedule, is_active: !!c })}
                                                className="data-[state=checked]:bg-[#1B9157]"
                                            />
                                        </div>
                                     </div>
                                </div>
                                <button type="submit" disabled={isSavingSchedule} className={cn(glass.btnPrimary, "w-full mt-4")}>
                                    {isSavingSchedule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Establish Data Sync Flow
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default ReportsExportsView;
