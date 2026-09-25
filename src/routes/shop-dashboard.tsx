import { createFileRoute } from "@tanstack/react-router";
import ShopDashboardPage from "@/pages/ShopDashboard";

export const Route = (createFileRoute as any)("/shop-dashboard")({
  head: () => ({
    meta: [
      { title: "Shop Dashboard & E-Commerce — BeeYield" },
      {
        name: "description",
        content:
          "Manage direct honey harvest orders, IoT sensor hardware, deliveries, payments, and 843kg batch traceability with BeeYield Shop Dashboard.",
      },
      { property: "og:title", content: "BeeYield Shop Dashboard" },
    ],
  }),
  component: ShopDashboardPage,
});
