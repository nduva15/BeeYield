import React from 'react';
import { Activity, Loader2, Mic, Play, ShieldCheck, Square, Upload, Waves as WaveformIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const waveformBars = [32, 58, 24, 76, 45, 64, 28, 84, 50, 68, 34, 60, 26, 72, 40, 56];

const AcousticWaveform: React.FC = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    setIsAnalyzing(true);

    try {
      const result = await beeyieldService.analyzeHiveAudio({ file, hiveId: undefined });
      setAnalysisResult(result);
      toast.success('Acoustic analysis complete.');
    } catch (error: any) {
      toast.error('Audio analysis failed.', { description: error.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confidence = Math.round((analysisResult?.confidence || 0) * 100);
  const statusLabel = analysisResult?.classification || 'Awaiting upload';
  const signalState = analysisResult?.alert_triggered ? 'Alert flagged' : analysisResult ? 'Signal stable' : 'No signal';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <WaveformIcon className="h-4 w-4 text-[#1B9157]" />
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#1A1A1A]">Spectral health profile</h3>
          </div>
          <p className="text-[11px] font-medium text-slate-500">A cleaner acoustic surface that matches the telemetry shell and keeps upload actions close to the chart.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1B9157]/15 bg-[#1B9157]/10 px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1B9157]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1B9157]">{signalState}</span>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#1A1A1A]/10 bg-[#1A1A1A] p-5 text-white shadow-[0_24px_70px_-35px_rgba(26,26,26,0.75)]">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#111111] via-[#163126] to-[#1A1A1A] p-5">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F4D03F_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Live spectral strip</p>
              <p className="mt-1 text-sm font-black text-white">{statusLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAudioUpload}
                className="hidden"
                accept="audio/*"
                aria-label="Upload audio for acoustic analysis"
                title="Upload audio for acoustic analysis"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload audio
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4D03F] text-[#1A1A1A] transition-all hover:scale-[1.03]"
                aria-label={isPlaying ? 'Stop playback preview' : 'Start playback preview'}
                title={isPlaying ? 'Stop playback preview' : 'Start playback preview'}
              >
                {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 fill-[#1A1A1A]" />}
              </button>
            </div>
          </div>

          <div className="relative mt-6 flex h-40 items-end gap-2 overflow-hidden rounded-[22px] border border-white/10 bg-black/15 px-4 pb-4 pt-6">
            {waveformBars.map((height, index) => (
              <motion.div
                key={`${height}-${index}`}
                className={cn(
                  'flex-1 rounded-full bg-gradient-to-t from-[#F4D03F] via-[#F7E08A] to-[#1B9157]',
                  isPlaying ? 'opacity-100' : 'opacity-75',
                )}
                initial={{ height: `${Math.max(12, height - 10)}%` }}
                animate={{ height: `${isPlaying ? height : Math.max(14, Math.round(height * 0.65))}%` }}
                transition={{ duration: 0.45, delay: index * 0.02, repeat: isPlaying ? Infinity : 0, repeatType: 'mirror' }}
              />
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent" />
          </div>

          <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Classification', value: statusLabel },
              { label: 'Confidence', value: analysisResult ? `${confidence}%` : 'Pending' },
              { label: 'Alert state', value: signalState },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">{item.label}</p>
                <p className="mt-1 text-sm font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#FFF9F0] px-4 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#1B9157]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Brood cluster density</p>
          </div>
          <p className="mt-2 text-base font-black text-[#1A1A1A]">{analysisResult?.brood_density || 'Awaiting acoustic read'}</p>
        </div>

        <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#FFF9F0] px-4 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#F4D03F]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Transformer insights</p>
          </div>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
            {analysisResult
              ? `State: ${analysisResult.classification}. ${analysisResult.alert_triggered ? 'Alert triggered for follow-up.' : 'No alert triggered.'}`
              : 'Upload audio to generate an acoustic assessment.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcousticWaveform;
