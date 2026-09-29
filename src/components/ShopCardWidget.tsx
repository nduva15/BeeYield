import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCard,
  Plus,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Database,
  Layers,
  Zap,
  Calendar,
  User,
  Check,
  X,
  Loader2,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import {
  ShopCard,
  getShopCards,
  addShopCard,
  topUpShopCardBalance,
  toggleFreezeShopCard,
  setDefaultShopCard,
  deleteShopCard,
} from "@/services/shopCardService";
import { useShopAuth } from "@/hooks/use-shop-auth";

const detectCardBrand = (cardNumber: string) => {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^4/.test(clean)) return { name: "Visa", badge: "VISA", bg: "from-blue-700 via-indigo-900 to-slate-950", accent: "text-blue-400" };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: "Mastercard", badge: "MASTERCARD", bg: "from-rose-700 via-amber-900 to-slate-950", accent: "text-amber-400" };
  if (/^3[47]/.test(clean)) return { name: "Amex", badge: "AMEX", bg: "from-emerald-700 via-teal-900 to-slate-950", accent: "text-emerald-400" };
  if (/^6(011|5)/.test(clean)) return { name: "Discover", badge: "DISCOVER", bg: "from-orange-700 via-amber-900 to-slate-950", accent: "text-orange-400" };
  return { name: "Shop Vault Card", badge: "SHOP VAULT", bg: "from-emerald-950 via-slate-950 to-stone-900", accent: "text-emerald-400" };
};

interface ShopCardWidgetProps {
  onCardSelect?: (card: ShopCard) => void;
  className?: string;
  compact?: boolean;
}

export default function ShopCardWidget({
  onCardSelect,
  className = "",
  compact = false,
}: ShopCardWidgetProps) {
  const { shopUser, isShopAuthenticated } = useShopAuth();
  const [cards, setCards] = useState<ShopCard[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(2500);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // New Card Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showModalCvv, setShowModalCvv] = useState(false);
  const [newCardData, setNewCardData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
    type: "shop_honey_card" as "shop_honey_card" | "card",
    isDefault: false,
  });

  const newCardBrand = useMemo(() => detectCardBrand(newCardData.cardNumber), [newCardData.cardNumber]);

  const openAddCardModal = () => {
    setNewCardData({
      cardNumber: "",
      cardHolder: shopUser?.full_name || "",
      expiry: "",
      cvv: "",
      type: "shop_honey_card",
      isDefault: cards.length === 0,
    });
    setShowModalCvv(false);
    setIsAddModalOpen(true);
  };

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await getShopCards(shopUser?.id);
      setCards(fetched);
      setSelectedCardIndex((prev) => (fetched.length > 0 && prev >= fetched.length ? 0 : prev));
    } catch {
      toast.error("Could not sync cards with shop database");
    } finally {
      setIsLoading(false);
    }
  }, [shopUser?.id]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const activeCard: ShopCard | undefined = cards[selectedCardIndex] || cards[0];

  const handleTopUp = async (amount: number) => {
    if (!activeCard) return;
    setIsProcessingAction(true);
    try {
      const updated = await topUpShopCardBalance(activeCard.id, amount);
      if (updated) {
        toast.success(`KES ${amount.toLocaleString()} deposited to ${activeCard.provider}! 🍯`);
        setIsTopUpOpen(false);
        await loadCards();
      }
    } catch {
      toast.error("Failed to process deposit");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!activeCard) return;
    setIsProcessingAction(true);
    try {
      const updated = await toggleFreezeShopCard(activeCard.id);
      if (updated) {
        toast.info(
          updated.status === "frozen"
            ? `Card ${activeCard.last4} has been frozen.`
            : `Card ${activeCard.last4} is now active.`
        );
        await loadCards();
      }
    } catch {
      toast.error("Failed to update card status");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSetDefault = async () => {
    if (!activeCard || activeCard.is_default) return;
    setIsProcessingAction(true);
    try {
      await setDefaultShopCard(activeCard.id);
      toast.success("Default payment card updated in shop database");
      await loadCards();
    } catch {
      toast.error("Failed to set default card");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!activeCard) return;
    if (cards.length <= 1) {
      toast.error("You must keep at least one vaulted shop card");
      return;
    }
    if (!window.confirm(`Delete card ending in •••• ${activeCard.last4} from shop database?`)) return;

    setIsProcessingAction(true);
    try {
      await deleteShopCard(activeCard.id);
      toast.success("Card removed from shop database");
      setSelectedCardIndex(0);
      await loadCards();
    } catch {
      toast.error("Failed to delete card");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNumber = newCardData.cardNumber.replace(/\s+/g, "");
    if (rawNumber.length < 15 || rawNumber.length > 19) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    if (!newCardData.expiry || !newCardData.expiry.includes("/")) {
      toast.error("Please enter card expiry in MM/YY format (e.g. 12/28)");
      return;
    }
    const [mStr, yStr] = newCardData.expiry.split("/");
    const m = parseInt(mStr, 10);
    const y = parseInt(yStr, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      toast.error("Expiry month must be between 01 and 12");
      return;
    }
    if (isNaN(y)) {
      toast.error("Please enter a valid 2-digit expiry year");
      return;
    }
    if (!newCardData.cvv || newCardData.cvv.length < 3) {
      toast.error("Please enter a valid 3 or 4-digit CVV code");
      return;
    }
    if (!newCardData.cardHolder.trim()) {
      toast.error("Please enter the name on the card");
      return;
    }

    setIsProcessingAction(true);
    try {
      await addShopCard({
        cardNumberFull: newCardData.cardNumber,
        card_holder_name: newCardData.cardHolder.trim() || shopUser?.full_name || "Valued Shop Customer",
        expiry: newCardData.expiry,
        type: newCardData.type,
        is_default: newCardData.isDefault,
        user_id: shopUser?.id,
      });

      toast.success("Card securely vaulted in shop database! 💳");
      setIsAddModalOpen(false);
      setNewCardData({
        cardNumber: "",
        cardHolder: "",
        expiry: "",
        cvv: "",
        type: "shop_honey_card",
        isDefault: false,
      });
      setShowModalCvv(false);
      await loadCards();
    } catch {
      toast.error("Failed to save card to database");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-emerald-500/30 bg-card/95 backdrop-blur-md shadow-lg overflow-hidden transition-all ${className}`}
    >
      {/* Header with Database Isolation Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-gradient-to-r from-emerald-950/20 via-card to-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-honey/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                Shop Customer Card & Wallet
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" /> Dedicated DB
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Isolated Shop Backend card vault · Independent from Apiary telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddCardModal}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
          <button
            type="button"
            onClick={() => void loadCards()}
            disabled={isLoading}
            className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Refresh Card State from Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        <div className="grid lg:grid-cols-12 gap-5 items-center">
          {/* DIGITAL CARD PREVIEW (Col 1-7) */}
          <div className="lg:col-span-7">
            {activeCard ? (
              <div
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-2xl transition-all border ${
                  activeCard.status === "frozen"
                    ? "bg-gradient-to-tr from-slate-900 via-gray-900 to-slate-950 border-amber-500/40 opacity-90"
                    : activeCard.type === "shop_honey_card"
                      ? "bg-gradient-to-tr from-emerald-950 via-slate-950 to-emerald-900 border-emerald-500/40"
                      : "bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/40"
                }`}
              >
                {/* Glow & Honeycomb Background Elements */}
                <div className="absolute -top-14 -right-14 w-44 h-44 bg-honey/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-14 -left-14 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Top Row: Chip, Brand & Status */}
                <div className="relative z-10 flex items-center justify-between pb-5">
                  <div className="flex items-center gap-3">
                    {/* Realistic Gold EMV Chip */}
                    <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300 shadow-md flex items-center justify-center">
                      <div className="w-9 h-6 border border-amber-800/40 rounded flex items-center justify-center">
                        <div className="w-5 h-4 border-r border-l border-amber-800/40" />
                      </div>
                    </div>

                    {/* Contactless Signal Icon */}
                    <Zap className="w-4 h-4 text-emerald-400 opacity-80" />

                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-400">
                      {activeCard.tier || "Gold Member"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeCard.is_default && (
                      <span className="px-2 py-0.5 rounded-full bg-honey/20 border border-honey/40 text-[9px] font-bold text-honey">
                        DEFAULT
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        activeCard.status === "frozen"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      ● {activeCard.status}
                    </span>
                  </div>
                </div>

                {/* Card Number & Reveal Action */}
                <div className="relative z-10 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg sm:text-2xl font-bold tracking-widest text-slate-100 drop-shadow">
                      {showFullNumber
                        ? activeCard.cardNumberFull || `4242 8901 2345 ${activeCard.last4}`
                        : activeCard.cardNumberMasked || `•••• •••• •••• ${activeCard.last4}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullNumber(!showFullNumber)}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                      title={showFullNumber ? "Hide number" : "Reveal full number"}
                    >
                      {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Cardholder & Expiry Row */}
                <div className="relative z-10 flex items-end justify-between pt-3 text-xs border-t border-white/10">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Cardholder</span>
                    <span className="font-bold tracking-wide uppercase truncate max-w-[200px] block text-slate-200">
                      {activeCard.card_holder_name || shopUser?.full_name || "VALUED SHOP CUSTOMER"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Expires</span>
                    <span className="font-mono font-bold text-slate-200">{activeCard.expiry || "12/28"}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Brand</span>
                    <span className="font-bold text-emerald-400">{activeCard.brand || "BeeYield"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-card/60 space-y-2.5">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No cards vaulted in shop database</p>
                <p className="text-xs text-muted-foreground">Add your first credit or debit card for instant checkout.</p>
                <button
                  type="button"
                  onClick={openAddCardModal}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Vault First Card
                </button>
              </div>
            )}

            {/* Card Switcher Carousel Tabs */}
            {cards.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 custom-scroll">
                {cards.map((card, idx) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setSelectedCardIndex(idx);
                      onCardSelect?.(card);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      selectedCardIndex === idx
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      {card.brand} •••• {card.last4}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CARD CONTROLS & WALLET BALANCE (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Balance Card */}
            <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-card to-emerald-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-honey" /> Store Card Balance
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">DATABASE SYNCED</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  KES {(activeCard?.balance_kes || 0).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">Available</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Applicable for honey jars, hive telemetry devices, and wholesale supplies at checkout.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsTopUpOpen(true)}
                disabled={isProcessingAction || activeCard?.status === "frozen"}
                className="p-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span>Top-Up Balance</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFreeze}
                disabled={isProcessingAction || !activeCard}
                className={`p-2.5 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                  activeCard?.status === "frozen"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                    : "bg-muted/40 text-foreground border-border hover:bg-muted"
                }`}
              >
                {activeCard?.status === "frozen" ? (
                  <>
                    <Unlock className="w-4 h-4 text-amber-500" />
                    <span>Unfreeze</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span>Freeze Card</span>
                  </>
                )}
              </button>

              {!activeCard?.is_default && activeCard && (
                <button
                  type="button"
                  onClick={handleSetDefault}
                  disabled={isProcessingAction}
                  className="col-span-2 p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Set as Default Checkout Card</span>
                </button>
              )}

              {cards.length > 1 && activeCard && (
                <button
                  type="button"
                  onClick={handleDeleteCard}
                  disabled={isProcessingAction}
                  className="col-span-2 p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Card from Shop Database</span>
                </button>
              )}
            </div>

            {/* Quick Top-Up Popover */}
            {isTopUpOpen && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-card space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Top-Up Store Card</span>
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleTopUp(amt)}
                      disabled={isProcessingAction}
                      className="px-2 py-1.5 rounded-lg border border-border bg-background hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      +KES {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW SHOP CARD */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-card border border-emerald-500/40 rounded-3xl w-full max-w-lg shadow-2xl relative my-auto max-h-[calc(100vh-2rem)] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-foreground">
            {/* Fixed Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-5 sm:px-6 py-4 bg-muted/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                    Vault New Card
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Shop DB
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Directly isolated in dedicated Shop partition
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-sm transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddCardSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
                {/* Dynamic Live Card Preview */}
                <div
                  className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white shadow-xl bg-gradient-to-tr ${newCardBrand.bg} border border-emerald-500/30 transition-all duration-300`}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300 shadow-inner flex items-center justify-center">
                        <div className="w-6 h-4 border border-amber-800/40 rounded flex items-center justify-center">
                          <div className="w-3 h-2 border-r border-l border-amber-800/40" />
                        </div>
                      </div>
                      <Wifi className="w-3.5 h-3.5 text-white/70 rotate-90" />
                      <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase">
                        BeeYield Vault
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-mono font-black tracking-wider uppercase">
                      {newCardBrand.badge}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <div className="font-mono text-base sm:text-lg font-bold tracking-widest drop-shadow text-white">
                      {newCardData.cardNumber ? newCardData.cardNumber : "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex items-end justify-between text-xs pt-1 border-t border-white/10">
                      <div className="truncate max-w-[200px]">
                        <span className="block text-[8px] uppercase tracking-wider text-white/60">Cardholder</span>
                        <span className="font-semibold tracking-wide uppercase truncate block text-xs">
                          {newCardData.cardHolder || shopUser?.full_name || "CARDHOLDER NAME"}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[8px] uppercase tracking-wider text-white/60">Expires</span>
                        <span className="font-mono font-bold tracking-wider text-xs">
                          {newCardData.expiry || "MM/YY"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5">
                  {/* Card Number Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                        Card Number
                      </label>
                      <span className={`text-[10px] font-mono font-bold uppercase ${newCardBrand.accent}`}>
                        {newCardBrand.name}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        value={newCardData.cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                          setNewCardData({ ...newCardData, cardNumber: formatted });
                        }}
                        className="w-full bg-background border border-border/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider text-foreground placeholder:text-muted-foreground/40 transition-all outline-none"
                        required
                        autoComplete="cc-number"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono font-bold text-muted-foreground uppercase border border-border/60">
                          {newCardBrand.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Name Input */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Timothy Nduva"
                      value={newCardData.cardHolder}
                      onChange={(e) => setNewCardData({ ...newCardData, cardHolder: e.target.value })}
                      className="w-full bg-background border border-border/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 transition-all outline-none"
                      required
                      autoComplete="cc-name"
                    />
                  </div>

                  {/* Expiry & CVV Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={newCardData.expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (val.length >= 3) {
                            val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          }
                          setNewCardData({ ...newCardData, expiry: val });
                        }}
                        className="w-full bg-background border border-border/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/40 transition-all outline-none"
                        required
                        autoComplete="cc-exp"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-500" />
                          CVV / CVC
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">3-4 digits</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showModalCvv ? "text" : "password"}
                          placeholder="•••"
                          maxLength={4}
                          value={newCardData.cvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setNewCardData({ ...newCardData, cvv: val });
                          }}
                          className="w-full bg-background border border-border/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/40 transition-all outline-none"
                          required
                          autoComplete="cc-csc"
                        />
                        <button
                          type="button"
                          onClick={() => setShowModalCvv((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={showModalCvv ? "Hide CVV" : "Show CVV"}
                          tabIndex={-1}
                        >
                          {showModalCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Make Default Toggle */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="makeDefaultCheckbox"
                      checked={newCardData.isDefault}
                      onChange={(e) => setNewCardData({ ...newCardData, isDefault: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-foreground text-xs block">Set as primary default card</span>
                      <span className="text-muted-foreground text-[11px] block mt-0.5">
                        Selected automatically for quick checkout & recurring orders
                      </span>
                    </div>
                  </label>

                  {/* Security Trust Ribbon */}
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="text-[11px] font-medium leading-tight">
                      256-bit AES Vault · PCI-DSS compliant tokenization in dedicated Shop partition
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-border/80 bg-muted/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-muted text-foreground transition-colors font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Vaulting Card...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Save Card to Shop DB</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
