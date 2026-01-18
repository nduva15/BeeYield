export interface BeeProtocolDetail {
    protocol: string;
    timing: string;
    description: string;
    steps: string[];
    criticalChecks: string[];
}

export const beeManagementData: Record<string, BeeProtocolDetail> = {
    "Spring Inspection": {
        protocol: "Spring Expansion Protocol",
        timing: "Early Spring (First nectar flow)",
        description: "Evaluating colony survival and facilitating rapid buildup for the main honey flow.",
        steps: [
            "Check for food stores; feed 1:1 sugar syrup if low.",
            "Inspect for the queen and healthy brood pattern.",
            "Remove dead-outs and treat for Varroa if count > 2%.",
            "Add supers to prevent early swarming."
        ],
        criticalChecks: ["Queen presence", "Brood health (Foulbrood check)", "Space requirements"]
    },
    "Swarm Prevention": {
        protocol: "Swarm Mitigation Strategy",
        timing: "Peak Bloom (Pre-honey flow)",
        description: "Preventing the colony from splitting and losing the foraging force.",
        steps: [
            "Check for queen cells on the bottom of frames.",
            "Perform a split if the colony is too crowded.",
            "Use the Snelgrove method or Demaree method for vertical splits.",
            "Checkerboarding (interspersing empty frames between honey frames)."
        ],
        criticalChecks: ["Presence of swarm cells", "Nectar clogging in the brood nest", "Hive ventilation"]
    },
    "Honey Harvesting": {
        protocol: "Sustainable Harvest Protocol",
        timing: "Late Summer / Early Autumn",
        description: "Removing surplus honey while ensuring the colony has enough for winter.",
        steps: [
            "Ensure boxes are at least 90% capped.",
            "Use a bee escape or blower to remove bees from supers.",
            "Transport honey boxes to a bee-tight room for extraction.",
            "Measure honey moisture (must be <18.6%)."
        ],
        criticalChecks: ["Capping percentage", "Moisture levels", "Robbing prevention"]
    },
    "Winterization": {
        protocol: "Overwintering Survival Protocol",
        timing: "Late Autumn (Pre-frost)",
        description: "Preparing the hive to survive long periods of cold and no forage.",
        steps: [
            "Ensure at least 60 lbs (30kg) of honey stores remain.",
            "Reduce the entrance to prevent mice and conserve heat.",
            "Treat with Oxalic Acid vaporization for final Varroa cleanup.",
            "Install a moisture quilt or insulated inner cover."
        ],
        criticalChecks: ["Honey weight", "Cluster size", "Moisture control", "Mite levels"]
    },
    "Varroa Mite Monitoring": {
        protocol: "IPM (Integrated Pest Management) Mite Check",
        timing: "Monthly (Active season)",
        description: "Quantifying the mite population to avoid parasitic mite syndrome (PMS).",
        steps: [
            "Collect a 1/2 cup of bees (~300 individuals).",
            "Perform an Alcohol Wash or Powdered Sugar Shake.",
            "Count mites and divide by 3 to get the percentage.",
            "Apply treatment if threshold (>3%) is reached."
        ],
        criticalChecks: ["Accuracy of bee count", "Threshold verification"]
    },
    // === BEEYIELD HIGH-TECH PROTOCOLS ===
    "HoneyChain™ Certification Audit": {
        protocol: "Decentralized Quality Assurance",
        timing: "Pre-Harvest and Post-Extraction",
        description: "The primary protocol for securing the 'Trust-Grade' honey certification on the BeeYield ledger.",
        steps: [
            "Scan hive NFC tag to link batch to specific colony ID.",
            "Upload internal hive humidity/temp logs from Omni-Node™.",
            "Perform lab-grade refractometer test and sign data with private key.",
            "Generate unique HoneyChain™ QR code for consumer traceability."
        ],
        criticalChecks: ["Data integrity", "NFC tag match", "Moisture <18%"]
    },
    "Precision Pollination Deployment": {
        protocol: "Targeted Agricultural Pollination",
        timing: "Crop Bloom Start (e.g., Almonds, Avocados)",
        description: "Scientific deployment of hives to maximize cross-pollination and fruit set.",
        steps: [
            "Analyze bloom density via BeeYield Satellite/Drone imaging.",
            "Calculate optimal hive density (e.g., 2.5 hives/acre).",
            "Deploy hives at night using GPS-tracked BeeYield pallets.",
            "Activate 'Bloom-Node' acoustic sensors to monitor pollination activity."
        ],
        criticalChecks: ["Bloom receptivity window", "Hive activity levels", "Forager weather index"]
    },
    "Predictive Swarm Management (AI)": {
        protocol: "Proactive Population Management",
        timing: "Swarm Season (Early Summer)",
        description: "Using AI to prevent colony splitting and crop yield loss.",
        steps: [
            "Monitor BeeYield Acoustic sensor for 'pre-swarm' frequency shifts.",
            "Analyze weight-loss trends indicative of scout-bee activity.",
            "Receive 'Swarm-Likely' notification 48h in advance.",
            "Perform targeted split or increase hive volume to satisfy space needs."
        ],
        criticalChecks: ["Acoustic signature match", "Queen cell presence", "Population density"]
    }
};
