import { createFileRoute } from "@tanstack/react-router";
import BlogsPage from "@/pages/Blogs";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "BeeYield Blogs | Field Agronomy & Precision Pollination Journal" },
      {
        name: "description",
        content:
          "Agronomy dispatches, mango blossom science, and precision pollinator protection field notes from Makueni & Kibwezi, Kenya. Written by BeeYield founder Timothy Mathuva.",
      },
      {
        property: "og:title",
        content: "BeeYield Blogs | Field Agronomy & Precision Pollination Journal",
      },
      {
        property: "og:description",
        content:
          "Agronomy dispatches, mango blossom science, and precision pollinator protection field notes from Makueni & Kibwezi, Kenya. Written by BeeYield founder Timothy Mathuva.",
      },
      {
        property: "og:image",
        content: "/images/blog/mango-tree-full-bloom.jpg",
      },
    ],
  }),
  component: BlogsPage,
});
