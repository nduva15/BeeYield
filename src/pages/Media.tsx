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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const Media = () => {
  const location = useLocation();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // 105 Total Acres Network across Makueni Partner Farmers
  const partnerFarmers = [
    {
      id: "clement",
      name: "Farmer Clement",
      location: "Kibarani, Makueni",
      role: "Commercial Mango, Orange & Citrus Grower",
      crops: ["Mangoes", "Oranges", "Citrus"],
      acres: 25,
      iotRole: "1st Receiver of IoT Disease & Pollination Devices",
      quote:
        "Being the first receiver of BeeYield's IoT disease and pollination devices in Kibarani has helped me truly understand bees. Seeing real-time colony health and flight patterns allowed us to time hive placement with floral anthesis. Our mangoes, oranges, and citrus have never had such dense fruit set and superior fruit size.",
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
      iotRole: "2nd Receiver of BeeYield IoT Devices",
      quote:
        "As the second receiver of BeeYield's IoT devices in Kiunduani, I am excited to continue learning every single day. Tracking temperature, acoustics, and forager departure frequencies right from my phone gives me total visibility over pollination progress across my 18 acres.",
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
      iotRole: "ApiSense Early Varroa Mite Detection",
      quote:
        "BeeYield has been completely life changing for our farm. When a varroa mite infestation threatened our colonies, ApiSense tech identified the hive acoustic anomalies in time before colony collapse occurred. That timely intervention saved our hives and protected all 18 acres of blooming mangoes.",
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
      iotRole: "Multi-Crop Floral Synchronization",
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
      iotRole: "Tassel Anthesis & Ear Tip Fill Optimization",
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
      iotRole: "Biodiversity & Native Habitat Revival",
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
      id: "mango-panicles",
      title: "Dense Mango Floral Panicles in Peak Bloom",
      farmer: "Farmer Clement",
      location: "Kibarani, Makueni",
      acres: 25,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Apple Mango & Ngowe)",
      category: "Floral Anthesis & Pollen Deposition",
      badge: "High Bee Dependency (90%)",
      badgeColor: "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-300",
      description:
        "Ultra close-up of dense floral panicles at critical anthesis on Farmer Clement's 25-acre holding in Kibarani. As the 1st receiver of BeeYield IoT devices, Clement tracks colony activity to ensure stigmatic saturation during morning nectar secretion, preventing fruit abortion.",
      image: "/images/pollination/mango-panicles-close-bloom.png",
      thumbLabel: "Mango Panicles",
      cropType: "Mangoes",
      fieldObservations: [
        "Farmer Clement (Kibarani) — 1st IoT device recipient monitoring hive acoustics",
        "Over 2,000 delicate florets per floral panicle actively visited by honeybees",
        "Targeting 2.5 - 4.0 hives per acre across Clement's 25-acre orchard",
      ],
      agronomicImpact:
        "Mango flowers have a narrow window of viable receptivity. Continuous bee visits ensure full stigmatic coverage, directly translating to export-grade fruit sizing and high yield density.",
    },
    {
      id: "mango-pink-panicles",
      title: "Canopy Floral Panicles Burst with Pink Tones",
      farmer: "Farmer Christopher",
      location: "Kiunduani, Makueni",
      acres: 18,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Canopy Anthesis)",
      category: "Upper Canopy Saturation",
      badge: "Canopy Anthesis Peak",
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
      category: "Full Orchard Anthesis",
      badge: "100% Bloom Saturation",
      badgeColor: "bg-amber-600/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "Spectacular wide shot of a mature mango tree smothered in golden blooms in Kibarani on Farmer Clement's farm. Data from Clement's IoT disease and pollination sensors confirmed peak flight activity during morning peak anthesis.",
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
        "Adequate bee visits per flower deposit enough pollen grains to trigger multi-seed development, stimulating auxin production for larger, sweeter oranges.",
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
        "Vibrant young oranges expanding rapidly on Farmer Clement's Kibarani farm. Bee-mediated fertilization ensures symmetric carpel development, avoiding deformed or lopsided fruit.",
      image: "/images/pollination/orange-citrus-fruits-developing.jpg",
      thumbLabel: "Developing Fruits",
      cropType: "Oranges",
      fieldObservations: [
        "Flawless rind surface free of early pest abrasions",
        "Symmetric fruit profile indicating all carpels fully fertilized",
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
      cropScientific: "Citrus sinensis (Bloom Anthesis)",
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
      title: "Fresh Mango Inflorescence in Full Anthesis",
      farmer: "Farmer Redempta",
      location: "Mbuinzau, Makueni",
      acres: 15,
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Peak Anthesis)",
      category: "Floral Anthesis & Bloom Peak",
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
      badge: "Tassel Anthesis",
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
      description: "Precision hive placement during floral anthesis drives stigmatic coverage and eliminates fruit drop.",
      stories: [
        {
          farmer: "Farmer Clement",
          location: "Kibarani, Makueni",
          role: "Commercial Mango & Citrus Grower • 1st IoT Device Recipient",
          acres: 25,
          description:
            "Being the first receiver of BeeYield's IoT disease and pollination devices in Kibarani has completely transformed how I farm. For the first time, I truly understand honeybee behavior, floral anthesis timing, and hive acoustics. My 25-acre mango orchard has achieved unprecedented fruit retention, with branches loaded with clean, export-grade fruit.",
          quote:
            "BeeYield's IoT devices taught me how to read the language of the bees. Our mango fruit set has reached levels we had never seen before in Kibarani.",
          stats: [
            { label: "Yield Increase", value: "+34%" },
            { label: "Acres Pollinated", value: "25" },
            { label: "IoT Status", value: "1st Recipient" },
          ],
          image: "/images/pollination/mango-panicles-close-bloom.png",
          fieldPhotoCaption: "25 Acres Mango Anthesis • Farmer Clement, Kibarani",
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
          fieldPhotoCaption: "18 Acres Canopy Anthesis • Farmer Christopher, Kiunduani",
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
      {/* Hero Header */}
      <section className="relative py-20 md:py-24 bg-gradient-to-b from-secondary/40 via-background to-background overflow-hidden border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 rounded-full text-[#1B9157] border-[#1B9157]/30 bg-[#1B9157]/10 font-bold uppercase tracking-wider text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-[#1B9157]" />
            Verified Field Operations • 105 Acres and Counting
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-foreground">
            Field Media & <span className="text-[#1B9157]">105 Acres and Counting</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Photographic proof and verified dispatches across <strong>105 acres and counting</strong> in Makueni County.
            Featuring our partner farmers across Kibarani, Kiunduani, Kavita, and Mbuinzau.
          </p>

          {/* Quick Filter Navigation Buttons */}
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
        </div>
      </section>

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
              Exact distribution across our 105 acres and counting in Kibarani, Kiunduani, Kavita, and Mbuinzau.
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
              Photographic proof from our partner farms in Kibarani, Kiunduani, Kavita, and Mbuinzau.
              Every image captures our precision apiary deployments and anthesis synchronization.
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

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-gradient-to-t from-secondary/40 via-background to-background border-t border-border/40 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
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
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Media;
