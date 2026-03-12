import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Get the Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Load Stripe instance
const stripePromise = stripePublishableKey 
    ? loadStripe(stripePublishableKey)
    : null;

interface StripeCheckoutFormProps {
    clientSecret: string;
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError?: (error: string) => void;
}

const CheckoutForm: React.FC<StripeCheckoutFormProps> = ({
    clientSecret,
    amount,
    onSuccess,
    onError,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error('Payment system not ready');
            return;
        }

        setIsLoading(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout?payment_status=success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                throw new Error(error.message);
            }

            if (paymentIntent?.status === 'succeeded') {
                onSuccess(paymentIntent.id);
                toast.success('Payment successful!');
            } else if (paymentIntent?.status === 'requires_action') {
                toast.info('Additional authentication required');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            onError?.(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <PaymentElement 
                    onReady={() => setIsReady(true)}
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700">
                    Your payment is secured with bank-grade encryption by Stripe
                </p>
            </div>

            <Button
                type="submit"
                disabled={!stripe || isLoading || !isReady}
                className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 shadow-glow"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                    </>
                ) : !isReady ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay KES {amount.toLocaleString()}
                    </>
                )}
            </Button>
        </form>
    );
};

interface StripeCheckoutProps {
    clientSecret: string;
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError?: (error: string) => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
    clientSecret,
    amount,
    onSuccess,
    onError,
}) => {
    if (!stripePromise) {
        return (
            <Card className="border-dashed border-2 border-muted">
                <CardContent className="p-8 text-center">
                    <CreditCard className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Card Payments Unavailable</h3>
                    <p className="text-muted-foreground">
                        Stripe is not configured. Please use M-Pesa or contact support.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Elements 
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#f59e0b',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        borderRadius: '12px',
                        spacingUnit: '4px',
                    },
                    rules: {
                        '.Input': {
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                        },
                        '.Input:focus': {
                            borderColor: '#f59e0b',
                            boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
                        },
                        '.Tab': {
                            borderRadius: '12px',
                            padding: '12px 16px',
                        },
                        '.Tab--selected': {
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderColor: '#f59e0b',
                        },
                    },
                },
            }}
        >
            <CheckoutForm 
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
            />
        </Elements>
    );
};

export default StripeCheckout;
