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
    status: 'CERTIFIED' | 'PENDING';
}

const pallets: PalletData[] = [
    { id: 'PLT-0824', location: 'Section A-4', acousticDensity: 92, morningWeight: 44.2, grade: 'A', confidence: 99.4, status: 'CERTIFIED' },
    { id: 'PLT-0825', location: 'Section A-4', acousticDensity: 88, morningWeight: 43.8, grade: 'A', confidence: 98.2, status: 'CERTIFIED' },
    { id: 'PLT-0912', location: 'Section B-1', acousticDensity: 74, morningWeight: 38.5, grade: 'B', confidence: 95.1, status: 'CERTIFIED' },
    { id: 'PLT-1102', location: 'North Block', acousticDensity: 95, morningWeight: 45.1, grade: 'A', confidence: 99.7, status: 'CERTIFIED' },
    { id: 'PLT-1105', location: 'North Block', acousticDensity: 62, morningWeight: 34.2, grade: 'B', confidence: 92.4, status: 'PENDING' },
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-10">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 mb-2')}>
                        <FileCheck className="w-4 h-4 mr-2" />
                        Contract Verification Engine v3.1
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Grade <span className="text-honey">Certification</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Acoustic Brood Density · Morning Weight Matrix · Proven Pollination ROI
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className={cn(glass.btnPrimary, "h-14 px-10 font-bold shadow-lg shadow-honey/20")}>
                        <Printer className="w-4 h-4 mr-3" />
                        Export Master Report
                    </button>
                </div>
            </div>

            {/* Matrix Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(glass.card, "p-8 space-y-4 shadow-xl hover:shadow-2xl transition-all border-border/50")}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-black/40 flex items-center justify-center border border-border shadow-sm">
                            <Activity className="w-6 h-6 text-honey" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-xl normal-case")}>Acoustic Brood Index</h3>
                    </div>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed text-foreground border-t border-border/50 pt-4">
                        Our system analyzes frequency response to determine frames of bees and brood presence. Grade A requires {'>'}85% density.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(glass.card, "p-8 space-y-4 shadow-xl hover:shadow-2xl transition-all border-border/50")}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-black/40 flex items-center justify-center border border-border shadow-sm">
                            <Scale className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-xl normal-case")}>Weight Threshold</h3>
                    </div>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed text-foreground border-t border-border/50 pt-4">
                        Morning baseline mass validates cluster strength. Grade A requires {'>'}42kg per hive on the pallet gateway.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn(glass.card, "p-8 space-y-4 shadow-xl bg-honey/10 border-honey/20 relative overflow-hidden group")}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-honey/5 rounded-full blur-2xl pointer-events-none group-hover:bg-honey/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-black/40 flex items-center justify-center border border-honey shadow-sm">
                            <Award className="w-6 h-6 text-honey" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-xl normal-case text-honey")}>Pricing Lift</h3>
                    </div>
                    <p className="text-sm italic font-bold opacity-80 leading-relaxed text-honey/80 border-t border-honey/20 pt-4 relative z-10">
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
                <div className="absolute top-0 right-0 w-96 h-96 bg-honey/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

                <div className="p-10 border-b border-border bg-white/40 dark:bg-black/20 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 relative z-10">
                    <div>
                        <h3 className={cn(glass.sectionTitle, "text-3xl normal-case italic")}>Verified Asset Ledger</h3>
                        <p className={cn(glass.microLabel, "opacity-60 font-bold mt-2")}>Mathematically certified pollination infrastructure</p>
                    </div>
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-honey" />
                        <Input
                            placeholder="Filter by Pallet ID or Location..."
                            className={cn(glass.input, "h-14 pl-12 shadow-sm font-semibold")}
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
                                <tr key={p.id} className="group hover:bg-white/40 dark:hover:bg-black/20 transition-all">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/40 border border-border flex items-center justify-center font-bold text-honey shadow-sm group-hover:scale-110 transition-transform">
                                                #
                                            </div>
                                            <span className="text-base font-bold text-foreground opacity-80 group-hover:opacity-100 transition-opacity">{p.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-honey/40" />
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
                                                    className="h-full bg-honey"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center text-base font-bold text-foreground tabular-nums">{p.morningWeight} kg</td>
                                    <td className="p-8 text-center">
                                        <div className={cn(
                                            glass.badge,
                                            "px-4 py-2 border-transparent font-bold",
                                            p.grade === 'A' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        )}>
                                            {p.grade === 'A' ? <Award className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                            Grade {p.grade}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className={cn(glass.btnSecondary, "h-12 w-12 p-0 flex items-center justify-center shadow-md")}><Share2 className="w-4 h-4" /></button>
                                            <button className={cn(glass.btnPrimary, "h-12 px-6 font-bold shadow-md")}>Verify Audit</button>
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
                    <Card className={cn(glass.card, "p-10 space-y-6 shadow-xl border-emerald-500/20")}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Cryptographic Evidence</h3>
                        </div>
                        <p className="text-sm italic font-medium opacity-80 leading-relaxed border-t border-border/50 pt-6">
                            Every Grade A certification is backed by a salt-hashed biometric signature of the acoustic response and load-cell matrix.
                        </p>
                        <div className="p-5 bg-white/40 dark:bg-black/20 rounded-2xl border border-border/50 font-mono text-[10px] break-all opacity-60 shadow-inner">
                            0x7B2f9281A12C5D6E8...CERTIFIER_SIG_VERIFIED_BY_BEE_YIELD_CORE
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <Badge className="rounded-xl bg-emerald-500 dark:bg-emerald-600 text-white border-transparent px-4 py-1 font-bold shadow-md">F1 Score: 0.982</Badge>
                            <Badge className="rounded-xl bg-indigo-500 dark:bg-indigo-600 text-white border-transparent px-4 py-1 font-bold shadow-md">Model: YOLOv11n-HHI</Badge>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="h-full"
                >
                    <Card className={cn(glass.card, "p-0 h-full shadow-xl bg-honey/10 border-honey/20 relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-honey/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-honey/20 transition-colors" />
                        <div className="p-10 flex items-center gap-10 h-full relative z-10">
                            <div className="w-28 h-28 rounded-[2.5rem] bg-white/60 dark:bg-black/40 flex items-center justify-center p-6 border border-honey shadow-xl group-hover:scale-110 transition-transform duration-500">
                                <Award className="w-full h-full text-honey" />
                            </div>
                            <div>
                                <h3 className={cn(glass.sectionTitle, "text-3xl normal-case text-honey leading-tight")}>Pollination <br />ROI Lift</h3>
                                <p className="text-sm font-bold opacity-80 leading-snug mt-4 italic max-w-sm">
                                    Based on current market rates, Grade A certified pallets represent a $42.50 per-hive increase in seasonal contract value.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={cn(glass.card, "p-8 shadow-xl bg-honey/5 border-honey/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-honey/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-honey/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 dark:bg-black/40 flex items-center justify-center shrink-0 border border-honey shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-honey" />
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
