import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <FileCheck className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Contract Verification Engine</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Grade <span className="text-[#10b981]">Certification</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-sm uppercase tracking-widest mt-2 px-1">
                        Acoustic Brood Density + Morning Weight Matrix = Proven Pollination ROI
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button className="h-16 px-8 rounded-none border-4 border-[#064e3b] bg-[#facc15] text-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:shadow-none translate-y-[-2px] hover:translate-y-0 transition-all">
                        <Printer className="w-4 h-4 mr-2" />
                        Export Master Report
                    </Button>
                </div>
            </div>

            {/* Matrix Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border-4 border-[#064e3b] p-8 bg-neutral-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-[#064e3b]" />
                        <h3 className="text-xl font-black uppercase tracking-tighter">Acoustic Brood Index</h3>
                    </div>
                    <p className="text-[10px] font-bold text-[#064e3b]/60 leading-relaxed uppercase">
                        Our system analyzes frequency response to determine frames of bees and brood presence. Grade A requires {'>'}85% density.
                    </p>
                </div>
                <div className="border-4 border-[#064e3b] p-8 bg-neutral-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Scale className="w-6 h-6 text-[#10b981]" />
                        <h3 className="text-xl font-black uppercase tracking-tighter">Weight Threshold</h3>
                    </div>
                    <p className="text-[10px] font-bold text-[#064e3b]/60 leading-relaxed uppercase">
                        Morning baseline mass validates cluster strength. Grade A requires {'>'}42kg per hive on the pallet gateway.
                    </p>
                </div>
                <div className="border-4 border-[#064e3b] p-8 bg-[#064e3b] text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Award className="w-6 h-6 text-[#facc15]" />
                        <h3 className="text-xl font-black uppercase tracking-tighter text-[#facc15]">Pricing Lift</h3>
                    </div>
                    <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase">
                        Certified Grade A pallets justify a 25% premium on per-hive payments due to proven pollination capacity.
                    </p>
                </div>
            </div>

            {/* Search & Results Table */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardHeader className="p-10 border-b-4 border-[#064e3b]/5 bg-neutral-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-3xl font-black text-[#064e3b] uppercase tracking-tighter italic">Verified Asset Ledger</CardTitle>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/30 tracking-widest px-1">Mathematically certified pollination infrastructure</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/30" />
                            <Input
                                placeholder="Filter by Pallet ID or Location..."
                                className="h-12 pl-12 rounded-none border-4 border-[#064e3b] bg-white text-xs font-black uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-4 border-[#064e3b]/5">
                                    <th className="p-6 text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest">Asset Identifier</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest">Location</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest text-center">Acoustic Score</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest text-center">Mass (Avg)</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest text-center">Grade</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-[#064e3b]/5">
                                {pallets.filter(p => p.id.includes(search) || p.location.includes(search)).map((p) => (
                                    <tr key={p.id} className="group hover:bg-[#10b981]/[0.02]">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-none border-2 border-[#064e3b] bg-white flex items-center justify-center font-black text-[10px]">
                                                    #
                                                </div>
                                                <span className="text-sm font-black text-[#064e3b]">{p.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-bold text-[#064e3b]/60 uppercase">{p.location}</td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-[#064e3b]">{p.acousticDensity}%</span>
                                                <div className="w-16 h-1 mt-1 bg-neutral-100 border border-[#064e3b]/10">
                                                    <div className="h-full bg-[#064e3b]" style={{ width: `${p.acousticDensity}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center text-sm font-black text-[#064e3b] tabular-nums">{p.morningWeight} kg</td>
                                        <td className="p-6 text-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 border-2 font-black text-[10px] uppercase",
                                                p.grade === 'A' ? "border-[#10b981] bg-[#10b981]/10 text-[#064e3b]" : "border-[#facc15] bg-[#facc15]/10 text-[#064e3b]"
                                            )}>
                                                {p.grade === 'A' ? <Award className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                Grade {p.grade}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-[#064e3b] hover:bg-white transition-none">
                                                    <Share2 className="w-4 h-4 text-[#064e3b]" />
                                                </Button>
                                                <Button className="h-10 px-4 rounded-none bg-[#064e3b] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#10b981] transition-none">
                                                    Verify
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Certification Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-none border-4 border-[#10b981] bg-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                            <CardTitle className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Cryptographic Evidence</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                        <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase leading-relaxed mb-6">
                            Every Grade A certification is backed by a salt-hashed biometric signature of the acoustic response and load-cell matrix.
                        </p>
                        <div className="p-4 bg-neutral-50 border-2 border-[#064e3b]/5 font-mono text-[9px] break-all text-[#064e3b]/40">
                            0x7B2f9281A12C5D6E8...CERTIFIER_SIG_VERIFIED_BY_BEE_YIELD_CORE
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <Badge className="rounded-none bg-[#10b981] text-white">F1 Score: 0.982</Badge>
                            <Badge className="rounded-none bg-[#064e3b] text-white">Model: YOLOv11n-HHI</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
                    <CardContent className="p-8 flex items-center gap-8 h-full">
                        <div className="w-24 h-24 border-4 border-[#facc15] bg-white flex items-center justify-center p-4">
                            <Award className="w-full h-full text-[#facc15]" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-[#facc15] uppercase tracking-tighter">Pollination ROI Lift</h3>
                            <p className="text-sm font-bold text-white/60 uppercase leading-snug mt-2">
                                Based on current market rates for almond pollination, Grade A certified pallets represent a $42.50 per-hive increase in seasonal contract value.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContractVerificationModule;
