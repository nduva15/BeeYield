import { supabaseShop, isDedicatedShopBackendConfigured } from "@/lib/supabase";
import type { PaymentMethod } from "./shopService";

export interface ShopCard {
  id: string;
  user_id?: string;
  type: "card" | "shop_honey_card" | "mpesa";
  provider: string; // "Visa" | "Mastercard" | "BeeYield Honey Card" | "M-Pesa"
  brand: string;
  last4: string;
  cardNumberMasked?: string;
  cardNumberFull?: string;
  card_holder_name: string;
  expiry: string;
  expiry_month?: number;
  expiry_year?: number;
  cvvMasked?: string;
  is_default: boolean;
  status: "active" | "frozen";
  balance_kes?: number;
  spending_limit_kes?: number;
  tier?: "Gold Member" | "Wholesale Partner" | "Standard Forager";
  created_at?: string;
  backend_source?: "supabase_shop" | "api_shop_backend" | "local_vault";
}

const STORAGE_KEY_SHOP_CARDS = "shop_vaulted_cards";
const STORAGE_KEY_SHOP_BALANCE = "shop_card_balance_kes";

const DEFAULT_SHOP_CARDS: ShopCard[] = [];

export function getLocalShopCards(): ShopCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOP_CARDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (c: any) =>
            !c?.id?.includes("honey_gold_01") &&
            !c?.id?.includes("visa_retail_02") &&
            c?.card_holder_name !== "Grace Wanjiku"
        )
      : [];
    if (cleaned.length !== (parsed?.length || 0)) {
      localStorage.setItem(STORAGE_KEY_SHOP_CARDS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveLocalShopCards(cards: ShopCard[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SHOP_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.warn("Failed to persist shop cards to local storage:", e);
  }
}

/**
 * Fetch cards for the current shop user using the dedicated Shop Backend and Supabase Shop Database
 */
export async function getShopCards(shopUserId?: string): Promise<ShopCard[]> {
  const localCards = getLocalShopCards();
  const cardMap = new Map<string, ShopCard>();
  localCards.forEach((c) => cardMap.set(c.id, c));

  // 1. Try Dedicated Shop Backend API endpoint
  try {
    const res = await fetch("/api/shop/cards", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shop-User-Id": shopUserId || "",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.cards) && data.cards.length > 0) {
        data.cards.forEach((card: ShopCard) => {
          cardMap.set(card.id, { ...card, backend_source: "api_shop_backend" });
        });
      }
    }
  } catch {
    // Backend API fetch failed; proceed to direct Supabase database
  }

  // 2. Query Dedicated Supabase Shop Database
  try {
    // A. Query Supabase Shop `shop_cards` or `payment_methods` table
    const { data: dbCards, error: dbErr } = await (supabaseShop as any)
      .from("shop_cards")
      .select("*")
      .order("is_default", { ascending: false });

    if (!dbErr && Array.isArray(dbCards) && dbCards.length > 0) {
      dbCards.forEach((row: any) => {
        cardMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          type: row.type || "card",
          provider: row.provider || row.brand || "Card",
          brand: row.brand || row.provider || "Visa",
          last4: row.last4 || "4242",
          cardNumberMasked: `•••• •••• •••• ${row.last4 || "4242"}`,
          card_holder_name: row.card_holder_name || "Shop Customer",
          expiry: row.expiry || "12/28",
          expiry_month: row.expiry_month,
          expiry_year: row.expiry_year,
          is_default: Boolean(row.is_default),
          status: row.status === "frozen" ? "frozen" : "active",
          balance_kes: Number(row.balance_kes) || 0,
          spending_limit_kes: Number(row.spending_limit_kes) || 100000,
          tier: row.tier || "Gold Member",
          created_at: row.created_at,
          backend_source: "supabase_shop",
        });
      });
    }

    // B. Check Supabase Shop auth metadata
    const { data: authData } = await supabaseShop.auth.getUser();
    if (authData?.user?.user_metadata?.shop_cards) {
      const metaCards = authData.user.user_metadata.shop_cards;
      if (Array.isArray(metaCards)) {
        metaCards.forEach((c: ShopCard) => cardMap.set(c.id, c));
      }
    }
  } catch (err) {
    console.warn("Direct Supabase Shop DB query error:", err);
  }

  const result = Array.from(cardMap.values()).sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  saveLocalShopCards(result);
  return result;
}

/**
 * Add a new card into the Shop Database & Backend
 */
export async function addShopCard(cardInput: Partial<ShopCard>): Promise<ShopCard> {
  const rawNumber = (cardInput.cardNumberFull || cardInput.cardNumberMasked || "").replace(/\s+/g, "");
  const last4 = rawNumber.length >= 4 ? rawNumber.slice(-4) : cardInput.last4 || "4242";

  let brand = cardInput.brand || cardInput.provider;
  if (rawNumber) {
    if (/^4/.test(rawNumber)) brand = "Visa";
    else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) brand = "Mastercard";
    else if (/^3[47]/.test(rawNumber)) brand = "American Express";
    else if (/^6(011|5)/.test(rawNumber)) brand = "Discover";
  }
  if (!brand) brand = cardInput.type === "shop_honey_card" ? "BeeYield Pay" : "Visa";

  const newCard: ShopCard = {
    id: cardInput.id || `card_shop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: cardInput.user_id,
    type: cardInput.type || (brand === "BeeYield Pay" ? "shop_honey_card" : "card"),
    provider: brand === "BeeYield Pay" ? "BeeYield Honey Card" : brand,
    brand,
    last4,
    cardNumberMasked: `•••• •••• •••• ${last4}`,
    cardNumberFull: rawNumber || `4242 0000 0000 ${last4}`,
    card_holder_name: cardInput.card_holder_name || "Valued Shop Customer",
    expiry: cardInput.expiry || "12/28",
    expiry_month: cardInput.expiry_month || 12,
    expiry_year: cardInput.expiry_year || 2028,
    cvvMasked: "•••",
    is_default: Boolean(cardInput.is_default),
    status: "active",
    balance_kes: cardInput.balance_kes ?? 10000,
    spending_limit_kes: cardInput.spending_limit_kes ?? 100000,
    tier: cardInput.tier || "Gold Member",
    created_at: new Date().toISOString(),
    backend_source: isDedicatedShopBackendConfigured ? "supabase_shop" : "local_vault",
  };

  // 1. Send to Shop Backend API
  try {
    await fetch("/api/shop/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card: newCard }),
    });
  } catch {
    // API endpoint might be offline; continue to database
  }

  // 2. Persist directly into Supabase Shop Database
  try {
    await (supabaseShop as any).from("shop_cards").insert([
      {
        id: newCard.id,
        user_id: newCard.user_id,
        type: newCard.type,
        provider: newCard.provider,
        brand: newCard.brand,
        last4: newCard.last4,
        card_holder_name: newCard.card_holder_name,
        expiry: newCard.expiry,
        is_default: newCard.is_default,
        status: newCard.status,
        balance_kes: newCard.balance_kes,
        spending_limit_kes: newCard.spending_limit_kes,
        tier: newCard.tier,
      },
    ]);
  } catch (_) {
    // Table may not exist yet in cloud Postgres; metadata fallback below handles it
  }

  // 3. Persist to Supabase Shop User Metadata
  try {
    const { data: authData } = await supabaseShop.auth.getUser();
    if (authData?.user) {
      const existing = authData.user.user_metadata?.shop_cards || [];
      const updated = [newCard, ...existing.filter((c: any) => c.id !== newCard.id)];
      await supabaseShop.auth.updateUser({
        data: { shop_cards: updated },
      });
    }
  } catch (_) {}

  // 4. Update isolated local storage
  const current = getLocalShopCards();
  const adjusted = newCard.is_default ? current.map((c) => ({ ...c, is_default: false })) : current;
  const nextList = [newCard, ...adjusted.filter((c) => c.id !== newCard.id)];
  saveLocalShopCards(nextList);

  return newCard;
}

/**
 * Top up / deposit funds into the shop card balance in the database
 */
export async function topUpShopCardBalance(cardId: string, amountKes: number): Promise<ShopCard | null> {
  const cards = getLocalShopCards();
  const target = cards.find((c) => c.id === cardId);
  if (!target) return null;

  const newBalance = (target.balance_kes || 0) + amountKes;
  const updatedCard: ShopCard = {
    ...target,
    balance_kes: newBalance,
  };

  // 1. Backend API
  try {
    await fetch("/api/shop/cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, action: "top_up", amountKes, balance_kes: newBalance }),
    });
  } catch (_) {}

  // 2. Supabase Shop Database
  try {
    await (supabaseShop as any)
      .from("shop_cards")
      .update({ balance_kes: newBalance })
      .eq("id", cardId);
  } catch (_) {}

  // 3. Local state
  const updatedList = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveLocalShopCards(updatedList);

  return updatedCard;
}

/**
 * Toggle freeze / active status on the card in the database
 */
export async function toggleFreezeShopCard(cardId: string): Promise<ShopCard | null> {
  const cards = getLocalShopCards();
  const target = cards.find((c) => c.id === cardId);
  if (!target) return null;

  const nextStatus: "active" | "frozen" = target.status === "frozen" ? "active" : "frozen";
  const updatedCard: ShopCard = { ...target, status: nextStatus };

  // 1. Backend API
  try {
    await fetch("/api/shop/cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, action: "toggle_status", status: nextStatus }),
    });
  } catch (_) {}

  // 2. Supabase Shop Database
  try {
    await (supabaseShop as any)
      .from("shop_cards")
      .update({ status: nextStatus })
      .eq("id", cardId);
  } catch (_) {}

  // 3. Local state
  const updatedList = cards.map((c) => (c.id === cardId ? updatedCard : c));
  saveLocalShopCards(updatedList);

  return updatedCard;
}

/**
 * Set a card as default in the Shop Database
 */
export async function setDefaultShopCard(cardId: string): Promise<ShopCard[]> {
  const cards = getLocalShopCards();
  const updatedList = cards.map((c) => ({
    ...c,
    is_default: c.id === cardId,
  }));

  try {
    await fetch("/api/shop/cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, action: "set_default" }),
    });
  } catch (_) {}

  try {
    await (supabaseShop as any)
      .from("shop_cards")
      .update({ is_default: false })
      .neq("id", cardId);
    await (supabaseShop as any)
      .from("shop_cards")
      .update({ is_default: true })
      .eq("id", cardId);
  } catch (_) {}

  saveLocalShopCards(updatedList);
  return updatedList;
}

/**
 * Delete a card from the Shop Database & Backend
 */
export async function deleteShopCard(cardId: string): Promise<boolean> {
  // 1. Backend API
  try {
    await fetch(`/api/shop/cards?id=${encodeURIComponent(cardId)}`, {
      method: "DELETE",
    });
  } catch (_) {}

  // 2. Supabase Shop Database
  try {
    await (supabaseShop as any).from("shop_cards").delete().eq("id", cardId);
  } catch (_) {}

  // 3. User metadata
  try {
    const { data: authData } = await supabaseShop.auth.getUser();
    if (authData?.user?.user_metadata?.shop_cards) {
      const remaining = authData.user.user_metadata.shop_cards.filter((c: any) => c.id !== cardId);
      await supabaseShop.auth.updateUser({
        data: { shop_cards: remaining },
      });
    }
  } catch (_) {}

  // 4. Local storage
  const cards = getLocalShopCards();
  const filtered = cards.filter((c) => c.id !== cardId);
  saveLocalShopCards(filtered);

  return true;
}

/**
 * Convert ShopCard into shopService's PaymentMethod type for seamless interop
 */
export function toPaymentMethod(card: ShopCard): PaymentMethod {
  return {
    id: card.id,
    type: card.type === "mpesa" ? "mpesa" : "card",
    provider: card.provider,
    brand: card.brand,
    last4: card.last4,
    expiry: card.expiry,
    expiry_month: card.expiry_month,
    expiry_year: card.expiry_year,
    card_holder_name: card.card_holder_name,
    is_default: card.is_default,
    status: card.status,
    created_at: card.created_at,
  };
}
