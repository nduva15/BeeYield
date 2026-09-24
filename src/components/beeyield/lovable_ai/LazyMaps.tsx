import { lazy, Suspense, memo, useState, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

/**
 * Leaflet touches `window` at module scope (L.divIcon / L.Icon.Default), so the
 * map modules must never enter the SSR import graph. These wrappers dynamically
 * import them in the browser only, and — just as important for mobile perf —
 * they mount nothing at all until the overlay is actually opened, so the heavy
 * Leaflet chunk is never downloaded or re-rendered during normal navigation.
 */

function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

const HivePlacementMapImpl = lazy(() => import("./HivePlacementMap"));
const MOAViewImpl = lazy(() => import("./MOAView"));

function MapFallback() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  );
}

type HiveMapProps = {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  initialRunId?: string;
  initialVersionId?: string;
};

export const HivePlacementMap = memo(function HivePlacementMap(props: HiveMapProps) {
  if (!props.isOpen) return null;
  return (
    <ClientOnly fallback={<MapFallback />}>
      <Suspense fallback={<MapFallback />}>
        <HivePlacementMapImpl {...props} />
      </Suspense>
    </ClientOnly>
  );
});

export const MOAView = memo(function MOAView(props: HiveMapProps) {
  if (!props.isOpen) return null;
  return (
    <ClientOnly fallback={<MapFallback />}>
      <Suspense fallback={<MapFallback />}>
        <MOAViewImpl {...props} />
      </Suspense>
    </ClientOnly>
  );
});

export default HivePlacementMap;
