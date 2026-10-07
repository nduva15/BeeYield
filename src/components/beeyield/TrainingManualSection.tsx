import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Layers,
  Search,
  X,
  ChevronRight,
  ShieldCheck,
  Flower2,
  Beaker,
  Bug,
  Compass,
  Sparkles,
  Printer,
  ChevronLeft,
} from "lucide-react";
import BeeYieldLogo from "@/assets/Logo.png";

// Structured Curriculum extracted from the Kenyan Apiculture Training Manual
export interface HandbookChapter {
  id: string;
  number: number;
  title: string;
  category: "Biology" | "Equipment" | "Management" | "Harvesting" | "Quality" | "Behavior";
  shortDesc: string;
  pdfPages: string;
  keyTakeaway: string;
  highlights: string[];
  content: {
    overview: string;
    subsections: {
      heading: string;
      body: string[];
      bulletPoints?: string[];
      callout?: {
        type: "tip" | "warning" | "standard";
        text: string;
      };
      table?: {
        headers: string[];
        rows: string[][];
      };
    }[];
  };
}

export const HANDBOOK_CHAPTERS: HandbookChapter[] = [
  {
    id: "colony-castes",
    number: 1,
    title: "Colony Castes & Reproductive Biology",
    category: "Biology",
    shortDesc: "Roles, development timelines, and biological caste dynamics of the Queen, Drone, and Worker honeybees.",
    pdfPages: "Pages 1 - 2",
    keyTakeaway: "A thriving Kenyan hive functions as a super-organism driven by queen pheromones and chronologically specialized worker labor.",
    highlights: [
      "Queen lays up to 1,500 - 2,000 eggs per day during peak Kenyan nectar flows",
      "Drones arise from unfertilized eggs (parthenogenesis) for mating flights",
      "Workers transition through nursery, comb construction, guard duty, and field foraging",
    ],
    content: {
      overview:
        "Modern apiculture requires a foundational grasp of the honeybee social hierarchy. Honeybees (*Apis mellifera scutellata* and monticola ecotypes in Kenya) live in strictly organized perennial colonies consisting of three castes.",
      subsections: [
        {
          heading: "1. The Queen Bee (Fertile Female)",
          body: [
            "The sole reproductive female in a normal colony. Her abdomen is noticeably elongated, extending well beyond her folded wings.",
            "Her primary duty is laying fertilized and unfertilized eggs to sustain colony numbers, laying between 1,500 to 2,000 eggs daily during heavy blooming periods.",
            "She secretes Queen Mandibular Pheromone (QMP / Queen Substance), which prevents worker ovary development and maintains colony morale.",
          ],
          callout: {
            type: "tip",
            text: "A productive queen typically maintains peak egg-laying for 1 to 2 years under Kenyan tropical conditions before requiring supersedure or requeening.",
          },
        },
        {
          heading: "2. The Drone Bee (Male)",
          body: [
            "Stout, heavy-bodied male bees hatched from unfertilized eggs through parthenogenesis. Drones possess very large compound eyes that touch at the top of the head for spotting virgin queens in Drone Congregation Areas (DCAs).",
            "Drones have no sting, no pollen baskets, and no wax glands. Their sole biological purpose is mating with virgin queens on nuptial flights.",
            "They consume honey stores directly or are fed by workers; during dry dearth seasons, workers systematically expel drones from the hive to conserve provisions.",
          ],
        },
        {
          heading: "3. The Worker Bee (Sterile Female)",
          body: [
            "The smallest yet most numerous caste (20,000 to 60,000 per hive). They perform all maintenance, defensive, and foraging tasks according to age polyethism:",
          ],
          bulletPoints: [
            "Days 1-3: Cell cleaning and incubation",
            "Days 4-11: Nurse bees producing royal jelly and feeding larvae",
            "Days 12-17: Wax gland activation, comb building, honey ripening, and propolis handling",
            "Days 18-21: Guarding the entrance against wasps, beetles, and robber bees",
            "Days 22+: Field foragers gathering nectar, pollen, propolis, and cooling water",
          ],
        },
      ],
    },
  },
  {
    id: "langstroth-anatomy",
    number: 2,
    title: "Complete Langstroth Hive Anatomy",
    category: "Equipment",
    shortDesc: "Component-by-component engineering of the standard movable-frame Langstroth hive and seasonal attachments.",
    pdfPages: "Pages 3 - 4",
    keyTakeaway: "Movable frames respect Rev. L.L. Langstroth's bee space (6-9 mm), enabling non-destructive honey extraction and reuse of drawn wax.",
    highlights: [
      "Galvanized metal telescoping roof with thermal insulating hardboard",
      "Queen excluder maintains pure honey supers free from eggs or larvae",
      "Bee escape / clearer board enables chemical-free pre-harvest bee evacuation",
    ],
    content: {
      overview:
        "The Langstroth hive revolutionised global apiculture by introducing standardized, removable wooden frames spaced exactly to preserve the natural 'bee space'. In Kenya, seasoned cypress or cedar timber is standard.",
      subsections: [
        {
          heading: "Modular Structural Components",
          body: [
            "Every component serves a specific biological and management function, allowing vertical expansion as the honey flow builds up:",
          ],
          bulletPoints: [
            "Telescoping Roof (Outer Cover): Weatherproof galvanized sheet metal over insulating hardboard, designed to overhang the body and shed equatorial rain and sun.",
            "Inner Cover: Creates an insulating dead-air space above the top super and prevents bees from cementing the outer roof with propolis.",
            "Honey Super Boxes: Shallow or medium boxes equipped with 10 wired frames holding beeswax foundation sheets, dedicated entirely to surplus honey storage.",
            "Queen Excluder: Precision wire grid with 4.2 mm apertures. Workers freely traverse into the supers, while the larger queen remains restricted to the brood chamber.",
            "Brood Chamber: Deep wooden box housing the queen, brood comb, nurse bees, and pollen reserves. This chamber is never harvested.",
            "Bottom Board & Entrance Reducer: Heavy floorboard providing a landing ramp, paired with a notched wooden bar to throttle entrance size against drafts and pests.",
            "Clearer Board (Bee Escape): One-way spring or maze board inserted 24 hours prior to harvest to usher bees down into the brood nest without stress.",
          ],
          callout: {
            type: "standard",
            text: "Hive dimensions must strictly observe standard 3/8 inch (9.5 mm) bee space. Smaller gaps are filled with propolis; larger gaps trigger unruly burr comb construction.",
          },
        },
      ],
    },
  },
  {
    id: "apiary-siting",
    number: 3,
    title: "Apiary Siting & Beehouse Architecture",
    category: "Management",
    shortDesc: "Environmental selection criteria, predator defense, windbreaks, and enclosed modern beehouse designs.",
    pdfPages: "Pages 5 - 6",
    keyTakeaway: "Proper siting provides reliable forage, clean water within 500m, and elevates hives off the ground to repel honey badgers and safari ants.",
    highlights: [
      "Keep hives waist-high on greased metal stands (avoid tree hanging risks)",
      "Maintain a 50-100m buffer zone from public paths, schools, and livestock",
      "Enclosed beehouses eliminate theft, honey badger damage, and harsh sun",
    ],
    content: {
      overview:
        "Selecting the ideal apiary site is critical for colony survival, high honey yields, and community safety in rural and peri-urban Kenya.",
      subsections: [
        {
          heading: "Critical Environmental Siting Criteria",
          body: [
            "1. Rich Floral Forage: Ensure continuous seasonal flowering within 1.5 to 2 km flight radius (acacia, croton, eucalyptus, citrus, sunflower, avocado).",
            "2. Permanent Fresh Water: Bees consume significant water for cooling hives via evaporative ventilation and diluting honey for brood food. Water must be within 500 meters.",
            "3. Morning Sunlight & Afternoon Shade: Hives facing East/South-East catch early morning rays to stimulate early foraging while remaining shaded during the scorching afternoon heat.",
            "4. Windbreaks & Safety Distances: Situate apiaries behind dense hedges or trees. Never locate hives within 50 meters of livestock bomas, public roads, or human habitations.",
          ],
        },
        {
          heading: "Hive Stands vs Traditional Tree Hanging",
          body: [
            "Traditional Kenyan beekeeping frequently hanged log hives in tall trees. Modern apiculture firmly discourages tree climbing due to severe fall hazards, rough frame handling, and inability to perform weekly inspections.",
            "Modern practice installs hives on sturdy metal or treated timber stands 30 to 50 cm above ground. Stand legs are greased or seated in used engine oil cups to create an impenetrable barrier against safari ants (*Dorylus* spp.).",
          ],
          callout: {
            type: "tip",
            text: "Beehouse Architecture: An enclosed, ventilated wooden or stone beehouse with wall-mounted entrance pipes provides maximum security against honey badgers, vandalism, and torrential rains.",
          },
        },
      ],
    },
  },
  {
    id: "gear-and-inspection-sop",
    number: 4,
    title: "Protective Gear & Inspection SOP",
    category: "Management",
    shortDesc: "PPE specifications and the step-by-step Standard Operating Procedure for calm, stingless hive inspections.",
    pdfPages: "Pages 7 - 9",
    keyTakeaway: "Cool white smoke masks alarm pheromones (isopentyl acetate) and triggers feeding instincts, ensuring quiet and calm hive management.",
    highlights: [
      "Full white ventilated overall suit, fencing veil, goatskin gauntlet gloves",
      "Stainless steel smoker packed with dry pine needles, coconut husk, or dry dung",
      "Inspect between 10:00 AM and 2:00 PM on sunny, calm days",
    ],
    content: {
      overview:
        "Handling African honeybees (*Apis mellifera scutellata*) demands discipline, calmness, and proper equipment. Quick, erratic movements and synthetic perfumes must be avoided.",
      subsections: [
        {
          heading: "Essential Apiary Toolkit",
          body: [
            "Before approaching the apiary, ensure all six basic tools are in pristine working condition:",
          ],
          bulletPoints: [
            "Ventilated Beekeeping Suit with Veil: Breathable, sting-proof white fabric (bees are less defensive toward pale tones).",
            "Goatskin Leather Gloves: High gauntlets reaching past the elbows to seal suit cuffs.",
            "Laced Rubber Gumboots: Pants tucked securely into socks or boots.",
            "Stainless Steel Smoker: With heat protective cage and leather bellows.",
            "J-Hook Hive Tool: For prying propolized frames and scraping wax bridges.",
            "Soft Horsehair Bee Brush: For sweeping bees gently off honeycombs without crushing.",
          ],
        },
        {
          heading: "Step-by-Step Hive Inspection SOP",
          body: [
            "Step 1 — Timing: Inspect between 10:00 AM and 2:00 PM when senior field foragers are out gathering nectar, leaving only young, calm nurse bees at home.",
            "Step 2 — Lighting the Smoker: Ignite dry grass or cardboard at the bottom, then layer with dry eucalyptus leaves, coconut fiber, or cow dung until it generates thick, cool, white smoke. Never blow hot sparks.",
            "Step 3 — Smoke Introduction: Approach from behind or the side. Puff 2-3 gentle clouds into the entrance. Wait 60-90 seconds to allow bees to ingest honey, which engorges their abdomens and prevents defensive posture.",
            "Step 4 — Lid Removal: Pry the outer cover gently with the hive tool. Puff a smoke puff under the inner cover, wait 30 seconds, then set the lid upside-down on the ground to act as a frame stand.",
            "Step 5 — Frame Removal: Always pull an outer frame (frame 1 or 10) first to create room. Lift vertically by the wooden frame lugs without rolling bees against neighboring comb.",
            "Step 6 — Diagnostic Check: Verify pearly white C-shaped larvae in uncapped brood, look for freshly laid upright eggs (1 per cell base), check honey/pollen reserves, and scan for pests.",
          ],
          callout: {
            type: "warning",
            text: "Never swat at buzzing bees! Swatting crushes bees, releasing concentrated alarm pheromones that incite defensive mass stinging across the apiary.",
          },
        },
      ],
    },
  },
  {
    id: "sustainable-harvesting",
    number: 5,
    title: "Harvesting, Extraction & Quality Assurance",
    category: "Harvesting",
    shortDesc: "Centrifugal honey extraction, uncapping methods, dual-stage filtration, and honey settling tank protocols.",
    pdfPages: "Pages 10 - 11",
    keyTakeaway: "Harvest only honeycombs with &ge;75-80% sealed wax cappings to guarantee low moisture content below 20% and avoid fermentation.",
    highlights: [
      "Use clearer boards 24 hrs prior to clear bees without smoke odor in honey",
      "Food-grade stainless steel centrifugal extractor preserves drawn wax frames",
      "Double-sieve filtration (400 micron + 200 micron) removes wax particles",
    ],
    content: {
      overview:
        "Modern harvesting separates honey extraction from comb destruction. Centrifugal extraction spins honey out using centrifugal force while keeping the comb intact for immediate return to the colony.",
      subsections: [
        {
          heading: "The Modern 7-Step Extraction Flow",
          body: [
            "1. Readiness Evaluation: Inspect honey supers. Harvest ONLY combs where 75% to 100% of cells are capped with wax. Uncapped honey contains excessive water (&gt;21%) and will ferment into sour mead.",
            "2. Bee Clearing: Place clearer boards beneath the honey supers 24 hours in advance. Foragers walk down through the one-way escape, leaving supers bee-free without requiring heavy smoking.",
            "3. Super Transport: Move sealed supers promptly into a sanitized, bee-proof honey processing room.",
            "4. Uncapping: Tilt frames over an uncapping tray and cleanly shave the thin wax seals using an uncapping knife or uncapping fork.",
            "5. Centrifugal Spinning: Mount uncapped frames balanced into a food-grade 304 stainless steel extractor. Spin gently first, flip, spin opposite side, then accelerate.",
            "6. Dual-Stage Sieving: Run honey through coarse (400-micron) and fine (200-micron) stainless steel filters to remove bee fragments and wax debris.",
            "7. Settling & Bottling: Transfer filtered honey to food-grade settling tanks for 48-72 hours. Microscopic air bubbles and pollen froth rise to the surface for skimming prior to bottling in sterilized glass jars.",
          ],
        },
      ],
    },
  },
  {
    id: "toxic-kenyan-flora",
    number: 6,
    title: "Kenyan Flora & Toxic Plant Avoidance",
    category: "Quality",
    shortDesc: "Nectar calendar, premier melliferous forage, and poisonous plants to avoid during harvest periods.",
    pdfPages: "Pages 11 - 12",
    keyTakeaway: "Never harvest honey when toxic plants like Castor Oil (*Ricinus communis*) or Poison Arrow Tree (*Acokanthera schimperii*) are in peak bloom.",
    highlights: [
      "Castor Oil Plant (*Ricinus communis*) produces toxic ricinine/ricin alkaloid",
      "Poison Arrow Tree (*Acokanthera schimperii*) contains cardiac glycosides",
      "Beware deep-corolla trap flowers (*Spathodea*, *Tecoma*, *Markhamia*)",
    ],
    content: {
      overview:
        "Kenya's diverse agro-ecological zones offer exceptional nectar diversity, but beekeepers must understand botanical traps and plant toxicity.",
      subsections: [
        {
          heading: "High-Risk Poisonous Plants in Kenyan Apiaries",
          body: [
            "Honey derived from certain indigenous and invasive species can cause acute human poisoning or gastrointestinal distress:",
          ],
          bulletPoints: [
            "Castor Oil Plant (*Ricinus communis*): Abundant along Kenyan roadsides and dry scrub. Its pollen and nectar contain traces of ricinine alkaloids. Apiaries near dense castor blooms should not be harvested during flowering.",
            "Poison Arrow Tree (*Acokanthera schimperii* / Murichu in Kikuyu, Keli in Kamba): Contains lethal cardiac glycosides (ouabain) historically used for hunting poison arrows. Never harvest honey during its flowering season.",
          ],
          callout: {
            type: "warning",
            text: "Identify local names and blooming seasons of toxic shrubs in your county. If an apiary is within foraging flight of flowering *Acokanthera*, withhold harvesting until the bloom finishes and bees consume the stores.",
          },
        },
        {
          heading: "Morphological Flower Traps (Inaccessible Nectaries)",
          body: [
            "Some ornamental and indigenous trees feature vibrant, attractive flowers, yet bees cannot reach their nectaries due to elongated floral styles or broad corollas:",
          ],
          bulletPoints: [
            "Nandi Flame (*Spathodea campanulata*): Deep tubular cup where water collects, often drowning bees seeking nectar.",
            "Yellow Bells (*Tecoma stans*) & *Markhamia lutea*: Corolla tube is too long for the short tongue of *Apis mellifera*, exhausting foragers without rewarding nectar uptake.",
          ],
        },
      ],
    },
  },
  {
    id: "colony-behavior-swarming",
    number: 7,
    title: "Colony Dynamics: Swarming & Absconding",
    category: "Behavior",
    shortDesc: "Behavioral triggers and management strategies for swarming, absconding, and queen supersedure.",
    pdfPages: "Pages 12 - 13",
    keyTakeaway: "Swarming is natural reproduction of a prosperous hive; absconding is emergency abandonment caused by pests, heat, or starvation.",
    highlights: [
      "Swarm cells hang vertically from bottom edges of brood comb",
      "Supersedure cells occur on the face of the comb to replace an aging queen",
      "Prevent absconding with ant grease, clean water, shade, and predator guards",
    ],
    content: {
      overview:
        "Understanding colony behavioral triggers enables the beekeeper to retain colony strength and prevent sudden losses of bee biomass.",
      subsections: [
        {
          heading: "Swarming vs. Absconding vs. Supersedure",
          body: [
            "Beekeepers must clearly distinguish between these three distinct colony phenomena:",
          ],
          bulletPoints: [
            "Swarming (Colony Reproduction): Occurs when a strong hive experiences congestion of brood and honey during bumper nectar flows. The old queen departs with 50-70% of the worker force to found a new colony, leaving mature queen cells behind.",
            "Absconding (Colony Evacuation): The entire colony completely abandons the hive, leaving behind empty or compromised comb. Triggered by severe adversity: safari ant attacks, honey badger destruction, lack of water, scorching heat, or unmanaged wax moth infestation.",
            "Supersedure (Queen Replacement): The workers detect that their queen is failing, injured, or laying unfertilized drone eggs. They construct 1 to 3 large queen cells in the middle face of the comb without swarming.",
          ],
          callout: {
            type: "tip",
            text: "Swarm Prevention: Add empty supers with foundation before the brood chamber becomes honey-bound, ensure ample ventilation, and shade hives during equatorial heat waves.",
          },
        },
      ],
    },
  },
  {
    id: "bee-communication-dances",
    number: 8,
    title: "Honeybee Communication: Dance Language",
    category: "Behavior",
    shortDesc: "Decoding Karl von Frisch's Nobel Prize-winning Round Dance and Tail-Waggle Dance protocols.",
    pdfPages: "Pages 14 - 15",
    keyTakeaway: "The waggle dance translates the sun's compass azimuth into an angle relative to gravity, communicating forage up to 10 km away.",
    highlights: [
      "Round Dance: For floral sources within 100 meters of the hive",
      "Tail-Waggle Dance: Encodes exact compass angle and distance for distant forage",
      "1 second of waggle run equates to approximately 1 kilometer of flight",
    ],
    content: {
      overview:
        "Honeybees recruit sister foragers using symbolic dance movements performed on the vertical face of the dark brood combs.",
      subsections: [
        {
          heading: "The Round Dance (Close Forage)",
          body: [
            "Performed when rich nectar or pollen is discovered within 100 meters of the hive. The scout bee runs in small alternating clockwise and counter-clockwise circles.",
            "This dance does not indicate directional compass coordinates; instead, it conveys floral scent samples and signals nestmates: 'Rich nectar close by—search in all directions!'",
          ],
        },
        {
          heading: "The Tail-Waggle Dance (Distant Forage & Precision Vectors)",
          body: [
            "Performed when forage is located further than 100 meters away. The scout bee performs a figure-8 run:",
          ],
          bulletPoints: [
            "Waggle Run Direction: The angle of the straight waggle run relative to the vertical plumb line corresponds to the flight angle relative to the current position of the sun.",
            "Distance Encoding: The duration of the waggle abdomen vibrations signals distance. A 1.0-second waggle run signals approx. 1,000 meters (1 km); longer durations indicate greater distances.",
            "Quality Indication: The vigor and duration of the dance indicate the nectar sugar concentration and flow volume.",
          ],
        },
      ],
    },
  },
  {
    id: "honey-lab-standards-kebs",
    number: 9,
    title: "Honey Quality & Kenya Laboratory Standards",
    category: "Quality",
    shortDesc: "Official Kenya Bureau of Standards (KEBS) parameters, moisture refractometry, reducing sugars, and HMF limits.",
    pdfPages: "Pages 15 - 16",
    keyTakeaway: "Pure Kenyan table honey must test &le;20% moisture, &ge;65% reducing sugars, and &le;40 mg/kg HMF to guarantee export-grade purity.",
    highlights: [
      "Moisture level capped at max 20% to prevent Osmophilic yeast fermentation",
      "Total reducing sugars (fructose + glucose) minimum 65%",
      "Apparent sucrose maximum 5% (detects adulteration with cane sugar syrup)",
    ],
    content: {
      overview:
        "Commercial beekeepers must comply with official analytical standards to protect consumers and access premium export and retail markets.",
      subsections: [
        {
          heading: "Laboratory Honey Analysis Parameters (KEBS / Codex Alimentarius)",
          body: [
            "Official physical and chemical benchmarks for pure raw and processed honey in Kenya:",
          ],
          table: {
            headers: ["Analytical Parameter", "Official Standard Requirement", "Commercial Significance"],
            rows: [
              ["Moisture Level", "Maximum 20.0%", "Prevents yeast fermentation into vinegar"],
              ["Total Reducing Sugars (Glucose + Fructose)", "Minimum 65.0%", "Verifies authentic floral enzyme conversion"],
              ["Apparent Sucrose", "Maximum 5.0%", "Detects adulteration with table sugar/syrup"],
              ["Hydroxymethylfurfural (HMF)", "Maximum 40.0 mg/kg", "Verifies honey has not been overheated or aged"],
              ["Water Insoluble Solids", "Maximum 0.1%", "Ensures clean filtration (wax, dust, bee parts)"],
              ["Mineral Ash Content", "Maximum 0.6%", "Differentiates floral honey from honeydew"],
            ],
          },
          callout: {
            type: "standard",
            text: "Every commercial lot processed by BeeYield undergoes digital refractometry and spectrophotometric HMF analysis to guarantee 100% compliance with Kenyan & international standards.",
          },
        },
      ],
    },
  },
];

export const TrainingManualSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const pdfUrl = "/learn-pdfs/modern-bee-farmers-training-manual.pdf";

  const categories = ["All", "Biology", "Equipment", "Management", "Harvesting", "Quality", "Behavior"];

  const filteredChapters = HANDBOOK_CHAPTERS.filter((chap) => {
    const matchesCategory = activeCategory === "All" || chap.category === activeCategory;
    const matchesSearch =
      chap.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      chap.shortDesc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      chap.highlights.some((h) => h.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentChapter = HANDBOOK_CHAPTERS[selectedChapterIndex] || HANDBOOK_CHAPTERS[0];

  return (
    <>
      {/* ========================================================================= */}
      {/* PREMIER SHOWCASE SECTION ON BEELEARN PAGE                                */}
      {/* ========================================================================= */}
      <section id="training-manual" className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-[#FFF9F0] to-[#F5FBF7] scroll-mt-20">
        {/* Decorative blur spheres */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F4D03F]/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#1B9157]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4">
          {/* Top Brand Banner */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white shadow-sm border border-amber-200/60 mb-6">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center p-1">
                <img src={BeeYieldLogo} alt="BeeYield Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#1B9157]">
                Official BeeYield Academy Resource
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-bold text-amber-700">Kenyan Apiculture Handbook</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15] mb-6">
              Modern Apiculture <span className="text-[#1B9157]">Training Manual</span> & Field Handbook
            </h2>

            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
              Adapted for modern precision beekeeping in Kenya. Covers Langstroth hive engineering, hive inspection SOPs, toxic flora mitigation, and national KEBS honey purity benchmarks.
            </p>
          </div>

          {/* Featured Handbook Showcase Card */}
          <div className="max-w-6xl mx-auto bg-white rounded-[36px] sm:rounded-[48px] p-6 sm:p-10 lg:p-14 shadow-2xl border border-amber-100 relative overflow-hidden">
            {/* Background watermark */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-5 pointer-events-none select-none">
              <img src={BeeYieldLogo} alt="" className="w-full h-full object-contain" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Visual Handbook Book Cover with Full Logo */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group w-full max-w-[340px]">
                  {/* Glowing background aura */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1B9157]/30 to-[#F4D03F]/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-70" />

                  {/* Book Mockup Card */}
                  <div className="relative rounded-3xl bg-gradient-to-br from-[#0A2612] via-[#0E351B] to-[#0A2612] text-white p-7 sm:p-8 shadow-2xl border-2 border-amber-300/40 transform group-hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between min-h-[460px]">
                    {/* Top Spine & Logo */}
                    <div>
                      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 border border-amber-400/40 backdrop-blur-md flex items-center justify-center shadow-lg">
                            <img src={BeeYieldLogo} alt="BeeYield Full Logo" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#F4D03F]">BeeYield</span>
                            <p className="text-xs font-bold text-white/80">Apiculture Extension</p>
                          </div>
                        </div>
                        <Badge className="bg-[#F4D03F] text-[#1A1A1A] font-black text-[10px] uppercase border-none px-2.5 py-1">
                          2026 Edition
                        </Badge>
                      </div>

                      <span className="text-[11px] font-bold uppercase tracking-wider text-green-300">
                        Kenyan Field Guide
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mt-1 mb-3">
                        Modern Beekeeping <span className="text-[#F4D03F]">Training Manual</span>
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        Standard Operating Procedures for Langstroth apiary siting, protective PPE, cold centrifugal harvesting, and toxic flora avoidance.
                      </p>
                    </div>

                    {/* Book Metadata Footer */}
                    <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                          <span className="text-white/40 block text-[9px] uppercase font-bold">Length</span>
                          <span className="font-bold text-white">16 Master Pages</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                          <span className="text-white/40 block text-[9px] uppercase font-bold">Standard</span>
                          <span className="font-bold text-amber-300">KEBS & ISO 12824</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/60 pt-1">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-[#F4D03F]" /> Verified Apiculture
                        </span>
                        <span className="text-white/50 font-mono">1.2 MB PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Highlights & Interactive Action Triggers */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-emerald-100 text-[#1B9157] font-bold text-xs">
                      16 Curriculum Modules
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-900 font-bold text-xs">
                      Free Digital Access
                    </Badge>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-snug tracking-tight mb-4">
                    The Definitive Field Reference for East African Beekeepers
                  </h3>

                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 font-medium">
                    Built directly from Kenyan apiary field practices and laboratory food standards. Explore the handbook interactively in our responsive viewer or download the complete 16-page training manual offline.
                  </p>

                  {/* Core Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/50">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#F4D03F] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Layers className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-neutral-900">Langstroth Hive Blueprint</h4>
                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                          Dimensions, queen excluder (4.2 mm), and clearer board bee escapes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-green-50/70 border border-green-200/50">
                      <div className="w-8 h-8 rounded-xl bg-green-100 text-[#1B9157] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Flower2 className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-neutral-900">Toxic Flora Avoidance</h4>
                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                          Crucial alerts on *Ricinus communis* & *Acokanthera schimperii*.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/50">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#F4D03F] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-neutral-900">Inspection & Smoker SOP</h4>
                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                          Step-by-step frame inspection order and cool white smoke handling.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-green-50/70 border border-green-200/50">
                      <div className="w-8 h-8 rounded-xl bg-green-100 text-[#1B9157] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Beaker className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-neutral-900">KEBS Quality Standards</h4>
                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                          Moisture &le;20%, Reducing Sugars &ge;65%, HMF &le;40 mg/kg limits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3.5 pt-2 border-t border-neutral-100">
                  <Button
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                    className="h-14 px-7 bg-[#1B9157] hover:bg-green-700 text-white font-black rounded-2xl shadow-lg shadow-green-700/20 text-xs sm:text-sm flex items-center justify-center gap-2 group flex-1"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    Read Interactive Handbook
                  </Button>

                  <Button
                    size="lg"
                    asChild
                    variant="outline"
                    className="h-14 px-6 border-2 border-neutral-200 hover:border-amber-400 hover:bg-amber-50/60 font-black rounded-2xl text-xs sm:text-sm text-neutral-800 flex items-center justify-center gap-2 flex-1"
                  >
                    <a
                      href={pdfUrl}
                      download="BeeYield-Kenyan-Modern-Apiculture-Training-Manual.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 text-amber-600" />
                      Download Full PDF (1.2 MB)
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    asChild
                    variant="ghost"
                    className="h-14 px-4 text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-2xl"
                  >
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FULL INTERACTIVE HANDBOOK READER MODAL                                    */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-300">
          <div className="bg-[#FFF9F0] rounded-[28px] sm:rounded-[36px] w-full max-w-6xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-amber-200/70">
            {/* Modal Top Header with Full BeeYield Logo */}
            <div className="px-5 sm:px-8 py-4 sm:py-5 bg-white border-b border-amber-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 p-2 border border-amber-200/80 flex items-center justify-center shadow-sm">
                  <img src={BeeYieldLogo} alt="BeeYield Full Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#1B9157]">
                      BeeYield Apiculture Academy
                    </span>
                    <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold border-none px-2 py-0.5">
                      Kenyan Handbook
                    </Badge>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight line-clamp-1">
                    Modern Apiculture Training Manual & Field Guide
                  </h2>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  asChild
                  className="bg-[#1B9157] hover:bg-green-700 text-white font-bold text-xs h-9 px-3 rounded-xl hidden sm:flex items-center gap-1.5"
                >
                  <a
                    href={pdfUrl}
                    download="BeeYield-Kenyan-Modern-Apiculture-Training-Manual.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="text-xs h-9 px-3 rounded-xl hidden md:flex items-center gap-1.5 border-neutral-200"
                >
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Raw PDF Tab
                  </a>
                </Button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors ml-1"
                  aria-label="Close handbook"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Left Chapter Navigator + Right Content Reader */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Sidebar: Chapter List & Filters */}
              <div className="lg:col-span-4 bg-white/70 border-r border-amber-100/80 flex flex-col h-full max-h-[40vh] lg:max-h-full overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-amber-100/60 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search manual topics, equipment, flora..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl text-xs bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1B9157]/40"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                          activeCategory === cat
                            ? "bg-[#1B9157] text-white shadow-sm"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chapter List Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredChapters.map((chap) => {
                    const isSelected = HANDBOOK_CHAPTERS[selectedChapterIndex]?.id === chap.id;
                    return (
                      <div
                        key={chap.id}
                        onClick={() => {
                          const idx = HANDBOOK_CHAPTERS.findIndex((c) => c.id === chap.id);
                          if (idx !== -1) setSelectedChapterIndex(idx);
                        }}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                          isSelected
                            ? "bg-[#FFF9F0] border-amber-300 shadow-md ring-1 ring-amber-300/40"
                            : "bg-white/90 hover:bg-amber-50/40 border-neutral-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isSelected ? "text-[#1B9157]" : "text-neutral-400"
                            }`}
                          >
                            Module 0{chap.number} • {chap.category}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400">{chap.pdfPages}</span>
                        </div>
                        <h4
                          className={`text-xs font-black leading-snug line-clamp-1 ${
                            isSelected ? "text-neutral-900" : "text-neutral-700"
                          }`}
                        >
                          {chap.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-medium line-clamp-1 mt-0.5">
                          {chap.shortDesc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Content Area: Rich Curriculum Viewer */}
              <div className="lg:col-span-8 flex flex-col h-full max-h-[52vh] lg:max-h-[calc(92vh-75px)] overflow-y-auto p-5 sm:p-8 bg-[#FFF9F0]">
                {/* Chapter Header */}
                <div className="pb-6 border-b border-amber-200/60 mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge className="bg-[#1B9157] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1">
                      Module 0{currentChapter.number} • {currentChapter.category}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      Original PDF: {currentChapter.pdfPages}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight mb-3">
                    {currentChapter.title}
                  </h3>

                  {/* Key Takeaway Banner */}
                  <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        Core Field Principle
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-neutral-800 leading-snug">
                        {currentChapter.keyTakeaway}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subsections Content */}
                <div className="space-y-8 flex-1">
                  <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                    {currentChapter.content.overview}
                  </p>

                  {currentChapter.content.subsections.map((subsec, idx) => (
                    <div key={idx} className="space-y-4 bg-white rounded-3xl p-5 sm:p-6 border border-neutral-100 shadow-sm">
                      <h4 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1B9157]" />
                        {subsec.heading}
                      </h4>

                      {subsec.body.map((para, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                          {para}
                        </p>
                      ))}

                      {subsec.bulletPoints && (
                        <ul className="space-y-2 pt-1 pl-2">
                          {subsec.bulletPoints.map((bp, bpIdx) => (
                            <li key={bpIdx} className="text-xs sm:text-sm text-neutral-700 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] mt-2 flex-shrink-0" />
                              <span className="font-medium leading-relaxed">{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Callout Alert Box */}
                      {subsec.callout && (
                        <div
                          className={`p-4 rounded-2xl border flex items-start gap-3 mt-4 ${
                            subsec.callout.type === "warning"
                              ? "bg-red-50/80 border-red-200 text-red-900"
                              : subsec.callout.type === "tip"
                              ? "bg-green-50/80 border-green-200 text-green-900"
                              : "bg-blue-50/80 border-blue-200 text-blue-900"
                          }`}
                        >
                          {subsec.callout.type === "warning" ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : subsec.callout.type === "tip" ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                            {subsec.callout.text}
                          </p>
                        </div>
                      )}

                      {/* Data Table (e.g. KEBS Standards) */}
                      {subsec.table && (
                        <div className="overflow-x-auto rounded-2xl border border-neutral-200 mt-4">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-100 text-neutral-700 uppercase font-black tracking-wider text-[10px]">
                              <tr>
                                {subsec.table.headers.map((th, thIdx) => (
                                  <th key={thIdx} className="py-3 px-4">
                                    {th}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 font-medium">
                              {subsec.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-amber-50/30">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`py-3 px-4 ${
                                        cIdx === 1 ? "font-black text-[#1B9157]" : "text-neutral-700"
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chapter Navigation Buttons at Bottom */}
                <div className="flex items-center justify-between pt-8 border-t border-amber-200/60 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedChapterIndex === 0}
                    onClick={() => setSelectedChapterIndex((prev) => Math.max(0, prev - 1))}
                    className="rounded-xl font-bold text-xs h-10 border-neutral-200 gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Module
                  </Button>

                  <div className="text-[11px] font-bold text-neutral-400">
                    Module {selectedChapterIndex + 1} of {HANDBOOK_CHAPTERS.length}
                  </div>

                  <Button
                    size="sm"
                    disabled={selectedChapterIndex === HANDBOOK_CHAPTERS.length - 1}
                    onClick={() =>
                      setSelectedChapterIndex((prev) => Math.min(HANDBOOK_CHAPTERS.length - 1, prev + 1))
                    }
                    className="bg-[#1B9157] hover:bg-green-700 text-white rounded-xl font-bold text-xs h-10 gap-1.5"
                  >
                    Next Module <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
