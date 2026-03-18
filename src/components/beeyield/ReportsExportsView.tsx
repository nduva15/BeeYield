import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch as UISwitch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Check, LayoutGrid,
    Calendar, Plus, ExternalLink,
    Clock, Sparkles, X, Trash2, Shield, Loader2, FileBarChart,
    ChevronRight, Search, Zap, Cpu, Database, FileSpreadsheet,
    FileJson, PieChart, BarChart3, ArrowRight, ShieldCheck,
    Layers, MapPin, Network, Terminal, Fingerprint, Lock as LockIcon,
    SearchCode, Activity, Radio, Info, RefreshCw, ChevronDown, Box, Mail
} from "lucide-react";
import beeyieldService, { Apiary, Hive, GeneratedReport, ScheduledReport } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GlassStatCard } from './GlassTheme';

interface ReportsExportsViewProps {
    onTabChange?: (tab: string, message?: string) => void;
}

const ReportsExportsView: React.FC<ReportsExportsViewProps> = ({ onTabChange }) => {
    const { t } = useLanguage();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const [reportScope, setReportScope] = React.useState('30');
    const [selectedFormat, setSelectedFormat] = React.useState<'PDF' | 'XLSX'>('PDF');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isIntelligenceSynthesizing, setIsIntelligenceSynthesizing] = React.useState(false);
    const [genProgress, setGenProgress] = React.useState(0);

    const [isLoading, setIsLoading] = React.useState(true);

    const [reports, setReports] = React.useState<GeneratedReport[]>([]);
    const [schedules, setSchedules] = React.useState<ScheduledReport[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);

    const [selectedPlace, setSelectedPlace] = React.useState<string>('');
    const [selectedHive, setSelectedHive] = React.useState<string>('');
    const [selectedScheduleId, setSelectedScheduleId] = React.useState<string | null>(null);

    const LOCAL_SCHEDULES_KEY = React.useMemo(
        () => `beeyield_local_schedules_v1:${userId || 'anon'}`,
        [userId]
    );

    const readLocalSchedules = React.useCallback((): ScheduledReport[] => {
        try {
            const raw = globalThis.localStorage?.getItem(LOCAL_SCHEDULES_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as ScheduledReport[]) : [];
        } catch {
            return [];
        }
    }, [LOCAL_SCHEDULES_KEY]);

    const writeLocalSchedules = React.useCallback((next: ScheduledReport[]) => {
        try {
            globalThis.localStorage?.setItem(LOCAL_SCHEDULES_KEY, JSON.stringify(next));
        } catch {
            // ignore (storage disabled)
        }
    }, [LOCAL_SCHEDULES_KEY]);

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
    const [recipientsDraft, setRecipientsDraft] = React.useState('');
    const [scheduleScopeDays, setScheduleScopeDays] = React.useState(30);

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

    const REPORTS_CACHE_KEY = "beeyield_reports_cache_v1";

    const readCache = React.useCallback(() => {
        try {
            const raw = localStorage.getItem(REPORTS_CACHE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }, []);

    const writeCache = React.useCallback((data: any) => {
        try {
            localStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(data));
        } catch { /* ignore */ }
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [apiariesData, hivesData, reportsData, schedulesData] = await Promise.all([
                beeyieldService.getApiaries(),
                beeyieldService.getHives(),
                beeyieldService.getGeneratedReports(),
                beeyieldService.getScheduledReports()
            ]);

            const filteredReports = reportsData.filter(r => !r.user_id || r.user_id === userId);
            setReports(filteredReports);
            writeCache({ reports: filteredReports, timestamp: Date.now() });

            if (userId) {
                setApiaries(apiariesData.filter(a => !a.user_id || a.user_id === userId));
                setHives(hivesData.filter(h => !h.user_id || h.user_id === userId));
                setSchedules(schedulesData.filter(s => s.is_active && (!s.user_id || s.user_id === userId)));
            } else {
                setApiaries(apiariesData || []);
                setHives(hivesData || []);
                setSchedules(schedulesData || []);
            }

            // No-backend fallback for schedules: if remote returns none, hydrate from local.
            if (!schedulesData || schedulesData.length === 0) {
                const local = readLocalSchedules();
                if (local.length > 0) setSchedules(local.filter(s => s.is_active));
            }
        } catch (error) {
            console.error('Data sync failed', error);
            const cached = readCache();
            if (cached?.reports) {
                setReports(cached.reports);
                toast.info('Offline: Showing last known reports');
            } else {
                toast.error('Could not load reports archive');
            }
            // In offline/no-backend scenarios, keep schedules functional from local store.
            const local = readLocalSchedules();
            if (local.length > 0) setSchedules(local.filter(s => s.is_active));
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, [userId]);

    const downloadBlob = React.useCallback((blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }, []);

    const localExportReport = React.useCallback(async () => {
        const scopeDays = Math.max(1, parseInt(reportScope, 10) || 30);
        const since = Date.now() - scopeDays * 86400000;
        const within = (d?: string | null) => {
            if (!d) return true;
            const t = new Date(d).getTime();
            return Number.isFinite(t) ? t >= since : true;
        };

        const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
            try { return await p; } catch { return fallback; }
        };

        const enabled = (id: keyof typeof sections) => !!sections[id];
        const [apiariesData, hivesData] = await Promise.all([
            enabled('apiaries') ? safe(beeyieldService.getApiaries(), [] as Apiary[]) : Promise.resolve([] as Apiary[]),
            enabled('hives') ? safe(beeyieldService.getHives(), [] as Hive[]) : Promise.resolve([] as Hive[]),
        ]);

        const apiariesFiltered = selectedPlace ? (apiariesData || []).filter((a) => a.id === selectedPlace) : (apiariesData || []);
        const hivesFiltered = (hivesData || []).filter((h) => {
            if (selectedHive && String(h.id) !== String(selectedHive)) return false;
            if (selectedPlace && String((h as any).apiary_id) !== String(selectedPlace)) return false;
            return true;
        });

        const notes = enabled('notes')
            ? (await safe(beeyieldService.getNotes(), [] as any[])).filter((n: any) => within(n?.created_at || n?.updated_at || n?.note_date))
            : [];
        const inspections = enabled('inspections')
            ? (await safe(beeyieldService.getInspections(selectedHive || undefined), [] as any[])).filter((i: any) => within(i?.inspection_date || i?.created_at || i?.updated_at))
            : [];
        const harvests = enabled('harvests')
            ? (await safe(beeyieldService.getHarvests({ hive_id: selectedHive || undefined, apiary_id: selectedPlace || undefined }), [] as any[])).filter((h: any) => within(h?.harvest_date || h?.created_at || h?.updated_at))
            : [];
        const myRequests = enabled('my_requests')
            ? (await safe(beeyieldService.getRequests(), [] as any[])).filter((r: any) => within(r?.created_at || r?.updated_at))
            : [];
        const tasks = enabled('tasks')
            ? (await safe(beeyieldService.getTasks(), [] as any[])).filter((t: any) => within(t?.created_at || t?.updated_at))
            : [];

        const payload = {
            meta: {
                generated_at: new Date().toISOString(),
                scope_days: scopeDays,
                format_requested: selectedFormat,
                place_id: selectedPlace || null,
                hive_id: selectedHive || null,
                sections: Object.keys(sections).filter((k) => (sections as any)[k]),
            },
            apiaries: apiariesFiltered,
            hives: hivesFiltered,
            notes,
            inspections,
            harvests,
            requests: myRequests,
            tasks,
        };

        const json = JSON.stringify(payload, null, 2);
        downloadBlob(
            new Blob([json], { type: 'application/json;charset=utf-8' }),
            `beeyield-report-${new Date().toISOString().slice(0, 10)}-${scopeDays}d.json`
        );
    }, [downloadBlob, reportScope, sections, selectedFormat, selectedHive, selectedPlace]);

    const handleGenerateReport = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setGenProgress(10);
        const toastId = toast.loading('Preparing report…');
        let interval: number | null = null;

        try {
            // Animate progress while the backend job runs; completion is based on real job status.
            interval = window.setInterval(() => {
                setGenProgress(prev => (prev >= 90 ? 90 : prev + 4));
            }, 700);

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

            if (error) {
                // No backend / reports worker available → local export fallback (JSON).
                await localExportReport();
                toast.success('Exported locally (JSON)', { id: toastId });
                setGenProgress(100);
                return;
            }
            toast.success('Report queued', { id: toastId });

            const jobId = data?.id;
            if (jobId) {
                const last = await beeyieldService.waitForReport(jobId, { timeoutMs: 180_000, pollMs: 1500 });
                if (last?.status === 'completed') {
                    toast.success('Report ready', { id: toastId });
                    await beeyieldService.downloadReport({ file_url: last.file_url, file_name: (last as any).file_name });
                } else if (last?.status === 'failed') {
                    toast.error('Report failed', { id: toastId });
                } else {
                    toast.info('Report is still processing', { id: toastId });
                }
            }

            setGenProgress(100);
            loadData();
        } catch (error) {
            console.error('Extraction failed', error);
            try {
                await localExportReport();
                toast.success('Backend unavailable — exported locally (JSON)', { id: toastId });
                setGenProgress(100);
            } catch (e) {
                toast.error('Report failed', { id: toastId });
            }
        } finally {
            if (interval) window.clearInterval(interval);
            setIsGenerating(false);
            setGenProgress(0);
        }
    };

    const handleGenerateInsights = async () => {
        if (isIntelligenceSynthesizing) return;
        setIsIntelligenceSynthesizing(true);
        const toastId = toast.loading("Creating insights…");

        try {
            const { data, error } = await beeyieldService.generateReport({
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

            if (error) {
                toast.error('System insights require the reports backend', { id: toastId });
                return;
            }
            toast.success('Insights queued', { id: toastId });

            const jobId = data?.id;
            if (jobId) {
                const last = await beeyieldService.waitForReport(jobId, { timeoutMs: 240_000, pollMs: 2000 });
                if (last?.status === 'completed') {
                    toast.success('Insights ready', { id: toastId });
                    await beeyieldService.downloadReport({ file_url: last.file_url, file_name: (last as any).file_name });
                } else if (last?.status === 'failed') {
                    toast.error('Insights failed', { id: toastId });
                } else {
                    toast.info('Insights are still processing', { id: toastId });
                }
            }

            loadData();
        } catch (error) {
            console.error('Report generation failed', error);
            toast.error('System insights require the reports backend', { id: toastId });
        } finally {
            setIsIntelligenceSynthesizing(false);
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.name) {
            toast.error("Schedule identifier required");
            return;
        }

        setIsSavingSchedule(true);
        const toastId = toast.loading('Saving schedule…');
        try {
            const recipients = recipientsDraft
                .split(/[,;\n]/g)
                .map(s => s.trim())
                .filter(Boolean);

            const { error } = await beeyieldService.createScheduledReport({
                ...newSchedule,
                recipients,
                user_id: userId || undefined,
                report_config: {
                    sections: Object.keys(sections).filter(k => sections[k as keyof typeof sections]),
                    scope_days: scheduleScopeDays,
                    place_id: selectedPlace || undefined,
                    hive_id: selectedHive || undefined,
                    user_id: userId
                }
            } as any);

            if (error) {
                // No backend? Persist locally so UX still works.
                const isNoBackend = String(error).toLowerCase().includes('no client');
                if (!isNoBackend) throw error;

                const local = readLocalSchedules();
                const id =
                    typeof crypto !== 'undefined' && 'randomUUID' in crypto
                        ? `local-${crypto.randomUUID()}`
                        : `local-${Date.now()}`;
                const created_at = new Date().toISOString();
                const localRow: ScheduledReport = {
                    id,
                    created_at,
                    user_id: userId || null,
                    name: newSchedule.name,
                    report_type: newSchedule.report_type,
                    frequency: newSchedule.frequency,
                    recipients,
                    is_active: newSchedule.is_active,
                    report_config: {
                        sections: Object.keys(sections).filter(k => sections[k as keyof typeof sections]),
                        scope_days: scheduleScopeDays,
                        place_id: selectedPlace || undefined,
                        hive_id: selectedHive || undefined,
                        user_id: userId
                    } as any
                } as any;
                const next = [localRow, ...local];
                writeLocalSchedules(next);
                setSchedules(next.filter(s => s.is_active));
                toast.success('Schedule saved (local)', { id: toastId });
            } else {
                toast.success('Schedule saved', { id: toastId });
                loadData();
            }

            setIsScheduleModalOpen(false);
            setNewSchedule({
                name: "",
                report_type: "full_summary",
                frequency: "weekly",
                recipients: [],
                is_active: true
            });
            setRecipientsDraft('');
            setScheduleScopeDays(30);
        } catch (error) {
            console.error('Schedule save failed', error);
            toast.error('Couldn’t save schedule', { id: toastId });
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        const toastId = toast.loading('Deleting schedule…');
        try {
            const { error } = await beeyieldService.deleteScheduledReport(id);
            if (error) {
                const isNoBackend = String(error).toLowerCase().includes('no client');
                if (!isNoBackend) throw error;

                const local = readLocalSchedules();
                const next = local.filter(s => s.id !== id);
                writeLocalSchedules(next);
                setSchedules(next.filter(s => s.is_active));
                toast.success('Schedule deleted (local)', { id: toastId });
            } else {
                toast.success('Schedule deleted', { id: toastId });
                loadData();
            }
        } catch (error) {
            toast.error('Couldn’t delete schedule', { id: toastId });
        }
    };

    const sectionOptions = [
        { id: 'apiaries', label: 'Apiaries', icon: MapPin },
        { id: 'hives', label: 'Hives', icon: Box },
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'inspections', label: 'Inspections', icon: ShieldCheck },
        { id: 'harvests', label: 'Harvests', icon: BarChart3 },
        { id: 'my_requests', label: 'Requests', icon: ExternalLink },
        { id: 'tasks', label: 'Tasks', icon: Check },
    ];

    return (
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BeeYieldPageHeader
                    icon={FileBarChart}
                    label="Reports"
                    onBack={() => onTabChange?.('home')}
                    title={<>Reports <span className="text-[#1B9157]">Archive</span></>}
                    subtitle="Create reports from your hive and apiary data."
                    actions={
                        <button
                            type="button"
                            onClick={() => setIsScheduleModalOpen(true)}
                            className={cn(glass.btnPrimary, "h-9 px-4 text-xs font-bold flex items-center gap-2")}
                        >
                            <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
                            New schedule
                        </button>
                    }
                />

                {/* Stats Row (match Home) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <GlassStatCard label="Total Audits" value={reports.length.toString()} icon={FileText} index={0} />
                    <GlassStatCard label="Active schedules" value={schedules.length.toString()} icon={Radio} index={1} color="text-[#1B9157]" />
                    <GlassStatCard
                        label="Queue Size"
                        value={reports.filter(r => r.status === 'processing').length.toString()}
                        icon={Loader2}
                        index={2}
                        color="text-[#F4D03F]"
                    />
                    <GlassStatCard label="Analysis Modules" value="04" icon={Sparkles} index={3} color="text-[#F4D03F]" />
                </div>

            {/* Insights banner */}
            <div className={cn(glass.card, "p-5 bg-emerald-600 border-none flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-lg")}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32" />
                <div className="space-y-1.5 flex-1 relative z-10 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-white/20 text-[10px] font-bold tracking-wider text-white">
                        <Zap className="w-3 h-3 text-amber-300" />
                        Insights
                    </div>
                    <h2 className="text-base font-bold text-white tracking-tight">Create insights</h2>
                    <p className="text-[11px] font-medium text-emerald-100/70 max-w-md">Summaries and patterns based on your recent data.</p>
                </div>
                <button
                    onClick={handleGenerateInsights}
                    disabled={isIntelligenceSynthesizing}
                    className={cn(glass.btnSecondary, "h-9 px-6 bg-white text-emerald-700 border-none font-bold text-xs shadow-xl relative z-10 shrink-0")}
                >
                    {isIntelligenceSynthesizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Create insights
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Report options */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={cn(glass.card, "p-0 overflow-hidden bg-white border-gray-200 shadow-sm")}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Report Configuration</h3>
                                <p className="text-[10px] font-medium text-gray-400">Configure your report data and format</p>
                            </div>
                            <Terminal className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="p-5 space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Included Sections</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {sectionOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            id={`report-section-${opt.id}`}
                                            onClick={() => setSections({ ...sections, [opt.id]: !sections[opt.id as keyof typeof sections] })}
                                            aria-pressed={sections[opt.id as keyof typeof sections]}
                                            className={cn(
                                                "p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all group",
                                                sections[opt.id as keyof typeof sections] ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <opt.icon className={cn("w-5 h-5 transition-colors", sections[opt.id as keyof typeof sections] ? "text-emerald-500" : "text-gray-300")} />
                                            <span className="text-[10px] font-bold tracking-tighter sm:tracking-normal">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-gray-100">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold tracking-wider text-gray-400 ml-1" id="label-report-timeframe">Timeframe</label>
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1 overflow-x-auto" role="radiogroup" aria-labelledby="label-report-timeframe">
                                        {['7', '30', '90', '365'].map((d) => (
                                            <button
                                                key={d}
                                                id={`report-timeframe-${d}`}
                                                role="radio"
                                                aria-checked={reportScope === d}
                                                onClick={() => setReportScope(d)}
                                                className={cn(
                                                    "h-7 px-3 rounded-md text-[10px] font-bold tracking-wider transition-all whitespace-nowrap",
                                                    reportScope === d ? "bg-white text-[#1A1A1A] shadow-sm border border-gray-100" : "text-gray-400 hover:text-[#1A1A1A]"
                                                )}
                                            >
                                                {d === '365' ? 'Annual' : `${d}D`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold tracking-wider text-gray-400 ml-1" id="label-report-format">File Format</label>
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1" role="radiogroup" aria-labelledby="label-report-format">
                                        {['PDF', 'XLSX'].map((f) => (
                                            <button
                                                key={f}
                                                id={`report-format-${f}`}
                                                role="radio"
                                                aria-checked={selectedFormat === f}
                                                onClick={() => setSelectedFormat(f as any)}
                                                className={cn(
                                                    "flex-1 h-7 rounded-md text-[10px] font-bold tracking-wider transition-all",
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
                                    <span>Generate report</span>
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
                            <p className="text-sm font-semibold text-gray-600">Past reports</p>
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
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={async () => {
                                            const { ok } = await beeyieldService.downloadReport({
                                                file_url: r.file_url,
                                                file_name: (r as any).file_name
                                            });
                                            if (!ok) toast.error('Download unavailable yet');
                                        }}
                                        aria-label="Download report"
                                        title="Download report"
                                        className="w-9 h-9 rounded-xl bg-gray-50 border border-transparent hover:border-emerald-200 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all shadow-sm"
                                     >
                                        <Download className="w-4 h-4" />
                                     </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Schedules */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <div className={cn(glass.section, "overflow-hidden p-0")}>
                            <div className="px-5 py-4 border-b border-[#F4D03F]/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center">
                                        <Radio className="w-4 h-4 text-[#F4D03F]" aria-hidden="true" focusable="false" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#1A1A1A]">Schedules</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] text-gray-500">Local-ready</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsScheduleModalOpen(true)}
                                    className="text-[12px] text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                                >
                                    New <ArrowRight className="w-3 h-3" aria-hidden="true" focusable="false" />
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {schedules.map((s, i) => (
                                        <motion.div
                                            key={s.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="relative group"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedScheduleId(selectedScheduleId === s.id ? null : s.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors",
                                                    selectedScheduleId === s.id ? "bg-[#F9F7F2]" : "hover:bg-[#F9F7F2]"
                                                )}
                                            >
                                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#1B9157]/10")}>
                                                    <Radio className="w-4 h-4 text-[#1B9157]" aria-hidden="true" focusable="false" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{s.name}</p>
                                                    <p className="text-[12px] text-gray-500 truncate">
                                                        {String(s.frequency).toUpperCase()} · {(s.report_type || 'full_summary').replace('_', ' ')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <span className="text-[10px] text-gray-400">
                                                        {(s.recipients?.length || 0) > 0 ? `${s.recipients.length} recipient(s)` : 'No recipients'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSchedule(s.id)}
                                                aria-label="Delete schedule"
                                                title="Delete schedule"
                                                className="absolute top-3 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                                            </button>

                                            <AnimatePresence>
                                                {selectedScheduleId === s.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="px-5 pb-4 -mt-1"
                                                    >
                                                        <div className="p-4 bg-white rounded-xl border border-[#F4D03F]/10">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400">Scope</p>
                                                                    <p className="text-sm font-semibold text-[#1A1A1A]">
                                                                        {String((s as any)?.report_config?.scope_days ?? scheduleScopeDays)} days
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400">Sections</p>
                                                                    <p className="text-sm font-semibold text-[#1A1A1A]">
                                                                        {Array.isArray((s as any)?.report_config?.sections) ? (s as any).report_config.sections.length : '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {Array.isArray(s.recipients) && s.recipients.length > 0 && (
                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                    <p className="text-[10px] font-bold text-gray-400">Recipients</p>
                                                                    <p className="text-[12px] text-gray-600 break-words">{s.recipients.join(', ')}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {schedules.length === 0 && (
                                    <div className="px-5 py-8 text-center">
                                        <p className="text-sm font-semibold text-[#1A1A1A]">No schedules yet</p>
                                        <p className="text-[12px] text-gray-500 mt-1">Create one to automate your report exports.</p>
                                        <button
                                            type="button"
                                            onClick={() => setIsScheduleModalOpen(true)}
                                            className={cn(glass.btnPrimary, "mt-4 mx-auto")}
                                        >
                                            <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
                                            New schedule
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                <DialogContent className={cn("max-w-xl bg-transparent border-none p-0 shadow-none overflow-visible")}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative border-[#F4D03F]/10 bg-[#FFF9F0]/95 backdrop-blur-2xl")}
                    >
                        <DialogHeader className="bg-[#FFF9F0] px-6 py-5 border-b border-border/50 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shadow-sm border border-emerald-100">
                                    <Network className="w-4 h-4 text-emerald-600" aria-hidden="true" focusable="false" />
                                </div>
                                <div>
                                    <DialogTitle className={cn(glass.sectionTitle, "text-lg normal-case italic")}>
                                        Create <span className="text-[#1B9157]">Schedule</span>
                                    </DialogTitle>
                                    <DialogDescription className={cn(glass.microLabel, "normal-case italic font-bold opacity-40 mt-0.5")}>
                                        Configure automatic report delivery (works offline too).
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleCreateSchedule} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="schedule-report-type" className={glass.microLabel}>Report Type</Label>
                                    <div className="relative">
                                        <select
                                            id="schedule-report-type"
                                            value={newSchedule.report_type}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, report_type: e.target.value })}
                                            className={cn(glass.select, "w-full appearance-none pr-8 cursor-pointer")}
                                        >
                                            <option value="full_summary">Full Summary</option>
                                            <option value="ai_analysis">Deep Insights</option>
                                            <option value="financial_audit">Audit Ledger</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="schedule-frequency" className={glass.microLabel}>Interval</Label>
                                    <div className="relative">
                                        <select
                                            id="schedule-frequency"
                                            value={newSchedule.frequency}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                                            className={cn(glass.select, "w-full appearance-none pr-8 cursor-pointer")}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule-name" className={glass.microLabel}>Schedule Name</Label>
                                <input
                                    id="schedule-name"
                                    placeholder="e.g. Weekly Production Audit"
                                    value={newSchedule.name}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                    className={cn(glass.input, "h-11 bg-white/50 w-full")}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule-recipients" className={glass.microLabel}>Recipient Emails</Label>
                                <div className="relative">
                                    <textarea
                                        id="schedule-recipients"
                                        placeholder="Enter emails (comma separated)"
                                        value={recipientsDraft}
                                        onChange={(e) => setRecipientsDraft(e.target.value)}
                                        className={cn(glass.select, "w-full h-20 py-3 appearance-none resize-none bg-white/50")}
                                        autoComplete="email"
                                    ></textarea>
                                    <Mail className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 ml-1">Comma, semicolon, or newline separated</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="schedule-scope" className={glass.microLabel}>Timeframe (Days)</Label>
                                    <input
                                        id="schedule-scope"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={scheduleScopeDays}
                                        onChange={(e) => setScheduleScopeDays(parseInt(e.target.value) || 30)}
                                        className={cn(glass.input, "h-11 bg-white/50 w-full")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="schedule-active" className={glass.microLabel}>Status</Label>
                                    <div className={cn(glass.input, "h-11 bg-white/50 w-full flex items-center justify-between")}>
                                        <span className="text-[10px] font-bold text-[#1A1A1A]/60">Active</span>
                                        <UISwitch 
                                            id="schedule-active"
                                            checked={newSchedule.is_active}
                                            onCheckedChange={(c) => setNewSchedule({ ...newSchedule, is_active: !!c })}
                                            className="data-[state=checked]:bg-[#1B9157]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className={glass.microLabel}>Included Sections</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {sectionOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            id={`schedule-section-${opt.id}`}
                                            type="button"
                                            onClick={() => setSections({ ...sections, [opt.id]: !sections[opt.id as keyof typeof sections] })}
                                            aria-pressed={sections[opt.id as keyof typeof sections]}
                                            className={cn(
                                                "p-3 rounded-xl border flex items-center gap-2 transition-all",
                                                sections[opt.id as keyof typeof sections]
                                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"
                                                    : "bg-white/40 border-transparent text-gray-500 hover:border-gray-200"
                                            )}
                                        >
                                            <opt.icon className={cn("w-4 h-4", sections[opt.id as keyof typeof sections] ? "text-emerald-600" : "text-gray-300")} />
                                            <span className="text-[10px] font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className={cn(glass.btnSecondary, "flex-1 h-11")}
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSavingSchedule} className={cn(glass.btnPrimary, "flex-1 h-11")}>
                                    {isSavingSchedule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Save Schedule
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </DialogContent>
            </Dialog>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default ReportsExportsView;
