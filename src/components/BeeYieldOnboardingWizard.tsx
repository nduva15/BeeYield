import React, { useState, useEffect } from 'react';
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
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/assets/Logo.png';
import { supabase } from '@/integrations/supabase/client';
import beeyieldService, { Apiary, Hive } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { BeeYieldOnboardingStep } from '@/lib/beeyieldOnboarding';

interface BeeYieldOnboardingWizardProps {
  step: BeeYieldOnboardingStep;
  apiaries: Apiary[];
  hives: Hive[];
  devices: any[];
  onComplete: () => void;
  onRefreshData?: () => Promise<void>;
}

export const BeeYieldOnboardingWizard: React.FC<BeeYieldOnboardingWizardProps> = ({
  step: initialStep,
  apiaries,
  hives,
  devices,
  onComplete,
  onRefreshData,
}) => {
  const { user, beeyieldUser } = useAuth();
  const effectiveUser = beeyieldUser || user;
  const userName = (effectiveUser?.user_metadata?.full_name || effectiveUser?.email?.split('@')[0] || 'Beekeeper').split(' ')[0];

  const [currentStep, setCurrentStep] = useState<BeeYieldOnboardingStep>(initialStep);
  const [createdApiaryId, setCreatedApiaryId] = useState<string>(apiaries[0]?.id || '');
  const [createdApiaryName, setCreatedApiaryName] = useState<string>(apiaries[0]?.name || '');
  const [createdHiveId, setCreatedHiveId] = useState<string>(hives[0]?.id || '');
  const [createdHiveCode, setCreatedHiveCode] = useState<string>(hives[0]?.hive_code || '');

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
    name: '',
    location_name: '',
    latitude: -2.409,
    longitude: 37.967,
    size_acres: 18,
    type: 'Stationary Farm Yard',
    forage_type: 'Acacia Tortilis, Desert Date & Citrus Blossom',
    notes: `Lead Beekeeper: ${effectiveUser?.user_metadata?.full_name || userName}. Commercial apiculture site.`,
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [savingApiary, setSavingApiary] = useState(false);

  // Step 2: Hive & Harvest Form State
  const [hiveForm, setHiveForm] = useState({
    hive_code: 'HIVE-001',
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

  // Step 3: Device Logging Form State
  const [deviceForm, setDeviceForm] = useState({
    serial: 'APISENSE-NODE-' + Math.floor(1000 + Math.random() * 9000),
    device_kind: 'vitalsensor',
    link_type: 'bluetooth',
    label: 'Hive Core Telemetry Node',
  });
  const [savingDevice, setSavingDevice] = useState(false);

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
        size_acres: Number(apiaryForm.size_acres) || 10,
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
      const targetApiaryId = createdApiaryId || apiaries[0]?.id;
      if (!targetApiaryId) {
        toast.error('No apiary found. Please complete Step 1 first.');
        setCurrentStep('apiary');
        return;
      }

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
            batch_number: hiveForm.batch_code.trim() || `BATCH-${Date.now()}`,
            quantity_kg: Number(hiveForm.quantity_kg),
            harvest_date: hiveForm.harvest_date,
            honey_type: hiveForm.honey_type,
            moisture_content: Number(hiveForm.moisture_pct) || 17.2,
            grade: 'Grade A Raw Verified',
            notes: `Logged during onboarding for hive ${hiveForm.hive_code}`,
          });
        } catch (harvestErr) {
          console.warn('Harvest log warning (non-fatal):', harvestErr);
        }
      }

      if (onRefreshData) await onRefreshData();

      toast.success(`Hive ${hiveForm.hive_code} & harvest batch registered!`);
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
    if (!deviceForm.serial.trim()) {
      toast.error('Please enter a hardware serial number');
      return;
    }

    setSavingDevice(true);
    try {
      const targetApiaryId = createdApiaryId || apiaries[0]?.id;
      const targetHiveId = createdHiveId || hives[0]?.id;

      await beeyieldService.createDevice({
        serial: deviceForm.serial.trim().toUpperCase(),
        device_kind: deviceForm.device_kind,
        link_type: deviceForm.link_type,
        label: deviceForm.label,
        apiary_id: targetApiaryId,
        hive_id: targetHiveId,
        status: 'active',
      });

      finishOnboarding(`Device ${deviceForm.serial} linked and verified!`);
    } catch (err: any) {
      toast.error('Failed to log device: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingDevice(false);
    }
  };

  const handleSkipDevice = () => {
    if (effectiveUser?.id) {
      localStorage.setItem(`beeyield_skipped_devices_${effectiveUser.id}`, 'true');
    }
    finishOnboarding('Device setup skipped. You can pair hardware at any time.');
  };

  const finishOnboarding = (message: string) => {
    if (effectiveUser?.id) {
      localStorage.setItem(`beeyield_onboarding_completed_${effectiveUser.id}`, 'true');
    }
    toast.success(message);
    onComplete();
  };

  const stepsList = [
    { id: 'apiary', number: 1, title: 'Register Apiary', desc: 'Station location & acreage' },
    { id: 'hive', number: 2, title: 'Hives & Harvests', desc: 'Colony setup & yield batch' },
    { id: 'device', number: 3, title: 'Log Devices', desc: 'Hardware & sensor telemetry' },
  ];

  return (
    <div className="min-h-[85vh] w-full max-w-4xl mx-auto py-6 px-4 flex flex-col justify-center">
      {/* Header & Stepper */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          New Operational Setup Wizard
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Welcome to BeeYield, {userName}!
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Complete your 3-step operational registration to initialize your apiary, inventory colonies with verified harvests, and connect telemetry.
        </p>

        {/* Visual Stepper */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto pt-4">
          {stepsList.map((s, idx) => {
            const isCompleted = (currentStep === 'hive' && idx === 0) || (currentStep === 'device' && idx <= 1);
            const isActive = currentStep === s.id;

            return (
              <div
                key={s.id}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300'
                    : 'border-border/60 bg-card/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? '✓' : s.number}
                  </span>
                  {isActive && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Current</span>}
                </div>
                <div className="font-bold text-xs text-foreground truncate">{s.title}</div>
                <div className="text-[10px] text-muted-foreground hidden sm:block truncate">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: REGISTER APIARY */}
      {currentStep === 'apiary' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Step 1: Register Your Primary Apiary</h2>
              <p className="text-xs text-muted-foreground">Register the geographical location and botanical forage parameters of your bee yard.</p>
            </div>
          </div>

          <form onSubmit={handleSaveApiary} className="space-y-5 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g. Kiunduani, Kibwezi, Makueni County"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">GPS Latitude</label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {isDetectingGps ? 'Detecting...' : 'Detect GPS'}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.0001"
                  value={apiaryForm.latitude}
                  onChange={(e) => setApiaryForm({ ...apiaryForm, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={apiaryForm.longitude}
                  onChange={(e) => setApiaryForm({ ...apiaryForm, longitude: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setApiaryForm({ ...apiaryForm, size_acres: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
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
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Step 2: Add Hives & Log Harvest Batches</h2>
              <p className="text-xs text-muted-foreground">
                Deploy colony boxes in <strong className="text-foreground">{createdApiaryName || 'your apiary'}</strong> and optionally record your first honey harvest.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveHiveAndHarvest} className="space-y-5 pt-6">
            {/* Hive Details Card */}
            <div className="p-4 rounded-2xl border border-border bg-background space-y-4">
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
                    placeholder="e.g. HIVE-001"
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
                    <option value="Active Laying Queen (Young, Marked)">Active Laying Queen (Young, Marked)</option>
                    <option value="Active Laying Queen (Marked)">Active Laying Queen (Marked)</option>
                    <option value="Virgin Queen (Unmated)">Virgin Queen (Unmated)</option>
                    <option value="Queenless Colony">Queenless Colony</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Brood Chamber Frames</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={hiveForm.brood_frames}
                    onChange={(e) => setHiveForm({ ...hiveForm, brood_frames: parseInt(e.target.value) || 6 })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Honey Super Frames</label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={hiveForm.honey_frames}
                    onChange={(e) => setHiveForm({ ...hiveForm, honey_frames: parseInt(e.target.value) || 4 })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Honey Harvest Logging Section */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
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
                      <label className="text-[11px] font-semibold text-foreground">Quantity (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={hiveForm.quantity_kg}
                        onChange={(e) => setHiveForm({ ...hiveForm, quantity_kg: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Harvest Date</label>
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
                      <label className="text-[11px] font-semibold text-foreground">Moisture % (Export Standard &lt;18%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={hiveForm.moisture_pct}
                        onChange={(e) => setHiveForm({ ...hiveForm, moisture_pct: parseFloat(e.target.value) || 17.2 })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Botanical Honey Variety</label>
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

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep('apiary')}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                ← Back to Apiary
              </button>
              <button
                type="submit"
                disabled={savingHive}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
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

      {/* STEP 3: LOG DEVICES */}
      {currentStep === 'device' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Step 3: Pair & Log IoT Devices</h2>
              <p className="text-xs text-muted-foreground">
                Connect your Apisense sensor node or telemetry gateway to <strong className="text-foreground">{createdHiveCode || 'your hive'}</strong>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveDevice} className="space-y-5 pt-6">
            <div className="p-4 rounded-2xl border border-border bg-background space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Device Hardware Serial *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={deviceForm.serial}
                    onChange={(e) => setDeviceForm({ ...deviceForm, serial: e.target.value })}
                    placeholder="e.g. APISENSE-KE-0042"
                    className="flex-1 bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const sample = 'APISENSE-NODE-' + Math.floor(1000 + Math.random() * 9000);
                      setDeviceForm({ ...deviceForm, serial: sample });
                      toast.info(`Generated hardware serial: ${sample}`);
                    }}
                    className="px-3 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold whitespace-nowrap"
                  >
                    Generate Demo Tag
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Device Kind</label>
                  <select
                    value={deviceForm.device_kind}
                    onChange={(e) => setDeviceForm({ ...deviceForm, device_kind: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="vitalsensor">IoT Hive Core Sensor (Temperature & Humidity)</option>
                    <option value="audio_node">Acoustic Audit Sound Node</option>
                    <option value="scale_node">Precision Brood Scale</option>
                    <option value="weather_station">Microclimate Weather Node</option>
                    <option value="hub">Master Gateway Hub</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Communication Protocol</label>
                  <select
                    value={deviceForm.link_type}
                    onChange={(e) => setDeviceForm({ ...deviceForm, link_type: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="bluetooth">Bluetooth BLE Low Energy</option>
                    <option value="wifi">WiFi 2.4GHz Direct Cloud</option>
                    <option value="cellular">Cellular 4G/LTE-M IoT</option>
                    <option value="usb">Direct USB Hardware Link</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  This device will be automatically paired to <strong>{createdHiveCode || 'HIVE-001'}</strong> in <strong>{createdApiaryName || 'your apiary'}</strong>.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleSkipDevice}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1"
              >
                Skip for now (I will pair hardware later) →
              </button>

              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep('hive')}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={savingDevice}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  {savingDevice ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Device...
                    </>
                  ) : (
                    <>
                      Pair Device & Launch Dashboard <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BeeYieldOnboardingWizard;
