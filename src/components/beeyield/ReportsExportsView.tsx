import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Grid3X3, Box, Check, LayoutGrid, FileInput,
    Calendar, History, Plus, Bell, MoreVertical, ExternalLink,
    AlertCircle, CheckCircle2, Clock, Sparkles, X, Trash2, Shield, Loader2, Bot
} from 'lucide-react';
import { beeyieldService, Apiary, Hive, GeneratedReport, ScheduledReport } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface ReportsExportsViewProps {
    onTabChange?: (tab: string, message?: string) => void;
}

const ReportsExportsView: React.FC<ReportsExportsViewProps> = () => {
    const { t } = useLanguage();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const [reportScope, setReportScope] = useState('30');
    const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'XLSX'>('PDF');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAISynthesizing, setIsAISynthesizing] = useState(false);
    const [genProgress, setGenProgress] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);

    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [selectedHive, setSelectedHive] = useState<string>('');

    // Schedule Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        name: "",
        report_type: "full_summary",
        frequency: "weekly" as 'daily' | 'weekly' | 'monthly',
        recipients: [] as string[],
        is_active: true
    });

    // Checkboxes for sections
    const [sections, setSections] = useState({
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
                setSchedules(schedulesData.filter(s => !s.user_id || s.user_id === userId));
            } else {
                setApiaries(apiariesData || []);
                setHives(hivesData || []);
                setReports(reportsData || []);
                setSchedules(schedulesData || []);
            }
        } catch (error) {
            console.error('Failed to load data for reports', error);
            toast.error('Sync failed');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    const handleGenerateReport = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setGenProgress(10);

        try {
            // Simulate progression
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

            toast.success('Report generation started!', {
                description: 'Your summary will appear in history shortly.'
            });

            // Reload reports
            setTimeout(async () => {
                const freshReports = await beeyieldService.getGeneratedReports();
                setReports(freshReports);
            }, 2000);

        } catch (error) {
            console.error('Generation failed', error);
            toast.error('Failed to generate report');
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

        toast.info("BeeYield AI is analyzing your data...", {
            icon: <Sparkles className="w-4 h-4 text-amber-500" />
        });

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

            if (error) throw error;

            toast.success('AI Insights report queued!', {
                description: 'We are processing your deep scan analysis.'
            });

            loadData();
        } catch (error) {
            console.error('AI generation failed', error);
            toast.error('AI analysis failed');
        } finally {
            setIsAISynthesizing(false);
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.name) {
            toast.error("Schedule name is required");
            return;
        }

        setIsSavingSchedule(true);
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

            toast.success('Report schedule created!');
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
            console.error('Failed to create schedule', error);
            toast.error('Failed to save schedule');
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        try {
            const { error } = await beeyieldService.deleteScheduledReport(id);
            if (error) throw error;
            toast.success('Schedule removed');
            loadData();
        } catch (error) {
            toast.error('Failed to remove schedule');
        }
    };

    const sectionOptions = [
        { id: 'apiaries', label: 'My apiaries' },
        { id: 'hives', label: 'My hives' },
        { id: 'overview', label: 'Hive overview' },
        { id: 'notes', label: 'Latest notes' },
        { id: 'inspections', label: 'Latest inspections' },
        { id: 'harvests', label: 'Latest harvests' },
        { id: 'my_requests', label: 'My requests' },
        { id: 'tasks', label: 'My tasks' },
    ];

    const currentPlace = apiaries.find(a => a.id === selectedPlace);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#1B9157]/10 rounded-full" />
                    <Loader2 className="w-20 h-20 text-[#1B9157] animate-spin absolute inset-0" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Synchronizing Reports</p>
                    <p className="text-sm text-gray-500 font-medium font-mono">SECURE SYSTEM LINK ACTIVE</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">

            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#F4D03F]/10 rounded-2xl flex items-center justify-center">
                            <History className="w-6 h-6 text-[#F4D03F]" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight leading-none">
                            {t('reports_title')}
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                        {t('reports_desc')}
                    </p>
                </div>

                <div className="flex items-center gap-8 bg-white dark:bg-[#09090b] p-6 rounded-[2rem] border border-gray-100 dark:border-[#1e1e1e] shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('total_reports')}</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</span>
                    </div>
                    <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('schedules')}</span>
                        <span className="text-2xl font-bold text-[#10B981]">{schedules.filter(s => s.is_active).length}</span>
                    </div>
                </div>
            </div>

            {/* Main Configuration Card */}
            <Card className="rounded-[3rem] border-none bg-white dark:bg-slate-50 shadow-2xl shadow-gray-200/50 dark:shadow-slate-200/50 overflow-hidden relative">
                {isGenerating && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/20"
                    >
                        <div className="px-10 py-4 flex items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Compiling Report Data...</span>
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{Math.round(genProgress)}%</span>
                                </div>
                                <Progress value={genProgress} className="h-2 bg-emerald-500/10" indicatorClassName="bg-emerald-500" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <CardContent className="p-10 lg:p-14">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* Left Column: Configuration */}
                        <div className="lg:col-span-8 space-y-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                    <Grid3X3 className="w-4 h-4" />
                                    {t('define_content')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {sectionOptions.map((section) => (
                                        <motion.div
                                            key={section.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSections({ ...sections, [section.id]: !sections[section.id as keyof typeof sections] })}
                                            className={cn(
                                                "flex flex-col gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer h-32 justify-between",
                                                sections[section.id as keyof typeof sections]
                                                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/30"
                                                    : "bg-gray-50/50 border-gray-100 dark:bg-gray-800/10 dark:border-gray-800/30"
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    sections[section.id as keyof typeof sections] ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                                )}>
                                                    {sections[section.id as keyof typeof sections] ? <Check className="w-5 h-5" /> : <Box className="w-5 h-5 opacity-40" />}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                sections[section.id as keyof typeof sections] ? "text-emerald-900 dark:text-emerald-300" : "text-gray-500"
                                            )}>
                                                {section.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                    <Clock className="w-4 h-4" />
                                    {t('temporal_scope')}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {['7', '30', '90', '365'].map((days) => (
                                        <button
                                            key={days}
                                            onClick={() => setReportScope(days)}
                                            className={cn(
                                                "px-8 py-4 rounded-full text-sm font-bold transition-all border",
                                                reportScope === days
                                                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xl shadow-slate-200 dark:shadow-none"
                                                    : "bg-white dark:bg-[#1e1e1e] text-gray-600 border-gray-100 dark:border-[#1e1e1e] hover:border-[#F4D03F]"
                                            )}
                                        >
                                            {days === '365' ? t('last_year') : t(`last_${days}_days`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Summary */}
                        <div className="lg:col-span-4 space-y-10">
                            <div className="bg-[#F8FAFC] dark:bg-[#111111] rounded-[2.5rem] p-8 space-y-8 border border-gray-100 dark:border-[#1e1e1e]">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('export_format')}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setSelectedFormat('PDF')}
                                            className={cn(
                                                "flex items-center justify-center gap-3 h-14 bg-white dark:bg-[#1e1e1e] border-2 rounded-2xl font-bold text-sm shadow-sm transition-all",
                                                selectedFormat === 'PDF' ? "border-emerald-500 text-emerald-600" : "border-gray-100 dark:border-[#1e1e1e] text-gray-500"
                                            )}
                                        >
                                            <FileText className="w-5 h-5" />
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => setSelectedFormat('XLSX')}
                                            className={cn(
                                                "flex items-center justify-center gap-3 h-14 bg-white dark:bg-[#1e1e1e] border-2 rounded-2xl font-bold text-sm shadow-sm transition-all",
                                                selectedFormat === 'XLSX' ? "border-emerald-500 text-emerald-600" : "border-gray-100 dark:border-[#1e1e1e] text-gray-500"
                                            )}
                                        >
                                            <Grid3X3 className="w-5 h-5" />
                                            XLSX
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <Button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating}
                                        className="w-full h-16 rounded-[1.25rem] bg-[#10B981] hover:bg-[#059669] text-white font-heavy text-base tracking-wide shadow-2xl shadow-emerald-500/30 gap-4 group"
                                    >
                                        {isGenerating ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <History className="w-6 h-6" />
                                            </motion.div>
                                        ) : (
                                            <Download className="w-6 h-6 transition-transform group-hover:translate-y-1" />
                                        )}
                                        GENERATE SUMMARY
                                    </Button>
                                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                        Powered by BeeYield Analysis
                                    </p>
                                </div>
                            </div>

                            <Card className="rounded-[2.5rem] border-dashed border-2 border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/5 p-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                        <Bell className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">{t('scheduled_reports')}</h4>
                                        <p className="text-xs text-amber-800/60 dark:text-amber-500/60 leading-relaxed font-medium">
                                            {t('create_first_schedule')}
                                        </p>
                                        <Button
                                            onClick={() => setIsScheduleModalOpen(true)}
                                            variant="link"
                                            className="px-0 h-auto text-amber-600 dark:text-amber-400 font-bold text-xs p-0 mt-2"
                                        >
                                            {t('add_schedule')} →
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Middle Section: Reports History & Scheduled */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Reports History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-[#F4D03F]" />
                            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{t('export_history')}</h3>
                        </div>
                        <Button variant="ghost" className="text-[#F4D03F] font-bold text-sm">View All</Button>
                    </div>

                    <div className="space-y-3">
                        {reports.length === 0 ? (
                            <div className="py-12 bg-gray-50/50 dark:bg-[#1e1e1e]/10 border-2 border-dashed border-gray-100 dark:border-[#1e1e1e] rounded-[2rem] flex flex-col items-center justify-center text-gray-500 text-sm">
                                <History className="w-8 h-8 opacity-20 mb-3" />
                                {t('no_exports')}
                            </div>
                        ) : (
                            reports.slice(0, 5).map((report) => (
                                <div key={report.id} className="group bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] p-5 rounded-2xl flex items-center justify-between hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-black/20 hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <FileText className="w-6 h-6 text-gray-400 group-hover:text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                                    {report.report_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </h4>
                                                <Badge className={cn(
                                                    "text-[9px] uppercase font-black px-2 py-0 border-none",
                                                    report.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {report.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {new Date(report.created_at).toLocaleDateString()} • {report.file_format}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="group-hover:text-emerald-600">
                                        <Download className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Scheduled Reports */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-[#F4D03F]" />
                            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{t('scheduled_reports')}</h3>
                        </div>
                        <Button
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="bg-[#F4D03F] text-black hover:bg-[#E2BC1F] rounded-full px-5 h-9 font-bold text-xs gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {t('add_schedule')}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {schedules.length === 0 ? (
                            <div className="py-12 bg-gray-50/50 dark:bg-[#1e1e1e]/10 border-2 border-dashed border-gray-100 dark:border-[#1e1e1e] rounded-[2rem] flex flex-col items-center justify-center text-gray-500 text-sm">
                                <Calendar className="w-8 h-8 opacity-20 mb-3" />
                                {t('no_schedules')}
                            </div>
                        ) : (
                            schedules.map((schedule) => (
                                <div key={schedule.id} className="bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] p-5 rounded-2xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                            schedule.is_active ? "bg-emerald-50 text-emerald-500" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200">{schedule.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium capitalize">
                                                {schedule.frequency} • Next run: {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleDateString() : 'TBD'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            schedule.is_active ? "bg-emerald-500" : "bg-gray-300"
                                        )} />
                                        <Button onClick={() => handleDeleteSchedule(schedule.id)} variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: AI Insights (Premium) */}
            <div className="pt-10">
                <Card className="rounded-[4rem] border-none bg-gradient-to-br from-[#1B9157] to-[#10B981] dark:from-[#1B9157] dark:to-[#10B981] p-12 lg:p-20 relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:col-span-1 space-y-8 max-w-xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">BeeYield Insights</span>
                            </div>
                            <h2 className="text-[3.5rem] font-bold text-white tracking-tight leading-[0.95] mb-6">
                                Advanced Data <br />Insights
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Beyond simple exports, BeeYield AI analyzes your historical data to predict harvest weights, detect early disease markers, and suggest foraging improvements.
                            </p>
                            <div className="flex flex-wrap gap-4 items-center">
                                <Button
                                    onClick={handleGenerateAIInsights}
                                    disabled={isAISynthesizing}
                                    className="h-16 px-10 rounded-full bg-white text-black hover:bg-gray-100 font-bold text-sm tracking-wide gap-3"
                                >
                                    {isAISynthesizing ? "ANALYZING..." : t('generate_ai_reports')}
                                </Button>
                                <Button variant="ghost" className="h-16 px-8 rounded-full text-white hover:bg-white/5 font-bold text-sm gap-3">
                                    <ExternalLink className="w-5 h-5" />
                                    Docs
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-lg lg:ml-auto">
                            <div className="grid grid-cols-1 gap-4">
                                {/* Place Selector Premium */}
                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('nav_my_places')}</span>
                                        <LayoutGrid className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                        <SelectTrigger className="w-full bg-white/10 border-white/10 text-white rounded-2xl h-14">
                                            <SelectValue placeholder={t('nav_my_places')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0F172A] border-white/10 text-white">
                                            <SelectItem value="">{t('nav_my_places')}</SelectItem>
                                            {apiaries.map(a => (
                                                <SelectItem key={a.id} value={a.id} className="hover:bg-white/10">{a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Hive Selector Premium */}
                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('nav_beeyield_hives')}</span>
                                        <Box className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <Select value={selectedHive} onValueChange={setSelectedHive}>
                                        <SelectTrigger className="w-full bg-white/10 border-white/10 text-white rounded-2xl h-14" disabled={!selectedPlace}>
                                            <SelectValue placeholder={t('nav_beeyield_hives')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0F172A] border-white/10 text-white">
                                            <SelectItem value="">{t('nav_beeyield_hives')}</SelectItem>
                                            {hives.filter(h => h.apiary_id === selectedPlace).map(h => (
                                                <SelectItem key={h.id} value={h.id} className="hover:bg-white/10">{h.hive_code}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Schedule Modal */}
            <AnimatePresence>
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsScheduleModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-xl bg-white dark:bg-[#09090b] rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-[#1e1e1e]"
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('scheduled_reports')}</h2>
                                        <p className="text-gray-500 text-sm">{t('reports_desc')}</p>
                                    </div>
                                    <button
                                        aria-label="Close scheduled reports"
                                        onClick={() => setIsScheduleModalOpen(false)}
                                        className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateSchedule} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Schedule Name</label>
                                        <div className="relative group">
                                            <FileInput className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F4D03F] transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={newSchedule.name}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                                placeholder="e.g. Monthly Apiary Audit"
                                                className="w-full h-16 pl-14 pr-6 bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-[#1e1e1e] rounded-2xl focus:ring-2 focus:ring-[#F4D03F]/20 focus:border-[#F4D03F] outline-none font-bold text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Frequency</label>
                                            <Select
                                                value={newSchedule.frequency}
                                                onValueChange={(v: any) => setNewSchedule({ ...newSchedule, frequency: v })}
                                            >
                                                <SelectTrigger className="h-16 rounded-2xl bg-gray-50 dark:bg-[#111111] border-gray-100 dark:border-[#1e1e1e] font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                            <div className="flex items-center h-16 bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-[#1e1e1e] rounded-2xl px-6 gap-3">
                                                <Checkbox
                                                    id="active"
                                                    checked={newSchedule.is_active}
                                                    onCheckedChange={(c) => setNewSchedule({ ...newSchedule, is_active: !!c })}
                                                />
                                                <label htmlFor="active" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Enabled</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex items-start gap-4">
                                        <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400/80 font-medium leading-relaxed">
                                            Schedules are processed at 00:00 UTC. Reports will be available in your history and sent to your registered email address.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSavingSchedule}
                                            className="w-full h-16 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-black text-lg tracking-wide shadow-2xl shadow-emerald-500/30 gap-4"
                                        >
                                            {isSavingSchedule ? "SAVING..." : t('add_schedule')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportsExportsView;
