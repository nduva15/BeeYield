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
}

export interface VarroaTreatmentWindow {
    day: number;
    score: number;
    rationale: string;
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

    if (normalized.includes('equator') || normalized.includes('tropic') || normalized.includes('kenya') || normalized.includes('uganda')) {
        return 0.62;
    }

    if (normalized.includes('mediterranean') || normalized.includes('south europe') || normalized.includes('spain')) {
        return 0.84;
    }

    if (normalized.includes('north') || normalized.includes('canada') || normalized.includes('scandinavia')) {
        return 1.12;
    }

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

export function simulateVarroaModel(inputs: VarroaModelInputs): VarroaModelOutput {
    const strengthFactor = strengthFactorMap[inputs.colonyStrength];
    const reinvasionFactor = reinvasionFactorMap[inputs.reinvasionPressure];
    const hygieneFactor = hygieneFactorMap[inputs.hygieneProfile];
    const treatmentProfile = getTreatmentProfile(inputs.treatmentType);
    const timeline: VarroaModelPoint[] = [];
    const startDate = new Date(inputs.startDate || new Date().toISOString());

    let adultPopulation = Math.max(3000, Math.round(inputs.adultBeePopulation * strengthFactor));
    let phoretic = Math.max(1, Math.round(inputs.initialMiteCount * (inputs.broodMode === 'Broodless' ? 0.9 : 0.42)));
    let broodQueue = Array.from({ length: 12 }, () => Math.max(0, (inputs.initialMiteCount - phoretic) / 12));
    let cumulativeMiteFall = 0;
    let collapseDay: number | null = null;
    let peakRisk = 0;
    let peakMites = phoretic + broodQueue.reduce((sum, value) => sum + value, 0);
    let peakInfestation = 0;
    let previousTotalMites = peakMites;

    for (let day = 0; day <= inputs.simulationDays; day += 1) {
        const currentDate = new Date(startDate.getTime() + day * 86400000);
        const broodIndex = getBroodIndex(currentDate, inputs.broodMode, inputs.region, inputs.hasBrood);
        const ambientTemperature = getAmbientTemperature(inputs.temperature, day, inputs.simulationDays, inputs.region);
        const treatmentEffect = getTreatmentEffect(treatmentProfile, day, inputs.treatmentDay, ambientTemperature, broodIndex);
        const seasonCurve = getSeasonCurve(currentDate, inputs.region);

        broodQueue = broodQueue.map((value) => value * (1 - clamp(0.002 + treatmentEffect.broodKill * 0.65 + (1 - hygieneFactor) * 0.004, 0, 0.45)));

        const broodTarget = Math.round(adultPopulation * (4.4 + strengthFactor * 1.8) * broodIndex);
        const emergingFromBrood = broodQueue.shift() || 0;
        const broodOpportunity = clamp(0.05 + broodIndex * 0.19, 0.03, 0.26);
        const mitesEnteringBrood = Math.min(phoretic * broodOpportunity * hygieneFactor, broodTarget * 0.055);
        const reinvasionLoad =
            Math.max(0, day - inputs.simulationDays * 0.35) *
            (adultPopulation / 20000) *
            reinvasionFactor *
            (0.1 + (1 - seasonCurve) * 0.05);

        const reproductiveGain = emergingFromBrood * (1.16 + broodIndex * 0.62) * hygieneFactor;
        const naturalDrop = phoretic * (0.003 + broodIndex * 0.0015);
        const treatmentDrop = phoretic * treatmentEffect.phoreticKill;
        const dailyMiteFall = naturalDrop + treatmentDrop * 0.82;

        phoretic = Math.max(0, phoretic - mitesEnteringBrood - naturalDrop - treatmentDrop + reproductiveGain + reinvasionLoad);
        broodQueue.push(Math.max(0, mitesEnteringBrood));

        const mitesInBrood = broodQueue.reduce((sum, value) => sum + value, 0);
        const totalMites = phoretic + mitesInBrood;

        const infestationPercent = (phoretic / Math.max(adultPopulation, 1)) * 100;
        const virusStress = clamp((infestationPercent - 1.5) / 9, 0, 1);
        const seasonalAdultTarget = inputs.adultBeePopulation * strengthFactor * (0.82 + seasonCurve * 0.42);
        const populationRecovery = (seasonalAdultTarget - adultPopulation) * 0.06;
        const populationLoss = adultPopulation * (0.0022 + virusStress * 0.0065 + (1 - seasonCurve) * 0.0015);
        const dailyPopulationChange = populationRecovery - populationLoss;

        adultPopulation = Math.max(2500, adultPopulation + dailyPopulationChange);
        cumulativeMiteFall += dailyMiteFall;

        const growthRatio = (totalMites - previousTotalMites) / Math.max(previousTotalMites, 1);
        const riskScore =
            (
                normalizeRisk(totalMites, inputs.collapseThreshold) * 0.36 +
                normalizeRisk(infestationPercent, 8) * 0.28 +
                normalizeRisk(reinvasionLoad, 35) * 0.12 +
                normalizeRisk(Math.max(growthRatio, 0), 0.18) * 0.12 +
                normalizeRisk(virusStress, 1) * 0.12
            ) * 100;

        if (collapseDay === null && (totalMites >= inputs.collapseThreshold || infestationPercent >= 12)) {
            collapseDay = day;
        }

        peakRisk = Math.max(peakRisk, riskScore);
        peakMites = Math.max(peakMites, totalMites);
        peakInfestation = Math.max(peakInfestation, infestationPercent);
        previousTotalMites = totalMites;

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
        });
    }

    const windows = timeline
        .slice(0, Math.max(timeline.length - 7, 1))
        .map((point, index) => {
            const futureSlice = timeline.slice(index, index + 14);
            const forwardRisk = futureSlice.reduce((sum, item) => sum + item.scenarioRisk, 0) / Math.max(futureSlice.length, 1);
            const suitability = getTreatmentTemperatureSuitability(treatmentProfile, point.ambientTemperature);
            const broodOpportunity = treatmentProfile.broodSensitive ? 1 - point.broodIndex : 0.45 + point.broodIndex * 0.55;
            const urgency = clamp(forwardRisk / 100, 0, 1);
            const score = (suitability * 0.38 + broodOpportunity * 0.22 + urgency * 0.4) * 100;

            let rationale = `${treatmentProfile.label} is best when risk is building and weather stays inside the working range.`;
            if (treatmentProfile.broodSensitive && point.broodIndex < 0.3) {
                rationale = `${treatmentProfile.label} scores well here because brood pressure is low, so more mites remain phoretic.`;
            } else if (!treatmentProfile.broodSensitive && suitability > 0.8) {
                rationale = `${treatmentProfile.label} is temperature-favorable in this window and should suppress mites before the late-season rise.`;
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

    const lastPoint = timeline[timeline.length - 1];
    const confidenceBase = inputs.startMode === 'observed' ? 0.76 : 0.58;
    const confidence =
        confidenceBase +
        (inputs.reinvasionPressure === 'Medium' ? 0.04 : 0) +
        (inputs.broodMode === 'Seasonal (auto)' ? 0.05 : 0) -
        (inputs.broodMode === 'Manual (advanced)' ? 0.03 : 0);

    const riskBand: VarroaModelSummary['riskBand'] =
        (lastPoint?.scenarioRisk || 0) >= 70 ? 'critical' : (lastPoint?.scenarioRisk || 0) >= 40 ? 'watch' : 'stable';

    const recommendation =
        riskBand === 'critical'
            ? collapseDay !== null
                ? `Model projects collapse pressure by day ${collapseDay}. Use the next high-scoring treatment window and cut reinvasion sources immediately.`
                : `High risk trajectory detected. Suppress mites before the next brood peak and re-check alcohol wash within 7 to 10 days.`
            : riskBand === 'watch'
                ? `Pressure is rising but still controllable. Prepare treatment around day ${windows[0]?.day ?? 0} and watch brood-driven growth.`
                : `Current trajectory is manageable. Maintain surveillance, and keep a treatment plan ready before late-season reinvasion builds.`;

    const treatmentInsight = {
        varroaEffect:
            treatmentProfile.broodSensitive
                ? `${treatmentProfile.label} mainly removes phoretic mites. Model benefit increases sharply as brood pressure drops.`
                : `${treatmentProfile.label} suppresses phoretic mites and reduces the slope of the brood-amplified rebound.`,
        beeEffect:
            getTreatmentTemperatureSuitability(treatmentProfile, inputs.temperature) >= 0.8
                ? `Current temperature sits inside the preferred working range for ${treatmentProfile.label.toLowerCase()}, so efficacy is stronger and dosing stress is lower.`
                : `Temperature is outside the ideal band for ${treatmentProfile.label.toLowerCase()}, so efficacy becomes less predictable and bee stress rises.`,
        limitation:
            inputs.reinvasionPressure === 'High'
                ? `Neighboring mite pressure is high. Even a strong kill event can be followed by reinvasion if adjacent colonies are unmanaged.`
                : `The limiting factor remains sealed brood. If mites keep cycling under cappings, rebound can resume after the treatment tail fades.`,
    };

    return {
        timeline,
        summary: {
            estimatedMiteCount: Math.round(inputs.startMode === 'observed' ? inputs.mitesPerDay * inputs.colonyMultiplier : inputs.initialMiteCount),
            totalPopulation: Math.round(lastPoint?.totalMites || 0),
            phoretic: Math.round(lastPoint?.phoretic || 0),
            brood: Math.round(lastPoint?.mitesInBrood || 0),
            dailyMiteFall: Math.round(lastPoint?.dailyMiteFall || 0),
            collapseThreshold: inputs.collapseThreshold,
            peakMites: Math.round(peakMites),
            peakRisk: Number(peakRisk.toFixed(1)),
            peakInfestation: Number(peakInfestation.toFixed(2)),
            collapseDay,
            riskBand,
            confidence: Number((clamp(confidence, 0.42, 0.92) * 100).toFixed(1)),
            bestWindow: windows[0] || null,
            recommendation,
        },
        windows,
        treatmentInsight,
    };
}
