import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  Scale,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Plus,
  Sparkles,
  Navigation,
  Sprout,
  ScanLine,
  Radio,
  X,
  RefreshCw,
  Droplets,
  Calendar,
  Box,
  Crown,
  QrCode,
  Camera,
  Check,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Mic,
  Shield,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import beeyieldService, { Apiary, Hive } from '@/services/beeyieldService';
import { useAuth } from '@/hooks/use-auth';
import { BeeYieldOnboardingStep } from '@/lib/beeyieldOnboarding';
import { DeviceQrCameraScanner } from '@/components/common/DeviceQrCameraScanner';
import { RecentDeviceReadingsView } from '@/components/common/RecentDeviceReadingsView';
import {
  resolveDeviceReadings,
  extractCleanSerial,
  persistScannedDeviceTelemetry,
  validateSensorDeviceSerial,
  type ScannedDeviceReadings,
} from '@/services/deviceReadingService';

interface BeeYieldOnboardingWizardProps {
  step: BeeYieldOnboardingStep;
  apiaries?: Apiary[];
  hives?: Hive[];
  devices?: any[];
  onComplete: () => void;
  onRefreshData?: () => Promise<void>;
}

// ----------------------------------------------------------------------
// Audio Feedback Utility
// ----------------------------------------------------------------------
function playScanBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

// ----------------------------------------------------------------------
// Integrated Camera QR / Barcode Scanner Modal
// ----------------------------------------------------------------------
function OnboardingQrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (rawCode: string) => void;
}) {
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Scan Hardware QR / Barcode</h3>
              <p className="text-[11px] text-muted-foreground">Mobile & desktop auto-focus camera scanner</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder area using DeviceQrCameraScanner */}
        <DeviceQrCameraScanner
          onScanSuccess={(code) => {
            onScanSuccess(code);
            onClose();
          }}
          onClose={onClose}
          title="Hardware Tag Camera Viewfinder"
        />

        {/* Manual input fallback */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-[11px] font-bold text-foreground">
            Or Type Serial Number / Tag Manually:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. APISENSE-NODE-1243 or VS-KBZ-001"
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-amber-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCode.trim()) {
                  e.preventDefault();
                  onScanSuccess(manualCode.trim());
                  onClose();
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!manualCode.trim()) {
                  toast.error('Please enter a serial code');
                  return;
                }
                onScanSuccess(manualCode.trim());
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-sm transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Wizard Component
// ----------------------------------------------------------------------
export const BeeYieldOnboardingWizard: React.FC<BeeYieldOnboardingWizardProps> = ({
  step: initialStep,
  apiaries = [],
  hives = [],
  devices = [],
  onComplete,
  onRefreshData,
}) => {
  const { user, profile } = useAuth();
  const userName = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Beekeeper'
  ).split(' ')[0];

  const [currentStep, setCurrentStep] = useState<BeeYieldOnboardingStep>(initialStep);
  const [createdApiaryId, setCreatedApiaryId] = useState<string>(apiaries[0]?.id || '');
  const [createdApiaryName, setCreatedApiaryName] = useState<string>(apiaries[0]?.name || '');
  const [createdHiveId, setCreatedHiveId] = useState<string>(hives[0]?.id || '');
  const [createdHiveCode, setCreatedHiveCode] = useState<string>(hives[0]?.hive_code || 'KIB-001');

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (apiaries.length > 0 && !createdApiaryId) {
      setCreatedApiaryId(apiaries[0].id);
      setCreatedApiaryName(apiaries[0].name);
    }
  }, [apiaries, createdApiaryId]);

  useEffect(() => {
    if (hives.length > 0 && !createdHiveId) {
      setCreatedHiveId(hives[0].id);
      setCreatedHiveCode(hives[0].hive_code);
    }
  }, [hives, createdHiveId]);

  // Step 1: Apiary Form State
  const [apiaryForm, setApiaryForm] = useState({
    name: 'Kibwezi Commercial Apiary',
    location_name: 'Kibwezi, Makueni County, Kenya',
    latitude: -2.409,
    longitude: 37.967,
    size_acres: 5,
    type: 'Stationary Farm Yard',
    forage_type: 'Acacia Tortilis, Desert Date & Citrus Blossom',
    notes: `Lead Beekeeper: ${profile?.full_name || userName}. 5-acre commercial apiculture site in Kibwezi, Kenya.`,
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [savingApiary, setSavingApiary] = useState(false);

  // Step 2: Hive & Harvest Form State
  const [hiveForm, setHiveForm] = useState({
    hive_code: 'KIB-001',
    hive_type: 'Langstroth 10-Frame',
    queen_status: 'Active Laying Queen (Young, Marked)',
    queen_breeding_year: new Date().getFullYear(),
    queen_present: true,
    brood_frames: 6,
    honey_frames: 4,
    // Harvest logging
    include_harvest: true,
    batch_code: `BATCH-${new Date().getFullYear()}-01`,
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_kg: 18.5,
    moisture_pct: 17.2,
    honey_type: 'Raw Acacia & Desert Wildflower Blossom',
  });
  const [savingHive, setSavingHive] = useState(false);

  // Step 3: Device Logging Form State & Mode
  // 'none' = Start with no devices (Manual Logging & On-device phone mic mode)
  // 'pair' = Connect physical Apisense / VitalSensor hardware
  const [deviceMode, setDeviceMode] = useState<'none' | 'pair'>('pair');
  const [deviceForm, setDeviceForm] = useState({
    serial: '',
    device_kind: 'audio_node',
    link_type: 'cellular',
    label: 'Hive Core Acoustic & Telemetry Node',
  });
  const [savingDevice, setSavingDevice] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [deviceTelemetry, setDeviceTelemetry] = useState<ScannedDeviceReadings | null>(null);

  // Auto-resolve device telemetry readings when deviceForm.serial changes
  useEffect(() => {
    if (deviceForm.serial.trim()) {
      const clean = extractCleanSerial(deviceForm.serial);
      const targetApiary =
        createdApiaryName || apiaries[0]?.name || 'Timothy Nduva Commercial Yard';
      const targetHive = createdHiveCode || hives[0]?.code || 'HIVE-01';
      const readings = resolveDeviceReadings(clean, targetApiary, targetHive);
      setDeviceTelemetry(readings);
    } else {
      setDeviceTelemetry(null);
    }
  }, [deviceForm.serial, createdApiaryName, createdHiveCode, apiaries, hives]);

  // Handle Scanned Code with Intelligent Parser
  const handleScannedCode = (raw: string) => {
    const clean = extractCleanSerial(raw);

    // Auto-detect device kind from naming pattern
    const lower = clean.toLowerCase();
    let detectedKind = deviceForm.device_kind;
    if (lower.includes('acoustic') || lower.includes('apisense') || lower.includes('sound')) {
      detectedKind = 'audio_node';
    } else if (lower.includes('scale') || lower.includes('weight')) {
      detectedKind = 'scale_node';
    } else if (lower.includes('weather') || lower.includes('climate')) {
      detectedKind = 'weather_station';
    } else if (lower.includes('hub') || lower.includes('gateway')) {
      detectedKind = 'hub';
    } else if (lower.includes('vs') || lower.includes('vital')) {
      detectedKind = 'vitalsensor';
    }

    setDeviceForm((prev) => ({
      ...prev,
      serial: clean.toUpperCase(),
      device_kind: detectedKind,
    }));

    const targetApiary =
      createdApiaryName || apiaries[0]?.name || 'Timothy Nduva Commercial Yard';
    const targetHive = createdHiveCode || hives[0]?.code || 'HIVE-01';
    const readings = resolveDeviceReadings(clean, targetApiary, targetHive);
    setDeviceTelemetry(readings);

    toast.success(`Scanned hardware code: ${clean.toUpperCase()}`);
  };

  // Auto-Detect GPS
  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setApiaryForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        }));
        setIsDetectingGps(false);
        toast.success('Live GPS coordinates captured from your device');
      },
      (err) => {
        setIsDetectingGps(false);
        toast.error('Could not fetch GPS: ' + err.message);
      },
      { timeout: 10000 }
    );
  };

  // Submit Step 1: Register Apiary
  const handleSaveApiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiaryForm.name.trim()) {
      toast.error('Please enter an apiary station name');
      return;
    }

    setSavingApiary(true);
    try {
      const { data, error } = await beeyieldService.createApiary({
        name: apiaryForm.name.trim(),
        location_name: apiaryForm.location_name.trim() || 'Apiary Location',
        latitude: Number(apiaryForm.latitude),
        longitude: Number(apiaryForm.longitude),
        size_acres: Number(apiaryForm.size_acres) || 5,
        type: apiaryForm.type,
        forage_type: apiaryForm.forage_type,
        notes: apiaryForm.notes,
        expected_hives: 10,
      });

      if (error) throw error;

      const newId = data?.id || `apiary-${Date.now()}`;
      const newName = data?.name || apiaryForm.name;
      setCreatedApiaryId(newId);
      setCreatedApiaryName(newName);

      if (onRefreshData) await onRefreshData();

      toast.success(`Apiary "${newName}" successfully registered!`);
      setCurrentStep('hive');
    } catch (err: any) {
      toast.error('Failed to create apiary: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingApiary(false);
    }
  };

  // Submit Step 2: Hives with Harvests
  const handleSaveHiveAndHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hiveForm.hive_code.trim()) {
      toast.error('Please enter a hive code');
      return;
    }

    setSavingHive(true);
    try {
      const targetApiaryId = createdApiaryId || apiaries[0]?.id || 'apiary-kibwezi';

      // 1. Create Hive
      const { data: hiveData, error: hiveError } = await beeyieldService.createHive({
        hive_code: hiveForm.hive_code.trim().toUpperCase(),
        apiary_id: targetApiaryId,
        hive_type: hiveForm.hive_type,
        frame_count: Number(hiveForm.brood_frames) + Number(hiveForm.honey_frames),
        status: hiveForm.queen_present ? 'Active' : 'Queenless',
        installation_date: new Date().toISOString().split('T')[0],
      });

      if (hiveError) throw hiveError;

      const newHiveId = hiveData?.id || `hive-${Date.now()}`;
      setCreatedHiveId(newHiveId);
      setCreatedHiveCode(hiveForm.hive_code.trim().toUpperCase());

      // 2. Log Initial Harvest if requested
      if (hiveForm.include_harvest && hiveForm.quantity_kg > 0) {
        try {
          await beeyieldService.createHarvest({
            hive_id: newHiveId,
            apiary_id: targetApiaryId,
            batch_code: hiveForm.batch_code.trim() || `BATCH-${Date.now()}`,
            quantity_kg: Number(hiveForm.quantity_kg),
            harvest_date: hiveForm.harvest_date,
            honey_type: hiveForm.honey_type,
            moisture_content_percent: Number(hiveForm.moisture_pct) || 17.2,
            notes: `Logged during onboarding for hive ${hiveForm.hive_code}`,
          });
        } catch (harvestErr) {
          console.warn('Harvest log warning (non-fatal):', harvestErr);
        }
      }

      if (onRefreshData) await onRefreshData();

      toast.success(`Colony ${hiveForm.hive_code} registered!`);
      setCurrentStep('device');
    } catch (err: any) {
      toast.error('Failed to create hive: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingHive(false);
    }
  };

  // Submit Step 3: Log Device
  const handleSaveDevice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSerial = deviceForm.serial.trim().toUpperCase();
    if (!cleanSerial) {
      toast.error('Please enter a hardware serial number');
      return;
    }

    const check = validateSensorDeviceSerial(cleanSerial, 'in_hive');
    if (!check.isValid) {
      toast.error(check.error || 'Please enter or scan a valid genuine hardware serial.');
      return;
    }

    setSavingDevice(true);
    try {
      const targetApiaryId = createdApiaryId || apiaries[0]?.id || 'apiary-kibwezi';
      const targetHiveId = createdHiveId || hives[0]?.id || 'hive-kib-001';

      await beeyieldService.createDevice({
        device_code: deviceForm.serial.trim().toUpperCase(),
        device_name: deviceForm.label || `Device ${deviceForm.serial}`,
        device_type: (deviceForm.device_kind === 'disease' || deviceForm.device_kind === 'inland') ? deviceForm.device_kind : 'infield',
        apiary_id: targetApiaryId,
        hive_id: targetHiveId,
      });

      // Persist immediate telemetry so the dashboard displays live readings right away
      const clean = extractCleanSerial(deviceForm.serial);
      const targetApiary =
        createdApiaryName || apiaries[0]?.name || 'Timothy Nduva Commercial Yard';
      const targetHive = createdHiveCode || hives[0]?.code || 'HIVE-01';
      const telemetry = deviceTelemetry || resolveDeviceReadings(clean, targetApiary, targetHive);
      await persistScannedDeviceTelemetry(telemetry, user?.id);

      finishOnboarding(`Device ${deviceForm.serial} linked and verified!`);
    } catch (err: any) {
      toast.error('Failed to log device: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingDevice(false);
    }
  };

  // Start with No Devices (Manual Logging & Acoustic Mode)
  const handleStartWithoutDevices = () => {
    if (user?.id) {
      localStorage.setItem(`beeyield_skipped_devices_${user.id}`, 'true');
    }
    finishOnboarding('Apiary initialized in Manual Mode. You can connect IoT sensors at any time!');
  };

  const finishOnboarding = (message: string) => {
    if (user?.id) {
      localStorage.setItem(`beeyield_onboarding_completed_${user.id}`, 'true');
    }
    toast.success(message);
    onComplete();
  };

  const stepsList = [
    { id: 'apiary', number: 1, title: 'Register Apiary', desc: 'Station location & forage' },
    { id: 'hive', number: 2, title: 'Hives & Harvests', desc: 'Colony & yield records' },
    { id: 'device', number: 3, title: 'Log Devices', desc: 'Sensors or manual mode' },
  ];

  return (
    <div className="min-h-[85vh] w-full max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 flex flex-col justify-center">
      {/* QR Scanner Modal */}
      <OnboardingQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScannedCode}
      />

      {/* Header & Stepper */}
      <div className="text-center space-y-2.5 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          BeeYield Setup Wizard
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Welcome to BeeYield, {userName}!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Complete your 3-step setup to register your apiary, inventory colonies, and choose between IoT hardware pairing or manual mode.
        </p>

        {/* Responsive Stepper */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 max-w-2xl mx-auto pt-3">
          {stepsList.map((s, idx) => {
            const isCompleted =
              (currentStep === 'hive' && idx === 0) || (currentStep === 'device' && idx <= 1);
            const isActive = currentStep === s.id;

            return (
              <div
                key={s.id}
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300'
                    : 'border-border/60 bg-card/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? '✓' : s.number}
                  </span>
                  {isActive && (
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Current
                    </span>
                  )}
                </div>
                <div className="font-bold text-[11px] sm:text-xs text-foreground truncate">
                  {s.title}
                </div>
                <div className="text-[10px] text-muted-foreground hidden sm:block truncate">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: REGISTER APIARY */}
      {currentStep === 'apiary' && (
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-5 border-b border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Step 1: Register Your Primary Apiary
              </h2>
              <p className="text-xs text-muted-foreground">
                Define the geographical location and botanical forage parameters of your bee yard.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveApiary} className="space-y-4 sm:space-y-5 pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Apiary Station Name *</label>
                <input
                  type="text"
                  required
                  value={apiaryForm.name}
                  onChange={(e) => setApiaryForm({ ...apiaryForm, name: e.target.value })}
                  placeholder="e.g. Kibwezi Commercial Apiary"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Location / District *</label>
                <input
                  type="text"
                  required
                  value={apiaryForm.location_name}
                  onChange={(e) => setApiaryForm({ ...apiaryForm, location_name: e.target.value })}
                  placeholder="e.g. Kibwezi, Makueni County, Kenya"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">GPS Latitude</label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {isDetectingGps ? 'Detecting...' : 'Detect GPS'}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.0001"
                  value={apiaryForm.latitude}
                  onChange={(e) =>
                    setApiaryForm({ ...apiaryForm, latitude: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={apiaryForm.longitude}
                  onChange={(e) =>
                    setApiaryForm({ ...apiaryForm, longitude: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Apiary Area (Acres)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={apiaryForm.size_acres}
                  onChange={(e) =>
                    setApiaryForm({ ...apiaryForm, size_acres: parseFloat(e.target.value) || 1 })
                  }
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Operation Classification</label>
                <select
                  value={apiaryForm.type}
                  onChange={(e) => setApiaryForm({ ...apiaryForm, type: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="Stationary Farm Yard">Stationary Farm Yard</option>
                  <option value="Commercial Pollination Site">Commercial Pollination Site</option>
                  <option value="Migratory Apiary">Migratory Apiary</option>
                  <option value="Queen Breeding & Rearing">Queen Breeding & Rearing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Primary Forage Flora</label>
                <input
                  type="text"
                  value={apiaryForm.forage_type}
                  onChange={(e) => setApiaryForm({ ...apiaryForm, forage_type: e.target.value })}
                  placeholder="e.g. Acacia Tortilis, Desert Date & Citrus Blossom"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={savingApiary}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                {savingApiary ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving Apiary...
                  </>
                ) : (
                  <>
                    Save Apiary & Continue to Hives <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: HIVES WITH HARVESTS */}
      {currentStep === 'hive' && (
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-5 border-b border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Step 2: Add Hives & Log Harvest Batches
              </h2>
              <p className="text-xs text-muted-foreground">
                Deploy colony boxes in{' '}
                <strong className="text-foreground">{createdApiaryName || 'your apiary'}</strong> and
                optionally record your honey harvest.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveHiveAndHarvest} className="space-y-4 sm:space-y-5 pt-5">
            {/* Hive Details Card */}
            <div className="p-4 rounded-2xl border border-border bg-background space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-amber-500" /> Colony Architecture & Queen Status
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Hive Code *</label>
                  <input
                    type="text"
                    required
                    value={hiveForm.hive_code}
                    onChange={(e) => setHiveForm({ ...hiveForm, hive_code: e.target.value })}
                    placeholder="e.g. KIB-001"
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Architecture</label>
                  <select
                    value={hiveForm.hive_type}
                    onChange={(e) => setHiveForm({ ...hiveForm, hive_type: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    <option value="Langstroth 10-Frame">Langstroth 10-Frame</option>
                    <option value="Langstroth 8-Frame">Langstroth 8-Frame</option>
                    <option value="Top Bar Hive (KTBH)">Top Bar Hive (KTBH)</option>
                    <option value="Dadant 12-Frame">Dadant 12-Frame</option>
                    <option value="Warre Hive">Warre Hive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Queen Marking Status</label>
                  <select
                    value={hiveForm.queen_status}
                    onChange={(e) => setHiveForm({ ...hiveForm, queen_status: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    <option value="Active Laying Queen (Young, Marked)">
                      Active Laying Queen (Young, Marked)
                    </option>
                    <option value="Active Laying Queen (Marked)">Active Laying Queen (Marked)</option>
                    <option value="Virgin Queen (Unmated)">Virgin Queen (Unmated)</option>
                    <option value="Queenless Colony">Queenless Colony</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Brood Chamber Frames
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={hiveForm.brood_frames}
                    onChange={(e) =>
                      setHiveForm({ ...hiveForm, brood_frames: parseInt(e.target.value) || 6 })
                    }
                    className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Honey Super Frames
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={hiveForm.honey_frames}
                    onChange={(e) =>
                      setHiveForm({ ...hiveForm, honey_frames: parseInt(e.target.value) || 4 })
                    }
                    className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Honey Harvest Logging Section */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hiveForm.include_harvest}
                    onChange={(e) => setHiveForm({ ...hiveForm, include_harvest: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  Log Initial Honey Harvest Batch For This Hive
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Recommended
                </span>
              </div>

              {hiveForm.include_harvest && (
                <div className="space-y-3 pt-2 border-t border-amber-500/20">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Batch Code</label>
                      <input
                        type="text"
                        value={hiveForm.batch_code}
                        onChange={(e) => setHiveForm({ ...hiveForm, batch_code: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        Quantity (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={hiveForm.quantity_kg}
                        onChange={(e) =>
                          setHiveForm({ ...hiveForm, quantity_kg: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        Harvest Date
                      </label>
                      <input
                        type="date"
                        value={hiveForm.harvest_date}
                        onChange={(e) => setHiveForm({ ...hiveForm, harvest_date: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        Moisture % (Export Standard &lt;18%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={hiveForm.moisture_pct}
                        onChange={(e) =>
                          setHiveForm({
                            ...hiveForm,
                            moisture_pct: parseFloat(e.target.value) || 17.2,
                          })
                        }
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        Botanical Honey Variety
                      </label>
                      <input
                        type="text"
                        value={hiveForm.honey_type}
                        onChange={(e) => setHiveForm({ ...hiveForm, honey_type: e.target.value })}
                        placeholder="e.g. Raw Acacia Blossom"
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep('apiary')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
              >
                ← Back to Apiary
              </button>
              <button
                type="submit"
                disabled={savingHive}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                {savingHive ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving Hive & Harvest...
                  </>
                ) : (
                  <>
                    Save Hive & Continue to Devices <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: LOG DEVICES & ZERO-DEVICE OPTION */}
      {currentStep === 'device' && (
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-5 border-b border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Step 3: Pair & Log IoT Devices
              </h2>
              <p className="text-xs text-muted-foreground">
                Pair an Apisense node to{' '}
                <strong className="text-foreground">{createdHiveCode || 'KIB-001'}</strong> or start
                immediately in manual mode.
              </p>
            </div>
          </div>

          {/* Operational Mode Selector: Pair Devices vs Start With No Devices */}
          <div className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => React.startTransition(() => setDeviceMode('pair'))}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  deviceMode === 'pair'
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span className="truncate pointer-events-none select-none">Pair IoT Hardware</span>
              </button>

              <button
                type="button"
                onClick={() => React.startTransition(() => setDeviceMode('none'))}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  deviceMode === 'none'
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span className="truncate pointer-events-none select-none">Start Without Devices</span>
              </button>
            </div>

            {/* VIEW A: ZERO-DEVICE MANUAL MODE */}
            {deviceMode === 'none' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3.5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <h3 className="text-sm font-bold">Manual Apiary Mode (100% Operational)</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You do not need physical IoT hardware or sensors to run BeeYield! Timothy Nduva and
                    many commercial beekeepers run full field yards using phone-assisted inspections and
                    on-device acoustics.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-start gap-2">
                      <Mic className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-foreground">On-Device Acoustic Audits</div>
                        <div className="text-[11px] text-muted-foreground">
                          Record hive hum using your phone mic; runs BEE-SOUND DSP locally.
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-foreground">Manual Field Inspections</div>
                        <div className="text-[11px] text-muted-foreground">
                          Log brood frames, queen presence, honey stores & mite washes.
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-start gap-2">
                      <Sprout className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-foreground">Bloom & Weather Phenology</div>
                        <div className="text-[11px] text-muted-foreground">
                          Live microclimate radar, acacia nectar flows, and flight tracker.
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-foreground">BeeGPT AI Beekeeping</div>
                        <div className="text-[11px] text-muted-foreground">
                          Instant disease diagnostics, treatment calculator & management advice.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>You can connect sensor nodes or weight scales anytime later from Apiary tools.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('hive')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground text-center"
                  >
                    ← Back to Hive
                  </button>

                  <button
                    type="button"
                    onClick={handleStartWithoutDevices}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    Start Without Devices & Launch Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW B: HARDWARE PAIRING FORM */}
            {deviceMode === 'pair' && (
              <form onSubmit={handleSaveDevice} className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl border border-border bg-background space-y-4">
                  {/* Device Hardware Serial with QR/Barcode Scan Integration */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Device Hardware Serial *
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        QR, Barcode or Serial ID
                      </span>
                    </div>

                    {/* Input Field */}
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={deviceForm.serial}
                        onChange={(e) => setDeviceForm({ ...deviceForm, serial: e.target.value })}
                        placeholder="e.g. APISENSE-NODE-1243"
                        className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      {deviceForm.serial && (
                        <button
                          type="button"
                          onClick={() => setDeviceForm({ ...deviceForm, serial: '' })}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                          title="Clear serial"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Action buttons below input - NEVER overflow on mobile screens */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Scan QR / Barcode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const sample =
                            'APISENSE-NODE-' + Math.floor(1000 + Math.random() * 9000);
                          setDeviceForm({ ...deviceForm, serial: sample });
                          toast.info(`Generated serial: ${sample}`);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Demo Tag</span>
                      </button>
                    </div>

                    {/* Scanned / Detected Live Telemetry Preview */}
                    {deviceTelemetry && (
                      <div className="pt-2">
                        <RecentDeviceReadingsView
                          readings={deviceTelemetry}
                          onRescan={() => setIsScannerOpen(true)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Device Kind</label>
                      <select
                        value={deviceForm.device_kind}
                        onChange={(e) =>
                          setDeviceForm({ ...deviceForm, device_kind: e.target.value })
                        }
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium"
                      >
                        <option value="audio_node">Acoustic Audit Sound Node (BEE-SOUND)</option>
                        <option value="vitalsensor">
                          IoT Hive Core Sensor (Temperature & Humidity)
                        </option>
                        <option value="scale_node">Precision Brood Scale (Honey Flow)</option>
                        <option value="weather_station">Microclimate Weather Node</option>
                        <option value="hub">Master Gateway Hub (LoRa / 4G)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Communication Protocol
                      </label>
                      <select
                        value={deviceForm.link_type}
                        onChange={(e) =>
                          setDeviceForm({ ...deviceForm, link_type: e.target.value })
                        }
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium"
                      >
                        <option value="cellular">Cellular 4G/LTE-M IoT</option>
                        <option value="bluetooth">Bluetooth BLE Low Energy</option>
                        <option value="wifi">WiFi 2.4GHz Direct Cloud</option>
                        <option value="usb">Direct USB Hardware Link</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span className="leading-tight">
                      This device will be automatically paired to{' '}
                      <strong>{createdHiveCode || 'KIB-001'}</strong> in{' '}
                      <strong>{createdApiaryName || 'your apiary'}</strong>.
                    </span>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleStartWithoutDevices}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground text-center transition-colors order-3 sm:order-1"
                  >
                    Start Without Devices (Manual Mode) →
                  </button>

                  <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('hive')}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground text-center"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={savingDevice}
                      className="flex-2 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      {savingDevice ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> Pairing...
                        </>
                      ) : (
                        <>
                          Pair Device & Launch <CheckCircle2 className="w-4 h-4 shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeeYieldOnboardingWizard;
