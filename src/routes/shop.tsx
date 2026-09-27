import { createFileRoute } from "@tanstack/react-router";
import ShopDashboardPage from "@/pages/ShopDashboard";

export const Route = (createFileRoute as any)("/shop")({
  head: () => ({
    meta: [
      { title: "Shop & E-Commerce — BeeYield" },
      {
        name: "description",
        content:
          "Direct honey harvest orders, IoT sensor hardware, deliveries, payments, and 843kg batch traceability with BeeYield.",
      },
      { property: "og:title", content: "BeeYield Shop" },
    ],
  }),
  component: ShopDashboardPage,
});
