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
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

const ComplianceReport: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-20 min-h-screen max-w-[1400px] mx-auto")}
        >
            {/* Report Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border/50 pb-10">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Certified Pollination Document v2.4
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Compliance <span className="text-honey">Report</span>
                    </h1>
                    <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] opacity-60 italic">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Season: Spring 2026</span>
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> REF: BY-CERT-00824</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className={cn(glass.btnSecondary, "h-14 px-8 font-bold")}>
                        <Printer className="w-4 h-4 mr-3" />
                        Print Archive
                    </button>
                    <button className={cn(glass.btnPrimary, "h-14 px-10 font-bold shadow-lg shadow-honey/20")}>
                        <Download className="w-4 h-4 mr-3" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Certificate Section */}
                <div className="lg:col-span-8 space-y-12">
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-12 relative overflow-hidden shadow-2xl border-honey/20")}
                    >
                        {/* Decorative Background Stamp */}
                        <Award className="absolute -top-10 -right-10 w-96 h-96 text-honey/[0.03] rotate-12 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-honey/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="space-y-10 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Verified Strength Audit</h3>
                                    <p className={cn(glass.microLabel, "opacity-60 italic font-semibold")}>Frames of Bees (FOB) Certification</p>
                                </div>
                                <div className="text-right">
                                    <p className={cn(glass.sectionTitle, "text-6xl text-honey")}>8.4</p>
                                    <p className={cn(glass.microLabel, "font-bold text-emerald-500 mt-1")}>AVG. FOB SCORE</p>
                                </div>
                            </div>

                            <Separator className="bg-border/50 h-[1px]" />

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2 text-center p-8 bg-white/40 rounded-2xl border border-dashed border-border shadow-sm">
                                    <p className={cn(glass.sectionTitle, "text-4xl")}>1,284</p>
                                    <p className={cn(glass.microLabel, "opacity-60")}>Certified Hives</p>
                                </div>
                                <div className="space-y-2 text-center p-8 bg-white/40 rounded-2xl border border-dashed border-border shadow-sm">
                                    <p className={cn(glass.sectionTitle, "text-4xl")}>98.2%</p>
                                    <p className={cn(glass.microLabel, "opacity-60")}>Contract Adherence</p>
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-8 bg-honey/10 border-honey/20 shadow-xl relative overflow-hidden group")}>
                                <div className="absolute inset-0 bg-honey/5 group-hover:bg-honey/10 transition-colors animate-pulse" />
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-honey shadow-sm">
                                        <Stamp className="w-6 h-6 text-honey" />
                                    </div>
                                    <h4 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Pollination Quality Guarantee</h4>
                                </div>
                                <p className="text-sm font-medium opacity-80 leading-relaxed mb-6 italic relative z-10">
                                    Based on acoustic biometric analysis and digital audit protocols, BeeYield certifies that the apiary strength meets or exceeds the minimum sustainable foraging threshold for this orchard block.
                                </p>
                                <div className="flex items-center justify-between border-t border-honey/20 pt-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span className={cn(glass.microLabel, "font-bold text-emerald-600")}>AUTHENTICATED_SECURE</span>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(glass.microLabel, "opacity-40 italic font-bold")}>DIGITAL_SIGNATURE</p>
                                        <p className="font-mono text-[10px] opacity-60">b57492...e91a02</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                                <Leaf className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Sustainability <span className="text-honey">Score</span></h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={cn(glass.card, "p-8 space-y-4 shadow-xl border-emerald-500/10")}>
                                <p className={cn(glass.microLabel, "opacity-60 font-bold")}>Biodiversity Impact</p>
                                <p className={cn(glass.sectionTitle, "text-5xl text-emerald-600")}>A+</p>
                                <p className="text-sm italic font-medium opacity-80 leading-relaxed border-t border-border/50 pt-4">
                                    No pesticide risk identified during foraging windows. High flowering diversity.
                                </p>
                            </div>
                            <div className={cn(glass.card, "p-8 space-y-4 shadow-xl border-emerald-500/10")}>
                                <p className={cn(glass.microLabel, "opacity-60 font-bold")}>Colony Welfare</p>
                                <div className="flex items-baseline gap-2">
                                    <p className={cn(glass.sectionTitle, "text-5xl text-emerald-600")}>92</p>
                                    <p className={cn(glass.microLabel, "font-bold opacity-40")}>/100</p>
                                </div>
                                <p className="text-sm italic font-medium opacity-80 leading-relaxed border-t border-border/50 pt-4">
                                    Net weight gain detected. Optimal forage availability throughout bloom.
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-10 space-y-8 shadow-xl bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10")}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-border shadow-sm">
                                <Info className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h4 className={cn(glass.sectionTitle, "text-xl normal-case")}>About Report</h4>
                        </div>
                        <p className="text-sm italic font-medium opacity-80 leading-relaxed text-foreground">
                            This report is a standardized document generated by BeeYield for global crop insurance and GAP certification.
                            It serves as a verifiable record of hive activity and orchard health synergy.
                        </p>
                        <Separator className="bg-border/50 h-[1px]" />
                        <div className="space-y-4">
                            {[
                                { label: 'Methodology Data', icon: Zap },
                                { label: 'Sensor Calibration logs', icon: Activity },
                                { label: 'Pesticide Data Feed', icon: Leaf }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-xl hover:bg-white/40:bg-gray-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-indigo-500/50 group-hover:text-indigo-500 transition-colors" />
                                        <span className={cn(glass.microLabel, "font-bold opacity-70 group-hover:opacity-100 group-hover:text-honey transition-all")}>{item.label}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-border group-hover:text-honey group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-10 space-y-8 text-center shadow-xl relative overflow-hidden group")}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-honey via-honey/50 to-honey animate-pulse" />
                        <div className="w-20 h-20 rounded-[2rem] bg-honey/10 flex items-center justify-center mx-auto border border-honey shadow-sm group-hover:scale-110 transition-transform duration-500">
                            <Share2 className="w-10 h-10 text-honey" />
                        </div>
                        <div className="space-y-2">
                            <h4 className={cn(glass.sectionTitle, "text-2xl normal-case")}>External Verification</h4>
                            <p className={cn(glass.microLabel, "italic opacity-60 leading-relaxed max-w-[240px] mx-auto")}>
                                Securely share this document with orchard owners or insurance underwriters.
                            </p>
                        </div>
                        <button className={cn(glass.btnSecondary, "w-full h-14 justify-center font-bold shadow-md hover:shadow-honey/20")}>
                            Generate Secure Link
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ComplianceReport;
