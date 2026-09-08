/**
 * Native (Capacitor) runtime setup. Safe to call in any environment — every
 * plugin is imported dynamically and skipped entirely on the web, so the
 * deployed browser app is unaffected.
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export async function initNativeApp(onBack?: () => boolean): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
      import("@capacitor/status-bar"),
      import("@capacitor/splash-screen"),
      import("@capacitor/app"),
    ]);

    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await SplashScreen.hide().catch(() => {});

    App.addListener("backButton", ({ canGoBack }) => {
      const handled = onBack?.();
      if (handled) return;
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch {
    // Plugin unavailable — web build, nothing to do.
  }
}
