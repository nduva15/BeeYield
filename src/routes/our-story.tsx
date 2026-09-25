import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story | BeeYield - Your Partner in Pollination" },
      {
        name: "description",
        content:
          "The BeeYield story: three siblings grew from 4 hives on ¼ acre to 184 hives, 22 IoT devices, 105 and counting acres pollinated, and 988 kg of honey sold in Kibwezi & Makueni, Kenya — all with zero external funding.",
      },
    ],
  }),
  component: About,
});
