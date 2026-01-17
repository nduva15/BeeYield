import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Activity, DollarSign, BarChart } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedReport {
    id: string;
    name: string;
    date: string;
    type: string;
}

const MetersReports: React.FC = () => {
    const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
        { id: '1', name: 'Anomalies report', date: '2026-01-17 07:50', type: 'PDF' }
    ]);
    const [loading, setLoading] = useState<string | null>(null);

    const handleGenerate = (reportName: string) => {
        setLoading(reportName);
        // Simulate generation delay
        setTimeout(() => {
            const newReport: GeneratedReport = {
                id: Date.now().toString(),
                name: reportName,
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                type: 'PDF'
            };
            setGeneratedReports(prev => [newReport, ...prev]);
            setLoading(null);
            toast.success(`${reportName} generated successfully`);
        }, 1500);
    };

    const handleDownload = (reportName: string) => {
        toast.info(`Downloading ${reportName}...`);
        // Logic for actual download would go here
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Reports</h1>

            {/* Header Summary */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <CardTitle>Ready summaries for administrators</CardTitle>
                    </div>
                    <CardDescription>Export PDF/XLS without heavy OMS workflows.</CardDescription>
                </CardHeader>
            </Card>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-primary/50">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h3 className="font-bold text-lg">Monthly report</h3>
                        </div>
                        <p className="text-sm text-gray-500">Usage and cost summary</p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-400">Today 09:20</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => handleGenerate('Monthly report')} disabled={loading === 'Monthly report'}>
                                    {loading === 'Monthly report' ? 'Generating...' : 'Generate report'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload('Monthly report')}>Download</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-primary/50">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h3 className="font-bold text-lg">Anomalies report</h3>
                        </div>
                        <p className="text-sm text-gray-500">List of deviations and alarms</p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-400">Yesterday 18:05</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => handleGenerate('Anomalies report')} disabled={loading === 'Anomalies report'}>
                                    {loading === 'Anomalies report' ? 'Generating...' : 'Generate report'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload('Anomalies report')}>Download</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-primary/50">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h3 className="font-bold text-lg">Cost report</h3>
                        </div>
                        <p className="text-sm text-gray-500">Estimated costs by medium</p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-400">Yesterday 14:12</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => handleGenerate('Cost report')} disabled={loading === 'Cost report'}>
                                    {loading === 'Cost report' ? 'Generating...' : 'Generate report'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload('Cost report')}>Download</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Generated Reports List */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Generated reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {generatedReports.length === 0 ? (
                        <p className="text-gray-500 text-sm">No reports generated yet.</p>
                    ) : (
                        generatedReports.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{report.name}</h4>
                                    <p className="text-xs text-gray-500">{report.date}</p>
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => handleDownload(report.name)}>Download</Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MetersReports;
