export interface PollinationDetail {
    cropName: string;
    beeDependence: string;
    dependencyPercent: number;
    optimalHivesPerAcre: string;
    targetFPA: number;
    beeyieldAdvantage: string;
    regionalTrends2026: string;
    economicImpact: string;
    estimatedMarketValueUsdBn?: number;
    image: string;
}

export const beePollinationData: Record<string, PollinationDetail> = {
    "Maize": {
        cropName: "Maize",
        beeDependence: "Low (Pollen Collection)",
        dependencyPercent: 20,
        optimalHivesPerAcre: "0.5 - 1.0 Hives",
        targetFPA: 8,
        beeyieldAdvantage: "While wind-pollinated, BeeYield monitors ensure bees collect high-protein maize pollen during gaps in other blooms, maintaining colony strength for subsequent crops.",
        regionalTrends2026: "Precision planting requires synchronized pest management, which BeeYield's sensors detect via acoustic anomalies.",
        economicImpact: "A staple food security crop; healthy pollinator populations in maize fields support surrounding biodiversity.",
        estimatedMarketValueUsdBn: 3.2,
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600"
    },
    "Sunflower": {
        cropName: "Sunflower",
        beeDependence: "100% (High)",
        dependencyPercent: 100,
        optimalHivesPerAcre: "1.5 - 2.5 Hives",
        targetFPA: 16,
        beeyieldAdvantage: "BeeYield's 'Flora-Sync' ensures hives are active during the critical morning window when sunflower pollen is most viable.",
        regionalTrends2026: "Expansion of sunflower for oil production in Arid regions requires robust, drought-tolerant pollinator management.",
        economicImpact: "Seed set is directly correlated to bee visits; adequate pollination can double oil yield per acre.",
        estimatedMarketValueUsdBn: 2.4,
        image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=600"
    },
    "Mangoes": {
        cropName: "Mangoes",
        beeDependence: "High (Yield & Quality)",
        dependencyPercent: 90,
        optimalHivesPerAcre: "2.0 - 4.0 Hives",
        targetFPA: 24,
        beeyieldAdvantage: "Our specific hive placement strategy encourages both bee and dipteran (fly) pollination, which is crucial for mango fruit set.",
        regionalTrends2026: "Export-quality mangoes require uniform pollination to prevent early fruit drop, a key metric tracked by BeeYield.",
        economicImpact: "Proper pollination increases fruit retention and size, directly boosting export revenues.",
        estimatedMarketValueUsdBn: 4.6,
        image: "/images/pollination/mango-panicles-close-bloom.png"
    },

    "Avocados": {
        cropName: "Avocados",
        beeDependence: "High (Cross-Pollination)",
        dependencyPercent: 85,
        optimalHivesPerAcre: "2.0 - 4.0 Hives",
        targetFPA: 32,
        beeyieldAdvantage: "We map A and B flower type opening times to ensure bee activity overlaps perfectly with female stage receptivity.",
        regionalTrends2026: "Booming export demand requires intensive pollination management to maximize fruit set per tree.",
        economicImpact: "Critical for preventing 'cukes' (seedless fruit) and ensuring market-standard sizes.",
        estimatedMarketValueUsdBn: 5.1,
        image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=600"
    },
    "Beans": {
        cropName: "Beans",
        beeDependence: "Medium (Yield Stability)",
        dependencyPercent: 60,
        optimalHivesPerAcre: "1.0 - 1.5 Hives",
        targetFPA: 12,
        beeyieldAdvantage: "BeeYield's sensors track foraging intensity to ensure consistent pod set across the entire field.",
        regionalTrends2026: " shift towards high-value export varieties necessitates reliable pollination services.",
        economicImpact: "Increases pod fill and seed quality, essential for both consumption and seed production.",
        estimatedMarketValueUsdBn: 1.8,
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600"
    },
    "Oranges": {
        cropName: "Oranges",
        beeDependence: "Medium to High",
        dependencyPercent: 70,
        optimalHivesPerAcre: "1.5 - 2.5 Hives",
        targetFPA: 20,
        beeyieldAdvantage: "We manage hive strength to prevent over-pollination in seedless varieties while ensuring max set for juice varieties.",
        regionalTrends2026: "Citrus greening resilience is bolstered by strong ecosystem services, including pollination.",
        economicImpact: "Improves fruit weight and juice content per hectare.",
        estimatedMarketValueUsdBn: 2.2,
        image: "/images/pollination/orange-tree-citrus-fruits.jpg"
    },
    "Tomatoes": {
        cropName: "Tomatoes",
        beeDependence: "High (Buzz Pollination)",
        dependencyPercent: 75,
        optimalHivesPerAcre: "Specialized Management",
        targetFPA: 12,
        beeyieldAdvantage: "BeeYield enables precise monitoring of bumblebee colony health for greenhouse tomato production.",
        regionalTrends2026: "Greenhouse automation integration with biological pollinators is the future of intensive farming.",
        economicImpact: "Essential for fruit set in enclosed environments; directly determines yield per square meter.",
        estimatedMarketValueUsdBn: 2.9,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600"
    },
    "Onions": {
        cropName: "Onions",
        beeDependence: "100% (Seed Production)",
        dependencyPercent: 100,
        optimalHivesPerAcre: "4.0 - 6.0 Hives",
        targetFPA: 48,
        beeyieldAdvantage: "Our high-density hive placement overcomes the natural unattractiveness of onion flowers to ensure full seed set.",
        regionalTrends2026: "Rising demand for hybrid onion seed requires technical pollination mastery.",
        economicImpact: "The primary factor determining seed yield; unpollinated flowers produce no seed.",
        estimatedMarketValueUsdBn: 1.4,
        image: "/images/onion-plantation.png"
    },
    "Sisal": {
        cropName: "Sisal",
        beeDependence: "Low (Ecological Support)",
        dependencyPercent: 15,
        optimalHivesPerAcre: "Ecological Placement",
        targetFPA: 4,
        beeyieldAdvantage: "Sisal poles provide critical forage during dearth periods, which BeeYield maps to maintain year-round apiary health.",
        regionalTrends2026: "Sustainable fiber production is increasingly valued, with pollinators playing a key ecosystem role.",
        economicImpact: "Supports the biodiversity necessary for sustainable large-scale plantation management.",
        estimatedMarketValueUsdBn: 0.8,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600"
    }
};

export const DASHBOARD_POLLINATION_CROPS = [
    "Maize",
    "Sunflower",
    "Mangoes",
    "Avocados",
    "Beans",
    "Oranges",
    "Tomatoes",
    "Onions",
    "Sisal",
] as const;

export const dashboardPollinationCropNames = [...DASHBOARD_POLLINATION_CROPS];

export const dashboardPollinationCropDetails = DASHBOARD_POLLINATION_CROPS.map(
    (name) => beePollinationData[name]
);

export const globalPollinationTrends2026 = {
    "Precision Pollination™": "A market segment created by BeeYield, where IoT sensors and advanced algorithms ensure exactly the right amount of pollination for every square meter of farm.",
    "Pollinator Depletion Reserve": "BeeYield's initiative to create 'Safe Zones' around industrial farms, restoring 2,500+ trees per region to support wild bee populations.",
    "Pollination-as-a-Service (PaaS)": "By 2026, PaaS is the primary model for commercial beekeeping, with BeeYield's platform acting as the global marketplace for farmers and beekeepers."
};
