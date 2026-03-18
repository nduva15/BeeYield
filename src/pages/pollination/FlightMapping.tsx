import React from 'react';
import {
    Map as MapIcon,
    Navigation,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const FlightMapping: React.FC = () => {
    return (
        <BeeYieldPageShell className="bg-[#FFF9F0] text-[#064e3b] font-sans antialiased p-8 md:p-12 -m-0 md:-m-0">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Back Link */}
                <Link to="/precision-pollination" className="inline-flex items-center gap-2 text-[10px] font-black text-[#10b981] hover:text-[#064e3b] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </Link>

                {/* Header */}
                <div className="border-b-4 border-[#064e3b] pb-8">
                    <h1 className="text-6xl font-black tracking-tighter leading-none">
                        Flight <span className="text-[#10b981]">Mapping</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-[10px] mt-4">
                        Enterprise Geospatial Analysis // v2.4.0
                    </p>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="border-4 border-[#064e3b] bg-[#FFF9F0] h-[700px] relative overflow-hidden group shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                        {/* Interactive Background */}
                        <div className="absolute inset-0 grayscale opacity-20 contrast-150" style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200")',
                            backgroundSize: 'cover'
                        }} />
                        <div className="absolute inset-0 bg-[#064e3b]/10" />

                        {/* Tactical Grid */}
                        <div className="absolute inset-0 p-10 grid grid-cols-12 grid-rows-8 gap-4">
                            {[...Array(96)].map((_, i) => (
                                <div key={i} className="border border-[#064e3b]/10 hover:bg-[#facc15]/20 flex items-center justify-center transition-none cursor-crosshair group/tile relative">
                                    <div className="text-[6px] font-black text-gray-600 absolute top-1 left-1 opacity-0 group-hover/tile:opacity-100">{i}</div>
                                </div>
                            ))}
                        </div>

                        {/* Hive Points & Flight Paths */}
                        <div className="absolute inset-0">
                            {/* Hive A */}
                            <div className="absolute top-[30%] left-[20%]">
                                <div className="w-4 h-4 bg-[#facc15] border-2 border-black rotate-45 shadow-[4px_4px_0px_0px_#000]" />
                                <div className="mt-4 px-2 py-1 bg-[#FFF9F0] border-2 border-black font-black text-[8px]">Node_Alpha</div>
                                {/* Flight Vector */}
                                <svg className="absolute top-2 left-2 w-48 h-48 pointer-events-none overflow-visible">
                                    <path d="M 0 0 Q 50 -100 150 -50" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                                    <circle r="3" fill="#10b981">
                                        <animateMotion path="M 0 0 Q 50 -100 150 -50" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                </svg>
                            </div>

                            {/* Hive B */}
                            <div className="absolute top-[60%] left-[70%]">
                                <div className="w-4 h-4 bg-[#facc15] border-2 border-black rotate-45 shadow-[4px_4px_0px_0px_#000]" />
                                <div className="mt-4 px-2 py-1 bg-[#FFF9F0] border-2 border-black font-black text-[8px]">Node_Beta</div>
                            </div>
                        </div>

                        {/* Legend Overlay */}
                        <div className="absolute bottom-8 right-8 space-y-2 p-6 bg-[#FFF9F0] border-4 border-[#064e3b] shadow-[6px_6px_0px_0px_#064e3b]">
                            <h5 className="font-black text-[10px] border-b-2 border-black pb-2 mb-4">Flight Analysis</h5>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-1 bg-[#10b981] dashed" />
                                <span className="text-[8px] font-black text-neutral-400">High Intesity Route</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-[#facc15] rotate-45 border border-black" />
                                <span className="text-[8px] font-black text-neutral-400">Deployed Hive</span>
                            </div>
                        </div>

                        {/* Map Controls */}
                        <div className="absolute top-8 right-8 flex flex-col gap-2">
                            <button className="w-10 h-10 bg-[#FFF9F0] border-4 border-[#064e3b] flex items-center justify-center font-black hover:bg-[#facc15] transition-none">+</button>
                            <button className="w-10 h-10 bg-[#FFF9F0] border-4 border-[#064e3b] flex items-center justify-center font-black hover:bg-[#facc15] transition-none">-</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-2">
                            <p className="text-[10px] font-black text-neutral-400">Active Map Layer</p>
                            <h4 className="text-xl font-black">Satellite / Tactical Overlay</h4>
                        </div>
                        <div className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-2">
                            <p className="text-[10px] font-black text-neutral-400">Tracked Units</p>
                            <h4 className="text-xl font-black">45 Colonies</h4>
                        </div>
                        <div className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-2">
                            <p className="text-[10px] font-black text-neutral-400">Coverage Index</p>
                            <h4 className="text-xl font-black text-[#10b981]">98.2% Optimal</h4>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes dash {
                    to { stroke-dashoffset: -100; }
                }
            `}} />
        </BeeYieldPageShell>
    );
};

export default FlightMapping;
