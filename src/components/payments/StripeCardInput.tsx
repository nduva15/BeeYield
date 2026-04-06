import React, { useEffect, useState } from 'react';
import {
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createStripeSetupIntent } from '@/services/shopService';

interface StripeCardInputProps {
    onSuccess?: (paymentMethod: {
        id: string;
        paymentMethodId?: string;
        setupIntentId?: string;
        last4?: string;
        brand?: string;
        exp_month?: number;
        exp_year?: number;
    }) => void;
    onError?: (error: string | Error) => void;
    mode: 'save' | 'checkout';
    clientSecret?: string;
    amount?: number;
    buttonText?: string;
    showCardholderName?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#9ca3af',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
    hidePostalCode: true,
};

export const StripeCardInput: React.FC<StripeCardInputProps> = ({
    onSuccess,
    onError,
    mode = 'save',
    clientSecret,
    amount,
    buttonText,
    showCardholderName = true,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardholderName, setCardholderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPreparing, setIsPreparing] = useState(mode === 'save' && !clientSecret);
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);
    const [setupClientSecret, setSetupClientSecret] = useState(clientSecret ?? '');
    const [vaultedCard, setVaultedCard] = useState<{ paymentMethodId?: string; setupIntentId?: string } | null>(null);

    // Check if Stripe is available (will be null if not initialized properly)
    const isStripeReady = !!stripe && !!elements;

    useEffect(() => {
        setSetupClientSecret(clientSecret ?? '');
    }, [clientSecret]);

    useEffect(() => {
        let cancelled = false;

        const prepareSetupIntent = async () => {
            if (mode !== 'save' || clientSecret || setupClientSecret) {
                setIsPreparing(false);
                return;
            }

            setIsPreparing(true);
            try {
                const intent = await createStripeSetupIntent();
                if (!cancelled) {
                    setSetupClientSecret(intent.client_secret);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to initialize secure card vault';
                if (!cancelled) {
                    setCardError(message);
                }
                onError?.(error instanceof Error ? error : message);
            } finally {
                if (!cancelled) {
                    setIsPreparing(false);
                }
            }
        };

        void prepareSetupIntent();

        return () => {
            cancelled = true;
        };
    }, [clientSecret, mode, onError, setupClientSecret]);

    if (!isStripeReady && !stripe) {
        return (
            <Card className="border-dashed border-2 border-muted">
                <CardContent className="p-6 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                        Loading payment form...
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error('Payment system not initialized');
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            toast.error('Card input not found');
            return;
        }

        if (showCardholderName && !cardholderName.trim()) {
            toast.error('Please enter the cardholder name');
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'save') {
                if (!setupClientSecret) {
                    throw new Error('Secure vault is still preparing. Please try again in a moment.');
                }

                const { error, setupIntent } = await stripe.confirmCardSetup(setupClientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: cardholderName,
                        },
                    },
                });

                if (error) {
                    throw new Error(error.message);
                }

                if (setupIntent?.status === 'succeeded') {
                    const paymentMethodId = typeof setupIntent.payment_method === 'string'
                        ? setupIntent.payment_method
                        : setupIntent.payment_method?.id;

                    setVaultedCard({
                        paymentMethodId,
                        setupIntentId: setupIntent.id,
                    });

                    onSuccess?.({
                        id: setupIntent.id,
                        paymentMethodId,
                        setupIntentId: setupIntent.id,
                    });
                    toast.success('Card vaulted successfully!');
                    // Clear the form
                    cardElement.clear();
                    setCardholderName('');
                    setCardComplete(false);
                    setCardError(null);
                }
            } else if (mode === 'checkout' && clientSecret) {
                // Confirm payment for checkout
                const { paymentIntent, error } = await stripe.confirmCardPayment(
                    clientSecret,
                    {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: cardholderName,
                            },
                        },
                    }
                );

                if (error) {
                    throw new Error(error.message);
                }

                if (paymentIntent?.status === 'succeeded') {
                    onSuccess?.({
                        id: paymentIntent.id,
                        last4: '',
                        brand: 'card',
                        exp_month: 0,
                        exp_year: 0,
                    });
                    toast.success('Payment successful!');
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            setCardError(errorMessage);
            onError?.(error instanceof Error ? error : errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardChange = (event: {
        complete: boolean;
        error?: { message: string };
    }) => {
        setCardComplete(event.complete);
        setCardError(event.error?.message || null);
    };

    const defaultButtonText = mode === 'save'
        ? 'Verify & Vault'
        : amount
            ? `Pay KES ${amount.toLocaleString()}`
            : 'Complete Payment';

    const isDisabled = !stripe || isLoading || isPreparing || !cardComplete || (mode === 'save' && !setupClientSecret);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {vaultedCard && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-emerald-800">Vault verified</p>
                        <p className="text-xs text-emerald-700">
                            Stripe confirmed your card and BeeYield is syncing the saved method now.
                        </p>
                    </div>
                </div>
            )}

            {showCardholderName && (
                <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Cardholder Name</Label>
                    <Input
                        id="cardholder-name"
                        name="cardholderName"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Name on card"
                        disabled={isLoading}
                        required
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label>Card Details</Label>
                <div className="p-4 border border-border rounded-xl bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardChange}
                    />
                </div>
                {cardError && (
                    <p className="text-sm text-destructive">{cardError}</p>
                )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Shield className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700">
                    Your card information is encrypted and securely processed by Stripe
                </p>
            </div>

            <Button
                type="submit"
                disabled={isDisabled}
                className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90"
            >
                {isLoading || isPreparing ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isPreparing ? 'Preparing Secure Vault...' : 'Processing...'}
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {buttonText || defaultButtonText}
                    </>
                )}
            </Button>
        </form>
    );
};

export default StripeCardInput;
