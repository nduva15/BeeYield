import React, { createContext, useContext, useMemo } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Get the Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Load Stripe instance (will be null if no key provided)
const stripePromise = stripePublishableKey 
    ? loadStripe(stripePublishableKey)
    : Promise.resolve(null);

interface StripeContextType {
    isStripeEnabled: boolean;
}

const StripeContext = createContext<StripeContextType>({
    isStripeEnabled: false,
});

export const useStripeContext = () => useContext(StripeContext);

interface StripeProviderProps {
    children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
    const isStripeEnabled = useMemo(() => !!stripePublishableKey, []);

    const value = {
        isStripeEnabled,
    };

    if (!isStripeEnabled) {
        // Return without Elements wrapper if Stripe is not configured
        console.warn('Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY to enable card payments.');
        return (
            <StripeContext.Provider value={value}>
                {children}
            </StripeContext.Provider>
        );
    }

    return (
        <StripeContext.Provider value={value}>
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
                {children}
            </Elements>
        </StripeContext.Provider>
    );
};

export { stripePromise };
