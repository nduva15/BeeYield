import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Download,
    ShieldCheck,
    CheckCircle2,
    Award,
    Leaf,
    Calendar,
    Stamp,
    Printer,
    Share2,
    Info,
    ArrowRight,
    Zap,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

const ComplianceReport: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "space-y-8 pb-32")}
        >
            {/* Report Header */}
            <PageHeader
                icon={FileText}
                label="Certified Pollination Document v2.4"
                title={<>Compliance <span className="text-[#F4D03F]">Report</span></>}
                subtitle="Season: Spring 2026 // REF: BY-CERT-00824"
                actions={
                    <div className="flex gap-4">
                        <button className={cn(glass.btnSecondary, "h-12 px-6 font-black uppercase text-xs rounded-xl shadow-sm")}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </button>
                        <button className={cn(glass.btnPrimary, "h-12 px-8 font-black uppercase text-xs shadow-sm rounded-xl")}>
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Certificate Section */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-8 relative overflow-hidden shadow-sm border-[#F4D03F]/20 rounded-3xl")}
                    >
                        {/* Decorative Background Stamp */}
                        <Award className="absolute -top-10 -right-10 w-96 h-96 text-[#F4D03F]/[0.03] rotate-12 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="space-y-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Verified Strength Audit</h3>
                                    <p className="text-[10px] font-black uppercase opacity-40">Frames of Bees (FOB) Certification</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-black text-[#F4D03F] tracking-tight tabular-nums leading-none">8.4</p>
                                    <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase">AVG. FOB SCORE</p>
                                </div>
                            </div>

                            <Separator className="bg-border/50 h-[1px]" />

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1 text-center p-6 bg-black/5 rounded-2xl border border-dashed border-border">
                                    <p className="text-3xl font-black tabular-nums">1,284</p>
                                    <p className="text-[10px] font-bold uppercase opacity-40">Certified Hives</p>
                                </div>
                                <div className="space-y-1 text-center p-6 bg-black/5 rounded-2xl border border-dashed border-border">
                                    <p className="text-3xl font-black tabular-nums">98.2%</p>
                                    <p className="text-[10px] font-bold uppercase opacity-40">Contract Match</p>
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-6 bg-[#F4D03F]/10 border-[#F4D03F]/20 shadow-sm relative overflow-hidden group")}>
                                <div className="absolute inset-0 bg-[#F4D03F]/5 group-hover:bg-[#F4D03F]/10 transition-colors" />
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center border border-[#F4D03F] shadow-sm">
                                        <Stamp className="w-5 h-5 text-[#F4D03F]" />
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tight">Quality Guarantee</h4>
                                </div>
                                <p className="text-[10px] font-bold opacity-80 leading-relaxed mb-6 uppercase tracking-tight relative z-10">
                                    acoustic biometric analysis confirms that the apiary strength meets or exceeds the minimum sustainable foraging threshold for this orchard block.
                                </p>
                                <div className="flex items-center justify-between border-t border-[#F4D03F]/20 pt-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span className="text-[8px] font-black text-emerald-600 uppercase">AUTHENTICATED</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-[8px] opacity-40">SEC_ID: b57492...e91a02</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                                <Leaf className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Sustainability <span className="text-[#F4D03F]">Metrics</span></h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={cn(glass.card, "p-6 space-y-2 shadow-sm bg-white/50 border-emerald-500/10 rounded-2xl")}>
                                <p className="text-[10px] font-black uppercase opacity-40">Biodiversity</p>
                                <p className="text-4xl font-black text-emerald-600">A+</p>
                                <p className="text-xs font-bold opacity-60 leading-relaxed uppercase tracking-tight pt-2 border-t border-black/5">
                                    Zero pesticide risk detected.
                                </p>
                            </div>
                            <div className={cn(glass.card, "p-6 space-y-2 shadow-sm bg-white/50 border-emerald-500/10 rounded-2xl")}>
                                <p className="text-[10px] font-black uppercase opacity-40">Welfare Index</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-black text-emerald-600">92</p>
                                    <p className="text-[10px] font-black opacity-20">/100</p>
                                </div>
                                <p className="text-xs font-bold opacity-60 leading-relaxed uppercase tracking-tight pt-2 border-t border-black/5">
                                    Positive weight gain trajectory.
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-8 space-y-6 shadow-sm bg-white/50 backdrop-blur-xl border-border/50 rounded-3xl")}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center border border-border shadow-sm">
                                <Info className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-tight">Standardization</h4>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 leading-relaxed uppercase tracking-tight text-foreground">
                            Standardized document generated for global crop insurance and GAP certification. Verifiable record of orchard synergy.
                        </p>
                        <Separator className="bg-border/50 h-[1px]" />
                        <div className="space-y-3">
                            {[
                                { label: 'Methodology', icon: Zap },
                                { label: 'Sensor logs', icon: Activity },
                                { label: 'Pesticide Feed', icon: Leaf }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="w-3.5 h-3.5 text-indigo-500/50" />
                                        <span className="text-[8px] font-black uppercase opacity-60 group-hover:opacity-100 group-hover:text-[#F4D03F] transition-all">{item.label}</span>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-border group-hover:text-[#F4D03F] transition-all" />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-8 space-y-6 text-center shadow-sm relative overflow-hidden group rounded-3xl")}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center mx-auto border border-[#F4D03F]/20 shadow-sm group-hover:scale-105 transition-transform">
                            <Share2 className="w-8 h-8 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase tracking-tight">Verification</h4>
                            <p className="text-[10px] font-bold uppercase opacity-40 leading-relaxed max-w-[200px] mx-auto">
                                Securely share with underwriters or crop owners.
                            </p>
                        </div>
                        <button className={cn(glass.btnSecondary, "w-full h-12 justify-center font-black uppercase text-xs rounded-xl shadow-sm")}>
                            Generate Link
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ComplianceReport;
