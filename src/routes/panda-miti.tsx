import { createFileRoute } from "@tanstack/react-router";
import PandaMitiPage from "@/pages/PandaMiti";

export const Route = createFileRoute("/panda-miti")({
  head: () => ({
    meta: [
      { title: "Panda Miti Initiative — 45,000 Trees for Kibwezi | BeeYield" },
      {
        name: "description",
        content:
          "Panda Miti (Plant Trees): BeeYield's ecological mission to plant 45,000 indigenous and bee-forage trees around Kibwezi Basin, Makueni County, Kenya. 2,500 trees planted so far.",
      },
      {
        property: "og:title",
        content: "Panda Miti Initiative — 45,000 Trees for Kibwezi | BeeYield",
      },
      {
        property: "og:description",
        content:
          "Reforesting Kibwezi with 45,000 indigenous trees to revive aquifers, combat desertification, and guarantee perennial acacia bee pastures.",
      },
    ],
  }),
  component: PandaMitiPage,
});
