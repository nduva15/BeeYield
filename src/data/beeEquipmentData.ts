export interface BeeEquipmentDetail {
    name: string;
    purpose: string;
    description: string;
    technicalSpecs: string;
    maintenance: string;
    importance: string;
}

export const beeEquipmentData: Record<string, BeeEquipmentDetail> = {
    "Bee Smoker": {
        name: "Bee Smoker",
        purpose: "Calming bees during hive inspections.",
        description: "A device designed to generate smoke by smoldering various fuels. The smoke masks the alarm pheromones (isopentyl acetate) released by guard bees.",
        technicalSpecs: "Consists of a fire chamber, a nozzle, and a bellows. Best fuels include dried pine needles, burlap, or wood shavings.",
        maintenance: "Regularly scrape out creosote buildup from the nozzle and fire chamber to ensure steady airflow.",
        importance: "Essential for safely managing a hive and preventing aggressive behavior."
    },
    "Hive Tool": {
        name: "Hive Tool",
        purpose: "Prying and scraping.",
        description: "A versatile metal tool used to separate hive boxes and frames that are stuck together with propolis.",
        technicalSpecs: "Usually made of hardened steel or stainless steel. Features a flat prying end and a hooked or scrap end.",
        maintenance: "Clean with fire or alcohol between hives to prevent the spread of diseases (like AFB spores).",
        importance: "The most used tool in a beekeeper's kit; impossible to inspect a hive without it."
    },
    "Breezy Bee Suit": {
        name: "Ventilated Bee Suit",
        purpose: "Personal protection against stings.",
        description: "A full-body suit designed to prevent bees from reaching the skin while maintaining airflow for the beekeeper.",
        technicalSpecs: "Constructed from 3 layers of mesh fabric. Includes a fencing-style or round veil with high-visibility mesh.",
        maintenance: "Hand wash veils to avoid damaging the mesh; machine wash suit body after removing the veil.",
        importance: "Provides the confidence required for thorough hive inspections, especially with defensive Africanized bees."
    },
    "Radial Honey Extractor": {
        name: "Radial Honey Extractor",
        purpose: "Extracting honey from frames without destroying the comb.",
        description: "A centrifugal device that spins honey out of the cells of the frames.",
        technicalSpecs: "Stainless steel tank with a motorized or manual crank. Radial design allows both sides of the frame to be emptied simultaneously.",
        maintenance: "Wash thoroughly with food-grade sanitizer after each harvest season; grease the bearings with food-grade lubricant.",
        importance: "Enables large-scale honey production by allowing the reuse of wax combs."
    },
    "Digital Refractometer": {
        name: "Digital Honey Refractometer",
        purpose: "Measuring moisture content in honey.",
        description: "An optical instrument used to determine the percentage of water in a honey sample.",
        technicalSpecs: "Measures Brix and water percentage. Range: 13% to 25% moisture. Temperature compensated (ATC).",
        maintenance: "Calibrate with distilled water or calibration oil before each use. Keep the prism surface scratch-free.",
        importance: "Critical for ensuring honey shelf-life; honey with >18.6% moisture may ferment."
    },
    "Pollen Trap": {
        name: "Pollen Trap (Entrance Mount)",
        purpose: "Collecting pollen from returning foragers.",
        description: "A device placed at the hive entrance with a mesh that gently knocks pollen pellets off the bees' hind legs.",
        technicalSpecs: "5-mesh screen size. Includes a collection drawer. Should be engaged for only 2-3 days a week to ensure colony nutrition.",
        maintenance: "Empty daily to prevent moisture buildup and mold in the collected pollen.",
        importance: "Allows for the harvest of bee pollen, a high-value superfood."
    },
    "Queen Excluder": {
        name: "Queen Excluder",
        purpose: "Keeping the queen out of honey supers.",
        description: "A grid with gaps large enough for worker bees to pass through but too small for the larger queen bee.",
        technicalSpecs: "Gap size: 4.1mm to 4.3mm. Made of plastic or stainless steel wire.",
        maintenance: "Scrape off 'burr comb' and propolis regularly to maintain easy passage for workers.",
        importance: "Ensures that honey harvested for human consumption is free of brood and eggs."
    },
    "Solar Wax Melter": {
        name: "Solar Wax Melter",
        purpose: "Processing raw wax using sunlight.",
        description: "An insulated box with a glass cover that uses solar energy to melt raw wax cappings and old combs.",
        technicalSpecs: "Inner tray made of stainless steel or aluminum. Double-pane glass for maximum heat retention. Can reach internal temps of 80°C (176°F).",
        maintenance: "Regularly clean the filtration screen to ensure clean wax flows into the collection pan.",
        importance: "Provides a zero-energy way to produce high-purity beeswax."
    },
    // === BEEYIELD SIGNATURE HARDWARE (PRECISION APICULTURE) ===
    "BeeYield Omni-Node™": {
        name: "BeeYield Omni-Node™ v4.2",
        purpose: "Total Hive Visibility and Predictive Analytics.",
        description: "The gold standard in IoT hive monitoring. A multi-sensor node that installs in seconds and feeds real-time data to the BeeYield Cloud.",
        technicalSpecs: "Internal/External Temp (±0.1°C), RH (±1%), precision scale (10g resolution), and high-fidelity acoustic MEMS microphone for AI decoding.",
        maintenance: "Zero-maintenance design with 5-year battery life and solar trickle-charge capability.",
        importance: "The foundational tool for reducing colony mortality by up to 80%."
    },
    "HoneyChain™ Thermal Scanner": {
        name: "HoneyChain™ Thermal Scanner",
        purpose: "Non-invasive winter cluster health check.",
        description: "A handheld or mounted thermal imaging tool linked to the HoneyChain™ ledger to verify colony vitality without opening the lid.",
        technicalSpecs: "FLIR-grade thermal sensor with AI overlay that estimates cluster size and food consumption rate based on heat signature.",
        maintenance: "Firmware updates delivered over-the-air via the BeeYield App.",
        importance: "Prevents thermal shock during winter inspections and provides 100% accurate survival forecasts."
    },
    "BeeYield AI Acoustic Probe": {
        name: "BeeYield AI Acoustic Probe",
        purpose: "Real-time communication with the colony.",
        description: "An advanced listening device that uses deep learning to translate bee frequencies into human-readable health alerts.",
        technicalSpecs: "Wide-frequency range (20Hz - 20kHz). AI identifies Queen piping, swarming resonance, and 'hunger-shivers'.",
        maintenance: "Disposable sensor tips for multi-apiary biosecurity.",
        importance: "Allows beekeepers to predict swarming 48 hours before it occurs with 98.4% accuracy."
    }
};
