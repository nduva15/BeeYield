import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        name: "description",
        content: "BeeYield — AI-powered beekeeping assistant, hive health monitoring, pollination planning, and apiary intelligence platform.",
      },
      { property: "og:title", content: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        property: "og:description",
        content: "BeeYield — AI-powered beekeeping assistant, hive health monitoring, pollination planning, and apiary intelligence platform.",
      },
    ],
  }),
  component: Index,
});
