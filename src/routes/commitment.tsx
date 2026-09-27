import { createFileRoute } from "@tanstack/react-router";
import CommitmentPage from "@/pages/Commitment";

export const Route = createFileRoute("/commitment")({
  head: () => ({
    meta: [
      { title: "Our Commitment to the Future — UN SDGs & Panda Miti | BeeYield" },
      {
        name: "description",
        content:
          "BeeYield's commitment across 8 UN Sustainable Development Goals, including Project Panda Miti: 45,000 trees for Kibwezi, bee forage sanctuaries, and food security.",
      },
    ],
  }),
  component: CommitmentPage,
});
