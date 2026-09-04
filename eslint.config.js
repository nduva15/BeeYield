import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Keep linting focused on frontend code and avoid noisy/locked dirs
    ignores: [
      "dist",
      "dist/**",
      "**/node_modules/**",
      "beeknowledge-hub",
      "beeknowledge-hub/**",
      "backend",
      "backend/**",
      "services",
      "services/**",
      "scripts",
      "scripts/**",
      "tests",
      "tests/**",
      "supabase",
      "supabase/**",
      "tmp",
      "tmp/**",
      ".pytest_cache",
      ".pytest_cache/**",
      "venv",
      "venv/**",
      ".venv",
      ".venv/**",
      "backend/venv",
      "backend/venv/**",
      "src/routeTree.gen.ts",
      "repo-sync-temp",
      "repo-sync-temp/**",
      "scratch",
      "scratch/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}", "app.config.ts", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
);
