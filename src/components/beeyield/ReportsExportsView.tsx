import React from 'react';
import {
    Calendar,
    Download,
    FileBarChart,
    FileSpreadsheet,
    FileText,
    Loader2,
    Plus,
    Sparkles,
    Trash2,
    RefreshCw,
    ShieldCheck,
    Clock,
    Mail,
    CheckCircle2,
    AlertCircle,
    Layers,
    MapPin,
    SlidersHorizontal,
    Bot,
    Table,
} from 'lucide-react';
import { toast } from 'sonner';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useQueryClient } from '@tanstack/react-query';
import {
    reportKeys,
    useCreateScheduledReport,
    useDeleteScheduledReport,
    useGeneratedReports,
    useScheduledReports,
    useUpdateScheduledReport,
} from '@/hooks/useReports';
import { getApiaryDisplayName, getHiveDisplayName } from '@/lib/beeyieldDisplay';

interface ReportsExportsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const SECTION_OPTIONS = [
    { key: 'apiaries', label: 'Apiary Locations', desc: 'Geospatial coordinates & flora zones' },
    { key: 'hives', label: 'Hive Inventory', desc: 'Frame counts, queen lineage & box configurations' },
    { key: 'inspections', label: 'Inspection Diagnostic Ledger', desc: 'Varroa counts, health scores & treatments' },
    { key: 'harvests', label: 'Harvest Batches & Yields', desc: 'Net honey weight, quality grades & lot numbers' },
    { key: 'notes', label: 'Beekeeper Field Notes', desc: 'Observations & voice dictation transcripts' },
    { key: 'tasks', label: 'Task Compliance', desc: 'Upcoming scheduled maintenance & pest checks' },
];

const SCOPE_PRESETS = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
    { label: 'Full Year (365d)', value: '365' },
];

const ReportsExportsView: React.FC<ReportsExportsViewProps> = ({ onTabChange }) => {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;
    const { data: apiaries = [] } = useApiaries();
    const { data: hives = [] } = useHives();
    const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useGeneratedReports();
    const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useScheduledReports();
    const createSchedule = useCreateScheduledReport();
    const updateSchedule = useUpdateScheduledReport();
    const deleteSchedule = useDeleteScheduledReport();
    const queryClient = useQueryClient();

    const [reportScope, setReportScope] = React.useState('30');
    const [selectedFormat, setSelectedFormat] = React.useState<'PDF' | 'XLSX'>('PDF');
    const [selectedPlace, setSelectedPlace] = React.useState<string>('all');
    const [selectedHive, setSelectedHive] = React.useState<string>('all');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isGeneratingInsights, setIsGeneratingInsights] = React.useState(false);
    const [editingScheduleId, setEditingScheduleId] = React.useState<string | null>(null);
    const [scheduleDraft, setScheduleDraft] = React.useState({
        name: '',
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
        recipients: '',
    });
    const [sections, setSections] = React.useState<Record<string, boolean>>({
        apiaries: true,
        hives: true,
        notes: true,
        inspections: true,
        harvests: true,
        tasks: false,
    });

    const filteredReports = React.useMemo(() => {
        return reports
            .filter((report) => !report.user_id || report.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [reports, userId]);

    const filteredSchedules = React.useMemo(() => {
        return schedules.filter((schedule) => !schedule.user_id || schedule.user_id === userId);
    }, [schedules, userId]);

    const availableHives = React.useMemo(
        () => hives.filter((hive) => selectedPlace === 'all' || hive.apiary_id === selectedPlace),
        [hives, selectedPlace]
    );

    const selectedSections = Object.entries(sections)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);

    const reportParameters = {
        scope_days: parseInt(reportScope, 10) || 30,
        sections: selectedSections,
        place_id: selectedPlace === 'all' ? undefined : selectedPlace,
        hive_id: selectedHive === 'all' ? undefined : selectedHive,
        user_id: userId,
    };

    const handleRefreshAll = () => {
        void refetchReports();
        void refetchSchedules();
        toast.success('Reports and schedules refreshed');
    };

    const toggleSection = (key: string) => {
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleGenerate = async (reportType: 'full_summary' | 'ai_analysis', overrideFormat?: 'PDF' | 'XLSX') => {
        const fmt = overrideFormat || (reportType === 'ai_analysis' ? 'PDF' : selectedFormat);
        const setBusy = reportType === 'ai_analysis' ? setIsGeneratingInsights : setIsGenerating;
        const loadingLabel = reportType === 'ai_analysis' ? 'Generating AI insights report...' : `Exporting ${fmt} report...`;
        const successLabel = reportType === 'ai_analysis' ? 'AI Diagnostic report ready' : `${fmt} report ready`;

        setBusy(true);
        const toastId = toast.loading(loadingLabel);
        try {
            const { data, error } = await beeyieldService.generateReport({
                report_type: reportType,
                user_id: userId || undefined,
                parameters: reportParameters,
                file_format: fmt,
            } as any);

            if (error || !data?.id) {
                throw error || new Error('Could not queue report');
            }

            if (data?.file_url) {
                await beeyieldService.downloadReport({
                    file_url: data.file_url,
                    file_name: data.file_name,
                });
            }
            queryClient.invalidateQueries({ queryKey: reportKeys.generated() });
            toast.success(successLabel, { id: toastId });
        } catch (error: any) {
            console.error('handleGenerate caught error:', error);
            try {
                const fallback = await beeyieldService.generateReport({
                    report_type: reportType,
                    user_id: userId || undefined,
                    parameters: reportParameters,
                    file_format: fmt,
                } as any);
                if (fallback?.data) {
                    await beeyieldService.downloadReport({
                        file_url: fallback.data.file_url,
                        file_name: fallback.data.file_name,
                    });
                    queryClient.invalidateQueries({ queryKey: reportKeys.generated() });
                    toast.success(successLabel, { id: toastId });
                    return;
                }
            } catch (fallbackErr) {
                console.error('Fallback report generation error:', fallbackErr);
            }
            toast.error(error?.message || 'Report generation failed', { id: toastId });
        } finally {
            setBusy(false);
        }
    };

    const resetScheduleForm = () => {
        setEditingScheduleId(null);
        setScheduleDraft({ name: '', frequency: 'weekly', recipients: '' });
    };

    const handleCreateSchedule = async () => {
        if (!scheduleDraft.name.trim()) {
            toast.error('Schedule name is required');
            return;
        }

        const recipients = scheduleDraft.recipients
            .split(/[,;\r\n]+/g)
            .map((value) => value.trim())
            .filter(Boolean);

        const toastId = toast.loading('Saving schedule...');
        try {
            const payload = {
                name: scheduleDraft.name.trim(),
                report_type: 'full_summary',
                frequency: scheduleDraft.frequency,
                recipients,
                is_active: true,
                user_id: userId || undefined,
                report_config: reportParameters,
            } as any;

            const response = editingScheduleId
                ? await updateSchedule.mutateAsync({ id: editingScheduleId, data: payload })
                : await createSchedule.mutateAsync(payload);

            if (response.error) throw response.error;
            resetScheduleForm();
            toast.success(editingScheduleId ? 'Schedule updated' : 'Schedule saved', { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Could not save schedule', { id: toastId });
        }
    };

    const handleEditSchedule = (schedule: typeof filteredSchedules[number]) => {
        setEditingScheduleId(schedule.id);
        setScheduleDraft({
            name: schedule.name,
            frequency: schedule.frequency,
            recipients: schedule.recipients?.join(', ') || '',
        });
    };

    const handleToggleSchedule = async (schedule: typeof filteredSchedules[number]) => {
        const toastId = toast.loading(schedule.is_active ? 'Pausing schedule...' : 'Activating schedule...');
        try {
            const response = await updateSchedule.mutateAsync({
                id: schedule.id,
                data: { is_active: !schedule.is_active },
            });
            if (response.error) throw response.error;
            toast.success(schedule.is_active ? 'Schedule paused' : 'Schedule activated', { id: toastId });
            if (editingScheduleId === schedule.id && schedule.is_active) {
                resetScheduleForm();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Could not update schedule', { id: toastId });
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        const toastId = toast.loading('Deleting schedule...');
        try {
            const { error } = await deleteSchedule.mutateAsync(id);
            if (error) throw error;
            toast.success('Schedule deleted', { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Could not delete schedule', { id: toastId });
        }
    };

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <div className="max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6">
                
                {/* Top Header - Matching Inspections Page Ledger Aesthetics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-sm">
                            <FileBarChart className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                Reports <span className="text-amber-500">& Exports</span>
                            </h1>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span>Apiculture audits, harvest ledgers & automated recurring distributions</span>
                                {user?.email && (
                                    <>
                                        <span>•</span>
                                        <span className="font-mono text-[11px] text-foreground/80">{user.email}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefreshAll}
                            disabled={reportsLoading || schedulesLoading}
                            className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                            title="Refresh reports and schedules"
                        >
                            <RefreshCw className={cn("w-4 h-4", (reportsLoading || schedulesLoading) && "animate-spin text-amber-500")} />
                        </button>
                        <button
                            onClick={() => handleGenerate('full_summary', 'PDF')}
                            disabled={isGenerating}
                            className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-accent/10 text-foreground text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /> : <FileText className="w-3.5 h-3.5 text-amber-500" />}
                            <span>Quick 30d PDF</span>
                        </button>
                        <button
                            onClick={() => handleGenerate('ai_analysis')}
                            disabled={isGeneratingInsights}
                            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                            {isGeneratingInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            <span>AI Diagnostic Report</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid - Matching Inspections Page Ledger Aesthetics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Total exports</span>
                            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-amber-500">
                            {filteredReports.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Active schedules</span>
                            <Clock className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-emerald-500">
                            {filteredSchedules.filter((s) => s.is_active).length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Monitored scope</span>
                            <MapPin className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="mt-2 font-display text-lg sm:text-2xl font-bold text-foreground truncate">
                            {apiaries.length} <span className="text-xs text-muted-foreground font-normal">apiaries</span> • {hives.length} <span className="text-xs text-muted-foreground font-normal">hives</span>
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Export formats</span>
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-blue-500">
                            PDF & XLSX
                        </p>
                    </div>
                </div>

                {/* Main 2-Column Configuration Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
                    
                    {/* Left: Custom Report Generator */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2.5">
                                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                                <h3 className="font-display text-base font-bold text-foreground">Configure Report Generation</h3>
                            </div>
                            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                                {selectedSections.length} sections selected
                            </span>
                        </div>

                        {/* Scope Presets & Inputs */}
                        <div className="space-y-3">
                            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                Date Scope Window
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                {SCOPE_PRESETS.map((p) => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setReportScope(p.value)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                            reportScope === p.value
                                                ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                                                : "border-border bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <span className="text-xs text-muted-foreground">Days:</span>
                                    <Input
                                        value={reportScope}
                                        onChange={(e) => setReportScope(e.target.value)}
                                        className="h-8 w-20 text-xs rounded-lg border-border bg-card font-mono text-center"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Selectors: Apiary and Hive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                    Apiary Location
                                </label>
                                <Select value={selectedPlace} onValueChange={(val) => { setSelectedPlace(val); setSelectedHive('all'); }}>
                                    <SelectTrigger className="h-9 rounded-lg border-border bg-card text-xs">
                                        <SelectValue placeholder="All Apiaries" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border bg-card shadow-xl">
                                        <SelectItem value="all" className="text-xs font-medium">All Apiaries ({apiaries.length})</SelectItem>
                                        {apiaries.map((apiary) => (
                                            <SelectItem key={apiary.id} value={apiary.id} className="text-xs font-medium">
                                                {getApiaryDisplayName(apiary)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                    Target Hive
                                </label>
                                <Select value={selectedHive} onValueChange={setSelectedHive} disabled={availableHives.length === 0}>
                                    <SelectTrigger className="h-9 rounded-lg border-border bg-card text-xs">
                                        <SelectValue placeholder={availableHives.length === 0 ? "No hives in apiary" : "All Hives"} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border bg-card shadow-xl">
                                        <SelectItem value="all" className="text-xs font-medium">All Hives ({availableHives.length})</SelectItem>
                                        {availableHives.map((hive) => (
                                            <SelectItem key={hive.id} value={hive.id} className="text-xs font-medium">
                                                {getHiveDisplayName(hive)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Data Sections Checkboxes */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                Included Report Sections
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {SECTION_OPTIONS.map((item) => {
                                    const active = !!sections[item.key];
                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => toggleSection(item.key)}
                                            className={cn(
                                                "p-3 rounded-xl border text-left flex items-start gap-3 transition-all",
                                                active
                                                    ? "bg-amber-500/10 border-amber-500/30 shadow-xs"
                                                    : "bg-card border-border hover:bg-muted/20 opacity-70"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border transition-colors shrink-0",
                                                active ? "bg-amber-500 border-amber-500 text-white" : "border-border bg-card"
                                            )}>
                                                {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">{item.label}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Format & Trigger Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs font-bold text-muted-foreground">File Format:</span>
                                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFormat('PDF')}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                            selectedFormat === 'PDF' ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        PDF Document
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFormat('XLSX')}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                            selectedFormat === 'XLSX' ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Excel (.xlsx)
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                <Button
                                    onClick={() => handleGenerate('full_summary')}
                                    disabled={isGenerating || selectedSections.length === 0}
                                    className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                                >
                                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                    <span>Export {selectedFormat} Report</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Recurring Distribution Schedule */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-display text-base font-bold text-foreground">
                                        {editingScheduleId ? 'Edit Recurring Schedule' : 'Automated Schedule'}
                                    </h3>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    Background Sync
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Automatically compile and deliver complete honey audits, hive health assessments, and inspection summaries directly to your team or stakeholders.
                            </p>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                        Schedule Name
                                    </label>
                                    <Input
                                        value={scheduleDraft.name}
                                        onChange={(e) => setScheduleDraft((current) => ({ ...current, name: e.target.value }))}
                                        className="h-9 rounded-lg border-border bg-card text-xs"
                                        placeholder="e.g. Weekly Harvest & Diagnostic Brief"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                        Distribution Frequency
                                    </label>
                                    <Select
                                        value={scheduleDraft.frequency}
                                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                                            setScheduleDraft((current) => ({ ...current, frequency: value }))
                                        }
                                    >
                                        <SelectTrigger className="h-9 rounded-lg border-border bg-card text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border bg-card shadow-xl">
                                            <SelectItem value="daily" className="text-xs">Daily Summary (06:00 UTC)</SelectItem>
                                            <SelectItem value="weekly" className="text-xs">Weekly Digest (Mondays)</SelectItem>
                                            <SelectItem value="monthly" className="text-xs">Monthly Audit (1st of month)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                        Recipient Email Addresses
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={scheduleDraft.recipients}
                                            onChange={(e) => setScheduleDraft((current) => ({ ...current, recipients: e.target.value }))}
                                            className="h-9 rounded-lg border-border bg-card text-xs pl-8 font-mono"
                                            placeholder="ops@beeyield.com, manager@domain.com"
                                        />
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-3" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Comma or semicolon separated email addresses</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex items-center gap-2">
                            <Button
                                onClick={handleCreateSchedule}
                                disabled={createSchedule.isPending || updateSchedule.isPending}
                                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm flex-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{editingScheduleId ? 'Update Schedule' : 'Save Recurring Schedule'}</span>
                            </Button>
                            {editingScheduleId && (
                                <Button
                                    variant="outline"
                                    onClick={resetScheduleForm}
                                    className="h-9 px-3 rounded-xl border-border text-xs font-semibold"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Generated Reports Ledger & Scheduled Jobs */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Generated Reports Table */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                <h3 className="font-display text-sm font-bold text-foreground">Generated Reports Ledger</h3>
                            </div>
                            <span className="text-xs font-semibold font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                                {filteredReports.length} files
                            </span>
                        </div>

                        <div className="p-4 sm:p-5 flex-1 space-y-3">
                            {reportsLoading ? (
                                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-xs">
                                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Loading report records...
                                </div>
                            ) : filteredReports.length === 0 ? (
                                <div className="py-12 text-center rounded-xl border border-dashed border-border p-6 space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                                        <FileSpreadsheet className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">No reports generated yet</p>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                        Select your parameters above and click Export to compile your first apiculture audit ledger.
                                    </p>
                                </div>
                            ) : (
                                filteredReports.map((report) => {
                                    const isPdf = (report.file_format || '').toUpperCase() === 'PDF' || (report.file_name || '').endsWith('.pdf');
                                    return (
                                        <div
                                            key={report.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/15 hover:bg-muted/30 p-3.5 transition-all"
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                                                    isPdf ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                                )}>
                                                    {isPdf ? <FileText className="w-4 h-4" /> : <Table className="w-4 h-4" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-foreground truncate">
                                                            {report.report_type.replace(/_/g, ' ').toUpperCase()}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border",
                                                            isPdf ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                                        )}>
                                                            {report.file_format || (isPdf ? 'PDF' : 'XLSX')}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        Created on {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 rounded-lg border-border hover:bg-card text-xs font-bold flex items-center gap-1.5"
                                                    onClick={() => beeyieldService.downloadReport({ file_url: report.file_url, file_name: report.file_name })}
                                                    disabled={report.status !== 'completed'}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>{report.status === 'completed' ? 'Download' : report.status}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Active Schedules Table */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                <h3 className="font-display text-sm font-bold text-foreground">Scheduled Automated Distributions</h3>
                            </div>
                            <span className="text-xs font-semibold font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                                {filteredSchedules.length} active
                            </span>
                        </div>

                        <div className="p-4 sm:p-5 flex-1 space-y-3">
                            {schedulesLoading ? (
                                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-xs">
                                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Loading automated schedules...
                                </div>
                            ) : filteredSchedules.length === 0 ? (
                                <div className="py-12 text-center rounded-xl border border-dashed border-border p-6 space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">No recurring schedules configured</p>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                        Use the schedule builder on the right to automate daily, weekly, or monthly delivery to your team.
                                    </p>
                                </div>
                            ) : (
                                filteredSchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/15 hover:bg-muted/30 p-3.5 transition-all"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-foreground truncate">{schedule.name}</p>
                                                <span className={cn(
                                                    "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border",
                                                    schedule.is_active
                                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                                        : "bg-muted border-border text-muted-foreground"
                                                )}>
                                                    {schedule.is_active ? 'Active' : 'Paused'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                                                <span className="font-semibold text-foreground/80 capitalize">{schedule.frequency}</span>
                                                <span>•</span>
                                                <span className="truncate">{schedule.recipients?.join(', ') || 'No recipients assigned'}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-2.5 rounded-lg text-xs font-semibold hover:bg-card"
                                                onClick={() => handleEditSchedule(schedule)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-2.5 rounded-lg border-border text-xs font-semibold hover:bg-card"
                                                onClick={() => handleToggleSchedule(schedule)}
                                                disabled={updateSchedule.isPending}
                                            >
                                                {schedule.is_active ? 'Pause' : 'Resume'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                                disabled={deleteSchedule.isPending}
                                                title="Delete schedule"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </BeeYieldPageShell>
    );
};

export default ReportsExportsView;
