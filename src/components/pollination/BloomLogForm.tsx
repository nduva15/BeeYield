import React, { useState } from 'react';
import { X, Sprout, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '../beeyield/GlassTheme';
import { motion } from 'framer-motion';

interface BloomLogFormProps {
    onClose: () => void;
}

const BloomLogForm: React.FC<BloomLogFormProps> = ({ onClose }) => {
    const [bloomPercent, setBloomPercent] = useState(50);
    const [variety, setVariety] = useState('Nonpareil');

    return (
        <div className={cn(glass.card, "bg-white/90 backdrop-blur-2xl border-[#F4D03F]/20 p-0 overflow-hidden shadow-2xl relative max-w-lg w-full mx-auto")}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="p-4 border-b border-[#F4D03F]/10 flex items-center justify-between bg-[#1A1A1A]/5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center">
                        <Sprout className="w-4 h-4 text-[#F4D03F]" />
                    </div>
                    <h3 className="text-[12px] font-black uppercase italic tracking-widest text-[#1A1A1A]">Precision Log</h3>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6 space-y-6 relative z-10">
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] opacity-60 italic">Orchard Block / Variety</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Nonpareil', 'Monterey', 'Butte', 'Padre'].map(v => (
                            <button
                                key={v}
                                onClick={() => setVariety(v)}
                                className={cn(
                                    glass.card,
                                    "p-3 font-black uppercase text-[10px] italic tracking-widest transition-all",
                                    variety === v ? "bg-[#1B9157] text-white border-[#1B9157]" : "bg-white/50 text-[#1A1A1A] hover:bg-white border-transparent"
                                )}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] opacity-60 italic">Visual Bloom Saturation</label>
                        <span className="text-[24px] font-black italic tracking-tighter text-[#1B9157] leading-none">{bloomPercent}%</span>
                    </div>
                    <div className="relative h-2 bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={bloomPercent}
                            onChange={(e) => setBloomPercent(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute top-0 left-0 h-full bg-[#1B9157] rounded-full pointer-events-none" style={{ width: `${bloomPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase text-[#1A1A1A] opacity-40 italic tracking-widest">
                        <span>Pre-Bloom</span>
                        <span>Full Saturation</span>
                    </div>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold uppercase leading-tight text-amber-700 italic">
                        Manual logs override automated estimates. Verify visual observations before saving to tactical registry.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className={cn(glass.btnSecondary, "flex-1 h-10 text-[10px] italic bg-white/50")}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className={cn(glass.btnPrimary, "flex-1 h-10 text-[10px] italic gap-2")}
                    >
                        <Save className="w-3.5 h-3.5" />
                        Commit Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BloomLogForm;
