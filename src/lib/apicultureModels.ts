/**
 * BeeYield Apiculture Models
 * Standard calculations for precision pollination.
 * 
 * "Frames Per Acre" (FPA) is the authoritative metric for pollination density.
 */

export interface CropProfile {
    name: string;
    minFPA: number;
    recommendedFPA: number;
    maxFPA: number;
    description: string;
}

export const CROP_PROFILES: Record<string, CropProfile> = {
    'Almonds': {
        name: 'Almonds',
        minFPA: 12,
        recommendedFPA: 18,
        maxFPA: 24,
        description: 'Requires high density for synchronized bloom window.'
    },
    'Apples': {
        name: 'Apples',
        minFPA: 6,
        recommendedFPA: 10,
        maxFPA: 14,
        description: 'Moderate density sufficient for cross-pollination.'
    },
    'Blueberries': {
        name: 'Blueberries',
        minFPA: 10,
        recommendedFPA: 14,
        maxFPA: 20,
        description: 'High activity required for buzz-pollination efficiency.'
    },
    'Cherries': {
        name: 'Cherries',
        minFPA: 8,
        recommendedFPA: 12,
        maxFPA: 16,
        description: 'Sensitive to temperature-dependent flight hours.'
    },
    'Avocados': {
        name: 'Avocados',
        minFPA: 10,
        recommendedFPA: 15,
        maxFPA: 22,
        description: 'Complex flowering cycle requires sustained saturation.'
    },
    'Macadamias': {
        name: 'Macadamias',
        minFPA: 8,
        recommendedFPA: 12,
        maxFPA: 18,
        description: 'Focus on internal hive traffic and weight delta.'
    }
};

/**
 * Calculates the required hives for a target FPA.
 */
export function calculateRequiredHives(acreage: number, targetFPA: number, avgFramesPerHive: number): number {
    if (avgFramesPerHive <= 0) return 0;
    return (acreage * targetFPA) / avgFramesPerHive;
}

/**
 * Calculates current FPA based on deployment.
 */
export function calculateCurrentFPA(hiveCount: number, avgFramesPerHive: number, acreage: number): number {
    if (acreage <= 0) return 0;
    return (hiveCount * avgFramesPerHive) / acreage;
}

/**
 * Probability of successful pollination set based on FPA and external factors.
 */
export function calculateSuccessProbability(
    currentFPA: number,
    targetFPA: number,
    weatherFactor: number = 1.0, // 0.0 to 1.0 (1.0 = ideal)
    bloomIntensity: number = 1.0   // 0.0 to 1.0
): number {
    if (targetFPA <= 0) return 100;
    
    // Saturation curve (asymptotic)
    const ratio = currentFPA / targetFPA;
    const baseProb = (1 - Math.exp(-2.5 * ratio)) * 100;
    
    // Adjust by weather and bloom
    const finalProb = baseProb * weatherFactor * bloomIntensity;
    
    return Math.min(100, Math.max(0, finalProb));
}

/**
 * Estimates the "Pollination Delta" - how much yield is lost due to under-pollination.
 */
export function estimateYieldLoss(successProb: number): number {
    if (successProb >= 90) return 0;
    // Linear regression approximation for yield loss below saturation
    return (90 - successProb) * 0.8; 
}

/**
 * Spatial Coverage Integral (Simplistic Kernel)
 * Estimates coverage at a point (x, y) from a source (sx, sy) with decay
 */
export function calculatePointCoverage(x: number, y: number, sources: Array<{x: number, y: number, power: number}>, radius: number): number {
    let total = 0;
    for (const s of sources) {
        const dist = Math.sqrt(Math.pow(x - s.x, 2) + Math.pow(y - s.y, 2));
        if (dist < radius) {
            // Exponential decay kernel
            total += s.power * Math.exp(-(dist / (radius * 0.5)));
        }
    }
    return Math.min(1.0, total);
}
