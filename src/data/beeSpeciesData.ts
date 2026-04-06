export interface BeeSpeciesDetail {
    scientificName: string;
    commonName: string;
    origin: string;
    characteristics: string;
    honeyYield: string;
    temperament: string;
    climateSuitability: string;
    pros: string[];
    cons: string[];
    description: string;
    references?: string[];
}

export const beeSpeciesData: Record<string, BeeSpeciesDetail> = {
    "Italian Honey Bee": {
        scientificName: "Apis mellifera ligustica",
        commonName: "Italian Honey Bee",
        origin: "Italy",
        characteristics: "Lightly colored (light leather to yellow), long brood cycles, prone to robbing.",
        honeyYield: "Very high (up to 150 lbs/hive in warm climates).",
        temperament: "Extremely docile and gentle; ideal for beginners.",
        climateSuitability: "Prefers warm climates; less winter-hardy.",
        pros: ["Excellent honey producers", "Rapid spring buildup", "Low swarming tendency"],
        cons: ["Prone to 'drifting' and robbing", "High food consumption in winter"],
        description: "The most popular bee for commercial beekeeping worldwide due to its high productivity and gentle nature.",
        references: ["https://en.wikipedia.org/wiki/Italian_bee", "https://beeinformed.org/ligustica"]
    },
    "Carniolan Honey Bee": {
        scientificName: "Apis mellifera carnica",
        commonName: "Carniolan / 'Grey Bee'",
        origin: "Slovenia, Austria, Balkans",
        characteristics: "Greyish-black color, explosive spring buildup, good hygienic behavior.",
        honeyYield: "Significant yields (up to 120 lbs/hive).",
        temperament: "Extremely calm and docile; can be worked with minimal smoke.",
        climateSuitability: "Excellent for cool/mountainous climates; forages on wetter days.",
        pros: ["Rapid population growth", "Excellent winter survival", "Very gentle"],
        cons: ["High swarming tendency if not managed"],
        description: "Known for its ability to rapidly expand its colony in the spring and its extreme gentleness.",
        references: ["https://en.wikipedia.org/wiki/Carniolan_honey_bee", "https://scielo.br/carnica-resilience"]
    },
    "Caucasian Honey Bee": {
        scientificName: "Apis mellifera caucasia",
        commonName: "Caucasian Bee",
        origin: "Caucasus Mountains",
        characteristics: "Dark gray and hairy, notably long tongue (7.2mm), tends to use excessive propolis.",
        honeyYield: "Moderate; slower spring buildup affects peak flow.",
        temperament: "One of the gentlest subspecies known.",
        climateSuitability: "Suited for areas with late nectar flows and cool, overcast weather.",
        pros: ["Long tongue can reach deep nectar", "Extremely gentle", "Forages in cool weather"],
        cons: ["Excessive propolis (sticky hive)", "Susceptible to Nosema"],
        description: "A gentle bee from high altitudes, prized for its ability to access nectar sources other bees cannot."
    },
    "Buckfast Bee": {
        scientificName: "Apis mellifera hybrid",
        commonName: "Buckfast Bee",
        origin: "Buckfast Abbey, UK (Brother Adam)",
        characteristics: "Engineered hybrid; varies in color; bred for resistance to tracheal mites.",
        honeyYield: "Very high; consistent producers.",
        temperament: "Very gentle and easy to handle.",
        climateSuitability: "Highly adaptable to damp and maritime climates.",
        pros: ["Diseases resistant", "Low swarming tendency", "Great foragers"],
        cons: ["Second generation can be defensive", "Requires frequent queen replacement"],
        description: "A world-renowned hybrid strain bred specifically for productivity, gentleness, and disease resistance."
    },
    "Russian Honey Bee": {
        scientificName: "Apis mellifera (Primorsky strain)",
        commonName: "Russian Bee",
        origin: "Primorsky Krai, Russia",
        characteristics: "Dark color; brood rearing adjusts strictly to resource availability.",
        honeyYield: "High but variable based on environmental resources.",
        temperament: "Gentle when handled correctly; defensive if resources are scarce.",
        climateSuitability: "Superior cold-hardiness; survives harsh winters.",
        pros: ["Natural resistance to Varroa and Tracheal mites", "Excellent winter survival"],
        cons: ["Maintain queen cells year-round", "Unpredictable buildup"],
        description: "Developed through natural selection in areas with high mite pressure, making them naturally resistant to parasites."
    },
    "Africanized Honey Bee": {
        scientificName: "Apis mellifera scutellata (Hybrid)",
        commonName: "Killer Bee / AHB",
        origin: "Brazil (Hybridized from East African bees)",
        characteristics: "Visually identical to European bees; extremely high growth rate; rapid reproduction.",
        honeyYield: "Can be high in tropical areas, but prioritizes brood over storage.",
        temperament: "Highly defensive; attacks in large numbers; pursues threats for 500+ meters.",
        climateSuitability: "Tropical and subtropical; cannot survive freezing winters.",
        pros: ["Highly resilient to tropical diseases", "Fast population growth"],
        cons: ["Dangerous temperament", "Difficult to manage commercially"],
        description: "A highly successful but dangerous hybrid that has dominated tropical and subtropical regions."
    },
    "Eastern Honey Bee": {
        scientificName: "Apis cerana",
        commonName: "Asiatic Honey Bee",
        origin: "Asia",
        characteristics: "Smaller than A. mellifera; cavity nesting; superior hygienic behavior against Varroa.",
        honeyYield: "Moderate (6-8 kg/year) due to smaller colony size.",
        temperament: "Non-aggressive but nervous; prone to absconding.",
        climateSuitability: "Wide range; from tropical rainforests to cool high altitudes.",
        pros: ["Natural Varroa resistance", "Low chemical requirement", "Adaptable"],
        cons: ["Small honey stores", "Frequent absconding"],
        description: "The primary native hive bee of Asia, known for its complex learning abilities and disease resistance."
    },
    "Giant Honey Bee": {
        scientificName: "Apis dorsata",
        commonName: "Giant Honey Bee / Rock Bee",
        origin: "South and SE Asia",
        characteristics: "Large (17-20mm); builds massive single exposed combs on cliffs or tall trees; migratory.",
        honeyYield: "Impressive (up to 50 kg per season).",
        temperament: "Fiercely defensive and bold.",
        climateSuitability: "Tropical and subtropical forested areas.",
        pros: ["Very high yield per comb", "Large foraging range"],
        cons: ["Cannot be kept in hives (open nesting)", "Difficult and dangerous to harvest"],
        description: "A massive, migratory bee that builds single-comb nests in high places, often harvested by traditional honey hunters."
    },
    "Dwarf Honey Bee": {
        scientificName: "Apis florea",
        commonName: "Little Bee",
        origin: "Southern Asia",
        characteristics: "Smallest species (7-10mm); builds palm-sized single combs on branches at lower elevations.",
        honeyYield: "Very low (200-900g per year).",
        temperament: "Mild and non-aggressive.",
        climateSuitability: "Warm tropical plains; absent in cold climates.",
        pros: ["Pollinates small flowers", "Very gentle"],
        cons: ["Negligible honey production", "Open nesting"],
        description: "The smallest of the true honey bees, specialized for pollination of small wild flora in tropical plains."
    },
    // === ADDITIONAL SUBSPECIES ===
    "Macedonian Honey Bee": {
        scientificName: "Apis mellifera macedonica",
        commonName: "Macedonian Bee",
        origin: "Balkans, Greece, North Macedonia",
        characteristics: "Dark color; very low tendency to swarm; high propolis use.",
        honeyYield: "High; excellent at taking advantage of diverse flora.",
        temperament: "Generally gentle but can be nervous when queenless.",
        climateSuitability: "Continental climates with cold winters and hot summers.",
        pros: ["Very low swarming", "Reliable producers"],
        cons: ["Excessive propolis"],
        description: "A hardy Balkan bee known for its stability and low swarming behavior."
    },
    "Sicilian Honey Bee": {
        scientificName: "Apis mellifera siciliana",
        commonName: "Sicilian Black Bee",
        origin: "Sicily, Italy",
        characteristics: "Very dark color; smaller than other European bees; extremely high Varroa resistance.",
        honeyYield: "Moderate.",
        temperament: "Docile and very calm on the comb.",
        climateSuitability: "Mediterranean climates; drought tolerant.",
        pros: ["Resistant to Varroa", "Good for arid regions"],
        cons: ["Low production compared to ligustica"],
        description: "A unique island subspecies that survived the wave of Italian bee exports, now prized for its resiliency."
    },
    "Anatolian Honey Bee": {
        scientificName: "Apis mellifera anatoliaca",
        commonName: "Anatolian Bee",
        origin: "Turkey (Anatolia)",
        characteristics: "Orange-brown color; extreme propolis use; conservative brood rearing.",
        honeyYield: "High; very efficient foragers.",
        temperament: "Can be defensive; very protective of the hive.",
        climateSuitability: "Harsh steppe climates; resistant to extremes.",
        pros: ["Very high efficiency", "Excellent wintering"],
        cons: ["Aggressive temperament", "Sticky propolis"],
        description: "An ancient, highly efficient bee from the Turkish highlands, known for its extreme hardiness."
    },
    "Syrian Honey Bee": {
        scientificName: "Apis mellifera syriaca",
        commonName: "Syrian Bee",
        origin: "Syria, Lebanon, Jordan, Israel",
        characteristics: "Uniformly yellow with black bands; high swarming and absconding tendency.",
        honeyYield: "Moderate.",
        temperament: "Highly aggressive (similar to Africanized bees).",
        climateSuitability: "Desert and semi-arid climates.",
        pros: ["Heat and drought tolerant", "Resistant to hornets"],
        cons: ["Extreme defensiveness", "Frequent swarming"],
        description: "A desert-adapted bee that has evolved ferocious defenses against predators like the Oriental Hornet."
    },
    "Egyptian Honey Bee": {
        scientificName: "Apis mellifera lamarckii",
        commonName: "Egyptian Bee",
        origin: "Nile Valley, Egypt",
        characteristics: "Small; dark with bright yellow markings on the abdomen; builds numerous queen cells.",
        honeyYield: "Low to moderate.",
        temperament: "Extremely nervous and defensive.",
        climateSuitability: "Hot desert climates.",
        pros: ["Resistant to Varroa", "Extremely heat tolerant"],
        cons: ["Cannot survive in non-tropical zones", "Difficult to manage"],
        description: "The bee of the Pharaohs, depicted in ancient Egyptian hieroglyphs."
    },
    // === WILD & SOLITARY BEES ===
    "Blue Orchard Mason Bee": {
        scientificName: "Osmia lignaria",
        commonName: "Mason Bee",
        origin: "North America",
        characteristics: "Metalic blue color; solitary (nests in holes); does not build wax combs.",
        honeyYield: "None (does not produce surplus honey).",
        temperament: "Extremely gentle; only stings if squeezed.",
        climateSuitability: "Temperate regions; active in early spring.",
        pros: ["Super-pollinator (95% pollination rate)", "Active in cool/wet weather"],
        cons: ["Short active season (4-6 weeks)"],
        description: "A solitary bee prized by orchardists; one mason bee can do the work of 100 honey bees for fruit tree pollination."
    },
    "Alfalfa Leafcutter Bee": {
        scientificName: "Megachile rotundata",
        commonName: "Leafcutter Bee",
        origin: "Eurasia (Now global)",
        characteristics: "Grayish color; solitary; cuts circular pieces of leaves to build nests.",
        honeyYield: "None.",
        temperament: "Gentle; non-aggressive.",
        climateSuitability: "Warm, dry climates.",
        pros: ["Specialized for alfalfa pollination"],
        cons: ["Vulnerable to parasites"],
        description: "The world's most managed solitary bee, essential for alfalfa seed production."
    },
    "Common Eastern Bumble Bee": {
        scientificName: "Bombus impatiens",
        commonName: "Bumble Bee",
        origin: "Eastern North America",
        characteristics: "Large and fuzzy; yellow and black; annual colonies (only queen survives winter).",
        honeyYield: "Negligible (only a few grams stored).",
        temperament: "Gentle but will defend nest; 'buzz' pollination.",
        climateSuitability: "Cooler climates; active in low light.",
        pros: ["Excellent for greenhouse pollination", "Buzz pollination (tomatoes)"],
        cons: ["Small colony size (50-400 individuals)"],
        description: "A social bee used extensively in greenhouse agriculture for crops that require vibration to release pollen."
    },
    "Carpenter Bee": {
        scientificName: "Xylocopa virginica",
        commonName: "Large Carpenter Bee",
        origin: "North America",
        characteristics: "Large (looks like a bumble bee but with a shiny black abdomen); solitary.",
        honeyYield: "None.",
        temperament: "Males are territorial but have no stinger; females sting only if provoked.",
        climateSuitability: "Temperate.",
        pros: ["Generalist pollinator"],
        cons: ["Can cause structural wood damage"],
        description: "Known for boring perfectly circular holes into wood to create their nests."
    },
    "Sweat Bee": {
        scientificName: "Halictidae Family",
        commonName: "Sweat Bee",
        origin: "Global",
        characteristics: "Often metallic green or blue; small; attracted to human perspiration.",
        honeyYield: "None.",
        temperament: "Mild; non-aggressive.",
        climateSuitability: "Variable; very common across many environments.",
        pros: ["Key pollinator of wildflowers"],
        cons: ["Minor nuisance (attracted to sweat)"],
        description: "A large family of bees, some solitary and some semi-social, important for maintaining biodiversity."
    },
    // === AFRICAN SUBSPECIES (MISSION CRITICAL) ===
    "West African Bee": {
        scientificName: "Apis mellifera adansonii",
        commonName: "Adanson's Honey Bee",
        origin: "West Africa",
        characteristics: "Yellow-banded; high growth rate; frequent swarming.",
        honeyYield: "High in tropical forests.",
        temperament: "Defensive but slightly less than scutellata.",
        climateSuitability: "Humid tropical forests.",
        pros: ["Adapted to high humidity", "Resistant to tropical pests"],
        cons: ["High swarming tendency"],
        description: "The primary honey producer of West Africa, perfectly adapted to the rainforest belt."
    },
    "East African Mountain Bee": {
        scientificName: "Apis mellifera monticola",
        commonName: "Mountain Bee",
        origin: "Mt. Kenya, Mt. Kilimanjaro",
        characteristics: "Large; very dark (almost black); hairier than lowland bees.",
        honeyYield: "Moderate.",
        temperament: "Notably gentle compared to lowland African bees.",
        climateSuitability: "High altitude; cold-hardy; moisture tolerant.",
        pros: ["Extremely gentle", "Cold resistance"],
        cons: ["Small native range"],
        description: "A unique high-altitude bee that exhibits a rare gentle temperament among African subspecies."
    },
    "East African Coastal Bee": {
        scientificName: "Apis mellifera litorea",
        commonName: "Coastal Bee",
        origin: "Coastal East Africa (Kenya/Tanzania)",
        characteristics: "Very small; bright yellow; high absconding frequency.",
        honeyYield: "Low to Moderate.",
        temperament: "Highly nervous and defensive.",
        climateSuitability: "Hot, humid coastal strips.",
        pros: ["Heat and salt tolerance"],
        cons: ["Difficult to keep in hives due to absconding"],
        description: "Specialized for life in the mangrove and coastal forests of the Indian Ocean edge."
    },
    "Cape Bee": {
        scientificName: "Apis mellifera capensis",
        commonName: "Cape Honey Bee",
        origin: "South Africa (Western Cape)",
        characteristics: "Unique ability for workers to lay female eggs (thelytoky) without mating.",
        honeyYield: "High in its native fynbos ecosystem.",
        temperament: "Gentle when pure; can be parasitic to other hives.",
        climateSuitability: "Mediterranean (Fynbos) climate.",
        pros: ["Thelytokous reproduction", "Excellent foragers"],
        cons: ["Social parasites of AHB (Social Parasitism)"],
        description: "A biological marvel where workers can produce new queens, making them essentially immortal as a colony lineage."
    },
    "Arabian Honey Bee": {
        scientificName: "Apis mellifera jemenitica",
        commonName: "Yemeni Bee",
        origin: "Arabian Peninsula, East Africa (Arid regions)",
        characteristics: "Smallest A. mellifera subspecies; light orange; resistant to extreme heat.",
        honeyYield: "Moderate (high for its size).",
        temperament: "Very defensive.",
        climateSuitability: "Hyper-arid; survives 50°C temperatures.",
        pros: ["Extreme heat tolerance", "Low water requirement"],
        cons: ["Nervous temperament"],
        description: "The hardiest bee for desert environments, found from Yemen to the arid plains of Kenya."
    },
    // === MORE WILD & STINGLESS BEES ===
    "African Stingless Bee": {
        scientificName: "Meliponula ferruginea",
        commonName: "Stingless Bee / Mopane Bee",
        origin: "Africa",
        characteristics: "Very small; no stinger (bites instead); stores honey in pots rather than combs.",
        honeyYield: "Very low (1-5 kg/year) but highly prized medicinal honey.",
        temperament: "Gentle but will crawl into hair/ears when defending.",
        climateSuitability: "Tropical and subtropical.",
        pros: ["Medicinal 'pot-honey'", "Excellent for greenhouse/small gardens"],
        cons: ["Low production", "Requires specialized hives"],
        description: "Native African stingless bees produce a unique, liquid honey used extensively in traditional medicine."
    },
    "Orchid Bee": {
        scientificName: "Euglossini Tribe",
        commonName: "Orchid Bee",
        origin: "The Americas",
        characteristics: "Brilliant metallic colors (green, gold, purple); very long tongues; males collect floral scents.",
        honeyYield: "None.",
        temperament: "Solitary and non-aggressive.",
        climateSuitability: "Tropical rainforests.",
        pros: ["Pollinates rare orchids", "Beautiful aesthetics"],
        cons: ["Does not produce honey"],
        description: "Known for their stunning metallic bodies and the complex perfume-making behavior of the males."
    },
    "Wool Carder Bee": {
        scientificName: "Anthidium manicatum",
        commonName: "Wool Carder",
        origin: "Europe (Introduced to NA)",
        characteristics: "Yellow and black markers; males are larger than females; territorial; cards plant 'wool'.",
        honeyYield: "None.",
        temperament: "Highly territorial males; will attack other bees.",
        climateSuitability: "Temperate.",
        pros: ["Unique nesting biology"],
        cons: ["Can be aggressive to other pollinators"],
        description: "Named for the behavior of females who scrape hairs from plants to line their nests."
    },
    // === MIDDLE EASTERN & ASIAN SUBSPECIES (EXPANDED) ===
    "Armenian Honey Bee": {
        scientificName: "Apis mellifera remipes",
        commonName: "Armenian Bee",
        origin: "Armenia, Georgia",
        characteristics: "Medium size; dark gray; notably long tongue (up to 7.1mm); high propolis use.",
        honeyYield: "High in mountain meadows.",
        temperament: "Nervous and defensive; difficult for beginners.",
        climateSuitability: "Continental; mountain climates.",
        pros: ["Superior foraging in deep flowers", "Cold hardy"],
        cons: ["Excessive defensive behavior", "Heavy propolis"],
        description: "A mountain specialist. BeeYield's high-altitude sensors are the only tech capable of monitoring these colonies in their native Caucasian peaks."
    },
    "Iranian Honey Bee": {
        scientificName: "Apis mellifera meda",
        commonName: "Median Bee / Iranian Gray",
        origin: "Iran, Iraq, SE Turkey",
        characteristics: "Greyish-yellow; small; extremely high swarming tendency; aggressive.",
        honeyYield: "Moderate.",
        temperament: "Highly aggressive.",
        climateSuitability: "Arid and semi-arid with cold winters.",
        pros: ["Adaptable to desert margins", "Rapid buildup"],
        cons: ["Dangerous temperament", "Incessant swarming"],
        description: "A hardy bee that BeeYield researchers use to test colony stress responses in hyper-arid environments."
    },
    "Cyprian Honey Bee": {
        scientificName: "Apis mellifera cypria",
        commonName: "Cypriot Bee",
        origin: "Cyprus",
        characteristics: "Small and very yellow; most defensive European subspecies; resistant to hornets.",
        honeyYield: "High for its size.",
        temperament: "Extremely vicious; attacks instantly.",
        climateSuitability: "Dry Mediterranean.",
        pros: ["Predator resistance (Vespa spp.)", "Drought tolerant"],
        cons: ["Manageability is near zero for amateurs"],
        description: "Known as the most defensive bee in Europe, the Cypriot bee is perfectly monitored by BeeYield's remote IR cameras."
    },
    "Tellian Honey Bee": {
        scientificName: "Apis mellifera intermissa",
        commonName: "Tellian Black Bee",
        origin: "Maghreb (Tunisia, Algeria, Morocco)",
        characteristics: "Jet black; high brood rearing flexibility; extremely high swarming.",
        honeyYield: "High in good rain years.",
        temperament: "Very defensive; 'nervous' on the comb.",
        climateSuitability: "Mediterranean/Arid transition zones.",
        pros: ["Total synchrony with local floral pulses", "Varroa tolerance"],
        cons: ["High swarm rate", "Aggression"],
        description: "The primary honey bee of North Africa. BeeYield's predictive swarming models are vital for managing this subspecies."
    },
    "Indian Hive Bee": {
        scientificName: "Apis cerana indica",
        commonName: "Indian Bee",
        origin: "Indian Subcontinent",
        characteristics: "Small body; striped; nests in cavities; builds parallel combs.",
        honeyYield: "6-12 kg/year.",
        temperament: "Gentle and calm.",
        climateSuitability: "Tropical to high altitude (Himalayas).",
        pros: ["Resistant to Varroa", "Low resource requirement"],
        cons: ["Prone to frequent absconding"],
        description: "The domesticated Asian bee. BeeYield is at the forefront of 'Cerana-Intelligent' apiary tech for the rural Indian market."
    },
    // === STINGLESS BEES (MELIPONICULTURE) ===
    "Sugarbag Bee": {
        scientificName: "Tetragonula carbonaria",
        commonName: "Australian Stingless Bee",
        origin: "Australia (QLD/NSW)",
        characteristics: "Tiny (4mm); black; builds spiral brood combs; no stinger.",
        honeyYield: "500g - 1kg/year.",
        temperament: "Perfectly gentle; 'eyes-only' defense during hive opening.",
        climateSuitability: "Subtropical and tropical Australia.",
        pros: ["Iconic spiral hives", "Exceptional for garden pollination", "Sting-free"],
        cons: ["Low honey yield"],
        description: "A favorite for urban pollination. BeeYield's micro-sensors tiny enough for these hives are currently in beta testing."
    },
    "Angelita Bee": {
        scientificName: "Tetragonisca angustula",
        commonName: "Angelita",
        origin: "Central and South America",
        characteristics: "Yellow; very small; builds wax tubes for hive entrances.",
        honeyYield: "1-2 kg/year (High medicinal value).",
        temperament: "Extremely gentle.",
        climateSuitability: "Tropical rainforests.",
        pros: ["Medicinal honey", "Easy to keep in small urban spaces"],
        cons: ["Vulnerable to phorid flies"],
        description: "The most popular stingless bee in Latin America. BeeYield is the 'go-to' for tracking medicinal honey bath-production."
    },
    "Mayan Stingless Bee": {
        scientificName: "Melipona beecheii",
        commonName: "Xunán-Kab",
        origin: "Yucatan Peninsula",
        characteristics: "Golden color; large for a stingless bee; historical significance to Mayans.",
        honeyYield: "2-3 kg/year.",
        temperament: "Very gentle.",
        climateSuitability: "Tropical dry forests.",
        pros: ["Cultural heritage", "Premium boutique honey"],
        cons: ["Endangered by deforestation"],
        description: "Sacred to the Mayans. BeeYield supports conservation projects using IoT to protect these ancient lineages."
    },
    "Dammar Bee": {
        scientificName: "Tetragonula laeviceps",
        commonName: "Dammar Stingless Bee",
        origin: "Southeast Asia",
        characteristics: "Black; small; collects large amounts of tree resin (propolis/dammar).",
        honeyYield: "500g - 1kg/year.",
        temperament: "Docile.",
        climateSuitability: "Wet tropical Asia.",
        pros: ["Propolis producer", "Resilient to tropical pests"],
        cons: ["Small hive volume"],
        description: "Known for the quality of its resin. BeeYield's 'Dammar-Sense' nodes provide real-time resin-flow analytics."
    },
    "Western Dark Bee": {
        scientificName: "Apis mellifera mellifera",
        commonName: "German Black Bee / European Dark Bee",
        origin: "Northern and Western Europe",
        characteristics: "Dark-bodied, compact, and conservative in brood rearing; stores heavily for winter and flies in cool weather windows.",
        honeyYield: "Moderate to high in heather, moorland, and mixed temperate forage.",
        temperament: "Can be defensive if crossed, but stable and steady in well-selected lines.",
        climateSuitability: "Cold, wet, and windy northern climates with long winters.",
        pros: ["Excellent winter thrift", "Strong disease resilience in local strains", "Good in cool coastal weather"],
        cons: ["Can be defensive", "Slow spring buildup compared with Italian lines"],
        description: "A classic northern European bee valued by conservation breeders for hardiness, thrift, and adaptation to long, damp winters."
    },
    "Iberian Honey Bee": {
        scientificName: "Apis mellifera iberiensis",
        commonName: "Iberian Bee",
        origin: "Spain and Portugal",
        characteristics: "Highly variable dark-to-banded coloration; agile flyers; adapts quickly to dry forage pulses and rugged landscapes.",
        honeyYield: "Moderate to high when matched to rosemary, eucalyptus, chestnut, and wild scrub flows.",
        temperament: "Alert and defensive under pressure, but productive in experienced hands.",
        climateSuitability: "Mediterranean climates with hot dry summers and mild, wet winters.",
        pros: ["Drought tolerant", "Strong orientation ability", "Performs well on sparse forage"],
        cons: ["Can become defensive", "Swarming pressure rises if nectar arrives suddenly"],
        description: "A regionally adapted honey bee shaped by Iberia's sharp seasonal shifts, prized where heat tolerance and fast foraging matter."
    },
    "Himalayan Cliff Bee": {
        scientificName: "Apis laboriosa",
        commonName: "Himalayan Giant Honey Bee",
        origin: "Himalayan foothills of Nepal, Bhutan, and northern India",
        characteristics: "Massive open-nesting honey bee that hangs single combs from cliffs and migrates with altitude and bloom cycles.",
        honeyYield: "High per colony in wild harvest settings, though it is not managed in standard hives.",
        temperament: "Highly defensive when nesting; resilient in harsh alpine exposure.",
        climateSuitability: "Cool high-altitude mountain zones with seasonal floral migrations.",
        pros: ["Exceptional cold tolerance", "Long foraging flights", "Important wild pollinator of mountain flora"],
        cons: ["Not suitable for standard hive management", "Dangerous to harvest", "Migratory nesting behavior"],
        description: "The world's largest honey bee, famous for cliff nesting and high-elevation honey hunting traditions across the Himalayas."
    },
    "Red Dwarf Honey Bee": {
        scientificName: "Apis andreniformis",
        commonName: "Black Dwarf Honey Bee",
        origin: "Southeast Asia",
        characteristics: "Tiny open-nesting bee with reddish to black abdomen bands; builds small exposed combs in shrubs and low branches.",
        honeyYield: "Very low; mainly valuable as a wild pollinator rather than a honey producer.",
        temperament: "Generally mild, quick, and evasive rather than confrontational.",
        climateSuitability: "Warm humid tropical forests and edge habitats.",
        pros: ["Efficient on small blossoms", "Low space requirements in the wild", "Adapted to tropical heat"],
        cons: ["Minimal harvest potential", "Open nesting makes management difficult", "Absconds readily"],
        description: "A close relative of the dwarf honey bee, important in tropical pollination webs but poorly suited to commercial hive systems."
    },
    "Jatai Stingless Bee": {
        scientificName: "Tetragonisca fiebrigi",
        commonName: "Jatai Bee",
        origin: "South America",
        characteristics: "Very small golden stingless bee that builds resin entrance tubes and thrives in compact urban and forest-edge nests.",
        honeyYield: "Low, but the honey is highly prized for flavor and medicinal use.",
        temperament: "Very gentle and easy to work around homes, schools, and gardens.",
        climateSuitability: "Warm subtropical and tropical climates.",
        pros: ["Safe for urban meliponiculture", "Excellent pollinator of small fruits and vegetables", "High-value specialty honey"],
        cons: ["Sensitive to cold snaps", "Small colonies limit production", "Needs protected hive design"],
        description: "One of the most approachable stingless bees for small-scale keepers, especially where education, pollination, and specialty honey matter more than volume."
    },
    "Tawny Mining Bee": {
        scientificName: "Andrena fulva",
        commonName: "Tawny Mining Bee",
        origin: "Europe and western Asia",
        characteristics: "Rust-orange solitary ground nester active in spring; females excavate burrows in sunny bare soil near fruit bloom.",
        honeyYield: "None.",
        temperament: "Solitary and non-aggressive; stings are extremely rare.",
        climateSuitability: "Temperate spring climates with open soil and orchard bloom.",
        pros: ["Powerful early-season pollinator", "Excellent for apples and pears", "Easy to support through habitat planting"],
        cons: ["Short seasonal activity", "Requires undisturbed bare ground", "No honey production"],
        description: "A charismatic spring solitary bee that helps orchard pollination and signals healthy nesting habitat in low-disturbance landscapes."
    },
    "Red Mason Bee": {
        scientificName: "Osmia bicornis",
        commonName: "Red Mason Bee",
        origin: "Europe",
        characteristics: "Rusty thorax and black abdomen; nests in drilled cavities and reeds; active early in the season.",
        honeyYield: "None.",
        temperament: "Docile and easy to manage around homes and orchards.",
        climateSuitability: "Cool temperate orchards and mixed gardens.",
        pros: ["Outstanding orchard pollinator", "Works in cooler spring weather", "Simple cavity-nest management"],
        cons: ["Short flight season", "Sensitive to poor nest sanitation", "No honey production"],
        description: "One of Europe's most important solitary orchard bees, often used as a precision pollinator for apples, pears, and stone fruit."
    },
    "Blue-banded Bee": {
        scientificName: "Amegilla cingulata",
        commonName: "Blue-banded Bee",
        origin: "Australia and the western Pacific",
        characteristics: "Fast-flying solitary bee with metallic blue abdominal bands; nests in soft mortar, soil banks, and earthen cavities.",
        honeyYield: "None.",
        temperament: "Solitary and generally non-aggressive.",
        climateSuitability: "Warm subtropical and Mediterranean climates with long flowering windows.",
        pros: ["Excellent buzz pollinator", "Strong performer on tomatoes and eggplants", "Useful in protected cropping"],
        cons: ["Needs specific nesting substrate", "Shorter lifespan than honey bees", "No honey harvest"],
        description: "A specialist buzz pollinator valued in greenhouse and field vegetable systems where vibration pollination improves fruit set."
    },
    "Giant Resin Bee": {
        scientificName: "Megachile sculpturalis",
        commonName: "Giant Resin Bee",
        origin: "East Asia",
        characteristics: "Large dark leafcutter-relative that nests in wood cavities and lines nests with resin rather than leaf discs.",
        honeyYield: "None.",
        temperament: "Solitary and usually calm, though competitive for nesting cavities.",
        climateSuitability: "Warm temperate to subtropical habitats with abundant flowering shrubs and nesting holes.",
        pros: ["Strong summer pollinator", "Resin-based nesting biology", "Adapts to urban landscapes"],
        cons: ["Can compete with native cavity nesters", "Requires nesting cavities", "No honey production"],
        description: "A large cavity-nesting pollinator known for resin use and strong summer activity, increasingly observed in urban and peri-urban habitats."
    },
    "Heather Mining Bee": {
        scientificName: "Colletes succinctus",
        commonName: "Heather Colletes Bee",
        origin: "Europe",
        characteristics: "Specialist solitary bee strongly associated with late-summer heather bloom and sandy nesting ground.",
        honeyYield: "None.",
        temperament: "Solitary and mild.",
        climateSuitability: "Heathland, dunes, and dry sandy temperate habitats.",
        pros: ["Key pollinator of heather ecosystems", "Late-season floral specialist", "Useful ecological indicator species"],
        cons: ["Highly dependent on specific forage", "Sensitive to habitat loss", "No honey production"],
        description: "A habitat-specialist solitary bee that reflects the health of heather landscapes and late-season wild pollinator networks."
    }
};
