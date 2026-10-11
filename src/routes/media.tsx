import { createFileRoute } from "@tanstack/react-router";
import Media from "@/pages/Media";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Field Media & 105 Acres | BeeYield - Your Partner in Pollination" },
      {
        name: "description",
        content:
          "BeeYield at work during the mango and citrus blooms across 105 acres and counting in Makueni County. We pollinate mango, oranges, citrus, maize, vegetables, beans and sunflower with partner farmers in Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni and Ndeini.",
      },
      {
        property: "og:title",
        content: "Field Media & 105 Acres and Counting | BeeYield",
      },
      {
        property: "og:description",
        content:
          "BeeYield at work during the mango and citrus blooms across 105 acres and counting in Makueni County. We pollinate mango, oranges, citrus, maize, vegetables, beans and sunflower with partner farmers in Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni and Ndeini.",
      },
    ],
  }),
  component: Media,
});
