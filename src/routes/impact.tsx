import { createFileRoute } from "@tanstack/react-router";
import Impact from "@/pages/Impact";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Biosphere Impact — Project Panda Miti & Precision Pollination | BeeYield" },
      {
        name: "description",
        content:
          "Real-time biosensor telemetry, precision pollination across 105+ acres, and Project Panda Miti restoring 45,000 indigenous trees to save bees from famine.",
      },
    ],
  }),
  component: Impact,
});
