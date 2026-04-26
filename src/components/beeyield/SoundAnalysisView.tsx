import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Volume2, Mic, Settings, AlertTriangle, CheckCircle, 
  Info, ArrowRight, Brain, Activity, Waves, Gauge, History, Zap, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';
import { cn } from '@/lib/utils';
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldCard, BeeYieldBadge } from './BeeYieldUI';

interface SoundAnalysisViewProps {
  onTabChange?: (tab: string) => void;
  embedded?: boolean;
  onClose?: () => void;
}

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({ onTabChange, embedded, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ label: string; confidence: number; note: string } | null>(null);
  const [history, setHistory] = useState<{ date: string; result: string; confidence: number }[]>([]);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(40).fill(0));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Mock history
    setHistory([
      { date: '2 hours ago', result: 'Healthy', confidence: 98 },
      { date: 'Yesterday', result: 'Agitated', confidence: 82 },
      { date: '2 days ago', result: 'Healthy', confidence: 95 },
    ]);

    // Initial visualizer pulse
    const interval = setInterval(() => {
      if (!isRecording) {
        setVisualizerData(prev => prev.map(() => Math.random() * 20 + 5));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      const duration = 5000; // 5 seconds recording

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(100, (elapsed / duration) * 100);
        setProgress(p);

        // Visualizer data
        setVisualizerData(new Array(40).fill(0).map(() => Math.random() * 80 + 20));

        if (p >= 100) {
          stopRecording();
        }
      }, 50);
    } else {
      setProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setResult(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const outcomes = [
        { label: 'Healthy', confidence: 96.4, note: 'Normal colony harmonics detected. Queen presence confirmed by consistency.' },
        { label: 'Agitated', confidence: 88.2, note: 'High frequency stress signals. Possible disturbance or lack of ventilation.' },
        { label: 'Warning', confidence: 91.5, note: 'Unusual acoustic signature. Potential swarm fever or late-stage queen cell activity.' },
      ];
      const selected = outcomes[Math.floor(Math.random() * outcomes.length)];
      setResult(selected);
      setHistory(prev => [{ date: 'Just now', result: selected.label, confidence: selected.confidence }, ...prev.slice(0, 4)]);
    }, 800);
  };

  return (
    <BeeYieldPageShell className={cn(embedded && 'p-0 md:p-0 -m-0 min-h-0 pb-0')}>
      <BeeYieldPageHeader
        icon={Volume2}
        label="Acoustic Intelligence"
        title="Sound Analysis"
        subtitle="Decode Hive Harmonics. Our AI models analyze acoustic patterns to detect stress, queen health, and swarm intent."
        onBack={onClose}
        actions={
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => onTabChange?.('acoustic-transformer')} 
                  className="px-3 py-1.5 rounded-xl border border-honey/30 bg-honey/5 text-honey text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-honey/10 transition-all"
                >
                  <Waves className="w-3.5 h-3.5" /> High Fidelity
                </button>
            </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <BeeYieldCard className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-honey/5 border-2 border-honey/20 ring-1 ring-honey/40">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #F4D03F 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div className="h-40 w-full flex items-center justify-center gap-1.5 mb-10 px-10">
              {visualizerData.map((v, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isRecording ? v : Math.max(5, v / 4) }}
                  className={cn(
                    "w-1.5 sm:w-2 rounded-full transition-colors duration-300",
                    isRecording ? "bg-honey shadow-[0_0_8px_rgba(244,208,63,0.4)]" : "bg-honey/30"
                  )}
                />
              ))}
            </div>

            <div className="relative z-10 space-y-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full bg-honey shadow-2xl shadow-honey/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                  <Mic className="w-10 h-10 text-white group-hover:animate-pulse" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-24 h-24 rounded-full bg-white border-4 border-honey/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 h-full bg-honey/10 transition-all" style={{ width: `${progress}%` }} />
                  <Square className="w-8 h-8 text-honey relative z-10 fill-honey" />
                </button>
              )}

              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  {isRecording ? "Harkening to the Hive..." : "Ready for Analysis"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {isRecording ? "Recording 5s acoustic sample for deep neural processing." : "Tap the microphone to start acoustic diagnosis."}
                </p>
              </div>
            </div>
          </BeeYieldCard>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className={cn(
                    "p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center gap-6 shadow-xl transition-all",
                    result.label === 'Healthy' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                )}>
                    <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 border-2",
                        result.label === 'Healthy' ? 'bg-emerald-100 border-emerald-300 text-emerald-600' : 'bg-amber-100 border-amber-300 text-amber-600'
                    )}>
                        {result.label === 'Healthy' ? <CheckCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h4 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{result.label} State</h4>
                            <BeeYieldBadge variant={result.label === 'Healthy' ? 'success' : 'warning'} className="px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                                {result.confidence}% Match
                            </BeeYieldBadge>
                        </div>
                        <p className="text-sm text-foreground font-bold tracking-tight opacity-80 leading-relaxed max-w-xl">
                            {result.note}
                        </p>
                    </div>
                    {onTabChange && (
                      <button
                        onClick={() => onTabChange(result.label === 'Healthy' ? 'reports-exports' : 'digital-audit')}
                        className="bg-white border-2 border-border/10 rounded-2xl p-4 hover:border-honey/60 transition-all text-left flex items-center gap-4 group active:scale-95"
                      >
                        <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center group-hover:bg-honey/20 transition-all">
                            {result.label === 'Healthy' ? <ShieldCheck className="w-5 h-5 text-honey" /> : <Zap className="w-5 h-5 text-honey" />}
                        </div>
                        <div className="min-w-[120px]">
                            <div className="font-black text-[11px] tracking-tight text-foreground uppercase">{result.label === 'Healthy' ? 'Summary' : 'Full Audit'}</div>
                            <div className="text-[10px] text-muted-foreground">Go to dashboard</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-honey group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <BeeYieldCard padded={false} className="overflow-hidden border-none shadow-none space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3 ml-2">
                <History className="w-4 h-4 text-honey" />
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Acoustic History</h3>
            </div>
            <div className="space-y-3">
                {history.map((h, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-border/60 hover:border-honey/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                h.result === 'Healthy' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-amber-50 border-amber-100 text-amber-500"
                            )}>
                                {h.result === 'Healthy' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-foreground uppercase tracking-tight">{h.result}</h4>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{h.date}</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-honey group-hover:scale-110 transition-transform">{h.confidence}%</div>
                    </div>
                ))}
            </div>
          </BeeYieldCard>

          <BeeYieldCard className="bg-honey p-6 border-none shadow-xl shadow-honey/10 group cursor-pointer overflow-hidden relative" onClick={() => onTabChange?.('health-guide')}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white tracking-tight">Expert Guide</h3>
                   <p className="text-white/80 text-xs font-bold leading-relaxed mt-1">Learn to identify hive sounds like a master beekeeper.</p>
                </div>
                <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest pt-2">
                    Review Patterns <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
          </BeeYieldCard>
        </div>
      </div>
    </BeeYieldPageShell>
  );
};

export default SoundAnalysisView;
