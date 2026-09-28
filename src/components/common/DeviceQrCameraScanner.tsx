import React, { useEffect, useRef, useState, useId, useCallback } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { extractCleanSerial } from "@/services/deviceReadingService";

interface DeviceQrCameraScannerProps {
  onScanSuccess: (serial: string) => void;
  onCancel?: () => void;
  title?: string;
  helperText?: string;
  autoStopOnScan?: boolean;
}

/**
 * Triggers a short haptic pulse on mobile devices
 */
function triggerHapticPulse() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([45, 60, 45]);
    } catch {}
  }
}

/**
 * Plays a subtle, pleasing confirmation chime via Web Audio API
 */
function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {}
}

export const DeviceQrCameraScanner: React.FC<DeviceQrCameraScannerProps> = ({
  onScanSuccess,
  onCancel,
  title = "Align QR Code / Barcode",
  helperText = "Point camera at hardware serial QR label on casing",
  autoStopOnScan = true,
}) => {
  const reactId = useId();
  const containerId = `qr-reader-viewport-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [lastScannedSerial, setLastScannedSerial] = useState<string | null>(null);

  // Stop scanner safely
  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
      } catch (err) {
        // Silently catch already stopped / not scanning errors
      }
    }
  }, []);

  // Handle a successfully decoded text
  const handleDecoded = useCallback(
    (decodedText: string) => {
      const cleanSerial = extractCleanSerial(decodedText);
      if (!cleanSerial) return;

      triggerHapticPulse();
      playScanBeep();
      setLastScannedSerial(cleanSerial);

      if (autoStopOnScan) {
        void stopScanner();
      }

      onScanSuccess(cleanSerial);
    },
    [autoStopOnScan, onScanSuccess, stopScanner]
  );

  // Initialize and start camera scanner
  useEffect(() => {
    let isMounted = true;
    let scannerInstance: Html5Qrcode | null = null;

    const initScanner = async () => {
      setIsInitializing(true);
      setErrorMsg(null);

      // Verify DOM element exists
      const containerEl = document.getElementById(containerId);
      if (!containerEl) {
        // Retry after a tiny delay if element is still mounting
        setTimeout(() => {
          if (isMounted) initScanner();
        }, 120);
        return;
      }

      try {
        scannerInstance = new Html5Qrcode(containerId);
        scannerRef.current = scannerInstance;

        // Discover cameras to support switching and robust back camera selection
        let discoveredCameras: CameraDevice[] = [];
        try {
          discoveredCameras = await Html5Qrcode.getCameras();
          if (isMounted) {
            setCameras(discoveredCameras);
          }
        } catch {
          // getCameras might fail on some restrictive browsers, will fallback to facingMode
        }

        // Dynamic responsive qrbox calculation for mobile screens
        // Ensures qrbox is never larger than video stream or container
        const dynamicQrBox = (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const computed = Math.floor(minEdge * 0.72);
          const size = Math.max(140, Math.min(computed, 260));
          return { width: size, height: size };
        };

        const qrConfig = {
          fps: 12,
          qrbox: dynamicQrBox,
          aspectRatio: 1.0,
          disableFlip: false,
        };

        // Camera selection strategy:
        // 1. Try back/rear camera if enumerated
        // 2. Fall back to facingMode: environment
        // 3. Fall back to facingMode: user
        let startSuccess = false;

        if (discoveredCameras.length > 0) {
          // Identify back camera
          let selectedId = discoveredCameras[0].id;
          const rearCamIndex = discoveredCameras.findIndex((c) => {
            const label = c.label.toLowerCase();
            return label.includes("back") || label.includes("rear") || label.includes("environment");
          });

          if (rearCamIndex !== -1) {
            selectedId = discoveredCameras[rearCamIndex].id;
            if (isMounted) setCurrentCameraIndex(rearCamIndex);
          } else if (discoveredCameras.length > 1) {
            // On smartphones, back camera is frequently the last enumerated device
            const lastIndex = discoveredCameras.length - 1;
            selectedId = discoveredCameras[lastIndex].id;
            if (isMounted) setCurrentCameraIndex(lastIndex);
          }

          try {
            await scannerInstance.start(selectedId, qrConfig, handleDecoded, () => {});
            startSuccess = true;
          } catch (camErr) {
            console.warn("Direct camera ID start failed, falling back to facingMode:", camErr);
          }
        }

        if (!startSuccess) {
          try {
            await scannerInstance.start(
              { facingMode: "environment" },
              qrConfig,
              handleDecoded,
              () => {}
            );
            startSuccess = true;
          } catch (facingErr) {
            console.warn("facingMode: environment failed, attempting facingMode: user fallback:", facingErr);
            await scannerInstance.start(
              { facingMode: "user" },
              qrConfig,
              handleDecoded,
              () => {}
            );
            startSuccess = true;
          }
        }

        if (isMounted) {
          setIsScanning(true);
          setIsInitializing(false);

          // Check for torch capability
          try {
            const capabilities = scannerInstance.getRunningTrackCapabilities?.();
            if (capabilities && "torch" in capabilities) {
              setIsTorchSupported(true);
            }
          } catch {}
        }
      } catch (err: any) {
        if (isMounted) {
          setIsInitializing(false);
          setIsScanning(false);
          setErrorMsg(
            err?.message ||
              "Camera access unavailable. Please check camera permissions in your phone browser settings or snap a photo of the QR code below."
          );
        }
      }
    };

    // Small delay ensures clean DOM mount
    const startTimer = setTimeout(() => {
      void initScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(startTimer);
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().catch(() => {});
      }
    };
  }, [containerId, handleDecoded]);

  // Switch between cameras
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1 || !scannerRef.current) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    if (!nextCamera) return;

    try {
      await stopScanner();
      setCurrentCameraIndex(nextIndex);
      setIsInitializing(true);

      const dynamicQrBox = (w: number, h: number) => {
        const edge = Math.floor(Math.min(w, h) * 0.72);
        const size = Math.max(140, Math.min(edge, 260));
        return { width: size, height: size };
      };

      await scannerRef.current.start(
        nextCamera.id,
        { fps: 12, qrbox: dynamicQrBox, aspectRatio: 1.0 },
        handleDecoded,
        () => {}
      );
      setIsInitializing(false);
      setIsScanning(true);
      toast.info(`Switched to: ${nextCamera.label || `Camera ${nextIndex + 1}`}`);
    } catch (e: any) {
      setIsInitializing(false);
      toast.error("Failed to switch camera");
    }
  };

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const nextState = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setIsTorchOn(nextState);
    } catch {
      toast.error("Flashlight torch not supported by this browser");
    }
  };

  // Native Photo Upload / Camera snap fallback
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsInitializing(true);
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
      }
      const result = await scanner.scanFile(file, true);
      setIsInitializing(false);
      handleDecoded(result);
    } catch {
      setIsInitializing(false);
      toast.error("No valid QR code or barcode detected in image. Please try closer or clearer lighting.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Viewfinder Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-stone-950 border-2 border-amber-500/70 shadow-2xl flex flex-col items-center justify-center min-h-[260px] max-h-[300px]">
        {/* html5-qrcode target div */}
        <div id={containerId} className="w-full h-full min-h-[260px] max-h-[300px] flex items-center justify-center" />

        {/* Viewfinder Reticle Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3 select-none">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 border border-white/25 rounded-2xl flex items-center justify-center shadow-inner">
            {/* 4 Glowing Corner Brackets */}
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg shadow-[0_0_8px_#f59e0b]" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg shadow-[0_0_8px_#f59e0b]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg shadow-[0_0_8px_#f59e0b]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg shadow-[0_0_8px_#f59e0b]" />

            {/* Glowing Laser Scan Bar */}
            {isScanning && (
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-[0_0_14px_#f59e0b]" />
            )}

            {/* Loading Spinner */}
            {isInitializing && (
              <div className="flex flex-col items-center gap-2 bg-black/75 px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-[11px] font-bold text-white tracking-wide">Starting Camera…</span>
              </div>
            )}
          </div>

          {/* Subtitle Badge */}
          <div className="mt-3 px-3 py-1 rounded-full bg-black/75 border border-white/15 backdrop-blur-sm flex items-center gap-1.5">
            {lastScannedSerial ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Scanned: {lastScannedSerial}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-stone-200">
                {isScanning ? title : "Initializing live video feed…"}
              </span>
            )}
          </div>
        </div>

        {/* Top-Right Floating Controls (Flip Camera / Torch) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all shadow-md active:scale-95"
              title="Flip camera"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {isTorchSupported && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-md active:scale-95 ${
                isTorchOn
                  ? "bg-amber-400 text-stone-950 border-amber-300 shadow-[0_0_10px_#f59e0b]"
                  : "bg-black/60 hover:bg-black/80 text-white border-white/20"
              }`}
              title={isTorchOn ? "Turn off flashlight" : "Turn on flashlight"}
            >
              {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4 text-white/70" />}
            </button>
          )}
        </div>
      </div>

      {/* Camera Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Camera Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-destructive/90">{errorMsg}</p>
        </div>
      )}

      {/* Bottom Action Strip: Photo Upload & Cancel */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
        >
          <Upload className="w-3.5 h-3.5 text-amber-500" />
          <span>Upload / Snap Photo</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={() => {
              void stopScanner();
              onCancel();
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-medium underline decoration-dotted"
          >
            Cancel / Manual Code
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        {helperText}
      </p>
    </div>
  );
};
