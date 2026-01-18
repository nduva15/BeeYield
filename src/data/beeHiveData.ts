export interface BeeHiveDetail {
    type: string;
    architecture: string;
    origin: string;
    pros: string[];
    cons: string[];
    technicalSpecs: string;
    managmentStyle: string;
}

export const beeHiveData: Record<string, BeeHiveDetail> = {
    "Langstroth Hive": {
        type: "Langstroth (Vertical Stack)",
        architecture: "Standardized boxes with 8 or 10 movable frames. Uses the concept of 'Bee Space' (6-9mm).",
        origin: "USA (Rev. Lorenzo Langstroth, 1851)",
        pros: ["Maximum honey production", "Standardized parts", "Easy to transport", "Centrifugal extraction"],
        cons: ["Heavy lifting required", "Expensive initial setup", "Less natural for bees"],
        technicalSpecs: "Deep body (9 5/8\"), Medium super (6 5/8\"), Shallow super (5 11/16\"). Frame size matches box depth.",
        managmentStyle: "Intensive. Requires frequent rotations, adding/removing supers, and swarm control."
    },
    "Kenyan Top Bar Hive (KTBH)": {
        type: "Kenyan Top Bar (Horizontal)",
        architecture: "A long, trough-shaped box with sloped sides. Bees build natural comb hanging from top bars.",
        origin: "Kenya (Developed for low-cost, effective beekeeping)",
        pros: ["No heavy lifting", "Low cost", "Produces more wax", "Promotes natural comb"],
        cons: ["Lower honey yield", "Fragile combs", "Non-standard extraction (crush and strain)"],
        technicalSpecs: "Sloped sides at 60 degrees. Width: ~90cm to 120cm. Top bar width: exactly 35mm to maintain bee space.",
        managmentStyle: "Hands-off. Ideal for hobbyists and small-scale farmers in Africa."
    },
    "Warré Hive": {
        type: "Warré (The People's Hive)",
        architecture: "Vertical stack of small square boxes with top bars. New boxes are added to the bottom (nadiring).",
        origin: "France (Émile Warré, 1948)",
        pros: ["Minimal intervention", "Excellent thermoregulation", "Natural comb building"],
        cons: ["Lower production", "Difficulty inspecting lower boxes", "Custom equipment"],
        technicalSpecs: "Box dimensions: 300mm x 300mm x 210mm. Uses a 'quilt' top for insulation and moisture control.",
        managmentStyle: "Nature-centric. Hives are opened only once a year for harvest."
    },
    "Flow Hive": {
        type: "Flow Hive (Modified Langstroth)",
        architecture: "Uses proprietary 'Flow Frames' with partially formed plastic cells that split to release honey.",
        origin: "Australia (Anderson family, 2015)",
        pros: ["Harvest without opening the hive", "Less disturbance for bees", "Easy for beginners"],
        cons: ["Very expensive", "Plastic-heavy", "Beekeepers may skip essential health checks"],
        technicalSpecs: "Standard Langstroth footprint. Compatible with existing Langstroth brood chambers.",
        managmentStyle: "Hobbyist. Still requires standard brood inspections for mites and diseases."
    },
    "Traditional Log Hive": {
        type: "Traditional Log Hive",
        architecture: "A hollowed-out log, often suspended from trees. Sealed with mud or wood at the ends.",
        origin: "Global / Ancient (Common in rural Kenya)",
        pros: ["Zero cost", "Superior insulation", "Protects from predators"],
        cons: ["Impossible to inspect", "Honey harvest kills some bees", "Low yield"],
        technicalSpecs: "Varies by tree species (Cedar/Podo). Length: 1-1.5m. Entrance holes bored into the side.",
        managmentStyle: "Traditional. Harvesting involves high-smoke and often night-time operations."
    },
    "Apimaye Insulated Hive": {
        type: "Apimaye (Plastic Insulated)",
        architecture: "Double-walled UV-resistant plastic with high-density foam insulation.",
        origin: "Turkey",
        pros: ["Superior winter/summer insulation", "Extremely durable", "Built-in feeding systems"],
        cons: ["Very expensive", "High environmental footprint", "Heavy"],
        technicalSpecs: "R-value of ~6.0. Includes built-in pollen traps and screened bottom boards.",
        managmentStyle: "Professional/Climate-focused. Ideal for areas with extreme temperature fluctuations."
    }
};
