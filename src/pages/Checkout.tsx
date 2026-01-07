import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import {
    ShoppingBag,
    MapPin,
    CreditCard,
    Smartphone,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Shield,
    Truck,
    Package,
    Lock,
} from 'lucide-react';
import { initializeCheckout } from '@/services/shopService';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface ShippingDetails {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode: string;
    notes: string;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        county: '',
        postalCode: '',
        notes: '',
    });

    // Google Tag Manager
    useEffect(() => {
        const script = document.createElement('script');
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KF284247');`;
        script.async = true;
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

    const shippingCost = getTotalPrice() >= 5000 ? 0 : 350;
    const totalWithShipping = getTotalPrice() + shippingCost;

    const steps = [
        { id: 'cart', label: 'Cart Review', icon: ShoppingBag },
        { id: 'shipping', label: 'Shipping', icon: MapPin },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'confirmation', label: 'Confirmation', icon: CheckCircle2 },
    ];

    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'honey': return '🍯';
            case 'merch': return '👕';
            case 'education': return '📚';
            default: return '📦';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingDetails((prev) => ({ ...prev, [name]: value }));
    };

    const validateShipping = () => {
        const required = ['fullName', 'email', 'phone', 'address', 'city', 'county'];
        for (const field of required) {
            if (!shippingDetails[field as keyof ShippingDetails]) {
                toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(shippingDetails.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!/^(\+254|0)[0-9]{9}$/.test(shippingDetails.phone.replace(/\s/g, ''))) {
            toast.error('Please enter a valid Kenyan phone number');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 'cart') {
            if (items.length === 0) {
                toast.error('Your cart is empty');
                return;
            }
            setCurrentStep('shipping');
        } else if (currentStep === 'shipping') {
            if (validateShipping()) {
                setCurrentStep('payment');
            }
        } else if (currentStep === 'payment') {
            processPayment();
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 'shipping') setCurrentStep('cart');
        else if (currentStep === 'payment') setCurrentStep('shipping');
        else if (currentStep === 'confirmation') {
            navigate('/shop');
        }
    };

    const processPayment = async () => {
        setIsProcessing(true);

        try {
            const { initializeCheckout } = await import('@/services/shopService');

            const orderData = {
                shipping_address: shippingDetails,
                payment_method: paymentMethod,
                items: items.map(item => ({
                    product_id: item.productId.toString(),
                    variant_id: item.size, // Using size as variant_id for now
                    quantity: item.quantity
                })),
                total_kes: totalWithShipping
            };

            const response = await initializeCheckout(orderData);

            // If it's M-Pesa, we might get a checkoutRequestId
            // If it's Card, we might get a Stripe sessionId or similar

            // For now, we simulate success since we have a mock backend
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Generate order number (Backend should ideally return this, but let's take what it gives or gen one)
            const orderId = response.order_id || `BY-${Date.now().toString(36).toUpperCase()}`;
            setOrderNumber(orderId);

            clearCart();
            setCurrentStep('confirmation');

            toast.success('Order placed successfully! 🎉', {
                description: `Order ${orderId} has been confirmed.`,
            });
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Failed to process order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStepIndex = (step: CheckoutStep) => steps.findIndex((s) => s.id === step);

    if (items.length === 0 && currentStep !== 'confirmation') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Add some delicious honey or merchandise to your cart!
                    </p>
                    <Button onClick={() => navigate('/shop')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Browse Products
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back to Shop</span>
                        </button>
                        <h1 className="text-xl font-bold">Checkout</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Secure Checkout</span>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = getStepIndex(currentStep) > index;
                            const isConfirmation = step.id === 'confirmation' && currentStep === 'confirmation';

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted || isConfirmation
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-primary text-white ring-4 ring-primary/20'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <StepIcon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs mt-1 hidden sm:block ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${getStepIndex(currentStep) > index ? 'bg-green-500' : 'bg-muted'
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cart Review Step */}
                        {currentStep === 'cart' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-primary" />
                                        Review Your Cart
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                                        >
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 flex items-center justify-center">
                                                <span className="text-3xl">{getCategoryEmoji(item.category)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary">{item.size}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        Qty: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-primary">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatPrice(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Shipping Step */}
                        {currentStep === 'shipping' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Shipping Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                value={shippingDetails.fullName}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={shippingDetails.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={shippingDetails.phone}
                                                onChange={handleInputChange}
                                                placeholder="+254 712 345 678"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="address">Street Address *</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                value={shippingDetails.address}
                                                onChange={handleInputChange}
                                                placeholder="123 Bee Street, Apartment 4B"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={shippingDetails.city}
                                                onChange={handleInputChange}
                                                placeholder="Nairobi"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="county">County *</Label>
                                            <Input
                                                id="county"
                                                name="county"
                                                value={shippingDetails.county}
                                                onChange={handleInputChange}
                                                placeholder="Nairobi County"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Input
                                                id="postalCode"
                                                name="postalCode"
                                                value={shippingDetails.postalCode}
                                                onChange={handleInputChange}
                                                placeholder="00100"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                                            <Textarea
                                                id="notes"
                                                name="notes"
                                                value={shippingDetails.notes}
                                                onChange={handleInputChange}
                                                placeholder="Any special instructions for delivery..."
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Step */}
                        {currentStep === 'payment' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={paymentMethod}
                                        onValueChange={(value) => setPaymentMethod(value as 'mpesa' | 'card')}
                                        className="space-y-4"
                                    >
                                        {/* M-Pesa Option */}
                                        <div
                                            className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'mpesa'
                                                ? 'border-green-500 bg-green-500/5'
                                                : 'border-border hover:border-green-500/50'
                                                }`}
                                            onClick={() => setPaymentMethod('mpesa')}
                                        >
                                            <RadioGroupItem value="mpesa" id="mpesa" className="sr-only" />
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <Smartphone className="h-7 w-7 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">M-Pesa</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Pay securely with M-Pesa mobile money
                                                    </p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'mpesa' && (
                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            )}
                                        </div>

                                        {/* Card Option */}
                                        <div
                                            className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'card'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <RadioGroupItem value="card" id="card" className="sr-only" />
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <CreditCard className="h-7 w-7 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">Credit/Debit Card</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Visa, Mastercard, and more via Stripe
                                                    </p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'card' && (
                                                <CheckCircle2 className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                    </RadioGroup>

                                    {/* Security Badge */}
                                    <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                                        <Shield className="h-10 w-10 text-green-600" />
                                        <div>
                                            <h4 className="font-medium text-sm">Secure Payment</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Your payment information is encrypted and secure. We never store your card details.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Confirmation Step */}
                        {currentStep === 'confirmation' && (
                            <Card className="text-center p-8">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Order Confirmed! 🎉</h2>
                                <p className="text-muted-foreground mb-4">
                                    Thank you for your purchase. Your order has been placed successfully.
                                </p>
                                <div className="bg-muted/50 rounded-lg p-4 inline-block mb-6">
                                    <p className="text-sm text-muted-foreground">Order Number</p>
                                    <p className="text-2xl font-bold text-primary">{orderNumber}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    A confirmation email has been sent to {shippingDetails.email}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={() => navigate('/shop')} className="gap-2">
                                        Continue Shopping
                                    </Button>
                                    <Button variant="outline" onClick={() => navigate('/traceability')}>
                                        Track Your Honey
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        {currentStep !== 'confirmation' && (
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {currentStep === 'cart' ? 'Back to Shop' : 'Back'}
                                </Button>
                                <Button
                                    onClick={handleNextStep}
                                    disabled={isProcessing}
                                    className="gap-2 min-w-[150px]"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : currentStep === 'payment' ? (
                                        <>
                                            Pay {formatPrice(totalWithShipping)}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    {currentStep !== 'confirmation' && (
                        <div className="lg:col-span-1">
                            <Card className="sticky top-32">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Items */}
                                    <div className="space-y-3">
                                        {items.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {item.name} × {item.quantity}
                                                </span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                        {items.length > 3 && (
                                            <p className="text-sm text-muted-foreground">
                                                +{items.length - 3} more items
                                            </p>
                                        )}
                                    </div>

                                    <div className="border-t border-border pt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(getTotalPrice())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Truck className="h-4 w-4" />
                                                Shipping
                                            </span>
                                            <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                                                {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                                            </span>
                                        </div>
                                        {shippingCost > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                Free shipping on orders over KES 5,000
                                            </p>
                                        )}
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary">{formatPrice(totalWithShipping)}</span>
                                        </div>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="pt-4 border-t border-border grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Package className="h-4 w-4 text-primary" />
                                            <span>Fast Delivery</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span>Secure Payment</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Truck className="h-4 w-4 text-blue-600" />
                                            <span>Free Returns</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-amber-600" />
                                            <span>Quality Assured</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
