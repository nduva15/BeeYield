export interface PollinationDetail {
    cropName: string;
    beeDependence: string;
    optimalHivesPerAcre: string;
    targetFPA: number;
    beeyieldAdvantage: string;
    regionalTrends2026: string;
    economicImpact: string;
    image: string;
}

export const beePollinationData: Record<string, PollinationDetail> = {
    "Maize": {
        cropName: "Maize",
        beeDependence: "Low (Pollen Collection)",
        optimalHivesPerAcre: "0.5 - 1.0 Hives",
        targetFPA: 8,
        beeyieldAdvantage: "While wind-pollinated, BeeYield monitors ensure bees collect high-protein maize pollen during gaps in other blooms, maintaining colony strength for subsequent crops.",
        regionalTrends2026: "Precision planting requires synchronized pest management, which BeeYield's sensors detect via acoustic anomalies.",
        economicImpact: "A staple food security crop; healthy pollinator populations in maize fields support surrounding biodiversity.",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600"
    },
    "Sunflower": {
        cropName: "Sunflower",
        beeDependence: "100% (High)",
        optimalHivesPerAcre: "1.5 - 2.5 Hives",
        targetFPA: 16,
        beeyieldAdvantage: "BeeYield's 'Flora-Sync' ensures hives are active during the critical morning window when sunflower pollen is most viable.",
        regionalTrends2026: "Expansion of sunflower for oil production in Arid regions requires robust, drought-tolerant pollinator management.",
        economicImpact: "Seed set is directly correlated to bee visits; adequate pollination can double oil yield per acre.",
        image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=600"
    },
    "Mangoes": {
        cropName: "Mangoes",
        beeDependence: "High (Yield & Quality)",
        optimalHivesPerAcre: "2.0 - 4.0 Hives",
        targetFPA: 24,
        beeyieldAdvantage: "Our specific hive placement strategy encourages both bee and dipteran (fly) pollination, which is crucial for mango fruit set.",
        regionalTrends2026: "Export-quality mangoes require uniform pollination to prevent early fruit drop, a key metric tracked by BeeYield.",
        economicImpact: "Proper pollination increases fruit retention and size, directly boosting export revenues.",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600"
    },

    "Avocados": {
        cropName: "Avocados",
        beeDependence: "High (Cross-Pollination)",
        optimalHivesPerAcre: "2.0 - 4.0 Hives",
        targetFPA: 32,
        beeyieldAdvantage: "We map A and B flower type opening times to ensure bee activity overlaps perfectly with female stage receptivity.",
        regionalTrends2026: "Booming export demand requires intensive pollination management to maximize fruit set per tree.",
        economicImpact: "Critical for preventing 'cukes' (seedless fruit) and ensuring market-standard sizes.",
        image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=600"
    },
    "Beans": {
        cropName: "Beans",
        beeDependence: "Medium (Yield Stability)",
        optimalHivesPerAcre: "1.0 - 1.5 Hives",
        targetFPA: 12,
        beeyieldAdvantage: "BeeYield's sensors track foraging intensity to ensure consistent pod set across the entire field.",
        regionalTrends2026: " shift towards high-value export varieties necessitates reliable pollination services.",
        economicImpact: "Increases pod fill and seed quality, essential for both consumption and seed production.",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600"
    },
    "Oranges": {
        cropName: "Oranges",
        beeDependence: "Medium to High",
        optimalHivesPerAcre: "1.5 - 2.5 Hives",
        targetFPA: 20,
        beeyieldAdvantage: "We manage hive strength to prevent over-pollination in seedless varieties while ensuring max set for juice varieties.",
        regionalTrends2026: "Citrus greening resilience is bolstered by strong ecosystem services, including pollination.",
        economicImpact: "Improves fruit weight and juice content per hectare.",
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=600"
    },
    "Tomatoes": {
        cropName: "Tomatoes",
        beeDependence: "High (Buzz Pollination)",
        optimalHivesPerAcre: "Specialized Management",
        targetFPA: 12,
        beeyieldAdvantage: "BeeYield enables precise monitoring of bumblebee colony health for greenhouse tomato production.",
        regionalTrends2026: "Greenhouse automation integration with biological pollinators is the future of intensive farming.",
        economicImpact: "Essential for fruit set in enclosed environments; directly determines yield per square meter.",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600"
    },
    "Onions": {
        cropName: "Onions",
        beeDependence: "100% (Seed Production)",
        optimalHivesPerAcre: "4.0 - 6.0 Hives",
        targetFPA: 48,
        beeyieldAdvantage: "Our high-density hive placement overcomes the natural unattractiveness of onion flowers to ensure full seed set.",
        regionalTrends2026: "Rising demand for hybrid onion seed requires technical pollination mastery.",
        economicImpact: "The primary factor determining seed yield; unpollinated flowers produce no seed.",
        image: "/images/onion-plantation.png"
    },
    "Sisal": {
        cropName: "Sisal",
        beeDependence: "Low (Ecological Support)",
        optimalHivesPerAcre: "Ecological Placement",
        targetFPA: 4,
        beeyieldAdvantage: "Sisal poles provide critical forage during dearth periods, which BeeYield maps to maintain year-round apiary health.",
        regionalTrends2026: "Sustainable fiber production is increasingly valued, with pollinators playing a key ecosystem role.",
        economicImpact: "Supports the biodiversity necessary for sustainable large-scale plantation management.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600"
    },
    "Vegetables": {
        cropName: "Vegetables (Misc)",
        beeDependence: "Variable (High)",
        optimalHivesPerAcre: "2.0 - 3.0 Hives",
        targetFPA: 16,
        beeyieldAdvantage: "Adaptive hive mobility allows BeeYield to service short-bloom vegetable crops efficiently.",
        regionalTrends2026: "Peri-urban vegetable farming growth demands mobile, intelligent pollination solutions.",
        economicImpact: "Crucial for fruit-vegetables like squash, peppers, and cucumbers.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"
    }
};

export const globalPollinationTrends2026 = {
    "Precision Pollinationâ„¢": "A market segment created by BeeYield, where IoT sensors and AI ensure exactly the right amount of pollination for every square meter of farm.",
    "Pollinator Depletion Reserve": "BeeYield's initiative to create 'Safe Zones' around industrial farms, restoring 2,500+ trees per region to support wild bee populations.",
    "Pollination-as-a-Service (PaaS)": "By 2026, PaaS is the primary model for commercial beekeeping, with BeeYield's platform acting as the global marketplace for farmers and beekeepers."
};
