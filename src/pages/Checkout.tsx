import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
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
    User,
    UserPlus,
    LogIn,
} from 'lucide-react';
import { initializeCheckout, CheckoutOrder } from '@/services/shopService';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

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

type AuthMode = 'guest' | 'login' | 'register';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
    const { user, session, signUp, loading: authLoading } = useAuth();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [authMode, setAuthMode] = useState<AuthMode>('guest');
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

    // Auto-fill from user profile when logged in
    useEffect(() => {
        if (user) {
            const metadata = user.user_metadata || {};
            setShippingDetails(prev => ({
                ...prev,
                fullName: `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || prev.fullName,
                email: user.email || prev.email,
            }));
            setAuthMode('guest'); // Reset to guest since user is now logged in
        }
    }, [user]);



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
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(shippingDetails.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!/^(\+254|0)[0-9]{9}$/.test(shippingDetails.phone.replace(/\s/g, ''))) {
            toast.error('Please enter a valid Kenyan phone number');
            return false;
        }
        return true;
    };

    const [createAccount, setCreateAccount] = useState(false);
    const [password, setPassword] = useState('');

    const handleNextStep = async () => {
        if (currentStep === 'cart') {
            if (items.length === 0) {
                toast.error('Your cart is empty');
                return;
            }
            setCurrentStep('shipping');
        } else if (currentStep === 'shipping') {
            if (validateShipping()) {
                if (createAccount && !user) {
                    if (password.length < 6) {
                        toast.error('Password must be at least 6 characters');
                        return;
                    }
                    setIsProcessing(true);
                    const { error } = await signUp(shippingDetails.email, password, {
                        first_name: shippingDetails.fullName.split(' ')[0],
                        last_name: shippingDetails.fullName.split(' ').slice(1).join(' '),
                    });
                    setIsProcessing(false);

                    if (error) {
                        toast.error('Account creation failed', { description: error.message });
                        return;
                    } else {
                        toast.success('Account created!', { description: 'Please check your email to verify.' });
                        // Proceed even if not verified yet, order will be linked if session is established or we rely on email match
                    }
                }
                setCurrentStep('payment');
            }
        } else if (currentStep === 'payment') {
            processPayment();
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 'shipping') setCurrentStep('cart');
        else if (currentStep === 'payment') setCurrentStep('shipping');
        else if (currentStep === 'cart' || currentStep === 'confirmation') {
            navigate('/shop');
        }
    };

    const processPayment = async () => {
        setIsProcessing(true);

        try {
            const { initializeCheckout } = await import('@/services/shopService');

            const orderData: CheckoutOrder = {
                shipping_address: {
                    first_name: shippingDetails.fullName.split(' ')[0] || '',
                    last_name: shippingDetails.fullName.split(' ').slice(1).join(' ') || '',
                    email: shippingDetails.email,
                    phone: shippingDetails.phone,
                    address: shippingDetails.address,
                    city: shippingDetails.city,
                    county: shippingDetails.county,
                    postal_code: shippingDetails.postalCode,
                },
                payment_method: paymentMethod,
                items: items.map(item => ({
                    product_id: item.productId.toString(),
                    variant_id: item.variantId,
                    quantity: item.quantity
                })),
                total_kes: totalWithShipping,
                notes: shippingDetails.notes
            };

            const response = await initializeCheckout(orderData, session?.access_token);

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
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Back to Shop</span>
                        </button>
                        <h1 className="text-2xl font-black font-heading tracking-tight">Checkout</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <Lock className="h-4 w-4 text-primary" />
                            <span className="hidden sm:inline">Secure Transaction</span>
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
                            <Card className="glass border-none shadow-soft overflow-hidden">
                                <CardHeader className="border-b border-border/10 bg-muted/20">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-black font-heading">
                                        <ShoppingBag className="h-6 w-6 text-primary" />
                                        Review Your Selection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                                        >
                                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl">{getCategoryEmoji(item.category)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{item.name}</h4>
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
                            <>
                                {/* Account Options - Show only if not logged in */}
                                {!user && (
                                    <Card className="mb-6 glass border-none shadow-soft overflow-hidden">
                                        <CardHeader className="border-b border-border/10 bg-muted/20">
                                            <CardTitle className="flex items-center gap-2 text-xl font-black font-heading">
                                                <User className="h-5 w-5 text-primary" />
                                                Identification
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {/* Auth Mode Selector */}
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setAuthMode('guest')}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${authMode === 'guest'
                                                        ? 'border-primary bg-primary/10 shadow-glow shadow-primary/20'
                                                        : 'border-border/50 hover:border-primary/50'
                                                        }`}
                                                >
                                                    <User className={`h-6 w-6 ${authMode === 'guest' ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <span className="text-xs font-black uppercase tracking-widest">Guest</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAuthMode('login')}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${authMode === 'login'
                                                        ? 'border-green-500 bg-green-500/5'
                                                        : 'border-border hover:border-green-500/50'
                                                        }`}
                                                >
                                                    <LogIn className={`h-6 w-6 ${authMode === 'login' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                    <span className="text-sm font-medium">Sign In</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAuthMode('register')}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${authMode === 'register'
                                                        ? 'border-amber-500 bg-amber-500/5'
                                                        : 'border-border hover:border-amber-500/50'
                                                        }`}
                                                >
                                                    <UserPlus className={`h-6 w-6 ${authMode === 'register' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                                                    <span className="text-sm font-medium">Create Account</span>
                                                </button>
                                            </div>

                                            {/* Login Form */}
                                            {authMode === 'login' && (
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <LoginForm
                                                        onSuccess={() => toast.success('Logged in! Your details have been auto-filled.')}
                                                        onSwitchToRegister={() => setAuthMode('register')}
                                                    />
                                                </div>
                                            )}

                                            {/* Register Form */}
                                            {authMode === 'register' && (
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <RegisterForm
                                                        onSuccess={() => toast.success('Account created! You can now proceed.')}
                                                        onSwitchToLogin={() => setAuthMode('login')}
                                                        prefillEmail={shippingDetails.email}
                                                    />
                                                </div>
                                            )}

                                            {/* Guest info */}
                                            {authMode === 'guest' && (
                                                <p className="text-sm text-muted-foreground text-center">
                                                    Continue as a guest. You can create an account later.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Logged in user badge */}
                                {user && (
                                    <Card className="mb-6">
                                        <CardContent className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Logged in as {user.email}</p>
                                                    <p className="text-sm text-muted-foreground">Your details have been auto-filled</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Shipping Details Form - Show for guest or logged in users */}
                                {(authMode === 'guest' || user) && (
                                    <Card className="glass border-none shadow-soft overflow-hidden">
                                        <CardHeader className="border-b border-border/10 bg-muted/20">
                                            <CardTitle className="flex items-center gap-2 text-xl font-black font-heading">
                                                <MapPin className="h-5 w-5 text-primary" />
                                                Delivery Matrix
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Full Legal Name *</Label>
                                                    <Input
                                                        id="fullName"
                                                        name="fullName"
                                                        value={shippingDetails.fullName}
                                                        onChange={handleInputChange}
                                                        placeholder="John Doe"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Contact Email *</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={shippingDetails.email}
                                                        onChange={handleInputChange}
                                                        placeholder="john@example.com"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Phone Identifier *</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={shippingDetails.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+254 712 345 678"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Precise Location / Street Address *</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={shippingDetails.address}
                                                        onChange={handleInputChange}
                                                        placeholder="123 Bee Street, Apartment 4B"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">City / Municipality *</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={shippingDetails.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Nairobi"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="county" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">County *</Label>
                                                    <Input
                                                        id="county"
                                                        name="county"
                                                        value={shippingDetails.county}
                                                        onChange={handleInputChange}
                                                        placeholder="Nairobi County"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="postalCode" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Postal Code</Label>
                                                    <Input
                                                        id="postalCode"
                                                        name="postalCode"
                                                        value={shippingDetails.postalCode}
                                                        onChange={handleInputChange}
                                                        placeholder="00100"
                                                        className="h-14 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Special Logistics Notes (Optional)</Label>
                                                    <Textarea
                                                        id="notes"
                                                        name="notes"
                                                        value={shippingDetails.notes}
                                                        onChange={handleInputChange}
                                                        placeholder="Any special instructions for delivery..."
                                                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl min-h-[100px]"
                                                        rows={3}
                                                    />
                                                </div>

                                                {/* Inline Account Creation */}
                                                {!user && authMode === 'guest' && (
                                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id="createAccount"
                                                                checked={createAccount}
                                                                onChange={(e) => setCreateAccount(e.target.checked)}
                                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                            <Label htmlFor="createAccount" className="text-sm font-medium">
                                                                Save my information for a faster checkout next time
                                                            </Label>
                                                        </div>

                                                        {createAccount && (
                                                            <div className="mt-4 space-y-4 max-w-sm pl-6 transition-all animate-in fade-in slide-in-from-top-2">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="new-password">Create Password</Label>
                                                                    <Input
                                                                        id="new-password"
                                                                        type="password"
                                                                        placeholder="At least 6 characters"
                                                                        value={password}
                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                    />
                                                                    <p className="text-xs text-muted-foreground">
                                                                        We'll create an account linked to {shippingDetails.email || 'your email'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}

                        {/* Payment Step */}
                        {/* Payment Step */}
                        {currentStep === 'payment' && (
                            <Card className="glass border-none shadow-soft overflow-hidden">
                                <CardHeader className="border-b border-border/10 bg-muted/20">
                                    <CardTitle className="flex items-center gap-2 text-xl font-black font-heading">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        Payment Protocol
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
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
                                    <div className="mt-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Shield className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-1">Encrypted Transaction</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Your payment information is processed through secure, bank-grade encryption protocols.
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
                            <Card className="sticky top-32 glass border-none shadow-soft overflow-hidden">
                                <CardHeader className="border-b border-border/10 bg-muted/20">
                                    <CardTitle className="font-black font-heading tracking-tight">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
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
