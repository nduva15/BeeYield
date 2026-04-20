import { useTheme as useThemeContext } from "@/contexts/ThemeContext";

export function useTheme() {
  const { theme, setTheme } = useThemeContext();
  
  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
  };
}
