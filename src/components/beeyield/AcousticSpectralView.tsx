import React, { useState, useEffect } from 'react';
import { Activity, Volume2, Info, Zap, Cpu, CheckCircle2, Waves, Brain } from 'lucide-react';

interface AcousticSpectralViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const generateSpectralData = () => {
    return Array.from({ length: 40 }, (_, i) => ({
        energy: Math.sin(i * 0.5) * 20 + 50 + Math.random() * 10,
    }));
};

const AcousticSpectralView: React.FC<AcousticSpectralViewProps> = () => {
    const [spectralData, setSpectralData] = useState(generateSpectralData());

    useEffect(() => {
        const interval = setInterval(() => {
            setSpectralData(generateSpectralData());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Volume2 className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Hive <span className="text-[#10b981]">Sound</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Live Sound Check · Colony Health · Queen Status
                    </p>
                </div>

                <div className="flex bg-[#064e3b] border-4 border-[#064e3b] p-1 shadow-[4px_4px_0px_0px_#10b981]">
                    <div className="px-6 py-2 bg-white flex items-center gap-3">
                        <Waves className="w-4 h-4 text-[#10b981]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Status: Listening</span>
                        <div className="w-px h-4 bg-[#064e3b]/10 mx-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Real-time Stream</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Sound View Card */}
                <div className="lg:col-span-2 border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b]">
                    <div className="flex items-center justify-between mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                        <div>
                            <h3 className="text-2xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Sound <span className="text-[#10b981]">Waves</span></h3>
                            <p className="text-[9px] text-[#064e3b]/30 font-black uppercase tracking-[0.2em] mt-2">Live frequency display from the hive</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#10b981]">Live Feed</span>
                    </div>

                    <div className="h-64 flex items-end gap-1 mb-10">
                        {spectralData.map((val, i) => (
                            <div
                                key={i}
                                style={{ height: `${val.energy}%` }}
                                className="flex-1 bg-[#10b981] min-w-[2px] transition-all duration-300 opacity-60"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-8 border-t-2 border-[#064e3b]/5">
                        <div>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/30">Low Sound</p>
                            <p className="text-2xl font-black text-[#064e3b]">Stable</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/30">Mid Sound</p>
                            <p className="text-2xl font-black text-[#064e3b]">Healthy</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/30">High Sound</p>
                            <p className="text-2xl font-black text-[#064e3b]">Normal</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="border-4 border-[#064e3b] p-8 bg-[#064e3b] text-white shadow-[10px_10px_0px_0px_#facc15]">
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu className="w-5 h-5 text-[#facc15]" />
                            <h4 className="text-lg font-black uppercase tracking-tight">Smart Check</h4>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[8px] font-black uppercase text-white/40 mb-1">Colony Mood</p>
                                <p className="text-3xl font-black text-[#10b981]">CALM</p>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#10b981] w-[88%] animate-pulse" />
                            </div>
                            <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase">
                                The bees are working normally. No signs of stress or queen issues found.
                            </p>
                        </div>
                    </div>

                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-5 h-5 text-[#064e3b]" />
                            <h4 className="text-lg font-black uppercase tracking-tight text-[#064e3b]">Health Check</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Queen Score</p>
                                    <p className="text-3xl font-black text-[#064e3b]">98%</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
                            </div>
                            <div className="p-4 bg-[#10b981]/10 border-2 border-[#10b981] flex items-center gap-3 uppercase font-black text-[9px] text-[#064e3b]">
                                <Zap className="w-4 h-4 text-[#10b981]" />
                                Good Sound Detected
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <div className="border-4 border-[#064e3b] p-8 bg-[#064e3b]/3 flex items-start gap-8">
                <div className="w-16 h-16 bg-[#064e3b] border-4 border-[#facc15] flex items-center justify-center shrink-0">
                    <Info className="w-8 h-8 text-[#facc15]" />
                </div>
                <div>
                    <h5 className="text-xl font-black uppercase tracking-tight text-[#064e3b] mb-2">Analysis Summary</h5>
                    <p className="text-xs font-bold text-[#064e3b]/70 uppercase leading-relaxed max-w-3xl">
                        Our smart analyzer listens to the hive sound to check for the queen and general mood. This replaces the need for open-box inspections and helps you keep the bees happy without disturbing them.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AcousticSpectralView;
