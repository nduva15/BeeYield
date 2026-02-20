/**
 * Custom hook for specialized beekeeping calculations.
 * Centralizes math for feeding, health thresholds, and economic margins.
 */
export const useBeekeepingMath = () => {

    // --- Feeding Calculations ---

    const calculateSyrup = (targetVolumeL: number, ratio: '1:1' | '2:1') => {
        // approx density for sugar syrup: 1:1 is ~1.23 kg/L, 2:1 is ~1.33 kg/L
        // Basic ratio: 1:1 is 1kg sugar + 1L water = ~1.6L syrup
        // 2:1 is 2kg sugar + 1L water = ~2.2L syrup

        let sugarKg = 0;
        let waterL = 0;

        if (ratio === '1:1') {
            // 1kg sugar + 1L water ≈ 1.63L
            sugarKg = (targetVolumeL / 1.63);
            waterL = sugarKg;
        } else {
            // 2kg sugar + 1L water ≈ 2.26L
            const parts = targetVolumeL / 2.26;
            sugarKg = parts * 2;
            waterL = parts;
        }

        return {
            sugarKg: Number(sugarKg.toFixed(2)),
            waterL: Number(waterL.toFixed(2))
        };
    };

    const calculateWinterDeficit = (currentWeight: number, targetWeight: number) => {
        const deficit = Math.max(0, targetWeight - currentWeight);
        // 1.1kg of 2:1 syrup adds roughly 1kg of winter stores (after evaporation)
        const syrupNeeded = deficit * 1.1;
        return {
            deficitKg: Number(deficit.toFixed(2)),
            syrupNeededL: Number((syrupNeeded / 1.33).toFixed(2)) // converting kg to L at 2:1
        };
    };

    // --- Health & Treatment ---

    const getVarroaInfestation = (miteCount: number, beeCount: number = 300) => {
        const percentage = (miteCount / beeCount) * 100;
        let status: 'safe' | 'warning' | 'critical' = 'safe';

        // standard thresholds
        if (percentage >= 3) status = 'critical';
        else if (percentage >= 1) status = 'warning';

        return {
            percentage: Number(percentage.toFixed(1)),
            status
        };
    };

    // --- Logistics & Equipment ---

    const calculateBOM = (colonyCount: number, spareFactor: number = 0.1) => {
        const total = Math.ceil(colonyCount * (1 + spareFactor));
        return {
            deepBoxes: total,
            supers: total * 2, // assume 2 supers per hive
            framesPerHive: 10,
            totalFrames: total * 30, // 1 deep + 2 supers = 30 frames
            foundations: total * 30
        };
    };

    const calculateHarvestSupplies = (honeyWeightKg: number, jarSizeMl: number) => {
        // approx density of honey: 1.4kg/L
        const volumeL = honeyWeightKg / 1.4;
        const totalMl = volumeL * 1000;
        const jarsNeeded = Math.ceil(totalMl / jarSizeMl);

        return {
            jars: jarsNeeded,
            labels: Math.ceil(jarsNeeded * 1.05) // 5% extra for mistakes
        };
    };

    // --- Economics ---

    const calculateHoneyMargin = (
        costs: { labor: number; fuel: number; medicine: number; equipment: number },
        yieldKg: number
    ) => {
        const totalCost = costs.labor + costs.fuel + costs.medicine + costs.equipment;
        const costPerKg = yieldKg > 0 ? totalCost / yieldKg : 0;

        return {
            totalCost,
            costPerKg: Number(costPerKg.toFixed(2))
        };
    };

    const calculateHikingROI = (
        projectedYieldKg: number,
        marketPricePerKg: number,
        transportCosts: number,
        hiveCount: number
    ) => {
        const totalRevenue = projectedYieldKg * marketPricePerKg;
        const netProfit = totalRevenue - transportCosts;
        const profitPerHive = hiveCount > 0 ? netProfit / hiveCount : 0;
        const isWorthIt = netProfit > (totalRevenue * 0.2); // arbitray 20% margin threshold

        return {
            totalRevenue,
            netProfit,
            profitPerHive,
            isWorthIt
        };
    };

    return {
        calculateSyrup,
        calculateWinterDeficit,
        getVarroaInfestation,
        calculateBOM,
        calculateHarvestSupplies,
        calculateHoneyMargin,
        calculateHikingROI
    };
};
