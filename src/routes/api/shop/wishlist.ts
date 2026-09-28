import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-shop-user-id, x-backend",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const Route = createFileRoute("/api/shop/wishlist")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },

      GET: async () => {
        return new Response(
          JSON.stringify({
            success: true,
            wishlist: [],
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      },

      POST: async () => {
        return new Response(
          JSON.stringify({
            success: true,
            status: "success",
            message: "Wishlist updated",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      },

      DELETE: async () => {
        return new Response(
          JSON.stringify({
            success: true,
            status: "success",
            message: "Wishlist item removed",
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
