
export interface CalculationInputs {
    totalAcres: number;
    hives: {
        frameCount: number;
        isStrong: boolean; // Based on activity/sound metrics
        isLarge: boolean;  // Based on box size/volume
    }[];
    forageCondition: number; // 0.0 to 1.0 (multiplier)
    bloomIntensity: number;  // 0.0 to 1.0 (multiplier)
}

export interface PollinationMetrics {
    totalFrames: number;
    effectiveFrames: number;
    framesPerAcre: number;
    effectiveFPA: number;
    pollinationEfficacy: number; // 0-100%
    recommendation: string;
}

/**
 * Calculates frames per acre with adjustments for colony strength and environmental factors.
 * Strong colonies have a non-linear benefit (more foragers per frame).
 * Environmental factors like forage competition and bloom intensity affect the 'work capacity'.
 */
export const calculatePollinationMetrics = (inputs: CalculationInputs): PollinationMetrics => {
    const { totalAcres, hives, forageCondition, bloomIntensity } = inputs;

    if (totalAcres <= 0) {
        return {
            totalFrames: 0,
            effectiveFrames: 0,
            framesPerAcre: 0,
            effectiveFPA: 0,
            pollinationEfficacy: 0,
            recommendation: "Acres must be greater than zero."
        };
    }

    let totalFrames = 0;
    let effectiveFrames = 0;

    hives.forEach(hive => {
        totalFrames += hive.frameCount;

        // Strength multipliers
        // Strong colonies have 30% more foraging force per frame than split colonies (as per bee math)
        const strengthMultiplier = hive.isStrong ? 1.3 : 0.8;

        // Size multipliers
        // Large colonies (multi-box) have better thermal regulation and more reserves
        const sizeMultiplier = hive.isLarge ? 1.1 : 0.9;

        effectiveFrames += hive.frameCount * strengthMultiplier * sizeMultiplier;
    });

    // Environmental adjustment
    // High bloom intensity makes pollination easier (more targets), 
    // but poor forage condition (lack of water/nectar elsewhere) can drive more focus or less depending on crop attractiveness.
    const environmentalFactor = forageCondition * bloomIntensity;
    const finalEffectiveFrames = effectiveFrames * (0.8 + (environmentalFactor * 0.4)); // Range ~0.8 to 1.2

    const fpa = totalFrames / totalAcres;
    const effectiveFPA = finalEffectiveFrames / totalAcres;

    // Standard target is often 8-10 FPA for almond pollination, etc.
    const pollEfficacy = Math.min(100, (effectiveFPA / 10) * 100);

    const recommendation =
        pollEfficacy < 60
            ? "CRITICAL: Insufficient frames for target area. Deploy 30% more colonies."
            : pollEfficacy < 85
                ? "WARNING: Optimal window narrow. Consider supplemental feeding to boost activity."
                : "OPTIMAL: Colony density sufficient for full seed set.";

    return {
        totalFrames,
        effectiveFrames: Math.round(effectiveFrames * 10) / 10,
        framesPerAcre: Math.round(fpa * 10) / 10,
        effectiveFPA: Math.round(effectiveFPA * 10) / 10,
        pollinationEfficacy: Math.round(pollEfficacy),
        recommendation
    };
};
