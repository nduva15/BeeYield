import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { beeyieldService } from "@/services/beeyieldService"

type ThemeState = {
    theme: "light" | "dark"
    setTheme: (theme: "light" | "dark") => void
}

const initialState: ThemeState = {
    theme: "light",
    setTheme: () => null,
}

const ThemeContext = createContext<ThemeState>(initialState)

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: string
    storageKey?: string
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const storageKey = "beeyield_theme_v1";
    const [theme, setThemeState] = useState<"light" | "dark">(() => {
        const saved = window.localStorage.getItem(storageKey);
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("dark", "light");
        root.classList.add(theme);
        window.localStorage.setItem(storageKey, theme);
    }, [theme]);

    const setTheme = (next: "light" | "dark") => {
        setThemeState(next);
        // Persist to Supabase auth user_metadata as source-of-truth across devices
        void beeyieldService.updateUserMetadata({ theme: next });
    };

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

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
