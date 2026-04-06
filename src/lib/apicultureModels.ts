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
    'Maize': {
        name: 'Maize',
        minFPA: 4,
        recommendedFPA: 8,
        maxFPA: 12,
        description: 'Low bee dependency, but useful for pollen collection and colony support.'
    },
    'Sunflower': {
        name: 'Sunflower',
        minFPA: 12,
        recommendedFPA: 16,
        maxFPA: 24,
        description: 'Needs strong morning forage overlap for seed set and oil yield.'
    },
    'Mangoes': {
        name: 'Mangoes',
        minFPA: 16,
        recommendedFPA: 24,
        maxFPA: 32,
        description: 'Requires consistent pollinator pressure to reduce fruit drop and lift quality.'
    },
    'Avocados': {
        name: 'Avocados',
        minFPA: 20,
        recommendedFPA: 32,
        maxFPA: 40,
        description: 'Complex flowering cycle requires sustained saturation.'
    },
    'Beans': {
        name: 'Beans',
        minFPA: 8,
        recommendedFPA: 12,
        maxFPA: 18,
        description: 'Medium dependency crop where stable bee traffic improves pod fill and seed quality.'
    },
    'Oranges': {
        name: 'Oranges',
        minFPA: 8,
        recommendedFPA: 20,
        maxFPA: 28,
        description: 'Citrus bloom benefits from steady colony strength and balanced saturation.'
    },
    'Tomatoes': {
        name: 'Tomatoes',
        minFPA: 8,
        recommendedFPA: 12,
        maxFPA: 18,
        description: 'Buzz-pollination crop that needs healthy colonies and precise deployment timing.'
    },
    'Onions': {
        name: 'Onions',
        minFPA: 32,
        recommendedFPA: 48,
        maxFPA: 60,
        description: 'Very high pollination density is needed for strong onion seed production.'
    },
    'Sisal': {
        name: 'Sisal',
        minFPA: 2,
        recommendedFPA: 4,
        maxFPA: 8,
        description: 'Lower direct dependency crop that still supports ecosystem-level forage planning.'
    },
};

export type ColonyGrade = 'Grade A' | 'Grade B' | 'Grade C';

export interface RequiredHivesInput {
    cropType: string;
    acreage: number;
    colonyGrade: ColonyGrade;
    treesPerAcre: number;
}

export interface RequiredHivesResult {
    targetFPA: number;
    requiredHives: number;
    probability: number;
}

/**
 * Calculates the required hives for a target FPA.
 */
export function calculateRequiredHives(input: RequiredHivesInput): RequiredHivesResult {
    const profile = CROP_PROFILES[input.cropType] || CROP_PROFILES['Maize'];
    const targetFPA = profile.recommendedFPA;
    const framesPerHive = input.colonyGrade === 'Grade A' ? 12 : input.colonyGrade === 'Grade B' ? 8 : 6;
    const requiredHives = Math.ceil((input.acreage * targetFPA) / framesPerHive);
    
    // Simple probability based on density
    const probability = Math.min(0.98, (requiredHives / input.acreage) * 0.1);

    return {
        targetFPA,
        requiredHives,
        probability
    };
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
