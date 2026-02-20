import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    Mic2,
    Upload,
    RefreshCw,
    Play,
    Square,
    CheckCircle2,
    AlertCircle,
    Activity,
    Database,
    ShieldCheck,
    Cpu,
    ArrowRight,
    Terminal,
    Hexagon,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface SoundAnalysisViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({ onTabChange }) => {
    const [recording, setRecording] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<null | 'Healthy' | 'Warning'>(null);
    const [progress, setProgress] = useState(0);

    const handleRecord = () => {
        setRecording(true);
        setTimeout(() => {
            setRecording(false);
            handleAnalyze();
        }, 3000);
    };

    const handleAnalyze = () => {
        setAnalyzing(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setResult(Math.random() > 0.3 ? 'Healthy' : 'Warning');
                    setAnalyzing(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-black antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-black pb-8">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.8]">
                        Sound <span className="text-[#FF4F00]">Monitor</span>
                    </h1>
                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mt-4">
                        Acoustic analysis for colony health.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 border-2 border-black bg-black text-white font-bold text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Range: 100-800Hz
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Control Panel */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="border-4 border-black p-10 bg-white space-y-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Terminal className="w-8 h-8 text-[#FF4F00]" />
                            <h3 className="text-4xl font-black uppercase tracking-tighter">Audio Input</h3>
                        </div>

                        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest leading-relaxed">
                            Record hive sound for analysis. Requires 3 seconds of audio.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleRecord}
                                disabled={recording || analyzing}
                                className={cn(
                                    "h-20 w-full border-4 border-black font-black uppercase text-xs tracking-widest transition-none flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1",
                                    recording ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                                )}
                            >
                                {recording ? <Square className="fill-current" /> : <Mic2 className="w-6 h-6" />}
                                {recording ? "RECORDING..." : "REC_START"}
                            </button>
                            <button className="h-14 w-full border-2 border-black bg-neutral-50 font-bold uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-none flex items-center justify-center gap-3">
                                <Upload className="w-4 h-4" /> UPLOAD_FILE
                            </button>
                        </div>
                    </div>

                    {/* Progress Monitor */}
                    {analyzing && (
                        <div className="border-4 border-black p-10 bg-white space-y-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Analysis</span>
                                <span className="text-2xl font-black">{progress}%</span>
                            </div>
                            <div className="h-8 border-4 border-black bg-neutral-50 p-1">
                                <div className="h-full bg-[#FF4F00] transition-none" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Results Tray */}
                    {result && !analyzing && (
                        <div className={cn(
                            "border-4 p-10 space-y-6",
                            result === 'Healthy' ? "border-black bg-neutral-50" : "border-[#FF4F00] bg-[#FF4F00]/5"
                        )}>
                            <div className="flex items-center gap-4">
                                {result === 'Healthy' ? <CheckCircle2 className="w-8 h-8 text-black" /> : <AlertCircle className="w-8 h-8 text-[#FF4F00]" />}
                                <h4 className="text-4xl font-black uppercase tracking-tighter">Status: {result}</h4>
                            </div>
                            <p className="text-[10px] font-bold uppercase text-neutral-500 leading-relaxed tracking-widest">
                                {result === 'Healthy' ? "Colony sounds optimal. No action required." : "Unusual sounds detected. Inspection recommended."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Waveform Visualization */}
                <div className="lg:col-span-7 border-4 border-black bg-white p-10 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <Activity className="w-8 h-8 text-black" />
                            <h3 className="text-4xl font-black uppercase tracking-tighter">Waveform</h3>
                        </div>
                        <div className="px-3 py-1 bg-black text-white border-2 border-black text-[10px] font-bold uppercase tracking-widest">Live Feed</div>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-2 h-80 px-10">
                        {[...Array(40)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 border-2 border-black transition-none",
                                    recording ? "bg-black" : (analyzing ? "bg-[#FF4F00]" : "bg-neutral-100")
                                )}
                                style={{
                                    height: `${Math.max(10, (recording || analyzing) ? Math.random() * 200 : 20 + Math.sin(i * 0.5) * 40)}px`
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-10 border-t-4 border-black pt-8 grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Amplitude</p>
                            <p className="text-4xl font-black text-black tracking-tighter">-14.2 DB</p>
                        </div>
                        <div className="space-y-2 text-right">
                            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Confidence</p>
                            <p className="text-4xl font-black text-black tracking-tighter">94.8%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoundAnalysisView;
