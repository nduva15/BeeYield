import { createFileRoute } from "@tanstack/react-router";
import OurStory from "@/pages/OurStory";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — BeeYield | From 4 Hives to 184 in Makueni, Kenya" },
      {
        name: "description",
        content:
          "The BeeYield story: three siblings grew from 4 hives on ¼ acre to 184 hives, 22 IoT devices, 95 acres pollinated, and 988 kg of honey sold — all with zero external funding. Year-by-year journey from 2020 to 2026.",
      },
      {
        property: "og:title",
        content: "Our Story — BeeYield | From 4 Hives to 184 in Makueni, Kenya",
      },
      {
        property: "og:description",
        content:
          "Three siblings. Zero investors. Pure grit. From 4 beehives to precision pollination powered by IoT, AI, and global partnerships.",
      },
    ],
  }),
  component: OurStory,
});
