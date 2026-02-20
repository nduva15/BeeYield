import React, { useState } from 'react';
import { X, Sprout, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BloomLogFormProps {
    onClose: () => void;
}

const BloomLogForm: React.FC<BloomLogFormProps> = ({ onClose }) => {
    const [bloomPercent, setBloomPercent] = useState(50);
    const [variety, setVariety] = useState('Nonpareil');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#064e3b]/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white border-8 border-[#064e3b] shadow-[16px_16px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                {/* Header */}
                <div className="bg-[#064e3b] p-6 flex items-center justify-between border-b-4 border-[#064e3b]">
                    <div className="flex items-center gap-4">
                        <Sprout className="w-6 h-6 text-[#facc15]" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Precision Log</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#10b981] text-white transition-none">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Variety Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-[#064e3b]">Orchard Block / Variety</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Nonpareil', 'Monterey', 'Butte', 'Padre'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setVariety(v)}
                                    className={cn(
                                        "py-4 border-4 font-black uppercase text-xs tracking-widest transition-none",
                                        variety === v ? "bg-[#064e3b] text-white border-[#064e3b]" : "bg-white text-[#064e3b] border-[#064e3b]/10 hover:border-[#064e3b]"
                                    )}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bloom Percentage Slider */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-black uppercase tracking-widest text-[#064e3b]">Visual Bloom Saturation</label>
                            <span className="text-4xl font-black text-[#10b981]">{bloomPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={bloomPercent}
                            onChange={(e) => setBloomPercent(parseInt(e.target.value))}
                            className="w-full h-4 bg-neutral-100 appearance-none border-2 border-[#064e3b] cursor-pointer accent-[#10b981]"
                        />
                        <div className="flex justify-between text-[10px] font-black uppercase text-[#064e3b]/40">
                            <span>Pre-Bloom</span>
                            <span>Full Saturation</span>
                        </div>
                    </div>

                    {/* Warning/Info Box */}
                    <div className="p-4 bg-[#facc15]/10 border-2 border-[#facc15] flex gap-4 items-start">
                        <AlertTriangle className="w-5 h-5 text-[#facc15] shrink-0" />
                        <p className="text-[10px] font-bold uppercase leading-tight text-[#064e3b]">
                            Manual logs override automated satellite estimates. Verify visual observations before saving to tactical registry.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 border-4 border-[#064e3b] font-black uppercase text-xs tracking-widest hover:bg-neutral-50 transition-none"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose} // Simulate save
                            className="flex-1 py-4 bg-[#064e3b] text-white border-4 border-[#064e3b] font-black uppercase text-xs tracking-widest hover:bg-[#10b981] transition-none shadow-[6px_6px_0px_0px_#10b981]"
                        >
                            Commit Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloomLogForm;
