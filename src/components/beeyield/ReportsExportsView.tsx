import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, Download, Loader2, FileSpreadsheet, FileBarChart, Search } from 'lucide-react';
import { toast } from 'sonner';
import { beeyieldService, GeneratedReport } from '@/services/beeyieldService';
import type { Apiary } from '@/services/beeyieldService';

const REPORT_TYPES = [
    { value: 'harvest_yield', label: 'Harvest Yield Report' },
    { value: 'health_audit', label: 'Apiary Health Audit' },
    { value: 'sensor_logs', label: 'Sensor Logs (Raw)' },
    { value: 'pollination_cert', label: 'Pollination Certificate' },
    { value: 'financial', label: 'Financial Summary' },
] as const;

const DATE_PRESETS = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'season', label: 'Last Season (2025)' },
] as const;

const FILE_FORMATS = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV', icon: FileBarChart },
] as const;

function reportTypeLabel(type: string): string {
    return REPORT_TYPES.find((r) => r.value === type)?.label ?? type;
}

export default function ReportsExportsView() {
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const [reportType, setReportType] = useState<string>('harvest_yield');
    const [apiaryId, setApiaryId] = useState<string>('all');
    const [datePreset, setDatePreset] = useState<string>('30');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [fileFormat, setFileFormat] = useState<string>('pdf');

    const loadApiaries = useCallback(async () => {
        try {
            const data = await beeyieldService.getApiaries();
            setApiaries(data || []);
        } catch (e) {
            console.error('Failed to load apiaries', e);
        }
    }, []);

    const loadReports = useCallback(async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getReports();
            setReports(data || []);
        } catch (e) {
            console.error('Failed to load reports', e);
            toast.error('Failed to load report history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadApiaries();
        loadReports();
    }, [loadApiaries, loadReports]);

    const getDateRange = (): { start: string; end: string } => {
        const end = new Date();
        let start = new Date();
        if (datePreset === '7') {
            start.setDate(start.getDate() - 7);
        } else if (datePreset === '30') {
            start.setDate(start.getDate() - 30);
        } else if (datePreset === 'ytd') {
            start = new Date(end.getFullYear(), 0, 1);
        } else if (datePreset === 'season') {
            start = new Date(2025, 0, 1);
            end.setFullYear(2025);
        }
        if (customStart && customEnd) {
            return { start: customStart, end: customEnd };
        }
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
        };
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const { start, end } = getDateRange();
            await beeyieldService.generateReport({
                report_type: reportType,
                file_format: fileFormat,
                apiary_id: apiaryId === 'all' ? null : apiaryId,
                start,
                end,
            });
            toast.success('Report generation started. It will appear in the history when ready.');
            await loadReports();
        } catch (e) {
            console.error('Generate report failed', e);
            toast.error('Failed to start report generation');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (report: GeneratedReport) => {
        if (report.status !== 'completed') {
            toast.info('Report is still generating. Please wait.');
            return;
        }
        setDownloadingId(report.id);
        try {
            const url = await beeyieldService.getReportDownloadUrl(report.id);
            window.open(url, '_blank', 'noopener');
            toast.success('Download started');
        } catch (e) {
            console.error('Download failed', e);
            toast.error('Failed to get download link');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">
                Reports & Exports
            </h1>

            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Generate New Report</CardTitle>
                    <CardDescription>
                        Generate a PDF summary of your apiaries, hives, notes, inspections, harvests, requests, and tasks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Report type</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_TYPES.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Place (apiary)</Label>
                            <Select value={apiaryId} onValueChange={setApiaryId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Apiaries or search..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Apiaries</SelectItem>
                                    {apiaries.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Report scope (days / range)</Label>
                            <Select value={datePreset} onValueChange={setDatePreset}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DATE_PRESETS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:flex md:gap-2 md:items-end">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs">Custom start</Label>
                                <Input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs">Custom end</Label>
                                <Input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Format</Label>
                        <div className="flex flex-wrap gap-2">
                            {FILE_FORMATS.map((f) => (
                                <Button
                                    key={f.value}
                                    type="button"
                                    variant={fileFormat === f.value ? 'default' : 'outline'}
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setFileFormat(f.value)}
                                >
                                    <f.icon className="w-4 h-4" />
                                    {f.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="bg-[#1B9157] hover:bg-[#157347] gap-2"
                        >
                            {generating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            {fileFormat === 'pdf' ? 'Generate PDF report' : `Export ${fileFormat.toUpperCase()}`}
                        </Button>
                        <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
                            Refresh history
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">History</CardTitle>
                    <CardDescription>Generated reports. Download when status is Completed.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#1B9157]" />
                        </div>
                    ) : reports.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-6">No reports generated yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Report name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">
                                            {reportTypeLabel(r.report_type)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                                        </TableCell>
                                        <TableCell className="uppercase text-sm">{r.file_format}</TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    r.status === 'completed'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : r.status === 'failed'
                                                          ? 'text-red-600 dark:text-red-400'
                                                          : 'text-amber-600 dark:text-amber-400'
                                                }
                                            >
                                                {r.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(r)}
                                                disabled={r.status !== 'completed' || downloadingId === r.id}
                                            >
                                                {downloadingId === r.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-[#F4D03F]">
                <CardHeader>
                    <CardTitle className="text-lg">AI reports for BeeHUB</CardTitle>
                    <CardDescription>
                        AI-generated reports will appear here. We are actively working on automated insights and downloadable summaries.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search wireless BeeHUB" className="pl-9" readOnly />
                        </div>
                        <Button variant="outline" size="sm" disabled>My places</Button>
                        <Button variant="outline" size="sm" disabled>Hive</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
