import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Activity, DollarSign, BarChart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import BEEYIELD_LOGO from '@/assets/Logo.png';

interface GeneratedReport {
    id: string;
    name: string;
    date: string;
    type: string;
    data?: any;
}

const MetersReports: React.FC = () => {
    const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
        { id: '1', name: 'Anomalies report', date: '2026-01-17 07:50', type: 'PDF' }
    ]);
    const [loading, setLoading] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    // Generate report data based on type
    const generateReportData = (reportName: string) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        if (reportName === 'Monthly report') {
            return {
                title: 'Monthly Utility Consumption Report',
                period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
                summary: {
                    totalMeters: 184,
                    activeMeters: 178,
                    avgUsageWater: '4.5 m3',
                    avgUsageEnergy: '210 kWh',
                    totalConsumption: '3,842 m3 / 12,483 kWh',
                    alertsResolved: 12,
                },
                breakdown: [
                    { region: 'Kibwezi Main Area A', hives: 65, production: '1,240 m3', health: '98%' },
                    { region: 'Kibwezi Main Area B', hives: 58, production: '980 m3', health: '96%' },
                    { region: 'Kibwezi Main Area C', hives: 61, production: '1,622 m3', health: '97%' },
                ]
            };
        } else if (reportName === 'Anomalies report') {
            return {
                title: 'Utility Anomalies & Alerts Report',
                period: dateStr,
                anomalies: [
                    { hive: 'WAT-001', type: 'Leak Detected', severity: 'Critical', date: '2026-01-28', resolved: true },
                    { hive: 'ENE-015', type: 'High Load', severity: 'Medium', date: '2026-01-25', resolved: true },
                    { hive: 'HEA-022', type: 'No Signal', severity: 'Low', date: '2026-01-20', resolved: true },
                ],
                stats: {
                    totalAlerts: 3,
                    resolved: 3,
                    pending: 0,
                    avgResolutionTime: '2.5 hours'
                }
            };
        } else {
            return {
                title: 'Utility Cost Analysis Report',
                period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
                costs: {
                    monitoring: 'KES 5,000',
                    taxes: 'KES 2,500',
                    logistics: 'KES 1,000',
                    total: 'KES 8,500',
                },
                revenue: {
                    honeysSales: 'KES 45,000',
                    pollinationServices: 'KES 12,000',
                    total: 'KES 57,000',
                },
                netProfit: 'KES 48,500'
            };
        }
    };

    const handleGenerate = (reportName: string) => {
        setLoading(reportName);
        setTimeout(() => {
            const data = generateReportData(reportName);
            const newReport: GeneratedReport = {
                id: Date.now().toString(),
                name: reportName,
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                type: 'PDF',
                data
            };
            setGeneratedReports(prev => [newReport, ...prev]);
            setLoading(null);
            toast.success(`${reportName} generated successfully`);
        }, 1500);
    };

    const handleDownload = async (reportName: string, reportData?: any) => {
        setDownloading(reportName);

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const data = reportData || generateReportData(reportName);

            // Add logo
            try {
                doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 30, 30);
            } catch (e) {
                console.warn('Could not load logo for PDF');
            }

            // Header
            doc.setFontSize(24);
            doc.setTextColor(245, 158, 11); // BeeYield amber
            doc.text('BeeYield', 50, 25);

            doc.setFontSize(10);
            doc.setTextColor(107, 114, 128); // Gray
            doc.text('Africa\'s Biggest Beekeeping Platform', 50, 32);
            doc.text('Kibwezi, Makueni County, Kenya', 50, 38);

            // Title
            doc.setFontSize(18);
            doc.setTextColor(31, 41, 55); // Dark gray
            doc.text(data.title, 14, 55);

            doc.setFontSize(11);
            doc.setTextColor(107, 114, 128);
            doc.text(`Report Period: ${data.period}`, 14, 63);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 70);

            // Draw separator line
            doc.setDrawColor(245, 158, 11);
            doc.setLineWidth(0.5);
            doc.line(14, 75, pageWidth - 14, 75);

            let yPos = 85;

            // Content based on report type
            if (reportName === 'Monthly report') {
                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text('Summary', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(75, 85, 99);
                const summary = data.summary;
                doc.text(`Total Hives: ${summary.totalHives}`, 14, yPos); yPos += 7;
                doc.text(`Active Hives: ${summary.activeHives}`, 14, yPos); yPos += 7;
                doc.text(`Average Temperature: ${summary.avgTemperature}`, 14, yPos); yPos += 7;
                doc.text(`Average Humidity: ${summary.avgHumidity}`, 14, yPos); yPos += 7;
                doc.text(`Total Honey Production: ${summary.totalHoneyProduction}`, 14, yPos); yPos += 7;
                doc.text(`Alerts Resolved: ${summary.alertsResolved}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text('Kibwezi Main Area Breakdown', 14, yPos);
                yPos += 10;

                // Table header
                doc.setFillColor(249, 250, 251);
                doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
                doc.setFontSize(10);
                doc.setTextColor(75, 85, 99);
                doc.text('Apiary Area', 16, yPos);
                doc.text('Hives', 70, yPos);
                doc.text('Production', 100, yPos);
                doc.text('Health', 150, yPos);
                yPos += 10;

                data.breakdown.forEach((row: any) => {
                    doc.text(row.region, 16, yPos);
                    doc.text(row.hives.toString(), 70, yPos);
                    doc.text(row.production, 100, yPos);
                    doc.text(row.health, 150, yPos);
                    yPos += 8;
                });

            } else if (reportName === 'Anomalies report') {
                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text('Alert Statistics', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(75, 85, 99);
                const stats = data.stats;
                doc.text(`Total Alerts: ${stats.totalAlerts}`, 14, yPos); yPos += 7;
                doc.text(`Resolved: ${stats.resolved}`, 14, yPos); yPos += 7;
                doc.text(`Pending: ${stats.pending}`, 14, yPos); yPos += 7;
                doc.text(`Avg Resolution Time: ${stats.avgResolutionTime}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text('Recent Anomalies', 14, yPos);
                yPos += 10;

                // Table header
                doc.setFillColor(249, 250, 251);
                doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
                doc.setFontSize(10);
                doc.text('Meter / Hive', 16, yPos);
                doc.text('Type', 50, yPos);
                doc.text('Severity', 110, yPos);
                doc.text('Date', 140, yPos);
                doc.text('Status', 175, yPos);
                yPos += 10;

                data.anomalies.forEach((row: any) => {
                    doc.text(row.hive, 16, yPos);
                    doc.text(row.type, 50, yPos);
                    doc.text(row.severity, 110, yPos);
                    doc.text(row.date, 140, yPos);
                    doc.text(row.resolved ? 'Resolved' : 'Pending', 175, yPos);
                    yPos += 8;
                });

            } else {
                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text('Operating Costs', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(75, 85, 99);
                const costs = data.costs;
                doc.text(`Monitoring: ${costs.monitoring}`, 14, yPos); yPos += 7;
                doc.text(`Maintenance: ${costs.maintenance}`, 14, yPos); yPos += 7;
                doc.text(`Logistics: ${costs.logistics}`, 14, yPos); yPos += 7;
                doc.setTextColor(31, 41, 55);
                doc.text(`Total Costs: ${costs.total}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text('Revenue', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(75, 85, 99);
                const revenue = data.revenue;
                doc.text(`Honey Sales: ${revenue.honeysSales}`, 14, yPos); yPos += 7;
                doc.text(`Pollination Services: ${revenue.pollinationServices}`, 14, yPos); yPos += 7;
                doc.setTextColor(31, 41, 55);
                doc.text(`Total Revenue: ${revenue.total}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.setTextColor(16, 185, 129); // Green
                doc.text(`Net Profit: ${data.netProfit}`, 14, yPos);
            }

            // Footer
            doc.setFontSize(9);
            doc.setTextColor(156, 163, 175);
            doc.text('This report was generated by BeeYield Dashboard - www.beeyield.com', pageWidth / 2, 280, { align: 'center' });
            doc.text('Champions for Saving Bees | 50% Ethical Harvest Promise', pageWidth / 2, 286, { align: 'center' });

            // Save PDF
            const fileName = `BeeYield_${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success(`${reportName} downloaded successfully!`);
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">Reports</h1>

            {/* Header Summary */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle>Administrator Summaries</CardTitle>
                    </div>
                    <CardDescription>Quickly export system reports.</CardDescription>
                </CardHeader>
            </Card>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-[#F4D03F]">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h3 className="font-bold text-lg">Monthly report</h3>
                        </div>
                        <p className="text-base text-gray-500">Usage and cost summary</p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-400">Today 09:20</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => handleGenerate('Monthly report')} disabled={loading === 'Monthly report'}>
                                    {loading === 'Monthly report' ? 'Generating...' : 'Generate report'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload('Monthly report')} disabled={downloading === 'Monthly report'}>
                                    {downloading === 'Monthly report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-[#F4D03F]">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h3 className="font-bold text-lg">Anomalies report</h3>
                        </div>
                        <p className="text-base text-gray-500">List of deviations and alarms</p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-400">Yesterday 18:05</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => handleGenerate('Anomalies report')} disabled={loading === 'Anomalies report'}>
                                    {loading === 'Anomalies report' ? 'Generating...' : 'Generate report'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload('Anomalies report')} disabled={downloading === 'Anomalies report'}>
                                    {downloading === 'Anomalies report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-l-4 border-l-[#F4D03F]">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h3 className="font-bold text-lg">Cost report</h3>
                        </div>
                        <p className="text-base text-gray-500">Estimated costs by medium</p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-400">Yesterday 14:12</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => handleGenerate('Cost report')} disabled={loading === 'Cost report'}>
                                    {loading === 'Cost report' ? 'Generating...' : 'Generate report'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload('Cost report')} disabled={downloading === 'Cost report'}>
                                    {downloading === 'Cost report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                                </Button>
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
                                    <p className="text-sm text-gray-500">{report.date}</p>
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => handleDownload(report.name, report.data)} disabled={downloading === report.name}>
                                    {downloading === report.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MetersReports;
