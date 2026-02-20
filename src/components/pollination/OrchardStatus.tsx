import React from 'react';
import { Target, Timer, Droplets, Leaf, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrchardStatus: React.FC = () => {
    return (
        <div className="border-4 border-[#064e3b] bg-white h-full relative overflow-hidden group shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
            <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 border-2 border-[#10b981] flex items-center justify-center bg-[#064e3b] text-[#facc15] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                    <Target className="w-8 h-8" />
                </div>
            </div>

            <div className="p-10 space-y-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-6">
                        <Leaf className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Primary Variety Audit</span>
                    </div>
                    <h2 className="text-7xl font-black text-[#064e3b] tracking-tighter uppercase leading-[0.8]">
                        Lead <span className="text-[#10b981]">Variety</span>
                    </h2>
                    <p className="text-[#064e3b]/40 font-black mt-4 text-2xl uppercase tracking-tight">
                        Nonpareil Almond // Sector 4B
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">Bloom Stage</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-5xl font-black text-[#064e3b] tracking-tighter">72<span className="text-xl">%</span></h3>
                            <div className="px-2 py-1 bg-[#10b981] text-white text-[8px] font-black mb-1">BBCH 67</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">Pollination Window</p>
                        <h3 className="text-5xl font-black text-[#064e3b] tracking-tighter">4.2<span className="text-xl"> DAYS</span></h3>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">GDD Accumulation</p>
                        <h3 className="text-5xl font-black text-[#064e3b] tracking-tighter">342</h3>
                    </div>
                </div>

                <div className="pt-8 border-t-2 border-[#064e3b]/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Timer className="w-5 h-5 text-[#10b981]" />
                        <p className="text-xs font-black uppercase text-[#064e3b]">Estimated Peak Bloom: <span className="text-[#10b981]">MAR 22</span></p>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#064e3b] hover:text-[#10b981] transition-none group/btn">
                        Detailed Phenology <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#10b981]/5 -rotate-45 translate-x-16 translate-y-16" />
        </div>
    );
};

export default OrchardStatus;
