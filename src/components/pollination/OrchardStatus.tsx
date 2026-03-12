import React from 'react';
import { Target, Timer, Leaf, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '../beeyield/GlassTheme';

const OrchardStatus: React.FC = () => {
    return (
        <div className={cn(glass.card, "p-5 relative overflow-hidden group space-y-6")}>
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1B9157]/10 mb-2">
                        <Leaf className="w-3 h-3 text-[#1B9157]" />
                        <span className="text-[7px] font-black text-[#1B9157] uppercase italic tracking-widest">Primary Variety Audit</span>
                    </div>
                    <h2 className="text-[20px] font-black italic tracking-tighter uppercase leading-none">
                        Lead <span className="text-[#1B9157]">Variety</span>
                    </h2>
                    <p className="font-black mt-1 text-[11px] uppercase italic tracking-widest opacity-40">
                        Nonpareil Almond // Sector 4B
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center text-[#F4D03F]">
                    <Target className="w-5 h-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 p-3 rounded-xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/5">
                    <p className="text-[8px] font-black uppercase italic tracking-widest opacity-30">Bloom Stage</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-[26px] font-black italic tracking-tighter leading-none">72<span className="text-[12px]">%</span></h3>
                        <div className="px-1.5 py-0.5 rounded-full bg-[#1B9157] text-white text-[7px] font-black uppercase italic tracking-widest mb-0.5">BBCH 67</div>
                    </div>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/5">
                    <p className="text-[8px] font-black uppercase italic tracking-widest opacity-30">Pollination Window</p>
                    <h3 className="text-[26px] font-black italic tracking-tighter leading-none text-[#F4D03F]">4.2<span className="text-[12px] text-[#1A1A1A]"> DAYS</span></h3>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/5">
                    <p className="text-[8px] font-black uppercase italic tracking-widest opacity-30">GDD Accumulation</p>
                    <h3 className="text-[26px] font-black italic tracking-tighter leading-none">342</h3>
                </div>
            </div>

            <div className="pt-4 border-t border-[#F4D03F]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#1B9157]" />
                    <p className="text-[9px] font-black uppercase italic">Estimated Peak Bloom: <span className="text-[#1B9157]">MAR 22</span></p>
                </div>
                <button className="flex items-center gap-1.5 text-[8px] font-black uppercase italic tracking-widest text-[#1A1A1A] hover:text-[#1B9157] transition-all group/btn">
                    Detailed Phenology <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#1B9157]/5 blur-3xl rounded-full" />
        </div>
    );
};

export default OrchardStatus;
