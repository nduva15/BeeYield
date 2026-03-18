import React from 'react';
import { Target, Timer, Leaf, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '../beeyield/GlassTheme';

const OrchardStatus: React.FC = () => {
    return (
        <div className={cn(glass.card, "p-5 relative overflow-hidden group space-y-6")}>
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1B9157]/10 mb-1">
                        <Leaf className="w-3 h-3 text-[#1B9157]" />
                        <span className="text-[8px] font-bold text-[#1B9157] uppercase tracking-widest">Primary Variety Audit</span>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
                        Lead <span className="text-[#1B9157]">Variety</span>
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Variety Not Set // Sector Pending
                    </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center text-[#F4D03F]">
                    <Target className="w-4 h-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 p-3 rounded-xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bloom Stage</p>
                    <div className="flex items-end gap-1.5">
                        <h3 className="text-xl font-bold tracking-tight leading-none text-[#1A1A1A]">—<span className="text-[10px]">%</span></h3>
                        <div className="px-1.5 py-0.5 rounded-full bg-gray-400 text-white text-[8px] font-bold uppercase tracking-wider mb-0.5">BBCH —</div>
                    </div>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pollination Window</p>
                    <h3 className="text-xl font-bold tracking-tight leading-none text-[#F4D03F]">—<span className="text-[10px] font-bold text-[#1A1A1A]"> DAYS</span></h3>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">GDD Accumulation</p>
                    <h3 className="text-xl font-bold tracking-tight leading-none text-[#1A1A1A]">0</h3>
                </div>
            </div>

            <div className="pt-4 border-t border-[#F4D03F]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#1B9157]" />
                    <p className="text-[9px] font-black uppercase italic">Estimated Peak Bloom: <span className="text-[#1B9157]">Pending Data</span></p>
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
