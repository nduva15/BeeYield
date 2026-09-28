import { createFileRoute } from "@tanstack/react-router";
import ShopDashboardPage from "@/pages/ShopDashboard";

export const Route = (createFileRoute as any)("/shop")({
  head: () => ({
    meta: [
      { title: "Shop & E-Commerce — BeeYield" },
      {
        name: "description",
        content:
          "Direct honey orders, IoT sensor hardware, deliveries, and payments with BeeYield.",
      },
      { property: "og:title", content: "BeeYield Shop" },
    ],
  }),
  component: ShopDashboardPage,
});
