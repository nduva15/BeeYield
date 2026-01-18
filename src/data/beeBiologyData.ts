export interface BeeBiologyDetail {
    topic: string;
    description: string;
    details: string;
    importance: string;
    technicalNotes: string;
    references?: string[];
}

export const beeBiologyData: Record<string, BeeBiologyDetail> = {
    "Compound Eyes": {
        topic: "Visual System (Compound Eyes)",
        description: "Bees have two large compound eyes that dominate the head.",
        details: "Each eye is composed of thousands of individual lenses called ommatidia. These lenses allow bees to detect motion with incredible precision and see ultraviolet light, which helps them identify nectar-rich flowers.",
        importance: "Critical for navigation, foraging, and predator avoidance.",
        technicalNotes: "BeeYield's 'UV-FlowerView' cameras simulate bee vision to help farmers identify which crops are most attractive to pollinators in real-time."
    },
    "Ocelli": {
        topic: "Simple Eyes (Ocelli)",
        description: "Three small simple eyes located in a triangle on the top of the head.",
        details: "These eyes do not form images but are highly sensitive to light intensity. They help bees maintain stability during flight by detecting the horizon and solar position even on cloudy days.",
        importance: "Navigation and flight stability.",
        technicalNotes: "Arranged in a triangle called the ocellar triangle; connects directly to the brain for rapid processing."
    },
    "Proboscis": {
        topic: "Feeding Apparatus (Proboscis)",
        description: "The elongated sucking mouthpart used for ingesting liquids.",
        details: "It acts like a straw to suck up nectar, water, and honey. When not in use, it is folded back under the head. It consists of the glossa (tongue), labial palps, and galeae.",
        importance: "Nectar collection and food exchange (trophallaxis).",
        technicalNotes: "Length varies by species: A. m. caucasia has the longest tongue among mellifera subspecies (up to 7.2mm)."
    },
    "Antennae": {
        topic: "Sensory Hub (Antennae)",
        description: "The primary sensory organs for smell, touch, and communication.",
        details: "Covered in thousands of sensory receptors (sensilla) that detect pheromones, carbon dioxide, humidity, and vibrations. They are also used for touch-based communication within the hive.",
        importance: "Pheromone detection and social coordination.",
        technicalNotes: "BeeYield's 'E-Antenna' sensors detect CO2 and humidity fluctuations at the same sensitivity level as a live bee, allowing for sub-second health alerts."
    },
    "Stinger": {
        topic: "Defense Mechanism (Stinger)",
        description: "A modified ovipositor used for defense.",
        details: "Worker bees have barbed stingers that remain in mammal skin, causing the bee to die after stinging. Queens have smooth stingers used primarily for killing rival queens. Drones have no stinger.",
        importance: "Colony protection.",
        technicalNotes: "Venom (apitoxin) contains melittin, apamin, and phospholipase A2. The stinger has its own ganglion to continue pumping venom after detachment."
    },
    "Wax Glands": {
        topic: "Hive Construction (Wax Glands)",
        description: "Abdominal glands that secrete liquid wax.",
        details: "Four pairs of glands located on the underside of the worker bee's abdomen. Liquid wax hardens into small flakes when exposed to air. Bees must consume ~8 lbs of honey to produce 1 lb of wax.",
        importance: "Building honeycomb and capping cells.",
        technicalNotes: "Most active in bees 12-18 days old; activity decreases as they transition to foraging."
    },
    "Nasonov Gland": {
        topic: "Orientation Pheromones (Nasonov Gland)",
        description: "A gland located on the back of the abdomen used to emit orientation pheromones.",
        details: "Bees 'fan' their wings with their abdomen raised to release the scent. It smells like lemon/lemongrass and guides lost bees or swarms back to the entrance.",
        importance: "Navigation and swarm cohesion.",
        technicalNotes: "BeeYield's AI detects the specific acoustic 'whir' of Nasonov fanning, alerting beekeepers to potential orientation issues or incoming swarms."
    },
    "Pollen Baskets (Corbiculae)": {
        topic: "Foraging Tools (Pollen Baskets)",
        description: "Specialized structures on the hind legs for carrying pollen.",
        details: "Workers use stiff hairs (the pollen comb) to brush pollen into a concave area on the tibia. They moisten the pollen with nectar to make it stick as a 'pollen load'.",
        importance: "Protein collection for brood rearing.",
        technicalNotes: "Only found in female worker bees; absent in queens and drones."
    },
    "Castes: Worker": {
        topic: "Social Structure: Worker Bee",
        description: "Infertile females that perform all hive tasks.",
        details: "Tasks change with age (polyethism): cleaning, nursing, wax building, guarding, and finally foraging. They live 6 weeks in summer, or up to 6 months in winter.",
        importance: "Foundation of colony labor and productivity.",
        technicalNotes: "Haplodiploid genetics (32 chromosomes); develop from fertilized eggs."
    },
    "Castes: Queen": {
        topic: "Social Structure: Queen Bee",
        description: "The only fertile female in the colony and the mother of all bees.",
        details: "She can lay up to 2,000 eggs per day. She is fed exclusively royal jelly throughout her life. She produces QMP (Queen Mandibular Pheromone) to suppress worker ovary development.",
        importance: "Reproduction and colony harmony.",
        technicalNotes: "Lives 2-5 years; mates with 10-20 drones during a single mating flight period."
    },
    "Castes: Drone": {
        topic: "Social Structure: Drone Bee",
        description: "The male bees of the colony.",
        details: "Drones have no stinger, no pollen baskets, and no wax glands. Their sole purpose is to mate with a virgin queen in Drone Congregation Areas (DCAs). They are evicted from the hive in winter to save resources.",
        importance: "Genetic diversity and mating.",
        technicalNotes: "Develop from unfertilized eggs (parthenogenesis); have 16 chromosomes."
    },
    "Life Cycle: Egg": {
        topic: "Development: Egg Stage",
        description: "The first stage of bee development.",
        details: "The queen lays a tiny white egg in a cell. It looks like a grain of rice. The egg stands upright on day 1, tilts on day 2, and lies flat on day 3 before hatching.",
        importance: "Start of a new generation.",
        technicalNotes: "Duration: Exactly 3 days for all three castes."
    },
    "Life Cycle: Larva": {
        topic: "Development: Larval Stage",
        description: "The rapid-growth feeding stage.",
        details: "Larvae are fed by nurse bees. Worker larvae are fed royal jelly for 3 days, then 'bee bread'. Queen larvae receive royal jelly exclusively. Weight increases over 1,500x in this stage.",
        importance: "Critical growth phase.",
        technicalNotes: "Duration: 5-6 days. Five molts (instars) occur during this time."
    },
    "Life Cycle: Pupa": {
        topic: "Development: Pupal Stage",
        description: "The stage of metamorphosis.",
        details: "The cell is capped with wax. Inside, the larva spins a cocoon and transforms into an adult bee. Tissues are reorganized; legs, wings, and eyes develop.",
        importance: "Transformation into adult form.",
        technicalNotes: "Duration: 12 days for workers, 15 days for drones, 7 days for queens."
    },
    "Waggle Dance": {
        topic: "Communication: Waggle Dance",
        description: "A complex dance used to communicate the location of distant food sources.",
        details: "The angle of the 'waggle run' relative to the sun (gravity on the vertical comb) indicates direction. The duration of the waggle indicates distance (1 second = ~1km).",
        importance: "Efficient resource harvesting.",
        technicalNotes: "BeeYield AI decodes waggle dances via high-speed entrance cameras to provide farmers with a live 'Foraging Heatmap' of the surrounding 5 miles.",
        references: ["https://en.wikipedia.org/wiki/Waggle_dance", "https://news.harvard.edu/honeybee-dance"]
    },
    "Honey Production": {
        topic: "Apiculture: Honey Making",
        description: "The process of converting nectar into honey.",
        details: "Bees add enzymes (invertase) to nectar during trophallaxis. It is stored in cells and fanned with wings to reduce moisture content below 18%. Cells are then capped with wax.",
        importance: "Winter food storage and human harvest.",
        technicalNotes: "Nectar is ~80% water; honey is ~17-18% water. Bees visit 2 million flowers to make 1 lb of honey.",
        references: ["https://fao.org/honey-production-guide", "https://honey.com/how-honey-is-made"]
    },
    "Thermoregulation": {
        topic: "Biology: Temperature Control",
        description: "How bees maintain a constant hive temperature.",
        details: "Brood must be kept at ~35°C (95°F). In winter, bees form a cluster and vibrate flight muscles to generate heat. In summer, they fan the entrance and bring in water for evaporative cooling.",
        importance: "Brood survival and wintering.",
        technicalNotes: "BeeYield Omni-Nodes™ provide thermal stability alerts within 0.1°C, predicting 'Cluster-Break' events weeks before they result in colony loss."
    },
    "Propolis": {
        topic: "Materials: Bee Glue",
        description: "A resinous mixture collected from tree buds used as a sealant.",
        details: "Bees use it to seal small gaps, reinforce hive structures, and mummify intruders too large to remove (like mice). It has strong antimicrobial and antifungal properties.",
        importance: "Hive hygiene and structural integrity.",
        technicalNotes: "Components: 50% resins, 30% wax, 10% essential oils, 5% pollen."
    },
    "Bee Bread": {
        topic: "Nutrition: Fermented Pollen",
        description: "A mixture of pollen and nectar/honey fermented by lactic acid bacteria.",
        details: "Raw pollen is difficult for bees to digest. They pack it into cells with enzymes and honey, where it ferments. This process makes the proteins and nutrients bioavailable.",
        importance: "Primary protein source for bees and brood.",
        technicalNotes: "Preserves pollen for long periods without spoilage."
    }
};
