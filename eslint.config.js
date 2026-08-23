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
      "beeknowledge-hub",
      "backend",
      "services",
      "scripts",
      "tests",
      "supabase",
      "tmp",
      ".pytest_cache",
      "venv",
      ".venv",
      "backend/venv",
      "src/routeTree.gen.ts",
      "repo-sync-temp",
      "scratch",
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
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
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
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
);
