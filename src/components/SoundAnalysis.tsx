import { useCallback, useEffect, useRef, useState } from "react";
import {
  X, AudioWaveform, Mic, Square, Upload, Loader2, Sparkles, Save, Trash2,
  Activity, ShieldAlert, Radio, Crown, FileDown, Cpu, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { analyzeBlob, type AnalysisResult } from "@/lib/bee-sound";
import { MODEL_META } from "@/lib/bee-sound-model";
import { downloadReportPdf, safeName, type ReportSection } from "@/lib/report-pdf";
import { streamBeeGpt } from "@/lib/beegpt-stream";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { toast } from "sonner";
import { autoSyncRecord } from "@/lib/integration-sync";

type SavedAnalysis = {
  id: string;
  hive_label: string;
  recorded_at: string;
  duration_sec: number;
  health_state: string;
  health_confidence: number;
  piping_detected: boolean;
  piping_confidence: number;
  segments: number;
  disease_predictions: unknown;
  ai_insights: string | null;
  notes: string | null;
};

type Disease = { name: string; score: number; severity: string; rationale: string; acousticMarker: string };

function stateTone(s: string) {
  if (s === "Healthy") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (s === "Swarming") return "text-honey border-honey/30 bg-honey/10";
  if (s === "Queenless") return "text-orange-400 border-orange-500/30 bg-orange-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
}

function sevTone(s: string) {
  if (s === "high") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (s === "moderate") return "text-honey bg-honey/10 border-honey/30";
  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
}

function auditPdf(opts: {
  hive: string;
  when: string;
  state: string;
  confidence: number;
  segments: number;
  durationSec: number;
  piping: string;
  diseases: Disease[];
  notes?: string | null;
  ai?: string | null;
}) {
  const sections: ReportSection[] = [
    {
        type: "kv",
        heading: "Result",
        rows: [
          ["Hive", opts.hive],
          ["Recorded at", opts.when],
          ["Health state", opts.state],
          ["Confidence", `${(opts.confidence * 100).toFixed(1)}%`],
          ["Queen piping", opts.piping],
          ["Clip length", `${opts.durationSec.toFixed(1)} s`],
          ["Windows scored", String(opts.segments)],
        ],
      },
      ...(opts.diseases.length > 0
        ? [{
            type: "bars" as const,
            heading: "Disease risk ranking",
            rows: opts.diseases.map((d) => ({ label: `${d.name} (${d.severity})`, pct: d.score })),
          },
          {
            type: "list" as const,
            heading: "Acoustic evidence",
            items: opts.diseases.map((d) => `${d.name}: ${d.acousticMarker} — ${d.rationale}`),
          }]
        : []),
      {
        type: "kv",
        heading: "Model",
        rows: [
          ["Model", MODEL_META.name],
          ["Version", MODEL_META.version],
          ["Runs on", MODEL_META.runsOn],
          ["Signal pipeline", MODEL_META.pipeline],
          ["Classes", MODEL_META.classes.join(", ")],
        ],
      },
      { type: "text", heading: "How the confidence score is computed", body: MODEL_META.confidence.headline },
      { type: "list", heading: "Scoring steps", items: [...MODEL_META.confidence.steps] },
      { type: "list", heading: "Reading the score", items: [...MODEL_META.confidence.reading] },
      { type: "text", heading: "Limitations", body: `${MODEL_META.weights}\n\n${MODEL_META.confidence.caveat}` },
      ...(opts.notes ? [{ type: "text" as const, heading: "Notes", body: opts.notes }] : []),
    ...(opts.ai ? [{ type: "text" as const, heading: "AI interpretation", body: opts.ai }] : []),
  ];
  downloadReportPdf({
    kind: "acoustic audit",
    title: `Acoustic audit — ${opts.hive}`,
    subtitle: `Recorded ${opts.when} · ${opts.durationSec.toFixed(1)} s · ${opts.segments} scored window(s)`,
    badge: `${opts.state.toUpperCase()} · ${(opts.confidence * 100).toFixed(0)}%`,
    fileName: `beeyield-acoustic-${safeName(opts.hive)}-${safeName(opts.when)}.pdf`,
    sections,
  });
}

function ModelCard() {
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer text-xs font-semibold text-honey flex items-center gap-1.5">
        <Cpu className="w-3.5 h-3.5" /> Model card &amp; how the confidence score is computed
      </summary>
      <div className="mt-3 space-y-3 text-[11px] text-muted-foreground">
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            ["Model", MODEL_META.name],
            ["Version", MODEL_META.version],
            ["Runs on", MODEL_META.runsOn],
            ["Feature dimensions", `${MODEL_META.featureDim} MFCC + delta statistics`],
            ["States", MODEL_META.classes.join(" · ")],
            ["Noise gate", MODEL_META.gate],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background p-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{k}</p>
              <p className="text-foreground">{v}</p>
            </div>
          ))}
        </div>
        <p><span className="text-foreground font-medium">Signal pipeline: </span>{MODEL_META.pipeline}</p>
        <div>
          <p className="text-foreground font-medium mb-1">Training corpora</p>
          <ul className="space-y-1 list-disc list-inside">
            {MODEL_META.datasets.map((d) => (
              <li key={d.name}><span className="text-foreground">{d.name}</span> — {d.role} <span className="opacity-70">({d.source})</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-honey/25 bg-honey/5 p-3">
          <p className="text-foreground font-medium flex items-center gap-1.5 mb-1"><Info className="w-3.5 h-3.5 text-honey" /> Confidence</p>
          <p>{MODEL_META.confidence.headline}</p>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            {MODEL_META.confidence.steps.map((t) => <li key={t}>{t}</li>)}
          </ol>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {MODEL_META.confidence.reading.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <p className="opacity-80">{MODEL_META.weights}</p>
        <p className="text-honey">{MODEL_META.confidence.caveat}</p>
      </div>
    </details>
  );
}

export default function SoundAnalysis({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [hiveLabel, setHiveLabel] = useState("BY-H001");
  const [notes, setNotes] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("sound_analyses")
      .select("id,hive_label,recorded_at,duration_sec,health_state,health_confidence,piping_detected,piping_confidence,segments,disease_predictions,ai_insights,notes")
      .eq("device_id", deviceId)
      .order("recorded_at", { ascending: false })
      .limit(40);
    setHistory((data as SavedAnalysis[]) ?? []);
  }, [deviceId]);

  useEffect(() => { if (isOpen) void loadHistory(); }, [isOpen, loadHistory]);

  const stopEverything = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    rafRef.current = null;
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);
  useEffect(() => { if (!isOpen) stopEverything(); }, [isOpen, stopEverything]);

  const drawLive = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(buf);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const bars = 72;
      const step = Math.floor(buf.length / bars);
      for (let i = 0; i < bars; i++) {
        let v = 0;
        for (let j = i * step; j < (i + 1) * step; j++) v = Math.max(v, buf[j]);
        const bh = Math.max(2, (v / 255) * h * 0.92);
        const x = (i / bars) * w;
        ctx.fillStyle = `hsl(${42 - (v / 255) * 20} 95% ${45 + (v / 255) * 20}%)`;
        ctx.fillRect(x + 1, (h - bh) / 2, w / bars - 2, bh);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const drawStatic = useCallback((wave: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const peak = Math.max(...wave, 0.001);
    wave.forEach((v, i) => {
      const bh = Math.max(2, (v / peak) * h * 0.9);
      const x = (i / wave.length) * w;
      ctx.fillStyle = "hsl(42 95% 55% / 0.85)";
      ctx.fillRect(x, (h - bh) / 2, Math.max(1, w / wave.length - 1), bh);
    });
  }, []);

  useEffect(() => { if (result) drawStatic(result.waveform); }, [result, drawStatic]);

  const runAnalysis = async (blob: Blob) => {
    setAnalyzing(true);
    setAiText("");
    try {
      const res = await analyzeBlob(blob);
      setResult(res);
      toast.success(`Acoustic scan complete — ${res.health.state}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not decode this audio");
    } finally {
      setAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      drawLive(analyser);

      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        stopEverything();
        void runAnalysis(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const runAi = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiText("");
    const a = result.aggregate;
    const top = result.diseases.slice(0, 4).map((d) => `${d.name} ${(d.score * 100).toFixed(0)}%`).join(", ");
    const prompt = `Act as Beeyield's acoustic hive pathologist. Interpret this in-browser acoustic scan (BEE-SOUND-ANALYSIS DSP pipeline, 22.05 kHz, 2 s windows, 100 Hz–8 kHz bandpass).

Hive: ${hiveLabel}
Duration analysed: ${result.durationSec} s across ${result.segments.length} windows
Species match: ${result.species.name} (${(result.species.confidence * 100).toFixed(0)}%)
Health classification: ${result.health.state} (${(result.health.confidence * 100).toFixed(0)}%) via 128-mel MFCC corpus model over ${result.health.windowsAnalyzed} bee-gated 2s windows (bee presence ${(result.health.beeConfidence * 100).toFixed(0)}%)
Class probabilities: ${Object.entries(result.health.probabilities).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(", ")}
Queen piping: ${result.piping.detected ? `detected in ${result.piping.events} window(s), confidence ${(result.piping.confidence * 100).toFixed(0)}%` : "not detected"}
Spectral centroid: ${a.spectralCentroid.toFixed(0)} Hz · rolloff(85%): ${a.spectralRolloff.toFixed(0)} Hz
Zero-crossing rate: ${a.zcr.toFixed(4)} · RMS: ${a.rms.toFixed(4)} · flatness: ${a.spectralFlatness.toFixed(3)}
Dominant wingbeat frequency: ${a.dominantFreq.toFixed(0)} Hz
Band energy distribution: ${Object.entries(a.bandEnergy).map(([k, v]) => `${k}Hz ${(v * 100).toFixed(0)}%`).join(", ")}
Ranked acoustic disease indicators: ${top}
Beekeeper notes: ${notes || "none"}

Give: (1) a plain-language verdict, (2) the most likely disease/condition with reasoning tied to the acoustic markers above, (3) what to confirm with a physical inspection, (4) treatment and intervention plan for East African conditions, (5) re-scan schedule.`;
    try {
      await streamBeeGpt(prompt, setAiText);
    } catch {
      toast.error("AI interpretation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    const { data: saved, error } = await supabase.from("sound_analyses").insert({
      device_id: deviceId,
      hive_label: hiveLabel,
      duration_sec: result.durationSec,
      sample_rate: result.sampleRate,
      segments: result.segments.length,
      health_state: result.health.state,
      health_confidence: result.health.confidence,
      piping_detected: result.piping.detected,
      piping_confidence: result.piping.confidence,
      inference_mode: result.inferenceMode,
      features: {
        aggregate: result.aggregate,
        species: result.species,
        probabilities: result.health.probabilities,
        beeConfidence: result.health.beeConfidence,
        windowsAnalyzed: result.health.windowsAnalyzed,
        windowsRejected: result.health.windowsRejected,
        mfcc: result.segments[0]?.mfcc ?? [],
        spectrum: result.spectrum,
      },
      disease_predictions: result.diseases,
      ai_insights: aiText || null,
      notes: notes || null,
    }).select("id").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Scan archived");
    void autoSyncRecord({
      deviceId,
      kind: "acoustic",
      recordId: saved?.id ?? crypto.randomUUID(),
      hiveLabel: hiveLabel,
      title: `Acoustic audit — ${result.health.state} (${(result.health.confidence * 100).toFixed(0)}% confidence)`,
      summary: result.diseases.slice(0, 3).map((d) => `${d.name} ${(d.score * 100).toFixed(0)}%`).join("; "),
      status: result.health.state,
      occurredAt: new Date().toISOString().slice(0, 10),
      metrics: {
        durationSec: result.durationSec,
        windowsAnalyzed: result.health.windowsAnalyzed,
        beePresence: Number((result.health.beeConfidence * 100).toFixed(0)),
        pipingDetected: result.piping.detected,
        centroidHz: Math.round(result.aggregate.spectralCentroid),
        species: result.species.name,
      },
    });
    void loadHistory();
  };

  const remove = async (id: string) => {
    await supabase.from("sound_analyses").delete().eq("id", id);
    void loadHistory();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AudioWaveform className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Acoustic Audit</h1>
              <p className="text-xs text-muted-foreground">
                Bee-sound disease detection — BEE-SOUND-ANALYSIS pipeline running on-device
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Hive binding</span>
              <input value={hiveLabel} onChange={(e) => setHiveLabel(e.target.value)}
                className="block bg-background border border-border rounded-lg px-2 py-1.5 text-sm" />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] border ${recording ? "text-red-400 border-red-500/40 bg-red-500/10" : analyzing ? "text-honey border-honey/40 bg-honey/10" : "text-muted-foreground border-border"}`}>
                {recording ? `Recording ${elapsed}s` : analyzing ? "Analysing…" : result ? "Scan complete" : "Scanner standby"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 mb-4">
            <canvas ref={canvasRef} width={1100} height={140} className="w-full h-[140px]" />
          </div>

          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <button onClick={startRecording} disabled={analyzing}
                className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                <Mic className="w-3.5 h-3.5" /> Record sample
              </button>
            ) : (
              <button onClick={stopRecording}
                className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5" /> Stop & analyse
              </button>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={recording || analyzing}
              className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5 disabled:opacity-50">
              <Upload className="w-3.5 h-3.5" /> Upload audio
            </button>
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" aria-label="Upload hive audio"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void runAnalysis(f); e.target.value = ""; }} />
            {analyzing && <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running DSP chain…</span>}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Record 10–30 s at the hive entrance with the phone 10 cm from the flight board. Bandpass 100 Hz–8 kHz,
            2.0 s windows with 0.5 s overlap, queen piping matched in the 300–500 Hz band.
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-4 gap-3">
              <div className={`rounded-xl border p-4 ${stateTone(result.health.state)}`}>
                <span className="text-[11px] uppercase tracking-wide opacity-80 flex items-center gap-1"><Activity className="w-3 h-3" /> Health state</span>
                <p className="mt-1 font-display text-2xl font-bold">{result.health.state}</p>
                <p className="text-[11px] opacity-80">{(result.health.confidence * 100).toFixed(1)}% confidence</p>
                <p className="mt-1 text-[10px] opacity-70">
                  128-mel MFCC corpus model · {result.health.windowsAnalyzed} window(s) scored
                  {result.health.windowsRejected > 0 ? `, ${result.health.windowsRejected} rejected by bee gate` : ""} · bee
                  presence {(result.health.beeConfidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Crown className="w-3 h-3" /> Queen piping</span>
                <p className={`mt-1 font-display text-2xl font-bold ${result.piping.detected ? "text-honey" : "text-muted-foreground"}`}>
                  {result.piping.detected ? "Detected" : "None"}
                </p>
                <p className="text-[11px] text-muted-foreground">{result.piping.events} window(s) · {(result.piping.confidence * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Radio className="w-3 h-3" /> Wingbeat</span>
                <p className="mt-1 font-display text-2xl font-bold text-honey">{result.aggregate.dominantFreq.toFixed(0)} Hz</p>
                <p className="text-[11px] text-muted-foreground truncate">{result.species.name}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Sample</span>
                <p className="mt-1 font-display text-2xl font-bold text-honey">{result.durationSec}s</p>
                <p className="text-[11px] text-muted-foreground">{result.segments.length} windows @ {result.sampleRate} Hz</p>
              </div>
            </div>

            {/* Spectrum */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Spectral signature (loudest window)</p>
              <div className="flex items-end gap-[2px] h-24">
                {result.spectrum.map((s) => (
                  <div key={s.freq} title={`${s.freq} Hz`} style={{ height: `${Math.max(2, s.magnitude * 100)}%` }}
                    className="flex-1 rounded-t bg-honey/70" />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>100 Hz</span><span>2 kHz</span><span>4 kHz</span><span>8 kHz</span>
              </div>
            </div>

            {/* Feature table */}
            <div className="rounded-xl border border-border bg-card p-4 grid md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
              {[
                ["Spectral centroid", `${result.aggregate.spectralCentroid.toFixed(0)} Hz`],
                ["Spectral rolloff (85%)", `${result.aggregate.spectralRolloff.toFixed(0)} Hz`],
                ["Spectral flatness", result.aggregate.spectralFlatness.toFixed(3)],
                ["Zero-crossing rate", result.aggregate.zcr.toFixed(4)],
                ["RMS amplitude", result.aggregate.rms.toFixed(4)],
                ["Species confidence", `${(result.species.confidence * 100).toFixed(0)}%`],
              ].map(([k, v]) => (
                <p key={k as string} className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{k}</span><span className="text-foreground font-medium">{v}</span>
                </p>
              ))}
            </div>

            {/* Diseases */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-honey flex items-center gap-1.5 mb-3">
                <ShieldAlert className="w-4 h-4" /> Acoustic disease indicators
              </p>
              <div className="space-y-2">
                {result.diseases.map((d) => (
                  <div key={d.name} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{d.name}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase ${sevTone(d.severity)}`}>{d.severity}</span>
                      <span className="ml-auto text-xs text-honey font-semibold">{(d.score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-honey" style={{ width: `${d.score * 100}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">{d.rationale}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Marker — {d.acousticMarker}</p>
                  </div>
                ))}
              </div>
            </div>

            <label className="text-xs space-y-1 block">
              <span className="text-muted-foreground">Scan notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="Recorded 08:40, hive was inspected 3 days ago…"
                className="w-full bg-card border border-border rounded-lg px-2 py-1.5" />
            </label>

            <div className="flex flex-wrap gap-2">
              <button onClick={runAi} disabled={aiLoading}
                className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5 disabled:opacity-50">
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI pathology report
              </button>
              <button onClick={save} disabled={saving}
                className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Archive scan
              </button>
              <button
                onClick={() => auditPdf({
                  hive: hiveLabel || "Unlabelled hive",
                  when: new Date().toLocaleString(),
                  state: result.health.state,
                  confidence: result.health.confidence,
                  segments: result.health.windowsAnalyzed,
                  durationSec: result.durationSec,
                  piping: result.piping.detected
                    ? `Detected in ${result.piping.events} window(s) (${(result.piping.confidence * 100).toFixed(0)}%)`
                    : "Not detected",
                  diseases: result.diseases,
                  notes,
                  ai: aiText,
                })}
                className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5" /> Download PDF report
              </button>
            </div>

            <ModelCard />

            {aiText && (
              <div className="rounded-xl border border-honey/20 bg-card p-4">
                <MarkdownRenderer content={aiText} />
              </div>
            )}
          </div>
        )}

        {/* History */}
        <h2 className="font-display text-lg text-honey mb-2">Scan archive</h2>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">No archived scans yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => {
              const top = (Array.isArray(h.disease_predictions) ? (h.disease_predictions as Disease[])[0] : null);
              return (
                <div key={h.id} className="rounded-xl border border-border bg-card p-3 flex flex-wrap items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] ${stateTone(h.health_state)}`}>{h.health_state}</span>
                  <span className="font-semibold text-foreground">{h.hive_label}</span>
                  <span className="text-muted-foreground">{new Date(h.recorded_at).toLocaleString()}</span>
                  <span className="text-muted-foreground">{h.duration_sec}s · {h.segments} windows</span>
                  {h.piping_detected && <span className="text-honey">piping</span>}
                  {top && <span className="text-muted-foreground truncate max-w-[240px]">top risk: {top.name} {(top.score * 100).toFixed(0)}%</span>}
                  <button
                    onClick={() => auditPdf({
                      hive: h.hive_label,
                      when: new Date(h.recorded_at).toLocaleString(),
                      state: h.health_state,
                      confidence: h.health_confidence,
                      segments: h.segments,
                      durationSec: h.duration_sec,
                      piping: h.piping_detected
                        ? `Detected (${(h.piping_confidence * 100).toFixed(0)}%)`
                        : "Not detected",
                      diseases: Array.isArray(h.disease_predictions) ? (h.disease_predictions as Disease[]) : [],
                      notes: h.notes,
                      ai: h.ai_insights,
                    })}
                    className="ml-auto text-honey flex items-center gap-1" aria-label="Download PDF report">
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => remove(h.id)} aria-label="Delete scan" className="text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
