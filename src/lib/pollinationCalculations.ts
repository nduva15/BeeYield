export interface CalculationInputs {
    totalAcres: number;
    targetFpa: number; // e.g. 12-16
    averageFramesPerHive: number; // e.g. 8 or 10
}

export interface PollinationMetrics {
    totalFramesRequired: number;
    hivesRequired: number;
}

export const calculatePollinationMetrics = (inputs: CalculationInputs): PollinationMetrics => {
    const { totalAcres, targetFpa, averageFramesPerHive } = inputs;
    
    if (totalAcres <= 0 || targetFpa <= 0) {
        return { totalFramesRequired: 0, hivesRequired: 0 };
    }

    const totalFramesRequired = totalAcres * targetFpa;
    const hivesRequired = Math.ceil(totalFramesRequired / Math.max(1, averageFramesPerHive));

    return {
        totalFramesRequired: Math.round(totalFramesRequired),
        hivesRequired
    };
};

