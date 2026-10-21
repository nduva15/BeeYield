/**
 * Evaluate the in-app acoustic classifier on labelled feature vectors.
 *
 * Usage:
 *   npx tsx scripts/eval-bee-sound.ts path/to/features.csv
 *
 * CSV format (no header required; a header row is skipped automatically):
 *   f0,f1,...,f12,label
 * where f0..f12 are the 13 features documented in src/lib/bee-sound-model.ts
 * (FEATURE_DIM) and label is one of: Healthy | Queenless | Swarming | Stressed.
 *
 * Prints per-class precision / recall / F1 and macro-F1. Only publish an F1 in
 * the UI after running this on a held-out set the Gaussian parameters were NOT
 * tuned on, and record the dataset + counts in docs/bee-sound-provenance.md.
 */
import { readFileSync } from "node:fs";
import {
  classifyFeatures,
  FEATURE_DIM,
  HEALTH_CLASSES,
  type HealthState,
} from "../src/lib/bee-sound-model";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/eval-bee-sound.ts <features.csv>");
  process.exit(1);
}

const rows = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => l.split(",").map((c) => c.trim()))
  .filter((cols) => cols.length === FEATURE_DIM + 1 && !Number.isNaN(Number(cols[0])));

if (rows.length === 0) {
  console.error(`No valid rows (expected ${FEATURE_DIM} numeric features + label).`);
  process.exit(1);
}

const tp: Record<string, number> = {};
const fp: Record<string, number> = {};
const fn: Record<string, number> = {};
const support: Record<string, number> = {};
for (const c of HEALTH_CLASSES) tp[c] = fp[c] = fn[c] = support[c] = 0;

let skipped = 0;
for (const cols of rows) {
  const truth = cols[FEATURE_DIM] as HealthState;
  if (!HEALTH_CLASSES.includes(truth)) {
    skipped++;
    continue;
  }
  const pred = classifyFeatures(cols.slice(0, FEATURE_DIM).map(Number)).state;
  support[truth]++;
  if (pred === truth) tp[truth]++;
  else {
    fp[pred]++;
    fn[truth]++;
  }
}

const f1s: number[] = [];
console.log("class       support  precision  recall  f1");
for (const c of HEALTH_CLASSES) {
  const p = tp[c] + fp[c] ? tp[c] / (tp[c] + fp[c]) : 0;
  const r = tp[c] + fn[c] ? tp[c] / (tp[c] + fn[c]) : 0;
  const f1 = p + r ? (2 * p * r) / (p + r) : 0;
  if (support[c] > 0) f1s.push(f1);
  console.log(`${c.padEnd(11)} ${String(support[c]).padStart(7)}  ${p.toFixed(3).padStart(9)}  ${r.toFixed(3).padStart(6)}  ${f1.toFixed(3)}`);
}
const total = Object.values(support).reduce((a, b) => a + b, 0);
console.log(`\nwindows evaluated: ${total} (skipped unknown labels: ${skipped})`);
console.log(`macro F1: ${(f1s.reduce((a, b) => a + b, 0) / Math.max(f1s.length, 1)).toFixed(3)}`);
