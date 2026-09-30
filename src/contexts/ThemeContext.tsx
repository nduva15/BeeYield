import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import { beeyieldService } from "@/services/beeyieldService"

export type ThemeMode = "light" | "dark" | "sunlight";

type ThemeState = {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    isSunlightMode: boolean;
    toggleSunlightMode: () => void;
}

const initialState: ThemeState = {
    theme: "light",
    setTheme: () => null,
    isSunlightMode: false,
    toggleSunlightMode: () => null,
}

const ThemeContext = createContext<ThemeState>(initialState)

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: string
    storageKey?: string
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const storageKey = "beeyield_theme_v1";
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        const saved = window.localStorage.getItem(storageKey);
        if (saved === "sunlight") {
            window.localStorage.setItem(storageKey, "light");
            return "light";
        }
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("dark", "light", "sunlight");
        root.classList.add(theme);
        window.localStorage.setItem(storageKey, theme);
    }, [theme]);

    const setTheme = useCallback((next: ThemeMode) => {
        setThemeState(next);
        void beeyieldService.updateUserMetadata({ theme: next });
    }, []);

    const toggleSunlightMode = useCallback(() => {
        setThemeState((prev) => {
            const next = prev === "sunlight" ? "light" : "sunlight";
            void beeyieldService.updateUserMetadata({ theme: next });
            return next;
        });
    }, []);

    const value = useMemo(() => ({
        theme,
        setTheme,
        isSunlightMode: theme === "sunlight",
        toggleSunlightMode
    }), [theme, setTheme, toggleSunlightMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
