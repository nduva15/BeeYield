import { createFileRoute } from "@tanstack/react-router";
import Media from "@/pages/Media";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Field Media & 105 Acres | BeeYield - Your Partner in Pollination" },
      {
        name: "description",
        content:
          "Photographic proof and verified dispatches across 105 acres and counting in Makueni County. Featuring our partner farmers across Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni, and Ndeini areas.",
      },
      {
        property: "og:title",
        content: "Field Media & 105 Acres and Counting | BeeYield",
      },
      {
        property: "og:description",
        content:
          "Photographic proof and verified dispatches across 105 acres and counting in Makueni County. Featuring our partner farmers across Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni, and Ndeini areas.",
      },
    ],
  }),
  component: Media,
});
