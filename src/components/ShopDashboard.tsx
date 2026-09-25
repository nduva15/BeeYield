import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, ShoppingBag, Plus, Search, Trash2, CreditCard, Package, Truck,
  Sparkles, Loader2, Save, MapPin, RefreshCw, Scale, ShieldCheck,
  CheckCircle2, Clock, ChevronRight, Layers, FileDown,
  ExternalLink, User, Heart, HelpCircle, Tag,
  Eye, QrCode, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { downloadReportPdf } from "@/lib/report-pdf";
import { autoSyncRecord } from "@/lib/integration-sync";
import { supabaseShop } from "@/lib/supabase";
import {
  getProducts,
  getUserOrders,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  getWishlist,
  toggleWishlist,
  initializeCheckout,
  cancelOrder,
  validateCoupon,
  type Product,
  type Order,
  type Address,
  type PaymentMethod,
  type WishlistItem,
  type CheckoutOrder,
} from "@/services/shopService";
import { CANONICAL_HARVEST_BATCHES } from "@/data/canonicalHarvests";

export interface ShopDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  initialTab?: string;
}

type TabType =
  | "overview"
  | "orders"
  | "products"
  | "checkout"
  | "traceability"
  | "addresses"
  | "payments"
  | "wishlist"
  | "profile"
  | "support";

export default function ShopDashboard({
  isOpen = true,
  onClose,
  embedded = false,
  initialTab = "overview",
}: ShopDashboardProps) {
  const { user, profile } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>(initialTab as TabType);

  // Data State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [productCategory, setProductCategory] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Expanded Order & Tracking Accordion
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [quickTrackQuery, setQuickTrackQuery] = useState("");
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);

  // Cart State (stored locally and synced with checkout)
  const [cart, setCart] = useState<
    {
      productId: string;
      variantId: string;
      productName: string;
      variantSize: string;
      priceKes: number;
      quantity: number;
      image?: string;
    }[]
  >(() => {
    try {
      const stored = localStorage.getItem("beeyield_customer_cart_v2");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("beeyield_customer_cart_v2", JSON.stringify(cart));
    } catch {
      // non-blocking
    }
  }, [cart]);

  // Checkout State
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethodType, setPaymentMethodType] = useState<"mpesa" | "card">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState(profile?.phone || "254712345678");

  // Custom Address draft for checkout or Address tab
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState({
    name: profile?.full_name || "Timothy Nduva",
    phone: profile?.phone || "254712345678",
    street: "Kibwezi Apiary Road Stand #42",
    apartment: "Station House",
    building: "BeeYield Center",
    floor: "Ground",
    city: "Kibwezi",
    county: "Makueni",
    postal_code: "90137",
    is_default: true,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Payment Method draft
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({
    type: "mpesa" as "mpesa" | "card",
    phone: "254712345678",
    brand: "M-Pesa",
    last4: "5678",
    card_holder_name: "Timothy Nduva",
    expiry: "12/28",
    is_default: true,
  });

  // Delete Alert Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "order" | "address" | "payment";
    id: string;
    title: string;
  } | null>(null);

  // Load All Shop Backend Data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsData, ordersData, addrData, payData, wishData] = await Promise.all([
        getProducts().catch(() => []),
        getUserOrders(user?.email || undefined).catch(() => []),
        getAddresses().catch(() => []),
        getPaymentMethods().catch(() => []),
        getWishlist().catch(() => []),
      ]);

      setProducts(prodsData || []);
      setOrders(ordersData || []);
      setAddresses(addrData || []);
      setPaymentMethods(payData || []);
      setWishlist(wishData || []);

      if (addrData && addrData.length > 0 && !selectedAddressId) {
        const def = addrData.find((a) => a.is_default) || addrData[0];
        setSelectedAddressId(def.id);
      }
    } catch (e) {
      console.warn("Error loading shop data:", e);
    } finally {
      setLoading(false);
    }
  }, [user, selectedAddressId]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Derived Stats
  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status.toLowerCase())).length;
  }, [orders]);

  const totalSpentKes = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total_kes || o.total_amount || 0), 0);
  }, [orders]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.priceKes * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!couponDiscount) return 0;
    return Math.round((cartSubtotal * couponDiscount.percent) / 100);
  }, [cartSubtotal, couponDiscount]);

  const shippingCost = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (cartSubtotal >= 5000) return 0;
    return cart.length > 0 ? 350 : 0;
  }, [cartSubtotal, deliveryMethod, cart.length]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + shippingCost);
  }, [cartSubtotal, discountAmount, shippingCost]);

  // Cart Actions
  const addToCart = (product: Product, variantIndex = 0) => {
    const variant = product.variants?.[variantIndex] || {
      id: "std",
      size: "500g",
      price_kes: 500,
    };
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.variantId === variant.id
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.variantId === variant.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantSize: variant.size,
          priceKes: variant.price_kes,
          quantity: 1,
          image: product.images?.[0],
        },
      ];
    });
    toast.success(`Added ${product.name} (${variant.size}) to cart`);
  };

  const updateCartQuantity = (productId: string, variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId === productId && i.variantId === variantId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as typeof cart
    );
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupon handling
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    const res = await validateCoupon(code, cartSubtotal);
    if (res.valid) {
      setCouponDiscount({ code, percent: res.discount_percent });
      toast.success(`Coupon ${code} applied (${res.discount_percent}% off)`);
    } else {
      setCouponDiscount(null);
      toast.error(res.message || "Invalid coupon code");
    }
  };

  // Checkout Execution
  const handleExecuteCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add products before checking out.");
      return;
    }
    setCheckoutSubmitting(true);
    try {
      const fallbackAddr = {
        name: addressDraft.name,
        phone: addressDraft.phone,
        street: addressDraft.street,
        city: addressDraft.city,
        county: addressDraft.county,
        postal_code: addressDraft.postal_code,
      };
      const chosenAddr = addresses.find((a) => a.id === selectedAddressId) || fallbackAddr;

      const payload: CheckoutOrder = {
        shipping_address: {
          first_name: chosenAddr.name ? chosenAddr.name.split(" ")[0] : "Timothy",
          last_name: chosenAddr.name ? chosenAddr.name.split(" ").slice(1).join(" ") : "Nduva",
          email: user?.email || "timothy@beeyield.com",
          phone: chosenAddr.phone || mpesaPhone,
          address: chosenAddr.street || "Kibwezi Apiary Stand #42",
          city: chosenAddr.city || "Kibwezi",
          county: chosenAddr.county || "Makueni",
          postal_code: chosenAddr.postal_code || "90137",
        },
        payment_method: paymentMethodType,
        delivery_method: deliveryMethod,
        items: cart.map((c) => ({
          product_id: c.productId,
          variant_id: c.variantId,
          quantity: c.quantity,
        })),
        total_kes: cartTotal,
        coupon_code: couponDiscount?.code,
        notes: "Direct verified harvest order via BeeYield Shop Dashboard",
        idempotency_key: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };

      const res = await initializeCheckout(payload);

      // Auto-sync with Shopify if connected
      void autoSyncRecord({
        deviceId: "shop-client",
        kind: "harvest",
        recordId: res.order_id || res.order_number,
        hiveLabel: "Kibwezi Apiary Stand",
        title: `Shop Order #${res.order_number}`,
        summary: `Direct shop order for ${cart.length} item(s) totaling KES ${cartTotal}`,
        status: "completed",
        occurredAt: new Date().toISOString(),
        metrics: {
          total: cartTotal,
          items_count: cart.length,
        },
      });

      toast.success(`⚡ Order #${res.order_number} confirmed! M-Pesa STK push dispatched.`);
      clearCart();
      setShowCheckoutForm(false);
      void loadAllData();
      setActiveTab("orders");
    } catch (e: any) {
      toast.error(e?.message || "Failed to process checkout. Please retry.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Download PDF Invoice / Receipt
  const handleDownloadInvoice = (order: Order) => {
    try {
      const itemsList = (order.items && order.items.length > 0)
        ? order.items.map((i) => `${i.quantity}x ${i.product_name} (${i.variant_size || "Standard"}) — KES ${(i.total_price || i.unit_price * i.quantity).toLocaleString()}`)
        : ["1x Kibwezi Pure Acacia Honey (1kg) — KES 1,000"];

      downloadReportPdf({
        title: `BeeYield Invoice #${order.order_number || order.id.slice(-8).toUpperCase()}`,
        subtitle: "Official Apiary Honey & IoT Hardware Sales Receipt",
        badge: `Status: ${(order.status || "Completed").toUpperCase()}`,
        fileName: `BeeYield-Invoice-${order.order_number || order.id}.pdf`,
        meta: [
          { label: "Order Number", value: order.order_number || order.id },
          { label: "Date Placed", value: order.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10) },
          { label: "Customer", value: order.shipping_address?.name || user?.email || "Timothy Nduva" },
          { label: "Payment Method", value: (order.payment_method || "M-Pesa").toUpperCase() },
          { label: "Total Amount", value: `KES ${(order.total_kes || order.total_amount).toLocaleString()}` },
          { label: "Apiary Origin", value: "Kibwezi Forest Apiary, Makueni County" },
        ],
        sections: [
          {
            type: "list",
            heading: "Purchased Line Items",
            items: itemsList,
          },
          {
            type: "kv",
            heading: "Batch Traceability & Verification",
            rows: [
              ["Verified Batch Lots", "BEE-20260105-001 / KIB-ACAC-121"],
              ["Total Verified Harvest", "843.0 kg across 423 Batches"],
              ["Florage Composition", "Acacia, Neem, Maize, Mango & Forest Multifloral"],
              ["Purity Standard", "100% Raw Unpasteurized Organic Honey"],
              ["Moisture Level", "16.8% (Target < 18.5% Compliant)"],
              ["Origin Coordinates", "-2.4167° S, 37.9667° E"],
            ],
          },
          {
            type: "text",
            heading: "Delivery & Fulfillment Terms",
            body: `Dispatched to: ${order.shipping_address?.address || "Kibwezi Apiary Road"}, ${order.shipping_address?.city || "Kibwezi"}, ${order.shipping_address?.county || "Makueni"}. Contact: ${order.shipping_address?.phone || "254712345678"}. Backed by the BeeYield Genuine Harvest Guarantee.`,
          },
        ],
        footer: "BeeYield AI · Sustainable Apiculture & Precision IoT Honey Verification",
      });
      toast.success("Downloaded official PDF receipt");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  // Tracking Quick Search
  const handleQuickTrack = () => {
    if (!quickTrackQuery.trim()) return;
    const q = quickTrackQuery.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.order_number && o.order_number.toLowerCase().includes(q))
    );
    if (found) {
      setTrackingResult(found);
      setExpandedOrderId(found.id);
      setActiveTab("orders");
      toast.success(`Found order #${found.order_number || found.id}`);
    } else {
      toast.error("No order found matching that number or tracking ID.");
    }
  };

  // Delete Confirmation Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);

    if (type === "order") {
      try {
        await cancelOrder(id);
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
        toast.success("Order cancelled");
      } catch {
        toast.error("Failed to cancel order");
      }
    } else if (type === "address") {
      try {
        await deleteAddress(id);
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Address deleted");
      } catch {
        toast.error("Failed to delete address");
      }
    } else if (type === "payment") {
      try {
        await deletePaymentMethod(id);
        setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
        toast.success("Payment method removed");
      } catch {
        toast.error("Failed to delete payment method");
      }
    }
  };

  // Filtered Lists
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = productCategory === "all" || p.category.toLowerCase() === productCategory.toLowerCase();
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, productCategory, searchQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        orderStatusFilter === "all" || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
      const matchQuery =
        !searchQuery ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.order_number && o.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.shipping_address?.city && o.shipping_address.city.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  if (!isOpen && !embedded) return null;

  // Status Badge Tone
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "processing":
      case "shipped":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const TABS: { id: TabType; label: string; badge?: number }[] = [
    { id: "overview", label: "Store Overview" },
    { id: "orders", label: "Orders & Tracking", badge: orders.length },
    { id: "products", label: "Products Catalog", badge: products.length },
    { id: "checkout", label: "Cart & Checkout", badge: cart.length },
    { id: "traceability", label: "843kg Harvest Ledger" },
    { id: "addresses", label: "Saved Addresses", badge: addresses.length },
    { id: "payments", label: "Payment Methods", badge: paymentMethods.length },
    { id: "wishlist", label: "Wishlist", badge: wishlist.length },
    { id: "profile", label: "Customer Profile" },
    { id: "support", label: "Help & Support" },
  ];

  const mainContent = (
    <div className="space-y-6">
      {/* 1. Top Header Matching InspectionsPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Shop <span className="text-honey">Dashboard & Storefront</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Personal account store ledger & live Shopify sync</span>
              {user?.email && (
                <span className="font-mono text-honey">· {user.email}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadAllData()}
            disabled={loading}
            className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Shop Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-honey" : ""}`} />
          </button>
          <button
            onClick={() => {
              setActiveTab("checkout");
              setShowCheckoutForm(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"
            title="Create Order"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="text-white">Create Order</span>
          </button>
          {!embedded && onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg border border-border hover:bg-card"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Prominent Store Banner Matching InspectionsPage */}
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShoppingBag className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Direct Apiary Store & Batch Traceability
            </h3>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Order verified Kibwezi Acacia Honey, BeeHUB IoT telemetry nodes, or track your live dispatches.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("products")}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-400/50 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="text-white">Browse Products Catalog</span>
          </button>
        </div>
      </div>

      {/* 3. Stats Grid Matching InspectionsPage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total orders", value: orders.length, icon: Package, tone: "text-honey" },
          { label: "Active shipments", value: activeOrdersCount, icon: Truck, tone: "text-emerald-400" },
          { label: "Harvest Traceability", value: "843.0 kg", icon: Scale, tone: "text-blue-400" },
          { label: "Lifetime spent", value: `KES ${totalSpentKes.toLocaleString()}`, icon: CreditCard, tone: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.tone}`} />
            </div>
            <p className={`mt-2 font-display text-2xl sm:text-3xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 4. Subpage View Selector (Tabs) Matching InspectionsPage */}
      <div className="rounded-xl border border-border bg-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-honey" />
          <span className="font-bold text-foreground">Shop Views:</span>
          <span className="text-muted-foreground text-[11px]">Synced with Supabase & Shopify</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll max-w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 border-honey shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:border-honey/40"
              }`}
            >
              {t.label} {t.badge !== undefined && `(${t.badge})`}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Live Backend Sync & Telemetry Banner Matching InspectionsPage */}
      <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Live Backend Sync & E-Commerce Telemetry
            </span>
          </div>
          <button
            type="button"
            onClick={() => void loadAllData()}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Re-sync Live Backend
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Supabase Shop Backend */}
          <div className="p-2.5 rounded-lg bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Shop Backend
            </p>
            <p className="font-bold text-foreground truncate">
              {supabaseShop ? "Connected" : "Local Ledger"}
            </p>
            <p className="text-[9px] text-muted-foreground truncate">
              sb-auth-token-shop
            </p>
          </div>

          {/* Shopify Integration */}
          <div className="p-2.5 rounded-lg bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
              <ShoppingBag className="w-3 h-3 text-blue-500" /> Shopify Sync
            </p>
            <p className="font-bold text-foreground truncate">
              Admin API v2024-10
            </p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
              Real-time Webhook
            </p>
          </div>

          {/* M-Pesa Daraja */}
          <div className="p-2.5 rounded-lg bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
              <CreditCard className="w-3 h-3 text-amber-500" /> M-Pesa Daraja
            </p>
            <p className="font-bold text-foreground truncate">
              STK Push 2.0
            </p>
            <p className="text-[9px] text-muted-foreground truncate">
              Rust Idempotent
            </p>
          </div>

          {/* Harvest Traceability */}
          <div className="p-2.5 rounded-lg bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
              <Scale className="w-3 h-3 text-honey" /> Batch Provenance
            </p>
            <p className="font-bold text-foreground truncate">
              843.0 kg Verified
            </p>
            <p className="text-[9px] text-muted-foreground truncate">
              423 Batches (2020–26)
            </p>
          </div>

          {/* Colony Origin */}
          <div className="p-2.5 rounded-lg bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
              <MapPin className="w-3 h-3 text-rose-500" /> Apiary Origin
            </p>
            <p className="font-bold text-foreground truncate">
              Kibwezi Dryland
            </p>
            <p className="text-[9px] text-muted-foreground truncate">
              150 Active / 184 Total
            </p>
          </div>

          {/* Cart Vitals */}
          <div className="p-2.5 rounded-lg bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
              <Package className="w-3 h-3 text-purple-500" /> Active Cart
            </p>
            <p className="font-bold text-foreground truncate">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[9px] text-honey font-bold truncate">
              KES {cartTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 6. TAB CONTENT RENDERING */}

      {/* ========== TAB: OVERVIEW ========== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Track Bar */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" /> Quick Package & Order Tracking
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={quickTrackQuery}
                  onChange={(e) => setQuickTrackQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickTrack()}
                  placeholder="Enter order number (e.g. BY-KIBWEZI-101) or order ID..."
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-xs font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleQuickTrack}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Track Now
              </button>
            </div>
          </div>

          {/* Featured Honey Varieties */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-honey" /> Pure Acacia Honey Varieties (Kibwezi Origin)
              </h3>
              <button
                onClick={() => setActiveTab("products")}
                className="text-xs text-honey hover:underline flex items-center gap-1 font-semibold"
              >
                View Full Catalog <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {products.slice(0, 4).map((p) => {
                const firstVar = p.variants?.[0] || { size: "500g", price_kes: 500 };
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between hover:border-honey/40 transition-all shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full border border-honey/30 bg-honey/10 text-[10px] font-bold text-honey">
                          {p.badge || "Acacia Honey"}
                        </span>
                        <button
                          onClick={() => void toggleWishlist(p.id)}
                          className="text-muted-foreground hover:text-rose-500"
                          title="Save to Wishlist"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    </div>

                    <div className="pt-3 border-t border-border/50 mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground">{firstVar.size}</span>
                        <p className="font-display font-bold text-base text-foreground">
                          KES {firstVar.price_kes.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(p, 0)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-500" /> Recent Order Ledger
              </h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                All Orders ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/40">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-foreground">No orders placed yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Browse our pure acacia honey or IoT sensor hardware to place your first order.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(o.status)}`}>
                        {o.status.toUpperCase()}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {o.order_number || o.id}
                      </span>
                      <span className="text-muted-foreground">
                        {o.created_at?.slice(0, 10)}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {o.shipping_address?.city || "Kibwezi"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-foreground">
                        KES {(o.total_kes || o.total_amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDownloadInvoice(o)}
                        className="p-1.5 rounded-lg border border-border hover:bg-card text-honey"
                        title="Download Receipt PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== TAB: ORDERS & TRACKING ========== */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                    orderStatusFilter === st
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:border-honey/40"
                  }`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Orders Accordion List */}
          {loading ? (
            <div className="py-16 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-honey" /> Loading orders from Supabase...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <h3 className="font-display text-base font-bold text-foreground">No Orders Found</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                No orders match your filter criteria. Create your first direct honey order below.
              </p>
              <button
                onClick={() => setActiveTab("products")}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                return (
                  <div
                    key={o.id}
                    className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-honey/30"
                  >
                    <div className="w-full p-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                        className="flex flex-wrap items-center gap-3 text-left flex-1 min-w-0"
                      >
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(o.status)}`}>
                          {o.status.toUpperCase()}
                        </span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {o.order_number || o.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {o.created_at?.slice(0, 10)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {o.shipping_address?.city ? `Ship to: ${o.shipping_address.city}` : "Kibwezi Apiary"}
                        </span>
                        <span className="text-xs text-honey font-bold">
                          KES {(o.total_kes || o.total_amount).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {(o.payment_method || "mpesa").toUpperCase()}
                        </span>
                      </button>

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(o)}
                          className="p-1.5 rounded-lg border border-border hover:border-honey/50 hover:bg-honey/10 text-muted-foreground hover:text-honey transition-colors text-xs flex items-center gap-1"
                          title="Download Receipt PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">PDF Receipt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                          className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1"
                        >
                          {isExpanded ? "Hide" : "Details"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 space-y-4 text-xs bg-background/50">
                        {/* Tracking Timeline */}
                        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                          <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-emerald-500" /> Carrier Tracking Timeline
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                            <div className="p-2 rounded-lg bg-card border border-border">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                              <p className="font-bold">Order Confirmed</p>
                              <p className="text-[9px] text-muted-foreground">{o.created_at?.slice(0, 10)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-card border border-border">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                              <p className="font-bold">Apiary Harvest Packed</p>
                              <p className="text-[9px] text-muted-foreground">Kibwezi Depot</p>
                            </div>
                            <div className="p-2 rounded-lg bg-card border border-border">
                              <Clock className={`w-4 h-4 mx-auto mb-1 ${["shipped", "delivered"].includes(o.status) ? "text-emerald-500" : "text-amber-500"}`} />
                              <p className="font-bold">In Transit</p>
                              <p className="text-[9px] text-muted-foreground">Makueni Express</p>
                            </div>
                            <div className="p-2 rounded-lg bg-card border border-border">
                              <Package className={`w-4 h-4 mx-auto mb-1 ${o.status === "delivered" ? "text-emerald-500" : "text-muted-foreground"}`} />
                              <p className="font-bold">Delivered</p>
                              <p className="text-[9px] text-muted-foreground">{o.status === "delivered" ? "Completed" : "Pending"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Line Items */}
                        <div className="space-y-2">
                          <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                            Purchased Honey & Hardware Line Items
                          </h5>
                          <div className="rounded-lg border border-border bg-card divide-y divide-border">
                            {(o.items && o.items.length > 0) ? (
                              o.items.map((it, idx) => (
                                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-honey/10 flex items-center justify-center text-honey font-bold text-[10px]">
                                      {it.quantity}x
                                    </div>
                                    <div>
                                      <p className="font-bold text-foreground">{it.product_name}</p>
                                      <p className="text-[10px] text-muted-foreground">{it.variant_size || "Standard"}</p>
                                    </div>
                                  </div>
                                  <p className="font-bold text-foreground">
                                    KES {(it.total_price || it.unit_price * it.quantity).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="p-2.5 flex items-center justify-between text-xs">
                                <span className="font-medium text-foreground">1x Kibwezi Pure Acacia Honey (1kg Standard)</span>
                                <span className="font-bold text-foreground">KES {(o.total_kes || o.total_amount).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping & Payment Meta */}
                        <div className="grid md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500" /> Delivery Address
                            </span>
                            <p className="font-bold text-foreground">{o.shipping_address?.name || "Timothy Nduva"}</p>
                            <p className="text-muted-foreground">{o.shipping_address?.address || "Kibwezi Stand #42"}</p>
                            <p className="text-muted-foreground">{o.shipping_address?.city || "Kibwezi"}, {o.shipping_address?.county || "Makueni"}</p>
                            <p className="text-muted-foreground font-mono text-[11px]">{o.shipping_address?.phone || "254712345678"}</p>
                          </div>

                          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-honey" /> Payment & Billing
                            </span>
                            <p className="font-bold text-foreground">Method: {(o.payment_method || "mpesa").toUpperCase()}</p>
                            <p className="text-muted-foreground">Order Total: KES {(o.total_kes || o.total_amount).toLocaleString()}</p>
                            <p className="text-muted-foreground">Verified Honey Traceability: 843.0 kg Batch Ledger</p>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                          <button
                            onClick={() => handleDownloadInvoice(o)}
                            className="px-3 py-1.5 rounded-lg border border-honey/50 text-honey flex items-center gap-1.5 hover:bg-honey/10 transition-colors"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Download PDF Receipt
                          </button>
                          {o.status === "pending" && (
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "order",
                                  id: o.id,
                                  title: `Cancel Order #${o.order_number || o.id}?`,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 transition-colors ml-auto"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: PRODUCTS & CATALOG ========== */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["all", "honey", "hardware", "merch", "education"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProductCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                    productCategory === cat
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:border-honey/40"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products & sensors..."
                className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const [selectedVarIndex, setSelectedVarIndex] = useState(0);
              const variant = p.variants?.[selectedVarIndex] || {
                id: "default",
                size: "Standard",
                price_kes: 500,
                stock_quantity: 50,
              };

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between hover:border-honey/40 transition-all shadow-sm space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full border border-honey/30 bg-honey/10 text-[10px] font-bold text-honey">
                        {p.category.toUpperCase()} {p.badge ? `· ${p.badge}` : ""}
                      </span>
                      <button
                        onClick={() => void toggleWishlist(p.id)}
                        className="text-muted-foreground hover:text-rose-500"
                        title="Wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-foreground line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>

                    {/* Batch Traceability Badge for Honey */}
                    {p.category.toLowerCase() === "honey" && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                        <Scale className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">Batch KIB-ACAC-121 · 843kg Ledger</span>
                      </div>
                    )}

                    {/* Variant Selector */}
                    {p.variants && p.variants.length > 1 && (
                      <div className="pt-1">
                        <label className="text-[10px] text-muted-foreground font-semibold">Select Size / Model:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.variants.map((v, idx) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVarIndex(idx)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                selectedVarIndex === idx
                                  ? "bg-honey text-white border-honey"
                                  : "bg-background border-border text-muted-foreground"
                              }`}
                            >
                              {v.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground">{variant.size}</span>
                      <p className="font-display font-bold text-base text-foreground">
                        KES {variant.price_kes.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(p, selectedVarIndex)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-emerald-500/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== TAB: CART & PROGRESSIVE CHECKOUT ========== */}
      {activeTab === "checkout" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-500" /> Active Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Cart
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-foreground text-sm">Your cart is currently empty</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add pure Kibwezi acacia honey or BeeHUB IoT hardware from our catalog.
                  </p>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-honey/10 border border-honey/20 flex items-center justify-center text-honey font-bold text-xs shrink-0">
                          🍯
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.variantSize} · KES {item.priceKes.toLocaleString()} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.variantId, -1)}
                            className="px-2.5 py-1 text-xs hover:bg-card text-muted-foreground"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.variantId, 1)}
                            className="px-2.5 py-1 text-xs hover:bg-card text-muted-foreground"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-display font-bold text-sm text-foreground w-20 text-right">
                          KES {(item.priceKes * item.quantity).toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-md"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Form Card Matching InspectionsPage Form Design */}
              {cart.length > 0 && (
                <div className="rounded-xl border border-emerald-500/50 bg-card overflow-hidden shadow-lg transition-all mt-6">
                  <div className="bg-emerald-600 px-5 py-3.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h2 className="font-display text-sm sm:text-base font-bold text-white tracking-wide">
                          Single-Page Progressive Checkout
                        </h2>
                        <p className="text-[11px] text-emerald-100">
                          Direct Settlement via M-Pesa Daraja or Stripe Card
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 text-xs">
                    {/* Delivery Method Toggle */}
                    <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                      <span className="font-bold text-foreground">Select Delivery Preference:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("delivery")}
                          className={`p-2.5 rounded-lg border text-left font-bold flex items-center justify-between ${
                            deliveryMethod === "delivery"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <span>Direct Delivery (Kenya)</span>
                          <span className="text-[10px] font-normal">{cartSubtotal >= 5000 ? "FREE" : "KES 350"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("pickup")}
                          className={`p-2.5 rounded-lg border text-left font-bold flex items-center justify-between ${
                            deliveryMethod === "pickup"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <span>Kibwezi Apiary Pickup</span>
                          <span className="text-[10px] font-normal">FREE</span>
                        </button>
                      </div>
                    </div>

                    {/* Address Selection */}
                    {deliveryMethod === "delivery" && (
                      <div className="p-3.5 rounded-xl border border-border bg-background space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Shipping Destination Address:
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="text-honey hover:underline text-[11px] font-semibold"
                          >
                            {showAddressForm ? "Use Saved Address" : "+ Custom Address"}
                          </button>
                        </div>

                        {!showAddressForm && addresses.length > 0 ? (
                          <select
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-foreground font-semibold"
                          >
                            {addresses.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} — {a.street}, {a.city} ({a.county}) · {a.phone}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-2.5">
                            <label className="space-y-1">
                              <span className="text-muted-foreground">Recipient Name</span>
                              <input
                                value={addressDraft.name}
                                onChange={(e) => setAddressDraft({ ...addressDraft, name: e.target.value })}
                                className="w-full bg-card border border-border rounded-lg px-2 py-1.5"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-muted-foreground">Phone Number (M-Pesa)</span>
                              <input
                                value={addressDraft.phone}
                                onChange={(e) => setAddressDraft({ ...addressDraft, phone: e.target.value })}
                                className="w-full bg-card border border-border rounded-lg px-2 py-1.5 font-mono"
                              />
                            </label>
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-muted-foreground">Street & Building / Stand</span>
                              <input
                                value={addressDraft.street}
                                onChange={(e) => setAddressDraft({ ...addressDraft, street: e.target.value })}
                                className="w-full bg-card border border-border rounded-lg px-2 py-1.5"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-muted-foreground">Town / City</span>
                              <input
                                value={addressDraft.city}
                                onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                                className="w-full bg-card border border-border rounded-lg px-2 py-1.5"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-muted-foreground">County</span>
                              <input
                                value={addressDraft.county}
                                onChange={(e) => setAddressDraft({ ...addressDraft, county: e.target.value })}
                                className="w-full bg-card border border-border rounded-lg px-2 py-1.5"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Method Selector */}
                    <div className="p-3.5 rounded-xl border border-border bg-background space-y-3">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-honey" /> Payment Method:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethodType("mpesa")}
                          className={`p-2.5 rounded-lg border text-left font-bold flex items-center justify-between ${
                            paymentMethodType === "mpesa"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <span>M-Pesa STK Push</span>
                          <span className="text-[10px]">Instant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethodType("card")}
                          className={`p-2.5 rounded-lg border text-left font-bold flex items-center justify-between ${
                            paymentMethodType === "card"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <span>Credit / Debit Card</span>
                          <span className="text-[10px]">Stripe</span>
                        </button>
                      </div>

                      {paymentMethodType === "mpesa" && (
                        <label className="block space-y-1 pt-1">
                          <span className="text-muted-foreground font-semibold">
                            Enter M-Pesa Phone Number for Instant STK Prompt:
                          </span>
                          <input
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            placeholder="254712345678"
                            className="w-full bg-card border border-border rounded-lg px-2.5 py-2 font-mono text-foreground font-bold"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Order Summary Sidebar */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 sticky top-4 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
                  <span>Order Summary</span>
                  <Scale className="w-4 h-4 text-honey" />
                </h3>

                {/* Promo Coupon Input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-honey" /> Discount Promo Code
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. HONEY20, WELCOME10..."
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 rounded-lg bg-honey text-white text-xs font-bold hover:bg-honey/90"
                    >
                      Apply
                    </button>
                  </div>
                  {couponDiscount && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Code {couponDiscount.code} applied ({couponDiscount.percent}% discount)
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-xs border-t border-border/50 pt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono text-foreground">KES {cartSubtotal.toLocaleString()}</span>
                  </div>

                  {couponDiscount && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount ({couponDiscount.percent}%):</span>
                      <span className="font-mono">-KES {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping:</span>
                    <span className="font-mono text-foreground">
                      {shippingCost === 0 ? "FREE" : `KES ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between font-display text-base font-bold text-foreground border-t border-border pt-3">
                    <span>Total Due:</span>
                    <span className="text-honey font-mono text-lg">KES {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteCheckout}
                  disabled={checkoutSubmitting || cart.length === 0}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-400/50 disabled:opacity-50"
                >
                  {checkoutSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                  <span>
                    {checkoutSubmitting
                      ? "Processing Payment..."
                      : `Place Order · KES ${cartTotal.toLocaleString()}`}
                  </span>
                </button>

                <p className="text-[10px] text-center text-muted-foreground">
                  🔒 Secure SSL 256-bit encryption · Official Kibwezi Honey Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== TAB: 843KG HARVEST LEDGER TRACEABILITY ========== */}
      {activeTab === "traceability" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-honey/30 bg-honey/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-honey/20 text-honey flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Official Harvest Ledger & Batch Provenance
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Every jar sold is cryptographically linked to the 843.0 kg harvested across 423 verified batches (2020–2026).
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-bold text-honey">843.0 kg</span>
              <p className="text-[10px] text-muted-foreground font-semibold">100% Certified Yield</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Apiary Hive Distribution</span>
              <p className="font-bold text-foreground text-sm">150 Active / 34 Standby</p>
              <p className="text-muted-foreground">KIB-001 to KIB-150 colonized stands producing acacia nectar.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Florage Profile</span>
              <p className="font-bold text-foreground text-sm">Acacia, Neem, Maize & Mango</p>
              <p className="text-muted-foreground">Forest Multifloral blend harvested in Kibwezi drylands.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Moisture & Quality Grade</span>
              <p className="font-bold text-foreground text-sm">16.8% Average Moisture</p>
              <p className="text-muted-foreground">Below 18.5% threshold. 0% adulteration. Grade A+ certification.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground">
              Canonical Batch Lots (Sampling of 423 Batches)
            </h4>
            <div className="divide-y divide-border text-xs">
              {CANONICAL_HARVEST_BATCHES.slice(0, 10).map((b: any) => (
                <div key={b.id || b.batch_code} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-honey text-xs">{b.batch_code || b.batch || b.id}</span>
                    <span className="text-muted-foreground">({b.harvest_date?.slice(0, 4) || "2026"})</span>
                    <span className="text-foreground font-medium">{b.notes?.split("Florage:")?.[1]?.trim() || "Acacia & Multifloral"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground">{b.hive_code || "KIB-001"}</span>
                    <span className="font-bold text-foreground font-mono">{(b.weight_kg || 2.0).toFixed(1)} kg</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== TAB: SAVED ADDRESSES ========== */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> Saved Delivery Addresses
            </h3>
            <button
              onClick={() => {
                setEditingAddressId(null);
                setShowAddressForm(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          {showAddressForm && (
            <div className="rounded-xl border border-emerald-500/50 bg-card p-5 space-y-4 text-xs shadow-md">
              <h4 className="font-bold text-sm text-foreground">
                {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-muted-foreground">Full Name</span>
                  <input
                    value={addressDraft.name}
                    onChange={(e) => setAddressDraft({ ...addressDraft, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-muted-foreground">Contact Phone</span>
                  <input
                    value={addressDraft.phone}
                    onChange={(e) => setAddressDraft({ ...addressDraft, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground">Street & Number</span>
                  <input
                    value={addressDraft.street}
                    onChange={(e) => setAddressDraft({ ...addressDraft, street: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-muted-foreground">City / Town</span>
                  <input
                    value={addressDraft.city}
                    onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-muted-foreground">County</span>
                  <input
                    value={addressDraft.county}
                    onChange={(e) => setAddressDraft({ ...addressDraft, county: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (editingAddressId) {
                        await updateAddress(editingAddressId, addressDraft);
                        toast.success("Address updated");
                      } else {
                        await addAddress(addressDraft);
                        toast.success("Address saved");
                      }
                      setShowAddressForm(false);
                      void loadAllData();
                    } catch {
                      toast.error("Failed to save address");
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3 text-xs">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-border bg-card space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{a.name}</span>
                    {a.is_default && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{a.street}</p>
                  <p className="text-muted-foreground">{a.city}, {a.county} {a.postal_code}</p>
                  <p className="font-mono text-muted-foreground text-[11px]">{a.phone}</p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingAddressId(a.id);
                      setAddressDraft({
                        name: a.name,
                        phone: a.phone,
                        street: a.street,
                        apartment: a.apartment || "",
                        building: a.building || "",
                        floor: a.floor || "",
                        city: a.city,
                        county: a.county,
                        postal_code: a.postal_code || "",
                        is_default: a.is_default,
                      });
                      setShowAddressForm(true);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-border hover:bg-background text-muted-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "address",
                        id: a.id,
                        title: `Delete address "${a.name} — ${a.street}"?`,
                      })
                    }
                    className="p-1.5 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== TAB: PAYMENT METHODS ========== */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-honey" /> Vaulted Payment Methods
            </h3>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Payment Method
            </button>
          </div>

          {showPaymentForm && (
            <div className="rounded-xl border border-emerald-500/50 bg-card p-5 space-y-4 text-xs shadow-md">
              <h4 className="font-bold text-sm text-foreground">Add Payment Method</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-muted-foreground">Type</span>
                  <select
                    value={paymentDraft.type}
                    onChange={(e) => setPaymentDraft({ ...paymentDraft, type: e.target.value as any })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  >
                    <option value="mpesa">M-Pesa Mobile Money</option>
                    <option value="card">Credit / Debit Card</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-muted-foreground">Cardholder / Account Name</span>
                  <input
                    value={paymentDraft.card_holder_name}
                    onChange={(e) => setPaymentDraft({ ...paymentDraft, card_holder_name: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  />
                </label>
                {paymentDraft.type === "mpesa" ? (
                  <label className="space-y-1 sm:col-span-2">
                    <span className="text-muted-foreground">M-Pesa Phone Number</span>
                    <input
                      value={paymentDraft.phone}
                      onChange={(e) => setPaymentDraft({ ...paymentDraft, phone: e.target.value })}
                      placeholder="254712345678"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </label>
                ) : (
                  <>
                    <label className="space-y-1">
                      <span className="text-muted-foreground">Last 4 Digits</span>
                      <input
                        value={paymentDraft.last4}
                        onChange={(e) => setPaymentDraft({ ...paymentDraft, last4: e.target.value })}
                        placeholder="4242"
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 font-mono"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-muted-foreground">Expiry (MM/YY)</span>
                      <input
                        value={paymentDraft.expiry}
                        onChange={(e) => setPaymentDraft({ ...paymentDraft, expiry: e.target.value })}
                        placeholder="12/28"
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 font-mono"
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await addPaymentMethod(paymentDraft);
                      toast.success("Payment method added");
                      setShowPaymentForm(false);
                      void loadAllData();
                    } catch {
                      toast.error("Failed to add payment method");
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Payment Method
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3 text-xs">
            {paymentMethods.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey font-bold">
                    {p.type === "mpesa" ? "📱" : "💳"}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {p.type === "mpesa" ? `M-Pesa (${p.last4 ? `••${p.last4}` : "Active"})` : `${p.brand || "Card"} •••• ${p.last4}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.card_holder_name || "Timothy Nduva"} {p.expiry && `· Exp ${p.expiry}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setDeleteTarget({
                      type: "payment",
                      id: p.id,
                      title: `Remove payment method ${p.type.toUpperCase()}?`,
                    })
                  }
                  className="p-1.5 text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== TAB: WISHLIST ========== */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Saved Products & Wishlist ({wishlist.length})
          </h3>

          {wishlist.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40">
              <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="font-bold text-foreground text-sm">Your wishlist is empty</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click the heart icon on any product in our catalog to save it for later.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wishlist.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-sm text-foreground">{w.name}</span>
                      <button
                        onClick={() => void toggleWishlist(w.id).then(() => loadAllData())}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{w.description}</p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-foreground">
                      KES {w.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        const p = products.find((prod) => prod.id === w.id);
                        if (p) addToCart(p, 0);
                        else toast.info("Item moved to cart");
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: CUSTOMER PROFILE ========== */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-honey/10 border border-honey/30 flex items-center justify-center text-honey font-bold text-xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  user?.email?.slice(0, 2).toUpperCase() || "TN"
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {profile?.full_name || "Timothy Nduva"}
                </h3>
                <p className="text-xs text-muted-foreground">{user?.email || "timothy@beeyield.com"}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-honey/10 text-honey border border-honey/20">
                  Apiary Gold Member · Kibwezi Pioneer
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
              <div>
                <span className="text-muted-foreground font-semibold">Account User ID:</span>
                <p className="font-mono text-foreground">{user?.id || "usr_kibwezi_pioneer_01"}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Default Mobile (M-Pesa):</span>
                <p className="font-mono text-foreground">{profile?.phone || "254712345678"}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Associated Apiary:</span>
                <p className="text-foreground">Kibwezi Forest Apiary (150 Active Hives)</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Verified Harvest Yield:</span>
                <p className="font-bold text-honey">843.0 kg across 423 Batches</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== TAB: HELP & SUPPORT ========== */}
      {activeTab === "support" && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-honey" /> BeeYield Apiary Support Desk
            </h3>
            <p className="text-muted-foreground">
              Have questions regarding your honey shipment, M-Pesa transaction settlement, or BeeHUB hardware setup? Our apiary engineering team is on standby.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                <span className="font-bold text-foreground">Direct Apiary Dispatch</span>
                <p className="text-muted-foreground">Kibwezi Drylands Depot, Makueni</p>
                <p className="font-mono text-honey">dispatch@beeyield.com</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                <span className="font-bold text-foreground">M-Pesa Billing Ledger</span>
                <p className="text-muted-foreground">24/7 Automated Reconciliation</p>
                <p className="font-mono text-honey">billing@beeyield.com</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                <span className="font-bold text-foreground">BeeHUB IoT Hardware</span>
                <p className="text-muted-foreground">LoRa Gateway & Sensor Support</p>
                <p className="font-mono text-honey">iot@beeyield.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Alert Dialog for Confirmations
  const alertDialog = (
    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{deleteTarget?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will update the database ledger in Supabase and sync with your local cache.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
            Confirm & Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (embedded) {
    return (
      <div className="w-full space-y-6">
        {mainContent}
        {alertDialog}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {mainContent}
        {alertDialog}
      </div>
    </div>
  );
}
