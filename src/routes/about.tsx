import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | BeeYield - Your Partner in Pollination" },
      {
        name: "description",
        content:
          "The BeeYield story: three siblings grew from 4 hives on ¼ acre to 184 hives, 22 IoT devices, 105 and counting acres pollinated, and 988 kg of honey sold in Kibwezi & Makueni, Kenya — all with zero external funding. Year-by-year journey from 2020 to 2026.",
      },
      {
        property: "og:title",
        content: "BeeYield | Precision Pollination & Honey Traceability in Makueni & Kibwezi",
      },
      {
        property: "og:description",
        content:
          "Three siblings. Zero investors. Pure grit. From 4 beehives in Kibwezi to precision pollination powered by IoT, AI, and global partnerships across Makueni, Kenya.",
      },
    ],
  }),
  component: About,
});
