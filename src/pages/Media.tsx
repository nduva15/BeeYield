import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowRight,
  Sprout,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Quote,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Camera,
  CheckCircle2,
  Layers,
  Radio,
  ShieldCheck,
  Award,
  QrCode,
  Droplets,
  Scale,
  Box,
  Truck,
  FileCheck,
  Check,
  Mail,
} from "lucide-react";

const Linkedin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoryHeroBackground } from "@/components/StoryHeroBackground";
import { HIVE_TO_HONEY_VALUE_CHAIN, BEEYIELD_TRACEABILITY_STORY } from "@/lib/traceabilityNarrative";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

const Media = () => {
  const location = useLocation();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const queryParams = new URLSearchParams(location.search);
  const initialMediaTab = queryParams.get("tab") === "honey" || location.hash.includes("honey") ? "honey" : "bee";
  const [activeMediaType, setActiveMediaType] = useState<"bee" | "honey">(initialMediaTab);
  const [selectedHoneyPhotoIndex, setSelectedHoneyPhotoIndex] = useState(0);
  const [activeValueChainStep, setActiveValueChainStep] = useState(0);

  // Honey Traceability Media Dispatches & Case Studies
  const honeyMediaDispatches = [
    {
      id: "box-migration",
      title: "Moving Bee Hives: Peak Acacia Bloom",
      location: "Kibwezi Forest Apiary Zone A",
      coordinates: "Kibwezi, Makueni",
      beekeeper: "Timothy Nduva & Kibwezi Team",
      category: "Hive Tracking",
      badge: "Tracked Origin",
      badgeColor: "bg-amber-500/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "We move 184 hives into wild Acacia woodlands when trees are in full bloom. Every hive has its own QR code and location record so you can see exactly where your honey came from.",
      image: "/images/story/hives/apiary-langstroth-row.jpg",
      thumbLabel: "Moving Hives",
      cropType: "Wild Acacia",
      provenanceHighlights: [
        "Flowers: 100% wild Acacia blossoms in dryland forests",
        "Hive tags: Hives KIB-001 to KIB-184 with unique QR tags",
        "Mobile records: Hive locations logged on phone, even offline",
      ],
      qualityImpact:
        "Bees feed only on wild blossoms, ensuring pure single-flower honey with no added sugar, corn syrup, or chemicals.",
    },
    {
      id: "centrifugal-extraction",
      title: "Gentle Cold Spinning at the Collection Center",
      location: "Kibwezi Regional Collection Center",
      coordinates: "Makueni Center #KIB-CC1",
      beekeeper: "Makueni Extraction Team",
      category: "Cold Extraction",
      badge: "Cold Spun (<35°C)",
      badgeColor: "bg-emerald-600/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
      description:
        "We weigh honeycomb frames and spin them at normal room temperature (below 35°C). We never boil or overheat our honey, so all natural bee enzymes and healthy nutrients stay alive.",
      image: "/images/story/hives/yellow-langstroth-closeup.jpg",
      thumbLabel: "Cold Spinning",
      cropType: "Raw Honey",
      provenanceHighlights: [
        "Spun gently in clean stainless steel extractors without cooking",
        "Moisture tested at 16.8% for rich, premium grade honey",
        "Digital receipt links each jar back to its original hive",
      ],
      qualityImpact:
        "No heating means you get pure, raw honey packed with natural vitamins, enzymes, and wildflower aroma.",
    },
    {
      id: "refractometer-purity",
      title: "Purity Testing & Zero Added Sugar",
      location: "BeeYield Field Center",
      coordinates: "Food Safety Standards",
      beekeeper: "Quality Field Inspector",
      category: "Pure & Real",
      badge: "0% Added Sugar",
      badgeColor: "bg-blue-500/15 text-blue-800 border-blue-300 dark:text-blue-200",
      description:
        "Every batch is tested to confirm low moisture and zero fake syrups. With our QR code tracking, we prove every jar is 100% real honey meeting strict international food standards.",
      image: "/images/products/beeyield_honey_500g.png",
      thumbLabel: "Purity Check",
      cropType: "Quality Tested",
      provenanceHighlights: [
        "Tested 100% free of corn syrup, cane sugar, or fillers",
        "Pollen testing confirms genuine blossom source",
        "Batch test results attached to your jar's QR code",
      ],
      qualityImpact:
        "Guarantees that you and your family are eating honest, 100% pure honey.",
    },
    {
      id: "beekeeper-kyc",
      title: "Fair Pay & Support for Local Beekeepers",
      location: "Mbuinzau & Kiunduani Cooperatives",
      coordinates: "105+ Local Beekeepers",
      beekeeper: "Farmer Christopher & Clement",
      category: "Fair Trade",
      badge: "Fair Pay Guaranteed",
      badgeColor: "bg-purple-500/15 text-purple-800 border-purple-300 dark:text-purple-200",
      description:
        "Local beekeepers use our simple mobile app to track their hives and receive fair payments directly to their phones as soon as they deliver honey.",
      image: "/images/story/hives/beekeeper-inspection-twilight.jpg",
      thumbLabel: "Our Beekeepers",
      cropType: "Community Farming",
      provenanceHighlights: [
        "Works offline on basic smartphones in remote rural areas",
        "Accurate digital scales ensure farmers are paid for every gram",
        "Fair prices paid directly via mobile money (M-Pesa)",
      ],
      qualityImpact:
        "Fair pay rewards beekeepers for taking great care of their bees and protecting wild trees.",
    },
    {
      id: "fifty-fifty-reserve",
      title: "Our 50/50 Promise: Feeding the Bees First",
      location: "Kavita Nature Sanctuary",
      coordinates: "Kavita, Kibwezi",
      beekeeper: "Farmer Gabriel Kavita",
      category: "Bee Care",
      badge: "50% Saved for Bees",
      badgeColor: "bg-teal-500/15 text-teal-800 border-teal-300 dark:text-teal-200",
      description:
        "Our golden rule: we always leave at least half the honey in the hive so bees have plenty of food during dry seasons. We never feed bees artificial sugar water or use harsh chemicals.",
      image: "/images/story/hives/savannah-hanging-hive.jpg",
      thumbLabel: "50/50 Promise",
      cropType: "Bee-Friendly Harvest",
      provenanceHighlights: [
        "We leave 50% in the hive so colonies stay strong and fed",
        "Zero pesticides, artificial chemicals, or antibiotics",
        "Over 2,500 native trees planted to give bees more flowers",
      ],
      qualityImpact:
        "Healthy, well-fed bees stay strong and make clean, top-quality honey season after season.",
    },
  ];

  // 105 Total Acres Network across Makueni Partner Farmers
  const partnerFarmers = [
    {
      id: "clement",
      name: "Farmer Clement",
      location: "Kibarani, Makueni",
      role: "Commercial Mango, Orange & Citrus Grower",
      crops: ["Mangoes", "Oranges", "Citrus"],
      acres: 25,
      iotRole: "First Farm Partner to Try Smart Hive Care",
      quote:
        "Being the first receiver of BeeYield's IoT disease and pollination devices in Kibarani has helped me truly understand bees. Seeing real-time colony health and flight patterns allowed us to time hive placement with flower blooming season. Our mangoes, oranges, and citrus have never had such dense fruit set and superior fruit size.",
      shortQuote: "I have been able to truly understand bees and optimize pollination for our mangoes, oranges, and citrus.",
      image: "/images/pollination/mango-panicles-close-bloom.png",
      badgeColor: "bg-amber-500/15 text-amber-800 border-amber-300 dark:text-amber-200",
    },
    {
      id: "ngumbau",
      name: "Farmer Ngumbau",
      location: "Kiunduani, Makueni",
      role: "Citrus & Multi-Crop Orchardist",
      crops: ["Citrus", "Oranges", "Companion Crops"],
      acres: 18,
      iotRole: "Partner Orchardist",
      quote:
        "As the second receiver of BeeYield's IoT devices in Kiunduani, I am excited to continue learning every single day. Tracking temperature, acoustics, and bee flight activity right from my phone gives me total visibility over pollination progress across my 18 acres.",
      shortQuote: "I am excited to continue learning how IoT insights and bees work together to transform our orchards.",
      image: "/images/pollination/orange-heavy-fruiting-branches.jpg",
      badgeColor: "bg-orange-500/15 text-orange-800 border-orange-300 dark:text-orange-200",
    },
    {
      id: "christopher",
      name: "Farmer Christopher",
      location: "Kiunduani, Makueni",
      role: "Export Mango Producer",
      crops: ["Mangoes", "Orchards"],
      acres: 18,
      iotRole: "Early Hive Disease Alerts",
      quote:
        "BeeYield has been completely life changing for our farm. When a varroa mite infestation threatened our colonies, ApiSense tech identified the hive unusual buzzing sounds early, warning us before the bees got sick. That timely intervention saved our hives and protected all 18 acres of blooming mangoes.",
      shortQuote: "BeeYield has been life changing. ApiSense tech helped identify varroa in time to save our hives.",
      image: "/images/pollination/mango-orchard-pink-panicles.png",
      badgeColor: "bg-rose-500/15 text-rose-800 border-rose-300 dark:text-rose-200",
    },
    {
      id: "redempta",
      name: "Farmer Redempta",
      location: "Mbuinzau, Makueni",
      role: "Diversified Horticulture & Orchardist",
      crops: ["Mangoes", "Vegetables", "Citrus"],
      acres: 15,
      iotRole: "Orchard & Vegetable Pollination",
      quote:
        "On my 15 acres in Mbuinzau, coordinating pollination across mangoes, fresh vegetables, and citrus was difficult until BeeYield. The bees work the morning citrus blooms and mid-day mango panicles seamlessly, while pollinating our vegetable beds. Rejection rates plummeted and yields broke our record.",
      shortQuote: "Across my mangoes, veges, and citrus, BeeYield's bees ensure complete pollination and zero crop waste.",
      image: "/images/pollination/citrus-orchard-structured-rows.jpg",
      badgeColor: "bg-emerald-500/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
    },
    {
      id: "mbilu",
      name: "Farmer Mbilu",
      location: "Mbuinzau, Makueni",
      role: "Commercial Maize Grower",
      crops: ["Maize"],
      acres: 15,
      iotRole: "Maize Flowering & Grain Fill",
      quote:
        "I farm 15 acres of maize in Mbuinzau. Many believe maize only needs wind, but BeeYield proved that bees gathering tassel pollen create massive pollen shed. My cobs this season are filled completely to the tip with heavy, golden kernels, boosting my total yield per acre by over 22%.",
      shortQuote: "Our 15 acres of maize in Mbuinzau achieved 100% cob tip fill thanks to active bee traffic during tasseling.",
      image: "/images/pollination/maize-field-panorama-mountain.png",
      badgeColor: "bg-yellow-500/15 text-yellow-800 border-yellow-300 dark:text-yellow-200",
    },
    {
      id: "gabriel",
      name: "Farmer Gabriel Kavita",
      location: "Kavita, Makueni",
      role: "Agroforestry & Ecological Restoration Farmer",
      crops: ["Bees & Ecosystem Restoration", "Mixed Fruit"],
      acres: 14,
      iotRole: "Restoring Nature & Caring for Bees",
      quote:
        "Bees are very dear to my heart. Seeing them return and thrive across our 14 acres in Kavita has brought genuine ecological restoration to our degraded land. Partnering with BeeYield has made me so happy—our soil is reviving, tree fruit retention is up, and nature is flourishing.",
      shortQuote: "I am happy and very dear with bees and restoration. Reviving our land with bees brings unmatched joy.",
      image: "/images/pollination/mango-orange-farm-wide.jpg",
      badgeColor: "bg-teal-500/15 text-teal-800 border-teal-300 dark:text-teal-200",
    },
  ];

  // Verified Photo Gallery Dispatches across the 105 Acres
  const latestPollinationMedia = [
    {
      id: "mango-fruitlet-set",
      title: "Successful Pollination: Pea-Stage Mango Fruitlets Developing",
      farmer: "Farmer Christopher",
      location: "Kiunduani, Makueni",
      acres: 18,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Bloom to Young Fruit Stage)",
      category: "Pollination Verification & Fruit Set",
      badge: "Verified Fruitlet Set (Pea Stage)",
      badgeColor: "bg-emerald-600/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
      description:
        "Remarkable photographic proof of successful bee pollination on Farmer Christopher's 18-acre orchard in Kiunduani. Where honeybees transferred viable pollen across blooming flowers have been thoroughly pollinated, turning into healthy clusters of young green mangoes.",
      image: "/images/pollination/mango-pollination-fruitlet-set.jpg",
      thumbLabel: "Fruitlet Set",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Christopher (Kiunduani) — 18-acre orchard showing verified fruit set",
        "Healthy clusters of young green mangoes growing after successful pollination",
        "Transition from flower blooming season to early fruit expansion without flower abortion",
      ],
      agronomicImpact:
        "Good pollination means flowers turn into heavy clusters of even fruit and prevents fruit from falling off the tree early.",
    },
    {
      id: "mango-dense-pink-spikes",
      title: "Full Tree Canopy Smothered in Pink Flower Spikes",
      farmer: "Farmer Christopher",
      location: "Ndeini, Makueni",
      acres: 18,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Peak Bloom Canopy)",
      category: "Intense Floral Saturation",
      badge: "Prime Export Blossom Set",
      badgeColor: "bg-rose-500/15 text-rose-700 border-rose-300 dark:text-rose-300",
      description:
        "Dramatic close shot of a mature mango tree completely engulfed in thousands of dense pink and cream flower clusters against the open sky in Ndeini. Bees visit every flower cluster, helping turn blossoms into large, sweet fruit.",
      image: "/images/pollination/mango-tree-dense-pink-blossoms.png",
      thumbLabel: "Pink Canopy Bloom",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Christopher (Ndeini) — 18-acre orchard under active bloom protection",
        "Exceptional blossom density with thousands of florets per major scaffold branch",
        "Active bee pollination throughout the morning when flowers open",
      ],
      agronomicImpact:
        "Helps every blossom turn into a sweet, healthy mango and stops flowers from dropping early.",
    },
    {
      id: "orchard-panorama-baobab",
      title: "Agroforestry Hillside: Mangoes, Citrus & Ancient Baobab",
      farmer: "Farmer Redempta",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Mangoes & Citrus",
      cropScientific: "Mangifera indica & Citrus sinensis with Adansonia digitata",
      category: "Biodiversity & Agroforestry",
      badge: "Landscape Agroforestry",
      badgeColor: "bg-teal-500/15 text-teal-700 border-teal-300 dark:text-teal-300",
      description:
        "Spectacular panoramic vista over terraced red-earth slopes in Mbuinzau, where flowering mango orchards and citrus groves are anchored by a majestic ancient African baobab tree. Honeybees cross-forage across tree species, stabilizing the semi-arid ecosystem.",
      image: "/images/pollination/orchard-panorama-mango-citrus-baobab.jpg",
      thumbLabel: "Orchard & Baobab",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Redempta (Mbuinzau) — 15 acres of coordinated citrus, mango, and companion crops",
        "Ancient baobab tree providing wild cavity nesting sites and microclimate stability",
        "Red loam terraces capturing seasonal rainfall while hives provide constant pollination traffic",
      ],
      agronomicImpact:
        "Multi-species agroforestry buffers bee colonies against monoculture famine and keeps bee colonies well-fed all year round.",
    },
    {
      id: "mango-groundcover-panicles",
      title: "Mango Panicles with Cover Crops on Red Loam Soil",
      farmer: "Farmer Clement",
      location: "Kalakalya, Makueni",
      acres: 25,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Bloom & Cover Crop Understory)",
      category: "Bloom & Soil Microclimate",
      badge: "Peak Flowering Season",
      badgeColor: "bg-amber-600/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "Vibrant mango panicles loaded with floral florets flowering alongside sweet potato cover crops on rich red loam soil in Kalakalya. Honeybees forage both the upper mango flowers and ground-cover blossoms, maintaining moisture and organic biodiversity.",
      image: "/images/pollination/mango-bloom-panicles-groundcover.jpg",
      thumbLabel: "Panicles & Groundcover",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Clement (Kalakalya) — 25 acres utilizing cover crops for soil moisture conservation",
        "Dense pink flower panicles opening synchronously across lower and mid canopy",
        "Cover crop layer retaining soil humidity and cooling root microclimates during dry spells",
      ],
      agronomicImpact:
        "Cover crops keep the soil cool and moist while our bees pollinate every mango flower.",
    },
    {
      id: "citrus-mango-slope",
      title: "Citrus Grove & Mango Interplant on Red Terraces",
      farmer: "Farmer Clement",
      location: "Kibarani, Makueni",
      acres: 25,
      crop: "Citrus & Mangoes",
      cropScientific: "Citrus sinensis & Mangifera indica",
      category: "Inter-Row Flight Corridors",
      badge: "Companion Orchard Layout",
      badgeColor: "bg-lime-600/15 text-lime-800 border-lime-300 dark:text-lime-200",
      description:
        "Young citrus trees flourishing in vibrant green foliage interspersed along red soil terraces with flowering mango trees in Kibarani. Structured row geometry enables honeybees to quickly navigate between blooming canopy flushes without expending excess flight energy.",
      image: "/images/pollination/citrus-mango-orchard-slope.jpg",
      thumbLabel: "Citrus & Mango Slope",
      cropType: "Citrus",
      fieldObservations: [
        "Farmer Clement (Kibarani) — 25-acre orchard integrating drip citrus lines with mango rows",
        "Clean under-canopy cultivation optimizing bee flight paths between parallel terraces",
        "Contour hive placement reducing flight distances during intense mid-day heat",
      ],
      agronomicImpact:
        "Reduced flight distances between hives and blossoms increase daily pollination visitation rates by up to 45%.",
    },
    {
      id: "mango-terraced-canopy",
      title: "Terraced Mango Orchards in Full Bloom",
      farmer: "Farmer Ngumbau",
      location: "Kaunguni, Makueni",
      acres: 16,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Terraced Orchard)",
      category: "Hillside Mango Bloom",
      badge: "Terraced Forage Corridor",
      badgeColor: "bg-emerald-600/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
      description:
        "Upright mango trees bursting with flower clusters along red-soil hillside terraces in Kaunguni. The proximity to indigenous acacia and baobab canopies creates natural windbreaks and year-round floral corridors for managed colonies.",
      image: "/images/pollination/mango-orchard-flowering-canopy.jpg",
      thumbLabel: "Terraced Canopy",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Ngumbau (Kaunguni) — 16 acres of terraced hillside fruit tree cultivation",
        "Hillside terracing preventing soil erosion while channeling bee flight paths",
        "Indigenous woodland borders providing diverse supplementary nectar and pollen",
      ],
      agronomicImpact:
        "Natural trees block dry winds, keeping flowers moist and helping fruit stay firmly on the branches.",
    },
    {
      id: "mango-panicles",
      title: "Mango Trees in Full Blossom",
      farmer: "Farmer Clement",
      location: "Kibarani, Makueni",
      acres: 25,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Apple & Ngowe Mangoes)",
      category: "Blossoms & Bee Pollination",
      badge: "High Bee Dependency (90%)",
      badgeColor: "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-300",
      description:
        "Ultra close-up of dense floral panicles at critical bloom on Farmer Clement's 25-acre holding in Kibarani. As the 1st receiver of BeeYield IoT devices, Clement checks his hives to make sure bees are active when flowers open in the morning.",
      image: "/images/pollination/mango-panicles-close-bloom.png",
      thumbLabel: "Mango Panicles",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Clement (Kibarani) — 1st IoT device recipient monitoring hive acoustics",
        "Thousands of tiny blossoms on every branch visited by honeybees",
        "Targeting 2.5 - 4.0 hives per acre across Clement's 25-acre orchard",
      ],
      agronomicImpact:
        "Mango flowers bloom for just a short time. Constant bee visits ensure every flower is pollinated, leading to bigger, sweeter fruit.",
    },
    {
      id: "mango-pink-panicles",
      title: "Mango Canopies Burst with Pink Flowers",
      farmer: "Farmer Christopher",
      location: "Kiunduani, Makueni",
      acres: 18,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Canopy Bloom)",
      category: "Upper Canopy Bloom",
      badge: "Canopy in Full Bloom",
      badgeColor: "bg-rose-500/15 text-rose-700 border-rose-300 dark:text-rose-300",
      description:
        "Flowering mango panicles exhibiting vibrant pink hues across Farmer Christopher's 18-acre orchard in Kiunduani. Protected by ApiSense early varroa detection, vigorous colonies push foragers into the high branches where natural wind pollination fails.",
      image: "/images/pollination/mango-orchard-pink-panicles.png",
      thumbLabel: "Pink Panicles",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Christopher (Kiunduani) — Saved 18-acre pollination run after early varroa detection",
        "Intense pink floral pigmentation indicating optimal nectar sugar concentration",
        "Hive density of 3.0 hives per acre driving uniform fruitlet sets in upper branches",
      ],
      agronomicImpact:
        "Secures fruit set in the high-sunlight upper canopy, producing premium blush-colored export fruits with maximum market value.",
    },
    {
      id: "mango-full-tree",
      title: "Full Blooming Mature Mango Tree in Orchard",
      farmer: "Farmer Clement",
      location: "Kibarani, Makueni",
      acres: 25,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Full Canopy Bloom)",
      category: "Full Orchard in Bloom",
      badge: "100% Bloom Saturation",
      badgeColor: "bg-amber-600/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "Spectacular wide shot of a mature mango tree smothered in golden blooms in Kibarani on Farmer Clement's farm. Data from Clement's IoT disease and pollination sensors confirmed peak flight activity during morning peak bloom.",
      image: "/images/pollination/mango-mature-tree-full-bloom.png",
      thumbLabel: "Full Tree Bloom",
      cropType: "Mangoes",
      fieldObservations: [
        "Zero pesticide drift protocols active during open flower stages",
        "Massive pollinator roar audible across Clement's 25-acre block",
        "Estimated 80,000 to 120,000 open flowers on a single mature canopy",
      ],
      agronomicImpact:
        "Uniform pollination across the whole canopy prevents staggered ripening, allowing synchronized harvesting and lower labor costs.",
    },
    {
      id: "orange-heavy-fruiting",
      title: "Citrus Tree in Heavy Fruiting Stage",
      farmer: "Farmer Ngumbau",
      location: "Kiunduani, Makueni",
      acres: 18,
      crop: "Oranges & Citrus",
      cropScientific: "Citrus sinensis (Fruit Development)",
      category: "Fruit Retention & Sizing",
      badge: "Heavy Fruit Set",
      badgeColor: "bg-orange-500/15 text-orange-700 border-orange-300 dark:text-orange-300",
      description:
        "Lush orange tree branches laden with green citrus fruitlets on Farmer Ngumbau's 18 acres in Kiunduani. As the 2nd recipient of BeeYield IoT devices, Ngumbau used real-time colony logs to verify multi-visit blossom coverage.",
      image: "/images/pollination/orange-heavy-fruiting-branches.jpg",
      thumbLabel: "Heavy Fruiting",
      cropType: "Oranges",
      fieldObservations: [
        "Farmer Ngumbau (Kiunduani) — 2nd IoT device recipient actively tracking hive metrics",
        "Average cluster density of 4-7 developing fruits per fruiting terminal",
        "Zero signs of premature physiological fruit drop after complete pollination",
      ],
      agronomicImpact:
        "Adequate bee visits per flower deposit enough pollen grains to trigger multi-seed development, stimulating natural fruit growth for larger, sweeter oranges.",
    },
    {
      id: "orange-citrus-fruits",
      title: "Developing Citrus Fruits in Commercial Grove",
      farmer: "Farmer Clement",
      location: "Kibarani, Makueni",
      acres: 25,
      crop: "Oranges & Citrus",
      cropScientific: "Citrus sinensis (Mid-Season Bulking)",
      category: "Mid-Season Sizing Phase",
      badge: "Export Grade Sizing",
      badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-300",
      description:
        "Vibrant young oranges expanding rapidly on Farmer Clement's Kibarani farm. Bee-mediated fertilization ensures even, well-shaped fruit without deformed shapes.",
      image: "/images/pollination/orange-citrus-fruits-developing.jpg",
      thumbLabel: "Developing Fruits",
      cropType: "Oranges",
      fieldObservations: [
        "Flawless rind surface free of early pest abrasions",
        "Symmetric fruit profile indicating fruit growing evenly and round",
        "Consistent fruit diameter across inner and outer canopy branches",
      ],
      agronomicImpact:
        "Symmetric fruit development is required for mechanical grading and export packing lines. Even pollination guarantees high packout percentages.",
    },
    {
      id: "citrus-orchard-rows",
      title: "Structured Citrus Grove Under Managed Pollination",
      farmer: "Farmer Redempta",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Citrus & Oranges",
      cropScientific: "Citrus sinensis & Citrus reticulata",
      category: "Grove Layout & Flight Corridors",
      badge: "Commercial Alignment",
      badgeColor: "bg-teal-500/15 text-teal-700 border-teal-300 dark:text-teal-300",
      description:
        "Pristine orchard rows on Farmer Redempta's 15-acre farm in Mbuinzau. Strategic hive placement creates overlapping bee foraging corridors between citrus lines and companion vegetables.",
      image: "/images/pollination/citrus-orchard-structured-rows.jpg",
      thumbLabel: "Grove Rows",
      cropType: "Citrus",
      fieldObservations: [
        "Farmer Redempta (Mbuinzau) — 15 acres of coordinated citrus, mango and vegetable pollination",
        "Optimal inter-row spacing allowing low-altitude bee foraging corridors",
        "Managed ground cover providing pollen diversity while citrus flowers develop",
      ],
      agronomicImpact:
        "Orchard design aligned with pollinator flight paths increases visit frequencies per flower by up to 35% compared to scattered tree arrangements.",
    },
    {
      id: "citrus-bloom-buds",
      title: "Citrus Flower Buds in Peak Bloom Season",
      farmer: "Farmer Ngumbau",
      location: "Kiunduani, Makueni",
      acres: 18,
      crop: "Citrus & Oranges",
      cropScientific: "Citrus sinensis (Bloom Bloom)",
      category: "Peak Bloom Season",
      badge: "Peak Bloom Surge",
      badgeColor: "bg-amber-500/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "Dense floral buds and opening white citrus blossoms loaded with fragrant nectar on Farmer Ngumbau's Kiunduani holding. IoT sensor arrays record steady morning forager departures.",
      image: "/images/pollination/citrus-bloom-buds-closeup.jpg",
      thumbLabel: "Citrus Bloom",
      cropType: "Citrus",
      fieldObservations: [
        "Plentiful flower bud clusters with high pollen viability",
        "Multiple bee visits per blossom ensuring complete ovule fertilization",
        "High nectar secretion attracting steady morning forager traffic",
      ],
      agronomicImpact:
        "Directly prevents post-bloom flower drop, delivering heavy cluster retention across all productive branches.",
    },
    {
      id: "citrus-drip-irrigation",
      title: "Commercial Citrus Grove Under Drip Irrigation",
      farmer: "Farmer Clement",
      location: "Kibarani, Makueni",
      acres: 25,
      crop: "Citrus & Oranges",
      cropScientific: "Citrus spp. (Irrigated Blocks)",
      category: "Commercial Irrigation Management",
      badge: "Commercial Operation",
      badgeColor: "bg-emerald-600/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
      description:
        "Neat rows of mature citrus receiving precision drip irrigation on Farmer Clement's 25-acre holding in Kibarani, while honeybees from adjacent sensor-monitored apiaries actively work the canopy.",
      image: "/images/pollination/citrus-grove-drip-irrigation.jpg",
      thumbLabel: "Irrigated Grove",
      cropType: "Citrus",
      fieldObservations: [
        "Targeted drip lines maintaining steady tree hydration through bloom",
        "Dedicated apiary units positioned along wind-sheltered grove corridors",
        "Uniform flowering across all irrigated tree rows",
      ],
      agronomicImpact:
        "Synchronizes moisture availability with peak pollinator activity to accelerate cell division in newly fertilized fruitlets.",
    },
    {
      id: "mango-florets-new",
      title: "Fresh Mango Inflorescence in Full Bloom",
      farmer: "Farmer Redempta",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Peak Bloom)",
      category: "Floral Bloom & Bloom Peak",
      badge: "Peak Bloom Window",
      badgeColor: "bg-amber-600/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "Close view of flowering mango panicles with thousands of fresh florets opening synchronously on Farmer Redempta's Mbuinzau plots. Bee density guarantees hermaphrodite flowers receive cross-pollination before stigmas dry.",
      image: "/images/pollination/mango-flowering-panicles-new.jpg",
      thumbLabel: "Fresh Florets",
      cropType: "Mangoes",
      fieldObservations: [
        "Abundant pollen grains ready for active honeybee collection",
        "Active morning bee traffic depositing viable grains onto stigmas",
        "Significantly lower blight and abortion in pollinated panicles",
      ],
      agronomicImpact:
        "Crucial for transforming delicate inflorescences into clusters of export-grade mango fruitlets.",
    },
    {
      id: "maize-intercrop",
      title: "Maize & Vegetable Field Intercrop Under Drip Irrigation",
      farmer: "Farmer Redempta",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Maize & Vegetables",
      cropScientific: "Zea mays & Brassica spp.",
      category: "Crop Intercropping & Pollination",
      badge: "Horticulture Intercrop",
      badgeColor: "bg-green-600/15 text-green-800 border-green-300 dark:text-green-200",
      description:
        "Commercial field beds showing healthy rows of vegetables under precision drip irrigation intercropped with developing maize on Farmer Redempta's 15 acres in Mbuinzau. Honeybees forage across tassels for protein, pollinating companion crops.",
      image: "/images/pollination/maize-vegetable-intercrop-drip.jpg",
      thumbLabel: "Maize Intercrop",
      cropType: "Maize",
      fieldObservations: [
        "Uniform crop beds under high-efficiency drip irrigation tubing",
        "Emerging maize tassels providing abundant pollen for bee colonies",
        "Synergistic companion planting maximizing land productivity and pollinator nutrition",
      ],
      agronomicImpact:
        "Promotes better ear filling and tip kernel set in maize while maintaining strong pollinator populations for intercropped vegetables.",
    },
    {
      id: "maize-panoramic",
      title: "Maize Horticultural Plantation Across Scenic Ridge",
      farmer: "Farmer Mbilu",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Maize",
      cropScientific: "Zea mays (Commercial Scheme)",
      category: "Field Landscape & Crop Rows",
      badge: "Commercial Field Block",
      badgeColor: "bg-teal-600/15 text-teal-800 border-teal-300 dark:text-teal-200",
      description:
        "Panoramic perspective of Farmer Mbilu's 15-acre maize plantation in Mbuinzau. Honeybees traverse the entire planting area to gather tassel pollen during morning dehiscence, securing 100% tip fill.",
      image: "/images/pollination/maize-horticulture-field-panoramic.jpg",
      thumbLabel: "Horticulture Field",
      cropType: "Maize",
      fieldObservations: [
        "Farmer Mbilu (Mbuinzau) — 15-acre commercial maize holding achieving full ear fill",
        "Large-scale drip irrigation infrastructure ensuring unbroken crop growth",
        "Consistent pollinator foraging paths connecting field blocks with nearby apiaries",
      ],
      agronomicImpact:
        "Secures full cob fertilization across thousands of plants, preventing barren ear tips and loose kernels.",
    },
    {
      id: "maize-vertical-rows",
      title: "Maize Pollination Rows & Tassel Development",
      farmer: "Farmer Mbilu",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Maize",
      cropScientific: "Zea mays (Tasseling Phase)",
      category: "Tasseling & Pollen Window",
      badge: "Tassel Bloom",
      badgeColor: "bg-lime-600/15 text-lime-800 border-lime-300 dark:text-lime-200",
      description:
        "Down-row perspective of strong maize stalks preparing for full silking on Farmer Mbilu's Mbuinzau farm. Active bee foraging shakes tassels, showering silks with viable pollen.",
      image: "/images/pollination/maize-crop-rows-vertical.png",
      thumbLabel: "Crop Rows",
      cropType: "Maize",
      fieldObservations: [
        "Sturdy upright stalks with healthy green leaf area index",
        "Tassels emerging synchronously across Farmer Mbilu's 15-acre blocks",
        "Irrigation lines keeping root zones moist for peak pollen production",
      ],
      agronomicImpact:
        "Ensures vigorous pollen shed coincident with silk emergence for 100% cob fill.",
    },
    {
      id: "farm-panorama",
      title: "Ecological Restoration & Mixed Orchard Farm",
      farmer: "Farmer Gabriel Kavita",
      location: "Kavita, Makueni",
      acres: 14,
      crop: "Restoration & Orchards",
      cropScientific: "Agroforestry & Mixed Tree System",
      category: "Ecological Habitat Revival",
      badge: "Restoration Contract",
      badgeColor: "bg-emerald-600/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
      description:
        "Comprehensive view across Farmer Gabriel Kavita's 14 acres in Kavita, Makueni. Gabriel is deeply dedicated to bees and landscape restoration, proving that bee stewardship restores native soil and tree vitality.",
      image: "/images/pollination/mango-orange-farm-wide.jpg",
      thumbLabel: "Restoration Farm",
      cropType: "Restoration",
      fieldObservations: [
        "Farmer Gabriel Kavita (Kavita) — 14 acres dedicated to bees, restoration & fruit trees",
        "Dual-crop synergistic foraging supporting continuous bee nutrition",
        "Revival of degraded dryland soils into flowering multi-strata agroforest",
      ],
      agronomicImpact:
        "Harmonizes native tree regeneration with high-value fruit pollination, building sustainable farm resilience and permanent pollinator sanctuaries.",
    },
  ];

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  // Verified Case Studies Distributed across exactly 105 Acres
  const caseStudies = [
    {
      id: "mangoes",
      title: "Mango Pollination & Export Quality",
      category: "Fruit Orchard (58 Total Contracted Acres)",
      description: "Precision hive placement during flower blooming season drives stigmatic coverage and eliminates fruit drop.",
      stories: [
        {
          farmer: "Farmer Clement",
          location: "Kibarani, Makueni",
          role: "Commercial Mango & Citrus Grower • 1st IoT Device Recipient",
          acres: 25,
          description:
            "Being the first receiver of BeeYield's IoT disease and pollination devices in Kibarani has completely transformed how I farm. For the first time, I truly understand honeybee behavior, flower blooming season timing, and hive acoustics. My 25-acre mango orchard has achieved unprecedented fruit retention, with branches loaded with clean, export-grade fruit.",
          quote:
            "BeeYield's IoT devices taught me how to read the language of the bees. Our mango fruit set has reached levels we had never seen before in Kibarani.",
          stats: [
            { label: "Yield Increase", value: "+34%" },
            { label: "Acres Pollinated", value: "25" },
            { label: "IoT Status", value: "1st Recipient" },
          ],
          image: "/images/pollination/mango-panicles-close-bloom.png",
          fieldPhotoCaption: "25 Acres Mango Bloom • Farmer Clement, Kibarani",
        },
        {
          farmer: "Farmer Christopher",
          location: "Kiunduani, Makueni",
          role: "Commercial Mango Farmer • ApiSense Partner",
          acres: 18,
          description:
            "BeeYield has been genuinely life-changing for our family and farm. When Varroa mite threatened our apiaries during the flowering surge, ApiSense technology detected the subtle acoustic frequency shifts inside the brood chamber in time. That early warning allowed us to treat colonies immediately, preserving pollination vigor across all 18 acres of mango blooms.",
          quote:
            "BeeYield has been life changing. ApiSense tech helped identify varroa in time to save our hives and secure our best harvest ever.",
          stats: [
            { label: "Early Detection", value: "Varroa Saved" },
            { label: "Acres Pollinated", value: "18" },
            { label: "Export Grade", value: "96%" },
          ],
          image: "/images/pollination/mango-orchard-pink-panicles.png",
          fieldPhotoCaption: "18 Acres Canopy Bloom • Farmer Christopher, Kiunduani",
        },
        {
          farmer: "Farmer Redempta",
          location: "Mbuinzau, Makueni",
          role: "Diversified Horticulture & Mango Grower",
          acres: 15,
          description:
            "Managing 15 acres of mixed mangoes, citrus, and vegetables in Mbuinzau required synchronized pollination. BeeYield's strategically positioned hives ensured continuous coverage across our mango panicles during afternoon nectar secretion. Fruit drop dropped dramatically, and our export packout surged.",
          quote:
            "The bees transformed our flowering panicles into dense clusters of uniform fruitlets with zero early abortion.",
          stats: [
            { label: "Fruit Retention", value: "+38%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Farm Synergy", value: "Multi-Crop" },
          ],
          image: "/images/pollination/mango-mature-tree-full-bloom.png",
          fieldPhotoCaption: "15 Acres Full Tree Bloom • Farmer Redempta, Mbuinzau",
        },
      ],
    },
    {
      id: "citrus",
      title: "Citrus & Orange Orchards",
      category: "Citrus Fruit (58 Total Contracted Acres)",
      description: "Multi-visit ovule pollination produces heavier, sweeter citrus with export-grade symmetry.",
      stories: [
        {
          farmer: "Farmer Clement",
          location: "Kibarani, Makueni",
          role: "Citrus Orchardist • 1st IoT Device Recipient",
          acres: 25,
          description:
            "In Kibarani, our oranges and citrus groves flowered profusely, but premature blossom drop was always a threat. Through BeeYield's IoT monitoring, I tracked forager arrival times on open blossoms. The bees ensured multiple stigmatic visits per blossom, yielding sweet, juicy, full-sized oranges.",
          quote:
            "Understanding our bees through IoT devices helped us eliminate flower drop across our 25 acres of mangoes and citrus.",
          stats: [
            { label: "Fruit Retention", value: "+30%" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Device Tier", value: "ApiSense IoT" },
          ],
          image: "/images/pollination/citrus-grove-drip-irrigation.jpg",
          fieldPhotoCaption: "25 Acres Drip Citrus Grove • Farmer Clement, Kibarani",
        },
        {
          farmer: "Farmer Ngumbau",
          location: "Kiunduani, Makueni",
          role: "Citrus Grower • 2nd IoT Device Recipient",
          acres: 18,
          description:
            "As the second receiver of BeeYield's IoT devices in Kiunduani, I am excited to continue learning every single day. Seeing real-time hive sensor readouts helped me understand how ambient temperature and colony strength influence pollinator traffic on our citrus blossoms. The resulting fruit cluster density is extraordinary.",
          quote:
            "I am excited to continue learning with BeeYield. The IoT sensors show us exactly when our citrus flowers are getting the attention they need.",
          stats: [
            { label: "Yield Increase", value: "+28%" },
            { label: "Acres Pollinated", value: "18" },
            { label: "Recipient", value: "2nd Device Recipient" },
          ],
          image: "/images/pollination/orange-heavy-fruiting-branches.jpg",
          fieldPhotoCaption: "18 Acres Citrus Fruiting • Farmer Ngumbau, Kiunduani",
        },
        {
          farmer: "Farmer Redempta",
          location: "Mbuinzau, Makueni",
          role: "Citrus & Fruit Farmer",
          acres: 15,
          description:
            "My citrus blocks in Mbuinzau had previously suffered from irregular fruit sizes. Placing managed hives right along the grove rows guaranteed that every flower received full pollen transfer. Our oranges are uniform, beautifully shaped, and highly aromatic.",
          quote:
            "The symmetry and sweetness of our oranges has set a new benchmark in Mbuinzau.",
          stats: [
            { label: "Size Uniformity", value: "98%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Brix Sugar", value: "12.8°" },
          ],
          image: "/images/pollination/citrus-orchard-structured-rows.jpg",
          fieldPhotoCaption: "15 Acres Structured Grove • Farmer Redempta, Mbuinzau",
        },
      ],
    },
    {
      id: "maize",
      title: "Maize Pollination & Tasseling",
      category: "Cereal Crop (15 Contracted Acres)",
      description: "Honeybee foraging on emerging tassels creates vigorous pollen shed, ensuring 100% tip fill on every ear.",
      stories: [
        {
          farmer: "Farmer Mbilu",
          location: "Mbuinzau, Makueni",
          role: "Commercial Maize Farmer",
          acres: 15,
          description:
            "I cultivate 15 acres of maize in Mbuinzau. Many farmers assume maize does not benefit from bees because it is wind-pollinated, but BeeYield proved that bees actively collecting tassel pollen create continuous pollen dispersal right over the silks. My cobs this season are filled completely to the tip with heavy, deep kernels.",
          quote:
            "Our 15 acres of maize in Mbuinzau showed complete cob tip fill and an undeniable jump in harvested weight thanks to the bees.",
          stats: [
            { label: "Yield Increase", value: "+22%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Cob Tip Fill", value: "100%" },
          ],
          image: "/images/pollination/maize-field-panorama-mountain.png",
          fieldPhotoCaption: "15 Acres Maize Tasseling • Farmer Mbilu, Mbuinzau",
        },
      ],
    },
    {
      id: "vegetables",
      title: "Mixed Vegetables & Horticulture",
      category: "Horticulture (15 Contracted Acres)",
      description: "Intensive multi-crop forager visitations eliminate unfertilized ovules in peppers, beans, and cucurbits.",
      stories: [
        {
          farmer: "Farmer Redempta",
          location: "Mbuinzau, Makueni",
          role: "Diversified Vegetable & Orchardist",
          acres: 15,
          description:
            "On our 15-acre farm in Mbuinzau, we grow high-value vegetables alongside our mangoes and citrus. The bees are diligent workers across the field beds. Vegetable flowers set full, straight pods and unblemished fruits, and our local market rejection rate dropped to zero.",
          quote:
            "BeeYield's bees ensure that whether it is mangoes, citrus, or fresh vegetables, every blossom translates to harvestable income.",
          stats: [
            { label: "Rejection Rate", value: "0%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Market Grade", value: "Premium" },
          ],
          image: "/images/pollination/maize-vegetable-intercrop-drip.jpg",
          fieldPhotoCaption: "15 Acres Vegetable Intercrop • Farmer Redempta, Mbuinzau",
        },
      ],
    },
    {
      id: "restoration",
      title: "Bees & Ecological Restoration",
      category: "Agroforestry & Habitat Revival (14 Contracted Acres)",
      description: "Harmonizing managed honeybee colonies with indigenous tree revival to restore degraded soils.",
      stories: [
        {
          farmer: "Farmer Gabriel Kavita",
          location: "Kavita, Makueni",
          role: "Agroforestry & Conservation Farmer",
          acres: 14,
          description:
            "Bees are deeply dear to my heart. Seeing them return and thrive across our 14 acres in Kavita has brought genuine ecological restoration to our land. Partnering with BeeYield has made me so happy—our soils are regenerating, tree retention is high, and the balance between pollinators and crops is truly beautiful.",
          quote:
            "I am happy and very dear with bees and restoration. Working with BeeYield has brought new life to our land in Kavita.",
          stats: [
            { label: "Survival Rate", value: "96%" },
            { label: "Acres Restored", value: "14" },
            { label: "Habitat Status", value: "Thriving" },
          ],
          image: "/images/pollination/mango-orange-farm-wide.jpg",
          fieldPhotoCaption: "14 Acres Agroforestry Sanctuary • Farmer Gabriel Kavita, Kavita",
        },
      ],
    },
  ];

  return (
    <BeeYieldPageShell>
      <SEO
        title="Media & Field Gallery | Precision Pollination & Apiary Stories"
        description="Visual proof and field case studies of precision pollination, calibrated hives per acre models, in-hive pollination monitoring, and apiary stewardship protecting bees across 105+ acres in Kenya."
        keywords="precision pollination, hives per acre model, bees, apiary, protecting bees, in hive pollination, in land pollination, pollination field gallery, Kenya beekeeping media"
        url="/media"
        image="/images/pollination/mango-orchard-pink-panicles.png"
        schema={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          "name": "BeeYield Pollination & Apiary Media Gallery",
          "description": "Photographic dispatches, farmer case studies, in-hive monitoring data, and apiary conservation across Kenya.",
          "publisher": {
            "@type": "Organization",
            "name": "BeeYield"
          }
        }}
      />
      {/* Hero Header with Media Switcher */}
      <section className="relative py-20 md:py-24 overflow-hidden border-b border-border/40">
        <StoryHeroBackground />
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          {/* Top Primary Tab Switcher: Bee Media vs Honey Media */}
          <div className="inline-flex p-1.5 rounded-2xl bg-secondary/80 border border-border/60 shadow-sm mb-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveMediaType("bee")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all",
                activeMediaType === "bee"
                  ? "bg-[#1B9157] text-white shadow-md shadow-green-900/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Camera className="w-4 h-4" />
              <span>🐝 Bee Media (Pollination)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaType("honey")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all",
                activeMediaType === "honey"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-900/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>🍯 Honey Media (Traceability)</span>
            </button>
          </div>

          {activeMediaType === "bee" ? (
            <>
              <Badge
                variant="outline"
                className="mb-4 px-4 py-1.5 rounded-full text-[#1B9157] border-[#1B9157]/30 bg-[#1B9157]/10 font-bold uppercase tracking-wider text-xs inline-flex items-center"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-[#1B9157]" />
                Verified Field Operations • 105 Acres and Counting
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-foreground">
                Bee Media & <span className="text-[#1B9157]">105 Acres and Counting</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Photographic proof and verified dispatches across <strong>105 acres and counting</strong> in Makueni County.
                Featuring our partner farmers across Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni, and Ndeini areas.
              </p>

              {/* Quick Filter Navigation Buttons for Bee Media */}
              <div className="flex flex-wrap justify-center gap-2 px-2">
                <Button
                  variant="default"
                  size="sm"
                  className="max-w-full rounded-full bg-[#1B9157] text-white hover:bg-[#157746] transition-colors font-bold shadow-md shadow-green-900/10 text-[11px] sm:text-xs py-2 px-3.5 h-auto whitespace-normal text-center"
                  onClick={() =>
                    document
                      .getElementById("latest-pollination")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>Field Dispatch (105 Acres and Counting)</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-500/25 font-bold"
                  onClick={() =>
                    document.getElementById("mangoes")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🥭 Mango Exports
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-orange-500/15 text-orange-900 dark:text-orange-200 border-orange-300 hover:bg-orange-500/25 font-bold"
                  onClick={() =>
                    document.getElementById("citrus")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🍊 Citrus & Oranges
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-yellow-500/15 text-yellow-900 dark:text-yellow-200 border-yellow-300 hover:bg-yellow-500/25 font-bold"
                  onClick={() =>
                    document.getElementById("maize")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🌽 Maize Pollination
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border-emerald-300 hover:bg-emerald-500/25 font-bold"
                  onClick={() =>
                    document.getElementById("vegetables")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🥬 Mixed Vegetables
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-teal-500/15 text-teal-900 dark:text-teal-200 border-teal-300 hover:bg-teal-500/25 font-bold"
                  onClick={() =>
                    document.getElementById("restoration")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🌿 Bees & Restoration
                </Button>
              </div>
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="mb-4 px-4 py-1.5 rounded-full text-amber-700 dark:text-amber-300 border-amber-300 bg-amber-500/10 font-bold uppercase tracking-wider text-xs inline-flex items-center"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-amber-600" />
                From Hive to Jar • 100% Pure Honey
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-foreground">
                Honey Media & <span className="text-amber-600">Hive-to-Jar Journey</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Tracing honey from <strong>verified bee hives and wild flower blooms</strong> to clean cold spinning.
                Every jar comes with honest, verified records you can check on your phone.
              </p>

              {/* Quick Filter Navigation Buttons for Honey Media */}
              <div className="flex flex-wrap justify-center gap-2 px-2">
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full bg-amber-600 text-white hover:bg-amber-700 font-bold shadow-md shadow-amber-900/10 text-xs py-2 px-4"
                  onClick={() =>
                    document.getElementById("honey-dispatches")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  <span>Field Photos</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-500/25 font-bold text-xs"
                  onClick={() =>
                    document.getElementById("honey-value-chain")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🌱 The 5 Steps
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border-emerald-300 hover:bg-emerald-500/25 font-bold text-xs"
                  onClick={() =>
                    document.getElementById("honey-purity-defense")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  🛡️ 100% Pure Proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-teal-500/15 text-teal-900 dark:text-teal-200 border-teal-300 hover:bg-teal-500/25 font-bold text-xs"
                  onClick={() =>
                    document.getElementById("honey-ethics-5050")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  ⚖️ Our 50/50 Promise
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                  asChild
                >
                  <Link to="/traceability">
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    <span>Verify Your Jar</span>
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CONTENT TABS: BEE MEDIA vs HONEY MEDIA */}
      {activeMediaType === "bee" ? (
        <div id="bee-media-root">
          {/* 105-Acre Partner Farmer Roster Grid */}
          <section className="py-12 bg-secondary/20 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <Badge className="bg-primary/15 text-primary border-primary/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 mr-1.5 inline" />
              Verified Partner Network • 105 Acres and Counting
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Meet Our Partner Farmers in Makueni County
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Exact distribution across our 105 acres and counting in Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni, and Ndeini areas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {partnerFarmers.map((farmer) => (
              <Card
                key={farmer.id}
                className="border-border/60 bg-card hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                        {farmer.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {farmer.location}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground font-black px-2.5 py-1 text-xs rounded-full">
                      {farmer.acres} Acres
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <Badge variant="outline" className={farmer.badgeColor + " text-[11px] font-semibold py-0.5"}>
                      {farmer.iotRole}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-medium">
                      <span className="text-foreground font-semibold">Crops:</span> {farmer.crops.join(", ")}
                    </p>
                  </div>

                  <p className="text-xs text-foreground/85 italic border-l-2 border-primary/40 pl-2.5 py-0.5">
                    "{farmer.shortQuote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Badge variant="outline" className="text-xs px-4 py-1.5 font-bold border-primary/30 text-primary bg-primary/5">
              Total Verified Acreage: 25 + 18 + 18 + 15 + 15 + 14 = 105 Acres and Counting Pollinated
            </Badge>
          </div>
        </div>
      </section>

      {/* Latest Pollination Deployment Section: Interactive Photo Spotlight */}
      <section
        id="latest-pollination"
        className="py-16 md:py-20 bg-gradient-to-b from-background via-green-50/20 to-background border-b border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="bg-[#1B9157]/15 text-[#1B9157] hover:bg-[#1B9157]/20 border-[#1B9157]/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5 mr-1.5 inline" />
              Field Photography • Active Pollination Contracts
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              105 Acres and Counting in Active Bloom: <br className="hidden sm:inline" />
              <span className="text-[#1B9157]">Mangoes, Citrus & Oranges, Vegetables, and Maize</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Photographic proof from our partner farms in Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni, and Ndeini areas.
              Every image captures our precision apiary deployments and bloom synchronization.
            </p>
          </div>

          {/* Interactive Photo Spotlight */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-card/90 border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
              {/* Main Photo View (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border-2 border-border/50 group bg-muted">
                  <img
                    src={latestPollinationMedia[selectedPhotoIndex].image}
                    alt={latestPollinationMedia[selectedPhotoIndex].title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Badges on top */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <Badge
                      className={latestPollinationMedia[selectedPhotoIndex].badgeColor + " border px-3 py-1.5 text-xs font-bold backdrop-blur-md"}
                    >
                      {latestPollinationMedia[selectedPhotoIndex].crop} • {latestPollinationMedia[selectedPhotoIndex].category}
                    </Badge>
                    <Badge className="bg-background/90 text-foreground border-none backdrop-blur px-3 py-1.5 text-xs font-semibold">
                      Photo {selectedPhotoIndex + 1} of {latestPollinationMedia.length}
                    </Badge>
                  </div>

                  {/* Caption on bottom of image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-[#1B9157] text-white border-none px-2.5 py-0.5 text-[11px] font-black">
                        {latestPollinationMedia[selectedPhotoIndex].farmer} • {latestPollinationMedia[selectedPhotoIndex].acres} Acres
                      </Badge>
                      <span className="text-[11px] text-white/90 font-medium">
                        {latestPollinationMedia[selectedPhotoIndex].location}
                      </span>
                    </div>
                    <p className="text-xl md:text-2xl font-black mb-1 leading-tight drop-shadow-md">
                      {latestPollinationMedia[selectedPhotoIndex].title}
                    </p>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#F4D03F]" />
                      Part of 105 Acres and Counting in Makueni County
                    </p>
                  </div>
                </div>

                {/* Micro thumbnail selector directly below main photo */}
                <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-2 pt-2">
                  {latestPollinationMedia.map((photo, pIdx) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(pIdx)}
                      className={
                        "relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group/thumb " +
                        (selectedPhotoIndex === pIdx
                          ? "border-[#1B9157] ring-2 ring-[#1B9157]/40 scale-102 shadow-md"
                          : "border-border/60 opacity-70 hover:opacity-100 hover:border-primary/50")
                      }
                    >
                      <img
                        src={photo.image}
                        alt={photo.thumbLabel}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/10 transition-colors" />
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white leading-tight truncate px-1 drop-shadow">
                        {photo.thumbLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agronomic & Field Details (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-bold text-primary">
                      {latestPollinationMedia[selectedPhotoIndex].cropScientific}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {latestPollinationMedia[selectedPhotoIndex].badge}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {latestPollinationMedia[selectedPhotoIndex].title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {latestPollinationMedia[selectedPhotoIndex].description}
                  </p>
                </div>

                {/* Agronomic Insight Box */}
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                    <Layers className="w-3.5 h-3.5" />
                    Agronomic Impact
                  </p>
                  <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium">
                    {latestPollinationMedia[selectedPhotoIndex].agronomicImpact}
                  </p>
                </div>

                {/* Field Observations Checklist */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Verified Field Metrics
                  </p>
                  <ul className="space-y-2">
                    {latestPollinationMedia[selectedPhotoIndex].fieldObservations.map((obs, oIdx) => (
                      <li key={oIdx} className="text-xs md:text-sm text-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1B9157] shrink-0 mt-0.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    asChild
                    className="w-full sm:w-auto rounded-full bg-[#1B9157] hover:bg-[#157746] text-white font-bold h-auto min-h-11 py-2.5 px-5 shadow-md shadow-green-900/10 text-xs sm:text-sm whitespace-normal text-center"
                  >
                    <Link to="/pollination-request" className="flex items-center justify-center gap-2">
                      <span>Book Orchard Pollination</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-border hover:bg-secondary font-semibold h-auto min-h-11 py-2.5 px-5 text-xs sm:text-sm whitespace-normal text-center"
                    onClick={() => {
                      const crop = latestPollinationMedia[selectedPhotoIndex].cropType;
                      let targetId = "mangoes";
                      if (crop === "Oranges" || crop === "Citrus") targetId = "citrus";
                      if (crop === "Maize") targetId = "maize";
                      if (crop === "Restoration") targetId = "restoration";
                      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Case Study
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Case Studies by Crop (105 Acres and Counting) */}
      <div className="container mx-auto px-4 py-20">
        <div className="space-y-32">
          {caseStudies.map((study, index) => (
            <section key={study.id} id={study.id} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#1B9157]/10 flex items-center justify-center text-[#1B9157]">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{study.title}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {study.category}
                  </Badge>
                </div>
              </div>

              {/* Farmer Stories Carousel for this Crop */}
              <Carousel className="w-full relative">
                <CarouselContent>
                  {study.stories.map((story, storyIndex) => (
                    <CarouselItem key={storyIndex}>
                      <div
                        className={
                          "flex flex-col lg:flex-row gap-12 lg:gap-20 items-center " +
                          (index % 2 === 1 ? "lg:flex-row-reverse" : "")
                        }
                      >
                        {/* Image Column */}
                        <div className="w-full lg:w-1/2">
                          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group border-4 border-background bg-muted">
                            <img
                              src={story.image}
                              alt={story.farmer + " - " + study.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-[#1B9157] text-white backdrop-blur border-none shadow-xl px-3.5 py-1.5 text-xs font-bold">
                                {story.acres} Acres Pollinated
                              </Badge>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                              <p className="font-black text-2xl mb-2 text-white drop-shadow-md">
                                {story.farmer}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-white text-xs flex items-center font-semibold bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#F4D03F]" />
                                  {story.location}
                                </p>
                                {story.fieldPhotoCaption && (
                                  <p className="text-emerald-300 text-[11px] font-bold bg-black/60 border border-emerald-500/40 px-3 py-1 rounded-full backdrop-blur-md truncate max-w-[280px]">
                                    📸 {story.fieldPhotoCaption}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            {story.stats.map((stat, i) => (
                              <Card
                                key={i}
                                className="border-border/50 bg-card/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
                              >
                                <CardContent className="p-4 text-center">
                                  <p className="text-xl md:text-2xl font-black text-primary mb-1">
                                    {stat.value}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider font-semibold">
                                    {stat.label}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="w-full lg:w-1/2 space-y-8">
                          <div>
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-primary">
                              <User className="w-6 h-6" />
                              Partner Farmer Dispatch
                            </h3>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                              {story.description}
                            </p>
                          </div>

                          {/* Testimonial */}
                          <div className="relative p-8 md:p-10 bg-primary/5 rounded-3xl border border-primary/10">
                            <Quote className="absolute top-8 left-8 w-10 h-10 text-primary/20" />
                            <blockquote className="relative z-10 pt-6">
                              <p className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-normal">
                                "{story.quote}"
                              </p>
                              <footer className="flex items-center gap-4 border-t border-primary/10 pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-background shadow-sm">
                                  {story.farmer.replace("Farmer ", "").charAt(0)}
                                </div>
                                <div>
                                  <cite className="not-italic font-bold text-foreground block text-lg">
                                    {story.farmer}
                                  </cite>
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {story.role} &bull; {story.acres} Acres Pollinated
                                  </span>
                                </div>
                              </footer>
                            </blockquote>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2 w-full">
                            <Button
                              asChild
                              size="lg"
                              className="w-full sm:w-auto max-w-full rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-auto min-h-12 sm:h-14 py-3 px-6 sm:px-8 text-sm sm:text-base md:text-lg bg-[#1B9157] hover:bg-[#157746] text-white whitespace-normal text-center"
                            >
                              <Link to="/pollination-request" className="flex items-center justify-center gap-2">
                                <span>Book Pollination</span>
                                <ArrowRight className="ml-2 w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-[#F4D03F] shrink-0" />
                              <span>Verified at {story.location}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="flex justify-center gap-4 mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:w-full md:justify-between md:pointer-events-none md:px-4 lg:px-0 lg:-mx-16">
                  <div className="pointer-events-auto">
                    <CarouselPrevious className="relative left-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                  <div className="pointer-events-auto">
                    <CarouselNext className="relative right-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                </div>
              </Carousel>
            </section>
          ))}
        </div>
      </div>
    </div>
  ) : (
    /* HONEY MEDIA SECTION: HIVE-TO-HONEY DIGITAL TRACEABILITY */
    <div id="honey-media-root">
      {/* Section 1: The 5-Stage Value Chain Interactive Timeline */}
      <section id="honey-value-chain" className="py-16 bg-secondary/20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-amber-600" />
              From Floral Forage to Collection Center
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              The Hive-to-Honey Value Chain
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed">
              Every jar is tracked from wild flower blossoms and the hive all the way to cold extraction and your kitchen.
            </p>
          </div>

          {/* Step Navigation Pill Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {HIVE_TO_HONEY_VALUE_CHAIN.map((stage, idx) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveValueChainStep(idx)}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 shadow-sm",
                  activeValueChainStep === idx
                    ? "bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 shadow-amber-500/10 scale-[1.02]"
                    : "bg-card border-border/60 hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-black text-xs",
                    activeValueChainStep === idx ? "bg-amber-600 text-white" : "bg-muted text-foreground"
                  )}>
                    {stage.stepNumber}
                  </span>
                  {idx === 0 && <Box className="w-4 h-4 text-amber-600" />}
                  {idx === 1 && <Sprout className="w-4 h-4 text-amber-600" />}
                  {idx === 2 && <Scale className="w-4 h-4 text-amber-600" />}
                  {idx === 3 && <Truck className="w-4 h-4 text-amber-600" />}
                  {idx === 4 && <QrCode className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <p className="text-xs font-black text-foreground line-clamp-1">{stage.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{stage.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active Value Chain Step Deep Dive Card */}
          {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep] && (
            <div className="bg-card border border-amber-300/50 dark:border-amber-700/40 rounded-3xl p-6 md:p-10 shadow-lg">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-600 text-white font-bold text-xs">
                      Stage {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep].stepNumber} of 5
                    </Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50/50 dark:text-emerald-300 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
                      {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep].complianceStandard}
                    </Badge>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground">
                    {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep].subtitle}
                  </p>
                </div>

                <Link
                  to="/traceability"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Check Batch Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid md:grid-cols-12 gap-8 pt-6">
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    What Happens at this Step:
                  </h4>
                  <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                    {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep].description}
                  </p>
                </div>

                <div className="md:col-span-5 bg-secondary/40 border border-border/50 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    What We Record & Check:
                  </h4>
                  <ul className="space-y-2">
                    {HIVE_TO_HONEY_VALUE_CHAIN[activeValueChainStep].dataPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="text-xs text-foreground/90 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Honey Photo & Field Dispatches Spotlight */}
      <section
        id="honey-dispatches"
        className="py-16 md:py-20 bg-gradient-to-b from-background via-amber-50/20 dark:via-amber-950/10 to-background border-b border-border/40"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-amber-600/15 text-amber-800 dark:text-amber-200 border-amber-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5 mr-1.5 inline text-amber-600" />
              Verified Dispatches from Kibwezi & Makueni
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Honey Traceability in the Field
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              Real photos from our apiaries showing hive moves, clean cold extraction, moisture testing, and our local beekeepers at work.
            </p>
          </div>

          {/* Main Featured Honey Dispatch Display */}
          <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-xl mb-8">
            <div className="grid lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[500px] bg-black/5 overflow-hidden flex items-center justify-center">
                <img
                  src={honeyMediaDispatches[selectedHoneyPhotoIndex].image}
                  alt={honeyMediaDispatches[selectedHoneyPhotoIndex].title}
                  className="w-full h-full object-cover transition-all duration-500 max-h-[550px]"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={honeyMediaDispatches[selectedHoneyPhotoIndex].badgeColor + " font-bold px-3 py-1 shadow-sm"}>
                    {honeyMediaDispatches[selectedHoneyPhotoIndex].badge}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 text-white text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#F4D03F]" />
                    {honeyMediaDispatches[selectedHoneyPhotoIndex].location}
                  </span>
                  <span className="font-bold text-[#F4D03F]">
                    {honeyMediaDispatches[selectedHoneyPhotoIndex].coordinates}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-semibold text-amber-700 border-amber-300 dark:text-amber-300">
                      {honeyMediaDispatches[selectedHoneyPhotoIndex].category}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      Record {selectedHoneyPhotoIndex + 1} of {honeyMediaDispatches.length}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground leading-snug">
                    {honeyMediaDispatches[selectedHoneyPhotoIndex].title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Led by: {honeyMediaDispatches[selectedHoneyPhotoIndex].beekeeper}
                  </p>

                  <p className="text-sm text-foreground/80 mt-4 leading-relaxed">
                    {honeyMediaDispatches[selectedHoneyPhotoIndex].description}
                  </p>

                  <div className="mt-6 space-y-2 border-t border-border/40 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Where It Comes From & How It's Tracked:
                    </p>
                    <ul className="space-y-1.5">
                      {honeyMediaDispatches[selectedHoneyPhotoIndex].provenanceHighlights.map((obs, idx) => (
                        <li key={idx} className="text-xs text-foreground/85 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-300/30">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Purity & Quality Guarantee
                    </p>
                    <p className="text-xs text-foreground/80">
                      {honeyMediaDispatches[selectedHoneyPhotoIndex].qualityImpact}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedHoneyPhotoIndex === 0}
                    onClick={() => setSelectedHoneyPhotoIndex((prev) => Math.max(0, prev - 1))}
                    className="rounded-full text-xs font-bold gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground font-medium">
                    {selectedHoneyPhotoIndex + 1} / {honeyMediaDispatches.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedHoneyPhotoIndex === honeyMediaDispatches.length - 1}
                    onClick={() =>
                      setSelectedHoneyPhotoIndex((prev) =>
                        Math.min(honeyMediaDispatches.length - 1, prev + 1)
                      )
                    }
                    className="rounded-full text-xs font-bold gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Honey Photo Thumbnails Carousel */}
          <div className="mt-6">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-3">
                {honeyMediaDispatches.map((media, idx) => (
                  <CarouselItem
                    key={media.id}
                    className="pl-2 md:pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedHoneyPhotoIndex(idx)}
                      className={cn(
                        "w-full text-left rounded-2xl overflow-hidden border-2 transition-all p-1.5 bg-card flex flex-col gap-1.5",
                        selectedHoneyPhotoIndex === idx
                          ? "border-amber-600 shadow-md shadow-amber-600/20 scale-[1.02]"
                          : "border-border/40 opacity-70 hover:opacity-100"
                      )}
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                        <img
                          src={media.image}
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5 text-[9px] text-white font-mono">
                          {media.thumbLabel}
                        </div>
                      </div>
                      <div className="px-1">
                        <p className="text-xs font-bold text-foreground truncate">{media.cropType}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{media.location}</p>
                      </div>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-2 mt-3">
                <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                <CarouselNext className="static translate-y-0 h-8 w-8" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Section 3: Anti-Adulteration Purity Defense & FAO / EU Standards */}
      <section id="honey-purity-defense" className="py-16 bg-card/60 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 inline text-emerald-600" />
              100% Pure & Real Honey
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Why Honey Tracking Matters to You
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed">
              A lot of honey on store shelves is watered down with cheap sugar syrups or harvested unsustainably. Our tracking proves that every jar is 100% real, natural honey made by healthy bees.
            </p>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-rose-300/40 bg-rose-50/10 dark:bg-rose-950/10 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center font-bold">✕</span>
                <h3 className="font-black text-xl text-foreground">Problems with Ordinary Honey</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span><strong>Fake blends:</strong> Mixing mystery honey from unknown sources without any origin details.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span><strong>Added sugars:</strong> Feeding bees artificial sugar syrups or watering down honey after harvest.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span><strong>Hurting bee colonies:</strong> Taking all the honey from hives and leaving bees to starve.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span><strong>Poor quality:</strong> Failing food safety tests due to high moisture or artificial fillers.</span>
                </li>
              </ul>
            </Card>

            <Card className="border-emerald-300/40 bg-emerald-50/10 dark:bg-emerald-950/10 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                <h3 className="font-black text-xl text-foreground">The BeeYield Promise</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Tracked hives:</strong> Hives placed in clean Acacia, Citrus, and Mango flower fields.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>0% added sugar:</strong> 100% pure honey with natural moisture below 18%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>50/50 promise:</strong> We leave half the honey in the hive so bees stay fed and healthy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Scan with your phone:</strong> Every jar has a QR code showing who harvested it and where.</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-black">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">Tracked Hives</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We record hive locations during bloom season so you know which flowers the bees visited.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-black">
                <Droplets className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">Gentle Cold Spin</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spun gently under 35°C so the honey keeps its natural enzymes, pleasant aroma, and rich taste.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-700 flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">Direct Farmer Pay</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We work directly with local beekeepers and pay them fair prices directly on their phones via M-Pesa.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-700 flex items-center justify-center font-black">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">50/50 Bee Promise</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We take only surplus honey and leave the rest so our bees thrive through dry seasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Call-to-Action & Quick Batch Verification */}
      <section id="honey-ethics-5050" className="py-16 bg-gradient-to-t from-secondary/40 via-background to-background text-center">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <Badge className="bg-amber-600/15 text-amber-800 dark:text-amber-200 border-amber-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5 mr-1.5 inline text-amber-600" />
            Check Your Honey
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-foreground">
            Check Your Jar from Hive to Table
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Scan the QR code on your jar or tap a sample batch below to see the beekeeper, flowering season, and harvest details.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["BEE-2026-01-0420", "BEE-2026-01-0419", "BEE-2026-01-0418"].map((code) => (
              <Link
                key={code}
                to={`/traceability?code=${code}`}
                className="font-mono text-xs font-bold bg-card hover:bg-amber-600 hover:text-white border border-border/60 px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                🔍 Batch {code}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold px-8">
              <Link to="/shop">
                <span>Explore Traceable Honey in Shop</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-bold px-8">
              <Link to="/traceability">
                <span>Open Full Traceability Ledger</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )}

      {/* Executive Leadership & Media Spokespersons Section */}
      <section className="py-24 bg-card/40 border-t border-border/40 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-300 font-bold px-4 py-1.5 text-xs rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-amber-600" />
              Press & Media Contacts
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mt-4">
              Our Leadership
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Connect with BeeYield's co-founders for executive interviews, agricultural telemetry insights, and apiculture innovation briefings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                name: "Timothy Nduva",
                role: "CEO & Co-Founder",
                department: "Executive & Directorate",
                description: "Pioneering the intersection of traditional apiculture and IoT precision. Directs ecosystem strategy, sensor telemetry, and Kibwezi field operations.",
                image: TIMOTHY_PHOTO,
                linkedin: "https://linkedin.com/in/timothynduva",
                email: "timothy@beeyield.com",
                tags: ["Vision Lead", "Architecture Head", "Global Strategy", "Field Beekeeper"],
              },
              {
                name: "Carole Nduva",
                role: "Co-Founder & Chief Operating Officer (COO)",
                department: "Operations & Partnerships",
                description: "Oversees operational logistics, commercial grower relationships, community expansion, and international honey export channels.",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
                linkedin: "https://linkedin.com/company/beeyield",
                email: "carole@beeyield.com",
                tags: ["Ops Scalability", "Partner Systems", "Logistics Core", "Smallholder Network"],
              },
              {
                name: "Agatha Nduva",
                role: "Co-Founder & Chief Technology Officer (CTO)",
                department: "Engineering & IT Systems",
                description: "Architects distributed telemetry infrastructure, real-time hive sensor networks, and tamper-proof honey traceability ledgers.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
                linkedin: "https://linkedin.com/company/beeyield",
                email: "agatha@beeyield.com",
                tags: ["System Integrity", "Data Security", "Protocol Lead", "Telemetry Architecture"],
              },
            ].map((member, i) => (
              <div
                key={i}
                className="group flex flex-col h-full bg-card rounded-[2.5rem] border border-border/80 hover:border-amber-500/40 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                {/* Media / Portrait View */}
                <div className="relative aspect-[4/5] m-3.5 rounded-[2rem] overflow-hidden bg-muted/60 shadow-inner">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Gradient Scrim at Bottom of Photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Top Corner Pill Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/40 font-bold text-[10px] tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {member.department}
                    </Badge>
                    <span className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-sm opacity-90 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </span>
                  </div>

                  {/* Bottom Micro-Badge on Image */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white/95 font-semibold text-[10px] flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Co-Founder
                    </span>
                    <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                      Kibwezi, Kenya
                    </span>
                  </div>
                </div>

                {/* Content Details Section Below Portrait */}
                <div className="p-6 pt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                      {member.role}
                    </p>

                    <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{member.name}</span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>

                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {member.description}
                    </p>

                    {/* Key Focus Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {member.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] font-semibold py-0.5 px-2.5 rounded-lg bg-muted text-muted-foreground border-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold text-foreground hover:text-primary gap-1">
                      <Link to="/team">
                        <span>Meet Full Team</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                          className="w-8 h-8 rounded-full bg-muted hover:bg-[#0077B5] hover:text-white text-muted-foreground flex items-center justify-center transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          aria-label={`Email ${member.name}`}
                          className="w-8 h-8 rounded-full bg-muted hover:bg-foreground hover:text-background text-muted-foreground flex items-center justify-center transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* Bottom CTA Banner (Adapts for Bee vs Honey) */}
  <section className="py-20 bg-gradient-to-t from-secondary/40 via-background to-background border-t border-border/40 text-center">
    <div className="container mx-auto px-4 max-w-3xl">
      {activeMediaType === "bee" ? (
        <>
          <Badge className="bg-[#1B9157]/15 text-[#1B9157] border-[#1B9157]/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            Join Our Growing Network
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            Ready to Pollinate Your Land?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join Farmer Clement, Farmer Ngumbau, Farmer Christopher, Farmer Redempta, Farmer Mbilu, and Farmer Gabriel Kavita across Makueni County.
          </p>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto max-w-md mx-auto rounded-full bg-[#1B9157] hover:bg-[#157746] text-white font-bold h-auto min-h-12 sm:h-14 py-3.5 px-4 sm:px-8 text-xs xs:text-sm sm:text-base md:text-lg shadow-xl shadow-green-900/10 whitespace-normal text-center leading-tight tracking-normal sm:tracking-wider"
          >
            <Link to="/pollination-request" className="flex items-center justify-center text-center gap-2">
              <span>Schedule Your Farm Inspection</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Badge className="bg-amber-600/15 text-amber-800 dark:text-amber-200 border-amber-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            Authentic Traceable Honey
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            Taste Pure Monofloral Honey from Kenya
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Every single jar is backed by geo-tagged bee box coordinates, cold centrifugal extraction, and a verified 50% reserve for the bees.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 shadow-xl shadow-amber-900/10"
            >
              <Link to="/shop">
                <span>Shop Traceable Honey Jars</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full font-bold px-8"
            >
              <Link to="/traceability">
                <span>Scan Jar QR Code</span>
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  </section>
    </BeeYieldPageShell>
  );
};

export default Media;
