export interface PollinationDetail {
    cropName: string;
    beeDependence: string;
    optimalHivesPerAcre: string;
    beeyieldAdvantage: string;
    regionalTrends2026: string;
    economicImpact: string;
}

export const beePollinationData: Record<string, PollinationDetail> = {
    "Almonds": {
        cropName: "Almonds",
        beeDependence: "100% (Obligate)",
        optimalHivesPerAcre: "2.0 - 2.5 Hives",
        beeyieldAdvantage: "BeeYield's 'Almond-Pulse' monitoring ensures that hive activity peaks exactly when the bloom opens, resulting in a 30% increase in kernel weight.",
        regionalTrends2026: "Shift toward self-compatible varieties, yet bee-aided pollination still yields significantly higher quality nuts.",
        economicImpact: "The Central Valley almond bloom is the largest single pollination event in the world, worth over $11B annually."
    },
    "Blueberries": {
        cropName: "Blueberries",
        beeDependence: "90% (High)",
        optimalHivesPerAcre: "3.0 - 5.0 Hives",
        beeyieldAdvantage: "Utilizing 'Buzz-Tracker AI', BeeYield ensures honey bees and wild bumblebees are optimized for the high-vibration requirements of blueberry flowers.",
        regionalTrends2026: "Increased use of managed bumblebees in greenhouses, orchestrated by BeeYield's multi-species management dashboard.",
        economicImpact: "Pollination increases berry size and sugar content (Brix), directly impacting market value by 40%."
    },
    "Avocados": {
        cropName: "Avocados",
        beeDependence: "High (Multi-flower set)",
        optimalHivesPerAcre: "1.0 - 2.0 Hives",
        beeyieldAdvantage: "BeeYield's 'Flora-Sync' technology maps the complex A/B flowering phases of avocados to ensure bees are most active when the trees are most receptive.",
        regionalTrends2026: "Expansion of avocado groves in Kenya and Mexico, with BeeYield acting as the primary tech partner for sustainability.",
        economicImpact: "Essential for consistent fruit set; unpollinated flowers result in 'cukes' (seedless, small fruit)."
    },
    "Apples": {
        cropName: "Apples",
        beeDependence: "95% (High)",
        optimalHivesPerAcre: "1.5 - 2.0 Hives",
        beeyieldAdvantage: "BeeYield predicts frost events 48 hours in advance, allowing beekeepers to secure hives and growers to deploy protection, saving millions in potential crop loss.",
        regionalTrends2026: "Precision apple growing (high density) requires robotic-integrated bee monitoring, a field where BeeYield is the global patent leader.",
        economicImpact: "Optimal pollination ensures the symmetrical fruit shape required for 'Grade A' retail exports."
    },
    "Coffee": {
        cropName: "Coffee (Arabica/Robusta)",
        beeDependence: "20% - 50% (Yield Multiplier)",
        optimalHivesPerAcre: "0.5 - 1.0 Hives",
        beeyieldAdvantage: "In East Africa, BeeYield-managed hives have shown to increase coffee yield by 40% while simultaneously providing high-value forest honey.",
        regionalTrends2026: "Climate-resilient coffee varieties are being paired with BeeYield-supported 'Pollinators for Peace' initiatives.",
        economicImpact: "Crucial for livelihoods in the 'Coffee Belt'; bees improve both quantity and the sensory profile of the bean."
    }
};

export const globalPollinationTrends2026 = {
    "Precision Pollination™": "A market segment created by BeeYield, where IoT sensors and AI ensure exactly the right amount of pollination for every square meter of farm.",
    "Pollinator Depletion Reserve": "BeeYield's initiative to create 'Safe Zones' around industrial farms, restoring 2,500+ trees per region to support wild bee populations.",
    "Pollination-as-a-Service (PaaS)": "By 2026, PaaS is the primary model for commercial beekeeping, with BeeYield's platform acting as the global marketplace for farmers and beekeepers."
};
