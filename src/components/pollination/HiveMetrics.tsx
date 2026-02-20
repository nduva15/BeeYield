import React from 'react';
import { Hexagon, Activity, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const HiveMetrics: React.FC = () => {
    const metrics = [
        { label: 'Active Colonies', value: '42', unit: 'UNITS', icon: Hexagon, color: 'text-[#064e3b]' },
        { label: 'Avg Force Strength', value: '9.4', unit: 'FRAMES', icon: Activity, color: 'text-[#10b981]' },
        { label: 'Forage Intensity', value: 'High', unit: 'STATUS', icon: Zap, color: 'text-[#facc15]' },
    ];

    return (
        <div className="border-4 border-[#064e3b] bg-white h-full shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
            <div className="bg-[#064e3b] p-6 flex items-center justify-between">
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Deployment Audit</h4>
                <ShieldCheck className="w-5 h-5 text-[#facc15]" />
            </div>

            <div className="p-8 space-y-8">
                {metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between border-b-2 border-[#064e3b]/5 pb-6 last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <m.icon className={cn("w-4 h-4", m.color)} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">{m.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#064e3b] leading-none">{m.value}</span>
                                <span className="text-[10px] font-black uppercase text-[#064e3b]/20 tracking-tighter">{m.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}

                <button className="w-full py-4 bg-white border-4 border-[#064e3b] text-[#064e3b] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#064e3b] hover:text-white transition-none">
                    View Network Health
                </button>
            </div>
        </div>
    );
};

export default HiveMetrics;
