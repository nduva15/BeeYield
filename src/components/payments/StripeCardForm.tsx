import React, { useState, useEffect } from 'react';
import {
    Elements,
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createStripePaymentIntent } from '@/services/shopService';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripeCardFormProps {
    onSuccess?: (paymentMethodId?: string) => void;
    onError?: (error: string) => void;
    amount?: number;
    buttonText?: string;
    mode?: 'save' | 'checkout';
}

const CheckoutForm = ({ amount, onSuccess, onError, buttonText }: StripeCardFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirection is handled by the component or we can use redirect: 'if_required'
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required'
        });

        if (error) {
            toast.error(error.message || 'Payment failed');
            onError?.(error.message || 'Payment failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment successful!');
            onSuccess?.(paymentIntent.id);
        }
        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Express Wallets</p>
                <ExpressCheckoutElement onConfirm={onSuccess as any} />

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card & Global Methods</p>
                <PaymentElement onReady={() => setIsReady(true)} />
            </div>

            <Button
                type="submit"
                disabled={!isReady || isProcessing}
                className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
            >
                {isProcessing ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span>
                ) : (
                    <span>{buttonText || `Pay KES ${amount?.toLocaleString()}`}</span>
                )}
            </Button>
        </form>
    );
};

const Separator = ({ className }: { className?: string }) => <div className={`h-[1px] w-full ${className}`} />;

export const StripeCardForm: React.FC<StripeCardFormProps> = (props) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (props.amount && props.amount > 0) {
            createStripePaymentIntent(props.amount)
                .then(res => setClientSecret(res.client_secret))
                .catch(err => {
                    console.error("Stripe Intent Error:", err);
                    toast.error("Failed to initialize secure payment session.");
                });
        }
    }, [props.amount]);

    if (!stripePromise) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-3xl border border-dashed border-red-200">
                <p className="text-red-600 font-bold text-sm">Secure Payment Gateway Offline (Missing Keys)</p>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Calibrating Encryption Vault...</p>
            </div>
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
                        colorPrimary: '#4f46e5',
                        colorBackground: 'transparent',
                        colorText: '#1e293b',
                        borderRadius: '16px',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }
                }
            }}
        >
            <CheckoutForm {...props} />
        </Elements>
    );
};

export default StripeCardForm;
