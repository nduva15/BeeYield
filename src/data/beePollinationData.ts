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
    image: "/images/story/2023-fruitful-year.jpg",
    beeyieldAdvantage: "Synchronized bloom-burst apiary deployment delivers up to 38% higher fruit set.",
    optimalHivesPerAcre: "2 – 3 Hives / Acre",
    galleryImages: [
      "/images/story/2023-fruitful-year.jpg",
      "/images/story/2024-best-year.jpg",
    ],
  },
  {
    cropName: "Oranges",
    beeDependence: "High (70%+)",
    image: "/images/story/2024-best-year.jpg",
    beeyieldAdvantage: "Optimized nectar forager activity increases fruit diameter and sweetness.",
    optimalHivesPerAcre: "2 – 4 Hives / Acre",
    galleryImages: [
      "/images/story/2024-best-year.jpg",
      "/images/story/2021-growing-apiary.jpg",
    ],
  },
  {
    cropName: "Citrus",
    beeDependence: "High (75%+)",
    image: "/images/story/2021-growing-apiary.jpg",
    beeyieldAdvantage: "Targeted flight radius saturation ensures uniform blossom cross-pollination.",
    optimalHivesPerAcre: "2 – 3 Hives / Acre",
    galleryImages: [
      "/images/story/2021-growing-apiary.jpg",
      "/images/story/2022-team-formation.jpg",
    ],
  },
  {
    cropName: "Maize",
    beeDependence: "Supplemental (20%+)",
    image: "/images/story/2022-team-formation.jpg",
    beeyieldAdvantage: "Pollen scavenging drives intercrop kernel filling and overall yield stability.",
    optimalHivesPerAcre: "1 – 2 Hives / Acre",
    galleryImages: [
      "/images/story/2022-team-formation.jpg",
      "/images/story/2020-humble-beginnings.jpg",
    ],
  },
  {
    cropName: "Vegetables",
    beeDependence: "Essential (85%+)",
    image: "/images/story/2020-humble-beginnings.jpg",
    beeyieldAdvantage: "Multi-point precision placement optimizes seed setting and market-grade shape.",
    optimalHivesPerAcre: "2 – 4 Hives / Acre",
    galleryImages: [
      "/images/story/2020-humble-beginnings.jpg",
      "/images/story/2025-iot-pivot.jpg",
    ],
  },
  {
    cropName: "Avocados",
    beeDependence: "Essential (90%+)",
    image: "/images/story/2025-iot-pivot.jpg",
    beeyieldAdvantage: "Dichogamous daily schedule tracking matches specific male/female flower openings.",
    optimalHivesPerAcre: "2 – 3 Hives / Acre",
    galleryImages: [
      "/images/story/2025-iot-pivot.jpg",
      "/images/story/2023-fruitful-year.jpg",
    ],
  },
  {
    cropName: "Coffee",
    beeDependence: "Moderate (30%+)",
    image: "/images/story/2021-growing-apiary.jpg",
    beeyieldAdvantage: "Short intense bloom pollination yields heavier, denser coffee cherries.",
    optimalHivesPerAcre: "1 – 2 Hives / Acre",
  },
  {
    cropName: "Macadamia",
    beeDependence: "Very High (80%+)",
    image: "/images/story/2023-fruitful-year.jpg",
    beeyieldAdvantage: "Dense racemose bloom saturation maximizes nut retention and kernel grade.",
    optimalHivesPerAcre: "4 – 6 Hives / Acre",
  },
  {
    cropName: "Sunflowers",
    beeDependence: "High (65%+)",
    image: "/images/story/2024-best-year.jpg",
    beeyieldAdvantage: "Cross-row hybrid flight optimization maximizes seed fill and oil content.",
    optimalHivesPerAcre: "1.5 – 3 Hives / Acre",
  },
];
