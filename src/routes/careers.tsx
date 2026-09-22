import { createFileRoute } from "@tanstack/react-router";
import CareersPage from "@/pages/Careers";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Join BeeYield | Precision Beekeeping & Ecological Tech" },
      {
        name: "description",
        content:
          "Join the team building the future of precision apiculture in Africa. View active engineering, agronomy, and field operations roles in Kenya.",
      },
      {
        property: "og:title",
        content: "Careers — Join BeeYield | Precision Beekeeping & Ecological Tech",
      },
      {
        property: "og:description",
        content:
          "Join BeeYield: building precision apiculture, IoT hive sensors, and ecological corridors in Kibwezi & Makueni, Kenya.",
      },
    ],
  }),
  component: CareersPage,
});
