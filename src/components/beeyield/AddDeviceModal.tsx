import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive } from '@/services/beeyieldService';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (device: any) => void;
    apiaries: Apiary[];
    hives: Hive[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onAdd, apiaries, hives }) => {
    const { t } = useLanguage();
    const [selectedApiaryId, setSelectedApiaryId] = useState<string>("");
    const [selectedHiveId, setSelectedHiveId] = useState<string>("");
    const [deviceCode, setDeviceCode] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [deviceType, setDeviceType] = useState<'infield' | 'inland' | 'disease'>('inland');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredHives = hives?.filter(h => h.apiary_id === selectedApiaryId) || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviceCode) {
            toast.error("Please enter the BeeHUB ID");
            return;
        }

        setIsSubmitting(true);
        try {
            // In a real app, this would be an API call
            // beeyieldService.createDevice({ ... })

            const newDevice = {
                id: Math.random().toString(36).substr(2, 9),
                device_code: deviceCode,
                device_name: deviceName || `Device ${deviceCode}`,
                device_type: deviceType,
                status: 'active',
                battery_level: 100,
                firmware_version: '1.0.0',
                last_ping: new Date().toISOString(),
                location_name: apiaries.find(a => a.id === selectedApiaryId)?.name || '',
                apiary_id: selectedApiaryId,
                linked_apiary_id: selectedApiaryId,
                hive_id: selectedHiveId
            };

            await onAdd(newDevice);

            // Reset form
            setDeviceCode("");
            setDeviceName("");
            setSelectedApiaryId("");
            setSelectedHiveId("");
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-[#FDFBF9] dark:bg-[#1A1816] border-none rounded-[3rem] p-12 shadow-2xl">
                <DialogHeader className="p-0 space-y-4">
                    <DialogTitle className="text-4xl font-normal text-slate-800 dark:text-slate-100 italic">
                        Assign device to hive
                    </DialogTitle>
                    <DialogDescription className="text-xl text-[#6B8BA4] dark:text-[#8EABC0] font-normal leading-relaxed">
                        Select an apiary, choose a hive, and enter the BeeHUB short id.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="py-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Apiary</label>
                            <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger className="h-16 rounded-2xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-xl font-medium">
                                    <SelectValue placeholder="Select Apiary" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id} className="text-lg py-3">
                                            {apiary.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Hive</label>
                            <Select
                                value={selectedHiveId}
                                onValueChange={setSelectedHiveId}
                                disabled={!selectedApiaryId}
                            >
                                <SelectTrigger className="h-16 rounded-2xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-xl font-medium">
                                    <SelectValue placeholder="Select Hive" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    {filteredHives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="text-lg py-3">
                                            {hive.hive_code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">BeeHUB ID (Short ID)</label>
                            <Input
                                value={deviceCode}
                                onChange={(e) => setDeviceCode(e.target.value)}
                                placeholder="e.g. HUB-42X"
                                className="h-16 rounded-2xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-xl font-medium px-6"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Device Type</label>
                            <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
                                <SelectTrigger className="h-16 rounded-2xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-xl font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="inland" className="text-lg py-3">Inland (Hive Hub)</SelectItem>
                                    <SelectItem value="infield" className="text-lg py-3">In-field (Station)</SelectItem>
                                    <SelectItem value="disease" className="text-lg py-3">Disease Monitor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Friendly Name (Optional)</label>
                        <Input
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="e.g. Front Gate Monitor"
                            className="h-16 rounded-2xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-xl font-medium px-6"
                        />
                    </div>

                    <div className="flex justify-end gap-6 pt-10">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full h-16 px-12 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xl font-bold border-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !deviceCode}
                            className="rounded-full h-16 px-12 bg-[#F4D03F] hover:bg-[#E2BC1F] text-black text-xl font-bold border-none shadow-xl shadow-yellow-500/10"
                        >
                            {isSubmitting ? "Linking..." : "Assign device"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
