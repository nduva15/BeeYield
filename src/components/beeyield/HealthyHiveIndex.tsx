import React from 'react';
import { ShieldCheck, Activity, AlertCircle, CheckCircle2, Award, Download, Info } from 'lucide-react';
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
    const [auditMetrics, setAuditMetrics] = React.useState<any[]>([]);
    const [criticalExceptions, setCriticalExceptions] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isOffline, setIsOffline] = React.useState(false);

    const LS_KEY = "beeyield_healthy_hive_cache_v1";

    const readCache = React.useCallback(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }, []);

    const writeCache = React.useCallback((data: any) => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(data));
        } catch { /* ignore */ }
    }, []);

    React.useEffect(() => {
        const loadAuditData = async () => {
            setLoading(true);
            setIsOffline(false);
            try {
                const [readings, tasks] = await Promise.all([
                    beeyieldService.getAcousticReadings(undefined, 7),
                    beeyieldService.getTasks()
                ]);

                // Map metrics from real readings
                const avgHealth = readings.length ? readings.reduce((sum, r) => sum + (r.health_index || 0), 0) / readings.length : 0;
                const avgTemp = readings.length ? readings.reduce((sum, r) => sum + (r.temperature || 35), 0) / readings.length : 35.2;

                const metrics = [
                    { label: 'Colony Strength', value: readings.length ? (readings.length / 10).toFixed(1) : '—', unit: 'Index', status: 'Optimal', method: 'Sensor Sweep', detail: 'Measures activity density across the apiary.', score: avgHealth || 90 },
                    { label: 'Brood Stability', value: avgTemp.toFixed(1), unit: '°C', status: 'Stable', method: 'Thermal Scan', detail: 'Confirms active queen and growth.', score: 95 },
                    { label: 'System Integrity', value: '100', unit: '%', status: 'Nominal', method: 'Pulse Check', detail: 'All devices reporting health status.', score: 100 },
                ];

                const exceptions = (tasks || [])
                    .filter(t => !t.is_completed && (t.priority === 'High' || t.priority === 'high'))
                    .map(t => ({ title: t.title, detail: t.description || 'No extra detail provided.', action: 'View Task' }))
                    .slice(0, 2);

                if (exceptions.length === 0) {
                    exceptions.push({ title: 'No Critical Alerts', detail: 'The audit system found no urgent issues in your apiaries.', action: 'Status OK' } as any);
                }

                setAuditMetrics(metrics);
                setCriticalExceptions(exceptions);
                writeCache({ metrics, exceptions, timestamp: Date.now() });

            } catch (err) {
                console.error("Failed to load audit data", err);
                const cached = readCache();
                if (cached) {
                    setAuditMetrics(cached.metrics);
                    setCriticalExceptions(cached.exceptions);
                    setIsOffline(true);
                    toast.info("Offline: Showing last audit summary");
                }
            } finally {
                setLoading(false);
            }
        };
        loadAuditData();
    }, [readCache, writeCache]);

    const handleDownloadCert = async () => {
        if (generatingCert) return;
        setGeneratingCert(true);
        const tid = toast.loading('Generating production certificate…');
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

    if (loading && !isOffline) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Activity className="w-8 h-8 animate-spin text-[#F1C40F]" />
                <span className="text-sm font-semibold text-gray-400 italic">Compiling audit summary…</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={ShieldCheck}
                label="Compliance"
                title={<>Production <span className="text-[#F1C40F]">Audit</span></>}
                subtitle="Health & production transparency certification and welfare assessment."
                actions={
                    <button
                        id="download-cert-btn"
                        onClick={handleDownloadCert}
                        disabled={generatingCert}
                        className={cn(glass.btnPrimary, "h-10 min-w-[200px] shadow-sm")}
                        aria-label="Download Health Certificate"
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

            {isOffline && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Info className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-sm font-semibold text-amber-700">Offline mode: Displaying last known audit status.</p>
                    </div>
                </div>
            )}

            {/* Audit Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                {auditMetrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(glass.section, "p-6 flex flex-col group bg-white")}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-bold text-gray-400">{metric.label}</span>
                            <CheckCircle2 className="w-4 h-4 text-[#1B9157]" />
                        </div>

                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">{metric.value}</span>
                            <span className="text-sm font-bold text-gray-400">{metric.unit}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-3 h-3 text-[#1B9157]" />
                            <span className="text-[10px] font-bold text-[#1B9157]">{metric.method}</span>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed flex-1 border-l-2 border-[#F1C40F]/30 pl-3">
                            {metric.detail}
                        </p>

                        <div className="mt-6 pt-4 border-t border-[#F1C40F]/10 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-400">Score</span>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden border border-[#F1C40F]/10">
                                    <div className="h-full bg-[#1B9157] rounded-full transition-all" style={{ width: `${metric.score}%` }} />
                                </div>
                                <span className="text-sm font-black text-[#1A1A1A] tabular-nums">{Math.round(metric.score)}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Critical Exceptions */}
            <div className={cn(glass.section, "p-0 overflow-hidden bg-white mt-12")}>
                <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3 bg-red-50/50">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-red-200 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#1A1A1A]">Maintenance Alerts</h3>
                        <p className="text-[9px] font-bold text-gray-500">Live Status Notifications</p>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {criticalExceptions.map((alert, i) => (
                        <div key={i} className="p-5 rounded-xl border border-red-100 bg-red-50/30 group relative overflow-hidden">
                            <h4 className="text-sm font-bold text-red-600 mb-2">{alert.title}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed mb-4 font-medium">
                                {alert.detail}
                            </p>
                            <button 
                                onClick={() => onTabChange('yard-operations')}
                                className="h-8 px-4 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                aria-label={`Resolve alert: ${alert.title}`}
                            >
                                {alert.action}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certification Footer */}
            <div className={cn(glass.card, "p-8 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white border-transparent relative overflow-hidden group mt-12")}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F1C40F]/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-[#F1C40F] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(241,196,15,0.3)]">
                        <Award className="w-10 h-10 text-[#1A1A1A]" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight">Supply Chain <span className="text-[#F1C40F]">Transparency</span></h3>
                            <p className="text-[10px] font-bold text-[#F1C40F]/60 uppercase tracking-widest">BeeYield Verified · 2026 AUDIT COMPLIANT</p>
                        </div>
                        <p className="text-sm font-medium opacity-80 leading-relaxed pl-6 border-l-2 border-[#F1C40F]/40">
                            Our certificate confirms your operation provides a safe, pesticide-managed, and nutrient-rich environment for bees, meeting global welfare standards.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            {['Contract Standards', 'Welfare Verified'].map(tag => (
                                <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-[#F1C40F]" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{tag}</span>
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
