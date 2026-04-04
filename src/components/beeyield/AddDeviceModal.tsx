import React from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive } from '@/services/beeyieldService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from "@/components/ui/label";
import { Cpu, ShieldCheck, RefreshCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { glass, GlassModal } from './GlassTheme';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (device: any) => void;
  apiaries: Apiary[];
  hives: Hive[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  open,
  onOpenChange,
  onAdd,
  apiaries,
  hives,
}) => {
  const { t } = useLanguage();
  const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>("");
  const [selectedHiveId, setSelectedHiveId] = React.useState<string>("");
  const [deviceCode, setDeviceCode] = React.useState("");
  const [deviceName, setDeviceName] = React.useState("");
  const [deviceType, setDeviceType] = React.useState<'infield' | 'inland' | 'disease'>('inland');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const filteredHives = React.useMemo(
    () => hives?.filter((h) => h.apiary_id === selectedApiaryId) || [],
    [hives, selectedApiaryId]
  );

  const handleClose = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  const reset = () => {
    setDeviceCode("");
    setDeviceName("");
    setSelectedApiaryId("");
    setSelectedHiveId("");
    setDeviceType('inland');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deviceCode?.trim()) {
      toast.error("Please enter the device ID");
      return;
    }
    if (!selectedApiaryId) {
      toast.error("Please select a location");
      return;
    }

    const toastId = toast.loading("Adding device...");
    setIsSubmitting(true);
    try {
      const locationName = apiaries.find((a) => a.id === selectedApiaryId)?.name || '';
      const newDevice = {
        device_code: deviceCode.trim(),
        device_name: (deviceName || `Device ${deviceCode}`).trim(),
        device_type: deviceType,
        location_name: locationName,
        apiary_id: selectedApiaryId,
        linked_apiary_id: selectedApiaryId,
        hive_id: selectedHiveId || null,
      };

      await onAdd(newDevice);
      toast.success(t?.('device_added') || "Device added.", { id: toastId });
      reset();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Could not add device. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassModal
      isOpen={open}
      onClose={handleClose}
      title="Add device"
      subtitle="Register a new node"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="add-device-id" className={glass.microLabel}>Device ID</Label>
            <div className="relative">
              <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="add-device-id"
                name="device_code"
                autoComplete="off"
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value)}
                placeholder="e.g. BY-001"
                className={cn(glass.input, "pl-10 font-mono text-[11px] font-black")}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={glass.microLabel}>Device type</Label>
            <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
              <SelectTrigger id="add-device-type" aria-label="Device type" className={cn(glass.select, "text-[11px] font-black")}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className={glass.selectContent}>
                <SelectItem value="inland" className="text-[11px] font-black">Gateway</SelectItem>
                <SelectItem value="infield" className="text-[11px] font-black">Sensor</SelectItem>
                <SelectItem value="disease" className="text-[11px] font-black">Health monitor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={glass.microLabel}>Location (Apiary)</Label>
            <Select
              value={selectedApiaryId}
              onValueChange={(v) => {
                setSelectedApiaryId(v);
                setSelectedHiveId('');
              }}
            >
              <SelectTrigger id="add-device-apiary" aria-label="Location" className={cn(glass.select, "text-[11px] font-black")}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className={glass.selectContent}>
                {apiaries.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-[11px] font-black">
                    {a.name || 'Apiary'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={glass.microLabel}>Hive (optional)</Label>
            <Select
              value={selectedHiveId}
              onValueChange={setSelectedHiveId}
              disabled={!selectedApiaryId}
            >
              <SelectTrigger id="add-device-hive" aria-label="Hive (optional)" className={cn(glass.select, "text-[11px] font-black")}>
                <SelectValue placeholder={selectedApiaryId ? 'Select hive' : 'Select location first'} />
              </SelectTrigger>
              <SelectContent className={glass.selectContent}>
                <SelectItem value="" className="text-[11px] font-black">No hive</SelectItem>
                {filteredHives.map((h) => (
                  <SelectItem key={h.id} value={h.id} className="text-[11px] font-black">
                    {h.hive_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="add-device-name" className={glass.microLabel}>Device name (optional)</Label>
            <Input
              id="add-device-name"
              name="device_name"
              autoComplete="off"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Orchard gateway"
              className={cn(glass.input, "text-[11px] font-bold")}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4D03F]/10">
          <button
            type="button"
            onClick={handleClose}
            className={cn(glass.btnSecondary, "h-10 px-6 text-[10px] font-black")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !deviceCode.trim() || !selectedApiaryId}
            className={cn(glass.btnPrimary, "h-10 px-6 text-[10px] font-black")}
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Add device
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default AddDeviceModal;

