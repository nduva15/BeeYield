export interface PollinationCropDetail {
  cropName: string;
  beeDependence: string;
  image: string;
  beeyieldAdvantage: string;
  optimalHivesPerAcre: string;
  galleryImages?: string[];
}

export const dashboardPollinationCropDetails: PollinationCropDetail[] = [
  {
    cropName: "Mangoes",
    beeDependence: "Essential (90%+)",
    image: "/images/pollination/mango-panicles-close-bloom.png",
    beeyieldAdvantage: "Synchronized bloom-burst apiary deployment delivers up to 38% higher fruit set.",
    optimalHivesPerAcre: "2 – 3 Hives / Acre",
    galleryImages: [
      "/images/pollination/mango-panicles-close-bloom.png",
      "/images/pollination/mango-flowering-panicles-new.jpg",
      "/images/pollination/mango-bloom-pollination.jpg",
      "/images/pollination/mango-orchard-pink-panicles.png",
      "/images/pollination/mango-tree-full-blossom.png",
    ],
  },
  {
    cropName: "Oranges",
    beeDependence: "High (70%+)",
    image: "/images/pollination/orange-tree-citrus-fruits.jpg",
    beeyieldAdvantage: "Optimized nectar forager activity increases fruit diameter and sweetness.",
    optimalHivesPerAcre: "2 – 4 Hives / Acre",
    galleryImages: [
      "/images/pollination/orange-tree-citrus-fruits.jpg",
      "/images/pollination/orange-citrus-orchard.jpg",
      "/images/pollination/orange-tree-heavy-fruiting.jpg",
      "/images/pollination/citrus-bloom-buds-closeup.jpg",
    ],
  },
  {
    cropName: "Citrus",
    beeDependence: "High (75%+)",
    image: "/images/pollination/citrus-bloom-buds-closeup.jpg",
    beeyieldAdvantage: "Targeted flight radius saturation ensures uniform blossom cross-pollination.",
    optimalHivesPerAcre: "2 – 3 Hives / Acre",
    galleryImages: [
      "/images/pollination/citrus-bloom-buds-closeup.jpg",
      "/images/pollination/citrus-bloom-branch-detail.jpg",
      "/images/pollination/citrus-tree-canopy-closeup.jpg",
      "/images/pollination/citrus-grove-drip-irrigation.jpg",
    ],
  },
  {
    cropName: "Maize",
    beeDependence: "Supplemental (20%+)",
    image: "/images/pollination/maize-field-panorama-mountain.png",
    beeyieldAdvantage: "Pollen scavenging drives intercrop kernel filling and overall yield stability.",
    optimalHivesPerAcre: "1 – 2 Hives / Acre",
    galleryImages: [
      "/images/pollination/maize-field-panorama-mountain.png",
      "/images/pollination/maize-tasseling-closeup.png",
      "/images/pollination/maize-pollination-stage.png",
      "/images/pollination/maize-dense-tasseling-field.png",
      "/images/pollination/maize-silking-mountain-view.png",
    ],
  },
  {
    cropName: "Vegetables",
    beeDependence: "Essential (85%+)",
    image: "/images/pollination/maize-vegetable-intercrop-drip.jpg",
    beeyieldAdvantage: "Multi-point precision placement optimizes seed setting and market-grade shape.",
    optimalHivesPerAcre: "2 – 4 Hives / Acre",
    galleryImages: [
      "/images/pollination/maize-vegetable-intercrop-drip.jpg",
      "/images/pollination/citrus-papaya-intercrop.jpg",
      "/images/pollination/citrus-papaya-orchard-rows.jpg",
      "/images/onion-plantation.png",
    ],
  },
  {
    cropName: "Beans",
    beeDependence: "Moderate (40%+)",
    image: "/images/beans_case.png",
    beeyieldAdvantage: "Forager tripping mechanism stimulates maximum flower fertilization and pod count.",
    optimalHivesPerAcre: "1 – 2 Hives / Acre",
    galleryImages: [
      "/images/beans_case.png",
      "/images/pollination/maize-vegetable-intercrop-drip.jpg",
    ],
  },
  {
    cropName: "Sunflowers",
    beeDependence: "High (65%+)",
    image: "/images/sunflower_case.png",
    beeyieldAdvantage: "Cross-row hybrid flight optimization maximizes seed fill and oil content.",
    optimalHivesPerAcre: "1.5 – 3 Hives / Acre",
    galleryImages: [
      "/images/sunflower_case.png",
      "/images/pollination/gateway-solar-node.png",
    ],
  },
  {
    cropName: "Avocados",
    beeDependence: "Essential (90%+)",
    image: "/images/pollination/citrus-mango-intercrop.jpg",
    beeyieldAdvantage: "Dichogamous daily schedule tracking matches specific male/female flower openings.",
    optimalHivesPerAcre: "2 – 3 Hives / Acre",
    galleryImages: [
      "/images/pollination/citrus-mango-intercrop.jpg",
      "/images/pollination/mango-orange-farm-wide.jpg",
      "/images/land_case.png",
    ],
  },
  {
    cropName: "Coffee",
    beeDependence: "Moderate (30%+)",
    image: "/images/pollination/citrus-bloom-branch-detail.jpg",
    beeyieldAdvantage: "Short intense bloom pollination yields heavier, denser coffee cherries.",
    optimalHivesPerAcre: "1 – 2 Hives / Acre",
    galleryImages: [
      "/images/pollination/citrus-bloom-branch-detail.jpg",
      "/images/pollination/citrus-tree-canopy-closeup.jpg",
    ],
  },
  {
    cropName: "Macadamia",
    beeDependence: "Very High (80%+)",
    image: "/images/pollination/citrus-tree-young-orchard.jpg",
    beeyieldAdvantage: "Dense racemose bloom saturation maximizes nut retention and kernel grade.",
    optimalHivesPerAcre: "4 – 6 Hives / Acre",
    galleryImages: [
      "/images/pollination/citrus-tree-young-orchard.jpg",
      "/images/pollination/citrus-grove-drip-irrigation.jpg",
      "/images/pollination/apisense-sensor-comb-inspection.png",
    ],
  },
];
