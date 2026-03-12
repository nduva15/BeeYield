// Theme hook - Light mode only, dark mode removed
export function useTheme() {
  return {
    theme: "light" as const,
    setTheme: () => {},
    toggleTheme: () => {},
  };
}
