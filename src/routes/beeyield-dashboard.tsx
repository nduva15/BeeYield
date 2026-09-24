import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/beeyield-dashboard")({
  head: () => ({
    meta: [
      { title: "BeeYield Dashboard — AI Beekeeping Assistant & Apiary Tools" },
      {
        name: "description",
        content:
          "BeeYield combines BeeGPT AI guidance with harvest forecasting, hive placement mapping, varroa simulation, bloom phenology and colony alerts for modern beekeepers.",
      },
      { property: "og:title", content: "BeeYield Dashboard" },
    ],
  }),
  component: Index,
});
