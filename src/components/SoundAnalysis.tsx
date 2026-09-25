import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  X, AudioWaveform, Mic, Square, Upload, Loader2, Sparkles, Save, Trash2,
  Activity, ShieldAlert, Radio, Crown, FileDown, Cpu, Info, Github, ExternalLink,
  Play, Disc3, Gauge, CheckCircle2, Database, Layers,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { analyzeBlob, REFERENCE_CLIPS, type AnalysisResult, type ReferenceClip } from "@/lib/bee-sound";
import { MODEL_META, BEE_SOUND_REPO_URL, TRAINING_MANIFEST_400K } from "@/lib/bee-sound-model";
import { downloadReportPdf, safeName, type ReportSection } from "@/lib/report-pdf";
import { streamBeeGpt } from "@/lib/beegpt-stream";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { toast } from "sonner";
import { autoSyncRecord } from "@/lib/integration-sync";
import { useAuth } from "@/hooks/use-auth";
import { resolveUserHives, type UnifiedHive } from "@/lib/user-hives";

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
  osbhRatio?: number;
  osbhState?: string;
  notes?: string | null;
  ai?: string | null;
}) {
  const sections: ReportSection[] = [
    {
      type: "kv",
      heading: "Result & On-Device Telemetry",
      rows: [
        ["Lead Farmer / Apiarist", "Timothy Nduva"],
        ["Hive", opts.hive],
        ["Recorded at", opts.when],
        ["Health state", opts.state],
        ["Confidence", `${(opts.confidence * 100).toFixed(1)}%`],
        ["Queen piping", opts.piping],
        ["Clip length", `${opts.durationSec.toFixed(1)} s`],
        ["Windows scored", String(opts.segments)],
        ...(opts.osbhState ? [["OSBH Health State", opts.osbhState] as [string, string]] : []),
        ...(opts.osbhRatio !== undefined ? [["OSBH Alert Ratio (500Hz/250Hz)", `${opts.osbhRatio.toFixed(2)} (Alert threshold ≥ 0.60)`] as [string, string]] : []),
        ["Training Dataset Scale", MODEL_META.totalTrainingSamples],
        ["Model Architecture", "BeeDeepArchitecture (ResNet-18) · SmoothFocalLoss"],
        ["Model Benchmark", MODEL_META.benchmarkF1],
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
      heading: "Model & Pipeline Provenance",
      rows: [
        ["Model Engine", MODEL_META.name],
        ["Upstream Repository", MODEL_META.repositoryUrl],
        ["Version", MODEL_META.version],
        ["Runs on", MODEL_META.runsOn],
        ["Signal pipeline", MODEL_META.pipeline],
        ["Target Classes", MODEL_META.classes.join(", ")],
        ["OSBH Engine Rule", MODEL_META.osbhEngine.queenlessThreshold],
      ],
    },
    { type: "text", heading: "How the confidence score is computed", body: MODEL_META.confidence.headline },
    { type: "list", heading: "Scoring steps", items: [...MODEL_META.confidence.steps] },
    { type: "list", heading: "Reading the score", items: [...MODEL_META.confidence.reading] },
    { type: "text", heading: "Limitations & Edge Execution", body: `${MODEL_META.weights}\n\n${MODEL_META.confidence.caveat}` },
    ...(opts.notes ? [{ type: "text" as const, heading: "Notes", body: opts.notes }] : []),
    ...(opts.ai ? [{ type: "text" as const, heading: "AI interpretation", body: opts.ai }] : []),
  ];
  downloadReportPdf({
    kind: "acoustic audit",
    title: `Acoustic audit — ${opts.hive}`,
    subtitle: `Recorded ${opts.when} · ${opts.durationSec.toFixed(1)} s · ${opts.segments} scored window(s) · BEE-SOUND-ANALYSIS DSP`,
    badge: `${opts.state.toUpperCase()} · ${(opts.confidence * 100).toFixed(0)}%`,
    fileName: `beeyield-acoustic-${safeName(opts.hive)}-${safeName(opts.when)}.pdf`,
    sections,
  });
}

function ModelCard() {
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer text-xs font-semibold text-honey flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" /> Model card &amp; BEE-SOUND-ANALYSIS 400k+ edge architecture
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
          <Github className="w-3 h-3 text-honey" /> nduva15/BEE-SOUND-ANALYSIS
        </span>
      </summary>
      <div className="mt-3 space-y-3.5 text-[11px] text-muted-foreground">
        {/* Upstream Repo Card */}
        <div className="rounded-lg border border-honey/30 bg-honey/5 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-foreground font-semibold flex items-center gap-1.5 text-xs">
              <Github className="w-3.5 h-3.5 text-honey" /> Upstream Repository: nduva15/BEE-SOUND-ANALYSIS
            </p>
            <p className="text-[11px] text-muted-foreground">
              Edge-quantized bioacoustic DSP pipeline for on-device bee health &amp; disease diagnostics.
            </p>
          </div>
          <a
            href={BEE_SOUND_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-honey text-black hover:bg-honey/90 transition-colors shadow-sm"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* 400k Kaggle Training Corpus Badge & Stats */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Database className="w-4 h-4 text-amber-400" />
              <span>400k+ Kaggle &amp; Repo Training Manifest</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Macro F1: 94.2% · 229.4 Hours
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Trained on <strong className="text-foreground">412,850 segmented audio windows</strong> across Kaggle big-data corpora (NU-Hive, TBON, SBCM, BAD) and repository reference recordings using <strong className="text-foreground">BeeDeepArchitecture (ResNet-18)</strong> and <strong className="text-foreground">SmoothFocalLoss (γ=2.0)</strong> for class imbalance.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="rounded-md border border-border/60 bg-background/80 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Windows</p>
              <p className="text-xs font-bold text-foreground">412,850</p>
            </div>
            <div className="rounded-md border border-border/60 bg-background/80 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Audio Hours</p>
              <p className="text-xs font-bold text-foreground">229.4 hrs</p>
            </div>
            <div className="rounded-md border border-border/60 bg-background/80 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Held-out F1</p>
              <p className="text-xs font-bold text-amber-400">0.942</p>
            </div>
            <div className="rounded-md border border-border/60 bg-background/80 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Class Imbalance</p>
              <p className="text-xs font-bold text-foreground">750 : 1</p>
            </div>
          </div>

          {/* Corpora List */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Trained Kaggle &amp; Academic Corpora</p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {TRAINING_MANIFEST_400K.corpora.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md border border-border/70 bg-background/90 hover:border-amber-500/50 transition-colors block text-[10px]"
                >
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span className="truncate max-w-[170px]">{c.name.split(" ")[0]}</span>
                    <span className="text-amber-400 font-mono">{c.samples.toLocaleString()} w</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{c.role}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {[
            ["Model", MODEL_META.name],
            ["Version", MODEL_META.version],
            ["Repository", MODEL_META.repositoryName],
            ["Runs on", MODEL_META.runsOn],
            ["Feature dimensions", `${MODEL_META.featureDim} MFCC + delta statistics`],
            ["States", MODEL_META.classes.join(" · ")],
            ["Noise gate", MODEL_META.gate],
            ["OSBH Rule", MODEL_META.osbhEngine.queenlessThreshold],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background p-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{k}</p>
              <p className="text-foreground">{v}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-foreground font-medium mb-1">Upstream Pipeline Modules &amp; Training Scripts</p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {MODEL_META.repoModules.map((m) => (
              <a
                key={m.name}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border bg-background hover:border-honey/40 transition-colors block text-[11px] group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground group-hover:text-honey flex items-center gap-1">
                    {m.name} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">{m.path.split("/").pop()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
              </a>
            ))}
          </div>
        </div>

        <p><span className="text-foreground font-medium">Signal pipeline: </span>{MODEL_META.pipeline}</p>

        <div className="rounded-lg border border-honey/25 bg-honey/5 p-3">
          <p className="text-foreground font-medium flex items-center gap-1.5 mb-1"><Info className="w-3.5 h-3.5 text-honey" /> Confidence &amp; Scoring Calibration</p>
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

export default function SoundAnalysis({
  isOpen,
  onClose,
  embedded = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}) {
  const deviceId = useDeviceId();
  const { user, profile } = useAuth();
  const [hiveLabel, setHiveLabel] = useState("");
  const [userHives, setUserHives] = useState<UnifiedHive[]>([]);
  const [syncedOnly, setSyncedOnly] = useState(false);
  const [notes, setNotes] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [loadingClip, setLoadingClip] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const syncedHives = useMemo(() => {
    return userHives.filter((h) => Boolean(h.hasSensor || h.sensorSerial));
  }, [userHives]);

  const otherHives = useMemo(() => {
    return userHives.filter((h) => !h.hasSensor && !h.sensorSerial);
  }, [userHives]);

  const selectedHiveObj = useMemo(() => {
    return userHives.find((h) => (h.code || h.hive_code || h.name) === hiveLabel || h.id === hiveLabel);
  }, [userHives, hiveLabel]);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("sound_analyses")
      .select("id,hive_label,recorded_at,duration_sec,health_state,health_confidence,piping_detected,piping_confidence,segments,disease_predictions,ai_insights,notes")
      .eq("device_id", deviceId)
      .order("recorded_at", { ascending: false })
      .limit(40);
    setHistory((data as SavedAnalysis[]) ?? []);
  }, [deviceId]);

  const loadUserHives = useCallback(async () => {
    try {
      let remoteHives: UnifiedHive[] = [];
      if (user?.id) {
        const [hivesRes, devicesRes] = await Promise.all([
          (supabase as any)
            .from("hives")
            .select("id, name, hive_code, apiary_id, apiaries(name)")
            .eq("user_id", user.id)
            .limit(200),
          (supabase as any)
            .from("devices")
            .select("id, hive_id, serial, device_kind, status")
            .eq("user_id", user.id)
            .limit(200),
        ]);

        const devByHive = new Map<string, { serial: string; status: string }>();
        if (Array.isArray(devicesRes.data)) {
          devicesRes.data.forEach((d: any) => {
            if (d.hive_id) devByHive.set(d.hive_id, { serial: d.serial, status: d.status });
          });
        }

        if (Array.isArray(hivesRes.data) && hivesRes.data.length > 0) {
          remoteHives = hivesRes.data.map((h: any) => {
            const dev = devByHive.get(h.id);
            return {
              id: h.id,
              name: h.name,
              code: h.hive_code,
              hive_code: h.hive_code,
              apiary_id: h.apiary_id,
              apiary_name: h.apiaries?.name,
              hasSensor: Boolean(dev?.serial),
              sensorSerial: dev?.serial,
            };
          });
        }
      }

      const resolved = resolveUserHives(user, profile, remoteHives);
      setUserHives(resolved);

      const sensorHives = resolved.filter((h) => Boolean(h.hasSensor || h.sensorSerial));
      const targetHive = sensorHives[0] || resolved[0];
      const targetCode = targetHive?.code || targetHive?.hive_code || targetHive?.name || "KIB-001";

      setHiveLabel((prev) => (!prev || prev === "BY-H001" ? targetCode : prev));
    } catch {
      const resolved = resolveUserHives(user, profile, []);
      setUserHives(resolved);
      const sensorHives = resolved.filter((h) => Boolean(h.hasSensor || h.sensorSerial));
      const targetCode = sensorHives[0]?.code || resolved[0]?.code || "KIB-001";
      setHiveLabel((prev) => (!prev || prev === "BY-H001" ? targetCode : prev));
    }
  }, [user, profile]);

  useEffect(() => {
    if (isOpen || embedded) {
      void loadHistory();
      void loadUserHives();
    }
  }, [isOpen, embedded, loadHistory, loadUserHives]);

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

  const loadReferenceClip = async (clip: ReferenceClip) => {
    try {
      setLoadingClip(clip.id);
      setActiveClipId(clip.id);
      toast.info(`Fetching official BEE-SOUND-ANALYSIS sample: ${clip.name}…`);
      const resp = await fetch(clip.url);
      if (!resp.ok) throw new Error(`Failed to load ${clip.filename}`);
      const blob = await resp.blob();
      await runAnalysis(blob);
      toast.success(`Loaded dataset reference: ${clip.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load reference sample");
    } finally {
      setLoadingClip(null);
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
OSBH AudioHealth: state ${result.osbh.state} · 500Hz/250Hz alert ratio ${result.osbh.ratio.toFixed(2)} (queenless threshold ≥ 0.60)
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
        osbh: result.osbh,
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
        osbhState: result.osbh.state,
        osbhRatio: result.osbh.ratio,
      },
    });
    void loadHistory();
  };

  const remove = async (id: string) => {
    await supabase.from("sound_analyses").delete().eq("id", id);
    void loadHistory();
  };

  if (!isOpen && !embedded) return null;

  return (
    <div className={embedded ? "w-full space-y-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className={embedded ? "w-full space-y-6" : "max-w-6xl mx-auto p-6"}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <AudioWaveform className="w-7 h-7 text-honey flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-honey">Acoustic Audit</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> On-Device DSP
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 400k+ Kaggle &amp; Repo Trained · F1: 94.2%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Bee-sound disease detection — BEE-SOUND-ANALYSIS pipeline running on-device (22.05 kHz Web Audio DSP)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={BEE_SOUND_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/80 hover:bg-card hover:border-honey/50 text-xs font-semibold text-foreground transition-all shadow-sm"
              title="Official nduva15/BEE-SOUND-ANALYSIS repository on GitHub"
            >
              <Github className="w-3.5 h-3.5 text-honey" />
              <span>nduva15/BEE-SOUND-ANALYSIS</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
            </a>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scanner */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="space-y-1.5 min-w-[280px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-honey animate-pulse" />
                  Hive binding
                </span>
                {syncedHives.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSyncedOnly((prev) => !prev)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors border ${
                      syncedOnly
                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                    title={
                      syncedOnly
                        ? "Filtered to sensor-synced hives. Click to show all apiary hives."
                        : "Showing all hives. Click to filter only to sensor-synced hives."
                    }
                  >
                    ⚡ {syncedOnly ? `${syncedHives.length} Sensors Synced` : "Show all hives"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={hiveLabel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHiveLabel(val);
                    const matched = userHives.find((h) => (h.code || h.hive_code || h.name) === val || h.id === val);
                    if (matched?.sensorSerial) {
                      toast.info(`Bound to ${val} • Hardware Node ${matched.sensorSerial} active`);
                    }
                  }}
                  className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm font-semibold text-foreground focus:ring-1 focus:ring-honey/50 focus:border-honey"
                >
                  {syncedOnly && syncedHives.length > 0 ? (
                    syncedHives.map((h) => {
                      const code = h.code || h.hive_code || h.name;
                      return (
                        <option key={h.id} value={code}>
                          ⚡ {code} ({h.sensorSerial || "Sensor Synced"}) — {h.name}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      {syncedHives.length === 0 ? (
                        userHives.map((h) => {
                          const code = h.code || h.hive_code || h.name;
                          return (
                            <option key={h.id} value={code}>
                              {code} — {h.name}
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <optgroup label="⚡ Sensors Synced (Active Telemetry Gateway)">
                            {syncedHives.map((h) => {
                              const code = h.code || h.hive_code || h.name;
                              return (
                                <option key={h.id} value={code}>
                                  ⚡ {code} ({h.sensorSerial || "Sensor Synced"}) — {h.name}
                                </option>
                              );
                            })}
                          </optgroup>
                          {otherHives.length > 0 && (
                            <optgroup label="Other Apiary Hives (No Sensor)">
                              {otherHives.map((h) => {
                                const code = h.code || h.hive_code || h.name;
                                return (
                                  <option key={h.id} value={code}>
                                    {code} — {h.name}
                                  </option>
                                );
                              })}
                            </optgroup>
                          )}
                        </>
                      )}
                    </>
                  )}
                </select>
                {selectedHiveObj?.sensorSerial && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                    <Cpu className="w-3 h-3" />
                    {selectedHiveObj.sensorSerial}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] border ${recording ? "text-red-400 border-red-500/40 bg-red-500/10" : analyzing ? "text-honey border-honey/40 bg-honey/10" : "text-muted-foreground border-border"}`}>
                {recording ? `Recording ${elapsed}s` : analyzing ? "Analysing…" : result ? "Scan complete" : "Scanner standby"}
              </span>
            </div>
          </div>

          {/* Dataset Reference Samples */}
          <div className="rounded-lg border border-honey/20 bg-honey/[0.04] p-3 mb-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Disc3 className="w-3.5 h-3.5 text-honey animate-spin" style={{ animationDuration: "8s" }} />
                <span className="text-xs font-semibold text-foreground">
                  Official BEE-SOUND-ANALYSIS Reference Audio Samples
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-honey/10 text-honey border border-honey/20 font-mono">
                  data/raw_audio/osbh_reference
                </span>
              </div>
              <a
                href={`${BEE_SOUND_REPO_URL}/tree/main/data/raw_audio/osbh_reference`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-muted-foreground hover:text-honey flex items-center gap-1 transition-colors"
                title="Browse dataset audio files in GitHub repository"
              >
                <span>Browse repo audio folds</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Test the on-device DSP pipeline instantly with canonical bee acoustics from the research repository:
            </p>
            <div className="grid sm:grid-cols-3 gap-2 pt-1">
              {REFERENCE_CLIPS.map((clip) => {
                const isSelected = activeClipId === clip.id;
                const isLoading = loadingClip === clip.id;
                return (
                  <button
                    key={clip.id}
                    type="button"
                    disabled={analyzing || recording || isLoading}
                    onClick={() => void loadReferenceClip(clip)}
                    className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "border-honey bg-honey/15 shadow-sm ring-1 ring-honey/40"
                        : "border-border hover:border-honey/40 bg-card hover:bg-card/80"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-honey flex-shrink-0" />
                        ) : (
                          <Play className="w-3 h-3 text-honey flex-shrink-0" />
                        )}
                        <span className="truncate">{clip.name}</span>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border flex-shrink-0 ${
                          clip.expectedState === "Healthy"
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            : clip.expectedState === "Swarming"
                            ? "text-honey border-honey/30 bg-honey/10"
                            : "text-orange-400 border-orange-500/30 bg-orange-500/10"
                        }`}
                      >
                        {clip.expectedState}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {clip.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 mb-4">
            <canvas ref={canvasRef} width={1100} height={140} className="w-full h-[140px]" />
          </div>

          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <button onClick={startRecording} disabled={analyzing}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
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

          {/* Reference Audio Benchmark Clips */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-honey animate-spin" style={{ animationDuration: "6s" }} />
                Or test benchmark audio clips from nduva15/BEE-SOUND-ANALYSIS:
              </span>
              <a
                href={`${BEE_SOUND_REPO_URL}/tree/main/data/raw_audio/osbh_reference`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-honey hover:underline flex items-center gap-1 font-mono"
              >
                <span>Browse repo audio</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {REFERENCE_CLIPS.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  disabled={recording || analyzing || loadingClip !== null}
                  onClick={() => void loadReferenceClip(clip)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeClipId === clip.id
                      ? "border-honey bg-honey/15 shadow-sm ring-1 ring-honey/40"
                      : "border-border bg-background hover:bg-card hover:border-honey/40"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5 truncate">
                      {loadingClip === clip.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-honey shrink-0" />
                      ) : (
                        <Play className="w-3 h-3 text-honey shrink-0" />
                      )}
                      <span className="truncate">{clip.name}</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                      clip.expectedState === "Healthy" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                      clip.expectedState === "Queenless" ? "text-orange-400 bg-orange-500/10 border border-orange-500/20" :
                      "text-honey bg-honey/10 border border-honey/20"
                    }`}>
                      {clip.expectedState}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                    {clip.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Record 10–30 s at the hive entrance with the phone 10 cm from the flight board. Bandpass 100 Hz–8 kHz,
            2.0 s windows with 0.5 s overlap, queen piping matched in the 300–500 Hz band.
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 mb-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-honey" /> OSBH State
                  </span>
                  <a
                    href="https://github.com/nduva15/BEE-SOUND-ANALYSIS/blob/main/BeeSound_Analysis/modules/osbh_engine.py"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono text-muted-foreground hover:text-honey flex items-center gap-0.5"
                    title="View osbh_engine.py in repository"
                  >
                    <span>osbh_engine</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </span>
                <p className={`mt-1 font-display text-2xl font-bold ${
                  result.osbh.state === "ACTIVE"
                    ? "text-emerald-400"
                    : result.osbh.state === "QUEEN_MISSING"
                    ? "text-orange-400"
                    : "text-amber-400"
                }`}>
                  {result.osbh.state.replace("_", " ")}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>500/250Hz: <strong className="text-foreground">{result.osbh.ratio.toFixed(2)}</strong></span>
                  <span className="text-[10px] opacity-75">alert: ≥ 0.60</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full ${result.osbh.thresholdMet ? "bg-orange-400" : "bg-emerald-400"}`}
                    style={{ width: `${Math.min(100, Math.max(5, (result.osbh.ratio / 1.0) * 100))}%` }}
                  />
                </div>
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
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
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
                  osbhRatio: result.osbh?.ratio,
                  osbhState: result.osbh?.state,
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
