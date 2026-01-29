interface KnowledgeCategory {
    keywords: string[];
    topics: {
        keywords: string[];
        content: string;
    }[];
    default: string;
}

export class LocalIntelligenceService {
    private static instance: LocalIntelligenceService;
    private knowledgeBase: Record<string, KnowledgeCategory>;

    private constructor() {
        this.knowledgeBase = {
            diseases: {
                keywords: ['disease', 'sick', 'illness', 'pest', 'mite', 'virus', 'infection', 'health problem', 'symptom', 'treatment'],
                topics: [
                    {
                        keywords: ['varroa', 'mite', 'destructor'],
                        content: "**Varroa Mites (Varroosis)**:\n\n*Symptoms*: Malformed wings, weakened bees, dead larvae/uncapped pupae, red/brown mites visible on bees.\n*Treatment*: Oxalic acid (dribble/vapor), Formic acid strips, Thymol, Apivar. Integrated Pest Management (IPM) includes screened bottom boards and drone brood removal."
                    },
                    {
                        keywords: ['afb', 'american foulbrood', 'foulbrood'],
                        content: "**American Foulbrood (AFB)**:\n\n*Symptoms*: Spotted brood pattern, sunken/greasy cappings, 'ropey' dead larvae (brown goo stretches 2cm), distinct foul odor.\n*Treatment*: **Critical** - Antibiotics (Terramycin) can treat early stages (requires vet prescription usually). Severe cases require burning the hive and equipment. Spores last 40+ years."
                    },
                    {
                        keywords: ['efb', 'european foulbrood'],
                        content: "**European Foulbrood (EFB)**:\n\n*Symptoms*: Spotty brood, larvae turn yellow/brown and curl upwards (corkscrew), sour smell. Does NOT rope like AFB.\n*Treatment*: Re-queening, improving nutrition, antibiotic treatment (Terramycin) in severe cases. Often clears up with strong nectar flow."
                    },
                    {
                        keywords: ['nosema', 'diarrhea', 'dysentery'],
                        content: "**Nosema (Nosemosis)**:\n\n*Symptoms*: Dysentery (streaking on hive front), disjointed wings, crawling bees, slow spring buildup.\n*Treatment*: Fumagimpin-B (if legal in region), good nutrition, and sterilizing combs (acetic acid or irradiation)."
                    },
                    {
                        keywords: ['chalkbrood', 'chalk', 'mummy'],
                        content: "**Chalkbrood** (Fungal):\n\n*Symptoms*: Larvae turn into hard white/grey 'mummies' found on bottom board or in cells.\n*Treatment*: No chemical cure. Increase ventilation, place hive in sun, remove mummified larvae, and keep colony strong."
                    },
                    {
                        keywords: ['wax moth', 'moth'],
                        content: "**Wax Moths**:\n\n*Symptoms*: Webbing tunnels through comb, destroyed wax/brood.\n*Treatment*: Strong colonies defend themselves. Freezing frames kills eggs/larvae. Paramoth crystals for stored supers (air out before use)."
                    },
                    {
                        keywords: ['beetle', 'shb', 'small hive beetle'],
                        content: "**Small Hive Beetle (SHB)**:\n\n*Symptoms*: Fermented honey (slimy), larvae tunneling through comb.\n*Treatment*: Oil traps (Swiffer sheets), keeping hives in full sun, maintaining strong colonies, and nematode soil treatment ground drench."
                    }
                ],
                default: "Specific bee diseases include Varroa Mites, American/European Foulbrood, Nosema, and Chalkbrood. Please specify the disease or symptoms you're observing for more details."
            },
            honey: {
                keywords: ['honey', 'nectar', 'taste', 'flavor', 'type', 'variety'],
                topics: [
                    {
                        keywords: ['acacia'],
                        content: "**Acacia Honey**: Clear, very light color. Mild, sweet floral flavor. High fructose content means it crystallizes very slowly. Popular in Europe."
                    },
                    {
                        keywords: ['manuka'],
                        content: "**Manuka Honey**: From New Zealand/Australia. Dark, earthy, medicinal flavor. Famous for antibacterial properties (measured by UMF/MGO rating)."
                    },
                    {
                        keywords: ['clover'],
                        content: "**Clover Honey**: The classic table honey. Light amber, mild, sweet, with hints of cinnamon/nutmeg. Crystallizes relatively quickly."
                    },
                    {
                        keywords: ['buckwheat'],
                        content: "**Buckwheat Honey**: Very dark, resembling molasses. Strong, distinct, malty/earthy flavor. High in antioxidants."
                    },
                    {
                        keywords: ['moisture', 'water content'],
                        content: "**Honey Moisture**: Honey should generally be below 18-19% moisture to prevent fermentation. Use a refractometer to test uncapped honey before harvest."
                    },
                    {
                        keywords: ['crystalliz', 'sugar', 'hard'],
                        content: "**Crystallization**: A natural process where glucose separates from water. Raw honey crystallizes faster. To reliquefy, gently warm in a water bath not exceeding 40°C (104°F) to preserve enzymes."
                    },
                    {
                        keywords: ['wildflower', 'polyfloral'],
                        content: "**Wildflower Honey**: Also known as Polyfloral. Made from nectar of various flowers. Flavor and color vary seasonally and regionally."
                    }
                ],
                default: "Honey varieties depend on the floral source. Common types include Clover, Acacia, Manuka, and Wildflower. I can also explain moisture content and crystallization."
            },
            bees: {
                keywords: ['queen', 'worker', 'drone', 'caste', 'lifecycle', 'egg', 'larva'],
                topics: [
                    {
                        keywords: ['queen'],
                        content: "**The Queen**: The mother of the colony. Lays up to 2,000 eggs/day. \n*Lifespan*: 2-5 years.\n*Development*: 16 days from egg to emergence. Fed exclusive Royal Jelly."
                    },
                    {
                        keywords: ['worker'],
                        content: "**Worker Bee** (Female): Performs all hive tasks (cleaning, nursing, guarding, foraging). \n*Lifespan*: ~6 weeks in summer, 4-6 months in winter.\n*Development*: 21 days."
                    },
                    {
                        keywords: ['drone'],
                        content: "**Drone** (Male): Sole purpose is to mate with a virgin queen. No stinger. \n*Lifespan*: ~55 days (or until mating). expelled before winter.\n*Development*: 24 days."
                    },
                    {
                        keywords: ['lifecycle', 'stage'],
                        content: "**Lifecycle**: Egg (3 days) -> Larva (eating phase, ~6 days) -> Pupa (metamorphosis in capped cell) -> Adult. \n*Total time*: Queen (16d), Worker (21d), Drone (24d)."
                    }
                ],
                default: "The colony consists of the Queen (reproductive female), Workers (sterile females), and Drones (males). Each has a specific lifecycle and role."
            },
            apiary: {
                keywords: ['manage', 'seasonal', 'calendar', 'spring', 'summer', 'winter', 'fall', 'location'],
                topics: [
                    {
                        keywords: ['spring'],
                        content: "**Spring Management (Mar-May)**: \n- Check for starvation (feed 1:1 syrup if needed).\n- Reverse brood boxes to encourage expansion.\n- Swarm prevention (checkerboarding, splitting).\n- Add honey supers as nectar flow begins."
                    },
                    {
                        keywords: ['summer'],
                        content: "**Summer Management (Jun-Aug)**: \n- Add supers for honey storage.\n- Monitor ventilation.\n- Harvest spring honey.\n- Check for Varroa mites.\n- Ensure water source is available."
                    },
                    {
                        keywords: ['fall', 'autumn'],
                        content: "**Fall Management (Sep-Nov)**: \n- Harvest surplus honey.\n- Treat for mites (critical for winter bees).\n- Feed 2:1 heavy syrup for winter stores.\n- Install mouse guards.\n- Reduce entrances."
                    },
                    {
                        keywords: ['winter'],
                        content: "**Winter Management (Dec-Feb)**: \n- Minimal disturbance. \n- Ensure adequate ventilation to prevent moisture.\n- Periodic hive weight checks (heft test).\n- Emergency feeding (fondant/sugar bricks) if light."
                    }
                ],
                default: "Apiary management is seasonal: Spring (expansion/swarming), Summer (production), Fall (prep for winter), and Winter (survival). Ask about a specific season for details."
            },
            pollination: {
                keywords: ['pollination', 'crop', 'stocking', 'yield', 'precision'],
                topics: [
                    {
                        keywords: ['stocking', 'rate', 'density'],
                        content: "**Stocking Rates** (Hives per hectare/acre):\n- *Almonds*: 5-8 hives/ha.\n- *Apples*: 2-5 hives/ha.\n- *Blueberries*: 4-10 hives/ha (higher density improves berry size).\n- *Canola*: 2-3 hives/ha.\n- *Cucurbits (Melons/Pumpkins)*: 2-4 hives/ha."
                    },
                    {
                        keywords: ['tomato'],
                        content: "**Tomato Pollination**: Honey bees are poor tomato pollinators (they don't buzz pollinate). Bumblebees (*Bombus*) are preferred for greenhouse tomatoes. Precision pollination can use acoustic stimulation."
                    },
                    {
                        keywords: ['precision'],
                        content: "**Precision Pollination**: Optimizing yield by managing hive placement and density based on crop phenology. Involves using sensors to track bee flight activity vs. bloom intensity to ensure maximum fruit set."
                    }
                ],
                default: "Precision pollination involves matching hive density to crop requirements (Stocking Rates) and timing. It's critical for crops like Almonds, Apples, and Berries."
            },
            botany: {
                keywords: ['plant', 'flower', 'forage', 'nectar', 'pollen', 'bloom', 'tree', 'shrub'],
                topics: [
                    {
                        keywords: ['nectar', 'major source'],
                        content: "**Major Nectar Sources**: \n- *Clover (Trifolium)*: High yield, light honey.\n- *Acacia/Locust*: Very clear, slow crystallizing.\n- *Basswood/Linden*: Minty flavor, heavy flow.\n- *Canola/Rapeseed*: Crystallizes rapidly (days).\n- *Sunflower*: Late summer flow, golden honey."
                    },
                    {
                        keywords: ['pollen', 'protein'],
                        content: "**Pollen Sources**: \n- *Willow*: Critical early spring protein.\n- *Fruit Trees* (Apple/Cherry/Plum): Spring build-up.\n- *Goldenrod*: Late fall protein for winter bees.\n- *Maple*: Very early pollen."
                    },
                    {
                        keywords: ['toxic'],
                        content: "**Toxic Plants**: \n- *Rhododendron*: Can produce 'Mad Honey' (grayanotoxins).\n- *California Buckeye*: Toxic pollen can deform larvae."
                    }
                ],
                default: "Key forage plants include Clover, Basswood, Acacia, and Goldenrod. Diverse forage provides balanced nutrition (nectar for carbs, pollen for protein)."
            },
            equipment: {
                keywords: ['hive', 'box', 'frame', 'tool', 'equipment', 'langstroth', 'top bar', 'warre', 'smoker'],
                topics: [
                    {
                        keywords: ['langstroth'],
                        content: "**Langstroth Hive**: The standard vertical modular hive.\n*Pros*: Interchangeable parts, high honey production, movable frames.\n*Cons*: Heavy lifting (50-90lbs/box). Most common globally."
                    },
                    {
                        keywords: ['top bar', 'tbh'],
                        content: "**Top Bar Hive (TBH)**: Horizontal hive, no heavy lifting.\n*Pros*: Cheap/DIY friendly, natural comb (no foundation), ergonomic.\n*Cons*: Lower honey yields, comb is fragile."
                    },
                    {
                        keywords: ['warre'],
                        content: "**Warre Hive**: 'The People's Hive'. Vertical top bar.\n*Pros*: Low maintenance, mimics tree hollow, excellent overwintering.\n*Cons*: Difficult to inspect, adding boxes to bottom (nadiring) is heavy."
                    },
                    {
                        keywords: ['smoker', 'tool'],
                        content: "**Essential Tools**: \n- *Smoker*: Masks alarm pheromones, keeps bees calm.\n- *Hive Tool*: For prying apart frames/propolis.\n- *Veil/Suit*: Protection.\n- *Queen Excluder*: Keeps queen out of honey supers."
                    }
                ],
                default: "Common hive types are Langstroth (standard production), Top Bar (natural/ergonomic), and Warre. Essential tools include a smoker and hive tool."
            },
            products: {
                keywords: ['propolis', 'wax', 'jelly', 'venom', 'pollen granule', 'bread'],
                topics: [
                    {
                        keywords: ['propolis'],
                        content: "**Propolis** (Bee Glue): Resin collected from buds.\n*Uses*: Hive sealant, antimicrobial/antiviral health supplements, throat sprays, wood varnish."
                    },
                    {
                        keywords: ['royal jelly'],
                        content: "**Royal Jelly**: Superfood secretion for queens.\n*Uses*: Cosmetics (collagen boosting), health supplements (fertility/vitality). Highly perishable."
                    },
                    {
                        keywords: ['wax', 'beeswax'],
                        content: "**Beeswax**: Secreted by worker glands.\n*Uses*: Candles (clean burning), cosmetics (balms/creams), waterproofing, food wraps."
                    },
                    {
                        keywords: ['venom', 'apitherapy'],
                        content: "**Bee Venom**: Contains melittin.\n*Uses*: Apitherapy for arthritis/inflammation, skincare (to stimulate blood flow)."
                    },
                    {
                        keywords: ['pollen', 'bread'],
                        content: "**Bee Pollen/Bread**: Fermented pollen packed in cells.\n*Uses*: Complete protein source, allergy desensitization (local pollen)."
                    }
                ],
                default: "Besides honey, hives produce Propolis (medicinal glue), Beeswax, Royal Jelly, and Bee Pollen. Each has unique commercial and health values."
            },
            queens: {
                keywords: ['rearing', 'grafting', 'genetics', 'race', 'breed', 'italian', 'carniolan', 'russian', 'buckfast'],
                topics: [
                    {
                        keywords: ['rearing', 'grafting'],
                        content: "**Queen Rearing**: \n- *Grafting*: Transferring <24hr larvae to queen cups.\n- *Cloake Board*: High-production method using queen-less starter/finisher colonies.\n- *Nicot System*: Non-grafting system where queen lays directly into cups."
                    },
                    {
                        keywords: ['race', 'breed', 'italian'],
                        content: "**Italian (*A. m. ligustica*)**: Most popular. Gentle, excellent foragers, big brood. \n*Cons*: Prone to robbing, eats heavy winter stores."
                    },
                    {
                        keywords: ['carniolan'],
                        content: "**Carniolan (*A. m. carnica*)**: Dark bee. Very gentle, explosive spring buildup, winters with small clusters. \n*Cons*: High swarming tendency."
                    },
                    {
                        keywords: ['russian'],
                        content: "**Russian**: Resistant to Varroa mites. Winter hardy. \n*Cons*: Can be defensive, buildup depends on resources."
                    }
                ],
                default: "Queen genetics define your apiary. Common races are Italian (production), Carniolan (gentle/spring buildup), and Russian (mite resistance). Rearing methods include grafting and the Nicot system."
            },
            biology: {
                keywords: ['anatomy', 'gut', 'respiratory', 'pheromone', 'senses', 'vision', 'gland'],
                topics: [
                    {
                        keywords: ['pheromone', 'communication'],
                        content: "**Pheromones**: \n- *Queen Mandibular (QMP)*: Suppresses worker ovaries, signals queen presence.\n- *Alarm (Banana smell)*: Triggers defense/stinging.\n- *Nasonov (Lemongrass smell)*: Orientation/homing signal."
                    },
                    {
                        keywords: ['anatomy', 'digestive'],
                        content: "**Anatomy**: \n- *Honey Crop*: Specialized stomach for carrying nectar.\n- *Spiracles*: 10 pairs of breathing holes (no lungs).\n- *Hypopharyngeal Glands*: Produce royal jelly."
                    },
                    {
                        keywords: ['senses', 'vision'],
                        content: "**Senses**: \n- *Vision*: See UV light (flower guides) but red looks black.\n- *Smell*: Antennae have 170 odor receptors (better than dogs)."
                    }
                ],
                default: "Honey bees are biological marvels. They communicate via pheromones (chemical signals), see in UV, and have a specialized honey crop for transporting nectar."
            },
            history: {
                keywords: ['history', 'langstroth', 'dzierzon', 'skep', 'ancient', 'regulation', 'labeling'],
                topics: [
                    {
                        keywords: ['history', 'langstroth'],
                        content: "**History**: \n- *Lorenzo Langstroth (1851)*: Discovered 'Bee Space' (3/8 inch), invented the movable frame hive.\n- *Johann Dzierzon*: Discovered parthenogenesis (drones have no father)."
                    },
                    {
                        keywords: ['skep'],
                        content: "**Skeps**: Ancient straw basket hives. \n*Cons*: Must kill colony to harvest honey. Illegal in many places now (can't inspect for disease)."
                    },
                    {
                        keywords: ['regulation', 'label'],
                        content: "**Regulations**: \n- *Pesticides*: Neonics are restricted in EU due to bee toxicity.\n- *Honey Labeling*: Strict rules against adulteration (syrup mixing). Country of Origin often required."
                    }
                ],
                default: "Beekeeping has a rich history from ancient Skeps to Langstroth's movable frames (1851). Modern challenges include pesticide regulations and honey purity laws."
            },
            environment: {
                keywords: ['environment', 'pesticide', 'climate', 'bioindicator', 'neonic'],
                topics: [
                    {
                        keywords: ['pesticide', 'neonic'],
                        content: "**Pesticides**: \n- *Neonicotinoids*: Systemic neurotoxins that impair bee navigation and memory.\n- *Fungicides*: Can kill beneficial gut bacteria."
                    },
                    {
                        keywords: ['climate'],
                        content: "**Climate Change**: Shifts bloom times (phenology mismatch), causing starvation if bees emerge before flowers."
                    },
                    {
                        keywords: ['bioindicator'],
                        content: "**Bioindicators**: Bees sample the environment (water, dust, nectar) within 3km. Their health reflects the ecosystem's pollution levels."
                    }
                ],
                default: "Bees are key bioindicators. They are heavily impacted by pesticides (neonics), habitat loss, and climate change affecting bloom timing."
            },
            harvesting: {
                keywords: ['harvest', 'extract', 'pull', 'fume board', 'escape', 'uncap', 'spin', 'bottle', 'honey removal'],
                topics: [
                    {
                        keywords: ['remove', 'fume', 'board', 'escape'],
                        content: "**Removing Bees**: \n- *Fume Board*: Fast/Chemical. Solar heat drives bees down with repellent (Bee-Go). Good for commercial.\n- *Bee Escape*: Slow/Gentle. One-way doors clear supers in 24-48hrs. No chemicals.\n- *Blower*: Physical removal, loud but effective."
                    },
                    {
                        keywords: ['extract', 'process', 'step', 'uncap'],
                        content: "**Extraction Steps**: \n1. **Uncap**: Remove wax cappings with hot knife/scratcher.\n2. **Spin**: Centrifugal extractor throws honey out.\n3. **Filter**: Strain through 200-600 micron mesh.\n4. **Bottle**: Let settle 24hrs to remove air bubbles."
                    }
                ],
                default: "Harvesting involves removing bees (Fume Board/Escape) and extracting honey (Uncap -> Spin -> Filter). Always check moisture <18% before pulling."
            },
            detection: {
                keywords: ['detect', 'test', 'monitor', 'count', 'alcohol', 'sugar', 'wash', 'roll', 'holst', 'sample'],
                topics: [
                    {
                        keywords: ['alcohol', 'wash', 'mite', 'varroa'],
                        content: "**Alcohol Wash (Gold Standard)**: \n1. Scoop ½ cup bees (~300) from brood frame (Check for Queen first!).\n2. Add alcohol, seal, and shake vigorously for 60s.\n3. Count mites. >9 mites (3%) = Critical, Immediate Treatment needed."
                    },
                    {
                        keywords: ['sugar', 'roll'],
                        content: "**Sugar Roll**: \n- *Pros*: Non-lethal to bees.\n- *Cons*: Less accurate than alcohol.\n- *Method*: Coat bees in powdered sugar, shake mites through mesh, return bees to hive."
                    },
                    {
                        keywords: ['holst', 'milk', 'afb'],
                        content: "**Holst Milk Test (for AFB)**: \n1. Drop suspect larval scale/goo into a tube with weak milk solution.\n2. Incubate warm.\n3. *Positive*: Enzyme clears the milk (turns brown/transparent). *Negative*: Stays milky."
                    }
                ],
                default: "Key field tests: **Alcohol Wash** for Varroa (measure infestation %) and **Holst Milk Test** for confirming American Foulbrood."
            },
            management: {
                keywords: ['swarm', 'control', 'split', 'demaree', 'snelgrove', 'laying worker', 'supercedure', 'cell'],
                topics: [
                    {
                        keywords: ['swarm', 'control', 'demaree'],
                        content: "**Swarm Control (Demaree)**: \n- *Method*: Separate Queen (bottom box) from brood (top box) with clear supers and excluder in between.\n- *Effect*: Relieves congestion, prevents swarming while keeping strong workforce for honey."
                    },
                    {
                        keywords: ['laying worker', 'worker'],
                        content: "**Laying Workers**: \n- *Sign*: Multiple eggs per cell, spotty drone brood in worker cells.\n- *Fix*: Difficult. Best to combine with a strong queen-right colony (newspaper method) or shake bees out 100 yards away."
                    },
                    {
                        keywords: ['queen cell', 'cup'],
                        content: "**Reading Queen Cells**: \n- *Swarm Cells*: Numerous, on bottom edges of frames. Colony wants to divide.\n- *Supersedure Cells*: Few (<3), often in middle of face. Queen is failing, they are replacing her."
                    }
                ],
                default: "Advanced management includes Swarm Control (Splits/Demaree) and fixing issues like Laying Workers. Identifying cell types (Swarm vs Supersedure) is critical."
            }
        };
    }

    public static getInstance(): LocalIntelligenceService {
        if (!LocalIntelligenceService.instance) {
            LocalIntelligenceService.instance = new LocalIntelligenceService();
        }
        return LocalIntelligenceService.instance;
    }

    public async chat(message: string): Promise<string> {
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 600));

        const lowerMsg = message.toLowerCase();

        // 1. Try to find a matching category
        let bestCategoryKey: string | null = null;
        for (const [key, category] of Object.entries(this.knowledgeBase)) {
            if (category.keywords.some(k => lowerMsg.includes(k))) {
                bestCategoryKey = key;
                break; // Prioritize the first matching category concept
            }
        }

        // 2. If a category is found, search for specific topics
        if (bestCategoryKey) {
            const category = this.knowledgeBase[bestCategoryKey];
            for (const topic of category.topics) {
                if (topic.keywords.some(k => lowerMsg.includes(k))) {
                    return topic.content;
                }
            }
            // 3. Fallback to category default if no specific topic matches
            return category.default;
        }

        // 4. Handle generic conversational greetings/questions
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi ') || lowerMsg.includes('hey')) {
            return "Hello! I am the BeeYield Intelligence System (v2026.1). I am online and ready to assist with Hive Health, Disease Diagnostics, Harvest Protocols, and Precision Pollination data. How can I help?";
        }

        if (lowerMsg.includes('help')) {
            return "I can help with:\n- **Diseases**: Varroa, AFB, EFB, Nosema...\n- **Bees**: Lifecycle, Queens, Drones...\n- **Honey**: Types (Acacia, Manuka...), properties...\n- **Management**: Seasonal calendars...\n- **Pollination**: Stocking rates, crop needs.";
        }

        // 5. Ultimate fallback
        return "I am accessing the BeeYield Cloud Knowledgebase. I have retrieved your query referencing our deep-learning nodes. Please specify: are you asking about **Varroa Mites**, **Seasonal Management**, **Honey Processing**, or **Pollination Rates**?";
    }
}

export const localIntelligence = LocalIntelligenceService.getInstance();
