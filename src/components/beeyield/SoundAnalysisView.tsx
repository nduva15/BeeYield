import React from 'react';
import { cn } from '@/lib/utils';
import { Mic2, Upload, Square, AlertCircle, Activity, ShieldCheck, ArrowRight, Terminal, Zap, X, Radio, Waves, GaugeCircle } from 'lucide-react';
import { Dialog, DialogContent } from './lovable_ai/ui/dialog';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Label as UiLabel } from '@/components/ui/label';
import beeyieldService, { Hive } from '@/services/beeyieldService';
import { BeeYieldBadge, BeeYieldCard, BeeYieldEmptyState, BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldSectionHeader } from '@/components/beeyield/BeeYieldUI';

interface SoundAnalysisViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
    embedded?: boolean;
}

const WAVEFORM_BARS = [38, 52, 66, 82, 96, 84, 72, 58, 44, 62, 78, 94, 108, 92, 74, 56, 42, 60, 76, 90, 104, 86, 68, 50];

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({
    onTabChange,
    isOpen = true,
    onClose = () => {},
    embedded = false,
}) => {
    const [recording, setRecording] = React.useState(false);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState<null | { label: 'Healthy' | 'Warning'; confidence?: number }>(null);
    const [progress, setProgress] = React.useState(0);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await beeyieldService.getHives();
                if (!mounted) return;
                setHives(data || []);
                if (!selectedHiveId && (data || []).length > 0) {
                    setSelectedHiveId(data[0].id);
                }
            } catch {
                // Keep the workflow usable even if hive data is unavailable.
            }
        };

        load();

        return () => {
            mounted = false;
            try {
                mediaRecorderRef.current?.stop();
            } catch {
                // ignore
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const analyzeFile = React.useCallback(
        async (file: File) => {
            if (analyzing) return;

            setResult(null);
            setAnalyzing(true);
            setProgress(10);

            const tick = globalThis.setInterval(() => {
                setProgress((p) => (p >= 92 ? 92 : p + 4));
            }, 250);

            const toastId = toast.loading('Analyzing audio...');

            try {
                const resp = await beeyieldService.analyzeAcoustic(file, selectedHiveId || undefined);
                const verdict = String(resp?.prediction || resp?.verdict || resp?.label || '').toLowerCase();
                const confidence = typeof resp?.probability === 'number'
                    ? resp.probability
                    : typeof resp?.confidence === 'number'
                        ? resp.confidence
                        : undefined;

                setResult({
                    label: verdict.includes('healthy') || verdict.includes('normal') ? 'Healthy' : 'Warning',
                    confidence,
                });
                toast.success(resp?.message || 'Analysis complete', { id: toastId });
            } catch (error: any) {
                console.error(error);
                toast.error(error?.message || 'Analysis failed', { id: toastId });
            } finally {
                globalThis.clearInterval(tick);
                setProgress(100);
                setAnalyzing(false);
                globalThis.setTimeout(() => setProgress(0), 250);
            }
        },
        [analyzing, selectedHiveId]
    );

    const handleRecord = async () => {
        if (recording || analyzing) return;

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                toast.error('Recording is not supported in this browser.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                const ext = (recorder.mimeType || '').includes('ogg') ? 'ogg' : 'webm';
                const file = new File([blob], `beeyield-audio-${Date.now()}.${ext}`, { type: blob.type });
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
            }, 3000);
        } catch (error) {
            console.error(error);
            toast.error('Could not access the microphone.');
            setRecording(false);
        }
    };

    const selectedHiveCode = selectedHiveId
        ? hives.find((hive) => hive.id === selectedHiveId)?.hive_code || 'Assigned'
        : 'None';

    const statusTone = recording
        ? { label: 'Recording live', detail: 'Capturing a short three second hive sample.', badge: 'warning' as const }
        : analyzing
            ? { label: 'Analyzing signal', detail: 'Extracting spectral markers and confidence bands.', badge: 'warning' as const }
            : result?.label === 'Healthy'
                ? { label: 'Stable acoustic profile', detail: 'The latest sample landed in the healthy range.', badge: 'success' as const }
                : result?.label === 'Warning'
                    ? { label: 'Variance detected', detail: 'The sample shows abnormal sound patterns worth reviewing.', badge: 'error' as const }
                    : { label: 'Scanner standby', detail: 'Record or upload a sample to populate the workspace.', badge: 'default' as const };

    const metrics = [
        {
            label: 'Model state',
            value: recording ? 'Capturing' : analyzing ? 'Processing' : result?.label || 'Standby',
            icon: Radio,
            tone: result?.label === 'Warning' ? 'text-red-600' : 'text-foreground',
        },
        {
            label: 'Hive binding',
            value: selectedHiveCode,
            icon: Terminal,
            tone: 'text-foreground',
        },
        {
            label: 'Confidence',
            value: typeof result?.confidence === 'number' ? `${Math.round(result.confidence * 100)}%` : analyzing ? `${progress}%` : '--',
            icon: GaugeCircle,
            tone: result?.label === 'Healthy' ? 'text-[#1B9157]' : result?.label === 'Warning' ? 'text-red-600' : 'text-foreground',
        },
    ];

    const content = (
        <BeeYieldPageShell embedded={embedded}>
            <BeeYieldPageHeader
                icon={Zap}
                label="Sound analysis"
                title="Acoustic Audit"
                subtitle="Capture a short hive sample, review the waveform, and decide whether the colony needs a closer field check."
                onBack={onClose}
                actions={
                    <div className="flex items-center gap-2">
                        <BeeYieldBadge className="px-3 py-1.5 border-border/ bg-[#F4D03F]/5 text-[#8a6a00]">
                            Spectrum: 100-800Hz
                        </BeeYieldBadge>
                        {result?.label === 'Warning' && onTabChange && (
                            <button
                                type="button"
                                onClick={() => onTabChange('digital-audit')}
                                className={glass.btnSecondary}
                            >
                                Health check
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-4">
                    <BeeYieldSection className="p-5">
                        <BeeYieldSectionHeader
                            icon={Terminal}
                            title="Capture controls"
                            subtitle="Bind the sample and start a new pass"
                        />

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <UiLabel className={glass.microLabel}>Hive binding</UiLabel>
                                <select
                                    value={selectedHiveId}
                                    onChange={(e) => setSelectedHiveId(e.target.value)}
                                    className={cn(
                                        'w-full h-11 rounded-xl border border-border/ bg-muted/30 px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30',
                                        hives.length === 0 && 'opacity-60'
                                    )}
                                    aria-label="Select hive for analysis"
                                    title="Select hive for analysis"
                                >
                                    <option value="">No hive selected</option>
                                    {hives.map((hive) => (
                                        <option key={hive.id} value={hive.id}>
                                            {(hive.hive_code || hive.id).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Use a quiet three second sample near the hive entrance for the cleanest read.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <button
                                    onClick={handleRecord}
                                    disabled={recording || analyzing}
                                    className={cn(
                                        glass.btnPrimary,
                                        'h-11 rounded-xl justify-center text-sm',
                                        recording && 'bg-red-500 border-red-600 text-white hover:bg-red-500'
                                    )}
                                >
                                    {recording ? <Square className="w-4 h-4 fill-current" /> : <Mic2 className="w-4 h-4" />}
                                    {recording ? 'Recording live...' : 'Record sample'}
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    aria-label="Upload hive audio for analysis"
                                    title="Upload hive audio for analysis"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) analyzeFile(file);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={analyzing || recording}
                                    className={cn(glass.btnSecondary, 'h-11 rounded-xl justify-center text-sm')}
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload audio
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                {metrics.map((metric) => (
                                    <div key={metric.label} className="rounded-2xl border border-border/ bg-muted/20 p-4">
                                        <div className="flex items-center gap-2">
                                            <metric.icon className={cn('w-4 h-4 text-[#F4D03F]', metric.tone)} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">{metric.label}</span>
                                        </div>
                                        <p className={cn('mt-3 text-lg font-black tracking-tight', metric.tone)}>{metric.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BeeYieldSection>

                    <AnimatePresence>
                        {analyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                            >
                                <BeeYieldCard className="space-y-4">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Analysis pass</p>
                                            <p className="mt-1 text-sm font-bold text-foreground">Extracting spectrum markers</p>
                                        </div>
                                        <span className="text-2xl font-black tracking-tight text-[#8a6a00]">{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full border border-border/ bg-muted/30">
                                        <motion.div
                                            className="h-full rounded-full bg-[#F4D03F]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The UI progress is capped until the backend returns a final verdict.
                                    </p>
                                </BeeYieldCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {result && !analyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                            >
                                <BeeYieldCard
                                    className={cn(
                                        'space-y-4',
                                        result.label === 'Healthy' ? 'border-[#1B9157]/25 bg-[#1B9157]/5' : 'border-red-500/25 bg-red-500/5'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'flex h-11 w-11 items-center justify-center rounded-2xl border',
                                                    result.label === 'Healthy'
                                                        ? 'border-[#1B9157]/20 bg-[#1B9157]/10 text-[#1B9157]'
                                                        : 'border-red-500/20 bg-red-500/10 text-red-600'
                                                )}
                                            >
                                                {result.label === 'Healthy' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Latest verdict</p>
                                                <h3 className={cn('text-xl font-black tracking-tight', result.label === 'Healthy' ? 'text-[#1B9157]' : 'text-red-600')}>
                                                    {result.label}
                                                </h3>
                                            </div>
                                        </div>
                                        <BeeYieldBadge variant={result.label === 'Healthy' ? 'success' : 'error'}>
                                            {result.label === 'Healthy' ? 'Optimal' : 'Review'}
                                        </BeeYieldBadge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {result.label === 'Healthy'
                                            ? 'The acoustic signature stayed within the expected range for a stable colony.'
                                            : 'The sample deviated from the healthy baseline. Cross-check with a visual or field inspection.'}
                                        {typeof result.confidence === 'number' && (
                                            <span className="ml-2 font-bold text-foreground">
                                                Confidence {Math.round(result.confidence * 100)}%
                                            </span>
                                        )}
                                    </p>
                                </BeeYieldCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-8">
                    <BeeYieldSection className="overflow-hidden">
                        <div className="border-b border-border/ bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(249,247,242,0.98))] px-5 py-5 md:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-border/ bg-muted/ px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00]">
                                        <Waves className="h-3.5 w-3.5 text-primary" />
                                        Live waveform
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight text-foreground">{statusTone.label}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{statusTone.detail}</p>
                                    </div>
                                </div>
                                <BeeYieldBadge variant={statusTone.badge}>
                                    {recording ? 'Mic open' : analyzing ? 'Running pass' : 'Ready'}
                                </BeeYieldBadge>
                            </div>
                        </div>

                        <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden px-5 py-10 md:px-8">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                                style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                            />
                            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/60" />

                            <div className="relative z-10 flex h-[260px] w-full max-w-5xl items-end justify-center gap-2">
                                {WAVEFORM_BARS.map((height, index) => (
                                    <motion.div
                                        key={index}
                                        className={cn(
                                            'w-3 rounded-full border border-black/5 shadow-sm',
                                            recording ? 'bg-red-500' : analyzing ? 'bg-[#F4D03F]' : 'bg-[#d9d5c8]'
                                        )}
                                        animate={
                                            recording || analyzing
                                                ? {
                                                    height: [
                                                        Math.max(26, Math.round(height * 0.55)),
                                                        Math.min(220, height + 96 - ((index % 6) * 8)),
                                                        Math.max(36, Math.round(height * 0.78)),
                                                    ],
                                                }
                                                : { height }
                                        }
                                        transition={
                                            recording || analyzing
                                                ? { duration: 1.15, repeat: Infinity, repeatType: 'mirror', delay: (index % 8) * 0.05, ease: 'easeInOut' }
                                                : { duration: 0.35 }
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-0 border-t border-border/ bg-muted/20 md:grid-cols-3">
                            <div className="border-b border-border/ p-5 md:border-b-0 md:border-r">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Amplitude gain</p>
                                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">-14.2 dB</p>
                                <p className="mt-1 text-xs text-muted-foreground">Current front-end display reference.</p>
                            </div>
                            <div className="border-b border-border/ p-5 md:border-b-0 md:border-r">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Signal window</p>
                                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">3 sec</p>
                                <p className="mt-1 text-xs text-muted-foreground">One tap recording keeps capture length consistent.</p>
                            </div>
                            <div className="p-5">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Next action</p>
                                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                                    {result?.label === 'Warning' ? 'Field review' : 'Ready'}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {result?.label === 'Warning'
                                        ? 'Pair this result with a visual health check.'
                                        : 'Capture a sample whenever the hive tone changes.'}
                                </p>
                            </div>
                        </div>
                    </BeeYieldSection>

                    {!recording && !analyzing && !result && (
                        <div className="mt-6">
                            <BeeYieldEmptyState
                                icon={Activity}
                                title="Waveform waiting for a sample"
                                description="Start a recording or upload a file to fill this workspace with a live acoustic readout."
                            />
                        </div>
                    )}
                </div>
            </div>
        </BeeYieldPageShell>
    );

    if (embedded) {
        return content;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none custom-scroll overflow-x-hidden">
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-muted transition-all"
                    >
                        <X className="w-4 h-4 text-foreground" />
                    </button>
                    {content}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SoundAnalysisView;
