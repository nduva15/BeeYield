import React from 'react';
import { ShieldCheck, Activity, AlertCircle, CheckCircle2, Award, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import beeyieldService from '@/services/beeyieldService';

interface HealthyHiveIndexProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const HealthyHiveIndex: React.FC<HealthyHiveIndexProps> = ({ onTabChange }) => {
    const [generatingCert, setGeneratingCert] = React.useState(false);

    const auditMetrics = [
        { label: 'Colony Size (FOB)', value: '8.4', unit: 'Frames', status: 'Optimal', method: 'Acoustic Density', detail: 'Ensures 8-frame contract compliance.', score: 92 },
        { label: 'Brood Stability', value: '35.2', unit: '°C', status: 'Stable', method: 'Internal Thermal', detail: 'Confirms active queen and growth.', score: 98 },
        { label: 'Queen Presence', value: '100', unit: '%', status: 'Nominal', method: 'Acoustic Frequency', detail: 'Prevents collapse from queenlessness.', score: 100 },
    ];

    const handleDownloadCert = async () => {
        if (generatingCert) return;
        setGeneratingCert(true);
        const tid = toast.loading('Generating certificate…');
        try {
            const { data, error } = await beeyieldService.generateReport({
                report_type: 'audit',
                parameters: {
                    scope_days: 90,
                    sections: ['overview', 'apiaries', 'hives', 'inspections'],
                },
                file_format: 'PDF',
            } as any);
            if (error || !data?.id) throw error || new Error('Report job could not be created');

            const status = await beeyieldService.waitForReport(String(data.id), { timeoutMs: 90_000 });
            if (status?.file_url) window.open(status.file_url, '_blank');
            toast.success('Certificate ready', { id: tid });
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Certificate generation failed', { id: tid });
        } finally {
            setGeneratingCert(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={ShieldCheck}
                label="Certification"
                title={<>Hive <span className="text-[#F4D03F]">Audit</span></>}
                subtitle="Healthy Hive Index (HHI) transparency certification and welfare audit."
                actions={
                    <button
                        onClick={handleDownloadCert}
                        disabled={generatingCert}
                        className={cn(glass.btnPrimary, "h-10 min-w-[200px] shadow-sm")}
                    >
                        {generatingCert ? (
                            <>
                                <Activity className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Certificate
                            </>
                        )}
                    </button>
                }
            />

            {/* Audit Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                {auditMetrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(glass.section, "p-6 flex flex-col group")}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</span>
                            <CheckCircle2 className="w-4 h-4 text-[#1B9157]" />
                        </div>

                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">{metric.value}</span>
                            <span className="text-sm font-bold text-gray-400">{metric.unit}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-3 h-3 text-[#1B9157]" />
                            <span className="text-[10px] font-bold text-[#1B9157] uppercase tracking-widest">{metric.method}</span>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed flex-1 border-l-2 border-[#F4D03F]/30 pl-3">
                            {metric.detail}
                        </p>

                        <div className="mt-6 pt-4 border-t border-[#F4D03F]/10 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-16 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                    <div className="h-full bg-[#1B9157] rounded-full transition-all" style={{ width: `${metric.score}%` }} />
                                </div>
                                <span className="text-sm font-black text-[#1A1A1A] tabular-nums">{metric.score}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Critical Exceptions */}
            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3 bg-red-50/50">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-red-200 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#1A1A1A]">Critical Exceptions</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest text-[9px]">Audit Level Alerts</p>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Queenless Alert: Sec-14', detail: 'Acoustic frequency shift detected. 4 colonies missing standard queen signatures.', action: 'Deploy Replacement' },
                        { title: 'Thermal Drop: Pallet-B', detail: 'Brood temperature dropped below 34°C in 3 hives. Cold snap or colony shrinking risk.', action: 'Physical Inspection' },
                    ].map((alert, i) => (
                        <div key={i} className="p-5 rounded-xl border border-red-100 bg-red-50/30 group relative overflow-hidden">
                            <h4 className="text-sm font-bold text-red-600 mb-2">{alert.title}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                                {alert.detail}
                            </p>
                            <button className="h-8 px-4 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                                {alert.action}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certification Footer */}
            <div className={cn(glass.card, "p-8 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white border-transparent relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4D03F]/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-[#F4D03F] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(244,208,63,0.3)]">
                        <Award className="w-10 h-10 text-[#1A1A1A]" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight">Welfare & Yield <span className="text-[#F4D03F]">Transparency</span></h3>
                            <p className="text-[10px] font-bold text-[#F4D03F]/60 uppercase tracking-widest">BeeYield Certified · ESG Compliant</p>
                        </div>
                        <p className="text-sm font-medium opacity-80 leading-relaxed pl-6 border-l-2 border-[#F4D03F]/40">
                            BeeYield certification proves your orchard provides a safe, pesticide-managed, and nutrient-rich environment for pollinators.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            {['Contract Compliance', 'Bio-Security Verified'].map(tag => (
                                <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-[#F4D03F]" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">{tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HealthyHiveIndex;
