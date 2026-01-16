// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  vite: {
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
