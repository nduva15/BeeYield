import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardInput from './StripeCardInput';

// Get the Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Load Stripe instance (will be null if no key provided)
const stripePromise = stripePublishableKey 
    ? loadStripe(stripePublishableKey)
    : null;

interface StripeCardFormProps {
    onSuccess?: (paymentMethod: {
        id: string;
        last4: string;
        brand: string;
        exp_month: number;
        exp_year: number;
    }) => void;
    onError?: (error: string) => void;
    mode?: 'save' | 'checkout';
    clientSecret?: string;
    amount?: number;
    buttonText?: string;
    showCardholderName?: boolean;
}

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
    mode = 'save',
    ...props
}) => {
    if (!stripePromise) {
        return (
            <div className="p-6 text-center bg-muted/20 rounded-xl border border-dashed border-muted">
                <p className="text-muted-foreground text-sm">
                    Card payments are not configured. Please set up your Stripe API keys.
                </p>
            </div>
        );
    }

    return (
        <Elements 
            stripe={stripePromise}
            options={{
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#f59e0b', // BeeYield amber
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        borderRadius: '12px',
                    },
                },
            }}
        >
            <StripeCardInput mode={mode} {...props} />
        </Elements>
    );
};

export default StripeCardForm;
