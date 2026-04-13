import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Upload, Square, AlertCircle, Activity, ShieldCheck, Terminal, Zap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Label as UiLabel } from '@/components/ui/label';
import { glass, PageHeader } from './GlassTheme';
import beeyieldService, { Hive } from '@/services/beeyieldService';

interface SoundAnalysisViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

type ResultLabel = 'Healthy' | 'Warning';
type BreakdownEntry = { segments: number; share: number };
type AcousticMetrics = {
    duration_seconds?: number;
    rms_db?: number;
    spectral_centroid_hz?: number;
    spectral_bandwidth_hz?: number;
    dominant_frequency_hz?: number;
    harmonic_ratio?: number;
    signal_strength?: number;
    signal_quality?: string;
};
type AcousticResult = {
    label: ResultLabel;
    verdict: string;
    confidence?: number;
    alertLevel: string;
    message: string;
    segmentsAnalyzed: number;
    pipingSegments: number;
    hissingDetected: boolean;
    persistenceWarning?: string | null;
    signalMetrics: AcousticMetrics;
    recommendedActions: string[];
    classificationBreakdown: Record<string, BreakdownEntry>;
};

const RECORDING_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm'] as const;

const pickRecordingMimeType = () => {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
    return RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

const getFileExtension = (mimeType: string) => (mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm');
const formatMetric = (value?: number, unit = '', digits = 1) =>
    typeof value === 'number' && !Number.isNaN(value) ? `${value.toFixed(digits)}${unit}` : '—';

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({ onTabChange: _onTabChange }) => {
    const [recording, setRecording] = React.useState(false);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState<AcousticResult | null>(null);
    const [progress, setProgress] = React.useState(0);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [selectedHiveId, setSelectedHiveId] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    const holdCompletedProgress = React.useCallback(
        () => new Promise<void>((resolve) => globalThis.setTimeout(resolve, 450)),
        []
    );

    React.useEffect(() => {
        let mounted = true;
        const loadHives = async () => {
            try {
                const data = await beeyieldService.getHives();
                if (!mounted) return;
                setHives(data || []);
                if (!selectedHiveId && (data || []).length > 0) setSelectedHiveId(data[0].id);
            } catch {
                // keep usable without hive binding
            }
        };
        loadHives();
        return () => {
            mounted = false;
            try {
                mediaRecorderRef.current?.stop();
            } catch {
                // ignore
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const analyzeFile = React.useCallback(
        async (file: File) => {
            if (analyzing) return;
            setResult(null);
            setAnalyzing(true);
            setProgress(6);
            const tick = globalThis.setInterval(() => {
                setProgress((current) => {
                    if (current >= 99) return 99;
                    if (current < 32) return current + 7;
                    if (current < 68) return current + 4;
                    if (current < 90) return current + 2;
                    return current + 1;
                });
            }, 240);
            const toastId = toast.loading('Analyzing hive audio...');
            let completed = false;
            try {
                const response = await beeyieldService.analyzeAcoustic(file, selectedHiveId || undefined);
                const verdict = String(response?.verdict || response?.prediction || response?.label || 'Unknown');
                const verdictLower = verdict.toLowerCase();
                const confidence =
                    typeof response?.confidence === 'number'
                        ? response.confidence
                        : typeof response?.probability === 'number'
                            ? response.probability
                            : undefined;
                setResult({
                    label: verdictLower.includes('healthy') || verdictLower.includes('normal') ? 'Healthy' : 'Warning',
                    verdict,
                    confidence,
                    alertLevel: String(response?.alert_level || 'NORMAL'),
                    message: String(response?.message || `Colony Status: ${verdict}`),
                    segmentsAnalyzed: Number(response?.segments_analyzed || 0),
                    pipingSegments: Number(response?.piping_segments || 0),
                    hissingDetected: Boolean(response?.hissing_detected),
                    persistenceWarning: response?.persistence_warning || null,
                    signalMetrics: response?.signal_metrics || {},
                    recommendedActions: Array.isArray(response?.recommended_actions) ? response.recommended_actions : [],
                    classificationBreakdown: response?.classification_breakdown || {},
                });
                completed = true;
                toast.success(response?.message || 'Analysis complete', { id: toastId });
                if (response?.persistence_warning) toast.warning(response.persistence_warning);
            } catch (error: any) {
                console.error(error);
                toast.error(error?.message || 'Analysis failed', { id: toastId });
            } finally {
                globalThis.clearInterval(tick);
                if (completed) {
                    setProgress(100);
                    await holdCompletedProgress();
                } else {
                    setProgress(0);
                }
                setAnalyzing(false);
            }
        },
        [analyzing, holdCompletedProgress, selectedHiveId]
    );

    const handleRecord = async () => {
        if (recording || analyzing) return;
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                toast.error('Recording not supported in this browser.');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mimeType = pickRecordingMimeType();
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) chunks.push(event.data);
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                const activeMimeType = recorder.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: activeMimeType });
                const file = new File([blob], `beeyield-audio-${Date.now()}.${getFileExtension(activeMimeType)}`, { type: activeMimeType });
                await analyzeFile(file);
            };
            setRecording(true);
            recorder.start();
            globalThis.setTimeout(() => {
                try {
                    recorder.stop();
                } catch {
                    // ignore
                } finally {
                    setRecording(false);
                }
            }, 5000);
        } catch (error) {
            console.error(error);
            toast.error('Could not access microphone.');
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            setRecording(false);
        }
    };

    const confidencePct = typeof result?.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : '—';
    const summaryTone = result?.label === 'Healthy' ? 'text-[#1B9157]' : 'text-red-500';

    return (
        <div className={glass.page}>
            <PageHeader
                title="Acoustic Audit"
                subtitle="Record or upload hive audio, then run a full acoustic health pass with signal-quality diagnostics."
                icon={Zap}
                color="text-[#F4D03F]"
                bg="bg-[#F4D03F]/10"
                borderColor="border-[#F4D03F]/20"
                action={<div className={cn(glass.badge, 'px-3 py-1.5 border-[#F4D03F]/10 bg-[#F4D03F]/5 text-[#F4D03F]')}>ANALYSIS WINDOW: 30S MAX</div>}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className={cn(glass.card, 'flex flex-col gap-6 border-white/20 bg-white/40 p-5 shadow-xl')}>
                        <div className="flex items-center gap-3 border-b border-[#F4D03F]/10 pb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F4D03F]/20 bg-[#F4D03F]/10">
                                <Terminal className="h-4 w-4 text-[#F4D03F]" />
                            </div>
                            <h3 className={glass.sectionTitle}>Audio sensor</h3>
                        </div>
                        <div className="space-y-2">
                            <UiLabel className={cn(glass.microLabel, 'opacity-60')}>Hive (optional)</UiLabel>
                            <select
                                value={selectedHiveId}
                                onChange={(event) => setSelectedHiveId(event.target.value)}
                                className={cn('h-10 w-full rounded-xl border border-white/30 bg-white/40 px-3 text-[10px] font-black text-[#1A1A1A] outline-none', hives.length === 0 && 'opacity-60')}
                                aria-label="Select hive for analysis"
                                title="Select hive for analysis"
                            >
                                <option value="">No hive selected</option>
                                {hives.map((hive) => (
                                    <option key={hive.id} value={hive.id}>{(hive.hive_code || hive.id).toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <p className={glass.microLabel}>Capture about 5 seconds near the brood chamber for the strongest result. Weak recordings still analyze, but accuracy drops.</p>
                            <div className="flex items-center gap-2 text-[8px] font-black text-gray-400">
                                <Activity className="h-3 w-3 text-[#F4D03F]/40" />
                                <span>Decode, segment, classify, and persist are now handled separately so the run finishes cleanly.</span>
                            </div>
                        </div>
                        <div className="mt-auto flex flex-col gap-3 border-t border-[#F4D03F]/10 pt-6">
                            <button onClick={handleRecord} disabled={recording || analyzing} className={cn(glass.btnPrimary, 'h-10 rounded-xl text-[10px] font-black transition-all duration-300', recording && 'scale-[0.98] border-red-600 bg-red-500 text-white shadow-red-500/20')}>
                                {recording ? <Square className="h-3 w-3 fill-current" /> : <Mic2 className="h-3 w-3 shrink-0" />}
                                {recording ? 'Recording sample...' : 'Start recording'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                aria-label="Upload hive audio for analysis"
                                title="Upload hive audio for analysis"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) analyzeFile(file);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            />
                            <button onClick={() => fileInputRef.current?.click()} disabled={analyzing || recording} className={cn(glass.btnSecondary, 'h-10 rounded-xl text-[10px] font-black')}>
                                <Upload className="h-3.5 w-3.5" />
                                <span>Upload audio</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {analyzing && (
                            <motion.div initial={{ opacity: 0, height: 0, scale: 0.96 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.96 }} className={cn(glass.card, 'overflow-hidden border-white/40 p-5 shadow-sm')}>
                                <div className="mb-3 flex items-end justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className={cn(glass.microLabel, 'animate-pulse')}>Processing signal...</span>
                                        <span className="text-[8px] font-black text-gray-400">Decode, segment, classify, persist</span>
                                    </div>
                                    <span className="text-xl font-black leading-none tabular-nums text-[#F4D03F]">{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/20 bg-white/30">
                                    <motion.div className="h-full rounded-full bg-[#F4D03F]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {result && !analyzing && (
                            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={cn(glass.card, 'relative flex flex-col gap-5 overflow-hidden p-5 backdrop-blur-xl', result.label === 'Healthy' ? 'border-[#1B9157]/20 bg-[#1B9157]/5 shadow-[#1B9157]/10' : 'border-red-500/30 bg-red-500/5 shadow-red-500/10')}>
                                <div className={cn('absolute inset-0 opacity-[0.03] blur-xl', result.label === 'Healthy' ? 'bg-[#1B9157]' : 'bg-red-500')} />
                                <div className="relative z-10 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg shadow-sm', result.label === 'Healthy' ? 'bg-[#1B9157]/10 text-[#1B9157]' : 'bg-red-500/10 text-red-500')}>
                                            {result.label === 'Healthy' ? <ShieldCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className={cn(glass.sectionTitle, 'text-xl uppercase tracking-tight', summaryTone)}>{result.verdict}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Alert {result.alertLevel}</p>
                                        </div>
                                    </div>
                                    <div className={cn(glass.badge, 'border-none bg-white/20', summaryTone)}>{confidencePct}</div>
                                </div>
                                <p className={cn(glass.microLabel, 'relative z-10 border-t border-[#F4D03F]/10 pt-4 text-gray-500')}>
                                    {result.message}
                                    {result.persistenceWarning ? <span className="mt-2 block text-[10px] font-black text-amber-600">{result.persistenceWarning}</span> : null}
                                </p>
                                <div className="relative z-10 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/30 bg-white/40 p-3"><p className={glass.microLabel}>Signal quality</p><p className="mt-1 text-lg font-black text-[#1A1A1A]">{String(result.signalMetrics.signal_quality || 'unknown').toUpperCase()}</p></div>
                                    <div className="rounded-2xl border border-white/30 bg-white/40 p-3"><p className={glass.microLabel}>Segments analyzed</p><p className="mt-1 text-lg font-black text-[#1A1A1A]">{result.segmentsAnalyzed || '—'}</p></div>
                                    <div className="rounded-2xl border border-white/30 bg-white/40 p-3"><p className={glass.microLabel}>Dominant frequency</p><p className="mt-1 text-lg font-black text-[#1A1A1A]">{formatMetric(result.signalMetrics.dominant_frequency_hz, ' Hz', 0)}</p></div>
                                    <div className="rounded-2xl border border-white/30 bg-white/40 p-3"><p className={glass.microLabel}>Energy floor</p><p className="mt-1 text-lg font-black text-[#1A1A1A]">{formatMetric(result.signalMetrics.rms_db, ' dB', 1)}</p></div>
                                </div>
                                {result.recommendedActions.length > 0 && (
                                    <div className="relative z-10 space-y-2 border-t border-[#F4D03F]/10 pt-4">
                                        <p className={cn(glass.microLabel, 'text-gray-500')}>Recommended actions</p>
                                        <div className="space-y-2">
                                            {result.recommendedActions.map((action) => (
                                                <div key={action} className="flex items-start gap-2 rounded-xl border border-white/25 bg-white/35 px-3 py-2">
                                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F4D03F]" />
                                                    <span className="text-[11px] font-semibold leading-relaxed text-[#1A1A1A]">{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={cn(glass.card, 'group flex flex-col overflow-hidden border-white/40 p-0 shadow-sm lg:col-span-7')}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 bg-white/20 p-5">
                        <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-[#F4D03F]" /><h3 className={glass.sectionTitle}>Spectral Wave</h3></div>
                        <div className={cn(glass.badge, 'border-[#F4D03F]/10 bg-[#F4D03F]/5 text-[#F4D03F]')}>Live Feed</div>
                    </div>
                    <div className="relative flex min-h-[350px] flex-1 flex-col items-center justify-center p-5">
                        <div className="pointer-events-none absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        <div className="relative z-10 flex h-64 w-full max-w-2xl items-center justify-center gap-1.5">
                            {[...Array(40)].map((_, index) => (
                                <motion.div
                                    key={index}
                                    className={cn('w-2 rounded-full border border-black/5 shadow-sm transition-colors duration-500', recording ? 'bg-red-500' : analyzing ? 'bg-[#F4D03F]' : 'bg-gray-200/40')}
                                    animate={recording || analyzing ? { height: [14, 180 - (index % 7) * 12, 22 + (index % 5) * 8] } : { height: 20 + Math.sin(index * 0.5) * 40 }}
                                    transition={recording || analyzing ? { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: (index % 10) * 0.04, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 border-t border-[#F4D03F]/10 bg-white/30 p-5 md:grid-cols-3">
                        <div className="space-y-1"><UiLabel className={glass.microLabel}>Signal lock</UiLabel><p className="text-xl font-black tracking-tighter text-[#1A1A1A]">{result ? `${Math.round((result.signalMetrics.signal_strength || 0) * 100)}%` : '94.8%'}</p></div>
                        <div className="space-y-1"><UiLabel className={glass.microLabel}>Piping watch</UiLabel><p className="text-xl font-black tracking-tighter text-[#1A1A1A]">{result ? `${result.pipingSegments} segment(s)` : 'Standby'}</p></div>
                        <div className="space-y-1"><UiLabel className={glass.microLabel}>Noise character</UiLabel><p className="text-xl font-black tracking-tighter text-[#1A1A1A]">{result?.hissingDetected ? 'Defensive hiss' : result ? 'Stable band' : 'Awaiting sample'}</p></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 border-t border-[#F4D03F]/10 bg-white/20 p-5 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/30 bg-white/40 p-4">
                            <p className={glass.sectionTitle}>Signal metrics</p>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] font-semibold text-[#1A1A1A]">
                                <div><p className={glass.microLabel}>Duration</p><p>{formatMetric(result?.signalMetrics.duration_seconds, 's', 1)}</p></div>
                                <div><p className={glass.microLabel}>Centroid</p><p>{formatMetric(result?.signalMetrics.spectral_centroid_hz, ' Hz', 0)}</p></div>
                                <div><p className={glass.microLabel}>Bandwidth</p><p>{formatMetric(result?.signalMetrics.spectral_bandwidth_hz, ' Hz', 0)}</p></div>
                                <div><p className={glass.microLabel}>Harmonic ratio</p><p>{formatMetric(result?.signalMetrics.harmonic_ratio, '', 2)}</p></div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/30 bg-white/40 p-4">
                            <p className={glass.sectionTitle}>Classification breakdown</p>
                            <div className="mt-3 space-y-3">
                                {result && Object.entries(result.classificationBreakdown).length > 0 ? Object.entries(result.classificationBreakdown).map(([state, stats]) => (
                                    <div key={state} className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-gray-500"><span>{state}</span><span>{Math.round(stats.share * 100)}%</span></div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-white/40"><div className={cn('h-full rounded-full', state.toLowerCase().includes('healthy') ? 'bg-[#1B9157]' : 'bg-[#F4D03F]')} style={{ width: `${Math.max(stats.share * 100, 6)}%` }} /></div>
                                    </div>
                                )) : <p className="text-[11px] font-semibold text-gray-500">Upload a hive recording to see state voting across segments.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoundAnalysisView;
