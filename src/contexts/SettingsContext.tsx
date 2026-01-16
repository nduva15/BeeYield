import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context state
interface SettingsContextType {
    showGuides: boolean;
    setShowGuides: (show: boolean) => void;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Define the provider
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state from localStorage, default to true (banner shown)
    const [showGuides, setShowGuides] = useState<boolean>(() => {
        const storedValue = localStorage.getItem('hideBeeYieldBanner_v9');
        // If storedValue is 'true', it means the banner was hidden, so showGuides should be false
        return storedValue !== 'true';
    });

    // Update localStorage when state changes
    useEffect(() => {
        if (showGuides) {
            localStorage.removeItem('hideBeeYieldBanner_v9');
        } else {
            localStorage.setItem('hideBeeYieldBanner_v9', 'true');
        }
    }, [showGuides]);

    return (
        <SettingsContext.Provider value={{ showGuides, setShowGuides }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Create a custom hook to use the context
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
