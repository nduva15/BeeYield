import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Apiary, Hive, IoTDevice, IoTDeviceCreateInput } from '@/services/beeyieldService';
import { Cpu, Network, MapPin, ShieldCheck, Radio, Binary, Activity, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import {
    BeeYieldBadge,
    BeeYieldCard,
    BeeYieldFormField,
    BeeYieldTextInput,
} from '@/components/beeyield/BeeYieldUI';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (device: IoTDeviceCreateInput) => Promise<IoTDevice>;
    apiaries: Apiary[];
    hives: Hive[];
    device?: IoTDevice | null;
}

const DEVICE_TYPE_OPTIONS: Array<{
    value: 'inland' | 'infield' | 'disease';
    label: string;
    description: string;
}> = [
    { value: 'inland', label: 'Gateway', description: 'Hub device routing field telemetry.' },
    { value: 'infield', label: 'Sensor', description: 'Direct device attached to a hive or site.' },
    { value: 'disease', label: 'Health Monitor', description: 'Monitoring node used for health diagnostics.' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
] as const;

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onSubmit, apiaries, hives, device }) => {
    const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
    const [selectedHiveId, setSelectedHiveId] = React.useState('');
    const [deviceCode, setDeviceCode] = React.useState('');
    const [deviceName, setDeviceName] = React.useState('');
    const [deviceType, setDeviceType] = React.useState<'infield' | 'inland' | 'disease'>('inland');
    const [deviceStatus, setDeviceStatus] = React.useState<'active' | 'inactive'>('active');
    const [firmwareVersion, setFirmwareVersion] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const resetForm = React.useCallback(() => {
        setSelectedApiaryId('');
        setSelectedHiveId('');
        setDeviceCode('');
        setDeviceName('');
        setDeviceType('inland');
        setDeviceStatus('active');
        setFirmwareVersion('');
    }, []);

    const selectedApiary = React.useMemo(
        () => apiaries.find((apiary) => apiary.id === selectedApiaryId),
        [apiaries, selectedApiaryId]
    );

    const filteredHives = React.useMemo(
        () => hives.filter((hive) => hive.apiary_id === selectedApiaryId),
        [hives, selectedApiaryId]
    );

    const selectedHive = React.useMemo(
        () => filteredHives.find((hive) => hive.id === selectedHiveId),
        [filteredHives, selectedHiveId]
    );

    const selectedDeviceType = React.useMemo(
        () => DEVICE_TYPE_OPTIONS.find((option) => option.value === deviceType),
        [deviceType]
    );

    React.useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }

        if (device) {
            setSelectedApiaryId(device.apiary_id || device.linked_apiary_id || '');
            setSelectedHiveId(device.hive_id || '');
            setDeviceCode(device.device_code || '');
            setDeviceName(device.device_name || '');
            setDeviceType(device.device_type || 'inland');
            setDeviceStatus(device.status || 'active');
            setFirmwareVersion(device.firmware_version || '');
            return;
        }

        resetForm();
    }, [device, open, resetForm]);

    React.useEffect(() => {
        if (!selectedApiaryId) {
            setSelectedHiveId('');
            return;
        }

        if (selectedHiveId && !filteredHives.some((hive) => hive.id === selectedHiveId)) {
            setSelectedHiveId('');
        }
    }, [filteredHives, selectedApiaryId, selectedHiveId]);

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
            const normalizedCode = deviceCode.trim().toUpperCase();
            const payload: IoTDeviceCreateInput = {
                device_code: normalizedCode,
                device_name: (deviceName.trim() || `${selectedDeviceType?.label || 'Device'} ${normalizedCode}`).trim(),
                device_type: deviceType,
                status: deviceStatus,
                firmware_version: firmwareVersion.trim() || undefined,
                location_name: selectedApiary?.location_name || selectedApiary?.name || '',
                latitude: selectedApiary?.latitude ?? undefined,
                longitude: selectedApiary?.longitude ?? undefined,
                apiary_id: selectedApiaryId,
                linked_apiary_id: selectedApiaryId,
                hive_id: selectedHiveId || undefined,
            };

            await onSubmit(payload);

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
            <DialogContent className="max-w-5xl border-[#F4D03F]/20 bg-[#FFF9F0]/95 p-0 shadow-[0_50px_120px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
                <div className="relative overflow-hidden rounded-[2rem]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,208,63,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(27,145,87,0.12),transparent_32%)] pointer-events-none" />

                    <div className="relative border-b border-[#F4D03F]/15 px-8 py-7">
                        <div className="flex items-start justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <BeeYieldBadge className="bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20">
                                        <Cpu className="mr-1 h-3.5 w-3.5 text-[#F4D03F]" />
                                        {device ? 'Edit Device' : 'Link Device'}
                                    </BeeYieldBadge>
                                    <BeeYieldBadge variant="success">
                                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                                        Dashboard Ready
                                    </BeeYieldBadge>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A]">
                                        {device ? 'Update your' : 'Register a'} <span className="text-[#F4D03F]">device</span>
                                    </h2>
                                    <p className="max-w-2xl text-sm text-gray-600">
                                        Match the home dashboard flow: choose the site, optionally attach a hive, and save the device with its live backend metadata.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F4D03F]/15 bg-white/80 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                aria-label="Close"
                                title="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative grid gap-6 px-8 py-8 lg:grid-cols-[1.4fr_0.9fr]">
                        <div className="space-y-6">
                            <BeeYieldCard className="bg-white/70 border-[#F4D03F]/15">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/15 bg-[#F4D03F]/10">
                                        <Network className="h-5 w-5 text-[#F4D03F]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-[#1A1A1A]">Device Identity</h3>
                                        <p className="text-xs text-gray-500">Core hardware and connection metadata.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <BeeYieldFormField id="add-device-code" label="Device ID" hint="Use the printed hardware code.">
                                        <BeeYieldTextInput
                                            id="add-device-code"
                                            icon={Network}
                                            value={deviceCode}
                                            onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                                            placeholder="HUB-KIB-001"
                                            inputClassName="h-11 bg-white/90"
                                        />
                                    </BeeYieldFormField>

                                    <BeeYieldFormField id="add-device-name" label="Display Name" hint="Optional label shown in the dashboard.">
                                        <BeeYieldTextInput
                                            id="add-device-name"
                                            icon={Binary}
                                            value={deviceName}
                                            onChange={(e) => setDeviceName(e.target.value)}
                                            placeholder="North Orchard Gateway"
                                            inputClassName="h-11 bg-white/90"
                                        />
                                    </BeeYieldFormField>

                                    <BeeYieldFormField id="add-device-type" label="Device Type" hint="Controls how the dashboard groups this device.">
                                        <Select value={deviceType} onValueChange={(value: 'infield' | 'inland' | 'disease') => setDeviceType(value)}>
                                            <SelectTrigger id="add-device-type" className={cn(glass.select, "h-11 bg-white/90")}>
                                                <SelectValue placeholder="Select a type" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {DEVICE_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </BeeYieldFormField>

                                    <BeeYieldFormField id="add-device-status" label="Status" hint="Initial device state stored in the backend.">
                                        <Select value={deviceStatus} onValueChange={(value: 'active' | 'inactive') => setDeviceStatus(value)}>
                                            <SelectTrigger id="add-device-status" className={cn(glass.select, "h-11 bg-white/90")}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {STATUS_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </BeeYieldFormField>

                                    <div className="md:col-span-2">
                                        <BeeYieldFormField id="add-device-firmware" label="Firmware Version" hint="Optional backend-tracked firmware string.">
                                            <BeeYieldTextInput
                                                id="add-device-firmware"
                                                icon={Activity}
                                                value={firmwareVersion}
                                                onChange={(e) => setFirmwareVersion(e.target.value)}
                                                placeholder="v1.4.2"
                                                inputClassName="h-11 bg-white/90"
                                            />
                                        </BeeYieldFormField>
                                    </div>
                                </div>
                            </BeeYieldCard>

                            <BeeYieldCard className="bg-white/70 border-[#F4D03F]/15">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/15 bg-[#F4D03F]/10">
                                        <MapPin className="h-5 w-5 text-[#F4D03F]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-[#1A1A1A]">Placement</h3>
                                        <p className="text-xs text-gray-500">Site and hive assignment used across the dashboard.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <BeeYieldFormField id="add-device-apiary" label="Apiary Location" hint="Required for device ownership and mapping.">
                                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                            <SelectTrigger id="add-device-apiary" className={cn(glass.select, "h-11 bg-white/90")}>
                                                <SelectValue placeholder="Choose a location" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {apiaries.map((apiary) => (
                                                    <SelectItem key={apiary.id} value={apiary.id}>
                                                        {apiary.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </BeeYieldFormField>

                                    <BeeYieldFormField id="add-device-hive" label="Hive Assignment" hint="Optional link if this device belongs to one hive.">
                                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId} disabled={!selectedApiaryId}>
                                            <SelectTrigger id="add-device-hive" className={cn(glass.select, "h-11 bg-white/90 disabled:opacity-60")}>
                                                <SelectValue placeholder={selectedApiaryId ? "Choose a hive" : "Select location first"} />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {filteredHives.map((hive) => (
                                                    <SelectItem key={hive.id} value={hive.id}>
                                                        {hive.hive_code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </BeeYieldFormField>
                                </div>
                            </BeeYieldCard>
                        </div>

                        <div className="space-y-6">
                            <BeeYieldCard className="bg-[#1A1A1A] text-white border-[#1A1A1A]">
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Live Summary</p>
                                            <h3 className="mt-2 text-xl font-black tracking-tight">
                                                {deviceName.trim() || deviceCode.trim() || 'New Device'}
                                            </h3>
                                        </div>
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                                            <Cpu className="h-5 w-5 text-[#F4D03F]" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/55">Type</span>
                                            <span className="font-bold">{selectedDeviceType?.label || 'Gateway'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/55">Status</span>
                                            <span className="font-bold capitalize">{deviceStatus}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/55">Apiary</span>
                                            <span className="max-w-[180px] truncate text-right font-bold">{selectedApiary?.name || 'Not selected'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/55">Hive</span>
                                            <span className="max-w-[180px] truncate text-right font-bold">{selectedHive?.hive_code || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/55">Firmware</span>
                                            <span className="font-bold">{firmwareVersion.trim() || 'Pending'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                            <Radio className="mb-3 h-4 w-4 text-[#F4D03F]" />
                                            <p className="text-[10px] uppercase tracking-widest text-white/40">Code</p>
                                            <p className="mt-1 truncate text-sm font-black">{deviceCode.trim() || 'Awaiting'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                            <MapPin className="mb-3 h-4 w-4 text-[#F4D03F]" />
                                            <p className="text-[10px] uppercase tracking-widest text-white/40">Mapped</p>
                                            <p className="mt-1 text-sm font-black">{selectedApiary ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                            <ShieldCheck className="mb-3 h-4 w-4 text-[#F4D03F]" />
                                            <p className="text-[10px] uppercase tracking-widest text-white/40">Hive</p>
                                            <p className="mt-1 text-sm font-black">{selectedHive ? 'Linked' : 'Open'}</p>
                                        </div>
                                    </div>
                                </div>
                            </BeeYieldCard>

                            <BeeYieldCard className="bg-white/70 border-[#F4D03F]/15">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/20 bg-[#F4D03F]/10">
                                        <Sparkles className="h-5 w-5 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-sm font-black text-[#1A1A1A]">Backend Configuration</h3>
                                        <p className="text-xs leading-relaxed text-gray-600">
                                            This form writes the real device payload used by the `/iot/devices` create and update API, including status, firmware, apiary, hive, and location mapping.
                                        </p>
                                    </div>
                                </div>
                            </BeeYieldCard>
                        </div>

                        <div className="lg:col-span-2 flex flex-col gap-3 border-t border-[#F4D03F]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                {selectedApiary
                                    ? `This device will be linked to ${selectedApiary.name}${selectedHive ? ` and ${selectedHive.hive_code}` : ''}.`
                                    : 'Choose an apiary to activate save.'}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOpenChange(false)}
                                    className={cn(glass.btnSecondary, "h-11 px-6")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !deviceCode.trim() || !selectedApiaryId}
                                    className={cn(glass.btnPrimary, "h-11 px-6 disabled:opacity-60 disabled:cursor-not-allowed")}
                                >
                                    {isSubmitting ? 'Saving…' : device ? 'Update Device' : 'Add Device'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
