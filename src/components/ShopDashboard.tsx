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
import { useCallback, useContext, useEffect, useMemo, useRef, useState, startTransition } from "react";
import {
  X, ShoppingBag, Plus, Search, Trash2, CreditCard, Package, Truck,
  Loader2, Save, MapPin, RefreshCw,
  CheckCircle2, Clock, ChevronRight, ChevronDown, Layers, FileDown,
  ExternalLink, User, Heart, HelpCircle, Tag,
  Eye, ArrowRight, Lock, ShieldCheck, MessageSquare, Send, Edit3,
  SlidersHorizontal, Sparkles, Check, AlertCircle,
  LogIn, LogOut, Database, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useShopAuth, ShopAuthProvider, ShopAuthContext, defaultShopAuthContext } from "@/hooks/use-shop-auth";
import ShopAuthModal from "@/components/ShopAuthModal";
import ShopCardWidget from "@/components/ShopCardWidget";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { downloadReportPdf } from "@/lib/report-pdf";
import { autoSyncRecord } from "@/lib/integration-sync";
import {
  getProducts,
  getUserOrders,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getWishlist,
  toggleWishlist,
  initializeCheckout,
  cancelOrder,
  validateCoupon,
  getOrderTracking,
  getCustomerProfile,
  updateCustomerProfile,
  getSupportTickets,
  submitSupportTicket,
  DEFAULT_PRODUCTS,
  type Product,
  type Order,
  type Address,
  type PaymentMethod,
  type WishlistItem,
  type CheckoutOrder,
  type CustomerProfileData,
  type SupportTicket,
  type TrackingInfo,
  type MpesaPaymentStatusResponse,
} from "@/services/shopService";
import { MpesaPaymentModal } from "@/components/payments/MpesaPaymentModal";

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
  | "addresses"
  | "payments"
  | "wishlist"
  | "profile"
  | "support";

function ShopDashboardInner({
  isOpen = true,
  onClose,
  embedded = false,
  initialTab = "overview",
}: ShopDashboardProps) {
  const { user: beeyieldUser, profile: beeyieldProfile } = useAuth();
  const {
    shopUser,
    isShopAuthenticated,
    signOut: shopSignOut,
    isDedicatedBackend,
  } = useShopAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [viewsSearchQuery, setViewsSearchQuery] = useState("");

  // Clean out legacy demo account or fake cards from localStorage on mount
  useEffect(() => {
    try {
      const userStored = localStorage.getItem("shop_local_user");
      if (
        userStored &&
        (userStored.includes("timothy_store") ||
          userStored.includes("grace_wanjiku") ||
          userStored.includes("kenya_organics"))
      ) {
        localStorage.removeItem("shop_local_user");
      }
      const cardsStored = localStorage.getItem("shop_vaulted_cards");
      if (
        cardsStored &&
        (cardsStored.includes("honey_gold_01") ||
          cardsStored.includes("visa_retail_02"))
      ) {
        localStorage.removeItem("shop_vaulted_cards");
      }
      const ticketsStored = localStorage.getItem("beeyield_support_tickets");
      if (ticketsStored && ticketsStored.includes("tkt_welcome_01")) {
        localStorage.removeItem("beeyield_support_tickets");
      }
    } catch {}
  }, []);

  // Active customer & user references for shop operations
  const user = useMemo(() => {
    return shopUser
      ? ({ id: shopUser.id, email: shopUser.email, user_metadata: { full_name: shopUser.full_name, phone: shopUser.phone } } as any)
      : beeyieldUser;
  }, [shopUser, beeyieldUser]);

  const profile = useMemo(() => {
    return shopUser
      ? ({ id: shopUser.id, full_name: shopUser.full_name, phone: shopUser.phone, email: shopUser.email } as any)
      : beeyieldProfile;
  }, [shopUser, beeyieldProfile]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab as TabType);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  // Data State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Customer Profile Backend State
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<CustomerProfileData>({
    full_name: shopUser?.full_name || beeyieldProfile?.full_name || "",
    phone: shopUser?.phone || beeyieldProfile?.phone || "",
    country: "Kenya",
    delivery_town: shopUser?.shipping_address?.city || "",
    county: shopUser?.shipping_address?.county || "",
    apiary_affiliation: shopUser?.company_name || "",
    bio: "",
  });

  // Sync profile draft and address draft when shopUser changes
  useEffect(() => {
    if (shopUser) {
      setProfileDraft((prev) => ({
        ...prev,
        full_name: shopUser.full_name || prev.full_name,
        phone: shopUser.phone || prev.phone,
        delivery_town: shopUser.shipping_address?.city || prev.delivery_town,
        county: shopUser.shipping_address?.county || prev.county,
        apiary_affiliation: shopUser.company_name || prev.apiary_affiliation,
      }));
      setAddressDraft((prev) => ({
        ...prev,
        name: shopUser.full_name || prev.name,
        phone: shopUser.phone || prev.phone,
        street: shopUser.shipping_address?.street || prev.street,
        city: shopUser.shipping_address?.city || prev.city,
        county: shopUser.shipping_address?.county || prev.county,
      }));
      if (shopUser.phone) setMpesaPhone(shopUser.phone);
    }
  }, [shopUser]);

  // Support Desk Backend State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketDraft, setTicketDraft] = useState<{
    subject: string;
    category: SupportTicket["category"];
    order_id: string;
    message: string;
  }>({
    subject: "",
    category: "general",
    order_id: "",
    message: "",
  });

  // Live Carrier Cold-Chain Telemetry Modal
  const [liveTrackingModalOrder, setLiveTrackingModalOrder] = useState<Order | null>(null);
  const [liveTrackingInfo, setLiveTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethodType, setPaymentMethodType] = useState<"mpesa" | "card">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState(profile?.phone || "");
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaModalData, setMpesaModalData] = useState<{
    orderId: string;
    orderNumber: string;
    amount: number;
    phone: string;
    checkoutRequestId?: string;
    idempotencyKey?: string;
  } | null>(null);

  // Custom Address draft for checkout or Address tab
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState({
    name: profile?.full_name || "",
    phone: profile?.phone || "",
    street: "",
    apartment: "",
    building: "",
    floor: "",
    city: "",
    county: "",
    postal_code: "",
    is_default: true,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Payment Method draft & card vaulting state
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormType, setPaymentFormType] = useState<"card" | "mpesa">("card");
  const [cardDraft, setCardDraft] = useState({
    cardNumber: "",
    card_holder_name: profile?.full_name || "",
    expiry: "",
    cvv: "",
    brand: "Visa",
    is_default: true,
  });
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({
    type: "mpesa" as "mpesa" | "card",
    phone: profile?.phone || "",
    brand: "M-Pesa",
    last4: "",
    card_holder_name: profile?.full_name || "",
    expiry: "",
    is_default: true,
  });

  const formatCardNumber = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(" ") : raw;
  };

  const detectBrand = (cardNumber: string) => {
    const raw = cardNumber.replace(/\D/g, "");
    if (/^4/.test(raw)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(raw)) return "Mastercard";
    if (/^3[47]/.test(raw)) return "American Express";
    if (/^6(011|5)/.test(raw)) return "Discover";
    return "Visa";
  };

  const formatExpiry = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);
    if (raw.length > 2) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    return raw;
  };

  const handleSaveCard = async () => {
    const rawNumber = cardDraft.cardNumber.replace(/\s+/g, "");
    if (rawNumber.length < 15 || rawNumber.length > 19) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    if (!cardDraft.expiry || !cardDraft.expiry.includes("/")) {
      toast.error("Please enter card expiry in MM/YY format (e.g. 12/28)");
      return;
    }
    const [mStr, yStr] = cardDraft.expiry.split("/");
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
    if (!cardDraft.cvv || cardDraft.cvv.length < 3) {
      toast.error("Please enter a valid 3 or 4-digit CVV code");
      return;
    }
    if (!cardDraft.card_holder_name.trim()) {
      toast.error("Please enter the name on the card");
      return;
    }

    setIsSavingCard(true);
    try {
      const added = await addPaymentMethod({
        type: "card",
        cardNumber: rawNumber,
        card_holder_name: cardDraft.card_holder_name.trim(),
        expiry: cardDraft.expiry,
        expiry_month: m,
        expiry_year: y < 100 ? 2000 + y : y,
        brand: cardDraft.brand,
        is_default: cardDraft.is_default,
      });

      toast.success("Card securely vaulted and saved! 💳");
      setShowPaymentForm(false);
      setCardDraft({
        cardNumber: "",
        card_holder_name: profile?.full_name || "",
        expiry: "",
        cvv: "",
        brand: "Visa",
        is_default: false,
      });
      setSelectedPaymentMethodId(added.id);
      await loadAllData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save card");
    } finally {
      setIsSavingCard(false);
    }
  };

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
      const [prodsData, ordersData, addrData, payData, wishData, profData, ticketsData] = await Promise.all([
        getProducts().catch(() => []),
        getUserOrders(user?.email || undefined).catch(() => []),
        getAddresses().catch(() => []),
        getPaymentMethods().catch(() => []),
        getWishlist().catch(() => []),
        getCustomerProfile().catch(() => null),
        getSupportTickets().catch(() => []),
      ]);

      setProducts(prodsData || []);
      setOrders(ordersData || []);
      setAddresses(addrData || []);
      setPaymentMethods(payData || []);
      setWishlist(wishData || []);
      if (profData) {
        setCustomerProfile(profData);
        setProfileDraft(profData);
      }
      setSupportTickets(ticketsData || []);

      if (addrData && addrData.length > 0 && !selectedAddressId) {
        const def = addrData.find((a) => a.is_default) || addrData[0];
        setSelectedAddressId(def.id);
      }

      if (payData && payData.length > 0 && !selectedPaymentMethodId) {
        const defCard = payData.find((p) => p.is_default) || payData.find((p) => p.type === "card") || payData[0];
        setSelectedPaymentMethodId(defCard.id);
      }
    } catch (e) {
      console.warn("Error loading shop data:", e);
    } finally {
      setLoading(false);
    }
  }, [user, selectedAddressId, selectedPaymentMethodId]);

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

      if (paymentMethodType === "card") {
        const cardMethods = paymentMethods.filter((p) => p.type === "card");
        if (cardMethods.length === 0) {
          toast.error("Please add a credit or debit card to complete checkout");
          setPaymentFormType("card");
          setShowPaymentForm(true);
          return;
        }
      }

      const payload: CheckoutOrder = {
        shipping_address: {
          first_name: chosenAddr.name ? chosenAddr.name.split(" ")[0] : "",
          last_name: chosenAddr.name ? chosenAddr.name.split(" ").slice(1).join(" ") : "",
          email: user?.email || "",
          phone: chosenAddr.phone || mpesaPhone,
          address: chosenAddr.street || "",
          city: chosenAddr.city || "",
          county: chosenAddr.county || "",
          postal_code: chosenAddr.postal_code || "",
        },
        payment_method: paymentMethodType,
        payment_method_id: paymentMethodType === "card" ? selectedPaymentMethodId : undefined,
        delivery_method: deliveryMethod,
        items: cart.map((c) => ({
          product_id: c.productId,
          variant_id: c.variantId,
          quantity: c.quantity,
        })),
        total_kes: cartTotal,
        coupon_code: couponDiscount?.code,
        notes: "Direct verified order via BeeYield Shop Dashboard",
        idempotency_key: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };

      const res = await initializeCheckout(payload);

      if (paymentMethodType === "mpesa") {
        setMpesaModalData({
          orderId: res.order_id,
          orderNumber: res.order_number,
          amount: cartTotal,
          phone: mpesaPhone || chosenAddr.phone || "",
          checkoutRequestId: res.checkout_request_id || (res.payment_info as any)?.CheckoutRequestID,
          idempotencyKey: payload.idempotency_key,
        });
        setShowMpesaModal(true);
        setShowCheckoutForm(false);
        return;
      }

      // Auto-sync with Shopify if connected (for card/other)
      void autoSyncRecord({
        deviceId: "shop-client",
        kind: "shop_order" as any,
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

      toast.success(`⚡ Order #${res.order_number} confirmed!`);
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

  const handleMpesaDashboardSuccess = (result: MpesaPaymentStatusResponse) => {
    setShowMpesaModal(false);
    void autoSyncRecord({
      deviceId: "shop-client",
      kind: "shop_order" as any,
      recordId: result.order_id || result.order_number || "order",
      hiveLabel: "Kibwezi Apiary Stand",
      title: `Shop Order #${result.order_number}`,
      summary: `M-Pesa payment confirmed (Ref: ${result.mpesa_code})`,
      status: "completed",
      occurredAt: new Date().toISOString(),
      metrics: {
        total: result.amount || cartTotal,
        items_count: cart.length,
      },
    });

    toast.success(`⚡ Payment confirmed! Order #${result.order_number} marked as Paid.`);
    clearCart();
    void loadAllData();
    setActiveTab("orders");
  };

  // Download PDF Invoice / Receipt
  const handleDownloadInvoice = (order: Order) => {
    try {
      const itemsList = (order.items && order.items.length > 0)
        ? order.items.map((i) => `${i.quantity}x ${i.product_name} (${i.variant_size || "Standard"}) — KES ${(i.total_price || i.unit_price * i.quantity).toLocaleString()}`)
        : ["No item details available"];

      downloadReportPdf({
        title: `BeeYield Invoice #${order.order_number || order.id.slice(-8).toUpperCase()}`,
        subtitle: "Official Apiary Honey & IoT Hardware Sales Receipt",
        badge: `Status: ${(order.status || "Completed").toUpperCase()}`,
        fileName: `BeeYield-Invoice-${order.order_number || order.id}.pdf`,
        meta: [
          { label: "Order Number", value: order.order_number || order.id },
          { label: "Date Placed", value: order.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10) },
          { label: "Customer", value: order.shipping_address?.name || user?.email || "Customer" },
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
            heading: "Quality & Origin Guarantee",
            rows: [
              ["Origin", "Kibwezi Dryland Apiaries, Makueni County"],
              ["Florage Composition", "Acacia, Neem, Maize, Mango & Forest Multifloral"],
              ["Purity Standard", "100% Raw Unpasteurized Organic Honey"],
              ["Moisture Level", "16.8% (Target < 18.5% Compliant)"],
              ["Origin Coordinates", "-2.4167° S, 37.9667° E"],
            ],
          },
          {
            type: "text",
            heading: "Delivery & Fulfillment Terms",
            body: `Dispatched to: ${order.shipping_address?.address || "Kibwezi Apiary Road"}, ${order.shipping_address?.city || "Kibwezi"}, ${order.shipping_address?.county || "Makueni"}. Contact: ${order.shipping_address?.phone || "254712345678"}. Backed by the BeeYield Genuine Quality Guarantee.`,
          },
        ],
        footer: "BeeYield AI · Sustainable Apiculture & Precision IoT Honey Verification",
      });
      toast.success("Downloaded official PDF receipt");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  // Live Telemetry Modal Handler
  const handleOpenTrackingModal = async (order: Order) => {
    setLiveTrackingModalOrder(order);
    setIsLoadingTracking(true);
    try {
      const info = await getOrderTracking(order.order_number || order.id);
      setLiveTrackingInfo(info);
    } catch {
      // non-blocking fallback
    } finally {
      setIsLoadingTracking(false);
    }
  };

  // Tracking Quick Search with Live Consignment Telemetry
  const handleQuickTrack = async () => {
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
      await handleOpenTrackingModal(found);
      toast.success(`Found order #${found.order_number || found.id}`);
    } else {
      setIsLoadingTracking(true);
      try {
        const info = await getOrderTracking(quickTrackQuery.trim());
        const trackedOrder: Order = {
          id: info.order_id,
          order_number: info.order_id,
          status: info.current_status,
          total_kes: 0,
          total_amount: 0,
          payment_method: "mpesa",
          created_at: new Date().toISOString(),
          shipping_address: { city: "Nairobi", address: "Consignment Waypoint" },
          items: [],
        };
        setLiveTrackingModalOrder(trackedOrder);
        setLiveTrackingInfo(info);
        toast.success(`Live tracking retrieved for consignment #${info.order_id}`);
      } catch {
        toast.error("No consignment found matching that tracking ID.");
      } finally {
        setIsLoadingTracking(false);
      }
    }
  };

  // Wishlist Database Sync Handlers
  const handleToggleWishlist = async (productId: string) => {
    try {
      const res = await toggleWishlist(productId);
      if (res.action === "added") {
        const prod = products.find((p) => p.id === productId) || DEFAULT_PRODUCTS.find((p) => p.id === productId);
        if (prod) {
          const newItem: WishlistItem = {
            id: prod.id,
            name: prod.name,
            description: prod.description,
            price: prod.variants[0]?.price_kes || 550,
            image: prod.images[0],
            category: prod.category,
            badge: prod.badge,
            inStock: true,
            added_at: new Date().toISOString(),
          };
          setWishlist((prev) => [newItem, ...prev.filter((w) => w.id !== productId)]);
        }
        toast.success("Saved to Wishlist! ❤️");
      } else {
        setWishlist((prev) => prev.filter((w) => w.id !== productId));
        toast.info("Removed from Wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist in database");
    }
  };

  const handleMoveWishlistToCart = (item: WishlistItem) => {
    const prod = products.find((p) => p.id === item.id) || DEFAULT_PRODUCTS.find((p) => p.id === item.id);
    if (prod) {
      addToCart(prod, 0);
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: item.id,
          variantId: "default",
          productName: item.name,
          variantSize: "Standard",
          priceKes: item.price,
          quantity: 1,
          image: item.image,
        },
      ]);
      toast.success(`Added ${item.name} to cart`);
    }
  };

  // Customer Profile Database Save Handler
  const handleSaveProfile = async () => {
    if (!profileDraft.full_name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!profileDraft.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await updateCustomerProfile(profileDraft);
      setCustomerProfile(updated);
      setShowProfileModal(false);
      toast.success("Profile saved successfully! 👤");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Support Ticket Database Submission Handler
  const handleSubmitTicket = async () => {
    if (!ticketDraft.subject.trim()) {
      toast.error("Please enter an inquiry subject");
      return;
    }
    if (!ticketDraft.message.trim()) {
      toast.error("Please describe your question or issue");
      return;
    }
    setIsSubmittingTicket(true);
    try {
      const newTkt = await submitSupportTicket(ticketDraft);
      setSupportTickets((prev) => [newTkt, ...prev]);
      setShowTicketModal(false);
      setTicketDraft({
        subject: "",
        category: "general",
        order_id: "",
        message: "",
      });
      toast.success(`Support ticket #${newTkt.ticket_number} submitted and synced with database! 🎫`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit support ticket");
    } finally {
      setIsSubmittingTicket(false);
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

  const TABS: { id: TabType; label: string; badge?: number; icon: any; description: string }[] = useMemo(() => [
    { id: "overview", label: "Store Overview", icon: ShoppingBag, description: "Metrics, quick tracking & featured catalog" },
    { id: "orders", label: "Orders & Tracking", badge: orders.length, icon: Truck, description: "Consignment ledger & live cold-chain telemetry" },
    { id: "products", label: "Products Catalog", badge: products.length, icon: Package, description: "Honey, equipment, hardware & merch" },
    { id: "checkout", label: "Cart & Checkout", badge: cart.length, icon: ShoppingBag, description: "Review items, promo vouchers & M-Pesa push" },
    { id: "addresses", label: "Saved Addresses", badge: addresses.length, icon: MapPin, description: "Delivery locations & dispatch points" },
    { id: "payments", label: "Payment Methods", badge: paymentMethods.length, icon: CreditCard, description: "Vaulted EMV cards & M-Pesa records" },
    { id: "wishlist", label: "Wishlist", badge: wishlist.length, icon: Heart, description: "Saved apiary products & quick move to cart" },
    { id: "profile", label: "Customer Profile", icon: User, description: "Account info & customer statistics" },
    { id: "support", label: "Help & Support", badge: supportTickets.length, icon: HelpCircle, description: "Inquiries & support tickets" },
  ], [orders.length, products.length, cart.length, addresses.length, paymentMethods.length, wishlist.length, supportTickets.length]);

  const shopCategories = useMemo(
    () => [
      {
        title: "COMMERCE & CATALOG",
        items: [
          { id: "overview" as TabType, label: "Store Overview", icon: ShoppingBag, description: "Metrics, quick tracking & featured honey" },
          { id: "products" as TabType, label: "Products Catalog", badge: products.length, icon: Package, description: "Honey, equipment, hardware & merch" },
          { id: "checkout" as TabType, label: "Cart & Checkout", badge: cart.length, icon: ShoppingBag, description: "Review items, promo vouchers & M-Pesa push" },
          { id: "wishlist" as TabType, label: "Saved Wishlist", badge: wishlist.length, icon: Heart, description: "Saved apiary products & quick move to cart" },
        ],
      },
      {
        title: "ORDERS & LOGISTICS",
        items: [
          { id: "orders" as TabType, label: "Orders & Tracking", badge: orders.length, icon: Truck, description: "Consignment ledger & live cold-chain telemetry" },
          { id: "addresses" as TabType, label: "Delivery Addresses", badge: addresses.length, icon: MapPin, description: "Delivery locations & dispatch points" },
          { id: "payments" as TabType, label: "Payment Methods", badge: paymentMethods.length, icon: CreditCard, description: "Vaulted EMV cards & M-Pesa records" },
        ],
      },
      {
        title: "ACCOUNT & SUPPORT",
        items: [
          { id: "profile" as TabType, label: "Customer Profile", icon: User, description: "Account info & customer statistics" },
          { id: "support" as TabType, label: "Help & Support", badge: supportTickets.length, icon: HelpCircle, description: "Inquiries & support tickets" },
        ],
      },
    ],
    [products.length, cart.length, wishlist.length, orders.length, addresses.length, paymentMethods.length, supportTickets.length]
  );

  const filteredShopCategories = useMemo(() => {
    const q = viewsSearchQuery.trim().toLowerCase();
    if (!q) return shopCategories;
    return shopCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            it.label.toLowerCase().includes(q) ||
            it.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [shopCategories, viewsSearchQuery]);

  const currentTabItem = useMemo(() => {
    return TABS.find((t) => t.id === activeTab) || TABS[0];
  }, [TABS, activeTab]);

  const CurrentTabIcon = currentTabItem?.icon || ShoppingBag;

  if (!isOpen && !embedded) return null;

  const mainContent = (
    <div className="space-y-6">
      {/* 1. Top Header Matching BeeYield Dashboard Header with dropdown on the left */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        {/* Left: Views Directory Dropdown & Store Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Shop Views Directory Dropdown - Matching BeeYield Dashboard Dropdown 1:1 */}
          <DropdownMenu open={isViewDropdownOpen} onOpenChange={setIsViewDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 sm:gap-2.5 h-10 px-3 sm:px-3.5 bg-card border border-border hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/20 dark:hover:bg-stone-800/80 rounded-2xl transition-all group outline-none shrink-0 shadow-xs text-foreground active:scale-95 touch-manipulation cursor-pointer"
                title="Shop Views Directory"
                aria-label="Shop Views Directory"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <CurrentTabIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 leading-none">
                  <span className="truncate max-w-[120px] sm:max-w-[180px] pointer-events-none select-none">
                    {currentTabItem?.label || "Store Overview"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500 group-data-[state=open]:rotate-180 transition-transform duration-200 shrink-0" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-[min(calc(100vw-24px),340px)] sm:w-84 max-h-[75vh] overflow-y-auto rounded-3xl border border-border p-3 shadow-2xl bg-card/98 backdrop-blur-2xl text-foreground z-50 custom-scrollbar ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 touch-pan-y"
            >
              {/* Search views input */}
              <div className="p-1 mb-2.5 border-b border-border/50">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={viewsSearchQuery}
                    onChange={(e) => setViewsSearchQuery(e.target.value)}
                    placeholder="Search shop views..."
                    aria-label="Search shop views"
                    className="w-full bg-muted/70 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition-all"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {filteredShopCategories.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                  No view matches “{viewsSearchQuery}”.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredShopCategories.map((category) => (
                    <div key={category.title} className="space-y-1">
                      <p className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                        {category.title}
                      </p>
                      <div className="space-y-0.5">
                        {category.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <DropdownMenuItem
                              key={item.id}
                              onSelect={() => {
                                setIsViewDropdownOpen(false);
                                startTransition(() => {
                                  setActiveTab(item.id);
                                });
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs cursor-pointer transition-all touch-manipulation",
                                isActive
                                  ? "bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/30 shadow-xs"
                                  : "text-foreground hover:bg-muted/70 hover:text-amber-600 dark:hover:text-amber-400 active:bg-amber-500/10",
                              )}
                            >
                              <ItemIcon className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 pointer-events-none" />
                              <div className="truncate flex-1 pointer-events-none select-none">
                                <span className="font-medium">{item.label}</span>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                              </div>
                              {item.badge !== undefined && item.badge > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 pointer-events-none" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Shop <span className="text-honey">Storefront</span>
              </h1>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              >
                {isDedicatedBackend ? "Dedicated Shop DB" : "Shop Partition"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Direct apiculture orders & verified dispatch</span>
              {shopUser ? (
                <span className="font-mono text-emerald-400 font-medium">· {shopUser.email}</span>
              ) : (
                <span className="font-mono text-amber-500/90">· Guest Session</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cart Shortcut Button with Badge */}
          <button
            type="button"
            onClick={() => setActiveTab("checkout")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Cart & Checkout"
          >
            <ShoppingBag className="w-4 h-4 text-honey" />
            <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-honey text-primary-foreground">
                {cart.length}
              </span>
            )}
          </button>

          {/* Shop Customer Account Bar (Separate from BeeYield Beekeeper Session) */}
          {isShopAuthenticated && shopUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-honey/40 bg-honey/10 hover:bg-honey/20 transition-all text-left shadow-xs cursor-pointer"
                  title="Shop Customer Profile & Settings"
                >
                  {shopUser.avatar_url ? (
                    <img
                      src={shopUser.avatar_url}
                      alt={shopUser.full_name}
                      className="w-7 h-7 rounded-lg object-cover border border-honey/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-honey/20 text-honey flex items-center justify-center font-bold text-xs">
                      {shopUser.full_name?.slice(0, 2).toUpperCase() || "SC"}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{shopUser.full_name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Store Account Active" />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[130px] font-mono">{shopUser.email || "Shop Customer"}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-card/95 backdrop-blur-xl border border-border shadow-xl rounded-xl z-50">
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground truncate">{shopUser.full_name}</p>
                    <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase">
                      {shopUser.role || "Customer"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">{shopUser.email}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Shop Account · Active</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("orders")} className="cursor-pointer text-xs flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-honey" />
                  <span>My Orders ({orders.length})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("addresses")} className="cursor-pointer text-xs flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Delivery Addresses ({addresses.length})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("payments")} className="cursor-pointer text-xs flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Payment Methods ({paymentMethods.length})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("wishlist")} className="cursor-pointer text-xs flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Saved Wishlist ({wishlist.length})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("profile")} className="cursor-pointer text-xs flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await shopSignOut();
                    void loadAllData();
                    toast.success("Signed out successfully");
                  }}
                  className="cursor-pointer text-xs flex items-center gap-2 text-rose-500 hover:text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out (Shop Account)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalTab("signin");
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-card border border-border hover:border-honey/60 hover:bg-honey/10 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-honey" />
              <span>Customer Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => void loadAllData()}
            disabled={loading}
            className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Refresh Shop Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-honey" : ""}`} />
          </button>
          <button
            onClick={() => {
              setActiveTab("checkout");
              setShowCheckoutForm(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40 cursor-pointer"
            title="Create Order"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="text-white">Create Order</span>
          </button>
          {!embedded && onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg border border-border hover:bg-card cursor-pointer"
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
              Direct Apiary Storefront & Supplies
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
          { label: "Products catalog", value: products.length, icon: ShoppingBag, tone: "text-blue-400" },
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

          {/* Customer Digital Card & Wallet (Dedicated Backend & Database) */}
          <ShopCardWidget
            onCardSelect={(card) => {
              setSelectedPaymentMethodId(card.id);
            }}
          />

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
                          type="button"
                          onClick={() => handleToggleWishlist(p.id)}
                          className={`transition-colors ${
                            wishlist.some((w) => w.id === p.id)
                              ? "text-rose-500 fill-rose-500"
                              : "text-muted-foreground hover:text-rose-500"
                          }`}
                          title={wishlist.some((w) => w.id === p.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.some((w) => w.id === p.id) ? "fill-rose-500" : ""}`} />
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
              <Loader2 className="w-4 h-4 animate-spin text-honey" /> Loading orders...
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
                              <p className="font-bold">Order Packed</p>
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
                                <span className="font-medium text-muted-foreground italic">No item details</span>
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
                            <p className="font-bold text-foreground">{o.shipping_address?.name || "—"}</p>
                            <p className="text-muted-foreground">{o.shipping_address?.address || "—"}</p>
                            <p className="text-muted-foreground">{o.shipping_address?.city || "—"}{o.shipping_address?.county ? `, ${o.shipping_address.county}` : ""}</p>
                            <p className="text-muted-foreground font-mono text-[11px]">{o.shipping_address?.phone || "—"}</p>
                          </div>

                          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-honey" /> Payment & Billing
                            </span>
                            <p className="font-bold text-foreground">Method: {(o.payment_method || "mpesa").toUpperCase()}</p>
                            <p className="text-muted-foreground">Order Total: KES {(o.total_kes || o.total_amount).toLocaleString()}</p>
                            <p className="text-muted-foreground">Direct Apiary Fulfillment Guarantee</p>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(o)}
                            className="px-3 py-1.5 rounded-lg border border-honey/50 text-honey flex items-center gap-1.5 hover:bg-honey/10 transition-colors"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Download PDF Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenTrackingModal(o)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Live Consignment
                          </button>
                          {["pending", "confirmed"].includes(o.status.toLowerCase()) && (
                            <button
                              type="button"
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
              const selectedVarIndex = selectedVariants[p.id] ?? 0;
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
                        type="button"
                        onClick={() => handleToggleWishlist(p.id)}
                        className={`transition-colors ${
                          wishlist.some((w) => w.id === p.id)
                            ? "text-rose-500 fill-rose-500"
                            : "text-muted-foreground hover:text-rose-500"
                        }`}
                        title={wishlist.some((w) => w.id === p.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.some((w) => w.id === p.id) ? "fill-rose-500" : ""}`} />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-foreground line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>


                    {/* Variant Selector */}
                    {p.variants && p.variants.length > 1 && (
                      <div className="pt-1">
                        <label className="text-[10px] text-muted-foreground font-semibold">Select Size / Model:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.variants.map((v, idx) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariants((prev) => ({ ...prev, [p.id]: idx }))}
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

                      {paymentMethodType === "card" && (
                        <div className="pt-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-semibold text-[11px]">
                              Select Saved Card:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentFormType("card");
                                setShowPaymentForm(true);
                              }}
                              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add New Card
                            </button>
                          </div>

                          {paymentMethods.filter((p) => p.type === "card").length > 0 ? (
                            <div className="space-y-2">
                              {paymentMethods
                                .filter((p) => p.type === "card")
                                .map((card) => (
                                  <label
                                    key={card.id}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      selectedPaymentMethodId === card.id
                                        ? "bg-emerald-500/10 border-emerald-500 text-foreground shadow-sm"
                                        : "bg-card border-border text-muted-foreground hover:border-emerald-500/30"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name="selectedCheckoutCard"
                                        checked={selectedPaymentMethodId === card.id}
                                        onChange={() => setSelectedPaymentMethodId(card.id)}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                        💳
                                      </div>
                                      <div>
                                        <p className="font-bold text-foreground text-xs">
                                          {card.brand || "Card"} •••• {card.last4}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {card.card_holder_name || "Cardholder"} · Exp {card.expiry || "12/28"}
                                        </p>
                                      </div>
                                    </div>
                                    {card.is_default && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-honey/10 text-honey border border-honey/20">
                                        Default
                                      </span>
                                    )}
                                  </label>
                                ))}
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl border border-dashed border-border bg-card/60 text-center space-y-2">
                              <p className="text-muted-foreground text-[11px]">
                                No credit or debit cards saved in your account yet.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentFormType("card");
                                  setShowPaymentForm(true);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Card to Account
                              </button>
                            </div>
                          )}
                        </div>
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
                  <ShoppingBag className="w-4 h-4 text-honey" />
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
          {/* Hero Digital Card Widget with Dedicated Backend & Database */}
          <ShopCardWidget className="mb-2" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-honey" /> Vaulted Payment Methods & Cards
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saved cards and payment credentials synced directly with your dedicated shop account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPaymentFormType("card");
                  setShowPaymentForm(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Card
              </button>
              <button
                onClick={() => {
                  setPaymentFormType("mpesa");
                  setShowPaymentForm(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add M-Pesa
              </button>
            </div>
          </div>

          {/* ADD PAYMENT METHOD / CARD FORM */}
          {showPaymentForm && (
            <div className="rounded-2xl border border-emerald-500/40 bg-card p-5 sm:p-6 space-y-5 text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {paymentFormType === "card" ? "Add Credit / Debit Card" : "Add M-Pesa Mobile Number"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Securely vaulted with end-to-end encryption
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setPaymentFormType("card")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      paymentFormType === "card"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFormType("mpesa")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      paymentFormType === "mpesa"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    M-Pesa
                  </button>
                </div>
              </div>

              {paymentFormType === "card" ? (
                <div className="grid lg:grid-cols-12 gap-5 items-start">
                  {/* Interactive Card Mockup Preview */}
                  <div className="lg:col-span-5">
                    <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xl bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30">
                      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-honey/20 rounded-full blur-2xl pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between pb-6">
                        <div className="flex items-center gap-2">
                          {/* EMV Gold Chip */}
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300 shadow-inner flex items-center justify-center">
                            <div className="w-8 h-5 border border-amber-800/40 rounded flex items-center justify-center">
                              <div className="w-4 h-3 border-r border-l border-amber-800/40" />
                            </div>
                          </div>
                          <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                            BeeYield Vault
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-black tracking-wider uppercase">
                            {cardDraft.brand || "VISA"}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-4">
                        <div className="font-mono text-lg sm:text-xl font-bold tracking-widest drop-shadow text-slate-100">
                          {cardDraft.cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        <div className="flex items-end justify-between text-xs pt-1">
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400">Cardholder</span>
                            <span className="font-semibold tracking-wide uppercase truncate max-w-[180px] block">
                              {cardDraft.card_holder_name || profile?.full_name || "YOUR NAME"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400">Expires</span>
                            <span className="font-mono font-bold tracking-wider">
                              {cardDraft.expiry || "MM/YY"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Secure Vault: 256-bit AES encrypted card storage</span>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <label className="block space-y-1">
                      <span className="text-muted-foreground font-semibold flex items-center justify-between">
                        <span>Card Number</span>
                        <span className="text-[10px] text-honey font-bold uppercase">{cardDraft.brand}</span>
                      </span>
                      <div className="relative">
                        <input
                          value={cardDraft.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            const brand = detectBrand(formatted);
                            setCardDraft({ ...cardDraft, cardNumber: formatted, brand });
                          }}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-sm font-bold tracking-wider text-foreground placeholder:text-muted-foreground/40"
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">
                          {cardDraft.brand}
                        </div>
                      </div>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-muted-foreground font-semibold">Cardholder Full Name</span>
                      <input
                        value={cardDraft.card_holder_name}
                        onChange={(e) => setCardDraft({ ...cardDraft, card_holder_name: e.target.value })}
                        placeholder="e.g. Timothy Nduva"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1">
                        <span className="text-muted-foreground font-semibold">Expiration Date</span>
                        <input
                          value={cardDraft.expiry}
                          onChange={(e) => setCardDraft({ ...cardDraft, expiry: formatExpiry(e.target.value) })}
                          placeholder="MM/YY (e.g. 12/28)"
                          maxLength={5}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/40"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-muted-foreground font-semibold flex items-center justify-between">
                          <span>Security Code</span>
                          <span className="text-[10px] text-muted-foreground">CVV / CVC</span>
                        </span>
                        <input
                          value={cardDraft.cvv}
                          onChange={(e) => setCardDraft({ ...cardDraft, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/40"
                        />
                      </label>
                    </div>

                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardDraft.is_default}
                        onChange={(e) => setCardDraft({ ...cardDraft, is_default: e.target.checked })}
                        className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-muted-foreground font-semibold text-[11px]">
                        Set as default payment method for this account
                      </span>
                    </label>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCard}
                        disabled={isSavingCard}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                      >
                        {isSavingCard ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Saving Card...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-white" />
                            <span>Save Card</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* M-Pesa Phone Form */
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Account Holder Name</span>
                      <input
                        value={paymentDraft.card_holder_name}
                        onChange={(e) => setPaymentDraft({ ...paymentDraft, card_holder_name: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-muted-foreground font-semibold">M-Pesa Registered Mobile</span>
                      <input
                        value={paymentDraft.phone}
                        onChange={(e) => setPaymentDraft({ ...paymentDraft, phone: e.target.value })}
                        placeholder="254712345678"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-sm text-foreground"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentDraft.is_default}
                      onChange={(e) => setPaymentDraft({ ...paymentDraft, is_default: e.target.checked })}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-muted-foreground font-semibold text-[11px]">
                      Set as default payment method for this account
                    </span>
                  </label>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await addPaymentMethod({
                            ...paymentDraft,
                            type: "mpesa",
                          });
                          toast.success("M-Pesa method saved and synced! 📱");
                          setShowPaymentForm(false);
                          void loadAllData();
                        } catch {
                          toast.error("Failed to add payment method");
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md"
                    >
                      Save M-Pesa
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VAULTED PAYMENT METHODS LIST */}
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            {paymentMethods.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-sm">
                    {p.type === "mpesa" ? "📱" : "💳"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-sm">
                        {p.type === "mpesa"
                          ? `M-Pesa (${p.last4 ? `••${p.last4}` : "Active"})`
                          : `${p.brand || "Card"} •••• ${p.last4}`}
                      </p>
                      {p.is_default && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-honey/10 text-honey border border-honey/20">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.card_holder_name || profile?.full_name || "—"}
                      {p.expiry && ` · Exp ${p.expiry}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!p.is_default && (
                    <button
                      onClick={async () => {
                        try {
                          await updatePaymentMethod(p.id, { ...p, is_default: true });
                          toast.success("Updated default payment method");
                          void loadAllData();
                        } catch {
                          toast.error("Failed to update default payment method");
                        }
                      }}
                      className="px-2 py-1 rounded-lg border border-border text-[10px] text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/30 font-semibold transition-colors"
                      title="Set as default"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "payment",
                        id: p.id,
                        title: `Remove payment method ${p.type === "card" ? p.brand || "Card" : "M-Pesa"} •••• ${p.last4}?`,
                      })
                    }
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete payment method"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== TAB: WISHLIST ========== */}
      {activeTab === "wishlist" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
            <div>
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Saved Products & Wishlist ({wishlist.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Curate your apiculture equipment, raw honey batches, and hardware items. Saved directly to your account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Saved to Account
              </span>
              <button
                onClick={() => setActiveTab("products")}
                className="px-3 py-1 rounded-lg bg-honey/10 hover:bg-honey/20 text-honey font-bold text-xs border border-honey/20 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Your wishlist is currently empty</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click the heart icon on any raw honey variant, BeeHUB sensor, or beekeeping equipment in our catalog to save it here for quick access later.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("products")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-honey hover:bg-honey-dark text-black font-bold text-xs shadow-md transition-colors"
              >
                Explore Product Catalog
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((w) => {
                const prod = products.find((p) => p.id === w.id);
                return (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-border bg-card hover:border-honey/40 transition-all flex flex-col justify-between space-y-3 shadow-sm group"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/20 border border-border/50">
                        {w.image ? (
                          <img
                            src={w.image}
                            alt={w.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-background/90 backdrop-blur-sm text-foreground border border-border/60 uppercase">
                          {w.category || "Apiculture"}
                        </span>
                        <button
                          onClick={() => void handleToggleWishlist(w.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm border border-border/60 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:scale-110 transition-transform shadow-sm"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-honey transition-colors">
                            {w.name}
                          </h4>
                          <span className="font-display font-bold text-sm text-honey whitespace-nowrap">
                            KES {w.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {w.description || "Authentic sustainably harvested apiary product guaranteed for purity."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready in Stock
                      </span>
                      <button
                        onClick={() => handleMoveWishlistToCart(w)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Move to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: CUSTOMER PROFILE ========== */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-honey/15 border-2 border-honey/30 flex items-center justify-center text-honey font-bold text-xl shadow-inner">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    customerProfile?.full_name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "??"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {customerProfile?.full_name || profile?.full_name || "Customer"}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-honey/15 text-honey border border-honey/30">
                      Apiary Gold Member
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {user?.email || "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {customerProfile?.bio || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified Member
                </span>
                <button
                  onClick={() => {
                    setProfileDraft({
                      full_name: customerProfile?.full_name || profile?.full_name || "",
                      phone: customerProfile?.phone || profile?.phone || "",
                      country: customerProfile?.country || "Kenya",
                      delivery_town: customerProfile?.delivery_town || "",
                      county: customerProfile?.county || "",
                      apiary_affiliation: customerProfile?.apiary_affiliation || "",
                      bio: customerProfile?.bio || "",
                    });
                    setShowProfileModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-honey hover:bg-honey-dark text-black font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Grid Details */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Default Mobile (M-Pesa)</span>
                <p className="font-mono font-bold text-foreground text-sm">
                  {customerProfile?.phone || profile?.phone || "+254 712 345 678"}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> STK Push Verified
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">County / Region</span>
                <p className="font-bold text-foreground text-sm">
                  {customerProfile?.county || "Makueni County"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Town: {customerProfile?.delivery_town || "Kibwezi"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Primary Apiary Station</span>
                <p className="font-bold text-foreground text-sm line-clamp-1">
                  {customerProfile?.apiary_affiliation || "Kibwezi Forest Apiary"}
                </p>
                <p className="text-[10px] text-honey font-medium">150 Managed Hives</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Account ID</span>
                <p className="font-mono font-bold text-foreground text-xs truncate">
                  {user?.id ? user.id.slice(0, 18) + "..." : "BY-CUST-001"}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Member Profile Active
                </p>
              </div>
            </div>

            {/* Lifetime Store Performance Summary */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-honey" /> Lifetime Account & Shop Statistics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-xl font-display font-bold text-honey">{orders.length}</span>
                  <p className="text-[11px] text-muted-foreground">Orders Processed</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-xl font-display font-bold text-emerald-500">
                    KES {totalSpentKes.toLocaleString()}
                  </span>
                  <p className="text-[11px] text-muted-foreground">Total Shop Volume</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-xl font-display font-bold text-foreground">{addresses.length}</span>
                  <p className="text-[11px] text-muted-foreground">Saved Addresses</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-xl font-display font-bold text-rose-500">{wishlist.length}</span>
                  <p className="text-[11px] text-muted-foreground">Saved Wishlist Items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== TAB: HELP & SUPPORT ========== */}
      {activeTab === "support" && (
        <div className="space-y-6">
          {/* Header Action Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-honey" /> BeeYield Apiary Support Desk & Technical Ledger
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct line to our apiculture logistics managers, M-Pesa billing engineers, and BeeHUB IoT telemetry specialists.
                </p>
              </div>
              <button
                onClick={() => {
                  setTicketDraft({
                    subject: "",
                    category: "general",
                    order_id: orders[0]?.order_number || "",
                    message: "",
                  });
                  setShowTicketModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-honey hover:bg-honey-dark text-black font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit New Inquiry
              </button>
            </div>

            {/* Direct Official Channels */}
            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  <span>Direct Apiary Dispatch</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Kibwezi Drylands Depot, Makueni County</p>
                <p className="font-mono text-xs text-honey">dispatch@beeyield.com</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-honey" />
                  <span>M-Pesa Billing Ledger</span>
                </div>
                <p className="text-[11px] text-muted-foreground">24/7 Automated Reconciliation Engine</p>
                <p className="font-mono text-xs text-honey">billing@beeyield.com</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>BeeHUB IoT Hardware</span>
                </div>
                <p className="text-[11px] text-muted-foreground">LoRaWAN Gateway & Acoustic Sensors</p>
                <p className="font-mono text-xs text-honey">iot@beeyield.com</p>
              </div>
            </div>
          </div>

          {/* Active Support Tickets */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-honey" />
                Your Support Tickets & Responses ({supportTickets.length})
              </h4>
              <span className="text-[11px] text-muted-foreground font-medium">
                Live Support
              </span>
            </div>

            {supportTickets.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-2">
                <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs font-bold text-foreground">No active support inquiries</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Have questions regarding your honey shipment, M-Pesa transaction settlement, or BeeHUB sensor configuration?
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    className="p-4 rounded-xl border border-border bg-background space-y-3 shadow-sm hover:border-honey/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-honey">
                          #{tkt.ticket_number}
                        </span>
                        <h5 className="font-bold text-sm text-foreground">{tkt.subject}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                          {tkt.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tkt.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : (tkt.status as string) === "investigating" || tkt.status === "in_review"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {tkt.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tkt.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      {tkt.message}
                    </p>

                    {(tkt as any).response && (
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Official Support Response
                          <span className="text-[10px] font-mono text-muted-foreground font-normal">
                            — {(tkt as any).responded_at ? new Date((tkt as any).responded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{(tkt as any).response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Apiculture FAQs */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-honey" /> Frequently Asked Questions & Dispatch Policies
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h5 className="font-bold text-foreground">How is raw honey cold-chain protected during transit?</h5>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  All batches are shipped in temperature-regulated insulated cartons maintaining 18°C–24°C to preserve natural bioactive enzymes and prevent thermal caramelization.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h5 className="font-bold text-foreground">How does M-Pesa automatic STK Push checkout work?</h5>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Selecting M-Pesa sends an instant prompt to your phone. Enter your M-Pesa PIN to complete your payment safely and place your order immediately.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h5 className="font-bold text-foreground">What warranty applies to BeeHUB LoRa IoT gateways?</h5>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Every BeeHUB station includes a 24-month manufacturer warranty, IP67 weatherized enclosure replacement guarantee, and free firmware updates through BeeYield Cloud.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h5 className="font-bold text-foreground">How do promo vouchers (e.g., HONEY20) calculate discounts?</h5>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Valid vouchers deduct up to 20% off your cart subtotal. Free countrywide shipping automatically activates on all orders exceeding KES 5,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: EDIT CUSTOMER PROFILE ========== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-honey" /> Edit Customer Profile & Database Sync
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Full Legal / Apiary Name</label>
                <input
                  type="text"
                  value={profileDraft.full_name}
                  onChange={(e) => setProfileDraft({ ...profileDraft, full_name: e.target.value })}
                  placeholder="e.g. Timothy Nduva"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Phone Number (M-Pesa)</label>
                  <input
                    type="text"
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                    placeholder="254712345678"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono focus:ring-1 focus:ring-honey outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={profileDraft.country || "Kenya"}
                    onChange={(e) => setProfileDraft({ ...profileDraft, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Delivery Town / Market</label>
                  <input
                    type="text"
                    value={profileDraft.delivery_town || ""}
                    onChange={(e) => setProfileDraft({ ...profileDraft, delivery_town: e.target.value })}
                    placeholder="e.g. Kibwezi"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">County</label>
                  <input
                    type="text"
                    value={profileDraft.county || ""}
                    onChange={(e) => setProfileDraft({ ...profileDraft, county: e.target.value })}
                    placeholder="e.g. Makueni"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Associated Apiary or Farm Station</label>
                <input
                  type="text"
                  value={profileDraft.apiary_affiliation || ""}
                  onChange={(e) => setProfileDraft({ ...profileDraft, apiary_affiliation: e.target.value })}
                  placeholder="e.g. Kibwezi Forest Apiary (150 Active Hives)"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Apiculture Notes / Bio</label>
                <textarea
                  rows={2}
                  value={profileDraft.bio || ""}
                  onChange={(e) => setProfileDraft({ ...profileDraft, bio: e.target.value })}
                  placeholder="Describe your beekeeping focus or preferred flora products..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingProfile}
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-lg bg-honey hover:bg-honey-dark text-black font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: SUBMIT SUPPORT TICKET ========== */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-honey" /> Submit Official Support Inquiry
              </h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Inquiry Category</label>
                  <select
                    value={ticketDraft.category}
                    onChange={(e) => setTicketDraft({ ...ticketDraft, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                  >
                    <option value="general">General Support</option>
                    <option value="order">Order Tracking & Logistics</option>
                    <option value="delivery">Cold-Chain Delivery</option>
                    <option value="hardware">BeeHUB IoT Hardware</option>
                    <option value="payment">M-Pesa / Payment Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Related Order # (Optional)</label>
                  <input
                    type="text"
                    value={ticketDraft.order_id}
                    onChange={(e) => setTicketDraft({ ...ticketDraft, order_id: e.target.value })}
                    placeholder="e.g. ORD-9842"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono focus:ring-1 focus:ring-honey outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  value={ticketDraft.subject}
                  onChange={(e) => setTicketDraft({ ...ticketDraft, subject: e.target.value })}
                  placeholder="e.g. Temperature verification for Acacia honey consignment"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Detailed Inquiry Message</label>
                <textarea
                  rows={4}
                  value={ticketDraft.message}
                  onChange={(e) => setTicketDraft({ ...ticketDraft, message: e.target.value })}
                  placeholder="Please specify any consignment tracking codes, hardware sensor serial numbers, or payment M-Pesa transaction IDs..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-honey outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingTicket}
                onClick={handleSubmitTicket}
                className="px-5 py-2 rounded-lg bg-honey hover:bg-honey-dark text-black font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmittingTicket ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: LIVE CARRIER COLD-CHAIN TELEMETRY ========== */}
      {liveTrackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Live Consignment Telemetry
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Consignment #{liveTrackingModalOrder.order_number || liveTrackingModalOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiveTrackingModalOrder(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingTracking ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-honey animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Pinging fleet IoT tracking gateway...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Cold Chain Metrics Banner */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cold-Chain Integrity Verified
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {(liveTrackingInfo as any)?.telemetry?.temperature || "21.4°C"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Carrier:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {(liveTrackingInfo as any)?.carrier || "BeeYield Express Cold-Chain"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {(liveTrackingInfo as any)?.telemetry?.humidity || "48% RH (Safe)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Waypoint Timeline */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-xs">Consignment Route & Waypoint Status</h4>
                  <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <p className="font-bold text-foreground">Kibwezi Drylands Depot (Origin)</p>
                      <p className="text-[11px] text-muted-foreground">Raw batch inspected, sealed & temperature-logged.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-honey text-black flex items-center justify-center text-[10px] animate-pulse">
                        ●
                      </div>
                      <p className="font-bold text-foreground">In Transit — Mombasa-Nairobi Highway</p>
                      <p className="text-[11px] text-muted-foreground">
                        Current Location: {(liveTrackingInfo as any)?.telemetry?.current_location || "Mtito Andei Checkpoint"}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                        ○
                      </div>
                      <p className="font-bold text-muted-foreground">Recipient Delivery Location</p>
                      <p className="text-[11px] text-muted-foreground">
                        Estimated Arrival: {liveTrackingInfo?.estimated_delivery ? new Date(liveTrackingInfo.estimated_delivery).toLocaleDateString() : "Next Business Day"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-muted/20 text-[11px] text-muted-foreground">
                  Waybill tracking number: <span className="font-mono text-foreground font-bold">{(liveTrackingInfo as any)?.waybill_number || `WB-${liveTrackingModalOrder.id.slice(0, 8).toUpperCase()}`}</span>. Real-time GPS location is refreshed every 5 minutes from onboard telematics.
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setLiveTrackingModalOrder(null)}
                className="px-4 py-2 rounded-lg bg-honey hover:bg-honey-dark text-black font-bold text-xs shadow-sm"
              >
                Close Tracking
              </button>
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
            This action cannot be undone. It will remove this item from your account.
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

  const authModal = (
    <ShopAuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      defaultTab={authModalTab}
    />
  );

  const mpesaModal = mpesaModalData && (
    <MpesaPaymentModal
      isOpen={showMpesaModal}
      onClose={() => setShowMpesaModal(false)}
      orderId={mpesaModalData.orderId}
      orderNumber={mpesaModalData.orderNumber}
      amount={mpesaModalData.amount}
      phone={mpesaModalData.phone}
      checkoutRequestId={mpesaModalData.checkoutRequestId}
      idempotencyKey={mpesaModalData.idempotencyKey}
      onPaymentSuccess={handleMpesaDashboardSuccess}
    />
  );

  if (embedded) {
    return (
      <div className="w-full space-y-6">
        {mainContent}
        {alertDialog}
        {authModal}
        {mpesaModal}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {mainContent}
        {alertDialog}
        {authModal}
        {mpesaModal}
      </div>
    </div>
  );
}

export default function ShopDashboard(props: ShopDashboardProps) {
  const ctx = useContext(ShopAuthContext);
  if (!ctx || ctx === defaultShopAuthContext) {
    return (
      <ShopAuthProvider>
        <ShopDashboardInner {...props} />
      </ShopAuthProvider>
    );
  }
  return <ShopDashboardInner {...props} />;
}
