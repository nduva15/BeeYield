import React from 'react';
import { Calendar, Download, FileBarChart, FileSpreadsheet, FileText, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import beeyieldService from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import {
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

const ReportsExportsView: React.FC<ReportsExportsViewProps> = ({ onTabChange }) => {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;
    const { data: apiaries = [] } = useApiaries();
    const { data: hives = [] } = useHives();
    const { data: reports = [], isLoading: reportsLoading } = useGeneratedReports();
    const { data: schedules = [], isLoading: schedulesLoading } = useScheduledReports();
    const createSchedule = useCreateScheduledReport();
    const updateSchedule = useUpdateScheduledReport();
    const deleteSchedule = useDeleteScheduledReport();

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
    const [sections, setSections] = React.useState({
        apiaries: true,
        hives: true,
        notes: true,
        inspections: false,
        harvests: true,
        my_requests: false,
        tasks: false,
    });

    const filteredReports = reports.filter((report) => !report.user_id || report.user_id === userId);
    const filteredSchedules = schedules.filter((schedule) => !schedule.user_id || schedule.user_id === userId);
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

    const handleGenerate = async (reportType: 'full_summary' | 'ai_analysis') => {
        const setBusy = reportType === 'ai_analysis' ? setIsGeneratingInsights : setIsGenerating;
        const loadingLabel = reportType === 'ai_analysis' ? 'Generating insights...' : 'Generating report...';
        const successLabel = reportType === 'ai_analysis' ? 'Insights ready' : 'Report ready';

        setBusy(true);
        const toastId = toast.loading(loadingLabel);
        try {
            const { data, error } = await beeyieldService.generateReport({
                report_type: reportType,
                user_id: userId || undefined,
                parameters: reportParameters,
                file_format: reportType === 'ai_analysis' ? 'PDF' : selectedFormat,
            } as any);

            if (error || !data?.id) {
                throw error || new Error('Could not queue report');
            }

            const result = await beeyieldService.waitForReport(data.id, { timeoutMs: 180_000, pollMs: 1500 });
            if (!result || result.status === 'failed') {
                throw new Error('Report generation failed');
            }

            await beeyieldService.downloadReport({ file_url: result.file_url, file_name: result.file_name });
            toast.success(successLabel, { id: toastId });
        } catch (error: any) {
            console.error(error);
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
            .split(/[,;\n]/g)
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
                <BeeYieldPageHeader
                    icon={FileBarChart}
                    label="Backend reports"
                    title={<>Reports <span className="text-[#F4D03F]">& Exports</span></>}
                    subtitle="Generate downloadable report files and manage recurring schedules through the Rust backend."
                />

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className={cn(glass.card, 'p-6 bg-muted/ border-border/ space-y-6')}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/60">Scope</label>
                                <Input value={reportScope} onChange={(e) => setReportScope(e.target.value)} className={glass.input} inputMode="numeric" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/60">Format</label>
                                <Select value={selectedFormat} onValueChange={(value: 'PDF' | 'XLSX') => setSelectedFormat(value)}>
                                    <SelectTrigger className={glass.input}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDF">PDF</SelectItem>
                                        <SelectItem value="XLSX">XLSX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/60">Apiary</label>
                                <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                    <SelectTrigger className={glass.input}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All apiaries</SelectItem>
                                        {apiaries.map((apiary) => (
                                            <SelectItem key={apiary.id} value={apiary.id}>{getApiaryDisplayName(apiary)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/60">Hive</label>
                                <Select value={selectedHive} onValueChange={setSelectedHive}>
                                    <SelectTrigger className={glass.input}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All hives</SelectItem>
                                    {availableHives.map((hive) => (
                                        <SelectItem key={hive.id} value={hive.id}>{getHiveDisplayName(hive)}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(sections).map(([key, enabled]) => (
                                <label key={key} className="flex items-center gap-2 rounded-xl border border-border/ bg-muted/ px-3 py-2 text-[10px] font-black text-foreground">
                                    <Checkbox
                                        checked={enabled}
                                        onCheckedChange={(checked) =>
                                            setSections((current) => ({ ...current, [key]: !!checked }))
                                        }
                                    />
                                    {key.replace('_', ' ')}
                                </label>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button className={glass.btnPrimary} onClick={() => handleGenerate('full_summary')} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                Generate report
                            </Button>
                            <Button className={glass.btnSecondary} onClick={() => handleGenerate('ai_analysis')} disabled={isGeneratingInsights}>
                                {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate insights
                            </Button>
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-6 bg-muted/ border-border/ space-y-4')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted/ flex items-center justify-center border border-border/">
                                <Calendar className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-foreground">Schedule reports</h3>
                                <p className="text-[9px] font-bold text-muted-foreground">Recurring report delivery stored in the backend</p>
                            </div>
                        </div>

                        <Input
                            value={scheduleDraft.name}
                            onChange={(e) => setScheduleDraft((current) => ({ ...current, name: e.target.value }))}
                            className={glass.input}
                            placeholder="Weekly operations summary"
                        />
                        <Select
                            value={scheduleDraft.frequency}
                            onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                                setScheduleDraft((current) => ({ ...current, frequency: value }))
                            }
                        >
                            <SelectTrigger className={glass.input}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            value={scheduleDraft.recipients}
                            onChange={(e) => setScheduleDraft((current) => ({ ...current, recipients: e.target.value }))}
                            className={glass.input}
                            placeholder="ops@example.com, finance@example.com"
                        />
                        <div className="flex gap-3">
                            <Button className={glass.btnPrimary} onClick={handleCreateSchedule} disabled={createSchedule.isPending || updateSchedule.isPending}>
                                <Plus className="w-4 h-4" />
                                {editingScheduleId ? 'Update schedule' : 'Save schedule'}
                            </Button>
                            {editingScheduleId && (
                                <Button className={glass.btnSecondary} onClick={resetScheduleForm}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className={cn(glass.card, 'p-0 overflow-hidden bg-muted/ border-border/')}>
                        <div className="p-5 border-b border-border/ bg-muted/ flex items-center gap-3">
                            <FileSpreadsheet className="w-4 h-4 text-[#1B9157]" />
                            <h3 className="text-[11px] font-black text-foreground">Generated reports</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            {reportsLoading ? (
                                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground/70" /></div>
                            ) : filteredReports.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No reports generated yet.</p>
                            ) : (
                                filteredReports.map((report) => (
                                    <div key={report.id} className="flex items-center justify-between rounded-xl border border-border/ bg-muted/ px-4 py-3">
                                        <div>
                                            <div className="text-[10px] font-black text-foreground uppercase">{report.report_type.replace('_', ' ')}</div>
                                            <div className="text-[9px] font-bold text-muted-foreground">{new Date(report.created_at).toLocaleString()}</div>
                                        </div>
                                        <Button
                                            className={glass.btnSecondary}
                                            onClick={() => beeyieldService.downloadReport({ file_url: report.file_url, file_name: report.file_name })}
                                            disabled={report.status !== 'completed'}
                                        >
                                            <Download className="w-4 h-4" />
                                            {report.status === 'completed' ? 'Download' : report.status}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-0 overflow-hidden bg-muted/ border-border/')}>
                        <div className="p-5 border-b border-border/ bg-muted/ flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-[#F4D03F]" />
                            <h3 className="text-[11px] font-black text-foreground">Scheduled reports</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            {schedulesLoading ? (
                                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground/70" /></div>
                            ) : filteredSchedules.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No schedules saved yet.</p>
                            ) : (
                                filteredSchedules.map((schedule) => (
                                    <div key={schedule.id} className="flex items-center justify-between rounded-xl border border-border/ bg-muted/ px-4 py-3">
                                        <div>
                                            <div className="text-[10px] font-black text-foreground">{schedule.name}</div>
                                            <div className="text-[9px] font-bold text-muted-foreground">
                                                {schedule.frequency} • {schedule.recipients?.join(', ') || 'No recipients'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(glass.badge, schedule.is_active ? 'border-[#1B9157]/30 bg-[#1B9157]/10 text-[#1B9157]' : 'border-gray-200 bg-gray-100 text-muted-foreground')}>
                                                {schedule.is_active ? 'Active' : 'Paused'}
                                            </span>
                                            <Button className={glass.btnSecondary} onClick={() => handleEditSchedule(schedule)}>
                                                Edit
                                            </Button>
                                            <Button className={glass.btnSecondary} onClick={() => handleToggleSchedule(schedule)} disabled={updateSchedule.isPending}>
                                                {schedule.is_active ? 'Pause' : 'Resume'}
                                            </Button>
                                            <Button className={glass.btnSecondary} onClick={() => handleDeleteSchedule(schedule.id)} disabled={deleteSchedule.isPending}>
                                                <Trash2 className="w-4 h-4" />
                                                Remove
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

