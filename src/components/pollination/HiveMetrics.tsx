import React from 'react';
import { Hexagon, Activity, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '../beeyield/GlassTheme';

const HiveMetrics: React.FC = () => {
    const metrics = [
        { label: 'Active Colonies', value: '42', unit: 'UNITS', icon: Hexagon, color: 'text-[#1B9157]' },
        { label: 'Avg Force Strength', value: '9.4', unit: 'FRAMES', icon: Activity, color: 'text-[#F4D03F]' },
        { label: 'Forage Intensity', value: 'High', unit: 'STATUS', icon: Zap, color: 'text-[#1B9157]' },
    ];

    return (
        <div className="space-y-4">
            {metrics.map((m, i) => (
                <div key={i} className={cn(glass.card, "p-4 flex items-center justify-between group hover:border-[#F4D03F]/20 transition-all")}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center border border-transparent group-hover:bg-[#F4D03F]/5 transition-all">
                            <m.icon className={cn("w-4 h-4", m.color)} />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black uppercase italic tracking-tight">{m.label}</h4>
                            <p className="text-[7px] font-black opacity-30 uppercase tracking-widest italic">{m.unit}</p>
                        </div>
                    </div>
                    <span className="text-[18px] font-black italic tracking-tighter">{m.value}</span>
                </div>
            ))}
            <button className={cn(glass.btnSecondary, "w-full h-9 mt-4 text-[9px] italic border-[#F4D03F]/20")}>
                View Network Health
            </button>
        </div>
    );
};

export default HiveMetrics;
