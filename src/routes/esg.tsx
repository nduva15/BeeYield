import { createFileRoute } from "@tanstack/react-router";
import ESG from "@/pages/ESG";

export const Route = createFileRoute("/esg")({
  head: () => ({
    meta: [
      { title: "ESG & Sustainability Framework — Panda Miti & Apiculture | BeeYield" },
      {
        name: "description",
        content:
          "The BeeYield ESG framework: Environmental stewardship through Project Panda Miti (45,000 trees), social inclusion of youth beekeepers, and verified hive telemetry.",
      },
    ],
  }),
  component: ESG,
});
