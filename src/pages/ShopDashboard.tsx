import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  LayoutGrid,
  Loader2,
  MapPin,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import ShopDashboardLayout from "@/components/shop/ShopDashboardLayout";
import type { ShopNavItem } from "@/components/shop/ShopDashboardSidebar";
import { StripeCardForm } from "@/components/payments/StripeCardForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  addAddress,
  addPaymentMethod,
  cancelOrder,
  deleteAddress,
  deletePaymentMethod,
  getShopDashboard,
  updateAddress,
  updatePaymentMethod,
  waitForVaultedPaymentMethod,
  type Address,
  type Order,
  type PaymentMethod,
  type ShopDashboardSummary,
} from "@/services/shopService";

type DashboardTab =
  | "overview"
  | "orders"
  | "addresses"
  | "payments"
  | "suggestions"
  | "profile"
  | "favorites"
  | "checkout"
  | "help";

const EMPTY_ADDRESS_FORM = {
  id: "",
  name: "Primary address",
  email: "",
  phone: "",
  street: "",
  city: "",
  county: "",
  postal_code: "",
  is_default: false,
};

const EMPTY_PAYMENT_FORM = {
  type: "mpesa" as "mpesa" | "card",
  phone: "",
  card_holder_name: "",
  is_default: false,
};

const formatPrice = (amount: number) => `KES ${amount.toLocaleString()}`;

const statusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized === "shipped") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (normalized === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) => (
  <Card className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
    <CardContent className="space-y-2 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-3xl font-black tracking-tight text-[#1A1A1A]">{value}</p>
      <p className="text-sm leading-6 text-[#1B4332]/72">{helper}</p>
    </CardContent>
  </Card>
);

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, updateUser } = useAuth();
  const { items: cartItems, addToCart, getTotalItems, getTotalPrice } = useCart();

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [dashboard, setDashboard] = useState<ShopDashboardSummary | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as DashboardTab | null;
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const metadata = user.user_metadata || {};
    setProfileForm({
      firstName: metadata.first_name || "",
      lastName: metadata.last_name || "",
      email: user.email || "",
      phone: metadata.phone || "",
    });
  }, [user]);

  const refreshDashboard = async (showSpinner = false) => {
    if (!user) return;

    if (showSpinner) {
      setRefreshing(true);
    } else {
      setIsLoadingDashboard(true);
    }

    try {
      const summary = await getShopDashboard();
      setDashboard(summary);
    } catch (error) {
      console.error("Failed to load shop dashboard:", error);
      toast.error("Failed to load customer dashboard");
    } finally {
      setIsLoadingDashboard(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void refreshDashboard();
  }, [user]);

  const navItems: ShopNavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "suggestions", label: "Suggestions", icon: Gift },
    { id: "profile", label: "Profile", icon: User },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "checkout", label: "Checkout", icon: ShoppingBag, hidden: cartItems.length === 0 },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  const stats = dashboard?.stats;
  const recentOrders = dashboard?.recent_orders || [];
  const addresses = dashboard?.addresses || [];
  const paymentMethods = dashboard?.payment_methods || [];
  const favorites = dashboard?.wishlist || [];
  const recommendations = dashboard?.recommendations || [];

  const summaryCards = useMemo(
    () => [
      {
        label: "Orders",
        value: String(stats?.total_orders || 0),
        helper: `${stats?.active_orders || 0} currently moving through fulfillment.`,
      },
      {
        label: "Spend",
        value: formatPrice(stats?.total_spent_kes || 0),
        helper: `${stats?.completed_orders || 0} completed orders recorded.`,
      },
      {
        label: "Addresses",
        value: String(stats?.saved_addresses || 0),
        helper: "Saved locations for faster delivery selection.",
      },
      {
        label: "Payments",
        value: String(stats?.saved_payment_methods || 0),
        helper: "Stored payment methods available for fast checkout.",
      },
    ],
    [stats],
  );

  const handleTabChange = (tab: string) => {
    const nextTab = tab as DashboardTab;
    setActiveTab(nextTab);
    navigate(`/my-account?tab=${nextTab}`, { replace: true });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/shop");
  };

  const openNewAddressDialog = () => {
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      email: user?.email || "",
      phone: profileForm.phone,
      name: `${profileForm.firstName || "Customer"} delivery address`,
    });
    setIsAddressDialogOpen(true);
  };

  const editAddress = (address: Address) => {
    setAddressForm({
      id: address.id,
      name: address.name,
      email: address.email || "",
      phone: address.phone,
      street: address.street,
      city: address.city,
      county: address.county,
      postal_code: address.postal_code || "",
      is_default: address.is_default,
    });
    setIsAddressDialogOpen(true);
  };

  const saveAddressForm = async () => {
    setSavingAddress(true);
    try {
      if (addressForm.id) {
        await updateAddress(addressForm.id, addressForm);
        toast.success("Address updated");
      } else {
        await addAddress(addressForm);
        toast.success("Address added");
      }
      setIsAddressDialogOpen(false);
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId);
      toast.success("Address removed");
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not remove address");
    }
  };

  const setDefaultAddress = async (address: Address) => {
    try {
      await updateAddress(address.id, { ...address, is_default: true });
      toast.success("Default delivery address updated");
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not update default address");
    }
  };

  const saveMpesaMethod = async () => {
    setSavingPayment(true);
    try {
      const normalizedPhone = paymentForm.phone.replace(/\s+/g, "");
      await addPaymentMethod({
        type: "mpesa",
        provider: "M-Pesa",
        last4: normalizedPhone.slice(-4),
        card_holder_name: paymentForm.card_holder_name || `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        is_default: paymentForm.is_default,
      });
      toast.success("M-Pesa method saved");
      setIsPaymentDialogOpen(false);
      setPaymentForm(EMPTY_PAYMENT_FORM);
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not save payment method");
    } finally {
      setSavingPayment(false);
    }
  };

  const makeDefaultPaymentMethod = async (method: PaymentMethod) => {
    try {
      await updatePaymentMethod(method.id, {
        ...method,
        is_default: true,
      });
      toast.success("Default payment method updated");
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not update payment method");
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    try {
      await deletePaymentMethod(methodId);
      toast.success("Payment method removed");
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not remove payment method");
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
      };
      await updateUser(payload);

      if (user?.id) {
        await supabase?.from("profiles").upsert(
          {
            id: user.id,
            first_name: profileForm.firstName,
            last_name: profileForm.lastName,
            phone: profileForm.phone,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }

      toast.success("Profile updated");
      await refreshDashboard(true);
    } catch (error) {
      toast.error("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const reorderOrder = (order: Order) => {
    for (const item of order.items) {
      const product = item.product;
      addToCart({
        productId: item.product_id,
        variantId: item.variant_id,
        name: item.product_name,
        description: product?.description || "Reordered from account history",
        size: item.variant_size,
        price: item.price_at_purchase || item.unit_price,
        quantity: item.quantity,
        image: item.product_image,
        category: product?.category || "honey",
        badge: product?.badge || null,
      });
    }
    toast.success("Items added back to cart");
    setActiveTab("checkout");
    navigate("/my-account?tab=checkout", { replace: true });
  };

  const handleCancelOrder = async (order: Order) => {
    try {
      await cancelOrder(order.id);
      toast.success("Order cancelled");
      await refreshDashboard(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel order");
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1B9157]">Customer workspace</p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#1A1A1A]">
            Manage orders, delivery preferences, and payment readiness.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#1B4332]/72">
            The shop dashboard is now tied to the ecommerce backend so saved addresses, cards, orders, and reorder actions stay in one flow.
          </p>
        </div>
        <Button className="h-11 rounded-full px-5 font-black shadow-glow" onClick={() => navigate("/shop")}>
          Continue shopping
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} helper={card.helper} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-xl font-black text-[#1A1A1A]">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {recentOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-[1.5rem] border border-border/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#1A1A1A]">{order.order_number}</p>
                    <p className="text-sm text-[#1B4332]/72">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusBadgeClass(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-[#1B4332]/72">{order.items.length} line items</p>
                  <p className="text-lg font-black text-[#1A1A1A]">{formatPrice(order.total_amount)}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm leading-6 text-[#1B4332]/72">No order history yet. Start with the store and your purchases will appear here.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-xl font-black text-[#1A1A1A]">Ready for faster checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {[
              {
                title: "Saved delivery points",
                description: `${addresses.length} addresses available for instant delivery selection.`,
                done: addresses.length > 0,
              },
              {
                title: "Saved payment methods",
                description: `${paymentMethods.length} payment methods synced to your account.`,
                done: paymentMethods.length > 0,
              },
              {
                title: "Live cart handoff",
                description: `${getTotalItems()} items currently ready for checkout.`,
                done: getTotalItems() > 0,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-4">
                <div className="flex items-start gap-3">
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1B9157]" />
                  ) : (
                    <Clock3 className="mt-0.5 h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-black text-[#1A1A1A]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#1B4332]/72">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1B9157]">Orders</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A]">Track and manage every purchase</h2>
        </div>
        <Button variant="outline" className="rounded-full font-black" onClick={() => refreshDashboard(true)} disabled={refreshing}>
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>
      <div className="space-y-4">
        {recentOrders.map((order) => (
          <Card key={order.id} className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-[#1A1A1A]">{order.order_number}</p>
                  <p className="text-sm text-[#1B4332]/72">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusBadgeClass(order.status)}`}>
                    {order.status}
                  </Badge>
                  <span className="text-lg font-black text-[#1A1A1A]">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-[1.25rem] border border-border/40 bg-[#f9f7f2] p-4">
                    <p className="font-black text-[#1A1A1A]">{item.product_name}</p>
                    <p className="text-sm text-[#1B4332]/72">
                      {item.variant_size} · Qty {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-full font-black" onClick={() => reorderOrder(order)}>
                  Reorder
                </Button>
                {["pending", "processing"].includes(order.status.toLowerCase()) && (
                  <Button variant="outline" className="rounded-full font-black text-red-600" onClick={() => handleCancelOrder(order)}>
                    Cancel order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1B9157]">Addresses</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A]">Delivery locations</h2>
        </div>
        <Button className="rounded-full font-black shadow-glow" onClick={openNewAddressDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add address
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-[#1A1A1A]">{address.name}</p>
                  <p className="text-sm leading-6 text-[#1B4332]/72">
                    {address.street}, {address.city}, {address.county}
                  </p>
                </div>
                {address.is_default && (
                  <Badge className="rounded-full border border-[#1B9157]/15 bg-[#eef7f1] text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157]">
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-full font-black" onClick={() => editAddress(address)}>
                  Edit
                </Button>
                <Button variant="outline" className="rounded-full font-black" onClick={() => setDefaultAddress(address)}>
                  Make default
                </Button>
                <Button variant="outline" className="rounded-full font-black text-red-600" onClick={() => removeAddress(address.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1B9157]">Payments</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A]">Saved methods for faster checkout</h2>
        </div>
        <Button className="rounded-full font-black shadow-glow" onClick={() => setIsPaymentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add payment
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-[#1A1A1A]">
                    {method.type === "mpesa" ? "M-Pesa" : method.provider || method.brand || "Card"}
                  </p>
                  <p className="text-sm leading-6 text-[#1B4332]/72">
                    Ending in {method.last4 || "0000"}
                    {method.expiry_month && method.expiry_year
                      ? ` · Expires ${String(method.expiry_month).padStart(2, "0")}/${String(method.expiry_year).slice(-2)}`
                      : ""}
                  </p>
                </div>
                {method.is_default && (
                  <Badge className="rounded-full border border-[#1B9157]/15 bg-[#eef7f1] text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157]">
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-full font-black" onClick={() => makeDefaultPaymentMethod(method)}>
                  Make default
                </Button>
                <Button variant="outline" className="rounded-full font-black text-red-600" onClick={() => removePaymentMethod(method.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {recommendations.map((product) => (
        <Card key={product.id} className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
          <CardContent className="space-y-4 p-5">
            <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-[#f9f7f2]">
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-lg font-black text-[#1A1A1A]">{product.name}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#1B4332]/72">{product.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-[#1A1A1A]">{formatPrice(product.variants[0]?.price_kes || 0)}</span>
              <Button className="rounded-full font-black" onClick={() => navigate("/shop")}>
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderProfile = () => (
    <Card className="max-w-3xl rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
      <CardHeader className="border-b border-border/40">
        <CardTitle className="text-2xl font-black text-[#1A1A1A]">Profile and contact identity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input value={profileForm.firstName} onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input value={profileForm.lastName} onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profileForm.email} disabled />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <Button className="rounded-full font-black shadow-glow" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFavorites = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {favorites.map((item) => (
        <Card key={item.id} className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
          <CardContent className="space-y-4 p-5">
            <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-[#f9f7f2]">
              {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <p className="text-lg font-black text-[#1A1A1A]">{item.name}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#1B4332]/72">{item.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-[#1A1A1A]">{formatPrice(item.price)}</span>
              <Button className="rounded-full font-black" onClick={() => navigate("/shop")}>
                Shop item
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {favorites.length === 0 && <p className="text-sm leading-6 text-[#1B4332]/72">No wishlist items have been synced to your account yet.</p>}
    </div>
  );

  const renderCheckoutTab = () => (
    <Card className="max-w-3xl rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
      <CardHeader className="border-b border-border/40">
        <CardTitle className="text-2xl font-black text-[#1A1A1A]">Cart handoff</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <p className="text-sm leading-6 text-[#1B4332]/72">
          {getTotalItems()} items are currently staged for checkout, worth {formatPrice(getTotalPrice())}.
        </p>
        <Button className="rounded-full font-black shadow-glow" onClick={() => navigate("/checkout")}>
          Continue to checkout
        </Button>
      </CardContent>
    </Card>
  );

  const renderHelp = () => (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { icon: Truck, title: "Delivery help", description: "Questions about dispatch timing, pickup confirmation, or courier status." },
        { icon: CreditCard, title: "Payment support", description: "Need help with M-Pesa or a saved card on the shop account." },
        { icon: Package, title: "Order issues", description: "Need a reorder, cancellation, or help reconciling a purchase." },
      ].map((item) => (
        <Card key={item.title} className="rounded-[1.75rem] border border-border/40 bg-white shadow-soft">
          <CardContent className="space-y-3 p-5">
            <item.icon className="h-6 w-6 text-[#1B9157]" />
            <p className="text-lg font-black text-[#1A1A1A]">{item.title}</p>
            <p className="text-sm leading-6 text-[#1B4332]/72">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    if (!dashboard) return null;
    switch (activeTab) {
      case "orders":
        return renderOrders();
      case "addresses":
        return renderAddresses();
      case "payments":
        return renderPayments();
      case "suggestions":
        return renderSuggestions();
      case "profile":
        return renderProfile();
      case "favorites":
        return renderFavorites();
      case "checkout":
        return renderCheckoutTab();
      case "help":
        return renderHelp();
      default:
        return renderOverview();
    }
  };

  if (loading || isLoadingDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F2]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B9157]" />
      </div>
    );
  }

  if (!user || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F2] px-4">
        <Card className="max-w-xl rounded-[2rem] border border-border/40 bg-white shadow-soft">
          <CardContent className="space-y-4 p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="text-3xl font-black text-[#1A1A1A]">Customer dashboard unavailable</h1>
            <p className="text-sm leading-6 text-[#1B4332]/72">Sign in again and reload the workspace to restore your saved shop data.</p>
            <Button className="rounded-full font-black shadow-glow" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ShopDashboardLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} navItems={navItems}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          {renderContent()}
        </motion.div>
      </ShopDashboardLayout>

      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem]">
          <DialogHeader>
            <DialogTitle>{addressForm.id ? "Edit address" : "Add address"}</DialogTitle>
            <DialogDescription>Saved delivery points are available immediately in checkout.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input value={addressForm.name} onChange={(event) => setAddressForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={addressForm.email} onChange={(event) => setAddressForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Street</Label>
              <Input value={addressForm.street} onChange={(event) => setAddressForm((current) => ({ ...current, street: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Input value={addressForm.county} onChange={(event) => setAddressForm((current) => ({ ...current, county: event.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={addressForm.is_default} onChange={(event) => setAddressForm((current) => ({ ...current, is_default: event.target.checked }))} />
            <span className="text-sm">Set as default delivery address</span>
          </div>
          <Button className="rounded-full font-black shadow-glow" onClick={saveAddressForm} disabled={savingAddress}>
            {savingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save address
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem]">
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription>Store an M-Pesa shortcut or verify a new card for account checkout.</DialogDescription>
          </DialogHeader>
          <RadioGroup value={paymentForm.type} onValueChange={(value) => setPaymentForm((current) => ({ ...current, type: value as "mpesa" | "card" }))} className="grid gap-3 md:grid-cols-2">
            <label className={`rounded-[1.25rem] border p-4 ${paymentForm.type === "mpesa" ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="mpesa" id="pm-mpesa" className="mt-1" />
                <div>
                  <p className="font-black text-[#1A1A1A]">M-Pesa</p>
                  <p className="text-sm leading-6 text-[#1B4332]/72">Use the phone number shortcut for checkout.</p>
                </div>
              </div>
            </label>
            <label className={`rounded-[1.25rem] border p-4 ${paymentForm.type === "card" ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="card" id="pm-card" className="mt-1" />
                <div>
                  <p className="font-black text-[#1A1A1A]">Card</p>
                  <p className="text-sm leading-6 text-[#1B4332]/72">Verify securely through Stripe.</p>
                </div>
              </div>
            </label>
          </RadioGroup>

          {paymentForm.type === "mpesa" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>M-Pesa phone</Label>
                <Input value={paymentForm.phone} onChange={(event) => setPaymentForm((current) => ({ ...current, phone: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Account label</Label>
                <Input value={paymentForm.card_holder_name} onChange={(event) => setPaymentForm((current) => ({ ...current, card_holder_name: event.target.value }))} placeholder="Main business line" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={paymentForm.is_default} onChange={(event) => setPaymentForm((current) => ({ ...current, is_default: event.target.checked }))} />
                <span className="text-sm">Set as default payment method</span>
              </div>
              <Button className="rounded-full font-black shadow-glow" onClick={saveMpesaMethod} disabled={savingPayment}>
                {savingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save payment method
              </Button>
            </div>
          ) : (
            <StripeCardForm
              mode="save"
              buttonText="Verify and store card"
              onSuccess={async (paymentMethodResult) => {
                try {
                  const vaulted = await waitForVaultedPaymentMethod(paymentMethodResult.paymentMethodId || paymentMethodResult.id);
                  if (vaulted && paymentForm.is_default) {
                    await updatePaymentMethod(vaulted.id, { ...vaulted, is_default: true });
                  }
                  toast.success("Card saved");
                  setIsPaymentDialogOpen(false);
                  setPaymentForm(EMPTY_PAYMENT_FORM);
                  await refreshDashboard(true);
                } catch (error) {
                  toast.error("Card verified, but final sync took too long");
                }
              }}
              onError={(error) => toast.error(error instanceof Error ? error.message : String(error))}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopDashboard;
