// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
import path from "path";
var app_config_default = defineConfig({
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [viteTsConfigPaths()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    }
  }
});
export {
  app_config_default as default
};
