import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Store,
  TicketPercent,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { StripeCardForm } from "@/components/payments/StripeCardForm";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import {
  getAddresses,
  getPaymentMethods,
  initializeCheckout,
  validateCoupon,
  waitForVaultedPaymentMethod,
  type Address,
  type CheckoutOrder,
  type PaymentMethod,
} from "@/services/shopService";

type CheckoutStep = "review" | "details" | "confirm" | "success";
type DeliveryMethod = "delivery" | "pickup";
type PaymentChoice = "mpesa" | "card";

const KENYAN_PICKUP_POINTS = [
  "Westlands collection point",
  "Karen collection point",
  "Mombasa collection point",
];

const formatPrice = (amount: number) => `KES ${amount.toLocaleString()}`;

const Checkout = () => {
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("review");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("mpesa");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [isLoadingAccountData, setIsLoadingAccountData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    orderNumber: string;
    totals: { subtotal: number; shipping: number; discount: number; total: number };
    purchasedItems: typeof items;
  } | null>(null);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    county: "",
    postalCode: "",
    notes: "",
    pickupPoint: KENYAN_PICKUP_POINTS[0],
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const metadata = user.user_metadata || {};
    setShippingDetails((current) => ({
      ...current,
      fullName:
        `${metadata.first_name || ""} ${metadata.last_name || ""}`.trim() || current.fullName,
      email: user.email || current.email,
      phone: metadata.phone || current.phone,
      address: metadata.address || current.address,
      city: metadata.city || current.city,
      county: metadata.county || current.county,
    }));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setSavedCards([]);
      return;
    }

    let cancelled = false;

    const loadAccountData = async () => {
      setIsLoadingAccountData(true);
      try {
        const [addresses, paymentMethods] = await Promise.all([getAddresses(), getPaymentMethods()]);
        if (cancelled) return;

        const cards = paymentMethods.filter((method) => method.type === "card");
        setSavedAddresses(addresses);
        setSavedCards(cards);

        const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
        const defaultCard =
          cards.find((method) => method.is_default) || cards.find((method) => method.status === "active") || cards[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setShippingDetails((current) => ({
            ...current,
            fullName: defaultAddress.name || current.fullName,
            email: defaultAddress.email || current.email,
            phone: defaultAddress.phone || current.phone,
            address: defaultAddress.street || current.address,
            city: defaultAddress.city || current.city,
            county: defaultAddress.county || current.county,
            postalCode: defaultAddress.postal_code || current.postalCode,
          }));
        }

        if (defaultCard) {
          setSelectedCardId(defaultCard.id);
        }
      } catch (error) {
        console.error("Failed to load checkout account data:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingAccountData(false);
        }
      }
    };

    void loadAccountData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const subtotal = getTotalPrice();
  const shippingCost = deliveryMethod === "delivery" ? (subtotal >= 5000 ? 0 : 350) : 0;
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);
  const selectedCard = savedCards.find((method) => method.id === selectedCardId) || null;

  const stepIndex = {
    review: 0,
    details: 1,
    confirm: 2,
    success: 3,
  }[currentStep];

  const orderStatusCopy = useMemo(() => {
    if (deliveryMethod === "pickup") {
      return "Pickup confirmation will be sent as soon as the order is packed.";
    }
    return "Dispatch status will update once the package is handed to the courier.";
  }, [deliveryMethod]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (!result.valid) {
        toast.error(result.message);
        return;
      }

      setAppliedCoupon({ code: result.code, discountPercent: result.discount_percent });
      toast.success(result.message);
    } catch (error) {
      toast.error("Coupon validation failed");
    } finally {
      setCouponLoading(false);
    }
  };

  const validateDetailsStep = () => {
    if (!shippingDetails.fullName || !shippingDetails.email || !shippingDetails.phone) {
      toast.error("Complete your contact details");
      return false;
    }

    if (deliveryMethod === "delivery" && (!shippingDetails.address || !shippingDetails.city || !shippingDetails.county)) {
      toast.error("Add the delivery address to continue");
      return false;
    }

    return true;
  };

  const validatePaymentStep = () => {
    if (paymentMethod === "mpesa" && shippingDetails.phone.trim().length < 9) {
      toast.error("Add a valid M-Pesa phone number");
      return false;
    }

    if (paymentMethod === "card") {
      if (!user) {
        toast.error("Sign in before checking out with card");
        return false;
      }

      if (!selectedCard && !stripePaymentMethodId) {
        toast.error("Verify or choose a saved card");
        return false;
      }
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateDetailsStep() || !validatePaymentStep()) {
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: CheckoutOrder = {
        shipping_address: {
          first_name: shippingDetails.fullName.split(" ")[0] || "",
          last_name: shippingDetails.fullName.split(" ").slice(1).join(" "),
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: deliveryMethod === "pickup" ? shippingDetails.pickupPoint : shippingDetails.address,
          city: shippingDetails.city || "Nairobi",
          county: shippingDetails.county || "Nairobi",
          postal_code: shippingDetails.postalCode,
        },
        payment_method: paymentMethod,
        payment_method_id:
          paymentMethod === "card"
            ? selectedCard?.stripe_payment_method_id || selectedCard?.id || stripePaymentMethodId || undefined
            : undefined,
        delivery_method: deliveryMethod,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
        total_kes: total,
        coupon_code: appliedCoupon?.code,
        notes: shippingDetails.notes,
        idempotency_key: crypto.randomUUID(),
      };

      const response = await initializeCheckout(orderData);

      setOrderConfirmation({
        orderId: response.order_id,
        orderNumber: response.order_number || response.order_id,
        totals: {
          subtotal,
          shipping: shippingCost,
          discount: discountAmount,
          total,
        },
        purchasedItems: items,
      });
      clearCart();
      setCurrentStep("success");
      toast.success("Order placed successfully");
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const applySavedAddress = (addressId: string) => {
    const address = savedAddresses.find((entry) => entry.id === addressId);
    if (!address) return;

    setSelectedAddressId(addressId);
    setShippingDetails((current) => ({
      ...current,
      fullName: address.name || current.fullName,
      email: address.email || current.email,
      phone: address.phone || current.phone,
      address: address.street,
      city: address.city,
      county: address.county,
      postalCode: address.postal_code || "",
    }));
  };

  if (items.length === 0 && currentStep !== "success") {
    return (
      <BeeYieldPageShell className="bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-12">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-11 w-11 text-muted-foreground/60" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">Your cart is empty</h1>
              <p className="mx-auto max-w-lg text-sm leading-6 text-[#1B4332]/75">
                Build a basket from the live store and return here for delivery, pickup, and payment confirmation.
              </p>
            </div>
            <Button asChild className="h-12 rounded-full px-6 text-sm font-black shadow-glow">
              <Link to="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue shopping
              </Link>
            </Button>
          </div>
        </div>
      </BeeYieldPageShell>
    );
  }

  return (
    <BeeYieldPageShell className="bg-background">
      <section className="border-b border-border/40 bg-[linear-gradient(180deg,_rgba(255,249,240,0.96)_0%,_rgba(249,247,242,0.92)_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-4">
              <Badge className="rounded-full border border-[#1B9157]/15 bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1B9157]">
                Secure Checkout
              </Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-[#1A1A1A] md:text-5xl">
                  Checkout built for verified honey orders, repeat customers, and clean fulfillment.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-[#1B4332]/76">
                  Review the cart, confirm delivery or pickup, then place the order with M-Pesa or a saved card.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Review", icon: ShoppingCart },
                { label: "Details", icon: MapPin },
                { label: "Payment", icon: CreditCard },
                { label: "Complete", icon: CheckCircle2 },
              ].map((step, index) => (
                <div
                  key={step.label}
                  className={`rounded-[1.5rem] border px-4 py-4 ${
                    index <= stepIndex ? "border-[#1A1A1A]/10 bg-[#1A1A1A] text-white" : "border-border/50 bg-white/80 text-[#1A1A1A]"
                  }`}
                >
                  <step.icon className={`mb-4 h-5 w-5 ${index <= stepIndex ? "text-[#F4D03F]" : "text-[#1B9157]"}`} />
                  <p className="text-[11px] font-black uppercase tracking-[0.16em]">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {currentStep === "success" && orderConfirmation ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="overflow-hidden rounded-[2rem] border border-border/50 shadow-soft">
              <div className="border-b border-border/40 bg-[#1A1A1A] px-6 py-8 text-white md:px-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-3">
                    <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      Order confirmed
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tight">Thank you. Your order is now in the queue.</h2>
                    <p className="max-w-2xl text-sm leading-6 text-white/72">
                      Reference <span className="font-bold text-white">{orderConfirmation.orderNumber}</span>. {orderStatusCopy}
                    </p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4D03F] text-[#1A1A1A]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <CardContent className="space-y-6 px-6 py-6 md:px-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Order number</p>
                    <p className="mt-2 text-lg font-black text-[#1A1A1A]">{orderConfirmation.orderNumber}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Fulfillment</p>
                    <p className="mt-2 text-lg font-black text-[#1A1A1A] capitalize">{deliveryMethod}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Total paid</p>
                    <p className="mt-2 text-lg font-black text-[#1A1A1A]">{formatPrice(orderConfirmation.totals.total)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {orderConfirmation.purchasedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-[1.5rem] border border-border/40 p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-muted">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-black text-[#1A1A1A]">{item.name}</p>
                        <p className="text-sm text-[#1B4332]/74">
                          {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-base font-black text-[#1A1A1A]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[2rem] border border-border/50 shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-black text-[#1A1A1A]">Next steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: ShieldCheck, title: "Payment recorded", description: "Your order reference is available now and tied to the backend order record." },
                    { icon: Package, title: "Fulfillment started", description: deliveryMethod === "pickup" ? "Pickup instructions will be sent once the order is packed." : "Dispatch will move to shipment after packing and courier handoff." },
                    { icon: Truck, title: "Status visibility", description: "Track new and previous orders from the customer dashboard." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-4">
                      <item.icon className="mb-3 h-5 w-5 text-[#1B9157]" />
                      <p className="font-black text-[#1A1A1A]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#1B4332]/72">{item.description}</p>
                    </div>
                  ))}
                  <Button asChild className="h-12 w-full rounded-full text-sm font-black shadow-glow">
                    <Link to="/my-account">
                      Go to dashboard
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              {currentStep === "review" && (
                <Card className="rounded-[2rem] border border-border/50 shadow-soft">
                  <CardHeader className="border-b border-border/40">
                    <CardTitle className="text-2xl font-black text-[#1A1A1A]">
                      Review basket · {getTotalItems()} item{getTotalItems() === 1 ? "" : "s"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-[1.75rem] border border-border/40 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-muted">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xl font-black text-[#1A1A1A]">{item.name}</p>
                                <p className="text-sm text-[#1B4332]/72">
                                  {item.size} · {item.description}
                                </p>
                              </div>
                              <p className="text-lg font-black text-[#1A1A1A]">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <div className="flex items-center rounded-full border border-border/50">
                                <button className="px-4 py-2 text-sm font-black" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                  -
                                </button>
                                <span className="min-w-[48px] text-center text-sm font-black">{item.quantity}</span>
                                <button className="px-4 py-2 text-sm font-black" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                  +
                                </button>
                              </div>
                              <Button variant="ghost" className="rounded-full text-sm font-semibold text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {currentStep === "details" && (
                <Card className="rounded-[2rem] border border-border/50 shadow-soft">
                  <CardHeader className="border-b border-border/40">
                    <CardTitle className="text-2xl font-black text-[#1A1A1A]">Fulfillment details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-[#1A1A1A]">How should we fulfill this order?</p>
                          <p className="text-sm text-[#1B4332]/72">Choose delivery or customer pickup before payment confirmation.</p>
                        </div>
                        {user && isLoadingAccountData && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                      <RadioGroup
                        value={deliveryMethod}
                        onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}
                        className="grid gap-3 md:grid-cols-2"
                      >
                        <label className={`rounded-[1.5rem] border p-4 ${deliveryMethod === "delivery" ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[#1A1A1A]">
                                <Truck className="h-4 w-4 text-[#1B9157]" />
                                <span className="font-black">Courier delivery</span>
                              </div>
                              <p className="text-sm leading-6 text-[#1B4332]/72">Dispatch to the address on file. Free above KES 5,000.</p>
                            </div>
                          </div>
                        </label>
                        <label className={`rounded-[1.5rem] border p-4 ${deliveryMethod === "pickup" ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[#1A1A1A]">
                                <Store className="h-4 w-4 text-[#1B9157]" />
                                <span className="font-black">Pickup point</span>
                              </div>
                              <p className="text-sm leading-6 text-[#1B4332]/72">Collect from the closest BeeYield point once we confirm packing.</p>
                            </div>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    {savedAddresses.length > 0 && deliveryMethod === "delivery" && (
                      <div className="space-y-3">
                        <p className="text-lg font-black text-[#1A1A1A]">Saved addresses</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {savedAddresses.map((address) => (
                            <button
                              type="button"
                              key={address.id}
                              onClick={() => applySavedAddress(address.id)}
                              className={`rounded-[1.5rem] border p-4 text-left transition-all ${
                                selectedAddressId === address.id ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white hover:border-[#1B9157]/20"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-black text-[#1A1A1A]">{address.name}</p>
                                {address.is_default && (
                                  <Badge className="rounded-full border border-[#1B9157]/15 bg-white text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157]">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-[#1B4332]/72">
                                {address.street}, {address.city}, {address.county}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="checkout-name">Full name</Label>
                        <Input id="checkout-name" value={shippingDetails.fullName} onChange={(event) => setShippingDetails((current) => ({ ...current, fullName: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkout-email">Email</Label>
                        <Input id="checkout-email" type="email" value={shippingDetails.email} onChange={(event) => setShippingDetails((current) => ({ ...current, email: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkout-phone">Phone</Label>
                        <Input id="checkout-phone" type="tel" value={shippingDetails.phone} onChange={(event) => setShippingDetails((current) => ({ ...current, phone: event.target.value }))} placeholder="07xx xxx xxx" />
                      </div>

                      {deliveryMethod === "delivery" ? (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="checkout-address">Street address</Label>
                            <Input id="checkout-address" value={shippingDetails.address} onChange={(event) => setShippingDetails((current) => ({ ...current, address: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checkout-city">City</Label>
                            <Input id="checkout-city" value={shippingDetails.city} onChange={(event) => setShippingDetails((current) => ({ ...current, city: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checkout-county">County</Label>
                            <Input id="checkout-county" value={shippingDetails.county} onChange={(event) => setShippingDetails((current) => ({ ...current, county: event.target.value }))} />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="pickup-point">Pickup point</Label>
                          <RadioGroup value={shippingDetails.pickupPoint} onValueChange={(value) => setShippingDetails((current) => ({ ...current, pickupPoint: value }))} className="grid gap-3 md:grid-cols-3">
                            {KENYAN_PICKUP_POINTS.map((point) => (
                              <label key={point} className={`rounded-[1.25rem] border p-4 ${shippingDetails.pickupPoint === point ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
                                <div className="flex items-start gap-3">
                                  <RadioGroupItem value={point} id={point} className="mt-1" />
                                  <span className="text-sm font-semibold text-[#1A1A1A]">{point}</span>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="checkout-notes">Order notes</Label>
                        <Textarea id="checkout-notes" rows={4} value={shippingDetails.notes} onChange={(event) => setShippingDetails((current) => ({ ...current, notes: event.target.value }))} placeholder="Delivery instructions, gate code, or pickup preference" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === "confirm" && (
                <Card className="rounded-[2rem] border border-border/50 shadow-soft">
                  <CardHeader className="border-b border-border/40">
                    <CardTitle className="text-2xl font-black text-[#1A1A1A]">Payment confirmation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-6">
                    <div className="space-y-4">
                      <p className="text-lg font-black text-[#1A1A1A]">Choose payment method</p>
                      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentChoice)} className="grid gap-3 md:grid-cols-2">
                        <label className={`rounded-[1.5rem] border p-4 ${paymentMethod === "mpesa" ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="mpesa" id="mpesa" className="mt-1" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[#1A1A1A]">
                                <Smartphone className="h-4 w-4 text-[#1B9157]" />
                                <span className="font-black">M-Pesa</span>
                              </div>
                              <p className="text-sm leading-6 text-[#1B4332]/72">Push payment to the phone number on the order.</p>
                            </div>
                          </div>
                        </label>
                        <label className={`rounded-[1.5rem] border p-4 ${paymentMethod === "card" ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"}`}>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="card" id="card" className="mt-1" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[#1A1A1A]">
                                <CreditCard className="h-4 w-4 text-[#1B9157]" />
                                <span className="font-black">Saved card</span>
                              </div>
                              <p className="text-sm leading-6 text-[#1B4332]/72">Available to signed-in customers with a vaulted Stripe card.</p>
                            </div>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    {paymentMethod === "mpesa" && (
                      <div className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-5">
                        <p className="text-lg font-black text-[#1A1A1A]">M-Pesa confirmation</p>
                        <p className="mt-2 text-sm leading-6 text-[#1B4332]/72">
                          We will send the STK push request to <span className="font-bold text-[#1A1A1A]">{shippingDetails.phone || "your phone number"}</span> after the order is submitted.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-4">
                        {!user ? (
                          <div className="rounded-[1.5rem] border border-dashed border-border p-5">
                            <p className="text-lg font-black text-[#1A1A1A]">Sign in for card checkout</p>
                            <p className="mt-2 text-sm leading-6 text-[#1B4332]/72">
                              Saved cards are linked to your shop account. Continue with M-Pesa or sign in first.
                            </p>
                            <Button asChild variant="outline" className="mt-4 rounded-full">
                              <Link to="/login">Sign in</Link>
                            </Button>
                          </div>
                        ) : (
                          <>
                            {savedCards.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-lg font-black text-[#1A1A1A]">Saved cards</p>
                                <div className="grid gap-3">
                                  {savedCards.map((card) => (
                                    <button
                                      type="button"
                                      key={card.id}
                                      onClick={() => {
                                        setSelectedCardId(card.id);
                                        setStripePaymentMethodId(card.stripe_payment_method_id || card.id);
                                      }}
                                      className={`rounded-[1.5rem] border p-4 text-left ${
                                        selectedCardId === card.id ? "border-[#1B9157]/25 bg-[#eef7f1]" : "border-border/40 bg-white"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div>
                                          <p className="font-black text-[#1A1A1A]">
                                            {card.provider || card.brand || "Card"} ending in {card.last4 || "0000"}
                                          </p>
                                          <p className="text-sm text-[#1B4332]/72">
                                            {card.expiry_month && card.expiry_year
                                              ? `Expires ${String(card.expiry_month).padStart(2, "0")}/${String(card.expiry_year).slice(-2)}`
                                              : "Saved payment method"}
                                          </p>
                                        </div>
                                        {card.is_default && (
                                          <Badge className="rounded-full border border-[#1B9157]/15 bg-white text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157]">
                                            Default
                                          </Badge>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="rounded-[1.75rem] border border-border/40 bg-[#f9f7f2] p-5">
                              <p className="mb-3 text-lg font-black text-[#1A1A1A]">Add a new card</p>
                              <StripeCardForm
                                mode="save"
                                buttonText="Verify card"
                                onSuccess={async (paymentMethodResult) => {
                                  try {
                                    const vaulted = await waitForVaultedPaymentMethod(
                                      paymentMethodResult.paymentMethodId || paymentMethodResult.id,
                                    );
                                    if (vaulted) {
                                      const refreshedMethods = await getPaymentMethods();
                                      const cards = refreshedMethods.filter((method) => method.type === "card");
                                      setSavedCards(cards);
                                      setSelectedCardId(vaulted.id);
                                      setStripePaymentMethodId(vaulted.stripe_payment_method_id || paymentMethodResult.paymentMethodId || paymentMethodResult.id);
                                    } else {
                                      setStripePaymentMethodId(paymentMethodResult.paymentMethodId || paymentMethodResult.id);
                                    }
                                    toast.success("Card verified and ready for checkout");
                                  } catch (error) {
                                    toast.error("Card verified, but saving it to your profile took too long");
                                  }
                                }}
                                onError={(error) => {
                                  toast.error(error instanceof Error ? error.message : String(error));
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-5">
                      <p className="text-lg font-black text-[#1A1A1A]">Review before placing order</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
                          <p className="mt-1 text-sm leading-6 text-[#1B4332]/72">
                            {shippingDetails.fullName}
                            <br />
                            {shippingDetails.email}
                            <br />
                            {shippingDetails.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Fulfillment</p>
                          <p className="mt-1 text-sm leading-6 text-[#1B4332]/72">
                            {deliveryMethod === "pickup"
                              ? shippingDetails.pickupPoint
                              : `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.county}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-3">
                {currentStep !== "review" && currentStep !== "success" && (
                  <Button variant="outline" className="h-11 rounded-full px-5 font-black" onClick={() => setCurrentStep(currentStep === "confirm" ? "details" : "review")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}

                {currentStep === "review" && (
                  <Button className="h-11 rounded-full px-5 font-black shadow-glow" onClick={() => setCurrentStep("details")}>
                    Continue to details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {currentStep === "details" && (
                  <Button
                    className="h-11 rounded-full px-5 font-black shadow-glow"
                    onClick={() => {
                      if (validateDetailsStep()) {
                        setCurrentStep("confirm");
                      }
                    }}
                  >
                    Continue to payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {currentStep === "confirm" && (
                  <Button className="h-11 rounded-full px-5 font-black shadow-glow" onClick={placeOrder} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing order
                      </>
                    ) : (
                      <>
                        Place order
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[2rem] border border-border/50 shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-black text-[#1A1A1A]">Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted">
                          {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-[#1A1A1A]">{item.name}</p>
                          <p className="text-sm text-[#1B4332]/72">
                            {item.size} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-black text-[#1A1A1A]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code" />
                      <Button variant="outline" className="shrink-0 rounded-full font-black" onClick={applyCoupon} disabled={couponLoading}>
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TicketPercent className="mr-2 h-4 w-4" />}
                        Apply
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <div className="rounded-full border border-[#1B9157]/15 bg-[#eef7f1] px-4 py-2 text-sm font-semibold text-[#1B9157]">
                        {appliedCoupon.code} applied · {appliedCoupon.discountPercent}% off
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-[#1B4332]/72">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#1B4332]/72">
                      <span>{deliveryMethod === "pickup" ? "Pickup" : "Shipping"}</span>
                      <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#1B4332]/72">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-black text-[#1A1A1A]">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/40 bg-[#f9f7f2] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-[#1B9157]" />
                      <div className="space-y-1">
                        <p className="font-black text-[#1A1A1A]">Backend-verified totals</p>
                        <p className="text-sm leading-6 text-[#1B4332]/72">
                          Pricing is validated server-side against the active catalog before the order is created.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/40 bg-[#1A1A1A] p-4 text-white">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">Free shipping rule</p>
                    <p className="mt-2 text-sm leading-6 text-white/76">
                      Orders above KES 5,000 ship free. Current cart gap:{" "}
                      <span className="font-black text-white">
                        {subtotal >= 5000 ? "Reached" : formatPrice(5000 - subtotal)}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>
    </BeeYieldPageShell>
  );
};

export default Checkout;
