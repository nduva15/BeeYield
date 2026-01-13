// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [viteTsConfigPaths()]
  }
});
export {
  app_config_default as default
};
