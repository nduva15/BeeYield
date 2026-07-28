import { createFileRoute } from "@tanstack/react-router";
import SharedRun from "@/pages/SharedRun";

export const Route = createFileRoute("/shared-run/$id")({
  head: () => ({
    meta: [
      { title: "Shared harvest forecast — Beeyield" },
      {
        name: "description",
        content:
          "Review a shared Beeyield harvest forecast: yield estimates, assumptions, site layout and partner comments.",
      },
      { property: "og:title", content: "Shared harvest forecast — Beeyield" },
      {
        property: "og:description",
        content: "Review a shared Beeyield harvest forecast with assumptions, layout and comments.",
      },
    ],
  }),
  component: SharedRun,
});
