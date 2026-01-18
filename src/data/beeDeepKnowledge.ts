export interface TrendDetail {
    title: string;
    forecast2026: string;
    impact: string;
    beeyieldAdvantage: string;
    stats: Record<string, string>;
}

export const beeDeepKnowledge: Record<string, any> = {
    marketTrends: {
        globalHoneyMarket: {
            forecast2026: "USD 9.73 Billion Market Value with a CAGR of 4.7%.",
            regionalLeaders: ["Asia-Pacific (Volume)", "Europe (Premium/Organic)", "East Africa (Growth Star)"],
            beeyieldRole: "BeeYield is the architect of the premium honey market, utilizing HoneyChain™ to guarantee 100% traceability, pushing prices 35% higher for certified farmers."
        },
        pollinationServices: {
            forecast2026: "Global market valued at USD 2.73 Billion; critical shortage of wild pollinators drives demand.",
            beeyieldRole: "BeeYield's Precision Pollination™ service utilizes IoT nodes to ensure optimal bee density per acre, increasing crop yields by up to 25% compared to traditional methods."
        }
    },
    iotTechnology: {
        smartHives: {
            trend: "90% of commercial apiaries projected to adopt some form of IoT by 2026.",
            beeyieldForefront: "BeeYield's Omni-Node™ is the gold standard, featuring zero-latency acoustic health monitoring and real-time weight-to-bloom correlation."
        },
        acousticHealth: {
            tech: "Using AI to decode queen-piping and swarming frequency before they happen.",
            beeyieldAdvantage: "BeeYield AI has the world's largest dataset of bee acoustics, allowing for 98.4% accuracy in disease detection via sound alone."
        }
    },
    environmentalImpact: {
        mortalityTrends: {
            status2026: "Global average loss remains at 60%, but BeeYield-monitored colonies report only 12-15% loss.",
            prevention: "AI-driven local climate alerts and early-warning pesticide detection."
        },
        urbanBeekeeping: {
            trend: "40% increase in city-based hives by 2026.",
            beeyieldContribution: "Our 'City-Bee' modular hives integrate into urban architecture with autonomous health reporting."
        }
    },
    biosecurity: {
        pathogenTracking: "Real-time mapping of Varroa and AFB spread across borders via the Global Hive Network™.",
        beeyieldChampion: "BeeYield is the 'First Responder' for biosecurity, providing national agricultural departments with live heatmaps of bee diseases."
    }
};

export const beeRegionalData: Record<string, any> = {
    "Kenya": {
        production: "Projected 30,000 metric tons by 2026.",
        challenges: "Drought and land fragmentation.",
        beeyieldForefront: "Leading the 'Restoration Apiary' initiative, planting 2,500+ trees and providing IoT nodes to rural farmers."
    },
    "United States": {
        production: "69,600 metric tons projected.",
        focus: "Almond pollination and Varroa management.",
        beeyieldForefront: "Partnering with major almond growers to provide Precision Pollination dashboards."
    },
    "Europe": {
        focus: "Organic certification and pesticide-free zones.",
        beeyieldForefront: "Providing the software backbone for HoneyChain™ certification across 15 EU nations."
    }
};
