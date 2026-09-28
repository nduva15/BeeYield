import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-shop-user-id, x-backend",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const Route = createFileRoute("/api/shop/wishlist/$id")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },

      POST: async ({ params }) => {
        return new Response(
          JSON.stringify({
            success: true,
            status: "success",
            productId: (params as any)?.id,
            action: "added",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      },

      DELETE: async ({ params }) => {
        return new Response(
          JSON.stringify({
            success: true,
            status: "success",
            productId: (params as any)?.id,
            action: "removed",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      },
    },
  },
});
