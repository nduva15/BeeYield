import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "BeeYield | Precision Pollination & Honey Traceability in Makueni & Kibwezi" },
      {
        name: "description",
        content:
          "The BeeYield story: three siblings grew from 4 hives on ¼ acre to 184 hives, 22 IoT devices, 95 acres pollinated, and 988 kg of honey sold in Kibwezi & Makueni, Kenya — all with zero external funding.",
      },
    ],
  }),
  component: About,
});
