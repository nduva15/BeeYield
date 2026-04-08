import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive, IoTDevice, IoTDeviceCreateInput } from '@/services/beeyieldService';
import { Label } from "@/components/ui/label";
import { Cpu, Database, Network, ShieldCheck, RefreshCw, Info, Zap, Binary, MapPin } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (device: IoTDeviceCreateInput) => Promise<IoTDevice>;
    apiaries: Apiary[];
    hives: Hive[];
    device?: IoTDevice | null;
    defaultApiaryId?: string;
    defaultHiveId?: string;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
    open,
    onOpenChange,
    onSubmit,
    apiaries,
    hives,
    device,
    defaultApiaryId,
    defaultHiveId,
}) => {
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>("");
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>("");
    const [deviceCode, setDeviceCode] = React.useState("");
    const [deviceName, setDeviceName] = React.useState("");
    const [deviceType, setDeviceType] = React.useState<'infield' | 'inland' | 'disease'>('inland');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const resetForm = React.useCallback(() => {
        setSelectedApiaryId("");
        setSelectedHiveId("");
        setDeviceCode("");
        setDeviceName("");
        setDeviceType('inland');
    }, []);

    const selectedApiary = React.useMemo(
        () => apiaries.find((apiary) => apiary.id === selectedApiaryId),
        [apiaries, selectedApiaryId]
    );
    const filteredHives = React.useMemo(
        () => hives?.filter((hive) => hive.apiary_id === selectedApiaryId) || [],
        [hives, selectedApiaryId]
    );

    React.useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open, resetForm]);

    React.useEffect(() => {
        if (!open) return;
        if (device) {
            setSelectedApiaryId(device.apiary_id || device.linked_apiary_id || "");
            setSelectedHiveId(device.hive_id || "");
            setDeviceCode(device.device_code || "");
            setDeviceName(device.device_name || "");
            setDeviceType(device.device_type || 'inland');
            return;
        }
        resetForm();
        setSelectedApiaryId(defaultApiaryId || '');
        setSelectedHiveId(defaultHiveId || '');
    }, [defaultApiaryId, defaultHiveId, device, open, resetForm]);

    React.useEffect(() => {
        if (defaultHiveId && hives.some((hive) => hive.id === defaultHiveId && hive.apiary_id === selectedApiaryId)) {
            setSelectedHiveId(defaultHiveId);
            return;
        }

        setSelectedHiveId("");
    }, [defaultHiveId, hives, selectedApiaryId]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !isSubmitting) {
            resetForm();
        }
        onOpenChange(nextOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviceCode.trim()) {
            toast.error("Please enter the device ID");
            return;
        }

        if (!selectedApiaryId) {
            toast.error("Please select a location");
            return;
        }

        const toastId = toast.loading(device ? "Updating device..." : "Adding device...");
        setIsSubmitting(true);

        try {
            const normalizedCode = deviceCode.trim();
            const newDevice: IoTDeviceCreateInput = {
                device_code: normalizedCode,
                device_name: (deviceName.trim() || `Device ${normalizedCode}`).trim(),
                device_type: deviceType,
                location_name: selectedApiary?.location_name || selectedApiary?.name || '',
                latitude: selectedApiary?.latitude ?? undefined,
                longitude: selectedApiary?.longitude ?? undefined,
                apiary_id: selectedApiaryId,
                linked_apiary_id: selectedApiaryId,
                hive_id: selectedHiveId || undefined,
            };

            await onSubmit(newDevice);

            resetForm();
            onOpenChange(false);
            toast.success(device ? "Device updated." : "Device added.", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(`Could not ${device ? 'update' : 'add'} device. Please try again.`, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl border border-[#F4D03F]/20 bg-[#FFF9F0] p-0 overflow-hidden rounded-[2rem] shadow-2xl outline-none">
                <div className="border-b border-[#F4D03F]/10 bg-gradient-to-br from-[#F4D03F]/5 to-transparent px-8 py-7">
                    <DialogHeader className="space-y-3 pr-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4D03F]/10 rounded-xl border border-[#F4D03F]/20 w-fit">
                            <Cpu className="w-4 h-4 text-[#F4D03F]" />
                            <span className="text-[11px] font-black tracking-wider text-[#F4D03F] uppercase">
                                {device ? 'Device update' : 'Device setup'}
                            </span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-[#1A1A1A]">
                            {device ? 'Refine device record' : 'Register new device'}
                        </DialogTitle>
                        <DialogDescription className="max-w-2xl text-xs font-bold text-muted-foreground leading-relaxed">
                            Match the device to a location first, then optionally attach it to a hive so the dashboard, reports, and activity views stay in sync.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/40 p-8 backdrop-blur-xl">
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        <div className="xl:col-span-3 space-y-6">
                            <div className={cn(glass.section, "bg-white/70 border-[#F4D03F]/15 p-6 space-y-5")}>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-[#1A1A1A]">Device identity</h3>
                                    <p className="text-[11px] text-gray-500">Use the printed hardware ID and choose the matching device role.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="add-device-code" className="text-[10px] font-black text-gray-400 ml-2">Hardware ID*</Label>
                                        <div className="relative">
                                            <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/50" />
                                            <Input
                                                id="add-device-code"
                                                name="device_code"
                                                autoComplete="off"
                                                placeholder="HUB-KIB-001"
                                                value={deviceCode}
                                                onChange={(e) => setDeviceCode(e.target.value)}
                                                className={cn(glass.input, "h-11 pl-10 font-black tracking-wide")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 ml-2">Device type</Label>
                                        <Select value={deviceType} onValueChange={(value: 'infield' | 'inland' | 'disease') => setDeviceType(value)}>
                                            <SelectTrigger id="add-device-type" aria-label="Device type" className={cn(glass.select, "h-11 bg-white/70")}>
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-[#F4D03F]" />
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                <SelectItem value="inland" className="text-sm font-semibold">Gateway</SelectItem>
                                                <SelectItem value="infield" className="text-sm font-semibold">Sensor</SelectItem>
                                                <SelectItem value="disease" className="text-sm font-semibold">Health monitor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="device-name" className="text-[10px] font-black text-gray-400 ml-2">Display name</Label>
                                    <div className="relative">
                                        <Binary className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/50" />
                                        <Input
                                            id="device-name"
                                            name="device_name"
                                            autoComplete="off"
                                            value={deviceName}
                                            onChange={(e) => setDeviceName(e.target.value)}
                                            placeholder="Orchard gateway"
                                            className={cn(glass.input, "h-11 pl-10")}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 px-2">
                                        Leave blank to auto-name it from the hardware ID.
                                    </p>
                                </div>
                            </div>

                            <div className={cn(glass.section, "bg-white/70 border-[#F4D03F]/15 p-6 space-y-5")}>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-[#1A1A1A]">Placement</h3>
                                    <p className="text-[11px] text-gray-500">Attach the device to an apiary, then optionally narrow it down to a hive.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 ml-2">Location*</Label>
                                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                            <SelectTrigger id="add-device-apiary" aria-label="Location" className={cn(glass.select, "h-11 bg-white/70")}>
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-4 h-4 text-[#F4D03F]" />
                                                    <SelectValue placeholder="Select a location" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {apiaries.map((apiary) => (
                                                    <SelectItem key={apiary.id} value={apiary.id} className="text-sm font-semibold">
                                                        {apiary.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 ml-2">Hive</Label>
                                        <Select
                                            value={selectedHiveId}
                                            onValueChange={setSelectedHiveId}
                                            disabled={!selectedApiaryId}
                                        >
                                            <SelectTrigger id="add-device-hive" aria-label="Hive" className={cn(glass.select, "h-11 bg-white/70 disabled:opacity-50")}>
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                                                    <SelectValue placeholder={selectedApiaryId ? "Select a hive" : "Pick a location first"} />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {filteredHives.map((hive) => (
                                                    <SelectItem key={hive.id} value={hive.id} className="text-sm font-semibold">
                                                        {hive.hive_code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-2 space-y-6">
                            <div className={cn(glass.section, "bg-white/70 border-[#F4D03F]/15 p-6 space-y-4")}>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-[#1A1A1A]">Assignment summary</h3>
                                    <p className="text-[11px] text-gray-500">Preview how this device will appear once saved.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Device</p>
                                        <p className="mt-1 text-sm font-bold text-[#1A1A1A] break-all">
                                            {deviceName.trim() || deviceCode.trim() || 'Unnamed device'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Type</p>
                                        <p className="mt-1 text-sm font-bold text-[#1A1A1A] capitalize">
                                            {deviceType === 'inland' ? 'Gateway' : deviceType === 'infield' ? 'Sensor' : 'Health monitor'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Location</p>
                                        <div className="mt-1 flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-[#F4D03F] mt-0.5 shrink-0" />
                                            <p className="text-sm font-bold text-[#1A1A1A]">
                                                {selectedApiary?.location_name || selectedApiary?.name || 'No location selected'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(glass.card, "bg-[#FFF9F0] border-[#F4D03F]/15 p-5")}>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center shrink-0">
                                        <Info className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-[#1A1A1A]">What gets linked</p>
                                        <p className="text-[11px] leading-relaxed text-gray-500">
                                            Saving this record stores the selected apiary as the device location and keeps the hive relationship optional.
                                        </p>
                                        <p className="text-[11px] leading-relaxed text-gray-500">
                                            {selectedApiaryId
                                                ? `${filteredHives.length} hive${filteredHives.length === 1 ? '' : 's'} available in this location.`
                                                : 'Choose a location to unlock hive assignment.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#F4D03F]/10 pt-6">
                        <button
                            type="button"
                            onClick={() => handleOpenChange(false)}
                            className={cn(glass.btnSecondary, "h-11 px-6 text-[11px] font-black")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !deviceCode.trim() || !selectedApiaryId}
                            className={cn(glass.btnPrimary, "h-11 px-8 text-[11px] font-black shadow-xl shadow-[#F4D03F]/10")}
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="w-4 h-4" />
                            )}
                            {device ? 'Save device changes' : 'Add device'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
