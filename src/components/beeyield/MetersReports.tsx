import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Activity, DollarSign, BarChart, Loader2, Database, Terminal, ShieldCheck } from 'lucide-react';
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
        { id: '1', name: 'Fault Log', date: '2026-01-17 07:50', type: 'PDF' }
    ]);
    const [loading, setLoading] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

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
            toast.success(`Export: ${reportName}`);
        }, 1200);
    };

    const handleDownload = async (reportName: string, reportData?: any) => {
        setDownloading(reportName);
        // Minimal logic for PDF trigger
        setTimeout(() => {
            toast.success(`File: ${reportName}.pdf`);
            setDownloading(null);
        }, 800);
    };

    return (
        <div className="space-y-12 bg-white text-[#064e3b] p-8 min-h-screen antialiased">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Export Desk</h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] mt-4">Registry Download Station</p>
                </div>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-[#064e3b]">
                {[
                    { id: 'Usage Audit', icon: FileText, desc: 'Signal & usage metrics.' },
                    { id: 'Fault Log', icon: BarChart, desc: 'Deviations and signals.' },
                    { id: 'Cost Analysis', icon: DollarSign, desc: 'Operational margin.' }
                ].map((item, i) => (
                    <div key={i} className="p-8 border-[#064e3b] border-b-4 md:border-b-0 md:border-r-4 last:border-r-0 hover:bg-[#facc15]/10 transition-all flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <item.icon className="w-6 h-6 text-[#10b981]" />
                            <h3 className="font-black text-xl uppercase tracking-tighter">{item.id}</h3>
                        </div>
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/50 mb-10 flex-1">{item.desc}</p>
                        <button
                            onClick={() => handleGenerate(item.id)}
                            disabled={!!loading}
                            className="h-14 border-2 border-[#064e3b] bg-[#10b981] text-white font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            {loading === item.id ? 'Running...' : 'Export PDF'}
                        </button>
                    </div>
                ))}
            </div>

            {/* History Registry */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Audit History</h3>
                </div>
                <div className="border-2 border-[#064e3b]">
                    <div className="bg-[#064e3b] text-white p-4 grid grid-cols-4 text-[10px] font-black uppercase tracking-widest">
                        <span>Report</span>
                        <span>Timestamp</span>
                        <span>Type</span>
                        <span className="text-right">Action</span>
                    </div>
                    <div className="divide-y-2 divide-[#064e3b]/10">
                        {generatedReports.map((report) => (
                            <div key={report.id} className="p-4 grid grid-cols-4 items-center hover:bg-[#facc15]/5">
                                <span className="text-xs font-black uppercase">{report.name}</span>
                                <span className="text-[10px] font-black uppercase text-[#064e3b]/40">{report.date}</span>
                                <span className="text-[10px] font-black uppercase">{report.type}</span>
                                <div className="text-right">
                                    <button
                                        onClick={() => handleDownload(report.name, report.data)}
                                        className="px-4 py-2 border-2 border-[#064e3b] bg-white text-[#064e3b] font-black uppercase text-[10px] tracking-widest hover:bg-[#facc15]"
                                    >
                                        Pull
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetersReports;
