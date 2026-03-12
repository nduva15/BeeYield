import { createContext, useContext, useEffect } from "react"

type ThemeState = {
    theme: "light"
    setTheme: (theme: "light") => void
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
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("dark")
        root.classList.add("light")
    }, [])

    return (
        <ThemeContext.Provider value={{ theme: "light", setTheme: () => null }}>
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
