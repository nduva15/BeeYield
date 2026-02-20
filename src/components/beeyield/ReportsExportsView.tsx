import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    Mail
} from 'lucide-react';
import { beeyieldService, Apiary, Hive, GeneratedReport, ScheduledReport } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard, SectionHeader, EmptyState } from './SharedPageComponents';

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

    React.useEffect(() => {
        loadData();
    }, [userId]);

    const handleGenerateReport = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setGenProgress(10);

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

            toast.success('Report generation started!');

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
        toast.info("BeeYield is analyzing your data...");

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
            toast.success('Insights report queued!');
            loadData();
        } catch (error) {
            console.error('Generation failed', error);
            toast.error('Analysis failed');
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
        { id: 'apiaries', label: 'My Apiaries' },
        { id: 'hives', label: 'My Hives' },
        { id: 'overview', label: 'Hive Overview' },
        { id: 'notes', label: 'Latest Notes' },
        { id: 'inspections', label: 'Inspections' },
        { id: 'harvests', label: 'Harvests' },
        { id: 'my_requests', label: 'Requests' },
        { id: 'tasks', label: 'Tasks' },
    ];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <PageHeader
                title={t('reports_title') || 'Reports & Exports'}
                subtitle={t('reports_desc') || "Generate summaries and schedule automated data exports"}
                icon={FileBarChart}
                actions={
                    <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {t('add_schedule')}
                    </Button>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Reports"
                    value={reports.length}
                    icon={FileText}
                    color="blue"
                />
                <StatCard
                    label="Active Schedules"
                    value={schedules.filter(s => s.is_active).length}
                    icon={Calendar}
                    color="green"
                />
                <StatCard
                    label="Processing"
                    value={reports.filter(r => r.status === 'pending').length}
                    icon={Loader2}
                    color="amber"
                />
                <StatCard
                    label="Deep Insights"
                    value={reports.filter(r => r.report_type === 'ai_analysis').length}
                    icon={Sparkles}
                    color="purple"
                />
            </div>

            {/* Feature Highlight Card */}
            <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-[#1B9157] to-[#10B981] overflow-hidden relative shadow-lg">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sparkles className="w-64 h-64 transform rotate-12 text-white" />
                </div>
                <CardContent className="p-8 md:p-12 relative z-10 text-white">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="space-y-4 max-w-xl">
                            <Badge className="bg-white/20 text-white border-none backdrop-blur-md">PREMIUM INSIGHTS</Badge>
                            <h2 className="text-3xl font-bold leading-tight">
                                Unlock Advanced Hive Analytics
                            </h2>
                            <p className="text-white/80 text-lg">
                                Using historical data to predict harvest weights, detect disease markers, and suggest foraging improvements.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={handleGenerateAIInsights}
                                    disabled={isAISynthesizing}
                                    className="bg-white text-emerald-900 hover:bg-emerald-50 h-12 px-6 font-bold"
                                >
                                    {isAISynthesizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    Generate Deep Analysis
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                Custom Export
                            </CardTitle>
                            <CardDescription>Select the data you want to include in your report.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Include Sections</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {sectionOptions.map((section) => (
                                        <div
                                            key={section.id}
                                            onClick={() => setSections({ ...sections, [section.id]: !sections[section.id as keyof typeof sections] })}
                                            className={cn(
                                                "cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800",
                                                sections[section.id as keyof typeof sections]
                                                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                    : "bg-white border-gray-100 dark:bg-transparent dark:border-gray-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                                sections[section.id as keyof typeof sections] ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                                            )}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">{section.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Range</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['7', '30', '90', '365'].map((days) => (
                                        <Button
                                            key={days}
                                            variant={reportScope === days ? 'default' : 'outline'}
                                            onClick={() => setReportScope(days)}
                                            className="rounded-full px-6"
                                        >
                                            {days === '365' ? 'Last Year' : `Last ${days} Days`}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={selectedFormat === 'PDF' ? 'default' : 'outline'}
                                            onClick={() => setSelectedFormat('PDF')}
                                            className="w-24"
                                        >
                                            PDF
                                        </Button>
                                        <Button
                                            variant={selectedFormat === 'XLSX' ? 'default' : 'outline'}
                                            onClick={() => setSelectedFormat('XLSX')}
                                            className="w-24"
                                        >
                                            Excel
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating}
                                        className="w-full md:w-auto px-8 gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        Generate Report
                                    </Button>
                                </div>
                                {isGenerating && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Processing...</span>
                                            <span>{Math.round(genProgress)}%</span>
                                        </div>
                                        <Progress value={genProgress} className="h-1" indicatorClassName="bg-emerald-500" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports History */}
                    <div className="space-y-4">
                        <SectionHeader title={t('export_history') || "Export History"} />
                        {reports.length === 0 ? (
                            <EmptyState icon={History} title="No Reports" description="Generated reports will appear here." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reports.slice(0, 6).map((report) => (
                                    <div key={report.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 capitalize">
                                                    {report.report_type.replace('_', ' ')}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(report.created_at).toLocaleDateString()} • {report.file_format}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Scheduled Reports */}
                <div className="space-y-6">
                    <Card className="h-full bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                {t('scheduled_reports')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {schedules.length === 0 ? (
                                <EmptyState
                                    icon={Calendar}
                                    title="No Schedules"
                                    description="Automate your reporting workflow."
                                    action={{ label: "Add Schedule", onClick: () => setIsScheduleModalOpen(true) }}
                                />
                            ) : (
                                schedules.map((schedule) => (
                                    <div key={schedule.id} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", schedule.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{schedule.name}</h4>
                                                <p className="text-xs text-gray-500 capitalize">{schedule.frequency}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(schedule.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Schedule Modal Overlay */}
            <AnimatePresence>
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg">New Schedule</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsScheduleModalOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Schedule Name</Label>
                                        <Input
                                            value={newSchedule.name}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                            placeholder="e.g. Weekly Executive Summary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Select value={newSchedule.frequency} onValueChange={(v: any) => setNewSchedule({ ...newSchedule, frequency: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <div className="flex items-center space-x-2 h-10 border rounded-md px-3">
                                                <Checkbox
                                                    id="active-check"
                                                    checked={newSchedule.is_active}
                                                    onCheckedChange={(c) => setNewSchedule({ ...newSchedule, is_active: !!c })}
                                                />
                                                <Label htmlFor="active-check">Active</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                                        <Mail className="w-5 h-5 shrink-0" />
                                        Reports will be emailed to your account address automatically.
                                    </div>
                                </div>
                                <Button onClick={handleCreateSchedule} className="w-full bg-primary" disabled={isSavingSchedule}>
                                    {isSavingSchedule ? "Saving..." : "Create Schedule"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportsExportsView;
