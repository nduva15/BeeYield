import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context state
interface ModuleFlags {
    beehives: boolean;
    agro: boolean;
    trackers: boolean;
    patients: boolean;
}

interface AlertSettings {
    malfunction: boolean;
    lowBattery: boolean;
    syncSuccess: boolean;
    aiAnomalies: boolean;
    swarmRisk: boolean;
    onboardingHints: boolean;
    marketing: boolean;
}

interface SettingsContextType {
    showGuides: boolean;
    setShowGuides: (show: boolean) => void;

    // Feature Flags (Modules)
    moduleFlags: ModuleFlags;
    updateModuleFlags: (flags: Partial<ModuleFlags>) => void;

    // AI Alert Routes
    alerts: AlertSettings;
    updateAlerts: (settings: Partial<AlertSettings>) => void;

    // Reset Everything
    resetWorkspace: (active: boolean) => void;
}

const STORAGE_KEY_PREFIX = 'beeyield_settings_v1_';

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default states
const DEFAULT_MODULES: ModuleFlags = {
    beehives: true,
    agro: true,
    trackers: true,
    patients: false
};

const DEFAULT_ALERTS: AlertSettings = {
    malfunction: true,
    lowBattery: true,
    syncSuccess: true,
    aiAnomalies: true,
    swarmRisk: true,
    onboardingHints: true,
    marketing: false
};

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 1. Guides State
    const [showGuides, setShowGuides] = useState<boolean>(() => {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}guides`);
        return stored !== 'false';
    });

    // 2. Module Flags
    const [moduleFlags, setModuleFlags] = useState<ModuleFlags>(() => {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}modules`);
        return stored ? JSON.parse(stored) : DEFAULT_MODULES;
    });

    // 3. Alert Settings
    const [alerts, setAlerts] = useState<AlertSettings>(() => {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}alerts`);
        return stored ? JSON.parse(stored) : DEFAULT_ALERTS;
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}guides`, String(showGuides));
    }, [showGuides]);

    useEffect(() => {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}modules`, JSON.stringify(moduleFlags));
    }, [moduleFlags]);

    useEffect(() => {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}alerts`, JSON.stringify(alerts));
    }, [alerts]);

    const updateModuleFlags = (flags: Partial<ModuleFlags>) => {
        setModuleFlags(prev => ({ ...prev, ...flags }));
    };

    const updateAlerts = (settings: Partial<AlertSettings>) => {
        setAlerts(prev => ({ ...prev, ...settings }));
    };

    const resetWorkspace = (active: boolean) => {
        const allTrue = { beehives: active, agro: active, trackers: active, patients: active };
        setModuleFlags(allTrue);
        const alertUpdate = { onboardingHints: active };
        setAlerts(prev => ({ ...prev, ...alertUpdate }));
    };

    return (
        <SettingsContext.Provider value={{
            showGuides, setShowGuides,
            moduleFlags, updateModuleFlags,
            alerts, updateAlerts,
            resetWorkspace
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Hook
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
