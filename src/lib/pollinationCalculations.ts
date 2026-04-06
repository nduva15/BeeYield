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
    predictedFruitSetPercent: number;
    projectedYieldLiftPercent: number;
    normalizedFlightHours: number;
    recommendation: string;
    hivesRequired: number;
    totalFramesRequired: number;
    recommendedHivesLow: number;
    recommendedHivesHigh: number;
    saturationRisk: 'low' | 'balanced' | 'high';
    coverageGapFrames: number;
    coverageGapHives: number;
    readinessScore: number;
    marginalGainPerHive: number;
}

export interface HealthyHiveInputs {
    colonyFrames: number;
    broodFrames: number;
    queenPresenceScore: number;
    weeklyFlightHours: number;
    weatherQuality: number;
    orientation: 'east' | 'south' | 'west' | 'north';
}

export interface HealthyHiveMetrics {
    healthyHiveIndex: number;
    weatherNormalizedFlightScore: number;
    colonyStrengthScore: number;
    broodHealthScore: number;
    queenStrengthScore: number;
    deploymentReadiness: 'hold' | 'watch' | 'deploy';
    recommendation: string;
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
    const predictedFruitSetPercent = clamp(Math.round(32 + (ratio * 42) + (bloom * 10) + (forage * 8) - (weatherRisk * 11)), 18, 96);
    const projectedYieldLiftPercent = Number(clamp(((predictedFruitSetPercent - 48) * 0.62), 0, 32).toFixed(1));
    const normalizedFlightHours = Number(clamp((4.5 + (bloom * 2.2) + (forage * 1.8) + (ratio * 1.4) - (weatherRisk * 3.2)), 1.5, 11.5).toFixed(1));

    const hivesRequired = avgFramesPerHive > 0
        ? Math.max(1, Math.ceil(totalFramesRequired / avgFramesPerHive))
        : 0;
    const saturationRisk: 'low' | 'balanced' | 'high' = ratio > 1.22 ? 'high' : ratio < 0.9 ? 'low' : 'balanced';
    const recommendedHivesLow = Math.max(1, Math.floor(hivesRequired * 0.95));
    const recommendedHivesHigh = Math.max(recommendedHivesLow, Math.ceil(hivesRequired * 1.15));
    const coverageGapFrames = Math.max(0, Math.round(totalFramesRequired - effectiveFrames));
    const coverageGapHives = avgFramesPerHive > 0 ? Math.ceil(coverageGapFrames / avgFramesPerHive) : 0;
    const readinessScore = clamp(Math.round((ratio * 45) + (bloom * 20) + (forage * 18) + ((1 - weatherRisk) * 17)), 0, 100);
    const marginalGainPerHive = Number(((avgFramesPerHive * bloomMultiplier * forageMultiplier * weatherMultiplier) / Math.max(acres, 1)).toFixed(2));

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
        predictedFruitSetPercent,
        projectedYieldLiftPercent,
        normalizedFlightHours,
        recommendation,
        hivesRequired,
        totalFramesRequired: Math.round(totalFramesRequired),
        recommendedHivesLow,
        recommendedHivesHigh,
        saturationRisk,
        coverageGapFrames,
        coverageGapHives,
        readinessScore,
        marginalGainPerHive,
    };
};

export const calculateHealthyHiveIndex = (inputs: HealthyHiveInputs): HealthyHiveMetrics => {
    const orientationFactor = {
        east: 1.08,
        south: 1.04,
        west: 0.93,
        north: 0.96,
    }[inputs.orientation];

    const queenStrengthScore = clamp(Math.round(clamp(inputs.queenPresenceScore, 0, 1) * 100), 0, 100);
    const colonyStrengthScore = clamp(
        Math.round((inputs.colonyFrames / 10) * 100),
        10,
        100
    );
    const broodHealthScore = clamp(
        Math.round((inputs.broodFrames / 6) * 100),
        10,
        100
    );
    const weatherNormalizedFlightScore = clamp(
        Math.round((inputs.weeklyFlightHours / 42) * 100 * clamp(inputs.weatherQuality, 0.3, 1.1) * orientationFactor),
        0,
        100
    );
    const healthyHiveIndex = clamp(
        Math.round(colonyStrengthScore * 0.35 + broodHealthScore * 0.25 + queenStrengthScore * 0.2 + weatherNormalizedFlightScore * 0.2),
        0,
        100
    );

    const deploymentReadiness: HealthyHiveMetrics['deploymentReadiness'] = healthyHiveIndex >= 82
        ? 'deploy'
        : healthyHiveIndex < 60
            ? 'hold'
            : 'watch';
    const recommendation = deploymentReadiness === 'deploy'
        ? 'Deployment ready. Prioritize this hive for premium pollination contracts.'
        : deploymentReadiness === 'hold'
            ? 'Hold back from premium pollination. Improve brood pattern and confirm queen strength first.'
            : 'Colony is workable, but keep brood and flight hours under review.';

    return {
        healthyHiveIndex,
        weatherNormalizedFlightScore,
        colonyStrengthScore,
        broodHealthScore,
        queenStrengthScore,
        deploymentReadiness,
        recommendation,
    };
};
