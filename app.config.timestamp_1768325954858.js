// app.config.js
import { defineConfig } from "vinxi";
var app_config_default = defineConfig({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/"
    }
  ]
});
export {
  app_config_default as default
};
