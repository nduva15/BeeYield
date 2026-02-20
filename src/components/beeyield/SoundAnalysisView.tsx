import React from 'react';
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
    const [recording, setRecording] = React.useState(false);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState<null | 'Healthy' | 'Warning'>(null);
    const [progress, setProgress] = React.useState(0);

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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div className="space-y-4">
                    <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                        Acoustic <span className="text-[#10b981]">Audit</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black uppercase text-[10px] tracking-[0.2em] mt-4">
                        Frequency variance and anomaly detection protocols.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 border-4 border-[#064e3b] bg-[#064e3b] text-white font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
                        SPECTRUM: 100-800HZ
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Control Panel */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="border-4 border-[#064e3b] p-10 bg-white space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <div className="flex items-center gap-4 mb-4">
                            <Terminal className="w-8 h-8 text-[#10b981]" />
                            <h3 className="text-4xl font-black uppercase tracking-tighter">Audio Node</h3>
                        </div>

                        <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-[0.2em] leading-relaxed">
                            CAPTURE ASSET ACOUSTICS FOR FREQUENCY ANALYSIS. MINIMUM 3.0S SAMPLE DURATION REQUIRED.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleRecord}
                                disabled={recording || analyzing}
                                className={cn(
                                    "h-20 w-full border-4 border-[#064e3b] font-black uppercase text-xs tracking-widest transition-none flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1",
                                    recording ? "bg-[#064e3b] text-white" : "bg-white text-[#064e3b] hover:bg-[#facc15]/10"
                                )}
                            >
                                {recording ? <Square className="fill-current text-[#facc15]" /> : <Mic2 className="w-6 h-6 text-[#10b981]" />}
                                {recording ? "RECORDING..." : "REC_START"}
                            </button>
                            <button className="h-14 w-full border-4 border-[#064e3b] bg-white text-[#064e3b] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#facc15]/10 transition-none flex items-center justify-center gap-3">
                                <Upload className="w-4 h-4" /> UPLOAD_DATA_STREAM
                            </button>
                        </div>
                    </div>

                    {/* Progress Monitor */}
                    {analyzing && (
                        <div className="border-4 border-[#064e3b] p-10 bg-white space-y-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">PROCESSING SIGNAL</span>
                                <span className="text-2xl font-black text-[#064e3b]">{progress}%</span>
                            </div>
                            <div className="h-8 border-4 border-[#064e3b] bg-neutral-50/50 p-1">
                                <div className="h-full bg-[#10b981] transition-none" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Results Tray */}
                    {result && !analyzing && (
                        <div className={cn(
                            "border-4 p-10 space-y-6 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]",
                            result === 'Healthy' ? "border-[#064e3b] bg-emerald-50/30" : "border-red-500 bg-red-500/5"
                        )}>
                            <div className="flex items-center gap-4">
                                {result === 'Healthy' ? <ShieldCheck className="w-8 h-8 text-[#10b981]" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
                                <h4 className="text-4xl font-black uppercase tracking-tighter">Status: {result}</h4>
                            </div>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/60 leading-relaxed tracking-[0.2em]">
                                {result === 'Healthy' ? "ACOUSTIC SIGNATURE OPTIMAL. NO ANOMALIES DETECTED IN SIGNAL." : "FREQUENCY VARIANCE DETECTED. IMMEDIATE FIELD AUDIT RECOMMENDED."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Waveform Visualization */}
                <div className="lg:col-span-7 border-4 border-[#064e3b] bg-white p-10 flex flex-col shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <Activity className="w-8 h-8 text-[#064e3b]" />
                            <h3 className="text-4xl font-black uppercase tracking-tighter">Spectral Wave</h3>
                        </div>
                        <div className="px-4 py-2 bg-[#064e3b] text-white border-2 border-[#10b981] text-[10px] font-black uppercase tracking-[0.2em]">LIVE_FEED</div>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-2 h-80 px-10">
                        {[...Array(40)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 border-2 border-[#064e3b] transition-none",
                                    recording ? "bg-[#10b981]" : (analyzing ? "bg-[#facc15]" : "bg-neutral-100")
                                )}
                                style={{
                                    height: `${Math.max(10, (recording || analyzing) ? Math.random() * 200 : 20 + Math.sin(i * 0.5) * 40)}px`
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-10 border-t-4 border-[#064e3b]/10 pt-8 grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">Amplitude</p>
                            <p className="text-4xl font-black text-[#064e3b] tracking-tighter">-14.2 DB</p>
                        </div>
                        <div className="space-y-2 text-right">
                            <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">Confidence</p>
                            <p className="text-4xl font-black text-[#10b981] tracking-tighter">94.8%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoundAnalysisView;
