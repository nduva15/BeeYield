import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        name: "description",
        content: "Your partner in pollination",
      },
      { property: "og:title", content: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        property: "og:description",
        content: "Your partner in pollination",
      },
    ],
  }),
  component: Index,
});
