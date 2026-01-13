// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  server: {
    preset: "vercel"
  },
  vite: {
    // plugins: [viteTsConfigPaths()],
  }
});
export {
  app_config_default as default
};
