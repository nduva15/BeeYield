import { Harvest } from '@/services/beeyieldService';

export const YEAR_PLANS = [
  { year: 2026, totalKg: 60.0, start: "2026-01-03", end: "2026-01-10", honeyType: "Early Spring Acacia Blossom", nectarSource: "Acacia & Wild Blossom", colorGrade: "Extra Light Amber" },
  { year: 2025, totalKg: 300.0, start: "2025-06-15", end: "2025-12-15", honeyType: "Forest Multifloral", nectarSource: "Forest Flora", colorGrade: "Dark Amber" },
  { year: 2024, totalKg: 250.0, start: "2024-06-15", end: "2024-12-15", honeyType: "Wildflower & Acacia", nectarSource: "Acacia & Feral Bush", colorGrade: "Extra White" },
  { year: 2023, totalKg: 105.0, start: "2023-06-15", end: "2023-12-15", honeyType: "Wildflower", nectarSource: "Dryland Flora", colorGrade: "Water White" },
  { year: 2022, totalKg: 55.0, start: "2022-06-15", end: "2022-12-15", honeyType: "Forest Acacia", nectarSource: "Acacia & Riverine", colorGrade: "Amber" },
  { year: 2021, totalKg: 60.0, start: "2021-06-15", end: "2021-12-15", honeyType: "Wildflower", nectarSource: "Wildflower", colorGrade: "Light Amber" },
  { year: 2020, totalKg: 13.0, start: "2020-06-15", end: "2020-12-15", honeyType: "Wildflower", nectarSource: "Wildflower Pioneer", colorGrade: "Amber" },
];

export const TIMOTHY_HIVES = Array.from({ length: 184 }, (_, i) => `KIB-${String(i + 1).padStart(3, "0")} (Langstroth 10)`);

export function generateTimothyHarvestBatches(): Harvest[] {
  const batches: Harvest[] = [];
  for (const plan of YEAR_PLANS) {
    const fullBatches = Math.floor(plan.totalKg / 2.0);
    const remainder = Number((plan.totalKg - (fullBatches * 2.0)).toFixed(1));
    const totalBatches = fullBatches + (remainder > 0 ? 1 : 0);

    const startDate = new Date(plan.start + "T12:00:00Z");
    const endDate = new Date(plan.end + "T12:00:00Z");
    const daySpan = Math.max(Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1);

    for (let seq = 1; seq <= totalBatches; seq++) {
      const quantity = seq <= fullBatches ? 2.0 : remainder;
      const dayOffset = (seq - 1) % daySpan;
      const batchDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = batchDate.toISOString().slice(0, 10);
      const yyyymmdd = dateStr.replace(/-/g, "");

      let hiveIndex: number;
      if (plan.year === 2026) {
        hiveIndex = (seq - 1) % 30;
      } else if (plan.year === 2025) {
        hiveIndex = (seq - 1) % 150;
      } else if (plan.year === 2024) {
        hiveIndex = (seq - 1) % 125;
      } else if (plan.year === 2023) {
        hiveIndex = (seq - 1) % 53;
      } else if (plan.year === 2022) {
        hiveIndex = (seq - 1) % 28;
      } else if (plan.year === 2021) {
        hiveIndex = (seq - 1) % 30;
      } else {
        hiveIndex = (seq - 1) % 7;
      }

      const hiveLabel = TIMOTHY_HIVES[hiveIndex];
      const hiveCode = `KIB-${String(hiveIndex + 1).padStart(3, "0")}`;
      const batchCode = `BEE-${yyyymmdd}-${String(hiveIndex + 1).padStart(3, "0")}`;
      const traceCode = `TRC-${plan.year}-${hiveCode.slice(-3)}-${String(seq).padStart(3, "0")}`;
      const moisture = plan.year === 2026 ? 16.8 : Number((17.0 + ((seq % 5) * 0.1)).toFixed(1));

      batches.push({
        id: `harv-${plan.year}-${String(seq).padStart(3, "0")}`,
        harvest_date: dateStr,
        harvested_on: dateStr,
        location: "BeeYield Apiary in Kibwezi Kenya",
        apiary_name: "BeeYield Apiary in Kibwezi Kenya",
        hive_id: `hive-kib-${String(hiveIndex + 1).padStart(3, '0')}`,
        hive_code: hiveCode,
        hive_label: hiveLabel,
        batch: batchCode,
        batch_code: batchCode,
        honey_type: plan.honeyType,
        quantity_kg: quantity,
        weight_kg: quantity,
        frames_harvested: quantity >= 2 ? 2 : 1,
        moisture_pct: moisture,
        moisture_content_percent: moisture,
        color_grade: plan.colorGrade,
        quality_grade: "Export Grade A (<18% moisture)",
        traceability_code: traceCode,
        beekeeper: "Timothy Nduva",
        actions: ["Cold extracted (<35°C)", "Double strained (200μm)", "Refractometer tested", "Batch sealed in SS304"],
        weather: "28°C, 40% RH, clear dry extraction conditions",
        notes: plan.year === 2026
          ? `Timothy Nduva - Current Season Jan Harvest Window batch ${seq} of ${totalBatches} (${quantity}kg from ${hiveLabel})`
          : `Timothy Nduva - Production Record ${plan.year} batch ${seq} of ${totalBatches} (${quantity}kg from ${hiveLabel})`,
        created_at: `${dateStr}T10:00:00.000Z`,
      });
    }
  }

  batches.sort((a, b) => (b.harvest_date || '').localeCompare(a.harvest_date || ''));
  return batches;
}

export const CANONICAL_TIMOTHY_HARVESTS: Harvest[] = generateTimothyHarvestBatches();

/**
 * Universal Harvest Key Normalizer
 * Collapses dual batch codes (001 vs E001), legacy UUIDs, and variations into identical keys
 * so duplicate doubling is mathematically impossible.
 */
export function getNormalizedHarvestKey(h: any): string {
  if (!h) return '';

  // 1. Check for canonical date (YYYY-MM-DD)
  const rawDate = String(h.harvest_date || h.harvested_on || h.date || h.created_at || '').slice(0, 10);
  const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dateStr = dateMatch ? rawDate : '';

  // 2. Extract hive number (1..184) from any hive reference or batch string
  const hiveSources = [
    h.hive_code,
    h.hive_label,
    h.hive?.hive_code,
    h.hive?.name,
    h.batch_code,
    h.batch,
    h.notes
  ].filter(Boolean).join(' ');

  const hiveMatch =
    hiveSources.match(/BEE-?(\d{1,3})/i) ||
    hiveSources.match(/KIB-?(\d{1,3})/i) ||
    hiveSources.match(/E(\d{3})/i) ||
    hiveSources.match(/(\d{1,3})\b/);

  const hiveNum = hiveMatch ? parseInt(hiveMatch[1], 10) : null;

  if (dateStr && hiveNum !== null) {
    return `HARV_${dateStr}_HIVE_${hiveNum}`;
  }

  // 3. Fallback: Year & Sequence (e.g. harv-2026-001, BEE-2026-01-001, TRC-2026-001-001)
  const allIdSources = [h.id, h.batch_id, h.batch_code, h.batch, h.traceability_code, h.notes].filter(Boolean).join(' ');
  const seqMatch =
    allIdSources.match(/(?:harv|TRC|BEE)[-_](\d{4})[-_](\d{1,4})/i) ||
    allIdSources.match(/(\d{4})[-_]\d{1,2}[-_](\d{1,4})/);

  if (seqMatch) {
    return `SEQ_${seqMatch[1]}_${parseInt(seqMatch[2], 10)}`;
  }

  // 4. Batch Code match (BEE-YYYYMMDD-001 or BEE-YYYYMMDD-E001)
  const rawBatch = String(h.batch_code || h.batch || '').trim().toUpperCase();
  if (rawBatch) {
    const m = rawBatch.match(/BEE-(\d{8})-?[A-Z]*(\d{1,4})/);
    if (m) {
      return `BATCH_${m[1]}_${parseInt(m[2], 10)}`;
    }
    return `BATCH_${rawBatch}`;
  }

  return `ID_${String(h.id || '')}`;
}
