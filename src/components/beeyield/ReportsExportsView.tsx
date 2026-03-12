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
    RefreshCw
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
                setSchedules(schedulesData.filter(s => !s.is_active === false && (!s.user_id || s.user_id === userId)));
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
        const toastId = toast.loading('Initializing high-fidelity data extraction...');

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

            toast.success('Extraction archived in processed vault', { id: toastId });

            setTimeout(async () => {
                const freshReports = await beeyieldService.getGeneratedReports();
                setReports(freshReports);
            }, 2000);

        } catch (error) {
            console.error('Extraction failed', error);
            toast.error('Failed to extract data vector', { id: toastId });
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
        const toastId = toast.loading("Neural Engine synthesizing industrial data...");

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
            toast.success('Neural insights archived in repository', { id: toastId });
            loadData();
        } catch (error) {
            console.error('Synthesis failed', error);
            toast.error('Neural analysis engine failure', { id: toastId });
        } finally {
            setIsAISynthesizing(false);
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.name) {
            toast.error("Handshake failed: Schedule identifier required");
            return;
        }

        setIsSavingSchedule(true);
        const toastId = toast.loading('Establishing industrial sync node...');
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

            toast.success('High-fidelity sync node established', { id: toastId });
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
            console.error('Node establishment failed', error);
            toast.error('Failed to save distribution sync', { id: toastId });
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        const toastId = toast.loading('Purging sync node from topology...');
        try {
            const { error } = await beeyieldService.deleteScheduledReport(id);
            if (error) throw error;
            toast.success('Node permanently offline', { id: toastId });
            loadData();
        } catch (error) {
            toast.error('Failed to purge sync node', { id: toastId });
        }
    };

    const sectionOptions = [
        { id: 'apiaries', label: 'Sector_Log', icon: MapPin },
        { id: 'hives', label: 'Fleet_Audit', icon: Box },
        { id: 'overview', label: 'Topology_Core', icon: LayoutGrid },
        { id: 'notes', label: 'Journal_Relay', icon: FileText },
        { id: 'inspections', label: 'Biometric_Trail', icon: ShieldCheck },
        { id: 'harvests', label: 'Yield_Database', icon: Download },
        { id: 'my_requests', label: 'Asset_Registry', icon: ExternalLink },
        { id: 'tasks', label: 'Operational_Flow', icon: Check },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-12 -m-8 space-y-20 pb-40")}
        >
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-honey/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Cinematic Header Cluster */}
            <PageHeader
                icon={FileBarChart}
                label="Industrial Output_Kernel v5.2.0_AUDIT"
                title={<>Audit <span className="text-honey">Archive</span></>}
                subtitle="High-fidelity proprietary extraction engine for systematic data synthesis and historical industrial reporting."
                actions={
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className={cn(glass.btnPrimary, "h-20 bg-[#FBBE24] text-black shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] rounded-[3rem] px-14 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                    >
                        <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                        Initialize_Sync_Node
                    </button>
                }
            />

            {/* Registry Analytics Cluster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard label="Extracted Archive" value={reports.length} icon={FileText} index={0} />
                <GlassStatCard label="Active Distribution" value={schedules.filter(s => s.is_active).length} icon={Calendar} index={1} color="text-emerald-500" />
                <GlassStatCard label="Pipeline Flux" value={reports.filter(r => r.status === 'pending' || r.status === 'processing').length} icon={RefreshCw} index={2} color="text-[#FBBE24]" />
                <GlassStatCard label="Neural Synthesis" value={reports.filter(r => r.report_type === 'ai_analysis').length} icon={Sparkles} index={3} color="text-honey" />
            </div>

            {/* Neural Insights Intelligence Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-[0_80px_150px_-30px_rgba(16,185,129,0.3)] bg-gradient-to-br from-[#065F46] via-[#059669] to-[#047857] border-none rounded-[6rem] relative group")}
            >
                <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:opacity-20 transition-all duration-[3000ms] scale-150 rotate-12">
                    <Sparkles className="w-[800px] h-[800px] text-gray-900" />
                </div>
                <div className="absolute -bottom-40 -left-40 w-[60rem] h-[60rem] bg-white/10 rounded-full blur-[200px] pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]" />
                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-20 relative z-10 text-gray-900">
                    <div className="lg:col-span-8 space-y-12">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-6 px-10 py-3 rounded-full bg-white/10 backdrop-blur-3xl border border-white/30 text-[12px] font-black tracking-[0.6em] uppercase shadow-4xl skew-x-[-15deg]">
                                <Zap className="w-6 h-6 animate-pulse text-honey skew-x-[15deg]" />
                                <span className="skew-x-[15deg]">NEURAL_INSIGHTS_ENGINE_PRO</span>
                            </div>
                            <h2 className="text-8xl font-black italic text-gray-900 tracking-tighter uppercase leading-[0.8] italic">
                                Synthesize <br />
                                <span className="text-white/60">Hive Intelligence.</span>
                            </h2>
                            <p className="text-3xl font-black text-gray-900 italic leading-relaxed border-l-8 border-gray-300 pl-16 max-w-4xl uppercase tracking-tight">
                                Utilizing high-fidelity Neural MoE analysis to predict seasonal yield trajectories and optimize global colony distribution vectors with precision-delta verification.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-10 pt-8">
                            <button
                                onClick={handleGenerateAIInsights}
                                disabled={isAISynthesizing}
                                className={cn(glass.btnSecondary, "h-24 px-20 bg-white text-[#065f46] border-none hover:bg-white/90 font-black italic text-3xl shadow-[0_50px_100px_-20px_rgba(255,255,255,0.4)] transition-all hover:scale-110 active:scale-95 rounded-[3.5rem] flex items-center justify-center gap-8 pl-32 normal-case")}
                            >
                                {isAISynthesizing ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Sparkles className="w-10 h-10 group-hover:scale-125 transition-transform duration-1000" />}
                                Initialize Neural Synthesis
                            </button>
                            <div className="flex items-center gap-8 px-12 border-l-2 border-gray-300">
                                <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center shadow-4xl animate-pulse">
                                    <Info className="w-8 h-8 text-gray-900" />
                                </div>
                                <span className="text-[12px] font-black uppercase tracking-[0.4em] max-w-[200px] italic">Deep auditing 14+ bio-pathogen vectors 24/7.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Industrial Configuration Cluster */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">

                {/* Synthesis Parameter Control - Left (2/3) */}
                <div className="lg:col-span-8 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-4xl border-honey/10 bg-white/60 backdrop-blur-3xl rounded-[5rem] relative group")}
                    >
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-honey/[0.04] rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20 group-hover:scale-125 transition-transform duration-[3000ms]" />

                        <div className="p-16 border-b border-white/5 bg-white/40 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="space-y-4">
                                <h3 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Industrial <span className="text-honey">Parametrics</span></h3>
                                <p className={cn(glass.microLabel, "text-foreground/30 mt-2 font-black uppercase tracking-[0.4em] italic border-l-2 border-honey/20 pl-8")}>Configure granular data-extraction trajectories.</p>
                            </div>
                            <div className="w-24 h-24 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000">
                                <Terminal className="w-12 h-12 text-honey opacity-40" />
                            </div>
                        </div>

                        <div className="p-16 space-y-20 relative z-10">
                            {/* Data Vector Segments */}
                            <div className="space-y-12">
                                <div className="flex items-center gap-6 border-l-4 border-honey/40 pl-8">
                                    <Layers className="w-8 h-8 text-honey/60" />
                                    <Label className={cn(glass.microLabel, "opacity-40 tracking-[0.5em] font-black italic uppercase text-[12px]")}>DATA_VECTOR_SELECTION_V5.2</Label>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    {sectionOptions.map((section) => (
                                        <motion.div
                                            key={section.id}
                                            whileHover={{ scale: 1.05, y: -8 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSections({ ...sections, [section.id]: !sections[section.id as keyof typeof sections] })}
                                            className={cn(
                                                "cursor-pointer p-10 rounded-[4rem] border-2 transition-all flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden group/opt shadow-4xl",
                                                sections[section.id as keyof typeof sections]
                                                    ? "bg-honey/15 border-honey/60 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
                                                    : "bg-gray-50 border-white/5 hover:border-honey/40"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-1000 shadow-4xl",
                                                sections[section.id as keyof typeof sections] ? "bg-honey text-black rotate-12" : "bg-gray-100 text-foreground/10 group-hover/opt:bg-honey/10 group-hover/opt:text-honey"
                                            )}>
                                                <section.icon className="w-10 h-10" />
                                            </div>
                                            <span className={cn(glass.microLabel, "font-black tracking-[0.2em] opacity-40 group-hover/opt:opacity-100 text-[11px] italic uppercase")}>{section.label}</span>

                                            {sections[section.id as keyof typeof sections] && (
                                                <div className="absolute top-6 right-6">
                                                    <div className="w-4 h-4 rounded-full bg-honey shadow-[0_0_20px_rgba(251,191,36,1)] animate-pulse" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Temporal Scope Alignment */}
                            <div className="space-y-12">
                                <div className="flex items-center gap-6 border-l-4 border-honey/40 pl-8">
                                    <Clock className="w-8 h-8 text-honey/60" />
                                    <Label className={cn(glass.microLabel, "opacity-40 tracking-[0.5em] font-black italic uppercase text-[12px]")}>TEMPORAL_AUDIT_ALIGNMENT</Label>
                                </div>
                                <div className="flex flex-wrap gap-8 bg-gray-50 p-4 rounded-[4rem] border border-white/5 w-fit shadow-4xl backdrop-blur-3xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-honey/[0.01] animate-shimmer" />
                                    {['7', '30', '90', '365'].map((days) => (
                                        <button
                                            key={days}
                                            onClick={() => setReportScope(days)}
                                            className={cn(
                                                "h-20 px-14 rounded-[3rem] font-black italic text-lg uppercase tracking-[0.3em] transition-all duration-1000 relative z-10",
                                                reportScope === days
                                                    ? 'bg-[#FBBE24] text-black shadow-4xl'
                                                    : 'text-foreground/20 hover:text-honey hover:bg-honey/10'
                                            )}
                                        >
                                            {days === '365' ? 'Annual Cycle' : `${days}_Day_Audit`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format & Execution Engine */}
                            <div className="pt-16 border-t border-gray-200 space-y-16">
                                <div className="flex flex-col xl:flex-row gap-12 items-center justify-between">
                                    <div className="flex bg-gray-50 p-4 rounded-[4rem] border border-white/5 gap-6 shadow-4xl backdrop-blur-3xl w-full xl:w-fit">
                                        <button
                                            onClick={() => setSelectedFormat('PDF')}
                                            className={cn(
                                                "h-20 flex-1 xl:w-48 rounded-[3rem] font-black italic text-xl uppercase tracking-[0.3em] transition-all duration-1000 flex items-center justify-center gap-6",
                                                selectedFormat === 'PDF' ? "bg-honey/20 text-honey shadow-4xl border border-honey/40" : "text-foreground/20 hover:bg-white/5"
                                            )}
                                        >
                                            <FileText className="w-8 h-8" /> .PDF
                                        </button>
                                        <button
                                            onClick={() => setSelectedFormat('XLSX')}
                                            className={cn(
                                                "h-20 flex-1 xl:w-48 rounded-[3rem] font-black italic text-xl uppercase tracking-[0.3em] transition-all duration-1000 flex items-center justify-center gap-6",
                                                selectedFormat === 'XLSX' ? "bg-honey/20 text-honey shadow-4xl border border-honey/40" : "text-foreground/20 hover:bg-white/5"
                                            )}
                                        >
                                            <FileSpreadsheet className="w-8 h-8" /> .XLSX
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating}
                                        className={cn(glass.btnPrimary, "h-24 bg-[#FBBE24] text-black shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] px-20 font-black italic text-3xl transition-all uppercase flex items-center justify-center gap-10 group/gen w-full xl:w-[600px] rounded-[3.5rem] pl-32")}
                                    >
                                        {isGenerating ? <RefreshCw className="w-12 h-12 animate-spin" /> : <Download className="w-12 h-12 group-hover/gen:translate-y-4 transition-all duration-1000" />}
                                        Initialize_Audit_Synthesis
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isGenerating && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: 30 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: 30 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex justify-between items-center px-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-4 h-4 rounded-full bg-honey animate-ping shadow-[0_0_20px_rgba(251,191,36,1)]" />
                                                    <span className="text-xl font-black italic text-honey uppercase tracking-[0.4em]">EXTRACTING_DATA_VECTORS_KERNEL_V5.2...</span>
                                                </div>
                                                <span className="text-4xl font-black italic tabular-nums tracking-tighter text-gray-900">{Math.round(genProgress)}%</span>
                                            </div>
                                            <div className="h-6 bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner border border-white/5 relative">
                                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10 blur-sm" />
                                                <motion.div
                                                    className="h-full bg-gradient-amber rounded-full shadow-[0_0_40px_rgba(245,158,11,0.8)] relative overflow-hidden"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${genProgress}%` }}
                                                    transition={{ ease: "easeOut", duration: 0.5 }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Industrial Extraction Vault (History) */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-8 border-honey/40 border-l-8 pl-14 relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-honey animate-pulse" />
                            <div className="space-y-2">
                                <h3 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Managed <span className="text-honey">Archive</span></h3>
                                <p className={cn(glass.microLabel, "opacity-30 italic font-black uppercase tracking-[0.6em] text-[12px]")}>SEQUENTIAL_AUDIT_REGISTRY_V5.2</p>
                            </div>
                        </div>

                        {reports.length === 0 && !isLoading ? (
                            <div className={cn(glass.card, "py-48 text-center space-y-12 border-dashed border-honey/40 bg-honey/[0.01] rounded-[6rem] opacity-40 shadow-4xl group/void")}>
                                <div className="w-40 h-40 rounded-[4rem] bg-honey/5 border border-honey/20 flex items-center justify-center mx-auto mb-8 shadow-4xl group-hover/void:scale-110 group-hover/void:rotate-12 transition-all duration-1000">
                                    <SearchCode className="w-20 h-20 text-honey/30" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-20">NULL_REPORTS_IN_VAULT</p>
                                    <p className="text-2xl font-black opacity-10 uppercase tracking-[0.5em] italic">Initialize extraction cycle to populate registry.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {reports.slice(0, 8).map((report, i) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: i * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                        className={cn(glass.card, "p-12 group hover:border-honey/60 hover:bg-honey/[0.08] hover:shadow-[0_80px_150px_-30px_rgba(251,191,36,0.3)] transition-all duration-1000 flex items-center justify-between shadow-4xl border-white/5 bg-white rounded-[5rem] overflow-hidden relative")}
                                    >
                                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-honey/[0.03] rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20 group-hover:scale-125 transition-transform duration-1000" />

                                        <div className="flex items-center gap-10 relative z-10">
                                            <div className="w-24 h-24 rounded-[3.5rem] bg-gray-50 flex items-center justify-center text-foreground/20 group-hover:bg-honey/20 group-hover:text-honey transition-all duration-1000 shadow-4xl border border-white/5 group-hover:scale-110 group-hover:rotate-12">
                                                <FileText className="w-12 h-12" />
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-4xl font-black italic text-foreground tracking-[0.02em] uppercase leading-none group-hover:text-honey transition-colors duration-1000 italic truncate max-w-[280px]">
                                                    {report.report_type.split('_').map(w => w.toUpperCase()).join('_')}
                                                </h4>
                                                <div className="flex items-center gap-6">
                                                    <div className="px-6 py-2 rounded-full bg-gray-50 text-foreground/40 font-black italic text-[11px] tracking-[0.4em] uppercase border border-white/5 shadow-2xl skew-x-[-15deg]">
                                                        <span className="skew-x-[15deg] block">{report.file_format}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[12px] font-black text-foreground/20 italic tracking-[0.3em] uppercase">
                                                        <Calendar className="w-5 h-5 text-honey/40" />
                                                        {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className={cn(glass.btnSecondary, "h-20 w-20 p-0 rounded-[2.5rem] bg-white shadow-4xl border-white/5 hover:text-honey hover:scale-110 transition-all duration-700 relative z-10")}
                                            onClick={() => {
                                                if (report.file_url) {
                                                    window.open(report.file_url, '_blank');
                                                } else {
                                                    toast.info('Neural synthesis active...');
                                                }
                                            }}
                                        >
                                            {report.status === 'processing' || report.status === 'pending'
                                                ? <RefreshCw className="w-10 h-10 animate-spin" />
                                                : <Download className="w-10 h-10" />
                                            }
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Industrial Distribution Nodes (Schedules) - Right (1/3) */}
                <div className="lg:col-span-4 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(glass.card, "p-12 shadow-4xl relative overflow-hidden border-honey/10 bg-white/60 backdrop-blur-3xl min-h-[800px] flex flex-col rounded-[5rem] group")}
                    >
                        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-honey/[0.04] rounded-full blur-[150px] pointer-events-none -mr-40 -mb-40 group-hover:scale-125 transition-transform duration-[3000ms]" />

                        <div className="flex items-center justify-between mb-16 relative z-10 px-4">
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Registry <span className="text-honey">Nodes</span></h3>
                                <p className={cn(glass.microLabel, "opacity-30 italic font-black uppercase tracking-[0.5em] text-[10px]")}>ACTIVE_DISTRIBUTION_TOPOLOGY</p>
                            </div>
                            <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000">
                                <Network className="w-10 h-10 text-honey opacity-40" />
                            </div>
                        </div>

                        {schedules.length === 0 && !isLoading ? (
                            <div className="text-center py-32 space-y-12 flex-1 flex flex-col justify-center opacity-40 italic group/void">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-honey/5 border border-honey/20 flex items-center justify-center mx-auto opacity-40 shadow-4xl group-hover/void:scale-110 group-hover/void:rotate-12 transition-all duration-1000">
                                    <Clock className="w-16 h-16 text-honey" />
                                </div>
                                <div className="space-y-6">
                                    <p className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-20">VOID_SYNC_FLOW</p>
                                    <p className="text-xl font-bold uppercase tracking-widest leading-relaxed italic border-l-2 border-honey/20 pl-8 mx-auto max-w-[280px]">Automate high-fidelity audit vectors via neural dissemination.</p>
                                </div>
                                <button onClick={() => setIsScheduleModalOpen(true)} className={cn(glass.btnPrimary, "h-20 bg-[#FBBE24] text-black shadow-4xl rounded-[3rem] mt-10 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-6 group/btn")}>
                                    <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                                    Establish Node
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10 relative z-10 flex-1">
                                {schedules.map((schedule, i) => (
                                    <motion.div
                                        key={schedule.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1, duration: 1 }}
                                        whileHover={{ x: 20, scale: 1.02 }}
                                        className="bg-white/80 border border-white/5 p-10 rounded-[3.5rem] flex items-center justify-between group/sch hover:border-honey/60 transition-all duration-1000 shadow-4xl"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className={cn(
                                                "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-1000 shadow-4xl",
                                                schedule.is_active ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-gray-100 text-foreground/20"
                                            )}>
                                                <Radio className={cn("w-10 h-10", schedule.is_active && "animate-pulse")} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-3xl font-black italic text-foreground group-hover/sch:text-honey transition-colors duration-1000 italic uppercase tracking-tighter">{schedule.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentcolor]", schedule.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                                    <p className="text-[10px] font-black italic text-foreground/30 uppercase tracking-[0.4em]">{schedule.frequency.toUpperCase()}_CYCLE_SYNC</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                            className="w-18 h-18 flex items-center justify-center rounded-[2rem] bg-gray-50 hover:bg-red-500 text-foreground/20 hover:text-gray-900 transition-all duration-700 border border-transparent hover:border-red-500 shadow-4xl active:scale-90"
                                        >
                                            <Trash2 className="w-8 h-8" />
                                        </button>
                                    </motion.div>
                                ))}

                                <button
                                    onClick={() => setIsScheduleModalOpen(true)}
                                    className={cn(glass.btnSecondary, "w-full h-24 rounded-[3.5rem] mt-8 border-dashed border-honey/40 bg-honey/[0.03] hover:bg-honey/[0.08] flex items-center justify-center gap-8 font-black italic uppercase tracking-[0.3em] text-2xl group/add hover:border-honey transition-all duration-1000 shadow-inner group/plus")}
                                >
                                    <Plus className="w-12 h-12 text-honey group-hover/plus:rotate-180 transition-transform duration-[1500ms]" />
                                    Establish_Sync_Node
                                </button>
                            </div>
                        )}

                        {/* Proprietary Protocol Dashboard */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="mt-20 p-12 bg-black rounded-[4rem] border-2 border-honey/20 space-y-8 shadow-[0_50px_100px_-20px_rgba(251,191,36,0.2)] text-gray-900 relative overflow-hidden group/proto"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-honey/[0.08] rounded-full blur-[100px] group-hover:bg-honey/[0.15] transition-all duration-1000" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl">
                                    <Lock className="w-8 h-8 text-honey" />
                                </div>
                                <span className="text-[14px] font-black italic tracking-[0.6em] text-honey uppercase italic">DISSEMINATION_TUNNEL</span>
                            </div>
                            <p className="text-lg font-black text-gray-600 leading-relaxed uppercase italic tracking-tight relative z-10 border-l-4 border-gray-200 pl-10">
                                Audit bundles are disseminated to the primary account relay node ({userId?.slice(0, 10)}...KERNEL_ST) via deep-encrypted SMTP tunnel immediately upon each industrial cycle completion.
                            </p>
                            <div className="flex justify-between items-center pt-8 relative z-10">
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-8 bg-honey/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                </div>
                                <Fingerprint className="w-12 h-12 text-honey/10 group-hover/proto:text-honey/60 group-hover/proto:scale-125 transition-all duration-1000" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Industrial Schedule Modal Overlay */}
            <AnimatePresence>
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-[100px]"
                            onClick={() => setIsScheduleModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 100, rotateX: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 100, rotateX: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={cn(glass.card, "w-full max-w-4xl p-0 overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] bg-white border-honey/40 relative z-10 rounded-[6rem]")}
                        >
                            <div className="p-16 border-b border-white/5 flex justify-between items-center bg-gray-100 backdrop-blur-3xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-honey/[0.02] animate-pulse" />
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Sync <span className="text-honey">Kernel</span></h3>
                                    <p className={cn(glass.microLabel, "font-black tracking-[0.5em] uppercase text-[12px] opacity-20 italic")}>AUTOMATED_RECURRING_DISSEMINATION_v5.2</p>
                                </div>
                                <button
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className={cn(glass.btnSecondary, "h-20 w-20 p-0 rounded-[2.5rem] bg-white shadow-4xl border-white/5 hover:text-red-500 hover:scale-110 transition-all duration-700 relative z-10")}
                                >
                                    <X className="w-10 h-10" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSchedule} className="p-20 space-y-16">
                                <div className="space-y-12">
                                    <div className="space-y-8">
                                        <Label className={cn(glass.microLabel, "ml-10 opacity-40 font-black tracking-widest text-lg uppercase italic")}>Audit Sync Identifier*</Label>
                                        <div className="relative group">
                                            <Terminal className="absolute left-10 top-1/2 -translate-y-1/2 w-10 h-10 text-honey opacity-20 transition-all duration-700 group-focus-within:opacity-100 group-focus-within:scale-110" />
                                            <Input
                                                value={newSchedule.name}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                                placeholder="IDENTIFIER_FLEET_AUDIT_V5..."
                                                className={cn(glass.input, "h-24 font-black italic text-4xl pl-26 px-12 shadow-inner rounded-[3.5rem] bg-gray-50 border-none focus:text-honey transition-all placeholder:opacity-10")}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <Label className={cn(glass.microLabel, "ml-10 opacity-40 font-black tracking-widest text-lg uppercase italic")}>Synchronization Pulse</Label>
                                            <Select value={newSchedule.frequency} onValueChange={(v: any) => setNewSchedule({ ...newSchedule, frequency: v })}>
                                                <SelectTrigger className={cn(glass.input, "h-24 px-12 font-black italic text-2xl shadow-inner rounded-[3.5rem] bg-gray-50 border-none flex items-center gap-10")}>
                                                    <div className="flex items-center gap-10">
                                                        <Clock className="w-10 h-10 text-honey opacity-40" />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className={cn(glass.selectContent, "p-6 rounded-[3.5rem]")}>
                                                    <SelectItem value="daily" className="p-8 rounded-[2.5rem] font-black italic tracking-[0.4em] uppercase text-[12px] hover:bg-honey/20 transition-all text-white">DAILY_BURST_DISSEMINATION</SelectItem>
                                                    <SelectItem value="weekly" className="p-8 rounded-[2.5rem] font-black italic tracking-[0.4em] uppercase text-[12px] hover:bg-honey/20 transition-all text-white">WEEKLY_AUDIT_REGISTRY</SelectItem>
                                                    <SelectItem value="monthly" className="p-8 rounded-[2.5rem] font-black italic tracking-[0.4em] uppercase text-[12px] hover:bg-honey/20 transition-all text-white">MONTHLY_FISCAL_CONSOLIDATION</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-8">
                                            <Label className={cn(glass.microLabel, "ml-10 opacity-40 font-black tracking-widest text-lg uppercase italic")}>Node Activity Kernel</Label>
                                            <div className={cn(glass.input, "h-24 px-12 flex items-center justify-between shadow-inner rounded-[3.5rem] bg-gray-50")}>
                                                <div className="flex items-center gap-6">
                                                    <div className={cn("w-5 h-5 rounded-full shadow-[0_0_20px_currentcolor] animate-pulse", newSchedule.is_active ? "bg-emerald-500" : "bg-red-500")} />
                                                    <span className="text-xl font-black tracking-[0.5em] uppercase opacity-20 italic">KERNEL_STATUS_ACTIVE</span>
                                                </div>
                                                <Checkbox
                                                    id="active-check"
                                                    checked={newSchedule.is_active}
                                                    onCheckedChange={(c) => setNewSchedule({ ...newSchedule, is_active: !!c })}
                                                    className="w-12 h-12 rounded-2xl border-4 border-white/5 data-[state=checked]:bg-[#FBBE24] data-[state=checked]:border-[#FBBE24] transition-all duration-700 shadow-4xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#FBBE24]/5 p-12 rounded-[4rem] border-2 border-[#FBBE24]/20 flex gap-10 items-start shadow-inner relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#FBBE24]/[0.02] rounded-full blur-[100px] pointer-events-none" />
                                        <div className="p-6 bg-[#FBBE24]/10 rounded-[2.5rem] border border-[#FBBE24]/20 shadow-4xl group-hover:scale-125 transition-transform duration-1000">
                                            <Lock className="w-12 h-12 text-[#FBBE24]" />
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <p className="text-2xl font-black italic tracking-[0.5em] uppercase text-[#FBBE24] italic">Dissemination Relay Protocol</p>
                                            <p className="text-[14px] font-black opacity-30 leading-relaxed italic border-l-4 border-[#FBBE24]/20 pl-10 uppercase tracking-tight">
                                                Archive bundles will be disseminated to the primary kernel relay node ({userId?.slice(0, 10)}...STABLE) via deep-encrypted SMTP tunnel automatically at start of cycle.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingSchedule}
                                    className={cn(glass.btnPrimary, "w-full h-24 bg-[#FBBE24] text-black shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] rounded-[3.5rem] font-black italic text-3xl transition-all uppercase flex items-center justify-center gap-10 group/save active:scale-95")}
                                >
                                    {isSavingSchedule ? <RefreshCw className="w-12 h-12 animate-spin" /> : <ShieldCheck className="w-12 h-12 group-hover/save:scale-125 transition-all duration-1000" />}
                                    Establish_Distribution_Sync
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 5s infinite linear; }
                .custom-scrollbar-modern::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar-modern::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default ReportsExportsView;
