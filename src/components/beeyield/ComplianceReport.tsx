import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ComplianceReport: React.FC = () => {
    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-20">
            {/* Report Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b-8 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Certified Pollination Document</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Compliance <span className="text-[#10b981]">Report</span>
                    </h1>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/40">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Season: Spring 2026</span>
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> REF: BY-CERT-00824</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 px-8 border-4 border-[#064e3b] bg-white text-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                        <Printer className="w-4 h-4 mr-3" />
                        Print Page
                    </Button>
                    <Button className="h-16 px-10 bg-[#064e3b] text-white border-4 border-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
                        <Download className="w-4 h-4 mr-3" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Certificate Section */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="p-12 border-8 border-[#064e3b] bg-white relative overflow-hidden">
                        {/* Decorative Background Stamp */}
                        <Award className="absolute -top-10 -right-10 w-64 h-64 text-[#064e3b]/[0.03] rotate-12" />

                        <div className="space-y-10 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Verified Strength Audit</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest italic">Frames of Bees (FOB) Certification</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-[#064e3b]">8.4</p>
                                    <p className="text-[9px] font-black text-[#10b981] uppercase tracking-widest">AVG. FOB SCORE</p>
                                </div>
                            </div>

                            <Separator className="bg-[#064e3b]/10 h-1" />

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2 text-center p-6 bg-neutral-50 border-2 border-[#064e3b] border-dashed">
                                    <p className="text-3xl font-black text-[#064e3b]">1,284</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Certified Hives</p>
                                </div>
                                <div className="space-y-2 text-center p-6 bg-neutral-50 border-2 border-[#064e3b] border-dashed">
                                    <p className="text-3xl font-black text-[#064e3b]">98.2%</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contract Adherence</p>
                                </div>
                            </div>

                            <div className="p-8 border-4 border-[#064e3b] bg-[#064e3b] text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <Stamp className="w-8 h-8 text-[#facc15]" />
                                    <h4 className="text-xl font-black uppercase tracking-tighter">Pollination Quality Guarantee</h4>
                                </div>
                                <p className="text-xs font-bold text-white/70 uppercase leading-relaxed mb-6">
                                    Based on acoustic biometric analysis and digital audit protocols, BeeYield certifies that the apiary strength meets or exceeds the minimum sustainable foraging threshold for this orchard block.
                                </p>
                                <div className="flex items-center justify-between border-t-2 border-white/10 pt-6">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">AUTHENTICATED_SECURE</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">DIGITAL_SIGNATURE</p>
                                        <p className="font-mono text-[9px]">b57492...e91a02</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-[#10b981] border-l-8 pl-6">
                            <Leaf className="w-6 h-6 text-[#10b981]" />
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-[#064e3b]">Sustainability Score</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Biodiversity Impact</p>
                                <p className="text-4xl font-black text-[#064e3b]">A+</p>
                                <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase leading-snug">
                                    No pesticide risk identified during foraging windows. High flowering diversity.
                                </p>
                            </div>
                            <div className="p-8 border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colony Welfare</p>
                                <p className="text-4xl font-black text-[#064e3b]">92/100</p>
                                <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase leading-snug">
                                    Net weight gain detected. Optimal forage availability throughout bloom.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-10">
                    <div className="p-10 border-4 border-[#064e3b] bg-neutral-50 space-y-8">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-[#064e3b]" />
                            <h4 className="text-xl font-black uppercase tracking-tighter">About Report</h4>
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed">
                            This report is a standardized document generated by BeeYield for global crop insurance and GAP certification.
                            It serves as a verifiable record of hive activity and orchard health synergy.
                        </p>
                        <Separator className="bg-[#064e3b]/10 h-1" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] group-hover:text-[#10b981]">Methodology Data</span>
                                <ArrowRight className="w-4 h-4 text-[#064e3b]/30 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] group-hover:text-[#10b981]">Sensor Calibration logs</span>
                                <ArrowRight className="w-4 h-4 text-[#064e3b]/30 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] group-hover:text-[#10b981]">Pesticide Data Feed</span>
                                <ArrowRight className="w-4 h-4 text-[#064e3b]/30 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="p-10 border-4 border-[#064e3b] bg-white space-y-8 text-center">
                        <Share2 className="w-12 h-12 text-[#064e3b]/20 mx-auto" />
                        <div className="space-y-2">
                            <h4 className="text-xl font-black uppercase tracking-tighter">External Verification</h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest max-w-xs mx-auto">
                                Securely share this report with orchard owners or insurance underwriters.
                            </p>
                        </div>
                        <Button className="w-full h-14 bg-white text-[#064e3b] border-4 border-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-none font-black uppercase tracking-widest text-xs">
                            Share Link
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceReport;
