export interface ApiaryPhoto {
  id: string;
  index: number;
  src: string;
  title: string;
  subtitle: string;
  category: 'team' | 'story' | 'media' | 'in_land' | 'in_hive' | 'diseases' | 'blogs';
  tags: string[];
  location: string;
  badge: string;
  description: string;
}

export const ALL_APIARY_PHOTOS: ApiaryPhoto[] = [
  {
    id: "apiary-01",
    index: 1,
    src: "/images/apiary/beeyield-apiary-01.jpg",
    title: "Ancestral Acacia Canopy Apiary",
    subtitle: "Traditional log hives suspended high in mature acacia branches",
    category: "story",
    tags: ["heritage", "traditional", "canopy", "kibwezi", "story", "in_hive"],
    location: "Kibwezi, Makueni County",
    badge: "Origin Roots",
    description: "Traditional log hives suspended high in the branches of savannah acacia trees, safe from ground predators, ants, and direct sun."
  },
  {
    id: "apiary-02",
    index: 2,
    src: "/images/apiary/beeyield-apiary-02.jpg",
    title: "Frontline Beekeeper Field Gear",
    subtitle: "Protective apiary veil and suit ready for canopy hive inspections",
    category: "team",
    tags: ["team", "gear", "stewardship", "safety", "inspection"],
    location: "BeeYield Field Yard, Makueni",
    badge: "Field Stewardship",
    description: "Official protective headgear with mesh veil used by our apiary teams during tree canopy inspections and night harvests."
  },
  {
    id: "apiary-03",
    index: 3,
    src: "/images/apiary/beeyield-apiary-03.jpg",
    title: "Solitary Acacia In-Land Apiary Station",
    subtitle: "Dryland savanna ecosystem with multi-hive acacia nesting",
    category: "in_land",
    tags: ["in_land", "savanna", "forage", "pollination", "ecology"],
    location: "Makueni Dryland Corridor",
    badge: "In-Land Eco-Station",
    description: "Vast semi-arid forage habitat where wild acacia and desert date provide premier single-origin nectar flows for resilient colonies."
  },
  {
    id: "apiary-04",
    index: 4,
    src: "/images/apiary/beeyield-apiary-04.jpg",
    title: "Suspended Cedar Log Hive",
    subtitle: "Wire-hung horizontal log cavity with natural thermal buffering",
    category: "in_hive",
    tags: ["in_hive", "log_hive", "insulation", "microclimate"],
    location: "Kibwezi Demonstration Apiary",
    badge: "Thermal Defense",
    description: "Thick hand-carved wood maintains internal brood cluster temperatures between 34.5°C and 35.5°C even when outside ambient heat tops 38°C."
  },
  {
    id: "apiary-05",
    index: 5,
    src: "/images/apiary/beeyield-apiary-05.jpg",
    title: "Fork-Mounted Traditional Hive",
    subtitle: "Secure natural tree fork placement in dryland thicket",
    category: "in_land",
    tags: ["in_land", "placement", "savanna", "traditional"],
    location: "Makueni Bushland",
    badge: "Natural Anchorage",
    description: "Nestled in the multi-stem branch fork of indigenous thorn trees to withstand seasonal high wind gusts across open terrain."
  },
  {
    id: "apiary-06",
    index: 6,
    src: "/images/apiary/beeyield-apiary-06.jpg",
    title: "Predator Guard Sheet Installation",
    subtitle: "Metal tin guard wrapped around acacia trunk to prevent pest access",
    category: "diseases",
    tags: ["diseases", "predator_defense", "honey_badgers", "ants", "biosecurity"],
    location: "Kibwezi Apiary Perimeter",
    badge: "Pest & Predator Barrier",
    description: "Galvanized tin sheet wrapped around tree trunks prevents honey badgers, safari ants (Dorylus), and lizards from climbing up to invade colonies."
  },
  {
    id: "apiary-07",
    index: 7,
    src: "/images/apiary/beeyield-apiary-07.jpg",
    title: "Savanna Bloom Forage Landscape",
    subtitle: "Expansive arid landscape under monsoon rain clouds",
    category: "in_land",
    tags: ["in_land", "forage", "bloom", "phenology", "ecology"],
    location: "Makueni Savanna Buffer",
    badge: "Floral Corridor",
    description: "Rich native bee forage dominated by Acacia tortilis, Commiphora, and seasonal wildflowers, creating high-purity medicinal honey."
  },
  {
    id: "apiary-08",
    index: 8,
    src: "/images/apiary/beeyield-apiary-08.jpg",
    title: "Precision Wire Suspension",
    subtitle: "Single-point wire hung log hive swaying safely above scrub",
    category: "in_hive",
    tags: ["in_hive", "acoustics", "suspension", "traditional"],
    location: "Kibwezi Forest Edge",
    badge: "Anti-Ant Rig",
    description: "Hanging by grease-coated wire breaks ant trails, stopping destructive termite and army ant migrations before they reach the flight hole."
  },
  {
    id: "apiary-09",
    index: 9,
    src: "/images/apiary/beeyield-apiary-09.jpg",
    title: "High-Canopy Apiary Cluster",
    subtitle: "Looking up into the dense shade of a century-old acacia",
    category: "media",
    tags: ["media", "canopy", "heritage", "photography"],
    location: "Kibwezi River Basin",
    badge: "Canopy Yard",
    description: "High canopy placements take advantage of cooling river-basin breezes and dense leaf cover to protect bee colonies from midday sun."
  },
  {
    id: "apiary-10",
    index: 10,
    src: "/images/apiary/beeyield-apiary-10.jpg",
    title: "Communal Umbrella Apiary Yard",
    subtitle: "Multiple log hives suspended from single acacia near stone perimeter",
    category: "story",
    tags: ["story", "community", "heritage", "kibwezi"],
    location: "Family Homestead, Kibwezi",
    badge: "Ancestral Apiary",
    description: "The traditional multi-hive tree setup: up to 6 hives hung from one massive acacia, forming a community colony collective."
  },
  {
    id: "apiary-11",
    index: 11,
    src: "/images/apiary/beeyield-apiary-11.jpg",
    title: "Canopy Flight Horizon",
    subtitle: "Log hive positioned for optimal morning sun flight vector",
    category: "in_land",
    tags: ["in_land", "flight_path", "orientation"],
    location: "Makueni Valley",
    badge: "Orientation",
    description: "Entrances faced toward the rising sun encourage earlier morning forager departures, maximizing pollination during morning anthesis."
  },
  {
    id: "apiary-12",
    index: 12,
    src: "/images/apiary/beeyield-apiary-12.jpg",
    title: "Thicket Branch Suspension",
    subtitle: "Horizontally balanced log hive in thorny acacia branches",
    category: "in_hive",
    tags: ["in_hive", "log_hive", "kamba_tradition"],
    location: "Dryland Apiary Plot 2",
    badge: "Equilibrium",
    description: "Carefully balanced with hand-braided wire to keep honey comb bars vertical, preventing structural comb collapse in high heat."
  },
  {
    id: "apiary-13",
    index: 13,
    src: "/images/apiary/beeyield-apiary-13.jpg",
    title: "Thornwood Fork Cradle",
    subtitle: "Deep log placement in interlocking branch forks",
    category: "in_land",
    tags: ["in_land", "camouflage", "natural_habitat"],
    location: "Eastern Makueni Thickets",
    badge: "Cradle Mount",
    description: "Natural branch cradles minimize vibrational stress on developing pupae while naturally shading the hive body."
  },
  {
    id: "apiary-14",
    index: 14,
    src: "/images/apiary/beeyield-apiary-14.jpg",
    title: "Twin Hive Branch Array",
    subtitle: "Two log hives suspended in tandem from parallel boughs",
    category: "media",
    tags: ["media", "tandem", "apiary_layout"],
    location: "Kibwezi Demonstration Site",
    badge: "Tandem Rig",
    description: "Tandem placement allows side-by-side acoustic comparison between swarmed colonies and established queenright colonies."
  },
  {
    id: "apiary-15",
    index: 15,
    src: "/images/apiary/beeyield-apiary-15.jpg",
    title: "Crown Canopy Multi-Hive Rig",
    subtitle: "Spectacular canopy array with four distinct log hives",
    category: "media",
    tags: ["media", "crown_canopy", "gallery", "photography"],
    location: "Upper Kibwezi Woodlands",
    badge: "Canopy Sanctuary",
    description: "A complete crown apiary: multiple hives hanging at staggered heights create a resilient micro-ecosystem protected by thorn cover."
  },
  {
    id: "apiary-16",
    index: 16,
    src: "/images/apiary/beeyield-apiary-16.jpg",
    title: "Hand-Hewn Entrance Profile",
    subtitle: "Crafted timber hive cap with dedicated bee flight entry notch",
    category: "team",
    tags: ["team", "craftsmanship", "carpentry", "kamba"],
    location: "Makueni Workshop",
    badge: "Artisan Craft",
    description: "Carved by local elders with tight-fitting removable end-caps for low-stress seasonal inspection without breaking brood comb."
  },
  {
    id: "apiary-17",
    index: 17,
    src: "/images/apiary/beeyield-apiary-17.jpg",
    title: "Bio-Security Trunk Collar",
    subtitle: "Corrugated metal shield repelling creeping pests and predators",
    category: "diseases",
    tags: ["diseases", "biosecurity", "predator_guard", "honey_badgers"],
    location: "Kibwezi Apiary Perimeter",
    badge: "Mechanical Biosecurity",
    description: "Slick metal collars prevent climbing predators from clawing their way into high-yield colonies, eliminating honey badger casualties."
  },
  {
    id: "apiary-18",
    index: 18,
    src: "/images/apiary/beeyield-apiary-18.jpg",
    title: "Suspended Hive in Dry Savanna",
    subtitle: "Horizontal log hive floating above dry season forage bushes",
    category: "blogs",
    tags: ["blogs", "dryland_beekeeping", "seasonal_adaptation"],
    location: "Makueni Savanna",
    badge: "Drought Resilience",
    description: "Demonstrating how African honeybees thrive during dry spells when thick tree canopies provide cool thermal pockets."
  },
  {
    id: "apiary-19",
    index: 19,
    src: "/images/apiary/beeyield-apiary-19.jpg",
    title: "Carved End-Cap and Wedge Closure",
    subtitle: "Traditional Kamba wedge sealing system for humidity control",
    category: "blogs",
    tags: ["blogs", "propolis", "humidity", "traditional_tech"],
    location: "Makueni Apiary Research Site",
    badge: "Propolis Seal",
    description: "Bees naturally coat the inner joints with medicinal propolis, sealing out moisture and preventing viral fungal spores."
  },
  {
    id: "apiary-20",
    index: 20,
    src: "/images/apiary/beeyield-apiary-20.jpg",
    title: "Branch-Tethered Colony Hive",
    subtitle: "Secure wire harness protecting against high winds and monkeys",
    category: "in_land",
    tags: ["in_land", "security", "canopy"],
    location: "Kibwezi Woodlands",
    badge: "Canopy Security",
    description: "Heavy wire binding prevents baboons and vervet monkeys from dislodging hives, keeping the brood structure undisturbed."
  },
  {
    id: "apiary-21",
    index: 21,
    src: "/images/apiary/beeyield-apiary-21.jpg",
    title: "Heavy-Gauge Trunk Barrier",
    subtitle: "Full-circumference predator sheet around mature acacia trunk",
    category: "diseases",
    tags: ["diseases", "predator_sheet", "badger_defense", "biosecurity"],
    location: "Makueni Apiary Hub",
    badge: "Apex Pest Shield",
    description: "Proven across 5+ years of field operations: trees fitted with trunk sheets suffer 0% damage from nocturnal climbing honey badgers."
  },
  {
    id: "apiary-22",
    index: 22,
    src: "/images/apiary/beeyield-apiary-22.jpg",
    title: "Low Canopy Shrub Nesting",
    subtitle: "Log hive positioned at intermediate branch height for easy monitoring",
    category: "in_land",
    tags: ["in_land", "monitoring", "inspection"],
    location: "Dryland Farm Buffer",
    badge: "Inspection Height",
    description: "Placed at accessible reach for rapid acoustic stethoscope checks without requiring ladder climbs in thorny brush."
  },
  {
    id: "apiary-23",
    index: 23,
    src: "/images/apiary/beeyield-apiary-23.jpg",
    title: "Rocky Terrain Apiary",
    subtitle: "Log hive suspended above volcanic rocky dryland ground",
    category: "in_land",
    tags: ["in_land", "volcanic_soils", "makueni", "forage"],
    location: "Chyulu Hills Buffer, Kibwezi",
    badge: "Volcanic Flora",
    description: "Rich volcanic minerals in the soil feed mineral-rich wild herbs, giving our honey its distinct dark amber color and high enzyme count."
  },
  {
    id: "apiary-24",
    index: 24,
    src: "/images/apiary/beeyield-apiary-24.jpg",
    title: "Horizontal Log Hive in Acacia Foliage",
    subtitle: "Natural dappled sun filtration across hive surface",
    category: "in_hive",
    tags: ["in_hive", "sunlight", "temperature_control"],
    location: "Kibwezi Apiary Site 3",
    badge: "Solar Buffer",
    description: "Leaves filter 70% of direct UV and thermal radiation, keeping hive internals well below the critical 36°C brood stress threshold."
  },
  {
    id: "apiary-25",
    index: 25,
    src: "/images/apiary/beeyield-apiary-25.jpg",
    title: "Triple Log Hive Line at Fence Line",
    subtitle: "Three hand-carved hives strung along protected perimeter fence",
    category: "team",
    tags: ["team", "field_work", "apiary_setup", "security"],
    location: "Kibwezi Demonstration Farm",
    badge: "Perimeter Line",
    description: "Installed along apiary security fence lines to create a natural bee fence that protects farm crops from wildlife encroachment."
  },
  {
    id: "apiary-26",
    index: 26,
    src: "/images/apiary/beeyield-apiary-26.jpg",
    title: "Suspended Log in Dry Thicket",
    subtitle: "Wire suspension maintaining level horizontal alignment",
    category: "in_hive",
    tags: ["in_hive", "alignment", "comb_architecture"],
    location: "Makueni Bush",
    badge: "Comb Stability",
    description: "Level horizontal stability ensures bees draw uniform comb sheets along the ceiling of the hollow cylinder."
  },
  {
    id: "apiary-27",
    index: 27,
    src: "/images/apiary/beeyield-apiary-27.jpg",
    title: "Natural V-Fork Tree Placement",
    subtitle: "Log hive wedged firmly in three-way tree branch junction",
    category: "in_land",
    tags: ["in_land", "natural_architecture", "anchorage"],
    location: "Makueni Outskirts",
    badge: "Fork Mount",
    description: "Traditional beekeepers identify natural branch crotches where wood expands, creating a locked position without damaging the live tree."
  },
  {
    id: "apiary-28",
    index: 28,
    src: "/images/apiary/beeyield-apiary-28.jpg",
    title: "Acacia Branch Canopy Cradle",
    subtitle: "Hanging log hive amid fine acacia feather foliage",
    category: "media",
    tags: ["media", "foliage", "aesthetic", "nature"],
    location: "Kibwezi Woodlands",
    badge: "Nature Harmony",
    description: "Coexistence of ancient beekeeping practices and nature: zero deforestation, zero chemical treatments, zero synthetic plastic."
  },
  {
    id: "apiary-29",
    index: 29,
    src: "/images/apiary/beeyield-apiary-29.jpg",
    title: "Modern Yellow Langstroth Apiary Row",
    subtitle: "Three bright yellow Langstroth hives on anti-termite raised stand under shelter",
    category: "story",
    tags: ["story", "modern_scale", "langstroth", "growth", "termite_defense"],
    location: "BeeYield Central Apiary Hub, Kibwezi",
    badge: "Modern Scale · 184 Hives",
    description: "Our modern Langstroth yard with bright yellow hives built on raised anti-termite poles under natural timber shade shelters, scaled from our 4 origin hives."
  },
  {
    id: "apiary-30",
    index: 30,
    src: "/images/apiary/beeyield-apiary-30.jpg",
    title: "Double Suspended Hive Setup",
    subtitle: "Paired log hives sharing a high-capacity acacia limb",
    category: "media",
    tags: ["media", "tandem_apiary", "canopy"],
    location: "Kibwezi River Zone",
    badge: "Paired Rig",
    description: "Twin hive branches maximize nectar collection density around concentrated acacia and desert palm bloom zones."
  },
  {
    id: "apiary-31",
    index: 31,
    src: "/images/apiary/beeyield-apiary-31.jpg",
    title: "Carved Hives Near Tree Trunk",
    subtitle: "Log hives hung with wire ropes in dryland shrub zone",
    category: "team",
    tags: ["team", "installation", "apiary_stewardship"],
    location: "Makueni Apiary Station 4",
    badge: "Apiary Steward Rig",
    description: "Maintained and inspected weekly by local trained apiary stewards who know every colony's temperament and forage radius."
  },
  {
    id: "apiary-32",
    index: 32,
    src: "/images/apiary/beeyield-apiary-32.jpg",
    title: "Deep Shade Canopy Nest",
    subtitle: "Log hive positioned deep in the heart of dense acacia boughs",
    category: "in_land",
    tags: ["in_land", "shade_management", "microclimate"],
    location: "Kibwezi Bushland",
    badge: "Deep Shade",
    description: "Thermal cameras show in-canopy ambient temperature remains up to 6°C cooler than open ground, preventing comb melting."
  },
  {
    id: "apiary-33",
    index: 33,
    src: "/images/apiary/beeyield-apiary-33.jpg",
    title: "Canopy Looking Upward with Multiple Hives",
    subtitle: "Four hives suspended across spreading umbrella acacia canopy",
    category: "media",
    tags: ["media", "canopy_vista", "traditional_apiary"],
    location: "Kibwezi Central Apiary",
    badge: "Panoramic Canopy",
    description: "Showcases the scale of traditional communal apiculture in Kenya: turning high trees into thriving multi-colony apiaries."
  },
  {
    id: "apiary-34",
    index: 34,
    src: "/images/apiary/beeyield-apiary-34.jpg",
    title: "Close-Up of Yellow Langstroth Hive on Stand",
    subtitle: "Hand-crafted yellow hive box on anti-termite wooden support beam",
    category: "in_hive",
    tags: ["in_hive", "langstroth", "craftsmanship", "termite_guard"],
    location: "Kibwezi Apiary Yard",
    badge: "Termite-Proof Stand",
    description: "Elevated timber beams isolated with grease bowls and zinc sheeting prevent destructive underground termites from consuming hive boxes."
  },
  {
    id: "apiary-35",
    index: 35,
    src: "/images/apiary/beeyield-apiary-35.jpg",
    title: "Savanna Edge Hanging Hive",
    subtitle: "Log hive suspended overlooking the sprawling dryland hills",
    category: "blogs",
    tags: ["blogs", "hills", "forage_corridors", "pollination"],
    location: "Makueni Hillside Apiary",
    badge: "Highland Buffer",
    description: "Positioned along natural pollinator migration flight paths connecting mountain forests to lowland agricultural crop fields."
  },
  {
    id: "apiary-36",
    index: 36,
    src: "/images/apiary/beeyield-apiary-36.jpg",
    title: "Shaded Langstroth Apiary Station",
    subtitle: "Full view of yellow Langstroth hives on anti-termite poles under shelter roof",
    category: "in_land",
    tags: ["in_land", "langstroth_station", "shelter", "modern"],
    location: "Central Demonstration Apiary, Kibwezi",
    badge: "Sheltered Apiary",
    description: "Timber roof shelter deflects torrential tropical rain and harsh midday sun, prolonging equipment life and stabilizing colony brood."
  },
  {
    id: "apiary-37",
    index: 37,
    src: "/images/apiary/beeyield-apiary-37.jpg",
    title: "Fork-Wedged Log Hive Close View",
    subtitle: "Carved end-cap of traditional log hive resting in three-way tree branch",
    category: "story",
    tags: ["story", "heritage_tool", "end_cap", "kamba"],
    location: "Kibwezi Bushland",
    badge: "Ancestral Design",
    description: "The very design taught to Timothy by his father: tight wood joints, carved hollow trunk, and natural beeswax baiting."
  },
  {
    id: "apiary-38",
    index: 38,
    src: "/images/apiary/beeyield-apiary-38.jpg",
    title: "Canopy Silhouette with Suspended Hives",
    subtitle: "Dramatic silhouette of log hives against bright African sky",
    category: "media",
    tags: ["media", "silhouette", "canopy", "gallery"],
    location: "Makueni Sunset Zone",
    badge: "Silhouette",
    description: "Evening view as African honeybee foragers return from acacia blossoms, clustering at entrance slits before nightfall."
  },
  {
    id: "apiary-39",
    index: 39,
    src: "/images/apiary/beeyield-apiary-39.jpg",
    title: "Suspended Log Hive in Low Acacia Tree",
    subtitle: "Level wire-hung log hive in dry shrubland",
    category: "blogs",
    tags: ["blogs", "microclimate", "acoustic_monitoring"],
    location: "Makueni Apiary Yard",
    badge: "Acoustic Node",
    description: "Ideal test site for non-invasive audio frequency sensors monitoring colony queen piping and pre-swarm humming."
  },
  {
    id: "apiary-40",
    index: 40,
    src: "/images/apiary/beeyield-apiary-40.jpg",
    title: "High Canopy Log Hives Under Rain Clouds",
    subtitle: "Traditional hives high in acacia branches against dramatic savanna sky",
    category: "media",
    tags: ["media", "storm", "rain_clouds", "landscape", "canopy"],
    location: "Kibwezi Bushland",
    badge: "Savanna Sky",
    description: "Rain clouds gathering over the drylands — signaling the start of the heavy acacia blossoming season when hives fill with wild honey."
  },
  {
    id: "apiary-41",
    index: 41,
    src: "/images/apiary/beeyield-apiary-41.jpg",
    title: "Beekeeper Veil at Yellow Langstroth Apiary Station",
    subtitle: "Protective suit veil overlooking yellow Langstroth hives on anti-termite poles",
    category: "team",
    tags: ["team", "stewardship", "langstroth", "inspection", "gear"],
    location: "BeeYield Central Apiary Hub, Kibwezi",
    badge: "Frontline Leadership",
    description: "Frontline inspection view: beekeeper veil facing 4 yellow Langstroth hives on elevated anti-termite wooden poles under natural acacia shelter."
  }
];

export const TEAM_APIARY_PHOTOS = ALL_APIARY_PHOTOS.filter(p => p.category === 'team' || p.tags.includes('team'));
export const STORY_APIARY_PHOTOS = ALL_APIARY_PHOTOS.filter(p => p.category === 'story' || p.tags.includes('story') || p.tags.includes('heritage'));
export const MEDIA_APIARY_PHOTOS = ALL_APIARY_PHOTOS; // Media gets full gallery access
export const IN_LAND_APIARY_PHOTOS = ALL_APIARY_PHOTOS.filter(p => p.category === 'in_land' || p.tags.includes('in_land') || p.tags.includes('forage'));
export const IN_HIVE_APIARY_PHOTOS = ALL_APIARY_PHOTOS.filter(p => p.category === 'in_hive' || p.tags.includes('in_hive') || p.tags.includes('langstroth'));
export const DISEASES_APIARY_PHOTOS = ALL_APIARY_PHOTOS.filter(p => p.category === 'diseases' || p.tags.includes('diseases') || p.tags.includes('biosecurity') || p.tags.includes('predator_guard') || p.tags.includes('predator_defense'));
export const BLOGS_APIARY_PHOTOS = ALL_APIARY_PHOTOS.filter(p => p.category === 'blogs' || p.tags.includes('blogs') || p.tags.includes('acoustic_monitoring') || p.tags.includes('propolis'));
