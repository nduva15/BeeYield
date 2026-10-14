import { useTheme as useThemeContext } from "@/contexts/ThemeContext";

/**
 * Legacy hook kept for existing imports. It delegates to the single
 * ThemeContext so there is ONE source of truth. Default is always light;
 * the phone's system dark mode is intentionally ignored.
 */
export function useTheme() {
  const { theme, setTheme } = useThemeContext();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, setTheme, toggleTheme };
}
