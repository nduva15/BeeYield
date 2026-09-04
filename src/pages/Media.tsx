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

  const latestPollinationMedia = [
    {
      id: "mango-panicles",
      title: "Dense Mango Floral Panicles in Peak Bloom",
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Apple Mango & Ngowe)",
      category: "Floral Anthesis & Pollen Deposition",
      badge: "High Bee Dependency (90%)",
      badgeColor: "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-300",
      description:
        "Ultra close-up of dense floral panicles at critical anthesis in Makueni County. Each flower panicle bears thousands of tiny flowers requiring rapid pollinator visits during morning nectar secretion. Precision hive placement prevents early fruit drop and secures massive fruit retention.",
      image: "/images/pollination/mango-panicles-close-bloom.png",
      thumbLabel: "Mango Panicles",
      cropType: "Mangoes",
      fieldObservations: [
        "Over 2,000 delicate florets per floral panicle actively visited by honeybees",
        "Targeting 2.0 - 4.0 hives per acre for complete floral saturation",
        "Drastic reduction in post-bloom 'June drop' and early fruit abortion",
      ],
      agronomicImpact:
        "Mango flowers have a narrow window of viable receptivity. Continuous bee visits ensure full stigmatic coverage, directly translating to export-grade fruit sizing and high yield density.",
    },
    {
      id: "mango-pink-panicles",
      title: "Canopy Floral Panicles Burst with Pink Tones",
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Canopy Anthesis)",
      category: "Upper Canopy Saturation",
      badge: "Canopy Anthesis Peak",
      badgeColor: "bg-rose-500/15 text-rose-700 border-rose-300 dark:text-rose-300",
      description:
        "Flowering mango panicles exhibiting vibrant pink hues across the upper canopy. Hive density of 2.5 to 3.5 hives per acre drives foragers into the high branches where natural wind pollination fails.",
      image: "/images/pollination/mango-orchard-pink-panicles.png",
      thumbLabel: "Pink Panicles",
      cropType: "Mangoes",
      fieldObservations: [
        "Intense pink floral pigmentation indicating optimal nectar sugar secretion",
        "Full upper crown coverage achieved via elevated predator-proof hive placement",
        "Synchronized floral anthesis across north and south-facing canopy quadrants",
      ],
      agronomicImpact:
        "Ensures upper branch blooms contribute equally to harvest tonnage rather than drying out unfertilized, raising total orchard packout by up to 35%.",
    },
    {
      id: "mango-full-tree",
      title: "Full Blooming Mature Mango Tree in Orchard",
      crop: "Mangoes",
      cropScientific: "Mangifera indica (Commercial Orchard)",
      category: "Synchronized Orchard Anthesis",
      badge: "Export Grade Target",
      badgeColor: "bg-lime-600/15 text-lime-800 border-lime-300 dark:text-lime-200",
      description:
        "A grand mature mango tree in peak floral eruption against the dryland red soil of Makueni. Every branch terminal holds a flowering spike, demanding a disciplined workforce of tens of thousands of foragers.",
      image: "/images/pollination/mango-tree-full-blossom.png",
      thumbLabel: "Full Mango Bloom",
      cropType: "Mangoes",
      fieldObservations: [
        "Complete floral coverage across both interior and perimeter branch scaffold",
        "Harmonic acoustic roar of foraging bees audible across the 25-acre block",
        "Significantly accelerated fruit sizing observed in post-bloom tagging tests",
      ],
      agronomicImpact:
        "Transforms large semi-arid trees into high-efficiency fruit factories with zero biennial bearing slump.",
    },
    {
      id: "orange-heavy-fruiting",
      title: "Citrus Tree in Heavy Fruiting Stage",
      crop: "Oranges & Citrus",
      cropScientific: "Citrus sinensis (Valencia & Pixie)",
      category: "Fruit Retention & Sizing",
      badge: "High Yield Density",
      badgeColor: "bg-orange-500/15 text-orange-700 border-orange-300 dark:text-orange-300",
      description:
        "Vigorous orange branches loaded with dense clusters of plump, developing citrus fruits following successful pollination. Multiple bee visits ensure complete ovule fertilization, uniform roundness, and maximum fruit retention.",
      image: "/images/pollination/orange-tree-heavy-fruiting.jpg",
      thumbLabel: "Heavy Fruiting",
      cropType: "Oranges & Citrus",
      fieldObservations: [
        "Dense fruit cluster retention with near-zero physiological fruit drop",
        "Uniform spherical fruit sizing across upper, middle, and skirt branches",
        "Smooth rind development and accelerated fruit circumference expansion",
      ],
      agronomicImpact:
        "Proper bee visitation eliminates misshapen or lopsided citrus, providing growers with 90%+ first-grade market packout.",
    },
    {
      id: "orange-citrus-fruits",
      title: "Developing Citrus Fruits with Ancient Baobab Shelter",
      crop: "Oranges",
      cropScientific: "Citrus sinensis (Semi-Arid Dryland)",
      category: "Agroforestry Fruit Setting",
      badge: "70% Bee Dependency",
      badgeColor: "bg-amber-600/15 text-amber-800 border-amber-300 dark:text-amber-200",
      description:
        "Developing citrus fruits hanging from healthy branches with the iconic silhouette of a native Baobab in the background. BeeYield manages hive placement to maximize forager efficiency in dryland heat.",
      image: "/images/pollination/orange-tree-citrus-fruits.jpg",
      thumbLabel: "Citrus & Baobab",
      cropType: "Oranges",
      fieldObservations: [
        "Healthy deep-green foliage and firm spherical citrus fruitlets",
        "Dryland microclimate moderated by surrounding indigenous trees",
        "Brix sugar accumulation elevated by complete stigmatic fertilization",
      ],
      agronomicImpact:
        "Enhances natural juice weight and sugar-to-acid balance (Brix) demanded by premium juice processors and fruit vendors.",
    },
    {
      id: "citrus-orchard-rows",
      title: "Structured Citrus Grove Under Managed Pollination",
      crop: "Citrus",
      cropScientific: "Citrus spp. (Commercial Groves)",
      category: "Orchard Scale Management",
      badge: "Precision Deployment",
      badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-300",
      description:
        "Organized citrus tree rows in Makueni showing clean under-canopy clearance and healthy tree architecture. Hives deployed at perimeter and interior nodes provide complete floral saturation.",
      image: "/images/pollination/orange-citrus-orchard.jpg",
      thumbLabel: "Citrus Grove",
      cropType: "Citrus",
      fieldObservations: [
        "Optimal flight corridors maintained down every tree row",
        "Even distribution of bee visits across sunny and shaded sides of rows",
        "High bee activity sustained through staggered morning flower openings",
      ],
      agronomicImpact:
        "Ensures every tree row achieves identical fruit set density, streamlining harvest scheduling and grading.",
    },
    {
      id: "citrus-mango-intercrop",
      title: "Citrus & Mango Agroforestry Rows Under Active Pollination",
      crop: "Citrus & Mangoes Intercrop",
      cropScientific: "Mixed Citrus sinensis & Mangifera indica",
      category: "Agroforestry Synergy",
      badge: "Multi-Crop Synergy",
      badgeColor: "bg-teal-500/15 text-teal-700 border-teal-300 dark:text-teal-300",
      description:
        "Close-order rows demonstrating how high-density mobile hives provide coordinated pollination across distinct crop flowering rhythms, maintaining vigorous colony health and optimal foraging pressure.",
      image: "/images/pollination/citrus-mango-intercrop.jpg",
      thumbLabel: "Intercrop Rows",
      cropType: "Oranges & Mangoes",
      fieldObservations: [
        "Balanced pollen and nectar nutrition for pollinating colonies",
        "Zero competition between crops; synchronized blooming peaks",
        "Documented +20% to +30% yield uplift in partner grower tests",
      ],
      agronomicImpact:
        "Precision colony distribution prevents over-visitation while ensuring zero floral spikes remain unfertilized throughout the multi-week flowering window.",
    },
    {
      id: "farm-panorama",
      title: "Dual-Crop Mixed Orchard Panorama (Mangoes & Oranges)",
      crop: "Mangoes, Oranges & Citrus",
      cropScientific: "Mixed Agroforestry System",
      category: "Dryland Orchard Layout & Habitat Synergy",
      badge: "Commercial Operation",
      badgeColor: "bg-emerald-600/15 text-emerald-800 border-emerald-300 dark:text-emerald-200",
      description:
        "Comprehensive field perspective of the Makueni orchard showing structured orange tree rows in the foreground and tall, blossoming mango trees in the midground against the iconic native Baobab tree.",
      image: "/images/pollination/mango-orange-farm-wide.jpg",
      thumbLabel: "Mixed Orchard",
      cropType: "Mixed Orchard",
      fieldObservations: [
        "Dual-crop synergistic foraging across two flower bloom curves",
        "Semi-arid soil conservation integrated with mobile precision apiaries",
        "Maximized farm revenue per acre through simultaneous crop boost",
      ],
      agronomicImpact:
        "Co-locating hives between citrus and mango orchards leverages staggered floral peaks, maintaining sustained foraging momentum and robust colony health.",
    },
    {
      id: "apisense-probe",
      title: "Apisense™ In-Hive Telemetry Probe on Brood Comb",
      crop: "BeeYield & Apisense Telemetry",
      cropScientific: "In-Hive Acoustic & Environmental Sensor",
      category: "Apisense at Work • In-Hive Hardware",
      badge: "Apisense at Work",
      badgeColor: "bg-yellow-500/15 text-yellow-700 border-yellow-300 dark:text-yellow-300",
      description:
        "Real-time in-hive probe by Apisense deployed directly inside the brood comb. The non-invasive sensor monitors acoustic frequencies, brood temperatures (34.5°C - 35.5°C), and relative humidity while honeybees actively build and tend the comb.",
      image: "/images/pollination/apisense-internal-sensor-probe.png",
      thumbLabel: "Apisense Probe",
      cropType: "Field Telemetry",
      fieldObservations: [
        "Real-time acoustic analysis detecting queen presence and foraging vigor",
        "Immediate detection of microclimate deviations without opening the hive",
        "Live data streamed via BeeYield field telemetry gateway",
      ],
      agronomicImpact:
        "Enables growers and apiary managers to verify colony pollination intensity hour-by-hour without disrupting the delicate brood nest.",
    },
    {
      id: "beeyield-gateway",
      title: "BeeYield Field Telemetry Gateway with Dual Antennas",
      crop: "BeeYield Field Gateway",
      cropScientific: "Solar-Powered Wireless Telemetry Hub",
      category: "BeeYield and Apisense at Work",
      badge: "Field Gateway Node",
      badgeColor: "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-300",
      description:
        "Solar-powered wireless telemetry gateway node mounted directly on the hive stand in the orchard. Captures signals from Apisense in-hive probes and relays continuous metrics over cellular/mesh to the BeeYield cloud platform.",
      image: "/images/pollination/beeyield-apisense-gateway-field.png",
      thumbLabel: "Solar Gateway",
      cropType: "Field Telemetry",
      fieldObservations: [
        "Continuous solar-backed autonomous operation in harsh semi-arid conditions",
        "Dual high-gain omnidirectional antennas ensuring orchard-wide coverage",
        "Secured on elevated predator-proof metal hive stands",
      ],
      agronomicImpact:
        "Guarantees zero data blackout across remote dryland orchards, enabling precision deployment timing for both mango and citrus bloom cycles.",
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
      }, 100); // Small delay to ensure render
    }
  }, [location]);

  const caseStudies = [
    {
      id: "maize",
      title: "Maize Pollination",
      category: "Cereal Crop",
      stories: [
        {
          farmer: "James Mwangi",
          location: "Kibwezi, Makueni",
          role: "Commercial Maize Farmer",
          acres: 40,
          description:
            "My 40-acre maize farm in Kibwezi has always been decent, but plateaued. I was skeptical about bees for wind-pollinated maize, but BeeYield proved me wrong. The cobs are filled to the tip, pushing my yield per acre up by 18%.",
          quote:
            "I was skeptical at first because maize is wind-pollinated, but the difference in cob fullness was undeniable.",
          stats: [
            { label: "Yield Increase", value: "+18%" },
            { label: "Acres Pollinated", value: "40" },
            { label: "Cob Fill", value: "100%" },
          ],
          image: "/images/maize_case.png",
        },
        {
          farmer: "Peter Korir",
          location: "Mbuinzau, Makueni",
          role: "Seed Maize Producer",
          acres: 100,
          description:
            "Seed production is a numbers game. We need every silk pollinated. BeeYield brought in high-density hives during tasseling. The resulting seed set was the highest we've seen in five years.",
          quote:
            "For seed maize, you can't leave it to chance. The bees ensured every silk was hit.",
          stats: [
            { label: "Seed Set", value: "99%" },
            { label: "Acres Pollinated", value: "100" },
            { label: "Grade", value: "Premium" },
          ],
          image:
            "https://images.unsplash.com/photo-1634467524884-897d0af5e104?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Alice Wanjiku",
          location: "Makindu, Makueni",
          role: "Mixed Crop Farmer",
          acres: 15,
          description:
            "I intercrop maize with beans. The bees helped both. My maize cobs are heavier this season, and the kernels are deep and well-formed.",
          quote:
            "It's not just the quantity, it's the weight of the harvest that surprised me.",
          stats: [
            { label: "Harvest Weight", value: "+15%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Grain fill", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Robert Kemboi",
          location: "Kibwezi, Makueni",
          role: "Maize Farmer",
          acres: 25,
          description:
            "Using BeeYield's services was a game changer for my medium-scale farm. The uniformity of the crop was excellent, making harvesting much easier.",
          quote:
            "Uniform growth and better filling. I'm definitely using them again next season.",
          stats: [
            { label: "Uniformity", value: "Excellent" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Yield", value: "+12%" },
          ],
          image:
            "https://images.unsplash.com/photo-1629007687834-0466be24751f?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Sarah Chepkoech",
          location: "Mbuinzau, Makueni",
          role: "Commercial Farmer",
          acres: 60,
          description:
            "We farm on a large scale. BeeYield's professionalism and the impact of their bees on our maize crop were impressive. We saw a tangible return on investment.",
          quote:
            "Professional service and visible results. The bees paid for themselves.",
          stats: [
            { label: "ROI", value: "Positive" },
            { label: "Acres Pollinated", value: "60" },
            { label: "Quality", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1595126868697-7c7038e827e8?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "sunflower",
      title: "Sunflower Production",
      category: "Oilseed Crop",
      stories: [
        {
          farmer: "Sarah Kimathi",
          location: "Makindu, Makueni",
          role: "Sunflower Producer",
          acres: 30,
          description:
            "Sunflowers and bees are a perfect match. On my 30 acres in Makindu, the difference between the starting rows near the wild bees and the center was huge. BeeYield's hives evened that out. Full heads everywhere.",
          quote:
            "The bees were incredibly active. We saw full heads of seeds and higher oil extraction rates.",
          stats: [
            { label: "Oil Content", value: "+25%" },
            { label: "Acres Pollinated", value: "30" },
            { label: "Seed Set", value: "95%" },
          ],
          image: "/images/sunflower_case.png",
        },
        {
          farmer: "John Omondi",
          location: "Kibwezi, Makueni",
          role: "Smallholder Group Lead",
          acres: 50,
          description:
            "Our cooperative consolidated 50 acres for sunflower oil. We needed consistent pollination across fragmented plots. The mobile hives did the trick, boosting our collective output.",
          quote:
            "Bringing bees to our scattered plots unified our harvest quality.",
          stats: [
            { label: "Group Yield", value: "+30%" },
            { label: "Acres Pollinated", value: "50" },
            { label: "Uniformity", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Lucas Maara",
          location: "Mbuinzau, Makueni",
          role: "Dryland Farmer",
          acres: 12,
          description:
            "Farming in semi-arid areas is tough. You need to maximize every flower. The bees ensured that the short bloom window resulted in a harvestable crop despite the heat.",
          quote: "The bees made sure the short rainy season bloom counted.",
          stats: [
            { label: "Drought Resilience", value: "Improved" },
            { label: "Acres Pollinated", value: "12" },
            { label: "Seed Count", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1470509037663-253afd7f0f6e?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Beatrice Wanjiku",
          location: "Makindu, Makueni",
          role: "Sunflower Farmer",
          acres: 8,
          description:
            "I started small with sunflowers. BeeYield helped me understand the importance of pollination. The seeds were plump and full of oil.",
          quote:
            "I never knew bees could make such a difference in seed quality.",
          stats: [
            { label: "Seed Quality", value: "Excellent" },
            { label: "Acres Pollinated", value: "8" },
            { label: "Oil %", value: "+20%" },
          ],
          image:
            "https://images.unsplash.com/photo-1528691503-4905106881c6?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "David Kiplagat",
          location: "Kibwezi, Makueni",
          role: "Commercial Grower",
          acres: 45,
          description:
            "Reliability is key for my contract farming. BeeYield delivered hives on time and the bees were strong. My harvest met all the buyer's specifications.",
          quote:
            "Reliable service and strong colonies. Exactly what a commercial grower needs.",
          stats: [
            { label: "Contract Met", value: "100%" },
            { label: "Acres Pollinated", value: "45" },
            { label: "Yield", value: "+15%" },
          ],
          image:
            "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "mangoes",
      title: "Mango Exports",
      category: "Fruit Orchard",
      stories: [
        {
          farmer: "David Mutua",
          location: "Mbuinzau, Makueni",
          role: "Orchard Manager",
          acres: 25,
          description:
            "Export markets demand perfection. Reduced early fruit drop was my main goal. BeeYield's pollinators kept the fruit on the tree and improved the shape.",
          quote:
            "Our export rejection rate dropped significantly. The fruit uniformity was the best in a decade.",
          stats: [
            { label: "Retention", value: "+30%" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Export Grade", value: "Premium" },
          ],
          image: "/images/pollination/mango-panicles-close-bloom.png",
          fieldPhotoCaption: "Dense Mango Floral Panicles in Peak Bloom • Makueni County",
        },
        {
          farmer: "Esther Muli",
          location: "Kibwezi, Makueni",
          role: "Organic Mango Farmer",
          acres: 10,
          description:
            "As an organic farmer, I rely on nature. Adding managed hives boosted my bio-intensive approach. The bees were aggressive workers, hitting every flower spike.",
          quote:
            "Simple, natural, and effective. The bees did more for my crop than any fertilizer.",
          stats: [
            { label: "Fruit Set", value: "+25%" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Size", value: "Large" },
          ],
          image: "/images/pollination/mango-orchard-pink-panicles.png",
          fieldPhotoCaption: "Canopy Panicles Bloom Burst • Kibwezi",
        },
        {
          farmer: "Rashid Ali",
          location: "Makindu, Makueni",
          role: "Coastal & Dryland Grower",
          acres: 40,
          description:
            "Our mango varieties flower profusely. We needed a workforce to match. BeeYield deployed 20 hives for my 40 acres, ensuring coverage spread to the canopy top.",
          quote:
            "We saw bees working even the top branches where we usually lose fruit.",
          stats: [
            { label: "Canopy Reach", value: "100%" },
            { label: "Acres Pollinated", value: "40" },
            { label: "Volume", value: "+40 Tons" },
          ],
          image: "/images/pollination/mango-tree-full-blossom.png",
          fieldPhotoCaption: "Full Blooming Mango Tree • Makindu",
        },
        {
          farmer: "Joseph Kyalo",
          location: "Kibwezi, Makueni",
          role: "Mango Farmer",
          acres: 18,
          description:
            "Drought conditions usually hit my yield hard. However, with the bees maximizing pollination during the short flowering burst, I still managed a respectable harvest.",
          quote: "The bees saved my season during a tough dry spell.",
          stats: [
            { label: "Resilience", value: "High" },
            { label: "Acres Pollinated", value: "18" },
            { label: "Fruit Count", value: "Good" },
          ],
          image: "/images/pollination/mango-bloom-pollination.jpg",
          fieldPhotoCaption: "Active Bee Pollination on Floral Spikes",
        },
        {
          farmer: "Mary Nduku",
          location: "Mbuinzau, Makueni",
          role: "Small Scale Exporter",
          acres: 5,
          description:
            "Quality over quantity is my motto. Bee pollination gave my mangoes the size and blush needed for the premium export crates.",
          quote: "Perfectly shaped fruit that gets the best price.",
          stats: [
            { label: "Price Premium", value: "+20%" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Quality", value: "Top" },
          ],
          image: "/images/pollination/mango-orchard-flowering.jpg",
          fieldPhotoCaption: "Synchronized Mango Orchard Canopy",
        },
      ],
    },
    {
      id: "beans",
      title: "Bean Yields",
      category: "Legumes",
      stories: [
        {
          farmer: "Alice Chebet",
          location: "Makindu, Makueni",
          role: "Mixed Crop Farmer",
          acres: 18,
          description:
            "Beans usually take care of themselves, but I wanted more. The 'tripping' effect of the bees was real. My pods filled out completely, no air pockets inside.",
          quote:
            "BeeYield's service helped us achieve a bumper harvest. The pods were consistently full.",
          stats: [
            { label: "Pod Fill", value: "98%" },
            { label: "Acres Pollinated", value: "18" },
            { label: "Harvest Time", value: "Uniform" },
          ],
          image: "/images/beans_case.png",
        },
        {
          farmer: "Geoffrey Otieno",
          location: "Kibwezi, Makueni",
          role: "Soya & Bean Farmer",
          acres: 22,
          description:
            "I grew soya and climbing beans. The bees worked both. The synchronized flowering and pod set made mechanical harvesting totally viable this year.",
          quote: "Uniform maturity saved me days of labor during harvest.",
          stats: [
            { label: "Labor Saving", value: "2 Days" },
            { label: "Acres Pollinated", value: "22" },
            { label: "Yield", value: "+22%" },
          ],
          image:
            "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&q=80&w=600",
        },
        {
          farmer: "Rose Auma",
          location: "Mbuinzau, Makueni",
          role: "Bean Farmer",
          acres: 10,
          description:
            "My bean crop has never looked this green and productive. The bees were constantly buzzing around. I harvested more bags per acre than ever before.",
          quote: "Record-breaking harvest for my farm.",
          stats: [
            { label: "Yield/Acre", value: "+20%" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Pod Count", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Paul Wafula",
          location: "Makindu, Makueni",
          role: "Commercial Farmer",
          acres: 35,
          description:
            "Rolling out BeeYield's hives across my 35 acres ensured consistent pod setting. The resulting uniformity in the bean size was perfect for processing.",
          quote:
            "Consistency is key for canning beans, and the bees delivered.",
          stats: [
            { label: "Consistency", value: "High" },
            { label: "Acres Pollinated", value: "35" },
            { label: "Rejection", value: "Low" },
          ],
          image:
            "https://images.unsplash.com/photo-1594247065091-62d3851b9e07?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Janet Kemunto",
          location: "Kibwezi, Makueni",
          role: "Mixed Farmer",
          acres: 7,
          description:
            "With limited land, I have to maximize efficiency. The bees helped my climbing beans produce pods right to the top of the poles.",
          quote: "Maximum production from every square foot of land.",
          stats: [
            { label: "Efficiency", value: "Maximized" },
            { label: "Acres Pollinated", value: "7" },
            { label: "Vertical Yield", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1615485500704-8e99099d9d0f?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "sisal",
      title: "Sisal Agave",
      category: "Fiber Crop",
      stories: [
        {
          farmer: "Estate Manager",
          location: "Mbuinzau, Makueni",
          role: "Sisal Plantation",
          acres: 500,
          description:
            "On 500 acres, biodiversity is a concern. The bees turned our flowering poles into a honey factory without disturbing seed production. A win-win for ecology and revenue.",
          quote:
            "Integrating bees created a new revenue stream from honey and improved local ecology.",
          stats: [
            { label: "Honey", value: "500kg" },
            { label: "Acres Managed", value: "500" },
            { label: "Sustainability", value: "High" },
          ],
          image: "/images/sisal_case.png",
        },
        {
          farmer: "Conservation Trust",
          location: "Makindu, Makueni",
          role: "Land Management",
          acres: 200,
          description:
            "We manage sisal barriers. The bees helped naturalize the fence lines and supported the surrounding wildflowers, boosting the overall insect population.",
          quote: "A perfect example of productive conservation.",
          stats: [
            { label: "Eco-Health", value: "Restored" },
            { label: "Acres Managed", value: "200" },
            { label: "Wildflowers", value: "Thriving" },
          ],
          image:
            "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Community Coop",
          location: "Kibwezi, Makueni",
          role: "Communal Land",
          acres: 100,
          description:
            "Our community uses sisal for crafts. The honey produced by the bees from the sisal flowers gave us an additional income source during the dry season.",
          quote: "Honey from sisal? A sweet surprise for our community.",
          stats: [
            { label: "Income", value: "Diversified" },
            { label: "Acres Managed", value: "100" },
            { label: "Honey Quality", value: "Unique" },
          ],
          image:
            "https://images.unsplash.com/photo-1590486803833-1c5dc8ce2ac3?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Private Rancher",
          location: "Mbuinzau, Makueni",
          role: "Ranching",
          acres: 1000,
          description:
            "Using bees on our sisal boundaries helps deter elephants while fixing carbon through better plant growth. It's a natural barrier system.",
          quote:
            "Bees, sisal, and elephants - a delicate but effective balance.",
          stats: [
            { label: "Conflict", value: "Reduced" },
            { label: "Acres Managed", value: "1000" },
            { label: "Eco-Balance", value: "Good" },
          ],
          image:
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Coastal Plantations",
          location: "Makindu, Makueni",
          role: "Commercial Agave",
          acres: 300,
          description:
            "We are experimenting with massive scale pollination. Initial results show healthier parent plants and more viable bulbils for replanting.",
          quote: "Investing in the future of our plantation stock.",
          stats: [
            { label: "Stock Health", value: "+10%" },
            { label: "Acres Managed", value: "300" },
            { label: "Propagation", value: "Easy" },
          ],
          image:
            "https://images.unsplash.com/photo-1599598425947-658b44670c5e?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "oranges",
      title: "Orange Orchards",
      category: "Citrus Fruit",
      stories: [
        {
          farmer: "Hassan Juma",
          location: "Kibwezi, Makueni",
          role: "Citrus Farmer",
          acres: 15,
          description:
            "My 15-acre orange grove had issues with fruit size. BeeYield ensured that every blossom got visited multiple times. The result? Big, heavy, juicy oranges.",
          quote:
            "The quality improved drastically. They are larger, sweeter, and fetch a better price.",
          stats: [
            { label: "Juice Content", value: "High" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Fruit Size", value: "Large" },
          ],
          image: "/images/pollination/orange-tree-citrus-fruits.jpg",
          fieldPhotoCaption: "Developing Citrus Fruits with Baobab • Kibwezi",
        },
        {
          farmer: "Mariam Abdi",
          location: "Mbuinzau, Makueni",
          role: "Orchard Owner",
          acres: 20,
          description:
            "We target the premium juice market. Brix levels are king. The stress-free pollination provided by the bees seemed to concentrate sugars better.",
          quote: "Our sweetness levels hit a record high this season.",
          stats: [
            { label: "Brix Level", value: "Top Tier" },
            { label: "Acres Pollinated", value: "20" },
            { label: "Bloom Coverage", value: "100%" },
          ],
          image: "/images/pollination/orange-tree-heavy-fruiting.jpg",
          fieldPhotoCaption: "Orange Tree in Heavy Fruiting Stage • Mbuinzau",
        },
        {
          farmer: "Ali Swaleh",
          location: "Makindu, Makueni",
          role: "Citrus Grower",
          acres: 10,
          description:
            "Salt air and heat can be tough on blossoms. The bees worked fast in the cool mornings. My orange trees are loaded with fruit this year.",
          quote: "Excellent set even with our rough dryland climate.",
          stats: [
            { label: "Climate Adaptation", value: "High" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Yield", value: "+25%" },
          ],
          image: "/images/pollination/orange-citrus-orchard.jpg",
          fieldPhotoCaption: "Citrus Grove Orchard Rows • Makindu",
        },
        {
          farmer: "Farm Manager",
          location: "Kibwezi, Makueni",
          role: "Pixie Oranges",
          acres: 50,
          description:
            "Pixie oranges need to be seedless and sweet. Controlled pollination helps maintain quality. The bees did a great job navigating our dense orchard rows.",
          quote: "Dense canopy? No problem for BeeYield's hives.",
          stats: [
            { label: "Coverage", value: "100%" },
            { label: "Acres Pollinated", value: "50" },
            { label: "Fruit Quality", value: "Premium" },
          ],
          image: "/images/pollination/citrus-mango-intercrop.jpg",
          fieldPhotoCaption: "Pixie Orange Rows with Agroforestry Shelter",
        },
        {
          farmer: "Grace Mwende",
          location: "Mbuinzau, Makueni",
          role: "Commercial Citrus Grower",
          acres: 12,
          description:
            "I wanted to extend my harvest season. The bees helped synchronize the bloom, so I had a massive, manageable harvest instead of sporadic picking.",
          quote: "Synchronized harvest simplified my labor planning.",
          stats: [
            { label: "Sync", value: "Perfect" },
            { label: "Acres Pollinated", value: "12" },
            { label: "Yield", value: "+18%" },
          ],
          image: "/images/pollination/mango-orange-farm-wide.jpg",
          fieldPhotoCaption: "Dual-Crop Mixed Orange & Mango Farm Panorama",
        },
      ],
    },
    {
      id: "citrus",
      title: "Citrus & Lime Groves",
      category: "Citrus Orchard",
      stories: [
        {
          farmer: "Francis Mutiso",
          location: "Makueni Citrus Hub",
          role: "Citrus Cooperative Lead",
          acres: 60,
          description:
            "Our cooperative manages extensive Valencia and Pixie citrus groves. Intensive honeybee visitation during the 3-week anthesis surge eliminated fruit drop and delivered exceptional fruit weight across all blocks.",
          quote:
            "The fruit density and branch loading are the highest we have ever recorded.",
          stats: [
            { label: "Fruit Weight", value: "+32%" },
            { label: "Acres Pollinated", value: "60" },
            { label: "Bloom Visited", value: "100%" },
          ],
          image: "/images/pollination/orange-tree-heavy-fruiting.jpg",
          fieldPhotoCaption: "Citrus Branches Loaded with Developing Fruit • Makueni",
        },
        {
          farmer: "Beatrice Ndinda",
          location: "Kibwezi, Makueni",
          role: "Export Citrus Specialist",
          acres: 25,
          description:
            "Export buyers inspect skin smoothness, spherical uniformity, and Brix sweetness. BeeYield's precision placement ensured consistent stigmatic coverage throughout the canopy.",
          quote:
            "Export rejection plummeted to nearly zero. Every crate met first-grade European export standards.",
          stats: [
            { label: "Brix Level", value: "12.8°" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Export Grade", value: "Grade 1" },
          ],
          image: "/images/pollination/orange-tree-citrus-fruits.jpg",
          fieldPhotoCaption: "Spherical Citrus Development Under Baobab Shelter • Kibwezi",
        },
        {
          farmer: "Samuel Kituku",
          location: "Mbuinzau, Makueni",
          role: "Agroforestry Citrus Grower",
          acres: 35,
          description:
            "We intercrop citrus with mango trees to balance soil moisture and wind. The bees forage back and forth between citrus and mango blooms, keeping colony vigor peak throughout both cycles.",
          quote:
            "The intercrop pollination synergy gave us two bumper crops in one season.",
          stats: [
            { label: "Dual Yield", value: "+28%" },
            { label: "Acres Pollinated", value: "35" },
            { label: "Bee Vigor", value: "Optimal" },
          ],
          image: "/images/pollination/citrus-mango-intercrop.jpg",
          fieldPhotoCaption: "Citrus & Mango Intercropped Agroforestry Rows • Mbuinzau",
        },
        {
          farmer: "Charles Musyoka",
          location: "Makindu, Makueni",
          role: "Irrigated Citrus Planter",
          acres: 30,
          description:
            "Semi-arid heat can desiccate citrus blossoms within hours. By having Apisense telemetry monitor morning hive flight triggers, bees saturated the flowers at the exact peak of nectar secretion.",
          quote:
            "Precision timing gave us complete fertilization before the midday heat set in.",
          stats: [
            { label: "Fruit Retention", value: "96%" },
            { label: "Acres Pollinated", value: "30" },
            { label: "Water Eff.", value: "+15%" },
          ],
          image: "/images/pollination/orange-citrus-orchard.jpg",
          fieldPhotoCaption: "Commercial Citrus Grove Layout • Makindu",
        },
        {
          farmer: "Joyce Kalondu",
          location: "Sultan Hamud, Makueni",
          role: "Citrus & Dryland Farmer",
          acres: 15,
          description:
            "Our citrus trees grow under the majestic canopy of ancient Baobabs. The bees love this microclimate, resulting in rich juice sacs and deep orange rind pigmentation.",
          quote:
            "Our juice processors paid us a 20% premium because of the high sugar and juice volume.",
          stats: [
            { label: "Juice Yield", value: "+30%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Premium Paid", value: "+20%" },
          ],
          image: "/images/pollination/mango-orange-farm-wide.jpg",
          fieldPhotoCaption: "Baobab Agroforestry Citrus Plantation • Sultan Hamud",
        },
      ],
    },
    {
      id: "vegetables",
      title: "Mixed Vegetables",
      category: "Horticulture",
      stories: [
        {
          farmer: "Grace Wanjiku",
          location: "Makindu, Makueni",
          role: "Horticulturist",
          acres: 8,
          description:
            "I grow 12 types of vegetables on 8 intensive acres. The bees are generalists—they hit the peppers, the courgettes, everything. My rejection rate dropped by 15%.",
          quote:
            "We grow a bit of everything, and the bees have helped boost production across the board.",
          stats: [
            { label: "Crop Diversity", value: "12 Types" },
            { label: "Acres Pollinated", value: "8" },
            { label: "Defects", value: "-15%" },
          ],
          image:
            "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Njoroge K.",
          location: "Kibwezi, Makueni",
          role: "Market Gardener",
          acres: 5,
          description:
            "For the city market, looks matter. Misshapen courgettes don't sell. My bee-pollinated crop was straight and glossy.",
          quote: "The visual appeal of the produce is just different now.",
          stats: [
            { label: "Marketability", value: "+20%" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Shape", value: "Perfect" },
          ],
          image:
            "https://images.unsplash.com/photo-1595855709915-f5b2b295ba5d?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Horti-Coop",
          location: "Mbuinzau, Makueni",
          role: "Export Veg",
          acres: 20,
          description:
            "French beans for export require delicate handling. The bees pollinated the flowers without damaging the delicate plants. Yields are up across the cooperative.",
          quote: "Gentle, effective pollination for high-value crops.",
          stats: [
            { label: "Export Quality", value: "Verified" },
            { label: "Acres Pollinated", value: "20" },
            { label: "Yield", value: "+12%" },
          ],
          image:
            "https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Local school farm",
          location: "Makindu, Makueni",
          role: "Educational Farm",
          acres: 2,
          description:
            "We use the hives for education and pollination. The pumpkins and squashes grown by the students are record-breaking size this year thanks to the bees.",
          quote: "Education and production going hand in hand.",
          stats: [
            { label: "Size", value: "Record" },
            { label: "Acres Pollinated", value: "2" },
            { label: "Learning", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1621459586195-2cc677054f0c?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Urban Grower",
          location: "Kibwezi, Makueni",
          role: "Intensive Farming",
          acres: 1,
          description:
            "Even on 1 acre, density matters. The bees ensured that my vertical garden towers of capsicum set fruit at every level.",
          quote: "Maximizing yield in minimum space.",
          stats: [
            { label: "Vertical Set", value: "100%" },
            { label: "Acres Pollinated", value: "1" },
            { label: "Density", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "tomatoes",
      title: "Tomato Greenhouses",
      category: "Greenhouse",
      stories: [
        {
          farmer: "Peter Njoroge",
          location: "Mbuinzau, Makueni",
          role: "Greenhouse Manager",
          acres: 3,
          description:
            "3 acres under plastic. We used to vibrate flowers by hand. The bees do it 40 hours a week for us. The savings on labor alone paid for the service.",
          quote:
            "Before bees, we had to mechanically vibrate flowers. The bees do it better and faster.",
          stats: [
            { label: "Labor Saved", value: "40 Hrs/Wk" },
            { label: "Acres Pollinated", value: "3" },
            { label: "Fruit Set", value: "99%" },
          ],
          image:
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Sarah Jenkins",
          location: "Makindu, Makueni",
          role: "Export Greenhouse",
          acres: 10,
          description:
            "Export tomatoes need to be uniform size. The bumblebee-like buzzing of BeeYield's hives ensured every flower released pollen completely.",
          quote:
            "Uniformity is our currency. The bees printed money for us this year.",
          stats: [
            { label: "Grade 1", value: "95%" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Speed", value: "Fast" },
          ],
          image:
            "https://images.unsplash.com/photo-1561136120-f19b16ea9399?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "James Kinyanjui",
          location: "Kibwezi, Makueni",
          role: "Metro Greenhouse",
          acres: 5,
          description:
            "Supplying Nairobi hotels requires consistency. With bees, I don't miss a beat. Every cluster of flowers turns into a cluster of tomatoes.",
          quote: "Reliable production week after week.",
          stats: [
            { label: "Consistency", value: "High" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Fruit Drop", value: "Zero" },
          ],
          image:
            "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Bio-Farm Ltd",
          location: "Mbuinzau, Makueni",
          role: "Organic Greenhouse",
          acres: 8,
          description:
            "We can't use hormones for fruit set. Bees are the only natural solution. They fit perfectly into our certified organic workflow.",
          quote: "The natural choice for organic certification.",
          stats: [
            { label: "Organic", value: "Certified" },
            { label: "Acres Pollinated", value: "8" },
            { label: "Set Rate", value: "98%" },
          ],
          image:
            "https://images.unsplash.com/photo-1558818498-28c1e002b655?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Research Group",
          location: "Makindu, Makueni",
          role: "Research Greenhouse",
          acres: 1,
          description:
            "Monitoring the efficiency of bee pollination vs manual. The evidence is clear: bees are efficient and produce heavier fruit.",
          quote: "Nature does it best.",
          stats: [
            { label: "Efficiency", value: "3x" },
            { label: "Acres Pollinated", value: "1" },
            { label: "Weight", value: "+15%" },
          ],
          image:
            "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "onions",
      title: "Onion Seed",
      category: "Seed Production",
      stories: [
        {
          farmer: "Seed Co. Rep",
          location: "Kibwezi, Makueni",
          role: "Production Lead",
          acres: 50,
          description:
            "On 50 acres of hybrid onion, you can't fake it. We placed 4 hives per acre. The activity was frantic. We broke our site record for seed yield per acre.",
          quote:
            "We are in the business of seeds, and bees are our most valuable employees.",
          stats: [
            { label: "Seed Yield", value: "+35%" },
            { label: "Acres Pollinated", value: "50" },
            { label: "Hive Density", value: "4/Acre" },
          ],
          image: "/images/onion-plantation.png",
        },
        {
          farmer: "Contract Farmer",
          location: "Mbuinzau, Makueni",
          role: "Irrigation Scheme",
          acres: 15,
          description:
            "Pollination is usually our bottleneck. Not this time. The coverage was so good we had to prop up the seed heads due to weight.",
          quote: "Heaviest heads I've ever seen.",
          stats: [
            { label: "Germination", value: "92%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Weight", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Daniel Moi",
          location: "Makindu, Makueni",
          role: "Seed Grower",
          acres: 10,
          description:
            "High altitude onion seed is valuable. The bees adapted well to the cooler mornings and ensured a profitable harvest.",
          quote: "Adaptable bees for our unique climate.",
          stats: [
            { label: "Adaptability", value: "Good" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Profit", value: "+20%" },
          ],
          image:
            "https://images.unsplash.com/photo-1623226996614-727581559869?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Rift Valley Seeds",
          location: "Kibwezi, Makueni",
          role: "Commercial Seed",
          acres: 60,
          description:
            "We need purity. BeeYield managed the isolation distances and hive placement perfectly. Pure, high-quality hybrid seed was the result.",
          quote: "Purity and yield - the holy grail of seed production.",
          stats: [
            { label: "Genetic Purity", value: "100%" },
            { label: "Acres Pollinated", value: "60" },
            { label: "Yield", value: "+30%" },
          ],
          image:
            "https://images.unsplash.com/photo-1621459586326-c23f798889c3?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Smallholder Group",
          location: "Mbuinzau, Makueni",
          role: "Community Scheme",
          acres: 25,
          description:
            "Pooling our land for seed production was risky. The bees de-risked it by ensuring a bumper crop for everyone involved.",
          quote: "A collective success story.",
          stats: [
            { label: "Success", value: "Shared" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Risk", value: "Lowered" },
          ],
          image:
            "https://images.unsplash.com/photo-1618382025171-47752e5a2db3?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 rounded-full text-primary border-primary/30"
          >
            Field Reports
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Crop Case <span className="text-primary">Studies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore how our pollination services are improving yields across
            different crops. Verified results from our partner farmers.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-[#1B9157] text-white hover:bg-[#157746] transition-colors font-bold shadow-md shadow-green-900/10"
              onClick={() =>
                document
                  .getElementById("latest-pollination")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Field Dispatch: Mangoes, Oranges & Citrus
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
                document.getElementById("oranges")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              🍊 Orange Orchards
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-lime-500/15 text-lime-900 dark:text-lime-200 border-lime-300 hover:bg-lime-500/25 font-bold"
              onClick={() =>
                document.getElementById("citrus")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              🍋 Citrus & Lime Groves
            </Button>
            {caseStudies.filter(s => !["mangoes", "oranges", "citrus"].includes(s.id)).map((study) => (
              <Button
                key={study.id}
                variant="outline"
                size="sm"
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() =>
                  document
                    .getElementById(study.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {study.title}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Pollination Deployment Section: Mango & Orange Farm */}
      <section
        id="latest-pollination"
        className="py-20 bg-gradient-to-b from-background via-green-50/40 to-background border-b border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="bg-[#1B9157]/15 text-[#1B9157] hover:bg-[#1B9157]/20 border-[#1B9157]/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5 mr-1.5 inline" />
              Field Dispatch • Active Pollination Contract
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Dual-Crop Precision Pollination: <br className="hidden sm:inline" />
              <span className="text-[#1B9157]">Mangoes, Oranges & Citrus</span> Orchard
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Photographic proof from our active field operations in Makueni County.
              This farm features an integrated orchard where <strong>mango trees are in dense floral panicle bloom</strong> and{" "}
              <strong>citrus orange trees are in fruit development</strong>, sheltered by ancient Baobabs in Kenya's semi-arid dryland.
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
                      className={`${latestPollinationMedia[selectedPhotoIndex].badgeColor} border px-3 py-1.5 text-xs font-bold backdrop-blur-md`}
                    >
                      {latestPollinationMedia[selectedPhotoIndex].crop} • {latestPollinationMedia[selectedPhotoIndex].category}
                    </Badge>
                    <Badge className="bg-background/90 text-foreground border-none backdrop-blur px-3 py-1.5 text-xs font-semibold">
                      Photo {selectedPhotoIndex + 1} of {latestPollinationMedia.length}
                    </Badge>
                  </div>

                  {/* Caption on bottom of image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xl md:text-2xl font-black mb-1 leading-tight drop-shadow-md">
                      {latestPollinationMedia[selectedPhotoIndex].title}
                    </p>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#F4D03F]" />
                      Makueni County, Kenya &bull; Mixed Mango & Citrus Agroforestry Zone
                    </p>
                  </div>
                </div>

                {/* Micro thumbnail selector directly below main photo */}
                <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-2 pt-2">
                  {latestPollinationMedia.map((photo, pIdx) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(pIdx)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group/thumb ${
                        selectedPhotoIndex === pIdx
                          ? "border-[#1B9157] ring-2 ring-[#1B9157]/40 scale-102 shadow-md"
                          : "border-border/60 opacity-70 hover:opacity-100 hover:border-primary/50"
                      }`}
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
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    className="rounded-full bg-[#1B9157] hover:bg-[#157746] text-white font-bold h-11 px-6 shadow-md shadow-green-900/10"
                  >
                    <Link to="/pollination-request">
                      Book Orchard Pollination <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-border hover:bg-secondary font-semibold h-11 px-5"
                    onClick={() => {
                      const targetId = latestPollinationMedia[selectedPhotoIndex].cropType === "Orange" ? "oranges" : "mangoes";
                      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View {latestPollinationMedia[selectedPhotoIndex].cropType} Case Study
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Sections */}
      <div className="space-y-0">
        {caseStudies.map((study, index) => (
          <section
            key={study.id}
            id={study.id}
            className={`py-24 ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
          >
            <div className="container mx-auto px-4">
              {/* Section Title */}
              <div className="mb-12 flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${index % 2 === 0 ? "bg-secondary/50" : "bg-background"}`}
                >
                  <Sprout className="w-8 h-8 text-primary" />
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
                        className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                      >
                        {/* Image Column */}
                        <div className="w-full lg:w-1/2">
                          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group border-4 border-background bg-muted">
                            <img
                              src={story.image}
                              alt={`${story.farmer} - ${study.title}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-background/95 text-foreground backdrop-blur border-none shadow-xl px-3.5 py-1.5 text-xs font-bold">
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
                                {"fieldPhotoCaption" in story && (story as any).fieldPhotoCaption && (
                                  <p className="text-emerald-300 text-[11px] font-bold bg-black/60 border border-emerald-500/40 px-3 py-1 rounded-full backdrop-blur-md truncate max-w-[280px]">
                                    📸 {(story as any).fieldPhotoCaption}
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
                              Farmer Story
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
                                  {story.farmer.charAt(0)}
                                </div>
                                <div>
                                  <cite className="not-italic font-bold text-foreground block text-lg">
                                    {story.farmer}
                                  </cite>
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {story.role} &bull; {story.acres} Acres
                                  </span>
                                </div>
                              </footer>
                            </blockquote>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                            <Button
                              asChild
                              size="lg"
                              className="w-full sm:w-auto rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-14 px-8 text-lg"
                            >
                              <Link to="/pollination-request">
                                Book Pollination{" "}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> Verified at{" "}
                              {story.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* IMPROVED Carousel Controls - Positioned clearly at the bottom center for mobile, or side for desktop */}
                <div className="flex justify-center gap-4 mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:w-full md:justify-between md:pointer-events-none md:px-4 lg:px-0 lg:-mx-16">
                  <div className="pointer-events-auto">
                    <CarouselPrevious className="relative left-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                  <div className="pointer-events-auto">
                    <CarouselNext className="relative right-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                </div>
              </Carousel>
            </div>
          </section>
        ))}
      </div>

      {/* CTA Footer */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Sprout className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join these farmers and experience the power of precision
            pollination.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
          >
            <Link to="/pollination-request">Work With Us</Link>
          </Button>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Media;
