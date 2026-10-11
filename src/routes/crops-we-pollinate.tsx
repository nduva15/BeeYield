import { createFileRoute } from "@tanstack/react-router";
import CropsWePollinate from "@/pages/CropsWePollinate";

export const Route = createFileRoute("/crops-we-pollinate")({
  head: () => ({
    meta: [
      { title: "Crops We Pollinate | BeeYield - Your Partner in Pollination" },
      {
        name: "description",
        content:
          "The crops BeeYield pollinates in Makueni County: mango, oranges, citrus, maize, vegetables, beans and sunflower.",
      },
      {
        property: "og:title",
        content: "Crops We Pollinate — Precision Bee Pastures & Farm Yields | BeeYield",
      },
    ],
  }),
  component: CropsWePollinate,
});
