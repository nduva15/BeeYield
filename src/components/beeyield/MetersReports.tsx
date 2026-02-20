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

            try {
                doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 30, 30);
            } catch (e) {
                console.warn('Could not load logo for PDF');
            }

            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.text('BeeYield', 50, 25);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Apiary Management System', 50, 32);
            doc.text('Kibwezi, Kenya', 50, 38);

            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text(data.title, 14, 55);

            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text(`Report Period: ${data.period}`, 14, 63);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 70);

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.line(14, 75, pageWidth - 14, 75);

            let yPos = 85;

            if (reportName === 'Monthly report') {
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text('Summary', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                const summary = data.summary;
                doc.text(`Total Meters: ${summary.totalMeters}`, 14, yPos); yPos += 7;
                doc.text(`Active Meters: ${summary.activeMeters}`, 14, yPos); yPos += 7;
                doc.text(`Avg Water Usage: ${summary.avgUsageWater}`, 14, yPos); yPos += 7;
                doc.text(`Avg Energy Usage: ${summary.avgUsageEnergy}`, 14, yPos); yPos += 7;
                doc.text(`Total Consumption: ${summary.totalConsumption}`, 14, yPos); yPos += 7;
                doc.text(`Alerts Resolved: ${summary.alertsResolved}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.text('Area Breakdown', 14, yPos);
                yPos += 10;

                doc.setDrawColor(0, 0, 0);
                doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);
                doc.setFontSize(10);
                doc.text('Area', 16, yPos);
                doc.text('Hives', 70, yPos);
                doc.text('Production', 100, yPos);
                doc.text('Health', 150, yPos);
                yPos += 10;
                doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);

                data.breakdown.forEach((row: any) => {
                    doc.text(row.region, 16, yPos);
                    doc.text(row.hives.toString(), 70, yPos);
                    doc.text(row.production, 100, yPos);
                    doc.text(row.health, 150, yPos);
                    yPos += 8;
                });

            } else if (reportName === 'Anomalies report') {
                doc.setFontSize(14);
                doc.text('Alert Statistics', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                const stats = data.stats;
                doc.text(`Total Alerts: ${stats.totalAlerts}`, 14, yPos); yPos += 7;
                doc.text(`Resolved: ${stats.resolved}`, 14, yPos); yPos += 7;
                doc.text(`Pending: ${stats.pending}`, 14, yPos); yPos += 7;
                doc.text(`Avg Resolution Time: ${stats.avgResolutionTime}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.text('Recent Anomalies', 14, yPos);
                yPos += 10;

                doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);
                doc.setFontSize(10);
                doc.text('Meter / Hive', 16, yPos);
                doc.text('Type', 50, yPos);
                doc.text('Severity', 110, yPos);
                doc.text('Date', 140, yPos);
                doc.text('Status', 175, yPos);
                yPos += 10;
                doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);

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
                doc.text('Operating Costs', 14, yPos);
                yPos += 10;

                doc.setFontSize(11);
                const costs = data.costs;
                doc.text(`Monitoring: ${costs.monitoring}`, 14, yPos); yPos += 7;
                doc.text(`Taxes: ${costs.taxes}`, 14, yPos); yPos += 7;
                doc.text(`Logistics: ${costs.logistics}`, 14, yPos); yPos += 7;
                doc.text(`Total Costs: ${costs.total}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.text('Revenue', 14, yPos);
                yPos += 10;

                const revenue = data.revenue;
                doc.text(`Honey Sales: ${revenue.honeysSales}`, 14, yPos); yPos += 7;
                doc.text(`Pollination Services: ${revenue.pollinationServices}`, 14, yPos); yPos += 7;
                doc.text(`Total Revenue: ${revenue.total}`, 14, yPos); yPos += 15;

                doc.setFontSize(14);
                doc.setTextColor(255, 79, 0); // International Orange
                doc.text(`Net Profit: ${data.netProfit}`, 14, yPos);
            }

            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('BeeYield System Export', pageWidth / 2, 280, { align: 'center' });

            const fileName = `BeeYield_${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success(`${reportName} downloaded.`);
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-6 text-black selection:bg-[#FF4F00] selection:text-white">
            <h1 className="text-5xl font-black uppercase tracking-tighter">Reports</h1>

            {/* Header Summary */}
            <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <CardTitle className="uppercase font-black text-sm tracking-widest">System Reports</CardTitle>
                    </div>
                    <CardDescription className="uppercase font-bold text-[10px] text-neutral-500">Export system data in PDF format.</CardDescription>
                </CardHeader>
            </Card>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black">
                <div className="p-6 border-black border-b-2 md:border-b-0 md:border-r-2 space-y-4 hover:bg-neutral-50 transition-none">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <h3 className="font-black text-lg uppercase tracking-tight">Monthly</h3>
                    </div>
                    <p className="text-[10px] font-bold uppercase text-neutral-400">Usage and cost summary</p>
                    <div className="space-y-2 pt-4">
                        <Button className="w-full bg-black text-white hover:bg-[#FF4F00] rounded-none border-2 border-black font-bold uppercase text-[10px] h-10 transition-none" onClick={() => handleGenerate('Monthly report')} disabled={loading === 'Monthly report'}>
                            {loading === 'Monthly report' ? 'Generating...' : 'Generate'}
                        </Button>
                        <Button variant="ghost" className="w-full text-black hover:bg-neutral-200 rounded-none font-bold uppercase text-[10px] h-10 transition-none" onClick={() => handleDownload('Monthly report')} disabled={downloading === 'Monthly report'}>
                            {downloading === 'Monthly report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                        </Button>
                    </div>
                </div>

                <div className="p-6 border-black border-b-2 md:border-b-0 md:border-r-2 space-y-4 hover:bg-neutral-50 transition-none">
                    <div className="flex items-center gap-2">
                        <BarChart className="w-5 h-5" />
                        <h3 className="font-black text-lg uppercase tracking-tight">Anomalies</h3>
                    </div>
                    <p className="text-[10px] font-bold uppercase text-neutral-400">Deviations and alarms</p>
                    <div className="space-y-2 pt-4">
                        <Button className="w-full bg-black text-white hover:bg-[#FF4F00] rounded-none border-2 border-black font-bold uppercase text-[10px] h-10 transition-none" onClick={() => handleGenerate('Anomalies report')} disabled={loading === 'Anomalies report'}>
                            {loading === 'Anomalies report' ? 'Generating...' : 'Generate'}
                        </Button>
                        <Button variant="ghost" className="w-full text-black hover:bg-neutral-200 rounded-none font-bold uppercase text-[10px] h-10 transition-none" onClick={() => handleDownload('Anomalies report')} disabled={downloading === 'Anomalies report'}>
                            {downloading === 'Anomalies report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-4 hover:bg-neutral-50 transition-none">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        <h3 className="font-black text-lg uppercase tracking-tight">Costs</h3>
                    </div>
                    <p className="text-[10px] font-bold uppercase text-neutral-400">Expenses by medium</p>
                    <div className="space-y-2 pt-4">
                        <Button className="w-full bg-black text-white hover:bg-[#FF4F00] rounded-none border-2 border-black font-bold uppercase text-[10px] h-10 transition-none" onClick={() => handleGenerate('Cost report')} disabled={loading === 'Cost report'}>
                            {loading === 'Cost report' ? 'Generating...' : 'Generate'}
                        </Button>
                        <Button variant="ghost" className="w-full text-black hover:bg-neutral-200 rounded-none font-bold uppercase text-[10px] h-10 transition-none" onClick={() => handleDownload('Cost report')} disabled={downloading === 'Cost report'}>
                            {downloading === 'Cost report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Download</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Generated Reports List */}
            <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                    <CardTitle className="text-sm uppercase font-black tracking-widest">History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0 border-t-2 border-black">
                    {generatedReports.length === 0 ? (
                        <p className="p-4 text-[10px] font-bold uppercase text-neutral-400">Empty.</p>
                    ) : (
                        generatedReports.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-4 border-b-2 border-black last:border-b-0 hover:bg-neutral-100 transition-none">
                                <div>
                                    <h4 className="font-black uppercase text-xs">{report.name}</h4>
                                    <p className="text-[10px] font-bold text-neutral-400">{report.date}</p>
                                </div>
                                <Button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white rounded-none font-bold uppercase text-[10px] h-8 transition-none" onClick={() => handleDownload(report.name, report.data)} disabled={downloading === report.name}>
                                    {downloading === report.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" />Export</>}
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
