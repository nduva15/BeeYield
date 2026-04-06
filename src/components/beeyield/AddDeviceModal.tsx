import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive, IoTDevice, IoTDeviceCreateInput } from '@/services/beeyieldService';
import { Label } from "@/components/ui/label";
import { Cpu, Database, Network, ShieldCheck, RefreshCw, X, Info, Zap, Binary } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (device: IoTDeviceCreateInput) => Promise<IoTDevice>;
    apiaries: Apiary[];
    hives: Hive[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onAdd, apiaries, hives }) => {
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
        setSelectedHiveId("");
    }, [selectedApiaryId]);

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

        const toastId = toast.loading("Adding device...");
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

            await onAdd(newDevice);

            resetForm();
            onOpenChange(false);
            toast.success("Device added.", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Could not add device. Please try again.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl bg-[#FFF9F0]/80 backdrop-blur-3xl border-[#F4D03F]/10 rounded-[4rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] p-0 overflow-hidden antialiased outline-none thin-scrollbar">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -30 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="bg-gradient-to-br from-[#121212] to-black px-14 py-16 text-[#1A1A1A] relative overflow-hidden border-b border-[#F4D03F]/20">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4D03F]/10 rounded-full -mr-40 -mt-20 blur-[120px] animate-pulse pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#1B9157] rounded-full -ml-30 -mb-20 blur-[80px] pointer-events-none" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-[#F4D03F]/10 rounded-full border border-[#F4D03F]/20 shadow-2xl skew-x-[-12deg]">
                                        <Cpu className="w-5 h-5 text-[#F4D03F]" />
                                        <span className="text-[10px] font-black skew-x-[12deg] italic">Add device</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-[#1B9157] px-4 py-2 rounded-full border border-[#1B9157] shadow-inner">
                                        <div className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse" />
                                        <span className="text-[10px] font-black text-[#1B9157] italic">Ready</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-7xl font-black text-foreground tracking-tighter italic leading-[0.85]">
                                        Add <span className="text-[#F4D03F]">device</span>
                                    </h2>
                                    <p className="text-gray-500 font-black text-[11px] mt-3 italic border-l-2 border-[#F4D03F]/20 pl-8 max-w-sm">
                                        Link a sensor or gateway to a location and optionally pin it to a hive.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenChange(false)}
                                className="w-16 h-16 rounded-[2rem] bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-500 transition-all duration-700 shadow-2xl group"
                                aria-label="Close"
                                title="Close"
                            >
                                <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-14 space-y-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6 group">
                                <Label htmlFor="add-device-code" className={cn(glass.microLabel, 'ml-8 border-l-2 border-[#F4D03F]/40 pl-6 opacity-40 font-black text-[10px]')}>Hardware Signature ID</Label>
                                <div className="relative">
                                    <Network className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-[#F4D03F] transition-colors group-focus-within:text-foreground" />
                                    <Input
                                        id="add-device-code"
                                        name="device_code"
                                        autoComplete="off"
                                        placeholder="e.g. HUB-KIB-001"
                                        value={deviceCode}
                                        onChange={(e) => setDeviceCode(e.target.value)}
                                        className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-2xl bg-[#F9F7F2] border-none shadow-inner normal-case placeholder:opacity-10")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-blue-500/40 pl-6 opacity-40 font-black text-[10px]')}>Device type</Label>
                                <Select value={deviceType} onValueChange={(value: 'infield' | 'inland' | 'disease') => setDeviceType(value)}>
                                    <SelectTrigger id="add-device-type" aria-label="Device type" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-[#F9F7F2] border-none shadow-inner')}>
                                        <div className="flex items-center gap-6">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        <SelectItem value="inland" className="p-5 font-black text-[11px] italic">Gateway</SelectItem>
                                        <SelectItem value="infield" className="p-5 font-black text-[11px] italic">Sensor</SelectItem>
                                        <SelectItem value="disease" className="p-5 font-black text-[11px] italic">Health monitor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-[#F4D03F]/40 pl-6 opacity-40 font-black text-[10px]')}>Location</Label>
                                <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                    <SelectTrigger id="add-device-apiary" aria-label="Location" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-[#F9F7F2] border-none shadow-inner')}>
                                        <div className="flex items-center gap-6">
                                            <Database className="w-6 h-6 text-[#F4D03F]" />
                                            <SelectValue placeholder="Select a location..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {apiaries.map((apiary) => (
                                            <SelectItem key={apiary.id} value={apiary.id} className="p-5 font-black text-[11px] italic">
                                                {apiary.name.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-[#1B9157] pl-6 opacity-40 font-black text-[10px]')}>Hive (optional)</Label>
                                <Select
                                    value={selectedHiveId}
                                    onValueChange={setSelectedHiveId}
                                    disabled={!selectedApiaryId}
                                >
                                    <SelectTrigger id="add-device-hive" aria-label="Hive" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-[#F9F7F2] border-none shadow-inner disabled:opacity-20')}>
                                        <div className="flex items-center gap-6">
                                            <ShieldCheck className="w-6 h-6 text-[#1B9157]" />
                                            <SelectValue placeholder="Select a hive..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {filteredHives.map((hive) => (
                                            <SelectItem key={hive.id} value={hive.id} className="p-5 font-black text-[11px] italic">
                                                {hive.hive_code.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-6 group">
                            <Label htmlFor="device-name" className={cn(glass.microLabel, 'ml-8 border-l-2 border-[#F4D03F]/40 pl-6 opacity-40 font-black text-[10px]')}>Device name (optional)</Label>
                            <div className="relative">
                                <Binary className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-[#F4D03F] opacity-20 group-hover:opacity-100 transition-opacity" />
                                <Input
                                    id="device-name"
                                    name="device_name"
                                    autoComplete="off"
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                    placeholder="e.g. Orchard gateway"
                                    className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-[#F9F7F2] border-none shadow-inner normal-case placeholder:opacity-10")}
                                />
                            </div>
                        </div>

                        <div className="p-14 bg-gray-400 border-t border-[#F4D03F]/10 flex gap-10 rounded-[3rem] shadow-inner mt-10">
                            <button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                className={cn(glass.btnSecondary, "flex-1 h-22 rounded-[2.5rem] font-black italic text-lg transition-all bg-gray-400")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !deviceCode.trim() || !selectedApiaryId}
                                className={cn(glass.btnPrimary, "flex-[2] h-22 bg-[#FBBE24] text-[#1A1A1A] shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] rounded-[2.5rem] px-14 font-black italic text-2xl transition-all flex items-center justify-center gap-6 group/commit pl-20")}
                            >
                                {isSubmitting ? (
                                    <RefreshCw className="w-10 h-10 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-10 h-10 group-hover/commit:scale-125 transition-all duration-1000 text-[#1A1A1A] fill-current" />
                                )}
                                Add device
                            </button>
                        </div>
                    </form>

                    <div className="px-14 pb-14">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(glass.card, "p-10 bg-[#F4D03F][0.03] border-[#F4D03F]/20 flex items-center gap-10 relative overflow-hidden group rounded-[3rem]")}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F4D03F]/10 blur-3xl pointer-events-none" />
                            <div className="w-16 h-16 rounded-2xl bg-gray-400 flex items-center justify-center shrink-0 border border-[#F4D03F]/20 shadow-4xl group-hover:rotate-[360deg] transition-transform duration-1000 relative z-10">
                                <Info className="w-8 h-8 text-[#F4D03F]" />
                            </div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-xl italic font-black text-foreground tracking-tighter">Tip</p>
                                <p className="text-[13px] italic font-medium opacity-40 leading-relaxed text-foreground max-w-xl">
                                    Use the ID printed on the device. The selected apiary now supplies the linked location details automatically.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
