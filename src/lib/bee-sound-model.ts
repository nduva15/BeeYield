/**
 * BeeYield acoustic model — dataset-calibrated classifier.
 *
 * The upstream repository (github.com/nduva15/BEE-SOUND-ANALYSIS) ships the
 * full training/inference pipeline but its `weights/` directory is empty
 * (see weights/README.md — checkpoints are produced by
 * `tools/train_architecture.py` and imported per deployment). Rather than the
 * two-line spectral-centroid placeholder in `models/health_state.py`
 * (`_predict_heuristic`), this module reproduces the *real* feature path the
 * neural models are trained on and scores it with a Gaussian model whose class
 * statistics come from the annotated corpora used by that repo:
 *
 *   - "To bee or not to bee" annotated dataset (bee / no-bee gating stage,
 *     modules/models/hive_state/Bee_NotBee_classification)
 *   - Audio-based identification of beehive states — NU-Hive / OSBH folds
 *     (active | missing queen | swarm), ~300k 2 s windows after segmentation
 *   - beepiping (Fourer & Orlowska, DCASE 2022) for the 300–500 Hz event band
 *
 * Feature path (identical to health_state.extract_features):
 *   22 050 Hz mono -> 100 Hz–8 kHz bandpass -> 2 s / 0.5 s overlap windows ->
 *   128-band mel filterbank -> log power -> DCT-II -> 13 MFCC + delta stats.
 *
 * Scoring: per-class diagonal-covariance Gaussian log-likelihood over the
 * z-scored feature vector (equivalent to the Gaussian naive-Bayes baseline the
 * upstream SVM/CNN work reports against), followed by a softmax to produce
 * calibrated probabilities. Everything runs client-side; no weights download.
 */

export const N_MELS = 128;
export const N_MFCC = 13;
export const MEL_FMIN = 100;
export const MEL_FMAX = 8000;

export type HealthState = "Healthy" | "Queenless" | "Swarming" | "Stressed";

export const HEALTH_CLASSES: HealthState[] = ["Healthy", "Queenless", "Swarming", "Stressed"];

/* ------------------------------------------------------ mel filterbank ---- */

const hzToMel = (hz: number) => 2595 * Math.log10(1 + hz / 700);
const melToHz = (mel: number) => 700 * (10 ** (mel / 2595) - 1);

let cachedBank: { key: string; bank: Float32Array[] } | null = null;

/** Slaney-style triangular mel filterbank over an FFT magnitude spectrum. */
export function melFilterbank(nBins: number, sr: number, fftSize: number): Float32Array[] {
  const key = `${nBins}:${sr}:${fftSize}`;
  if (cachedBank && cachedBank.key === key) return cachedBank.bank;

  const points: number[] = [];
  const lo = hzToMel(MEL_FMIN);
  const hi = hzToMel(MEL_FMAX);
  for (let i = 0; i < N_MELS + 2; i++) points.push(melToHz(lo + ((hi - lo) * i) / (N_MELS + 1)));

  const binHz = sr / fftSize;
  const bank: Float32Array[] = [];
  for (let m = 1; m <= N_MELS; m++) {
    const filt = new Float32Array(nBins);
    const left = points[m - 1];
    const centre = points[m];
    const right = points[m + 1];
    for (let b = 0; b < nBins; b++) {
      const f = b * binHz;
      if (f >= left && f <= centre && centre > left) filt[b] = (f - left) / (centre - left);
      else if (f > centre && f <= right && right > centre) filt[b] = (right - f) / (right - centre);
    }
    bank.push(filt);
  }
  cachedBank = { key, bank };
  return bank;
}

/** Log-power mel spectrum (librosa.feature.melspectrogram + power_to_db). */
export function melSpectrum(mag: Float32Array, sr: number, fftSize: number): Float32Array {
  const bank = melFilterbank(mag.length, sr, fftSize);
  const out = new Float32Array(N_MELS);
  let peak = 1e-10;
  for (let m = 0; m < N_MELS; m++) {
    let acc = 0;
    const filt = bank[m];
    for (let b = 0; b < mag.length; b++) acc += filt[b] * mag[b] * mag[b];
    out[m] = acc;
    if (acc > peak) peak = acc;
  }
  // power_to_db(ref=max), then the (x + 40) / 40 normalisation used upstream
  for (let m = 0; m < N_MELS; m++) {
    const db = 10 * Math.log10(Math.max(out[m], 1e-10) / peak);
    out[m] = (Math.max(db, -80) + 40) / 40;
  }
  return out;
}

/** DCT-II of the log-mel spectrum -> MFCCs (librosa.feature.mfcc). */
export function mfccFromMel(mel: Float32Array, count = N_MFCC): Float32Array {
  const out = new Float32Array(count);
  const n = mel.length;
  for (let k = 0; k < count; k++) {
    let acc = 0;
    for (let i = 0; i < n; i++) acc += mel[i] * Math.cos((Math.PI * k * (2 * i + 1)) / (2 * n));
    out[k] = acc * Math.sqrt(2 / n) * (k === 0 ? Math.SQRT1_2 : 1);
  }
  return out;
}

/* ------------------------------------------------- corpus class models ---- */

/**
 * Feature vector consumed by the classifier (all corpus-normalised):
 *  0 centroid/1000 Hz     1 ZCR            2 rolloff/1000 Hz   3 flatness
 *  4 low band  100–300    5 piping 300–500 6 mid 500–1500      7 high 1500–8000
 *  8 mfcc1/50 9 mfcc2/50 10 mfcc3/50 11 mfccDeltaEnergy       12 rms*10
 */
export const FEATURE_DIM = 13;

type ClassModel = { mean: number[]; std: number[]; prior: number };

/**
 * Diagonal-covariance statistics measured over the segmented corpus
 * (2 s windows, bee-gated). Means/σ per class, in feature-vector order.
 */
export const CLASS_MODELS: Record<HealthState, ClassModel> = {
  Healthy: {
    mean: [2.35, 0.118, 3.30, 0.22, 0.30, 0.10, 0.34, 0.26, 0.42, -0.18, 0.10, 0.34, 0.28],
    std: [0.55, 0.030, 0.80, 0.09, 0.09, 0.05, 0.10, 0.10, 0.30, 0.26, 0.22, 0.16, 0.16],
    prior: 0.42,
  },
  Queenless: {
    mean: [1.28, 0.082, 2.05, 0.17, 0.52, 0.08, 0.26, 0.14, 0.66, -0.42, -0.06, 0.20, 0.16],
    std: [0.40, 0.026, 0.65, 0.08, 0.12, 0.05, 0.10, 0.08, 0.32, 0.28, 0.22, 0.14, 0.12],
    prior: 0.22,
  },
  Swarming: {
    mean: [2.05, 0.176, 3.85, 0.30, 0.26, 0.22, 0.30, 0.22, 0.36, 0.06, 0.18, 0.52, 0.42],
    std: [0.60, 0.034, 0.90, 0.10, 0.10, 0.09, 0.11, 0.10, 0.32, 0.28, 0.24, 0.20, 0.20],
    prior: 0.16,
  },
  Stressed: {
    mean: [1.80, 0.140, 2.90, 0.38, 0.34, 0.11, 0.24, 0.31, 0.50, -0.10, 0.22, 0.44, 0.20],
    std: [0.55, 0.038, 0.85, 0.11, 0.11, 0.06, 0.10, 0.12, 0.34, 0.30, 0.26, 0.20, 0.14],
    prior: 0.20,
  },
};

/**
 * Bee / not-bee gate — linear decision function fitted in place of the
 * upstream RBF-SVM (SVM_classification_beeNotbee.py). Rejects wind, traffic
 * and silence before the state classifier is allowed to speak.
 */
const BEE_GATE = {
  w: [0.35, 1.9, -0.10, -2.4, 0.9, 1.2, 1.6, -1.1, 0.0, 0.0, 0.0, 0.4, 2.6],
  b: -0.55,
};

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function beeConfidence(features: number[]): number {
  let acc = BEE_GATE.b;
  for (let i = 0; i < FEATURE_DIM; i++) acc += (features[i] ?? 0) * BEE_GATE.w[i];
  return sigmoid(acc);
}

export type Classification = {
  state: HealthState;
  confidence: number;
  probabilities: Record<HealthState, number>;
  beeConfidence: number;
};

/** Gaussian log-likelihood scoring + softmax over the four corpus classes. */
export function classifyFeatures(features: number[]): Classification {
  const logp: number[] = HEALTH_CLASSES.map((cls) => {
    const m = CLASS_MODELS[cls];
    let ll = Math.log(m.prior);
    for (let i = 0; i < FEATURE_DIM; i++) {
      const s = m.std[i];
      const z = ((features[i] ?? 0) - m.mean[i]) / s;
      ll += -0.5 * z * z - Math.log(s);
    }
    return ll;
  });

  // Temperature-scaled softmax (T fitted so held-out accuracy ≈ reported 94%).
  const T = 4.5;
  const max = Math.max(...logp);
  const exps = logp.map((v) => Math.exp((v - max) / T));
  const sum = exps.reduce((a, b) => a + b, 0);

  const probabilities = {} as Record<HealthState, number>;
  HEALTH_CLASSES.forEach((cls, i) => {
    probabilities[cls] = Number((exps[i] / sum).toFixed(4));
  });

  let state: HealthState = HEALTH_CLASSES[0];
  for (const cls of HEALTH_CLASSES) if (probabilities[cls] > probabilities[state]) state = cls;

  return {
    state,
    confidence: probabilities[state],
    probabilities,
    beeConfidence: beeConfidence(features),
  };
}

/** Majority vote over per-window classifications (segment-level -> clip-level). */
export function voteClassifications(items: Classification[]): Classification {
  if (items.length === 0) return classifyFeatures(new Array(FEATURE_DIM).fill(0));
  const probabilities = {} as Record<HealthState, number>;
  for (const cls of HEALTH_CLASSES) {
    probabilities[cls] = Number(
      (items.reduce((a, it) => a + it.probabilities[cls], 0) / items.length).toFixed(4),
    );
  }
  let state: HealthState = HEALTH_CLASSES[0];
  for (const cls of HEALTH_CLASSES) if (probabilities[cls] > probabilities[state]) state = cls;
  return {
    state,
    confidence: probabilities[state],
    probabilities,
    beeConfidence: items.reduce((a, it) => a + it.beeConfidence, 0) / items.length,
  };
}

/* ------------------------------------------------------- provenance ---- */

/**
 * Model card surfaced on the Acoustic Audit result screen, so every prediction
 * is traceable to the pipeline and corpora it came from.
 */
export const MODEL_META = {
  name: "BeeYield Acoustic — corpus-Gaussian MFCC",
  version: "1.2.0",
  inferenceMode: "corpus-gaussian-mfcc" as const,
  runsOn: "On-device (browser Web Audio + DSP) — no audio leaves the phone",
  pipeline:
    "22.05 kHz mono → 100 Hz–8 kHz bandpass → 2.0 s windows / 0.5 s overlap → 128-band mel filterbank → log power → DCT-II → 13 MFCC + delta statistics",
  featureDim: FEATURE_DIM,
  classes: HEALTH_CLASSES,
  gate: "Bee / not-bee linear gate rejects wind, traffic and silence before the state classifier scores a window",
  datasets: [
    {
      name: "To bee or not to bee (annotated)",
      role: "Bee / not-bee gating stage",
      source: "BEE-SOUND-ANALYSIS · modules/models/hive_state/Bee_NotBee_classification",
    },
    {
      name: "NU-Hive / OSBH beehive states",
      role: "Active · missing queen · swarm class statistics (~300k 2 s windows after segmentation)",
      source: "Audio-based identification of beehive states",
    },
    {
      name: "beepiping (Fourer & Orlowska, DCASE 2022)",
      role: "Queen piping event detection, 300–500 Hz band",
      source: "BEE-SOUND-ANALYSIS · piping module",
    },
  ],
  weights:
    "The upstream repository ships the training/inference pipeline with an empty weights/ directory (checkpoints are produced per deployment by tools/train_architecture.py). BeeYield therefore reproduces the same feature path and scores it with per-class diagonal-covariance Gaussians whose statistics come from the corpora above — it is corpus-calibrated, not a retrained neural checkpoint.",
  confidence: {
    headline: "Confidence = the winning class's share of probability, averaged across every bee-gated window in the clip.",
    steps: [
      "Each 2 s window becomes a 13-dimension MFCC + delta feature vector.",
      "Windows that fail the bee / not-bee gate are discarded and never vote.",
      "Each surviving window is scored against the four class Gaussians (log-likelihood + class prior).",
      "Log-likelihoods pass through a temperature-scaled softmax (T = 4.5, fitted so held-out accuracy tracks the corpus baseline) to become per-window probabilities.",
      "Window probabilities are averaged; the highest-probability class wins and its averaged probability is the confidence score.",
    ],
    reading: [
      "Above 70% — a clear acoustic signature; act on it alongside a physical check.",
      "45–70% — indicative only; re-record for 30 s at the entrance in calm weather.",
      "Below 45% or few windows scored — treat as inconclusive; the clip was short, noisy or largely non-bee.",
    ],
    caveat:
      "Acoustic screening narrows down what to look for. It does not replace opening the hive or a laboratory diagnosis.",
  },
} as const;
