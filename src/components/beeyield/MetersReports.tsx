import React from 'react';
import { FileText, Download, Activity, DollarSign, BarChart, Loader2, Database, Terminal, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import BEEYIELD_LOGO from '@/assets/Logo.png';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

interface GeneratedReport {
    id: string;
    name: string;
    date: string;
    type: string;
    data?: any;
}

const MetersReports: React.FC = () => {
    const [generatedReports, setGeneratedReports] = React.useState<GeneratedReport[]>([
        { id: '1', name: 'Fault Log', date: '2026-01-17 07:50', type: 'PDF' }
    ]);
    const [loading, setLoading] = React.useState<string | null>(null);
    const [downloading, setDownloading] = React.useState<string | null>(null);

    const generateReportData = (reportName: string) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        if (reportName === 'Usage Audit') {
            return {
                title: 'Colony Consumption Audit',
                period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
                summary: [
                    { label: 'Total Nodes', val: 184 },
                    { label: 'Active Signal', val: 178 },
                    { label: 'Delta Water', val: '4.5 m3' },
                    { label: 'Delta Energy', val: '210 kWh' }
                ],
                breakdown: [
                    { region: 'ZONE_ALPHA', hives: 65, production: '1,240L', health: '98%' },
                    { region: 'ZONE_BETA', hives: 58, production: '980L', health: '96%' },
                    { region: 'ZONE_GAMMA', hives: 61, production: '1,622L', health: '97%' },
                ]
            };
        } else if (reportName === 'Fault Log') {
            return {
                title: 'System Fault & Exception Log',
                period: dateStr,
                anomalies: [
                    { hive: 'WAT-001', type: 'Leak', severity: 'High', date: '2026-01-28', status: 'Fix' },
                    { hive: 'ENE-015', type: 'Load', severity: 'Med', date: '2026-01-25', status: 'Fix' },
                    { hive: 'HEA-022', type: 'Offline', severity: 'Low', date: '2026-01-20', status: 'Fix' },
                ]
            };
        } else {
            return {
                title: 'Operational Cost Registry',
                period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
                costs: [
                    { label: 'Monitoring', val: 'KES 5,000' },
                    { label: 'Logistics', val: 'KES 1,000' },
                    { label: 'Total', val: 'KES 6,000' }
                ],
                margin: 'KES 51,000'
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
            toast.success(`Export Generated: ${reportName}`);
        }, 1200);
    };

    const handleDownload = async (reportName: string, reportData?: any) => {
        setDownloading(reportName);

        try {
            const doc = new jsPDF();
            const data = reportData || generateReportData(reportName);

            // Sleek Dark Theme Colors instead of brutalist Green
            doc.setFillColor(9, 9, 11);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text("BEEYIELD PROFESSIONAL", 20, 25);

            doc.setTextColor(245, 158, 11); // Amber
            doc.setFontSize(10);
            doc.text("OPERATIONAL ARCHIVE PROTOCOL v4.0", 20, 32);

            // Report Header
            doc.setTextColor(9, 9, 11);
            doc.setFontSize(18);
            doc.text(data.title.toUpperCase(), 20, 60);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`EXTRACT_DATE: ${data.period}`, 20, 70);
            doc.text("SECURITY_LEVEL: LEVEL_4_ENCRYPTED", 20, 75);

            // Content Section
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 80, 190, 80);

            let y = 95;
            doc.setTextColor(9, 9, 11);

            if (reportName === 'Usage Audit') {
                doc.setFontSize(12);
                doc.text("EXECUTIVE METRICS_SUMMARY", 20, y);
                y += 10;
                data.summary.forEach((s: any) => {
                    doc.setFontSize(10);
                    doc.text(`${s.label.toUpperCase()}:`, 25, y);
                    doc.text(`${s.val}`, 100, y);
                    y += 7;
                });

                y += 10;
                doc.setFontSize(12);
                doc.text("REGIONAL_BREAKDOWN", 20, y);
                y += 10;
                data.breakdown.forEach((b: any) => {
                    doc.setFontSize(10);
                    doc.text(`> ${b.region}: ${b.hives} Hives | ${b.production} | Health: ${b.health}`, 25, y);
                    y += 7;
                });
            } else if (reportName === 'Fault Log') {
                doc.setFontSize(12);
                doc.text("ANOMALY_REGISTRY", 20, y);
                y += 10;
                data.anomalies.forEach((a: any) => {
                    doc.setFontSize(10);
                    doc.text(`[${a.severity}] ${a.hive} - ${a.type} (${a.date}) -> STATUS: ${a.status}`, 25, y);
                    y += 7;
                });
            } else {
                doc.setFontSize(12);
                doc.text("FINANCIAL_LEDGER_DATA", 20, y);
                y += 10;
                data.costs.forEach((c: any) => {
                    doc.setFontSize(10);
                    doc.text(`${c.label.toUpperCase()}:`, 25, y);
                    doc.text(`${c.val}`, 100, y);
                    y += 7;
                });
                y += 10;
                doc.setFontSize(14);
                doc.setTextColor(16, 185, 129); // Emerald
                doc.text(`PROJECTED_CORE_MARGIN: ${data.margin}`, 20, y);
                doc.setTextColor(9, 9, 11);
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("This document is a professional extract of the BeeYield neural network.", 20, 280);
            doc.text("Verification hash: " + btoa(reportName + data.period).substring(0, 16), 20, 285);

            doc.save(`${reportName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
            toast.success(`Export Complete: ${reportName}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed', error);
            toast.error('Failed to generate PDF archive');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}>
            <div className="space-y-4">
                <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 mb-2')}>
                    <Database className="w-4 h-4 mr-2" />
                    Operational Archive Hub
                </div>
                <h1 className={cn(glass.sectionTitle, 'text-6xl')}>Export <span className="text-honey">Desk</span></h1>
                <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70 mt-2")}>
                    Encapsulated registry download and audit station.
                </p>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: 'Usage Audit', icon: FileText, desc: 'Signal & usage metrics.', color: 'text-blue-500' },
                    { id: 'Fault Log', icon: BarChart, desc: 'Deviations and signals.', color: 'text-emerald-500' },
                    { id: 'Cost Analysis', icon: DollarSign, desc: 'Operational margin.', color: 'text-amber-500' }
                ].map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={cn(glass.card, "p-8 flex flex-col group hover:shadow-xl hover:border-border")}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-black/20 flex items-center justify-center border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-xl normal-case")}>{item.id}</h3>
                        </div>
                        <p className={cn(glass.microLabel, "normal-case opacity-60 mb-8 flex-1 italic")}>{item.desc}</p>
                        <button
                            onClick={() => handleGenerate(item.id)}
                            disabled={!!loading}
                            className={cn(glass.btnSecondary, "w-full justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-300")}
                        >
                            {loading === item.id ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Compiling PDF...</>
                            ) : (
                                "Export PDF Archive"
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* History Registry */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden")}>
                <div className="p-8 border-b border-border bg-white/40 dark:bg-black/20 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Audit History <span className="text-honey">Registry</span></h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/20">
                                <th className={cn(glass.microLabel, "p-6 font-bold opacity-60")}>Report Identifier</th>
                                <th className={cn(glass.microLabel, "p-6 font-bold opacity-60")}>Archive Timestamp</th>
                                <th className={cn(glass.microLabel, "p-6 font-bold opacity-60")}>Format Protocol</th>
                                <th className={cn(glass.microLabel, "p-6 font-bold opacity-60 text-right")}>Retrieval Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {generatedReports.map((report) => (
                                <tr key={report.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="p-6">
                                        <span className={cn(glass.microLabel, "normal-case font-bold tracking-wider")}>{report.name}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={cn(glass.microLabel, "opacity-60")}>{report.date}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={cn(glass.badge, "bg-white/50 dark:bg-black/30 border-border group-hover:border-foreground/30")}>
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleDownload(report.name, report.data)}
                                            disabled={downloading === report.name}
                                            className={cn(glass.btnPrimary, "h-10 px-6 text-xs whitespace-nowrap inline-flex items-center gap-2")}
                                        >
                                            {downloading === report.name ? (
                                                <><Loader2 className="w-3 h-3 animate-spin" /> Extracting...</>
                                            ) : (
                                                <><Download className="w-3 h-3" /> Pull Archive</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default MetersReports;
