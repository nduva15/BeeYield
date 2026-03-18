import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';

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

    // System Alert Routes
    alerts: AlertSettings;
    updateAlerts: (settings: Partial<AlertSettings>) => void;

    // Reset Everything
    resetWorkspace: (active: boolean) => void;
    
    // Sync status
    isSyncing: boolean;
    syncToBackend: () => Promise<void>;
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
    const [showGuides, setShowGuides] = useState<boolean>(true);
    const [moduleFlags, setModuleFlags] = useState<ModuleFlags>(DEFAULT_MODULES);
    const [alerts, setAlerts] = useState<AlertSettings>(DEFAULT_ALERTS);
    const [isSyncing, setIsSyncing] = useState<boolean>(true);
    const [initialized, setInitialized] = useState(false);

    // Initialize from backend
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Try from local storage first for instant feedback
                const localGuides = localStorage.getItem(`${STORAGE_KEY_PREFIX}guides`);
                const localModules = localStorage.getItem(`${STORAGE_KEY_PREFIX}modules`);
                const localAlerts = localStorage.getItem(`${STORAGE_KEY_PREFIX}alerts`);
                
                if (localGuides) setShowGuides(localGuides !== 'false');
                if (localModules) setModuleFlags(JSON.parse(localModules));
                if (localAlerts) setAlerts(JSON.parse(localAlerts));

                // Fetch real settings from backend
                const { supabaseBeeYield } = await import('@/lib/supabase');
                if (!supabaseBeeYield) return;
                
                const { data: { user } } = await supabaseBeeYield.auth.getUser();
                if (user && user.user_metadata) {
                    const meta = user.user_metadata;
                    if (meta.moduleFlags) setModuleFlags(meta.moduleFlags);
                    if (meta.alerts) setAlerts(meta.alerts);
                    if (meta.showGuides !== undefined) setShowGuides(meta.showGuides);
                }
            } catch (err) {
                console.error("Failed to load global settings", err);
            } finally {
                setIsSyncing(false);
                setInitialized(true);
            }
        };
        loadSettings();
    }, []);

    // Local Persistence wrapper for immediate state apply
    useEffect(() => {
        if (!initialized) return;
        localStorage.setItem(`${STORAGE_KEY_PREFIX}guides`, String(showGuides));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}modules`, JSON.stringify(moduleFlags));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}alerts`, JSON.stringify(alerts));
    }, [showGuides, moduleFlags, alerts, initialized]);

    const syncToBackend = useCallback(async () => {
        setIsSyncing(true);
        try {
            const { error } = await beeyieldService.updateUserMetadata({
                moduleFlags,
                alerts,
                showGuides
            });
            if (error) throw error;
        } catch (err) {
            console.error("Failed to sync settings:", err);
            toast.error("Failed to sync settings to the global registry.");
        } finally {
            setIsSyncing(false);
        }
    }, [moduleFlags, alerts, showGuides]);

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
        setAlerts(prev => ({ ...prev, ...alertUpdate } as any));
    };

    return (
        <SettingsContext.Provider value={{
            showGuides, setShowGuides,
            moduleFlags, updateModuleFlags,
            alerts, updateAlerts,
            resetWorkspace,
            isSyncing, syncToBackend
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
