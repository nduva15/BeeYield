export interface HiveUnit {
    frameCount: number;
    isStrong?: boolean;
    isLarge?: boolean;
}

export interface CalculationInputs {
    totalAcres: number;
    targetFpa?: number;            // desired Frames Per Acre (defaults to 12)
    averageFramesPerHive?: number; // used when hives array not provided
    hives?: HiveUnit[];
    bloomIntensity?: number;       // 0.0 - 1.5   (1 = peak bloom)
    forageCondition?: number;      // 0.0 - 1.0   (1 = no competition)
    weatherRisk?: number;          // 0.0 - 1.0   (0 = perfect weather)
}

export interface PollinationMetrics {
    totalFrames: number;
    effectiveFrames: number;
    framesPerAcre: number;
    effectiveFPA: number;
    pollinationEfficacy: number;
    recommendation: string;
    hivesRequired: number;
    totalFramesRequired: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const calculatePollinationMetrics = (inputs: CalculationInputs): PollinationMetrics => {
    const acres = Math.max(0, inputs.totalAcres || 0);
    const targetFpa = inputs.targetFpa && inputs.targetFpa > 0 ? inputs.targetFpa : 12;
    const bloom = clamp(inputs.bloomIntensity ?? 0.9, 0.05, 1.5);
    const forage = clamp(inputs.forageCondition ?? 1, 0.1, 1.2); // 0.1 = heavy competition, 1.0 = clear
    const weatherRisk = clamp(inputs.weatherRisk ?? 0.2, 0, 0.8); // probability of adverse conditions

    // Derive hive inventory
    let totalFrames = 0;
    let hiveCount = 0;

    if (inputs.hives && inputs.hives.length > 0) {
        inputs.hives.forEach((hive) => {
            const strengthBoost = hive.isStrong ? 1.1 : 1.0;
            const sizeBoost = hive.isLarge ? 1.05 : 1.0;
            totalFrames += hive.frameCount * strengthBoost * sizeBoost;
            hiveCount += 1;
        });
    } else {
        const avgFrames = inputs.averageFramesPerHive && inputs.averageFramesPerHive > 0
            ? inputs.averageFramesPerHive
            : 8;
        hiveCount = Math.max(1, Math.round((acres * targetFpa) / avgFrames));
        totalFrames = hiveCount * avgFrames;
    }

    const avgFramesPerHive = hiveCount > 0 ? totalFrames / hiveCount : (inputs.averageFramesPerHive || 8);
    const totalFramesRequired = acres * targetFpa;

    // Environmental multipliers
    const bloomMultiplier = 0.65 + 0.35 * bloom;                // strong bloom lifts effective frames
    const forageMultiplier = 1 - (1 - forage) * 0.55;           // heavy competition can cut force by up to 55%
    const weatherMultiplier = 1 - weatherRisk * 0.45;           // weather risk trims force (wind/rain)

    const effectiveFrames = totalFrames * bloomMultiplier * forageMultiplier * weatherMultiplier;
    const framesPerAcre = acres > 0 ? totalFrames / acres : 0;
    const effectiveFPA = acres > 0 ? effectiveFrames / acres : 0;

    // Sigmoid converts effective FPA to probability-like efficacy
    const ratio = targetFpa > 0 ? effectiveFPA / targetFpa : 0;
    const pollinationEfficacy = Math.round(100 / (1 + Math.exp(-4 * (ratio - 1))));

    const hivesRequired = avgFramesPerHive > 0
        ? Math.max(1, Math.ceil(totalFramesRequired / avgFramesPerHive))
        : 0;

    let recommendation = 'Solid coverage. Maintain deployments and monitor bloom curve.';
    if (pollinationEfficacy < 60) {
        recommendation = 'Under-powered: add stronger colonies or increase hive density this week.';
    } else if (pollinationEfficacy < 85) {
        recommendation = 'Borderline: add 1–2 Grade A pallets or shift placements toward bloom hotspots.';
    } else if (pollinationEfficacy > 95) {
        recommendation = 'Excellent alignment. Log verification photos and lock routing for audit.';
    }

    return {
        totalFrames: Math.round(totalFrames),
        effectiveFrames: Math.round(effectiveFrames),
        framesPerAcre: Number(framesPerAcre.toFixed(1)),
        effectiveFPA: Number(effectiveFPA.toFixed(1)),
        pollinationEfficacy: clamp(pollinationEfficacy, 0, 100),
        recommendation,
        hivesRequired,
        totalFramesRequired: Math.round(totalFramesRequired)
    };
};
