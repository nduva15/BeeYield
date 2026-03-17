import React from 'react';
import ReportsExportsView from './ReportsExportsView';

const MetersReports: React.FC = () => {
    return <ReportsExportsView />;
};

export default MetersReports;

/*

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
    const [generatedReports, setGeneratedReports] = React.useState<GeneratedReport[]>([]);
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
        try {
            const data = generateReportData(reportName);
            const newReport: GeneratedReport = {
                id: Date.now().toString(),
                name: reportName,
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                type: 'PDF',
                data
            };
            setGeneratedReports(prev => [newReport, ...prev]);
            toast.success(`Export ready: ${reportName}`);
        } finally {
            setLoading(null);
        }
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
            <div className="space-y-2">
                <div className={cn(glass.badge, 'bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 mb-1')}>
                    <Database className="w-3.5 h-3.5" />
                    Operational Archive Hub
                </div>
                <h1 className={cn(glass.sectionTitle, 'text-xl font-black uppercase tracking-tight leading-none')}>Export <span className="text-[#F4D03F]">Desk</span></h1>
                <p className={cn(glass.microLabel, "normal-case italic font-bold opacity-40 tracking-widest uppercase")}>
                    Encapsulated registry download and audit station.
                </p>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: 'USAGE_AUDIT', icon: FileText, desc: 'SIGNAL_USAGE_METRICS', color: 'text-blue-500' },
                    { id: 'FAULT_LOG', icon: BarChart, desc: 'DEVIATIONS_AND_SIGNALS', color: 'text-[#1B9157]' },
                    { id: 'COST_ANALYSIS', icon: DollarSign, desc: 'OPERATIONAL_MARGIN', color: 'text-[#F4D03F]' }
                ].map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={cn(glass.card, "p-6 flex flex-col group shadow-sm bg-white/40 border-white/20")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                <item.icon className={cn("w-4 h-4", item.color)} />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">{item.id}</h3>
                        </div>
                        <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-6 flex-1">{item.desc}</p>
                        <button
                            onClick={() => handleGenerate(item.id)}
                            disabled={!!loading}
                            className={cn(glass.btnSecondary, "w-full justify-center hover:bg-white h-8 text-[9px] uppercase font-black tracking-[0.2em] text-[#1A1A1A]")}
                        >
                            {loading === item.id ? (
                                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> COMPILING_PDF...</>
                            ) : (
                                "EXPORT_PDF_ARCHIVE"
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* History Registry */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden bg-white/40 border-white/20")}>
                <div className="p-5 border-b border-white/10 bg-white/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                        <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                    </div>
                    <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">AUDIT_HISTORY_REGISTRY</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/20 bg-white/30">
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">REPORT_IDENTIFIER</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">ARCHIVE_TIMESTAMP</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">FORMAT_PROTOCOL</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">RETRIEVAL_ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {generatedReports.map((report) => (
                                <tr key={report.id} className="hover:bg-white/50 transition-colors group">
                                    <td className="px-5 py-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]">{report.name}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest tabular-nums">{report.date}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-white/50 text-gray-500 uppercase tracking-widest border border-white/40 shadow-sm">
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => handleDownload(report.name, report.data)}
                                            disabled={downloading === report.name}
                                            className={cn(glass.btnPrimary, "h-8 px-4 text-[8px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-2")}
                                        >
                                            {downloading === report.name ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> EXTRACTING...</>
                                            ) : (
                                                <><Download className="w-3.5 h-3.5" /> PULL_ARCHIVE</>
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
*/
