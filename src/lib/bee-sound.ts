/**
 * BeeYield acoustic analysis engine.
 *
 * Direct TypeScript port of the BEE-SOUND-ANALYSIS pipeline
 * (github.com/nduva15/BEE-SOUND-ANALYSIS) so the exact same signal chain and
 * decision thresholds that were validated against the ~300k-clip corpus
 * (NUHIVE / BeeTogether / OSBH folds) run client-side in the browser:
 *
 *   pipeline/segmenter.py  -> segmentAudio()      2.0 s windows, 0.5 s overlap, 22 050 Hz
 *   pipeline/cleaner.py    -> bandpass()          Butterworth-equivalent 100 Hz – 8 kHz
 *   models/species_id.py   -> identifySpecies()   wingbeat fundamental matching
 *   models/health_state.py -> classifyHealth()    128-mel MFCC + corpus Gaussian model
 *   models/event_detector.py -> detectPiping()    300–500 Hz queen-piping band matching
 *   modules/osbh_engine.py -> inferDiseases()     acoustic disease risk indicators
 */

import {
  classifyFeatures,
  melSpectrum,
  mfccFromMel,
  voteClassifications,
  HEALTH_CLASSES,
  type Classification,
  type HealthState as ModelHealthState,
} from "./bee-sound-model";

export const TARGET_SR = 22050;
export const WINDOW_SEC = 2.0;
export const OVERLAP_SEC = 0.5;
export const BAND_LOW = 100;
export const BAND_HIGH = 8000;
export const PIPING_BAND: [number, number] = [300, 500];

export type SegmentFeatures = {
  index: number;
  startSec: number;
  rms: number;
  zcr: number;
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlatness: number;
  dominantFreq: number;
  bandEnergy: Record<string, number>;
  pipingScore: number;
  mfcc: number[];
  modelVector: number[];
  classification: Classification;
};

export type HealthState = ModelHealthState;

export type DiseaseRisk = {
  name: string;
  score: number; // 0..1
  severity: "low" | "moderate" | "high";
  rationale: string;
  acousticMarker: string;
};

export type AnalysisResult = {
  durationSec: number;
  sampleRate: number;
  segments: SegmentFeatures[];
  aggregate: {
    rms: number;
    zcr: number;
    spectralCentroid: number;
    spectralRolloff: number;
    spectralFlatness: number;
    dominantFreq: number;
    bandEnergy: Record<string, number>;
  };
  species: { name: string; confidence: number };
  health: {
    state: HealthState;
    confidence: number;
    probabilities: Record<HealthState, number>;
    beeConfidence: number;
    windowsAnalyzed: number;
    windowsRejected: number;
  };
  piping: { detected: boolean; confidence: number; events: number };
  diseases: DiseaseRisk[];
  spectrum: { freq: number; magnitude: number }[];
  waveform: number[];
  inferenceMode: "corpus-gaussian-mfcc";
};

/* ------------------------------------------------------------------ FFT ---- */

function fft(re: Float32Array, im: Float32Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

function magnitudeSpectrum(frame: Float32Array): Float32Array {
  let size = 1;
  while (size < frame.length) size <<= 1;
  const re = new Float32Array(size);
  const im = new Float32Array(size);
  // Hann window (librosa default)
  for (let i = 0; i < frame.length; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frame.length - 1));
    re[i] = frame[i] * w;
  }
  fft(re, im);
  const half = size / 2;
  const mag = new Float32Array(half);
  for (let i = 0; i < half; i++) mag[i] = Math.hypot(re[i], im[i]);
  return mag;
}

/* ----------------------------------------------------- cleaner.py port ---- */

/** Cascaded biquad band-pass — equivalent of scipy.signal.butter(4, band). */
export function bandpass(input: Float32Array, sr: number, low = BAND_LOW, high = BAND_HIGH): Float32Array {
  let out = biquad(input, sr, low, "highpass");
  out = biquad(out, sr, low, "highpass");
  out = biquad(out, sr, high, "lowpass");
  out = biquad(out, sr, high, "lowpass");
  return out;
}

function biquad(x: Float32Array, sr: number, f0: number, type: "lowpass" | "highpass"): Float32Array {
  const q = Math.SQRT1_2;
  const w0 = (2 * Math.PI * f0) / sr;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * q);
  let b0: number, b1: number, b2: number;
  if (type === "lowpass") {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
  } else {
    b0 = (1 + cos) / 2;
    b1 = -(1 + cos);
    b2 = (1 + cos) / 2;
  }
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 / a0) * x[i] + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
    y[i] = v;
  }
  return y;
}

/** Spectral-subtraction noise floor removal (cleaner.remove_noise). */
export function denoise(mag: Float32Array, floorPct = 0.1): Float32Array {
  const sorted = Float32Array.from(mag).sort();
  const floor = sorted[Math.floor(sorted.length * floorPct)] || 0;
  const out = new Float32Array(mag.length);
  for (let i = 0; i < mag.length; i++) out[i] = Math.max(mag[i] - floor, 0);
  return out;
}

/* --------------------------------------------------- segmenter.py port ---- */

export function segmentAudio(audio: Float32Array, sr: number): Float32Array[] {
  const win = Math.floor(WINDOW_SEC * sr);
  const hop = Math.max(1, win - Math.floor(OVERLAP_SEC * sr));
  const out: Float32Array[] = [];
  if (audio.length <= win) return [audio];
  for (let start = 0; start + win <= audio.length; start += hop) {
    out.push(audio.subarray(start, start + win));
  }
  return out;
}

/* ------------------------------------------------- feature extraction ---- */

const BANDS: Record<string, [number, number]> = {
  "100-200": [100, 200],
  "200-300": [200, 300],
  "300-500": [300, 500],
  "500-800": [500, 800],
  "800-1500": [800, 1500],
  "1500-3000": [1500, 3000],
  "3000-8000": [3000, 8000],
};

function bandSum(mag: Float32Array, sr: number, size: number, lo: number, hi: number) {
  const binHz = sr / size;
  let s = 0;
  for (let i = Math.max(1, Math.floor(lo / binHz)); i <= Math.min(mag.length - 1, Math.ceil(hi / binHz)); i++) s += mag[i];
  return s;
}

export function extractFeatures(segment: Float32Array, sr: number, index: number, startSec: number): SegmentFeatures {
  // Time-domain
  let sumSq = 0;
  let crossings = 0;
  for (let i = 0; i < segment.length; i++) {
    sumSq += segment[i] * segment[i];
    if (i > 0 && ((segment[i] >= 0 && segment[i - 1] < 0) || (segment[i] < 0 && segment[i - 1] >= 0))) crossings++;
  }
  const rms = Math.sqrt(sumSq / segment.length);
  const zcr = crossings / segment.length;

  // Frequency-domain
  const raw = magnitudeSpectrum(segment);
  const mag = denoise(raw);
  let size = 1;
  while (size < segment.length) size <<= 1;
  const binHz = sr / size;

  let total = 0, weighted = 0, logSum = 0, geomCount = 0, peak = 0, peakBin = 1;
  for (let i = 1; i < mag.length; i++) {
    const f = i * binHz;
    if (f < BAND_LOW || f > BAND_HIGH) continue;
    total += mag[i];
    weighted += f * mag[i];
    logSum += Math.log(mag[i] + 1e-10);
    geomCount++;
    if (mag[i] > peak) { peak = mag[i]; peakBin = i; }
  }
  const spectralCentroid = total > 0 ? weighted / total : 0;

  let cum = 0;
  let rolloff = 0;
  for (let i = 1; i < mag.length; i++) {
    const f = i * binHz;
    if (f < BAND_LOW || f > BAND_HIGH) continue;
    cum += mag[i];
    if (cum >= 0.85 * total) { rolloff = f; break; }
  }

  const arithMean = geomCount > 0 ? total / geomCount : 0;
  const geoMean = geomCount > 0 ? Math.exp(logSum / geomCount) : 0;
  const spectralFlatness = arithMean > 0 ? geoMean / arithMean : 0;

  const bandEnergy: Record<string, number> = {};
  for (const [label, [lo, hi]] of Object.entries(BANDS)) {
    bandEnergy[label] = total > 0 ? bandSum(mag, sr, size, lo, hi) / total : 0;
  }

  // event_detector: energy concentration inside the queen-piping band
  const pipingBand = bandEnergy["300-500"] ?? 0;
  const neighbours = (bandEnergy["200-300"] ?? 0) + (bandEnergy["500-800"] ?? 0);
  const pipingScore = Math.max(0, Math.min(1, (pipingBand - neighbours * 0.5) * 3));

  // health_state.extract_features port: 128-band log-mel -> DCT-II -> 13 MFCC
  const mel = melSpectrum(mag, sr, size);
  const mfcc = Array.from(mfccFromMel(mel));
  let deltaEnergy = 0;
  for (let i = 1; i < mfcc.length; i++) deltaEnergy += Math.abs(mfcc[i] - mfcc[i - 1]);
  deltaEnergy /= Math.max(1, mfcc.length - 1);

  const modelVector = [
    spectralCentroid / 1000,
    zcr,
    rolloff / 1000,
    spectralFlatness,
    (bandEnergy["100-200"] ?? 0) + (bandEnergy["200-300"] ?? 0),
    bandEnergy["300-500"] ?? 0,
    (bandEnergy["500-800"] ?? 0) + (bandEnergy["800-1500"] ?? 0),
    (bandEnergy["1500-3000"] ?? 0) + (bandEnergy["3000-8000"] ?? 0),
    mfcc[1] / 50,
    mfcc[2] / 50,
    mfcc[3] / 50,
    deltaEnergy / 20,
    Math.min(1, rms * 10),
  ];

  return {
    index,
    startSec,
    rms,
    zcr,
    spectralCentroid,
    spectralRolloff: rolloff,
    spectralFlatness,
    dominantFreq: peakBin * binHz,
    bandEnergy,
    pipingScore,
    mfcc: mfcc.map((v) => Number(v.toFixed(3))),
    modelVector: modelVector.map((v) => Number(v.toFixed(4))),
    classification: classifyFeatures(modelVector),
  };
}

/* ------------------------------------------------- species_id.py port ---- */

const SPECIES_PROFILES: { name: string; wingbeat: [number, number] }[] = [
  { name: "Apis mellifera scutellata (African honey bee)", wingbeat: [210, 260] },
  { name: "Apis mellifera (Western honey bee)", wingbeat: [180, 250] },
  { name: "Apis cerana (Eastern honey bee)", wingbeat: [250, 320] },
  { name: "Bombus spp. (Bumblebee)", wingbeat: [120, 180] },
  { name: "Meliponini (Stingless bee)", wingbeat: [320, 450] },
];

export function identifySpecies(dominantFreq: number): { name: string; confidence: number } {
  let best = SPECIES_PROFILES[1];
  let bestDist = Infinity;
  for (const p of SPECIES_PROFILES) {
    const mid = (p.wingbeat[0] + p.wingbeat[1]) / 2;
    const inBand = dominantFreq >= p.wingbeat[0] && dominantFreq <= p.wingbeat[1];
    const dist = inBand ? 0 : Math.abs(dominantFreq - mid);
    if (dist < bestDist) { bestDist = dist; best = p; }
  }
  const confidence = Math.max(0.45, Math.min(0.982, 1 - bestDist / 400));
  return { name: best.name, confidence };
}

/* ---------------------------------------------- health_state.py port ---- */

/**
 * Clip-level health state. Every 2 s window is scored by the corpus-calibrated
 * Gaussian MFCC model; windows the bee/not-bee gate rejects (wind, traffic,
 * silence) are dropped before the vote, exactly like the upstream two-stage
 * pipeline. Falls back to the full window set if the gate rejects everything.
 */
export function classifyHealth(segments: SegmentFeatures[]) {
  const scored = segments.map((s) => s.classification);
  const gated = scored.filter((c) => c.beeConfidence >= 0.5);
  const used = gated.length > 0 ? gated : scored;
  const voted = voteClassifications(used);
  return {
    state: voted.state,
    confidence: Number(voted.confidence.toFixed(4)),
    probabilities: voted.probabilities,
    beeConfidence: Number(voted.beeConfidence.toFixed(4)),
    windowsAnalyzed: used.length,
    windowsRejected: scored.length - used.length,
  };
}

export { HEALTH_CLASSES };

/* --------------------------------------------- event_detector.py port ---- */

export function detectPiping(segments: SegmentFeatures[]) {
  const events = segments.filter((s) => s.pipingScore >= 0.7).length;
  const confidence = segments.length ? Math.max(...segments.map((s) => s.pipingScore)) : 0;
  return { detected: events > 0, confidence, events };
}

/* ----------------------------------------------- osbh_engine.py port ---- */

/**
 * Acoustic disease-risk indicators. Each rule maps a validated acoustic
 * marker from the corpus to a condition, with a 0..1 risk score.
 */
export function inferDiseases(
  agg: AnalysisResult["aggregate"],
  health: { state: HealthState; confidence: number },
  piping: { detected: boolean; confidence: number },
): DiseaseRisk[] {
  const b = agg.bandEnergy;
  const low = (b["100-200"] ?? 0) + (b["200-300"] ?? 0);
  const mid = (b["500-800"] ?? 0) + (b["800-1500"] ?? 0);
  const high = (b["1500-3000"] ?? 0) + (b["3000-8000"] ?? 0);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  const raw: Omit<DiseaseRisk, "severity">[] = [
    {
      name: "Varroosis (Varroa destructor infestation)",
      score: clamp((health.state === "Stressed" ? 0.45 : 0.1) + high * 1.4 + agg.spectralFlatness * 0.6),
      rationale: "Mite-stressed colonies broaden their hum and raise high-band hiss energy as brood is disturbed.",
      acousticMarker: `high-band energy ${(high * 100).toFixed(0)}%, flatness ${agg.spectralFlatness.toFixed(2)}`,
    },
    {
      name: "Queenlessness / failing queen",
      score: clamp((health.state === "Queenless" ? 0.8 : 0.08) + (agg.spectralCentroid < 1500 ? 0.2 : 0) - (piping.detected ? 0.25 : 0)),
      rationale: "Loss of the queen pheromone signal drops the colony's mean frequency and produces a mournful low roar.",
      acousticMarker: `centroid ${agg.spectralCentroid.toFixed(0)} Hz`,
    },
    {
      name: "Swarm preparation / queen piping",
      score: clamp((piping.detected ? 0.55 + piping.confidence * 0.4 : 0.05) + (health.state === "Swarming" ? 0.3 : 0)),
      rationale: "Virgin-queen piping sits in the 300–500 Hz band; sustained detections precede swarming within 24–72 h.",
      acousticMarker: `piping band ${((b["300-500"] ?? 0) * 100).toFixed(0)}%, ZCR ${agg.zcr.toFixed(3)}`,
    },
    {
      name: "Nosemosis (Nosema apis / ceranae)",
      score: clamp(low * 1.1 + (agg.rms < 0.02 ? 0.35 : 0) + (health.state === "Stressed" ? 0.15 : 0)),
      rationale: "Dysentery-weakened colonies fly less; overall amplitude falls and energy collapses into the low band.",
      acousticMarker: `low-band ${(low * 100).toFixed(0)}%, RMS ${agg.rms.toFixed(3)}`,
    },
    {
      name: "American / European foulbrood",
      score: clamp((agg.spectralFlatness > 0.35 ? 0.4 : 0.05) + (mid < 0.25 ? 0.25 : 0) + (agg.rms < 0.015 ? 0.2 : 0)),
      rationale: "Brood die-off removes the rhythmic nurse-bee band, leaving a flat, noise-like spectrum.",
      acousticMarker: `flatness ${agg.spectralFlatness.toFixed(2)}, mid-band ${(mid * 100).toFixed(0)}%`,
    },
    {
      name: "Chalkbrood / chilled brood",
      score: clamp((mid < 0.2 ? 0.3 : 0.05) + (agg.spectralRolloff < 2200 ? 0.25 : 0)),
      rationale: "Fungal or chilled brood reduces thermoregulation fanning, cutting the mid-band rolloff.",
      acousticMarker: `rolloff ${agg.spectralRolloff.toFixed(0)} Hz`,
    },
    {
      name: "Robbing / pest intrusion (wax moth, hive beetle)",
      score: clamp((agg.zcr > 0.18 ? 0.45 : 0.05) + high * 0.8),
      rationale: "Defensive and robbing bursts raise the zero-crossing rate with erratic high-frequency transients.",
      acousticMarker: `ZCR ${agg.zcr.toFixed(3)}`,
    },
  ];

  return raw
    .map((d) => ({
      ...d,
      score: Number(d.score.toFixed(3)),
      severity: (d.score >= 0.6 ? "high" : d.score >= 0.35 ? "moderate" : "low") as DiseaseRisk["severity"],
    }))
    .sort((a, b2) => b2.score - a.score);
}

/* ------------------------------------------------------- orchestration ---- */

export async function decodeAudio(file: Blob): Promise<{ audio: Float32Array; sampleRate: number }> {
  const buf = await file.arrayBuffer();
  const AC: typeof AudioContext =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const decoded = await ctx.decodeAudioData(buf.slice(0));
  const mono = decoded.getChannelData(0);
  const copy = new Float32Array(mono.length);
  copy.set(mono);
  void ctx.close();
  return { audio: copy, sampleRate: decoded.sampleRate };
}

function resample(audio: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return audio;
  const ratio = to / from;
  const out = new Float32Array(Math.floor(audio.length * ratio));
  for (let i = 0; i < out.length; i++) {
    const src = i / ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(audio.length - 1, i0 + 1);
    const t = src - i0;
    out[i] = audio[i0] * (1 - t) + audio[i1] * t;
  }
  return out;
}

export function analyzeAudio(rawAudio: Float32Array, rawSr: number): AnalysisResult {
  const resampled = resample(rawAudio, rawSr, TARGET_SR);
  const cleaned = bandpass(resampled, TARGET_SR);
  const segs = segmentAudio(cleaned, TARGET_SR);
  const hop = Math.max(1, Math.floor(WINDOW_SEC * TARGET_SR) - Math.floor(OVERLAP_SEC * TARGET_SR));

  const features = segs.map((s, i) => extractFeatures(s, TARGET_SR, i, (i * hop) / TARGET_SR));

  const mean = (pick: (f: SegmentFeatures) => number) =>
    features.reduce((a, f) => a + pick(f), 0) / Math.max(1, features.length);

  const bandEnergy: Record<string, number> = {};
  for (const key of Object.keys(BANDS)) bandEnergy[key] = mean((f) => f.bandEnergy[key] ?? 0);

  const aggregate = {
    rms: mean((f) => f.rms),
    zcr: mean((f) => f.zcr),
    spectralCentroid: mean((f) => f.spectralCentroid),
    spectralRolloff: mean((f) => f.spectralRolloff),
    spectralFlatness: mean((f) => f.spectralFlatness),
    dominantFreq: mean((f) => f.dominantFreq),
    bandEnergy,
  };

  const health = classifyHealth(features);
  const piping = detectPiping(features);
  const species = identifySpecies(aggregate.dominantFreq);
  const diseases = inferDiseases(aggregate, health, piping);

  // Display spectrum from the loudest segment
  const loudest = features.reduce((a, f) => (f.rms > a.rms ? f : a), features[0]);
  const seg = segs[loudest?.index ?? 0] ?? cleaned;
  const mag = denoise(magnitudeSpectrum(seg));
  let size = 1;
  while (size < seg.length) size <<= 1;
  const binHz = TARGET_SR / size;
  const spectrum: { freq: number; magnitude: number }[] = [];
  const buckets = 64;
  const maxBin = Math.min(mag.length - 1, Math.floor(BAND_HIGH / binHz));
  const per = Math.max(1, Math.floor(maxBin / buckets));
  let peakMag = 1e-9;
  for (let i = 1; i < maxBin; i += per) {
    let s = 0;
    for (let j = i; j < i + per && j < maxBin; j++) s += mag[j];
    s /= per;
    peakMag = Math.max(peakMag, s);
    spectrum.push({ freq: Math.round(i * binHz), magnitude: s });
  }
  for (const p of spectrum) p.magnitude = Number((p.magnitude / peakMag).toFixed(4));

  // Downsampled waveform envelope for drawing
  const points = 240;
  const step = Math.max(1, Math.floor(cleaned.length / points));
  const waveform: number[] = [];
  for (let i = 0; i < cleaned.length; i += step) {
    let m = 0;
    for (let j = i; j < i + step && j < cleaned.length; j++) m = Math.max(m, Math.abs(cleaned[j]));
    waveform.push(Number(m.toFixed(4)));
  }

  return {
    durationSec: Number((cleaned.length / TARGET_SR).toFixed(2)),
    sampleRate: TARGET_SR,
    segments: features,
    aggregate,
    species,
    health,
    piping,
    diseases,
    spectrum,
    waveform,
    inferenceMode: "corpus-gaussian-mfcc",
  };
}

export async function analyzeBlob(blob: Blob): Promise<AnalysisResult> {
  const { audio, sampleRate } = await decodeAudio(blob);
  return analyzeAudio(audio, sampleRate);
}
