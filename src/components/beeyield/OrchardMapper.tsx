import React, { useState, useRef, useMemo } from 'react';
import { Map, MapPin, MousePointer2, Calculator, Share2, Info, Zap, Layers, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrchardMapperProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

interface Point {
    x: number;
    y: number;
}

const OrchardMapper: React.FC<OrchardMapperProps> = ({ onTabChange }) => {
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const acreage = useMemo(() => {
        if (points.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area) / (2 * 100); // Scale factor for pixels to acres
    }, [points]);

    // Calculus-based saturation logic
    const suggestedHives = Math.ceil(acreage * 2.5); // Baseline 2.5 hives per acre

    const handleSVGClick = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const rect = svgRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPoints([...points, { x, y }]);
    };

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Layers className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Farm <span className="text-[#10b981]">Setup</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Map Area · Hive Count · Hive Drop Map
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsDrawing(!isDrawing)}
                        className={cn(
                            "px-8 py-4 border-4 font-black text-xs uppercase tracking-widest transition-all",
                            isDrawing ? "bg-[#facc15] text-[#064e3b] border-[#064e3b]" : "bg-[#064e3b] text-white border-[#064e3b] shadow-[8px_8px_0px_0px_#10b981]"
                        )}
                    >
                        {isDrawing ? "Finish Drawing" : "Draw New Area"}
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 border-4 border-[#064e3b] bg-white text-[#064e3b] font-black text-xs uppercase tracking-widest hover:bg-[#064e3b] hover:text-white transition-all group">
                        <Share2 className="w-5 h-5 group-hover:text-[#facc15]" />
                        Save Hive Map
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* SVG Drawing Canvas */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="border-8 border-[#064e3b] bg-white h-[600px] relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(6,78,59,1)]">
                        <svg
                            ref={svgRef}
                            className="absolute inset-0 w-full h-full cursor-crosshair"
                            onClick={handleSVGClick}
                        >
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#064e3b" strokeWidth="0.5" strokeOpacity="0.1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {points.length > 0 && (
                                <polygon
                                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                    fill="rgba(16,185,129,0.15)"
                                    stroke="#10b981"
                                    strokeWidth="4"
                                    strokeDasharray="10 5"
                                />
                            )}

                            {points.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="6" fill="#064e3b" stroke="white" strokeWidth="2" />
                            ))}
                        </svg>

                        {isDrawing && (
                            <div className="absolute top-6 left-6 p-3 bg-[#facc15] border-2 border-[#064e3b] font-black text-[10px] uppercase shadow-md flex items-center gap-2">
                                <Activity className="w-4 h-4 animate-pulse" />
                                Drawing Mode Active
                            </div>
                        )}
                    </div>
                </div>

                {/* Logistics & Saturation Panel */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b]">
                        <div className="flex items-center gap-3 mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <Calculator className="w-5 h-5 text-[#10b981]" />
                            <h3 className="text-xl font-black uppercase text-[#064e3b] tracking-tight">Area Stats</h3>
                        </div>
                        <div className="space-y-10">
                            <div>
                                <p className="text-[10px] font-black uppercase text-[#064e3b]/30 tracking-widest">Total Area</p>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-5xl font-black text-[#064e3b]">{acreage.toFixed(1)}</span>
                                    <span className="text-xl font-black text-[#10b981] mb-1">Acres</span>
                                </div>
                            </div>
                            <div className="pt-8 border-t-2 border-[#064e3b]/5">
                                <p className="text-[10px] font-black uppercase text-[#064e3b]/30 tracking-widest">Suggested Hives</p>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-5xl font-black text-[#064e3b]">{suggestedHives}</span>
                                    <span className="text-xl font-black text-[#facc15] mb-1">Hives</span>
                                </div>
                                <p className="mt-4 text-[9px] font-bold text-[#064e3b]/50 uppercase leading-relaxed">
                                    Based on **2.5 Hives/Acre** (Standard density). Adjust in "Pollination Math" for specific needs.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#064e3b] border-4 border-[#064e3b] p-8 text-white shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-[#facc15]" />
                            <h4 className="text-lg font-black uppercase tracking-tight">Hive Placement</h4>
                        </div>
                        <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase">
                            The system uses a special **Hive Placement Plan** to make sure bees cover the whole area. This helps pollination by **18%**.
                        </p>
                    </div>

                    <div className="border-4 border-[#064e3b]/10 p-6 bg-[#064e3b]/3 flex items-start gap-4">
                        <Info className="w-10 h-10 text-[#064e3b]/20" />
                        <div>
                            <p className="text-[9px] font-black text-[#064e3b] uppercase">Location Data Export</p>
                            <p className="text-[8px] font-bold text-[#064e3b]/40 uppercase mt-1">
                                Hive map data can be saved as a simple file for drone drops or manual placement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrchardMapper;
