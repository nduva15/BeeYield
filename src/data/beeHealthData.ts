export interface SymptomDetail {
    scientificName?: string;
    causes?: string;
    signs: string;
    symptoms: string;
    detection: string;
    treatment: string;
    management?: string;
    cureStatus?: string;
    prevention: string;
    transmission: string;
    hostSpecies?: string[];
    riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    steps: string[];
    references?: string[];
}

export const beeHealthData: Record<string, SymptomDetail> = {
    // === BACTERIAL DISEASES ===
    "American Foulbrood (AFB)": {
        scientificName: "Paenibacillus larvae",
        causes: "Spore-forming bacterial infection that blooms when contaminated honey, comb, or robbing behavior exposes young larvae to Paenibacillus larvae spores.",
        signs: "Sunken, dark, perforated cappings; 'pupal tongue' protruding from remains.",
        symptoms: "Larvae turn coffee-brown and ropy; distinct 'foul' decayed-fish odor.",
        detection: "Rope Test; Holst Milk Test; EFD Diagnostic Kits.",
        treatment: "Incineration of bees and equipment; scorching non-combustibles.",
        management: "Treat as a notifiable emergency: quarantine the yard, stop moving equipment, destroy infected brood material, and sanitize all reusable tools before touching healthy colonies.",
        cureStatus: "No field cure once brood is heavily infected; containment and destruction are the standard control pathway.",
        prevention: "Inspect brood often; sterilize hive tools between colonies; avoid exchanging contaminated comb or honey; use hygienic queens and isolate suspect equipment immediately.",
        transmission: "Robbing; drifting; contaminated equipment.",
        hostSpecies: ["Apis mellifera", "Apis cerana"],
        riskLevel: "CRITICAL",
        steps: ["Execute Rope Test", "Contact apiary inspector", "Incinerate infected frames"]
    },
    "European Foulbrood (EFB)": {
        scientificName: "Melissococcus plutonius",
        causes: "Bacterial brood disease favored by nutritional stress, chilled brood cycles, and colonies that cannot keep nurse bees ahead of larval feeding demand.",
        signs: "Twisted, yellow/brown larvae coiled in 'C' shape; die before capping.",
        symptoms: "Melted/rubbery larvae; sour/yeasty smell; spotty brood pattern.",
        detection: "Visual inspection of coiled larvae; potash test.",
        treatment: "Re-queening; Shook Swarm; Terramycin (in some regions).",
        management: "Relieve nutritional stress fast, narrow brood space if colonies are weak, remove badly affected comb, and requeen colonies that fail to recover brood pattern.",
        cureStatus: "Often recoverable with nutrition, sanitation, and queen improvement when caught early.",
        prevention: "Maintain strong spring nutrition; avoid prolonged brood chilling; replace dark comb; reduce stress during dearth and requeen weak colonies quickly.",
        transmission: "Nurse bees; trophallaxis; contaminated pollen.",
        hostSpecies: ["Apis mellifera", "Apis cerana"],
        riskLevel: "HIGH",
        steps: ["Identify twisted yellow larvae", "Feed syrup", "Re-queen"]
    },
    "Parafoulbrood": {
        scientificName: "Bacillus para-alvei",
        signs: "Variable symptoms; larvae may die at various stages; localized in specific regions.",
        symptoms: "Putrid odor; larvae darkened or slightly reddish.",
        detection: "Laboratory culturing.",
        treatment: "Sanitize equipment; re-queen.",
        prevention: "Maintain colony vigor; apiary sanitation.",
        transmission: "Fecal-oral; contaminated tools.",
        riskLevel: "MEDIUM",
        steps: ["Capture larvae sample", "Place in quarantine", "Sanitize tools"]
    },
    "Powdery Brood": {
        scientificName: "Bacillus pulvifaciens",
        signs: "Dry, powdery, light-brown larval remains; scales do not stick.",
        symptoms: "Larvae collapse and dehydrate; minimal odor.",
        detection: "Microscopic ID of spores.",
        treatment: "Self-resolving; re-queen if persistent.",
        prevention: "Select for VSH behavior.",
        transmission: "Nurse bees; shared water.",
        riskLevel: "LOW",
        steps: ["Remove infected frames", "Boost with protein patties"]
    },
    "Chronic Serratia Infection": {
        scientificName: "Serratia marcescens",
        signs: "Reddish tint to dead bees; often occurs in high Varroa hives.",
        symptoms: "Septicemia; rapid adult death.",
        detection: "Lab culture (red colonies).",
        treatment: "Varroa control; antibiotic syrup (rarely used).",
        prevention: "Maintain low Varroa count.",
        transmission: "Varroa wounds.",
        riskLevel: "HIGH",
        steps: ["Treat for Varroa", "Cycle old frames"]
    },

    // === FUNGAL DISEASES ===
    "Chalkbrood": {
        scientificName: "Ascosphaera apis",
        causes: "Fungal spores germinate when brood stays cool and damp, especially in weak colonies, shaded apiaries, or hives with poor airflow.",
        signs: "Hard, white/grey 'mummies' on bottom board; cotton-like growth in cells.",
        symptoms: "Larvae harden into blocks; reduced adult population.",
        detection: "Visual 'mummy' identification.",
        treatment: "Strengthen colony; improve ventilation; remove infected frames.",
        prevention: "Keep hives dry and well ventilated; favor sunny apiary placement; tilt boxes forward for drainage; rotate out damp comb and requeen weak stock.",
        transmission: "Spores carried by workers; shared water.",
        riskLevel: "MEDIUM",
        steps: ["Scrape bottom board", "Improve ventilation", "Tilt hive forward"]
    },
    "Stonebrood": {
        scientificName: "Aspergillus flavus",
        signs: "Rock-hard, greenish-yellow mummies; death of larvae and adults.",
        symptoms: "Paralysis in adults; zoonotic risk (human lung irritation).",
        detection: "Visual stonework larvae; conidiophore microscopy.",
        treatment: "Incinerate severe infections; improve drainage; max ventilation.",
        prevention: "Avoid damp/shaded sites; elevate hives.",
        transmission: "Airborne spores; moldy pollen.",
        riskLevel: "HIGH",
        steps: ["Wear a mask", "Incinerate frames", "Move to full sun"]
    },
    "Nosema apis (Classic)": {
        scientificName: "Nosema apis",
        signs: "Dysentery (brown streaks) on hive face; bees crawling; disjointed wings.",
        symptoms: "Digestive tract destruction; winter collapse; queen supersedure.",
        detection: "Spore count microscopy.",
        treatment: "Fumagillin-B (where legal); Nosevit; frame rotation.",
        prevention: "Clean water; high-quality winter stores.",
        transmission: "Fecal-oral; contaminated water.",
        riskLevel: "HIGH",
        steps: ["Sample 30 foragers", "Add upper entrance", "Replace frames"]
    },
    "Nosema ceranae (Disappearing)": {
        scientificName: "Nosema ceranae",
        causes: "Microsporidian infection spreads through contaminated feces, water, and drifting bees, then worsens under pesticide pressure and chronic nutritional stress.",
        signs: "No dysentery; quiet dwindling; foragers 'disappear' away from hive.",
        symptoms: "Chronic intestinal damage; suppressed immune system.",
        detection: "PCR testing; quantitative microscopy.",
        treatment: "Keep colonies strong; probiotic supplements.",
        management: "Reduce every avoidable stressor at once: improve forage, keep colonies dry, replace old comb, and prevent drifting and feed competition between yards.",
        cureStatus: "Manageable but rarely 'cured' outright; the goal is suppression and colony resilience.",
        prevention: "Provide diverse forage and clean water; reduce pesticide exposure; avoid damp wintering conditions; replace old comb and prevent drifting between colonies.",
        transmission: "Queen trade; drifting; shared waterers.",
        hostSpecies: ["Apis mellifera", "Apis cerana", "Apis dorsata"],
        riskLevel: "CRITICAL",
        steps: ["PCR test", "Protein supplements", "Limit stress"]
    },

    // === VIRAL DISEASES ===
    "Deformed Wing Virus (DWV)": {
        scientificName: "DWV-A/B",
        causes: "Virus amplification follows unmanaged Varroa infestations, which inject DWV directly into developing brood and adult bees.",
        signs: "Emerging bees with shriveled wings; truncated abdomens.",
        symptoms: "Inability to fly; shortened lifestyle; population crash.",
        detection: "Observation; RT-PCR.",
        treatment: "Aggressive Varroa suppression.",
        management: "Use repeated mite counts before and after treatment, break brood when needed, and requeen from hygienic stock if colonies show persistent deformed brood emergence.",
        cureStatus: "No direct antiviral cure; control depends on keeping mite pressure low enough for colonies to recover.",
        prevention: "Keep Varroa below action thresholds all season; monitor with alcohol washes; rotate mite treatments; favor hygienic/VSH stock and avoid collapsing donor colonies.",
        transmission: "Varroa destructor (vector); vertical.",
        hostSpecies: ["Apis mellifera", "Apis cerana", "Apis laboriosa"],
        riskLevel: "CRITICAL",
        steps: ["Alcohol Wash", "Miticide treatment", "Re-test count"]
    },
    "Black Queen Cell Virus (BQCV)": {
        scientificName: "Black Queen Cell Virus",
        signs: "Queen cells turn dark; larvae look pale/oily.",
        symptoms: "Death of queen prepupae; linked to Nosema.",
        detection: "Visual of cells; PCR.",
        treatment: "Control Nosema; re-queen; sanitize gear.",
        prevention: "Spring Nosema management; frame rotation.",
        transmission: "Nurse bees; contaminated royal jelly.",
        riskLevel: "MEDIUM",
        steps: ["Destroy black cells", "Treat Nosema", "Sanitize tools"]
    },
    "Chronic Bee Paralysis (CBPV)": {
        scientificName: "CBPV",
        signs: "Shiny, hairless, black bees; trembling/shaking.",
        symptoms: "Guard bees attacking hairless workers; crawling death.",
        detection: "Visual of greasy bees; qPCR.",
        treatment: "Add supers to reduce crowding; re-queen.",
        prevention: "Avoid over-crowding; max ventilation.",
        transmission: "Direct contact; fecal-oral.",
        riskLevel: "HIGH",
        steps: ["Add honey supers", "Clear bottom board", "Replace queen"]
    },
    "Acute Bee Paralysis (ABPV)": {
        scientificName: "ABPV",
        signs: "Sudden massive die-off; sub-clinical until Varroa spikes.",
        symptoms: "Rapid paralysis and death in adults.",
        detection: "Lab analysis; Varroa correlation.",
        treatment: "Urgent Varroa control; nutritional support.",
        prevention: "Low Varroa levels; protein availability.",
        transmission: "Vectored by Varroa.",
        riskLevel: "HIGH",
        steps: ["Emergency miticide", "Feed 2:1 syrup", "Check for pesticides"]
    },
    "Israeli Acute Paralysis (IAPV)": {
        scientificName: "IAPV",
        signs: "Bees shivering; falling off frames; population collapse.",
        symptoms: "Nervous twitching; CCD correlation.",
        detection: "Genomic markers via PCR.",
        treatment: "Boost immune system; re-queen; mite control.",
        prevention: "Minimize migratory stress; disease-free queens.",
        transmission: "Varroa; trophallaxis; pollen.",
        riskLevel: "CRITICAL",
        steps: ["Isolate apiary", "Identify Varroa level", "Supplement feed"]
    },
    "Sacbrood Virus (SBV)": {
        scientificName: "SBV",
        signs: "Larvae die in upright sac; pointed head; fluid filled.",
        symptoms: "Failure to pupate; uncapping of fluid larvae.",
        detection: "Visual fluid sac; PCR.",
        treatment: "Self-resolving; break brood cycle.",
        prevention: "Cycle old wax; hygienic selection.",
        transmission: "Nurse bees; ingestion.",
        riskLevel: "LOW",
        steps: ["Remove infected frames", "Stimulate with syrup"]
    },
    "Kashmir Bee Virus (KBV)": {
        scientificName: "KBV",
        signs: "Hyper-acute mortality; sudden adult death.",
        symptoms: "Metabolic shutdown; synergistic with Varroa.",
        detection: "ELISA; RT-PCR.",
        treatment: "Mite control; minimize stress.",
        prevention: "IPM rotation.",
        transmission: "Varroa; vertical.",
        riskLevel: "HIGH",
        steps: ["Monitor mites", "Improve foraging"]
    },
    "Cloudy Wing Virus (CWV)": {
        scientificName: "CWV",
        signs: "Opaque wings; inability to fly.",
        symptoms: "Reduced flight capacity; foragers lost.",
        detection: "Microscopy; Sequencing.",
        treatment: "No cure; hygiene focus.",
        prevention: "Genetic selection.",
        transmission: "Aerosol; drifting.",
        riskLevel: "MEDIUM",
        steps: ["Inspect flight", "Improve ventilation"]
    },
    "Slow Bee Paralysis Virus (SbpV)": {
        scientificName: "SbpV",
        signs: "Adults trembling; falling off combs.",
        symptoms: "Partial leg paralysis; death in 10 days.",
        detection: "Lab analysis.",
        treatment: "Control primary pathogens.",
        prevention: "Frame rotation.",
        transmission: "Varroa destructor.",
        riskLevel: "HIGH",
        steps: ["Check Varroa", "Insulate hive"]
    },
    "Lake Sinai Virus (LSV)": {
        scientificName: "LSV",
        signs: "Asymptomatic; general dwindling; poor performance.",
        symptoms: "Shortened lifespan; immune fatigue.",
        detection: "RT-PCR.",
        treatment: "Nutritional diversity.",
        prevention: "Clean water; minimize transport.",
        transmission: "Shared flowers; pollen.",
        riskLevel: "MEDIUM",
        steps: ["Diverse protein", "Monitor weight"]
    },
    "Big Sioux River Virus (BSRV)": {
        scientificName: "BSRV",
        signs: "Common in Midwest US; linked to winter loss.",
        symptoms: "Metabolic stress; larval dwindle.",
        detection: "Molecular PCR.",
        treatment: "Nutritional support.",
        prevention: "Floral diversity.",
        transmission: "Pollen; trophallaxis.",
        riskLevel: "LOW",
        steps: ["Check winter stores", "Improve diversity"]
    },
    "Kakugo Virus (KV)": {
        scientificName: "Kakugo Virus",
        signs: "Aggressive behavior in foragers; guard bees hyper-active.",
        symptoms: "Neuro-behavioral shift; reduced hive productivity.",
        detection: "Brain tissue RT-PCR.",
        treatment: "Re-queen; minimize chemical stress.",
        prevention: "Selection for gentleness.",
        transmission: "Nurse interaction; Varroa.",
        riskLevel: "MEDIUM",
        steps: ["Identify aggressive hives", "Re-queen"]
    },
    "Apis mellifera filamentous virus (AmFV)": {
        scientificName: "AmFV",
        signs: "Milk-white hemolymph in adults.",
        symptoms: "Impaired immunity; secondary infections.",
        detection: "Microscopic hemolymph exam.",
        treatment: "Control mites; diverse forage.",
        prevention: "Hygiene.",
        transmission: "Varroa wounds.",
        riskLevel: "LOW",
        steps: ["Hemolymph sampling", "Protein boost"]
    },

    // === MITES & PARASITES ===
    "Varroa Destructor (Generic)": {
        scientificName: "Varroa destructor",
        causes: "External parasitic mite pressure rises through robbing, drifting, shared equipment, and untreated brood cycles that allow mites to reproduce unchecked.",
        signs: "Red-brown mites on bees; phoretic staging.",
        symptoms: "Deformed wings; PMS; weight loss; collapse.",
        detection: "Alcohol Wash (>3%); Sticky Board.",
        treatment: "Organic Acids; Thymol; Amitraz.",
        management: "Plan around brood presence, season, and temperature; rotate chemistries; retest every treatment cycle; and do not let collapsing colonies reinfest nearby yards.",
        cureStatus: "Controllable with disciplined IPM, but not permanently eliminated from most managed landscapes.",
        prevention: "Run an IPM plan with frequent mite counts; rotate treatment families; cull drone brood strategically; prevent robbing and select for hygienic/VSH queens.",
        transmission: "Drifting; robbing; transport.",
        hostSpecies: ["Apis mellifera", "Apis cerana"],
        riskLevel: "CRITICAL",
        steps: ["300-bee wash", "Apply treatment", "Re-test"]
    },
    "Varroa Mite PMS (Syndrome)": {
        scientificName: "PMS",
        signs: "Melted, sunken larval remains; patchy brood.",
        symptoms: "Collapse of adult force; high viral load.",
        detection: "Mite count >5%; visual brood check.",
        treatment: "Aggressive miticide rotation; re-queen.",
        prevention: "Frequency IPM.",
        transmission: "Vectored by Varroa.",
        riskLevel: "CRITICAL",
        steps: ["Double-knockdown treatment", "Re-queen"]
    },
    "Amitraz-Resistant Varroa": {
        scientificName: "Y337F Strain",
        signs: "Mites persist after Apivar treatment.",
        symptoms: "Rapid collapse despite care.",
        detection: "Glass jar resistance test.",
        treatment: "Rotate to Formic/Oxalic.",
        prevention: "Strict IPM rotation.",
        transmission: "Drones; equipment trade.",
        riskLevel: "CRITICAL",
        steps: ["Resistance test", "Switch to Acids"]
    },
    "Tropilaelaps mercedesae": {
        scientificName: "Asian Brood Mite",
        signs: "Fast-moving elongated mites; dead pupae.",
        symptoms: "Aggressive colony dwindle; stunted adults.",
        detection: "Bump test; brood inspection.",
        treatment: "Brood break; Formic acid.",
        prevention: "Quarantine.",
        transmission: "Drifting workers.",
        riskLevel: "CRITICAL",
        steps: ["Confirm bump test", "Cage queen"]
    },
    "Tracheal Mite (Acarapis)": {
        scientificName: "Acarapis woodi",
        signs: "Disoriented bees; shivers; K-wing.",
        symptoms: "Airway blockage; reduced winter life.",
        detection: "Thoracic spiracle dissection.",
        treatment: "Menthol; Grease patties; Formic acid.",
        prevention: "Genetic resistance (Buckfast).",
        transmission: "Bee-to-bee (<4 days old).",
        riskLevel: "MEDIUM",
        steps: ["Spiracle dissection", "Apply grease patty"]
    },
    "Acarapis externus": {
        scientificName: "External Tracheal Mite",
        signs: "Mites on neck; microscopic.",
        symptoms: "Minor irritation; viral vector.",
        detection: "Neck dissection.",
        treatment: "Thymol; Formic.",
        prevention: "Hygienic selection.",
        transmission: "Contact.",
        riskLevel: "LOW",
        steps: ["Sample neck", "Thymol treatment"]
    },
    "Bee Louse (Braula)": {
        scientificName: "Braula coeca",
        signs: "Wingless flies on queen/workers.",
        symptoms: "Nectar theft; reduced productivity.",
        detection: "Visual of queen thorax.",
        treatment: "Tobacco smoke; Manual cleaning.",
        prevention: "Reg. cleaning; limit trade.",
        transmission: "Drifting; queen trade.",
        riskLevel: "LOW",
        steps: ["Check queen", "Smoke treatment"]
    },

    // === INSECT PESTS ===
    "Small Hive Beetle": {
        signs: "Black beetles; slimy frames; rotting smell.",
        symptoms: "Honey fermentation; absconding.",
        detection: "Traps; Visual inspection.",
        treatment: "Oil traps; ground drench; freezing.",
        prevention: "Strong bee-to-comb ratio; full sun.",
        transmission: "Flight; soil pupae.",
        riskLevel: "HIGH",
        steps: ["Install oil traps", "Move to sun"]
    },
    "Greater Wax Moth": {
        signs: "Silken tunnels; frass; cocoon clusters.",
        symptoms: "Destroyed wax; bald brood.",
        detection: "Visual webbing; frass.",
        treatment: "Freeze frames; BT treatment.",
        prevention: "Colony strength; air/light storage.",
        transmission: "Night flight moths.",
        riskLevel: "MEDIUM",
        steps: ["Remove frames", "Freeze frames"]
    },
    "Lesser Wax Moth": {
        signs: "Fine silken paths; surface damage.",
        symptoms: "Indicates weak hive; minor damage.",
        detection: "Fine webbing.",
        treatment: "Sanitize extraction area.",
        prevention: "Cleanliness.",
        transmission: "Night flight.",
        riskLevel: "LOW",
        steps: ["Clean bottom board", "Store properly"]
    },
    "Oriental Hornet": {
        scientificName: "Vespa orientalis",
        signs: "Large orange/yellow hornets attacking hive.",
        symptoms: "Worker loss; brood theft.",
        detection: "Direct observation.",
        treatment: "Hornet traps; nest destruction.",
        prevention: "Entrance reduction; mesh screens.",
        transmission: "Scouting.",
        riskLevel: "CRITICAL",
        steps: ["Restrict entrance", "Set traps"]
    },
    "Yellowjacket Wasps": {
        signs: "Wasps entering freely; fighting.",
        symptoms: "Robbing honey/larvae; stress.",
        detection: "Robbing behavior.",
        treatment: "Traps; 1-bee width entrance.",
        prevention: "Remove sugary waste.",
        transmission: "Robbing.",
        riskLevel: "HIGH",
        steps: ["Reduce entrance", "Set traps"]
    },
    "Giant Hornet (V. mandarina)": {
        signs: "2-inch hornets; piles of decapitated bees.",
        symptoms: "Slaughter phase; occupation.",
        detection: "Visual scouts.",
        treatment: "6mm screens; targeted traps.",
        prevention: "Queen traps in spring.",
        transmission: "Predation.",
        riskLevel: "CRITICAL",
        steps: ["Install screens", "Kill scouts"]
    },
    "European Hornet (V. crabro)": {
        signs: "Large hornets; nocturnal activity near lights.",
        symptoms: "Forager loss; night-time stress.",
        detection: "Observation at entrance.",
        treatment: "Light-trapping; nest removal.",
        prevention: "Avoid night lights in apiary.",
        transmission: "Predatory.",
        riskLevel: "MEDIUM",
        steps: ["Remove lights", "Use hornet traps"]
    },
    "Termite Foundation Attack": {
        signs: "Mud tunnels on hive stands; sagging floor.",
        symptoms: "Structural failure; equipment loss.",
        detection: "Mud tubes; wood tapping (hollow).",
        treatment: "Replace bottom board; move to metal stands.",
        prevention: "Termite barriers; pressure-treated stands.",
        transmission: "Ground colonies.",
        riskLevel: "MEDIUM",
        steps: ["Inspect stand for mud tubes", "Replace floor"]
    },
    "Carpenter Ant Invasion": {
        signs: "Large black ants in lid; frass sawdust.",
        symptoms: "Wood damage; harassment; brood theft.",
        detection: "Presence of frass.",
        treatment: "Clean lid; ant-proof stands.",
        prevention: "Dry wood; cinnamon powder.",
        transmission: "Scouting.",
        riskLevel: "LOW",
        steps: ["Clean nest", "Replace wood"]
    },
    "Fire Ant Raiders": {
        signs: "Small red ants in swarm; swarm of bees outside.",
        symptoms: "Stinging bees; larvae theft; absconding.",
        detection: "Mounds near apiary.",
        treatment: "Baiting away from bees; grease on legs.",
        prevention: "Clear ground; leg moats.",
        transmission: "Ground invasion.",
        riskLevel: "HIGH",
        steps: ["Bait ant mounds", "Add oil moats"]
    },
    "Earwigs": {
        signs: "Many earwigs under inner cover/lid.",
        symptoms: "Mostly nuisance; minor scavenger.",
        detection: "Visual when opening lid.",
        treatment: "Shake out; clean debris.",
        prevention: "Keep hives elevated.",
        transmission: "Ground-based.",
        riskLevel: "LOW",
        steps: ["Shake out lid", "Clean debris"]
    },
    "Bed Bug (Cimex - rare)": {
        signs: "Insects in hive crevices (rarely affect bees).",
        symptoms: "Indicates contaminated equipment or proximity to humans.",
        detection: "Visual crevices.",
        treatment: "Heat treatments; replacement.",
        prevention: "Equipment history check.",
        transmission: "Hitchhiking.",
        riskLevel: "LOW",
        steps: ["Inspect crevices", "Heat treat"]
    },

    // === PREDATORS ===
    "African Honey Badger": {
        signs: "Smashed boxes; teeth marks; total destruction.",
        symptoms: "Death/Absconding; total loss.",
        detection: "Tracks; damage type.",
        treatment: "Equipment replacement.",
        prevention: "Elevated stands (>1m); cables; lion dung.",
        transmission: "Predatory behavior.",
        riskLevel: "CRITICAL",
        steps: ["Secure lids with cables", "Raise stands"]
    },
    "Bear Destruction (Ursus)": {
        signs: "Frames scattered; boxes smashed; teeth marks.",
        symptoms: "Total loss.",
        detection: "Presence; massive destruction.",
        treatment: "Replace gear.",
        prevention: "Electric fencing (6000V).",
        transmission: "Scent tracking.",
        riskLevel: "CRITICAL",
        steps: ["Install electric fence", "Remove honey scent"]
    },
    "Skunk Predation": {
        signs: "Scratches on hive face; chewed bees on ground.",
        symptoms: "Guard bee depletion; aggressive hive.",
        detection: "Tracks; mud on landing board.",
        treatment: "Elevate hive; carpet tack strips.",
        prevention: "Fencing; elevation.",
        transmission: "Nocturnal visits.",
        riskLevel: "HIGH",
        steps: ["Raise hive >3ft", "Apply tack strips"]
    },
    "Raccoon Robbing": {
        signs: "Inner covers moved; lid open; missing frames.",
        symptoms: "Honey theft; disturbance.",
        detection: "Hand-like tracks; lid displacement.",
        treatment: "Ratchet straps on hives.",
        prevention: "Secure lids.",
        transmission: "Manual dexterity.",
        riskLevel: "MEDIUM",
        steps: ["Add ratchet strap", "Check frames"]
    },
    "Mouse Infestation": {
        signs: "Chewed comb (corners); mouse nest (shredded leaf/paper).",
        symptoms: "Destruction of winter frames; foul odor.",
        detection: "Droppings on bottom board.",
        treatment: "Remove mouse; replace chewed frames.",
        prevention: "Mouse guards (1/4 inch hardware cloth).",
        transmission: "Winter seeking warmth.",
        riskLevel: "MEDIUM",
        steps: ["Install mouse guard", "Remove nest"]
    },
    "Toad/Bullfrog Feeding": {
        signs: "Large frogs at entrance at night; missing foragers.",
        symptoms: "Dwindling population; high predator weight.",
        detection: "Presence at night.",
        treatment: "Move hive to stand >50cm.",
        prevention: "Elevate hives.",
        transmission: "Predatory.",
        riskLevel: "LOW",
        steps: ["Raise hive", "Check for frogs"]
    },
    "Lizard (Gecko/Agama) Predation": {
        signs: "Lizards on hive face; fecal pellets on lid.",
        symptoms: "Minor forager loss.",
        detection: "Direct observation.",
        treatment: "Screening; elevation.",
        prevention: "Clean area around hive.",
        transmission: "Predatory.",
        riskLevel: "LOW",
        steps: ["Observe face", "Clean landing"]
    },
    "Bird (Bee-Eater)": {
        signs: "Birds diving near apiary; pellets with bee wings.",
        symptoms: "Significant forager loss; queen mating failure.",
        detection: "Auditory bird calls; wing pellets.",
        treatment: "Netting (rare); re-locate; owl decoys.",
        prevention: "Move apiary during migration periods.",
        transmission: "Aerial predation.",
        riskLevel: "MEDIUM",
        steps: ["Install decoys", "Check pellets"]
    },
    "Crested Honey Buzzard": {
        signs: "Total frame theft (takes whole comb); smashed lid.",
        symptoms: "Total loss of frames.",
        detection: "Presence of large buzzards.",
        treatment: "Roof over apiary; mesh covering.",
        prevention: "Hardware cloth on top of bars.",
        transmission: "Aerial predatory.",
        riskLevel: "HIGH",
        steps: ["Cover with mesh", "Secure frames"]
    },
    "Spider (Orb Weaver/Black Widow)": {
        signs: "Webs across entrance or under lid.",
        symptoms: "Entanglement; nuisance; venom risk to beekeeper.",
        detection: "Visible webs.",
        treatment: "Physical removal.",
        prevention: "Keep hives clean/painted.",
        transmission: "Entrapment.",
        riskLevel: "LOW",
        steps: ["Clear webs", "Wear gloves"]
    },

    // === CHEMICALS & TOXINS ===
    "Neonicotinoid (Subclinical)": {
        scientificName: "Imidacloprid",
        signs: "No dead piles; bees 'forget' to return.",
        symptoms: "Learning impairment; immune fatigue.",
        detection: "Pollen/Wax testing.",
        treatment: "Syrup flush; move to wild forage.",
        prevention: "Avoid systemic farm zones.",
        transmission: "Nectar/pollen.",
        riskLevel: "HIGH",
        steps: ["Map history", "Syrup feed", "Move apiary"]
    },
    "Chlorpyrifos Toxicity": {
        scientificName: "Organophosphate",
        signs: "Mass die-off; smell of chemicals; curled bees.",
        symptoms: "Acetylcholinesterase inhibition; paralysis.",
        detection: "Residue analysis.",
        treatment: "Move 5 miles; flush stores.",
        prevention: "Spray Alert monitoring.",
        transmission: "Drift/Direct.",
        riskLevel: "CRITICAL",
        steps: ["Move hives", "Collect lab sample"]
    },
    "Pyrethroid Overload": {
        scientificName: "Bifenthrin",
        signs: "Hyperactivity; shivering; erratic flight.",
        symptoms: "Sodium channel disrupt; death.",
        detection: "Dead bee count.",
        treatment: "Dilute stores with syrup.",
        prevention: "Avoid mosquito fogging zones.",
        transmission: "Aerosol.",
        riskLevel: "HIGH",
        steps: ["Close hives night", "Provide water"]
    },
    "Fungicide (Boscalid)": {
        scientificName: "SDHI Class",
        signs: "Brood mortality; pale larvae.",
        symptoms: "Thermal regulation disruption; immune drop.",
        detection: "Bread residue test.",
        treatment: "Fresh pollen; syrup.",
        prevention: "Orchard communication.",
        transmission: "Spray activity.",
        riskLevel: "MEDIUM",
        steps: ["Replace pollen", "Insulate hive"]
    },
    "Fungicide (Pyraclostrobin)": {
        scientificName: "Strobilurin",
        signs: "Synergy with neonics; high loss.",
        symptoms: "Extreme metabolic stress.",
        detection: "Lab analysis.",
        treatment: "Protein boost.",
        prevention: "Identify mix partners.",
        transmission: "Pollen.",
        riskLevel: "HIGH",
        steps: ["Increase diversity", "Alert local groups"]
    },
    "Glyphosate Integration": {
        signs: "Spotty brood; gut issues.",
        symptoms: "Microbiome shift; immune fail.",
        detection: "Residue test.",
        treatment: "Probiotics (SuperDFM).",
        prevention: "Chemical-free zones.",
        transmission: "Direct/Bloom.",
        riskLevel: "MEDIUM",
        steps: ["Apply probiotics", "Monitor growth"]
    },
    "Coumaphos (Wax Sink)": {
        signs: "Poor queen; supersedure cells.",
        symptoms: "Reproductive fail; chronic stress.",
        detection: "Wax analysis.",
        treatment: "Cycle 30% frames annually.",
        prevention: "Stop synthetic miticides.",
        transmission: "Absorption.",
        riskLevel: "CRITICAL",
        steps: ["Cycle 4 frames", "Switch to organic"]
    },
    "Fluvalinate Resistance": {
        signs: "Mites thrive despite treatment.",
        symptoms: "Collapse.",
        detection: "Mite counting.",
        treatment: "Switch to Formic/Oxalic.",
        prevention: "Varroa rotation.",
        transmission: "Horizontal.",
        riskLevel: "HIGH",
        steps: ["Sample count", "Switch acids"]
    },
    "Paraquat (Herbicide)": {
        signs: "Acute mortality; rapid die-off.",
        symptoms: "Respiratory toxicity.",
        detection: "Vegetation check.",
        treatment: "Flush with water; syrup.",
        prevention: "Buffer zones.",
        transmission: "Direct spray.",
        riskLevel: "HIGH",
        steps: ["Move hives", "Provide internal water"]
    },
    "Heavy Metal (Lead/Cadmium)": {
        signs: "Short lifespan; shimmering wings.",
        symptoms: "Neurotoxicity; behavior shifts.",
        detection: "Honey/wax test.",
        treatment: "Wax cycle; locate away from hwy.",
        prevention: "Avoid industrial zones.",
        transmission: "Dust; water.",
        riskLevel: "LOW",
        steps: ["Test water", "Move apiary"]
    },

    // === MANAGEMENT & ENVIRONMENTAL ===
    "Starvation (Acute)": {
        signs: "Heads-in-cells; light hive.",
        symptoms: "Cannibalism; slow movement.",
        detection: "Haft test (lifting).",
        treatment: "2:1 syrup; fondant.",
        prevention: "Weight checks; 80lb winter rule.",
        transmission: "None.",
        riskLevel: "CRITICAL",
        steps: ["Feed syrup", "Add fondant"]
    },
    "Chilled Brood": {
        causes: "Brood temperature falls below the colony's ability to keep it warm after cold snaps, over-inspection, sudden splits, or weak populations covering too much comb.",
        signs: "Sunken or dark brood concentrated on outer comb edges; patchy dead brood after cold weather or hive disturbance.",
        symptoms: "Brood dies before emergence, colony stalls in buildup, and weakened larvae become vulnerable to secondary infection.",
        detection: "Review recent weather, inspection timing, and colony strength; confirm dead brood is concentrated in poorly covered or exposed areas.",
        treatment: "Reduce hive space, combine weak units, insulate if needed, and stop opening brood nests during cold or windy periods.",
        prevention: "Match box size to colony strength; avoid long inspections in cold weather; support weak colonies before major cold swings; keep wind exposure low.",
        transmission: "Not contagious; triggered by environmental exposure and management stress.",
        riskLevel: "MEDIUM",
        steps: ["Consolidate brood area", "Reduce empty space", "Add feed if cluster is light"]
    },
    "Hive Meltdown (Heat)": {
        signs: "Bearding; runny honey; sagging wax.",
        symptoms: "Wax melting (62C); brood loss.",
        detection: "Temp sensor >40C; bearding.",
        treatment: "Shade; ventilation; water spray.",
        prevention: "White lids; shaded sites.",
        transmission: "Thermal.",
        riskLevel: "HIGH",
        steps: ["Provide shade", "Open vents"]
    },
    "Laying Workers (Anarchy)": {
        signs: "Multiple eggs per cell; drone brood.",
        symptoms: "Aggression; no worker replacement.",
        detection: "Visual chaotic eggs.",
        treatment: "Shake out; combine; add open brood.",
        prevention: "Regular checks.",
        transmission: "Pheromonal fail.",
        riskLevel: "HIGH",
        steps: ["Shake out", "Combine hive"]
    },
    "Drone Layer": {
        signs: "Only domed drone brood; single eggs.",
        symptoms: "Queen fail; population death.",
        detection: "Brood pattern.",
        treatment: "Pinch queen; re-queen.",
        prevention: "Check queen age.",
        transmission: "Sperm depletion.",
        riskLevel: "CRITICAL",
        steps: ["Remove queen", "Wait 24h", "Add new queen"]
    },
    "Robbing (Active)": {
        signs: "Fights; ripped wax; frantic flight.",
        symptoms: "Resource loss; disease spread.",
        detection: "Visual entrance activity.",
        treatment: "Robbing screens; 1-bee entrance.",
        prevention: "No exposed honey/sugar.",
        transmission: "Horizontal transport.",
        riskLevel: "CRITICAL",
        steps: ["Install robbing screen", "Close entrance"]
    },
    "Drifting": {
        signs: "Uneven strength; disease spreading.",
        symptoms: "Inefficient foraging.",
        detection: "Marked bee error.",
        treatment: "U-shape hives; colors.",
        prevention: "Diverse apiary layout.",
        transmission: "Movement.",
        riskLevel: "MEDIUM",
        steps: ["Paint markers", "Face different ways"]
    },
    "Swarm Fever": {
        signs: "Bottom queen cells; loitering.",
        symptoms: "Worker loss; queen loss.",
        detection: "Swarm cell inspection.",
        treatment: "Split (Artificial Swarm).",
        prevention: "Venting; room to lay.",
        transmission: "Instinct.",
        riskLevel: "HIGH",
        steps: ["Perform split", "Find queen"]
    },
    "Inbreeding Depression": {
        signs: "Irregular brood; small workers.",
        symptoms: "Poor resistance; low survival.",
        detection: "Brood pattern; diploid drones.",
        treatment: "Re-queen unrelated stock.",
        prevention: "Breed diversity.",
        transmission: "Inheritance.",
        riskLevel: "MEDIUM",
        steps: ["Add unrelated genetics"]
    },
    "Pollen Clogging": {
        signs: "No laying room; pollen in center.",
        symptoms: "Swarm prep; lethargy.",
        detection: "Visual center check.",
        treatment: "Add drawn comb; move frames.",
        prevention: "Add supers early.",
        transmission: "Management.",
        riskLevel: "LOW",
        steps: ["Add comb center"]
    },
    "Protein Deficency (Pollen Drought)": {
        signs: "No larvae jelly; larvae being eaten.",
        symptoms: "Brood rearing stops; hive dwindles.",
        detection: "Check for jelly around larvae.",
        treatment: "Protein patties; move to pollen area.",
        prevention: "Plant pollen sources.",
        transmission: "Environmental.",
        riskLevel: "HIGH",
        steps: ["Add 3 protein patties", "Feed 1:1 syrup"]
    },
    "Smoke/Wildfire Stress": {
        signs: "Stay inside hive; high CO2.",
        symptoms: "Navigation fail; brood desertion.",
        detection: "AQI correlation.",
        treatment: "Ventilation; internal water.",
        prevention: "Entrance mesh.",
        transmission: "Aerosol.",
        riskLevel: "HIGH",
        steps: ["Water provision", "Mesh entrance"]
    },
    "Vibration Stress": {
        signs: "Hissing; defensive; no laying.",
        symptoms: "Communication fail; balling.",
        detection: "Sensor; machinery proximity.",
        treatment: "Dampeners; relocate.",
        prevention: "Avoid metal roofs.",
        transmission: "Mechanical.",
        riskLevel: "MEDIUM",
        steps: ["Add rubber feet", "Move hive"]
    },
    "High CO2 Suffocation": {
        signs: "Dead bee piles; damp hive.",
        symptoms: "Anoxia; cluster death.",
        detection: "Sensor; heavy air.",
        treatment: "Max ventilation; dry hive.",
        prevention: "Upper vent holes.",
        transmission: "Anoxia.",
        riskLevel: "CRITICAL",
        steps: ["Drill vent", "Fan entrance"]
    },
    "Water Dehydration (Drought)": {
        signs: "Bees collecting sweat/urine; foragers dying on landing board.",
        symptoms: "Hive temp soaring; brood death.",
        detection: "Observation of water collectors.",
        treatment: "Internal waterer; external basin.",
        prevention: "Permanent water source <50m.",
        transmission: "Resource desert.",
        riskLevel: "HIGH",
        steps: ["Add frame waterer", "Set up drip basin"]
    },
    "Pesticide Synergy (P450 Inhibition)": {
        signs: "Small doses killing whole hives.",
        symptoms: "Loss of detoxification system.",
        detection: "Lab analysis for mix.",
        treatment: "Move to wild forage; syrup.",
        prevention: "Avoid chemical mix zones.",
        transmission: "Direct/Bloom contact; Synergistic intake.",
        riskLevel: "CRITICAL",
        steps: ["Immediate relocation"]
    },

    // === FURTHER EXPANSION (RARE & SPECIFIC) ===
    "Grayanotoxin (Rhododendron) Poisoning": {
        scientificName: "Nectar Intoxication",
        signs: "Bees 'drunk' at entrance; unable to fly; paralyzed; dead bees with no marks.",
        symptoms: "Neurological disruption; rapid adult death in high bloom periods.",
        detection: "Foraging on Rhododendron/Azalea; nectar testing.",
        treatment: "Divert to other forage; remove toxic frames.",
        prevention: "Avoid apiary sites with high invasive Rhododendron concentrations.",
        transmission: "Nectar ingestion.",
        riskLevel: "MEDIUM",
        steps: ["Identify local bloom", "Supply internal sugar", "Check for paralyzed foragers"]
    },
    "Tilia (Linden) Starvation": {
        scientificName: "Sugar Density Anomaly",
        signs: "Bees dead under Linden trees; foragers lethargic on ground.",
        symptoms: "Insufficient nectar energy vs collection cost; low-sugar nectar intoxication.",
        detection: "Dead bees near blooming Tilia trees in dry years.",
        treatment: "Provide syrup immediately.",
        prevention: "Avoid Linden monocultures in drought-prone areas.",
        transmission: "Feeding.",
        riskLevel: "LOW",
        steps: ["Feed syrup", "Check nectar flow quality"]
    },
    "Nuptial Flight Failure": {
        scientificName: "Mating Anomalies",
        signs: "Queen returns but never lays; queen missing after flight.",
        symptoms: "Colony becomes queenless or drone-layer high; high stress.",
        detection: "Lack of brood 14 days post-emergence.",
        treatment: "Introduce mated queen.",
        prevention: "Manage mating yards with high drone density.",
        transmission: "Environmental/Predatory during flight.",
        riskLevel: "HIGH",
        steps: ["Check for queen presence", "Re-queen"]
    },
    "Queen Balling": {
        scientificName: "Genetic/Pheromonal Conflict",
        signs: "A ball of workers 'cooking' the queen; high heat in cluster.",
        symptoms: "Queen death; frantic workers.",
        detection: "Visual balling during inspection.",
        treatment: "Smoke heavily; sprinkle water; release queen in cage.",
        prevention: "Gentle handling; avoid checking too often into new queens.",
        transmission: "Social stress.",
        riskLevel: "HIGH",
        steps: ["Separate queen", "Cage her for 48h"]
    },
    "Supersedure Fail": {
        signs: "Multiple queen cells on face of frames; queen missing.",
        symptoms: "Old queen failed but new queen didn't hatch; brood gap.",
        detection: "Visual cells vs no eggs.",
        treatment: "Introduce new mated queen.",
        prevention: "Avoid crushing queens during inspection.",
        transmission: "Succession failure.",
        riskLevel: "MEDIUM",
        steps: ["Verify no queen", "Add mated queen"]
    },
    "Infectious Septicemia": {
        scientificName: "Pseudomonas apiseptica",
        signs: "Bees fall apart when touched; rapid darkening of adult bodies.",
        symptoms: "Total biological collapse of the bee; liquefaction of muscles.",
        detection: "Laboratory culture; visual 'brittleness'.",
        treatment: "Cull infected hive; sanitize apiary.",
        prevention: "Reduce humidity; increase ventilation.",
        transmission: "Contact; contaminated water.",
        riskLevel: "HIGH",
        steps: ["Cull hive", "Sanitize ground"]
    },
    "Mermis Nematode Infection": {
        scientificName: "Mermithidae",
        signs: "Worm-like parasite emerging from bee abdomen.",
        symptoms: "Abdominal swelling; eventual death.",
        detection: "Direct visual (10-20mm worms).",
        treatment: "None; remove infected individuals.",
        prevention: "Drain standing water; salt on apiary soil.",
        transmission: "Standing water; soil contact.",
        riskLevel: "LOW",
        steps: ["Drain apiary", "Clean surroundings"]
    },
    "Conopid Fly Parasitism": {
        scientificName: "Physocephala spp.",
        signs: "Bees burying themselves in soil; lethargy.",
        symptoms: "Internal larva consuming the bee's organs.",
        detection: "Larva in bee abdomen (post-mortem).",
        treatment: "None for individuals.",
        prevention: "Move apiary from conopid fly hotspots.",
        transmission: "Egg injection during flight.",
        riskLevel: "MEDIUM",
        steps: ["Observe burying behavior", "Relocate apiary"]
    },
    "Melo beetle (Triungulin)": {
        scientificName: "Meloe spp.",
        signs: "Tiny black larvae clinging to bee thorax.",
        symptoms: "Hitchhiking to hive; resource theft.",
        detection: "Visual on bees.",
        treatment: "Manual removal; strong hives kill them.",
        prevention: "Mowing nearby flowers during beetle season.",
        transmission: "Floral contact.",
        riskLevel: "LOW",
        steps: ["Remove by hand", "Mow grass"]
    },
    "Zombie Fly (Apocephalus)": {
        scientificName: "Apocephalus borealis",
        signs: "Bees flying at night toward lights; walking in circles.",
        symptoms: "Neurological disruption; death away from hive.",
        detection: "Larval emergence from bee neck after 7 days.",
        treatment: "Trapping infected bees near lights.",
        prevention: "Avoid night lights near apiary.",
        transmission: "Egg injection.",
        riskLevel: "MEDIUM",
        steps: ["Turn off lights", "Observe night flight"]
    },
    "Sneezing Beekeepers (Allergic Stress)": {
        signs: "Bees behaving aggressively when beekeeper approaches; scent of pheromones.",
        symptoms: "Hive agitation; sting responses.",
        detection: "Observing bee reaction to beekeeper odors.",
        treatment: "Use clean suits; avoid perfumes; smoke properly.",
        prevention: "Professional apiary hygiene.",
        transmission: "Scent markers.",
        riskLevel: "LOW",
        steps: ["Wash suit", "Avoid strong scents"]
    },
    "High CO2 (Trucking Syndrome)": {
        signs: "Bees vomiting in cluster; high heat; wet screen.",
        symptoms: "Transport mortality; anoxia.",
        detection: "Telemetry >5000ppm CO2.",
        treatment: "Stop truck; unload; mist with water.",
        prevention: "Forced air ventilation during transport.",
        transmission: "Confined space.",
        riskLevel: "HIGH",
        steps: ["Unload hives", "Cool with mist"]
    },
    "Flooding (Flash Flood)": {
        signs: "Mud in entrance; bottom board missing; wet comb.",
        symptoms: "Colony death; mold; absconding.",
        detection: "Visual water marks.",
        treatment: "Dry frames; move to high ground; feed syrup.",
        prevention: "Avoid low-lying apiary sites.",
        transmission: "Environmental.",
        riskLevel: "CRITICAL",
        steps: ["Move to high ground", "Dry the hive"]
    },
    "Tornado/Wind Damage": {
        signs: "Hives knocked over; lids missing; frames in trees.",
        symptoms: "Exposure death; loss of stores.",
        detection: "Visual storm damage.",
        treatment: "Re-stack; strap hives; feed.",
        prevention: "Hive straps; ground anchors.",
        transmission: "Mechanical.",
        riskLevel: "HIGH",
        steps: ["Restrap hives", "Anchor to ground"]
    },

    // === 2026 EMERGING PATHOGENS & FUTURISTIC STRESSORS ===
    "Synthetic Pesticide Synergy (v2026)": {
        signs: "Foragers exhibit 'shimmer' behavior; sudden mid-flight collapse.",
        symptoms: "Cross-resistance between fungicides and newer RNAi-based pesticides.",
        detection: "BeeYield Spectral Analysis of hive entrance.",
        treatment: "Relocate to BeeYield Certified Organic Buffer Zone.",
        prevention: "Pre-bloom GIS mapping via BeeYield Dashboard.",
        transmission: "Systemic crop uptake.",
        riskLevel: "CRITICAL",
        steps: ["Execute GIS scan", "Relocate hives", "Flush internal stores"]
    },
    "Microplastic Accumulation": {
        signs: "Stunted larval growth; plastic fibers found in propolis.",
        symptoms: "Digestive blockages in nurse bees; reduced longevity.",
        detection: "Microscopic analysis of pollen loads.",
        treatment: "Replace all old plastic frames with natural wax.",
        prevention: "Locate apiaries away from industrial runoff.",
        transmission: "Environmental ingestion.",
        riskLevel: "MEDIUM",
        steps: ["Audit equipment materials", "Sample propolis", "Cycle to woodenware"]
    },
    "Nano-Silica Dust Exposure": {
        signs: "Abrasions on bee mandibles; 'dusty' appearance of foragers.",
        symptoms: "Respiratory failure; inability to cool the hive via fanning.",
        detection: "Acoustic sensor detects 'raspy' fanning sound.",
        treatment: "Internal misting; temporary hive closure.",
        prevention: "Monitor local construction/industrial activity via BeeYield Alerts.",
        transmission: "Aerial drift.",
        riskLevel: "HIGH",
        steps: ["Close hives during dust events", "Provide internal water"]
    },
    "Mitochondrial Drift (Heat Stress v2.0)": {
        signs: "Bees unable to fly even in optimal temps; low ATP levels.",
        symptoms: "Genetic fatigue due to consistent 40°C+ summers.",
        detection: "BeeYield metabolic tracking sensors.",
        treatment: "Introduce heat-adapted genetics (e.g., jemenitica cross).",
        prevention: "Active hive cooling systems (BeeYield Solar-Fan).",
        transmission: "Inherited epigenetic shift.",
        riskLevel: "HIGH",
        steps: ["Install solar cooling", "Introduce desert genetics"]
    },
    "RNAi Off-Target Effects": {
        signs: "Larvae developing into 'half-drones'; wing asymmetry.",
        symptoms: "Gene-silencing interference from neighboring agricultural sprays.",
        detection: "Quantitative RT-PCR; BeeYield Genomic Audit.",
        treatment: "Quarantine; fresh queen introduction.",
        prevention: "Advocate for 'Bee-Safe' RNAi protocols.",
        transmission: "Pollen ingestion.",
        riskLevel: "CRITICAL",
        steps: ["Capture genomic sample", "Re-queen to shift lineage"]
    },
    "Cryptic Viral Dwindle": {
        scientificName: "Unclassified Iflavirus",
        signs: "Population drop with zero visual symptoms; 'ghost hives'.",
        symptoms: "Chronic immune suppression; synergistic with minor Nosema.",
        detection: "BeeYield Deep-Learning Acoustic Analysis.",
        treatment: "Intensive probiotic rotation.",
        prevention: "Annual biosecurity audit.",
        transmission: "Shared water sources.",
        riskLevel: "HIGH",
        steps: ["Apply SuperDFM Probiotics", "Sanitize all water sources"]
    },
    "Electromagnetic Interference (5G/6G)": {
        signs: "Bees lost in apiary; disorientation; clustering on outside of box.",
        symptoms: "Navigational disruption; high forager loss.",
        detection: "BeeYield Signal Shield™ diagnostic.",
        treatment: "Apply grounded metallic paint to hive exterior.",
        prevention: "Avoid apiary placement within 500m of high-power towers.",
        transmission: "Radio-frequency interference.",
        riskLevel: "MEDIUM",
        steps: ["Move hive 1km", "Apply Faraday coating"]
    },
    "Fungal Bloom (Post-Flood)": {
        scientificName: "Secondary Mycelial Growth",
        signs: "White fuzz on outer frames; damp odor.",
        symptoms: "Larval toxicity; respiratory stress in adults.",
        detection: "Humidity sensor alert (>85% for 48h).",
        treatment: "Max ventilation; dehumidify storage.",
        prevention: "Maintain 'BeeYield Dry-Zone' protocols.",
        transmission: "Airborne spores.",
        riskLevel: "MEDIUM",
        steps: ["Increase upper airflow", "Remove fuzzy frames"]
    },
    "Almond-Dust Syndrome": {
        signs: "Bees returning gray/white; dead bees under nut trees.",
        symptoms: "Desiccation of bee cuticle; rapid death.",
        detection: "Visual inspection during bloom.",
        treatment: "Syrup spray to wash bees; intensive internal hydrating.",
        prevention: "Coordination with growers on dust-suppression sprays.",
        transmission: "Contact during pollination.",
        riskLevel: "HIGH",
        steps: ["Mist the landing board", "Hydrate the hive"]
    },
    "Carbon Exhaust Poisoning": {
        signs: "Blackened foragers; oily film on entrance.",
        symptoms: "Carboxyhemoglobin-like stress; neurotoxicity.",
        detection: "Smell of diesel; telemetry showing proximity to trucking.",
        treatment: "Relocate 3 miles from highways.",
        prevention: "Site selection audits via BeeYield GIS.",
        transmission: "Aerosol.",
        riskLevel: "MEDIUM",
        steps: ["Move apiary", "Wash hive face"]
    },
    "Pesticide Poisoning": {
        causes: "Acute exposure to insecticides, fungicide mixes, or contaminated tank blends during bloom or nearby spray events overwhelms foragers and contaminates incoming nectar and pollen.",
        signs: "Large numbers of trembling or dead bees at the entrance; tongues extended; fresh pollen loads on dead foragers.",
        symptoms: "Disorientation, paralysis, rapid field losses, queen slowdown, and sudden population drop after spray windows.",
        detection: "Compare losses with recent spray timing; collect fresh bee and pollen samples for residue testing; inspect nearby bloom and water sources.",
        treatment: "Close entrances temporarily if drift is active; move colonies when possible; feed clean syrup and pollen substitute; remove heavily contaminated feed frames if losses continue.",
        prevention: "Coordinate spray windows with growers; avoid placing hives beside treated bloom; provide clean water on-site; favor evening or post-bloom applications only.",
        transmission: "Contaminated nectar, pollen, dust, guttation droplets, and direct spray drift.",
        riskLevel: "CRITICAL",
        steps: ["Collect fresh samples", "Contact grower immediately", "Feed clean syrup", "Relocate if exposure continues"]
    },
    "Starvation Stress": {
        causes: "Colonies exhaust honey or pollen reserves during dearth, winter confinement, poor forage, or brood expansion that outpaces incoming nectar and stored feed.",
        signs: "Bees head-first in cells; very light hive weight; dry comb above cluster; frantic robbing behavior.",
        symptoms: "Rapid worker death, brood cannibalism, queen slowdown, and collapse even when the brood nest appears otherwise healthy.",
        detection: "Heft hives regularly; inspect feed arcs around brood; confirm low stores with frame-by-frame checks and weight telemetry.",
        treatment: "Emergency feed with warm syrup, fondant, or dry sugar depending on season; add protein only when bees can access water and brood is active.",
        prevention: "Monitor hive weight through dearth and winter; leave adequate honey reserves; feed before colonies reach critical lightness; reduce excess empty space.",
        transmission: "Nutritional and management failure rather than infectious spread.",
        riskLevel: "CRITICAL",
        steps: ["Feed immediately", "Verify queen is alive", "Reduce robbing pressure", "Recheck stores within 48 hours"]
    },
    "Asian Hornet Predation": {
        scientificName: "Vespa velutina",
        causes: "Persistent hawking by Asian hornets strips returning foragers and traps colonies indoors, especially in late summer when hornet nests peak.",
        signs: "Hornets hovering at hive entrances; piles of dismembered bees; reduced pollen return despite favorable weather.",
        symptoms: "Forager paralysis, colony stress, starvation, and sharp drops in flight activity as bees refuse to leave the hive.",
        detection: "Direct observation at entrances, camera monitoring, and triangulation of repeated hornet flight paths toward nest sites.",
        treatment: "Install hornet guards or muzzles; trap scouts early; destroy confirmed nests with local authorities or trained crews.",
        prevention: "Monitor apiaries from midsummer onward; keep entrance reducers and protective screens ready; remove attractants and trap founding queens in spring where legal.",
        transmission: "Predatory pressure from nearby nests and repeated scout recruitment.",
        riskLevel: "HIGH",
        steps: ["Install entrance guards", "Trap scouts", "Report nest location", "Monitor forage traffic daily"]
    },
    "Colony Collapse Disorder (CCD)": {
        causes: "Multifactor stress syndrome linked to Varroa, viruses, pesticide load, transport stress, poor nutrition, and queen failure rather than a single pathogen.",
        signs: "Sudden loss of most adult workers while brood, queen, and food remain in the hive; delayed robbing from neighboring colonies.",
        symptoms: "Field force disappears, brood care breaks down, and the remaining colony cannot recover despite food reserves.",
        detection: "Rule out starvation, queen loss, and acute poisoning first; review mite history, migration events, feed quality, and recent disease pressure.",
        treatment: "Stabilize surviving units by combining weak colonies, requeening if needed, correcting Varroa pressure, and improving forage and feed support.",
        management: "Handle CCD as a systems-failure investigation: audit migration, mite records, pesticide timing, forage gaps, queen age, and nutritional support across the full season.",
        cureStatus: "No single cure because CCD is syndromic; recovery depends on removing the underlying stress stack.",
        prevention: "Maintain strong year-round Varroa control; reduce transport and nutritional stress; replace failing queens promptly; avoid stacking multiple chemical exposures.",
        transmission: "Syndromic collapse rather than direct contagion; often emerges from multiple concurrent stressors.",
        hostSpecies: ["Apis mellifera"],
        riskLevel: "CRITICAL",
        steps: ["Audit mite history", "Review forage and pesticide exposure", "Combine survivors if needed", "Requeen weak units"]
    },
    "Nosema bombi": {
        scientificName: "Nosema bombi",
        causes: "Microsporidian infection spreads through contaminated nest material, flowers, and contact between commercial and wild bumblebee populations.",
        signs: "Small bumble colonies, sluggish queens, uneven brood development, and reduced worker numbers during peak forage.",
        symptoms: "Lower reproduction, shortened queen lifespan, weak worker output, and poor overwintering success in native bumble species.",
        detection: "Microscopy or PCR on bumblebee gut samples; compare colony growth against expected seasonal buildup.",
        treatment: "No widely accepted direct field cure; support with clean nesting conditions and reduced stress.",
        management: "Prioritize biosecurity around commercial bumblebee use, remove heavily contaminated nesting material, and protect diverse pesticide-light forage near wild habitat.",
        cureStatus: "Supportive management only; best practice focuses on suppression and habitat protection rather than cure.",
        prevention: "Avoid pathogen spillover from managed pollinators; keep nesting habitat dry and undisturbed; reduce pesticide load and conserve forage continuity.",
        transmission: "Shared flowers, contaminated nests, drifting queens, and commercial colony spillover.",
        hostSpecies: ["Bombus impatiens", "Bombus terrestris", "Wild bumblebees"],
        riskLevel: "HIGH",
        steps: ["Separate managed and wild pollinator zones", "Remove contaminated nest material", "Improve forage continuity"]
    },
    "Crithidia bombi": {
        scientificName: "Crithidia bombi",
        causes: "Gut parasite pressure rises when bumblebees share flowers under forage scarcity or crowding, especially where colonies are nutritionally stressed.",
        signs: "Normal-looking adults with steadily reduced foraging efficiency, weak queen performance, and poor colony growth.",
        symptoms: "Chronic energy loss, lower pollination performance, weakened immunity, and reduced queen founding success.",
        detection: "Microscopy or PCR from gut washings; field clue is unexplained loss of bumblebee performance despite adequate bloom.",
        treatment: "No standard direct cure; reduce stress and improve clean forage access.",
        management: "Keep flower resources abundant and spatially distributed, reduce crowding from managed colonies, and avoid moving weak commercial bumblebee units between sites.",
        cureStatus: "Managed through ecology and sanitation rather than medication.",
        prevention: "Support diverse continuous bloom, rotate greenhouse pollinator units carefully, and limit spillover from commercial colonies into wild pollinator habitat.",
        transmission: "Shared flowers, fecal contamination, and colony crowding.",
        hostSpecies: ["Bombus impatiens", "Bombus terrestris", "Wild bumblebees"],
        riskLevel: "MEDIUM",
        steps: ["Reduce managed colony crowding", "Expand clean bloom resources", "Retire weak commercial colonies quickly"]
    },
    "Phorid Fly Parasitism": {
        scientificName: "Apocephalus borealis",
        causes: "Parasitic phorid flies oviposit in adult bees, most often where colonies are already stressed and night-light attraction increases abnormal flight.",
        signs: "Disoriented adults leaving at odd hours, weak crawling bees, and larvae emerging from dead bees after collection.",
        symptoms: "Reduced worker lifespan, disorientation, nighttime wandering, and local population drain in stingless, honey, or bumble bee systems.",
        detection: "Collect suspect adults and observe for larval emergence; combine with night-flight monitoring and local trap counts.",
        treatment: "Remove infested adults where practical and reduce attractant lighting near colonies.",
        management: "Keep colonies strong, reduce unnecessary night lighting, and clean dead-outs quickly so fly pressure does not build around apiaries and meliponaries.",
        cureStatus: "No direct cure; pressure is reduced through sanitation and stress reduction.",
        prevention: "Avoid chronic colony stress, manage lighting around yards, and remove dead bees and nesting debris routinely.",
        transmission: "Adult fly parasitism rather than bee-to-bee spread.",
        hostSpecies: ["Apis mellifera", "Bombus spp.", "Stingless bees"],
        riskLevel: "MEDIUM",
        steps: ["Collect and inspect suspect adults", "Reduce night lighting", "Improve yard sanitation"]
    },
    "Ant Invasion": {
        causes: "Ant pressure increases when colonies are weak, stands bridge to vegetation, or feed, syrup, brood debris, and resin stores attract scavenging or predatory ant species.",
        signs: "Ant trails on legs and hive covers, robbed syrup, disturbed stingless bee pots, and bees clustering away from the invaded side of the hive.",
        symptoms: "Brood loss, weakened colonies, contamination of food stores, and absconding in stingless or small colonies.",
        detection: "Visual trail mapping around stands, roofs, and nearby vegetation; inspect base supports and feeder areas.",
        treatment: "Break trails immediately, clean attractants, elevate or isolate stands, and use safe exclusion barriers around hive supports.",
        management: "Treat this as apiary hygiene and stand design issue: keep vegetation clear, remove spilled feed, protect nest entrances, and intervene before brood or pot stores are damaged.",
        cureStatus: "Fully manageable if structural access and attractants are removed early.",
        prevention: "Maintain clean hive stands, trim vegetation bridges, avoid syrup spills, and use physical barriers or moats where appropriate.",
        transmission: "Environmental invasion from surrounding ant populations.",
        hostSpecies: ["Stingless bees", "Solitary cavity nesters", "Weak honey bee colonies"],
        riskLevel: "HIGH",
        steps: ["Break ant trails", "Clean spilled feed", "Install stand barriers", "Inspect brood stores"]
    },
    "Pollen Mite Fouling": {
        causes: "Stored pollen provisions or solitary bee nesting tubes become fouled by mites, mold, and debris when humidity rises and sanitation breaks down.",
        signs: "Dusty nesting cavities, collapsed pollen loaves, poor larval development, and weak emergence from mason or leafcutter nesting blocks.",
        symptoms: "Reduced brood survival, malformed adults, lower emergence rates, and chronic nest failure in managed solitary bee systems.",
        detection: "Open sample nesting tubes or blocks after the season; inspect provisions for mites, mold, and compacted debris.",
        treatment: "Discard badly fouled nesting material, dry replacement nests thoroughly, and sanitize reusable components before the next season.",
        management: "Rotate nesting materials aggressively, store completed nests under clean dry conditions, and avoid reusing moldy inserts or blocks.",
        cureStatus: "Recoverable at the population level when contaminated nesting material is replaced.",
        prevention: "Keep nesting media dry, harvest and store occupied tubes correctly, and maintain annual sanitation for solitary bee equipment.",
        transmission: "Contaminated nesting media and stored pollen provisions.",
        hostSpecies: ["Osmia spp.", "Megachile spp.", "Ground and cavity-nesting solitary bees"],
        riskLevel: "MEDIUM",
        steps: ["Inspect nesting media", "Discard contaminated tubes", "Dry and sanitize replacements"]
    }
};
