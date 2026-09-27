import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        name: "description",
        content: "BeeYield Precision Pollination & Colony Defense. Combatting African bee decline (21.3% Sub-Saharan colony loss, 45% Kenya/Uganda peaks) to secure food systems.",
      },
      { property: "og:title", content: "Beeyield — AI Beekeeping Assistant & Apiary Tools" },
      {
        property: "og:description",
        content: "BeeYield Precision Pollination & Colony Defense. Combatting African bee decline (21.3% Sub-Saharan colony loss, 45% Kenya/Uganda peaks) to secure food systems.",
      },
    ],
  }),
  component: Index,
});
