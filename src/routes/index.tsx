import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        name: "description",
        content:
          "Beeyield combines BeeGPT AI guidance with harvest forecasting, hive placement mapping, varroa simulation, bloom phenology and colony alerts for modern beekeepers.",
      },
      { property: "og:title", content: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        property: "og:description",
        content:
          "AI beekeeping assistant with harvest forecasting, hive placement mapping, varroa simulation and colony alerts.",
      },
    ],
  }),
  component: Index,
});
