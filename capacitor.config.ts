import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Beeyield native shell (iOS + Android).
 *
 * The app is a server-rendered TanStack Start app whose AI endpoint
 * (/api/public/beegpt) runs on the server, so the native shell loads the
 * deployed site instead of a static bundle. Point CAP_SERVER_URL at your
 * preview URL while developing and at the published URL for store builds.
 */
const serverUrl =
  process.env.CAP_SERVER_URL ??
  "https://id-preview--73e9cb93-0251-4d03-ac8a-f323b4bb684c.lovable.app";

const config: CapacitorConfig = {
  appId: "app.beeyield.mobile",
  appName: "Beeyield",
  webDir: "dist",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
    backgroundColor: "#0f0d0b",
  },
  android: {
    backgroundColor: "#0f0d0b",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0f0d0b",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f0d0b",
    },
    Keyboard: {
      resize: "native",
    },
  },
};

export default config;
