import React from 'react';
import { ShieldCheck, Activity, Thermometer, UserCheck, Download, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthyHiveIndexProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const HealthyHiveIndex: React.FC<HealthyHiveIndexProps> = ({ onTabChange }) => {
    const [generatingCert, setGeneratingCert] = React.useState(false);

    const auditMetrics = [
        {
            label: 'Colony Size (FOB)',
            value: '8.4 Frames',
            status: 'Optimal',
            method: 'Acoustic Density',
            detail: 'Ensures 8-frame contract compliance.',
            score: 92
        },
        {
            label: 'Brood Stability',
            value: '35.2°C',
            status: 'Stable',
            method: 'Internal Thermal',
            detail: 'Confirms active queen and growth.',
            score: 98
        },
        {
            label: 'Queen Presence',
            value: 'Confirmed',
            status: 'Nominal',
            method: 'Acoustic Frequency',
            detail: 'Prevents collapse from queenlessness.',
            score: 100
        },
    ];

    const handleDownloadCert = () => {
        setGeneratingCert(true);
        setTimeout(() => setGeneratingCert(false), 2000);
    };

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <ShieldCheck className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Hive <span className="text-[#10b981]">Audit</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Healthy Hive Index (HHI) · Transparency Certification · Welfare Audit
                    </p>
                </div>

                <button
                    onClick={handleDownloadCert}
                    className="flex items-center gap-4 px-8 py-4 bg-[#064e3b] border-4 border-[#064e3b] text-white font-black text-xs uppercase tracking-widest shadow-[8px_8px_0px_0px_#10b981] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    {generatingCert ? (
                        <Activity className="w-5 h-5 animate-spin" />
                    ) : (
                        <Award className="w-5 h-5 text-[#facc15]" />
                    )}
                    {generatingCert ? 'Generating HHI Certificate...' : 'Download Welfare Certificate'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {auditMetrics.map((metric, i) => (
                    <div key={i} className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/40">{metric.label}</p>
                            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-5xl font-black text-[#064e3b] tracking-tighter">{metric.value}</p>
                            <div className="mt-4 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-[#10b981]" />
                                <span className="text-[10px] font-black uppercase text-[#10b981]">{metric.method}</span>
                            </div>
                            <p className="mt-6 text-[11px] font-bold text-[#064e3b]/60 leading-relaxed uppercase">
                                {metric.detail}
                            </p>
                        </div>
                        <div className="mt-10 border-t-2 border-[#064e3b]/5 pt-6 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30">Health Score</span>
                            <span className="text-xl font-black text-[#064e3b] tabular-nums">{metric.score}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Management by Exception (Alerts) */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-4">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Critical Exceptions (Audit Level)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: 'Queenless Alert: Sec-14', detail: 'Acoustic frequency shift detected. 4 colonies in Sector 14 are missing standard queen signatures.', action: 'Deploy Replacement' },
                        { title: 'Thermal Inconsistency: Pallet-B', detail: 'Brood temperature dropped below 34°C in 3 hives. Cold snap risk or colony shrinking.', action: 'Physical Inspection' },
                    ].map((alert, i) => (
                        <div key={i} className="border-4 border-red-500 p-8 bg-red-50 relative overflow-hidden group">
                            <ShieldCheck className="absolute -right-6 -bottom-6 w-24 h-24 text-red-500/10 group-hover:rotate-12 transition-all" />
                            <h4 className="text-xl font-black text-red-600 uppercase tracking-tight mb-2">{alert.title}</h4>
                            <p className="text-[10px] font-bold text-red-600/70 uppercase leading-relaxed max-w-md">
                                {alert.detail}
                            </p>
                            <button className="mt-6 px-6 py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-none">
                                Issue Exception Order: {alert.action}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certification Footer */}
            <div className="mt-20 border-8 border-[#064e3b] p-12 bg-[#064e3b]/5 shadow-[15px_15px_0px_0px_#064e3b]">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <Award className="w-24 h-24 text-[#facc15]" />
                    <div className="flex-1 space-y-4">
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-[#064e3b]">Welfare & Yield Transparency</h3>
                        <p className="text-[11px] font-bold text-[#064e3b]/60 uppercase leading-relaxed">
                            BeeYield certification proves that your orchard provides a safe, pesticide-managed, and nutrient-rich environment for pollinators. This data is verifiable via the 2026 apicultural blockchain standard for ESG reporting.
                        </p>
                        <div className="flex gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                <span className="text-[10px] font-black uppercase border-b-2 border-[#10b981]">Contract Compliance OK</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                <span className="text-[10px] font-black uppercase border-b-2 border-[#10b981]">Bio-Security Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthyHiveIndex;
