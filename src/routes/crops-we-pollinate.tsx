import { createFileRoute } from "@tanstack/react-router";
import CropsWePollinate from "@/pages/CropsWePollinate";

export const Route = createFileRoute("/crops-we-pollinate")({
  head: () => ({
    meta: [
      { title: "Crops We Pollinate | BeeYield - Your Partner in Pollination" },
      {
        name: "description",
        content:
          "Discover the 9+ high-value crops BeeYield pollinates across Kenya, including Avocado, Apple Mango, Citrus, Oranges, Sisal, and Sunflower.",
      },
      {
        property: "og:title",
        content: "Crops We Pollinate — Precision Bee Pastures & Farm Yields | BeeYield",
      },
    ],
  }),
  component: CropsWePollinate,
});
