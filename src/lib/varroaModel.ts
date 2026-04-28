import { hashToRange } from './deterministic';

export type StartMode = 'observed' | 'default';
export type ColonyStrength = 'Weak' | 'Medium' | 'Strong';
export type BroodMode = 'Seasonal (auto)' | 'Manual (advanced)' | 'Broodless';
export type ReinvasionPressure = 'Low' | 'Medium' | 'High';
export type HygieneProfile = 'Standard' | 'VSH' | 'Resistant';

export interface VarroaModelInputs {
    startDate: string;
    startMode: StartMode;
    measurementType: string;
    region: string;
    initialMiteCount: number;
    adultBeePopulation: number;
    simulationDays: number;
    collapseThreshold: number;
    colonyStrength: ColonyStrength;
    broodMode: BroodMode;
    reinvasionPressure: ReinvasionPressure;
    hygieneProfile: HygieneProfile;
    treatmentType: string;
    treatmentDay: number;
    temperature: number;
    mitesPerDay: number;
    colonyMultiplier: number;
    hasBrood: boolean;
}

export interface VarroaModelPoint {
    day: number;
    dayLabel: string;
    population: number;
    phoretic: number;
    dailyMiteFall: number;
    cumulativeMiteFall: number;
    brood: number;
    mitesInBrood: number;
    broodlessPhoretic: number;
    infectionPer100: number;
    scenarioRisk: number;
    adultBees: number;
    allBrood: number;
    cappedBrood: number;
    alcoholWash: number;
    totalMites: number;
    dailyPopulationChange: number;
    broodIndex: number;
    treatmentEffect: number;
    reinvasionLoad: number;
    ambientTemperature: number;
    lowTotalMites: number;
    highTotalMites: number;
    lowRisk: number;
    highRisk: number;
    collapseProbability: number;
    reproductionRatio: number;
}

export interface VarroaTreatmentWindow {
    day: number;
    score: number;
    rationale: string;
}

export interface VarroaModelDriver {
    key: 'infestation' | 'reinvasion' | 'brood' | 'treatment' | 'colony';
    label: string;
    score: number;
    detail: string;
}

export interface VarroaModelSummary {
    estimatedMiteCount: number;
    totalPopulation: number;
    phoretic: number;
    brood: number;
    dailyMiteFall: number;
    collapseThreshold: number;
    peakMites: number;
    peakRisk: number;
    peakInfestation: number;
    collapseDay: number | null;
    riskBand: 'stable' | 'watch' | 'critical';
    confidence: number;
    collapseProbability: number;
    uncertaintyBand: number;
    treatmentRobustness: number;
    monitoringCadenceDays: number;
    expectedPeakDay: number;
    primaryDriver: string;
    bestWindow: VarroaTreatmentWindow | null;
    recommendation: string;
}

export interface VarroaModelOutput {
    timeline: VarroaModelPoint[];
    summary: VarroaModelSummary;
    windows: VarroaTreatmentWindow[];
    treatmentInsight: {
        varroaEffect: string;
        beeEffect: string;
        limitation: string;
    };
    ensemble: {
        runs: number;
        drivers: VarroaModelDriver[];
    };
}

type TreatmentProfile = {
    key: string;
    label: string;
    durationDays: number;
    phoreticKill: number;
    broodKill: number;
    optimalMinC: number;
    optimalMaxC: number;
    broodSensitive: boolean;
};

type SimulationAdjustments = {
    reproductionMultiplier: number;
    reinvasionMultiplier: number;
    treatmentMultiplier: number;
    naturalDropMultiplier: number;
    adultLossMultiplier: number;
    adultRecoveryMultiplier: number;
    broodMultiplier: number;
    seasonalityShiftDays: number;
    temperatureBias: number;
};

type SimulationCoreOutput = {
    timeline: VarroaModelPoint[];
    collapseDay: number | null;
    peakRisk: number;
    peakMites: number;
    peakInfestation: number;
    peakDay: number;
    meanReinvasionLoad: number;
    meanBroodIndex: number;
    meanTreatmentEffect: number;
    meanVirusStress: number;
    meanGrowthRatio: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const strengthFactorMap: Record<ColonyStrength, number> = {
    Weak: 0.82,
    Medium: 1,
    Strong: 1.18,
};

const reinvasionFactorMap: Record<ReinvasionPressure, number> = {
    Low: 0.45,
    Medium: 1,
    High: 1.55,
};

const hygieneFactorMap: Record<HygieneProfile, number> = {
    Standard: 1,
    VSH: 0.82,
    Resistant: 0.68,
};

const treatmentProfiles: TreatmentProfile[] = [
    { key: 'amitraz', label: 'Amitraz', durationDays: 42, phoreticKill: 0.038, broodKill: 0.008, optimalMinC: 10, optimalMaxC: 30, broodSensitive: false },
    { key: 'formic acid', label: 'Formic acid', durationDays: 10, phoreticKill: 0.12, broodKill: 0.05, optimalMinC: 10, optimalMaxC: 29, broodSensitive: false },
    { key: 'oxalic acid', label: 'Oxalic acid', durationDays: 4, phoreticKill: 0.22, broodKill: 0.01, optimalMinC: 4, optimalMaxC: 28, broodSensitive: true },
    { key: 'thymol', label: 'Thymol', durationDays: 21, phoreticKill: 0.055, broodKill: 0.012, optimalMinC: 15, optimalMaxC: 30, broodSensitive: false },
];

const fallbackTreatment: TreatmentProfile = {
    key: 'generic',
    label: 'Treatment',
    durationDays: 14,
    phoreticKill: 0.06,
    broodKill: 0.01,
    optimalMinC: 10,
    optimalMaxC: 28,
    broodSensitive: false,
};

function getTreatmentProfile(treatmentType: string): TreatmentProfile {
    const normalized = treatmentType.trim().toLowerCase();
    return treatmentProfiles.find((profile) => normalized.includes(profile.key)) || fallbackTreatment;
}

function getDayOfYear(date: Date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / 86400000);
}

function getRegionSeasonality(region: string) {
    const normalized = region.trim().toLowerCase();

    if (normalized.includes('equator') || normalized.includes('tropic') || normalized.includes('kenya') || normalized.includes('uganda')) return 0.62;
    if (normalized.includes('mediterranean') || normalized.includes('south europe') || normalized.includes('spain')) return 0.84;
    if (normalized.includes('north') || normalized.includes('canada') || normalized.includes('scandinavia')) return 1.12;

    return 1;
}

function getSeasonCurve(date: Date, region: string) {
    const day = getDayOfYear(date);
    const amplitude = getRegionSeasonality(region);
    const raw = 0.5 + 0.5 * Math.sin(((2 * Math.PI) * (day - 82)) / 365);
    return clamp(raw * amplitude + (1 - amplitude) * 0.5, 0.06, 1);
}

function getBroodIndex(date: Date, broodMode: BroodMode, region: string, hasBrood: boolean) {
    if (broodMode === 'Broodless') return hasBrood ? 0.12 : 0.03;
    if (broodMode === 'Manual (advanced)') return hasBrood ? 0.72 : 0.24;
    return hasBrood ? clamp(0.08 + getSeasonCurve(date, region) * 0.92, 0.08, 1) : 0.1;
}

function getAmbientTemperature(baseTemperature: number, day: number, simulationDays: number, region: string) {
    const regionalSwing = getRegionSeasonality(region) > 1 ? 4.4 : 2.8;
    const progress = day / Math.max(simulationDays, 1);
    const wave = Math.sin(progress * Math.PI * 1.3) * regionalSwing;
    return Number((baseTemperature + wave).toFixed(1));
}

function getTreatmentTemperatureSuitability(profile: TreatmentProfile, temperature: number) {
    const midpoint = (profile.optimalMinC + profile.optimalMaxC) / 2;
    const halfRange = (profile.optimalMaxC - profile.optimalMinC) / 2;
    const distance = Math.abs(temperature - midpoint);

    if (temperature < profile.optimalMinC - 4 || temperature > profile.optimalMaxC + 4) return 0.18;
    if (temperature < profile.optimalMinC || temperature > profile.optimalMaxC) return 0.58;

    return clamp(1 - distance / Math.max(halfRange, 1) * 0.22, 0.78, 1);
}

function getTreatmentEffect(profile: TreatmentProfile, day: number, treatmentDay: number, temperature: number, broodIndex: number) {
    const offset = day - treatmentDay;
    if (offset < 0 || offset >= profile.durationDays) return { phoreticKill: 0, broodKill: 0, effectStrength: 0 };

    const temperatureSuitability = getTreatmentTemperatureSuitability(profile, temperature);
    const curve = Math.exp(-offset / Math.max(profile.durationDays / 3.4, 1));
    const broodPenalty = profile.broodSensitive ? clamp(1 - broodIndex * 0.7, 0.22, 1) : 1;
    const phoreticKill = profile.phoreticKill * curve * temperatureSuitability * broodPenalty;
    const broodKill = profile.broodKill * curve * temperatureSuitability;

    return {
        phoreticKill,
        broodKill,
        effectStrength: clamp((phoreticKill + broodKill * 0.7) * 12, 0, 1),
    };
}

function normalizeRisk(value: number, limit: number) {
    return clamp(value / Math.max(limit, 1), 0, 1.25) / 1.25;
}

function quantile(values: number[], q: number) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const position = (sorted.length - 1) * clamp(q, 0, 1);
    const base = Math.floor(position);
    const remainder = position - base;
    const next = sorted[Math.min(base + 1, sorted.length - 1)];
    return sorted[base] + (next - sorted[base]) * remainder;
}

function getEstimatedStartMites(inputs: VarroaModelInputs) {
    if (inputs.startMode !== 'observed') return Math.max(inputs.initialMiteCount, 1);

    const method = inputs.measurementType.trim().toLowerCase();
    const observed = Math.max(inputs.mitesPerDay, 1);
    let methodMultiplier = clamp(inputs.colonyMultiplier || 120, 25, 220);

    if (method.includes('alcohol') || method.includes('wash')) {
        methodMultiplier = clamp(inputs.colonyMultiplier || 35, 18, 120);
    } else if (method.includes('sugar') || method.includes('roll')) {
        methodMultiplier = clamp(inputs.colonyMultiplier || 45, 20, 150);
    } else if (method.includes('fall') || method.includes('sticky')) {
        methodMultiplier = clamp(inputs.colonyMultiplier || 120, 60, 240);
    }

    const fieldEstimate = observed * methodMultiplier;
    return Math.round(inputs.initialMiteCount * 0.65 + fieldEstimate * 0.35);
}

function buildNeutralAdjustments(): SimulationAdjustments {
    return {
        reproductionMultiplier: 1,
        reinvasionMultiplier: 1,
        treatmentMultiplier: 1,
        naturalDropMultiplier: 1,
        adultLossMultiplier: 1,
        adultRecoveryMultiplier: 1,
        broodMultiplier: 1,
        seasonalityShiftDays: 0,
        temperatureBias: 0,
    };
}

function buildSimulationAdjustments(inputs: VarroaModelInputs, runIndex: number): SimulationAdjustments {
    const seed = [
        inputs.startDate,
        inputs.region,
        inputs.colonyStrength,
        inputs.broodMode,
        inputs.reinvasionPressure,
        inputs.hygieneProfile,
        inputs.treatmentType,
        inputs.temperature,
        runIndex,
    ].join('|');

    const uncertainty = inputs.startMode === 'observed' ? 0.1 : 0.19;

    return {
        reproductionMultiplier: hashToRange(`${seed}:repro`, 1 - uncertainty * 0.7, 1 + uncertainty * 0.7),
        reinvasionMultiplier: hashToRange(`${seed}:rein`, 1 - uncertainty, 1 + uncertainty * 1.2),
        treatmentMultiplier: hashToRange(`${seed}:treat`, 1 - uncertainty * 0.8, 1 + uncertainty * 0.35),
        naturalDropMultiplier: hashToRange(`${seed}:drop`, 1 - uncertainty * 0.35, 1 + uncertainty * 0.45),
        adultLossMultiplier: hashToRange(`${seed}:loss`, 1 - uncertainty * 0.25, 1 + uncertainty * 0.85),
        adultRecoveryMultiplier: hashToRange(`${seed}:recover`, 1 - uncertainty * 0.35, 1 + uncertainty * 0.35),
        broodMultiplier: hashToRange(`${seed}:brood`, 1 - uncertainty * 0.45, 1 + uncertainty * 0.45),
        seasonalityShiftDays: hashToRange(`${seed}:season`, -16, 16),
        temperatureBias: hashToRange(`${seed}:temp`, -2.2, 2.2),
    };
}

export function runTrajectory(inputs: VarroaModelInputs, adjustments: SimulationAdjustments): SimulationCoreOutput {
    const strengthFactor = strengthFactorMap[inputs.colonyStrength];
    const reinvasionFactor = reinvasionFactorMap[inputs.reinvasionPressure];
    const hygieneFactor = hygieneFactorMap[inputs.hygieneProfile];
    const treatmentProfile = getTreatmentProfile(inputs.treatmentType);
    const timeline: VarroaModelPoint[] = [];
    const startDate = new Date(inputs.startDate || new Date().toISOString());
    const estimatedStartMites = getEstimatedStartMites(inputs);
    const initialBroodIndex = clamp(
        getBroodIndex(startDate, inputs.broodMode, inputs.region, inputs.hasBrood) * adjustments.broodMultiplier,
        0.03,
        1,
    );

    let adultPopulation = Math.max(3000, Math.round(inputs.adultBeePopulation * strengthFactor));
    const initialPhoreticShare = inputs.broodMode === 'Broodless'
        ? 0.9
        : clamp(0.78 - initialBroodIndex * 0.42, 0.34, 0.88);
    let phoretic = Math.max(1, Math.round(estimatedStartMites * initialPhoreticShare));
    let broodQueue = Array.from({ length: 12 }, () => Math.max(0, (estimatedStartMites - phoretic) / 12));
    let cumulativeMiteFall = 0;
    let collapseDay: number | null = null;
    let peakRisk = 0;
    let peakMites = phoretic + broodQueue.reduce((sum, value) => sum + value, 0);
    let peakInfestation = 0;
    let peakDay = 0;
    let previousTotalMites = peakMites;
    let reinvasionAccumulator = 0;
    let broodAccumulator = 0;
    let treatmentAccumulator = 0;
    let virusAccumulator = 0;
    let growthAccumulator = 0;

    for (let day = 0; day <= inputs.simulationDays; day += 1) {
        const currentDate = new Date(startDate.getTime() + day * 86400000);
        const seasonDate = new Date(currentDate.getTime() + adjustments.seasonalityShiftDays * 86400000);
        const seasonCurve = getSeasonCurve(seasonDate, inputs.region);
        const broodIndex = clamp(
            getBroodIndex(seasonDate, inputs.broodMode, inputs.region, inputs.hasBrood) * adjustments.broodMultiplier,
            0.03,
            1,
        );
        const ambientTemperature = getAmbientTemperature(
            inputs.temperature + adjustments.temperatureBias,
            day,
            inputs.simulationDays,
            inputs.region,
        );
        const baseTreatmentEffect = getTreatmentEffect(treatmentProfile, day, inputs.treatmentDay, ambientTemperature, broodIndex);
        const treatmentEffect = {
            phoreticKill: clamp(baseTreatmentEffect.phoreticKill * adjustments.treatmentMultiplier, 0, 0.45),
            broodKill: clamp(baseTreatmentEffect.broodKill * adjustments.treatmentMultiplier, 0, 0.22),
            effectStrength: clamp(baseTreatmentEffect.effectStrength * adjustments.treatmentMultiplier, 0, 1),
        };

        const broodCullRate = clamp(
            0.002 + treatmentEffect.broodKill * 0.65 + (1 - hygieneFactor) * 0.004 + (ambientTemperature < 8 ? 0.0025 : 0),
            0,
            0.48,
        );
        broodQueue = broodQueue.map((value) => value * (1 - broodCullRate));

        const broodTarget = Math.round(adultPopulation * (4.2 + strengthFactor * 1.9) * broodIndex);
        const emergingFromBrood = broodQueue.shift() || 0;
        const broodOpportunity = clamp(0.045 + broodIndex * 0.2, 0.03, 0.29);
        const mitesEnteringBrood = Math.min(phoretic * broodOpportunity * hygieneFactor, broodTarget * 0.06);
        const lateSeasonIndex = Math.max(0, day - inputs.simulationDays * 0.32) / Math.max(inputs.simulationDays, 1);
        const reinvasionLoad =
            (adultPopulation / 20000) *
            reinvasionFactor *
            adjustments.reinvasionMultiplier *
            (0.45 + lateSeasonIndex * 8.5) *
            (0.45 + (1 - seasonCurve) * 1.15);

        const reproductivePotential = clamp(
            (1.08 + broodIndex * 0.46 + seasonCurve * 0.12) *
                adjustments.reproductionMultiplier *
                (ambientTemperature < 8 ? 0.9 : 1),
            0.9,
            1.92,
        );
        const reproductiveGain = emergingFromBrood * reproductivePotential * hygieneFactor;
        const naturalDrop = phoretic * (0.0032 + broodIndex * 0.0018) * adjustments.naturalDropMultiplier;
        const treatmentDrop = phoretic * treatmentEffect.phoreticKill;
        const dailyMiteFall = naturalDrop + treatmentDrop * 0.82;

        phoretic = Math.max(0, phoretic - mitesEnteringBrood - naturalDrop - treatmentDrop + reproductiveGain + reinvasionLoad);
        broodQueue.push(Math.max(0, mitesEnteringBrood));

        const mitesInBrood = broodQueue.reduce((sum, value) => sum + value, 0);
        const totalMites = phoretic + mitesInBrood;

        const infestationPercent = (phoretic / Math.max(adultPopulation, 1)) * 100;
        const virusStress = clamp((infestationPercent - 1.2) / 8.5, 0, 1.2);
        const seasonalAdultTarget = inputs.adultBeePopulation * strengthFactor * (0.8 + seasonCurve * 0.44);
        const populationRecovery = (seasonalAdultTarget - adultPopulation) * 0.058 * adjustments.adultRecoveryMultiplier;
        const populationLoss =
            adultPopulation *
            (
                0.0021 +
                virusStress * 0.0074 * adjustments.adultLossMultiplier +
                (1 - seasonCurve) * 0.0018 +
                reinvasionLoad / 50000
            );
        const dailyPopulationChange = populationRecovery - populationLoss;

        adultPopulation = Math.max(2500, adultPopulation + dailyPopulationChange);
        cumulativeMiteFall += dailyMiteFall;

        const growthRatio = (totalMites - previousTotalMites) / Math.max(previousTotalMites, 1);
        const riskScore =
            (
                normalizeRisk(totalMites, inputs.collapseThreshold) * 0.31 +
                normalizeRisk(infestationPercent, 8) * 0.24 +
                normalizeRisk(reinvasionLoad, 35) * 0.15 +
                normalizeRisk(Math.max(growthRatio, 0), 0.16) * 0.12 +
                normalizeRisk(virusStress, 1) * 0.1 +
                normalizeRisk(broodIndex, 1) * 0.08
            ) * 100;

        if (collapseDay === null && (totalMites >= inputs.collapseThreshold || infestationPercent >= 12)) {
            collapseDay = day;
        }

        if (riskScore >= peakRisk) peakDay = day;

        peakRisk = Math.max(peakRisk, riskScore);
        peakMites = Math.max(peakMites, totalMites);
        peakInfestation = Math.max(peakInfestation, infestationPercent);
        previousTotalMites = totalMites;
        reinvasionAccumulator += reinvasionLoad;
        broodAccumulator += broodIndex;
        treatmentAccumulator += treatmentEffect.effectStrength;
        virusAccumulator += clamp(virusStress, 0, 1);
        growthAccumulator += Math.max(growthRatio, 0);

        timeline.push({
            day,
            dayLabel: `${day}`,
            population: Math.round(totalMites),
            phoretic: Math.round(phoretic),
            dailyMiteFall: Math.round(dailyMiteFall),
            cumulativeMiteFall: Math.round(cumulativeMiteFall),
            brood: Math.round(broodTarget),
            mitesInBrood: Math.round(mitesInBrood),
            broodlessPhoretic: Math.round(phoretic + mitesInBrood * clamp(0.72 + (1 - broodIndex) * 0.18, 0.72, 0.9)),
            infectionPer100: Number(infestationPercent.toFixed(2)),
            scenarioRisk: Number(riskScore.toFixed(1)),
            adultBees: Math.round(adultPopulation),
            allBrood: Math.round(broodTarget * 1.85),
            cappedBrood: Math.round(broodTarget * 1.28),
            alcoholWash: Number(((phoretic / Math.max(adultPopulation, 1)) * 300).toFixed(1)),
            totalMites: Math.round(totalMites),
            dailyPopulationChange: Math.round(dailyPopulationChange),
            broodIndex: Number(broodIndex.toFixed(2)),
            treatmentEffect: Number((treatmentEffect.effectStrength * 100).toFixed(1)),
            reinvasionLoad: Number(reinvasionLoad.toFixed(1)),
            ambientTemperature,
            lowTotalMites: Math.round(totalMites),
            highTotalMites: Math.round(totalMites),
            lowRisk: Number(riskScore.toFixed(1)),
            highRisk: Number(riskScore.toFixed(1)),
            collapseProbability: collapseDay !== null && collapseDay <= day ? 100 : 0,
            reproductionRatio: Number((reproductiveGain / Math.max(mitesEnteringBrood, 1)).toFixed(2)),
        });
    }

    const divisor = Math.max(timeline.length, 1);

    return {
        timeline,
        collapseDay,
        peakRisk,
        peakMites,
        peakInfestation,
        peakDay,
        meanReinvasionLoad: reinvasionAccumulator / divisor,
        meanBroodIndex: broodAccumulator / divisor,
        meanTreatmentEffect: treatmentAccumulator / divisor,
        meanVirusStress: virusAccumulator / divisor,
        meanGrowthRatio: growthAccumulator / divisor,
    };
}

export function calculateTreatmentWindows(timeline: VarroaModelPoint[], treatmentProfile: TreatmentProfile) {
    return timeline
        .slice(0, Math.max(timeline.length - 7, 1))
        .map((point, index) => {
            const futureSlice = timeline.slice(index, index + 14);
            const forwardRisk = futureSlice.reduce((sum, item) => sum + item.scenarioRisk, 0) / Math.max(futureSlice.length, 1);
            const suitability = getTreatmentTemperatureSuitability(treatmentProfile, point.ambientTemperature);
            const broodOpportunity = treatmentProfile.broodSensitive ? 1 - point.broodIndex : 0.45 + point.broodIndex * 0.55;
            const urgency = clamp(forwardRisk / 100, 0, 1);
            const collapsePressure = clamp(point.collapseProbability / 100, 0, 1);
            const score = (suitability * 0.32 + broodOpportunity * 0.18 + urgency * 0.34 + collapsePressure * 0.16) * 100;

            let rationale = `${treatmentProfile.label} is best when risk is building and weather stays inside the working range.`;
            if (treatmentProfile.broodSensitive && point.broodIndex < 0.3) {
                rationale = `${treatmentProfile.label} scores well here because brood pressure is low, so more mites remain phoretic.`;
            } else if (!treatmentProfile.broodSensitive && suitability > 0.8) {
                rationale = `${treatmentProfile.label} is temperature-favorable in this window and should suppress mites before the late-season rise.`;
            }

            if (point.collapseProbability >= 40) {
                rationale = `${treatmentProfile.label} becomes urgent here because the ensemble projects a material collapse chance if pressure is left unchecked.`;
            }

            return {
                day: point.day,
                score: Number(score.toFixed(1)),
                rationale,
            };
        })
        .sort((a, b) => b.score - a.score)
        .reduce<VarroaTreatmentWindow[]>((selected, candidate) => {
            if (selected.length >= 3) return selected;
            if (selected.some((item) => Math.abs(item.day - candidate.day) < 7)) return selected;
            selected.push(candidate);
            return selected;
        }, []);
}
