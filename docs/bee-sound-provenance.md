# Bee sound model — provenance

Single source of truth for what the acoustic model is and is not. Update this
file whenever the model, corpora, or benchmark change.

## What runs today

| Layer | Implementation | Status |
|---|---|---|
| Browser (`src/lib/bee-sound-model.ts`) | Per-class diagonal Gaussians over 13 DSP features + linear bee/not-bee gate | Shipping. Parameters are **hand-set**, informed by public corpora. |
| Backend (`backend/app/services/acoustic_analyzer.py`) | Wraps `BEE-SOUND-ANALYSIS` repo modules | `runtime_mode: heuristic_repo_wrappers` unless `backend/brain/beesound_best.pth` exists. |
| Upstream repo `nduva15/BEE-SOUND-ANALYSIS` | Training/inference pipeline | `weights/` ships **empty**. |

There is **no** trained neural checkpoint (no ResNet-18 / CRNN / ONNX model) in
this project.

## Corpora (public sources)

| Corpus | Role | Window count |
|---|---|---|
| NU-Hive / OSBH (Nolasco et al., ICASSP 2019) | Hive-state statistics | not recorded |
| To bee or not to bee (Nolasco & Benetos, 2018) | Bee / not-bee gate | not recorded |
| beepiping (Fourer & Orlowska, DCASE 2022) | Queen piping 300–500 Hz | not recorded |

"SBCM" and "BAD" were previously named in the UI but could not be traced to a
public source; they were removed.

## Claims removed (no supporting evidence in the repo)

412,850 windows · 229.4 audio hours · 750:1 class imbalance · macro-F1 0.942 /
94.2 % accuracy · 98.1 % piping recall · BeeDeepArchitecture (ResNet-18) +
SmoothFocalLoss · CRNN / "BeeSound-v2" / ONNX export · "350K+ bee sounds via
Kaggle" · Go `/inference/kaggle/*` fake results ("Kaggle v4 28GB").

## How to earn a benchmark number

1. Extract the 13 features (see `FEATURE_DIM` docs) for a **held-out** labelled
   set the parameters were not tuned on.
2. `npx tsx scripts/eval-bee-sound.ts features.csv`
3. Record dataset, window counts and the macro-F1 here, then (and only then)
   update `MODEL_META.benchmarkF1` and `CorpusEntry.samples`.

## Training a real model

Run `tools/train_architecture.py` from the upstream repo on the corpora above,
place the checkpoint at `backend/brain/beesound_best.pth`, evaluate it, and
update this document.
