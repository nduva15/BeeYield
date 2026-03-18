import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Award,
    CheckCircle2,
    ShieldCheck,
    TrendingUp,
    FileCheck,
    Printer,
    Share2,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Zap,
    Scale,
    Activity,
    Info,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

interface PalletData {
    id: string;
    location: string;
    acousticDensity: number; // 0-100
    morningWeight: number; // kg
    grade: 'A' | 'B';
    confidence: number;
    status: 'Certified' | 'Pending';
}

const pallets: PalletData[] = [
    { id: 'PLT-0824', location: 'Section A-4', acousticDensity: 92, morningWeight: 44.2, grade: 'A', confidence: 99.4, status: 'Certified' },
    { id: 'PLT-0825', location: 'Section A-4', acousticDensity: 88, morningWeight: 43.8, grade: 'A', confidence: 98.2, status: 'Certified' },
    { id: 'PLT-0912', location: 'Section B-1', acousticDensity: 74, morningWeight: 38.5, grade: 'B', confidence: 95.1, status: 'Certified' },
    { id: 'PLT-1102', location: 'North Block', acousticDensity: 95, morningWeight: 45.1, grade: 'A', confidence: 99.7, status: 'Certified' },
    { id: 'PLT-1105', location: 'North Block', acousticDensity: 62, morningWeight: 34.2, grade: 'B', confidence: 92.4, status: 'Pending' },
];

const ContractVerificationModule: React.FC = () => {
    const [search, setSearch] = React.useState('');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-20 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
                <div className="space-y-2">
                    <div className={cn(glass.badge, 'bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20')}>
                        <FileCheck className="w-3.5 h-3.5 mr-2" />
                        Contract check v3.1
                    </div>
                    <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                        Grade <span className="text-[#F4D03F]">Certification</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case opacity-70")}>
                        Acoustic Brood Density · Morning Weight Matrix · Proven Pollination ROI
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className={cn(glass.btnPrimary, "h-9 px-6 font-bold shadow-sm")}>
                        <Printer className="w-3.5 h-3.5 mr-2" />
                        Export Master Report
                    </button>
                </div>
            </div>

            {/* Matrix Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(glass.card, "p-5 space-y-4 border-gray-100 bg-white shadow-sm")}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20 shadow-sm text-[#F4D03F]">
                            <Activity className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Acoustic Brood Index</h3>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                        System frequency analysis to determine frames of bees and brood presence. Grade A requires {'>'}85% density.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(glass.card, "p-5 space-y-4 border-gray-100 bg-white shadow-sm")}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm text-[#1B9157]">
                            <Scale className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Weight Threshold</h3>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                        Morning baseline mass validates cluster strength. Grade A requires {'>'}42kg per hive on the pallet gateway.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn(glass.card, "p-5 space-y-4 bg-[#F4D03F]/5 border-[#F4D03F]/10 relative overflow-hidden group shadow-sm")}
                >
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#F4D03F]/20 shadow-sm text-[#F4D03F]">
                            <Award className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[#F4D03F] tracking-tight">Pricing Lift</h3>
                    </div>
                    <p className="text-xs font-bold text-[#F4D03F]/80 leading-relaxed border-t border-[#F4D03F]/10 pt-4 relative z-10">
                        Certified Grade A pallets justify a 25% premium on per-hive payments due to proven pollination capacity.
                    </p>
                </motion.div>
            </div>

            {/* Search & Results Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-2xl border-border/50 relative")}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Verified Asset Ledger</h3>
                        <p className={cn(glass.microLabel, "opacity-60 font-bold")}>Mathematically certified pollination infrastructure</p>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Filter nodes..."
                            className={cn(glass.input, "h-9 pl-11 shadow-sm font-bold text-xs")}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className={cn(glass.microLabel, "p-8 opacity-40 font-black")}>Asset Identifier</th>
                                <th className={cn(glass.microLabel, "p-8 opacity-40 font-black")}>Location</th>
                                <th className={cn(glass.microLabel, "p-8 opacity-40 font-black text-center")}>Acoustic Score</th>
                                <th className={cn(glass.microLabel, "p-8 opacity-40 font-black text-center")}>Mass (Avg)</th>
                                <th className={cn(glass.microLabel, "p-8 opacity-40 font-black text-center")}>Grade</th>
                                <th className={cn(glass.microLabel, "p-8 opacity-40 font-black text-right")}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {pallets.filter(p => p.id.includes(search) || p.location.includes(search)).map((p, idx) => (
                                <tr key={p.id} className="group hover:bg-gray-400:bg-[#F4D03F]/10 transition-all">
                                    <td className="p-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-[#F4D03F] shadow-sm group-hover:bg-white transition-colors">
                                                #
                                            </div>
                                            <span className="text-xs font-bold text-[#1A1A1A]">{p.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#F4D03F]/40" />
                                            <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground transition-colors">{p.location}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-base font-bold text-foreground">{p.acousticDensity}%</span>
                                            <div className="w-24 h-2 rounded-full bg-border/30 overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${p.acousticDensity}%` }}
                                                    transition={{ duration: 1.5, delay: idx * 0.1 }}
                                                    className="h-full bg-[#F4D03F]"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center text-base font-bold text-foreground tabular-nums">{p.morningWeight} kg</td>
                                    <td className="p-8 text-center">
                                        <div className={cn(
                                            glass.badge,
                                            "px-4 py-2 border-transparent font-bold",
                                            p.grade === 'A' ? "bg-[#1B9157] text-[#1B9157]" : "bg-[#F4D03F] text-[#F4D03F]"
                                        )}>
                                            {p.grade === 'A' ? <Award className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                            Grade {p.grade}
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className={cn(glass.btnSecondary, "h-8 w-8 p-0 flex items-center justify-center")}
                                                aria-label="Share"
                                                title="Share"
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button className={cn(glass.btnPrimary, "h-8 px-4 text-[10px] font-bold")}>Verify</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Certification Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className={cn(glass.card, "p-10 space-y-6 shadow-xl border-[#1B9157]")}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#1B9157] flex items-center justify-center border border-[#1B9157] shadow-sm">
                                <ShieldCheck className="w-6 h-6 text-[#1B9157]" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Cryptographic Evidence</h3>
                        </div>
                        <p className="text-sm italic font-medium opacity-80 leading-relaxed border-t border-border/50 pt-6">
                            Every Grade A certification is backed by a salt-hashed biometric signature of the acoustic response and load-cell matrix.
                        </p>
                        <div className="p-5 bg-gray-400 rounded-2xl border border-border/50 font-mono text-[10px] break-all opacity-60 shadow-inner">
                            0x7B2f9281A12C5D6E8...CERTIFIER_SIG_VERIFIED_BY_BEE_YIELD_CORE
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <Badge className="rounded-xl bg-[#1B9157] text-white border-transparent px-4 py-1 font-bold shadow-md">F1 Score: 0.982</Badge>
                            <Badge className="rounded-xl bg-indigo-500 text-[#1A1A1A] border-transparent px-4 py-1 font-bold shadow-md">Model: YOLOv11n-HHI</Badge>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="h-full"
                >
                    <Card className={cn(glass.card, "p-0 h-full shadow-xl bg-[#F4D03F]/10 border-[#F4D03F]/20 relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#F4D03F]/20 transition-colors" />
                        <div className="p-10 flex items-center gap-10 h-full relative z-10">
                            <div className="w-28 h-28 rounded-2xl bg-[#FFF9F0]/60 flex items-center justify-center p-6 border border-[#F4D03F] shadow-xl group-hover:scale-110 transition-transform duration-500">
                                <Award className="w-full h-full text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className={cn(glass.sectionTitle, "text-3xl normal-case text-[#F4D03F] leading-tight")}>Pollination <br />ROI Lift</h3>
                                <p className="text-sm font-bold opacity-80 leading-snug mt-4 italic max-w-sm">
                                    Based on current market rates, Grade A certified pallets represent a $42.50 per-hive increase in seasonal contract value.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={cn(glass.card, "p-8 shadow-xl bg-[#F4D03F]/5 border-[#F4D03F]/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#F4D03F]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#F4D03F]/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FFF9F0]/60 flex items-center justify-center shrink-0 border border-[#F4D03F] shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-[#F4D03F]" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Verification Logic Summary</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Our recursive verification module synchronizes acoustic density and mass thresholding to certify pollination quality.
                        Grade A certification mandates absolute biometric alignment, unlocking premium contract rates and ensuring verifiable
                        biological performance for orchard stakeholders.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContractVerificationModule;
