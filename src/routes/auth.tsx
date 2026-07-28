import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Beeyield" },
      {
        name: "description",
        content:
          "Sign in or create your Beeyield account to sync apiaries, hives, devices and harvest forecasts across your phone and desktop.",
      },
      { property: "og:title", content: "Sign in — Beeyield" },
      {
        property: "og:description",
        content: "Sign in to Beeyield to sync your apiaries, hives and harvest forecasts.",
      },
    ],
  }),
  component: Auth,
});
