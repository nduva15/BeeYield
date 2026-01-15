// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  }
});
export {
  app_config_default as default
};
