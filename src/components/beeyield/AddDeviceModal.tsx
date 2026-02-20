import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive } from '@/services/beeyieldService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from "@/components/ui/label";

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
            <DialogContent className="sm:max-w-[700px] bg-white border-4 border-black rounded-none p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-none">
                <DialogHeader className="p-0 space-y-4 border-b-4 border-black pb-8">
                    <DialogTitle className="text-5xl font-black text-black uppercase tracking-tighter">
                        Add Device
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">
                        Connect a new IOT device to your registry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-10 py-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Serial Number</Label>
                            <Input
                                placeholder="E.G. HUB_442"
                                value={deviceCode}
                                onChange={(e) => setDeviceCode(e.target.value)}
                                className="h-14 border-2 border-black rounded-none bg-white font-bold text-xs uppercase focus:bg-neutral-50 transition-none focus:ring-0"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Device Type</Label>
                            <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
                                <SelectTrigger className="h-14 rounded-none bg-white border-2 border-black text-xs font-bold uppercase focus:ring-0 transition-none">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-black shadow-none bg-white">
                                    <SelectItem value="inland" className="text-[10px] font-bold uppercase p-3 border-b border-black/10">Hive Hub</SelectItem>
                                    <SelectItem value="infield" className="text-[10px] font-bold uppercase p-3 border-b border-black/10">Field Station</SelectItem>
                                    <SelectItem value="disease" className="text-[10px] font-bold uppercase p-3 border-b border-black/10">Disease Monitor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Location</Label>
                            <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger className="h-14 rounded-none bg-white border-2 border-black text-xs font-bold uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="SELECT LOCATION" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-black shadow-none bg-white">
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id} className="text-[10px] font-bold uppercase p-3 border-b border-black/10">
                                            {apiary.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Hive</Label>
                            <Select
                                value={selectedHiveId}
                                onValueChange={setSelectedHiveId}
                                disabled={!selectedApiaryId}
                            >
                                <SelectTrigger className="h-14 rounded-none bg-white border-2 border-black text-xs font-bold uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="SELECT HIVE" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-black shadow-none bg-white">
                                    {filteredHives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="text-[10px] font-bold uppercase p-3 border-b border-black/10">
                                            {hive.hive_code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Device Name</Label>
                        <Input
                            id="device-name"
                            name="device_name"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="E.G. NORTH_HUB_01"
                            className="h-14 rounded-none bg-white border-2 border-black text-xs font-bold uppercase px-4 focus:ring-0 outline-none transition-none"
                        />
                    </div>

                    <div className="flex justify-end gap-6 pt-10 border-t-4 border-black">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-14 px-10 border-2 border-black bg-white hover:bg-neutral-100 transition-none font-bold text-[10px] uppercase tracking-widest"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !deviceCode}
                            className="h-14 px-12 border-2 border-black bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#FF4F00] transition-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            {isSubmitting ? "WAIT..." : "Add Device"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
