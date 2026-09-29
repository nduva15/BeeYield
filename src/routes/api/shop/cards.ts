import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-shop-user-id, x-backend",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// In-memory server database store for shop cards (partitioned from beeyield apiary)
interface ServerShopCard {
  id: string;
  user_id?: string;
  type: string;
  provider: string;
  brand: string;
  last4: string;
  cardNumberMasked: string;
  card_holder_name: string;
  expiry: string;
  is_default: boolean;
  status: "active" | "frozen";
  balance_kes: number;
  spending_limit_kes: number;
  tier: string;
  created_at: string;
}

const serverShopCardDb: Map<string, ServerShopCard> = new Map();

export const Route = createFileRoute("/api/shop/cards")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },

      // GET: Retrieve vaulted cards from the dedicated shop database
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const userId = request.headers.get("x-shop-user-id") || url.searchParams.get("userId");

          const allCards = Array.from(serverShopCardDb.values());
          const filtered = userId
            ? allCards.filter((c) => !c.user_id || c.user_id === userId)
            : allCards;

          return new Response(
            JSON.stringify({
              success: true,
              backend: "shop_dedicated_database",
              cards: filtered,
              total_balance_kes: filtered.reduce((acc, c) => acc + (c.balance_kes || 0), 0),
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || "Internal error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      },

      // POST: Vault a new card in the dedicated shop database
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const cardData = body.card || body;

          const rawNumber = String(cardData.cardNumber || cardData.cardNumberFull || "").replace(/\s+/g, "");
          const last4 = rawNumber.length >= 4 ? rawNumber.slice(-4) : cardData.last4 || "4242";

          let brand = cardData.brand || cardData.provider;
          if (rawNumber) {
            if (/^4/.test(rawNumber)) brand = "Visa";
            else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) brand = "Mastercard";
            else if (/^3[47]/.test(rawNumber)) brand = "American Express";
            else if (/^6(011|5)/.test(rawNumber)) brand = "Discover";
          }
          if (!brand) brand = cardData.type === "shop_honey_card" ? "BeeYield Pay" : "Visa";

          const id = cardData.id || `shop_card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newCard: ServerShopCard = {
            id,
            user_id: cardData.user_id || "shop_active_customer",
            type: cardData.type || (brand === "BeeYield Pay" ? "shop_honey_card" : "card"),
            provider: brand === "BeeYield Pay" ? "BeeYield Honey Card" : brand,
            brand,
            last4,
            cardNumberMasked: `•••• •••• •••• ${last4}`,
            card_holder_name: cardData.card_holder_name || "Valued Shop Customer",
            expiry: cardData.expiry || "12/28",
            is_default: Boolean(cardData.is_default),
            status: "active",
            balance_kes: Number(cardData.balance_kes) || 12000,
            spending_limit_kes: Number(cardData.spending_limit_kes) || 100000,
            tier: cardData.tier || "Gold Member",
            created_at: new Date().toISOString(),
          };

          if (newCard.is_default) {
            serverShopCardDb.forEach((c) => {
              c.is_default = false;
            });
          }

          serverShopCardDb.set(id, newCard);

          return new Response(
            JSON.stringify({
              success: true,
              message: "Card vaulted successfully in dedicated shop database",
              card: newCard,
            }),
            {
              status: 201,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || "Invalid card payload" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      },

      // PUT: Update card status, balance (top up), or set default
      PUT: async ({ request }) => {
        try {
          const body = await request.json();
          const { cardId, action, amountKes, status } = body;

          const existing = serverShopCardDb.get(cardId);
          if (!existing) {
            return new Response(
              JSON.stringify({ success: false, error: "Card not found in shop database" }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          if (action === "top_up" && typeof amountKes === "number") {
            existing.balance_kes = (existing.balance_kes || 0) + amountKes;
          } else if (action === "toggle_status" && status) {
            existing.status = status;
          } else if (action === "set_default") {
            serverShopCardDb.forEach((c) => {
              c.is_default = false;
            });
            existing.is_default = true;
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "Shop card updated successfully",
              card: existing,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || "Update failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      },

      // DELETE: Delete a card from the dedicated shop database
      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const cardId = url.searchParams.get("id");

          if (!cardId || !serverShopCardDb.has(cardId)) {
            return new Response(
              JSON.stringify({ success: false, error: "Card ID missing or not found" }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          serverShopCardDb.delete(cardId);

          return new Response(
            JSON.stringify({
              success: true,
              message: "Card removed from dedicated shop database",
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || "Deletion error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
