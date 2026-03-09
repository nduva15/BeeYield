import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive } from '@/services/beeyieldService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from "@/components/ui/label";
import { Cpu, Database, Network, ShieldCheck, RefreshCw } from 'lucide-react';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (device: any) => void;
    apiaries: Apiary[];
    hives: Hive[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onAdd, apiaries, hives }) => {
    const { t } = useLanguage();
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>("");
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>("");
    const [deviceCode, setDeviceCode] = React.useState("");
    const [deviceName, setDeviceName] = React.useState("");
    const [deviceType, setDeviceType] = React.useState<'infield' | 'inland' | 'disease'>('inland');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const filteredHives = hives?.filter(h => h.apiary_id === selectedApiaryId) || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviceCode) {
            toast.error("Please enter the BeeHUB ID");
            return;
        }

        setIsSubmitting(true);
        try {
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
            toast.success("Device successfully integrated into the registry");
        } catch (error) {
            console.error(error);
            toast.error("Integration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-white/5 rounded-[3rem] p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50 dark:bg-white/[0.02] px-12 py-10 border-b border-slate-100 dark:border-white/5">
                    <DialogHeader className="p-0 space-y-3">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/40 w-fit">
                            <Cpu className="w-3.5 h-3.5" />
                            Hardware Integration Logic
                        </div>
                        <DialogTitle className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            Initialize <span className="text-amber-500">Node</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 dark:text-white/20 font-black uppercase text-[10px] tracking-[0.3em] italic">
                            Pairing industrial IOT hardware with current sector registry.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Hardware Signature ID</Label>
                            <div className="relative">
                                <Network className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                <Input
                                    placeholder="E.G. HUB-KIB-001"
                                    value={deviceCode}
                                    onChange={(e) => setDeviceCode(e.target.value)}
                                    className="h-14 pl-12 border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 font-black text-xs uppercase tracking-widest focus-visible:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Node Classification</Label>
                            <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest focus:ring-amber-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                    <SelectItem value="inland" className="text-[10px] font-black uppercase p-4 tracking-widest">Master Hive Hub</SelectItem>
                                    <SelectItem value="infield" className="text-[10px] font-black uppercase p-4 tracking-widest">Regional Station</SelectItem>
                                    <SelectItem value="disease" className="text-[10px] font-black uppercase p-4 tracking-widest">Spectral Monitor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Sector Assignment</Label>
                            <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest focus:ring-amber-500/20">
                                    <SelectValue placeholder="SELECT SECTOR" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id} className="text-[10px] font-black uppercase p-4 tracking-widest">
                                            {apiary.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Target Registry ID</Label>
                            <Select
                                value={selectedHiveId}
                                onValueChange={setSelectedHiveId}
                                disabled={!selectedApiaryId}
                            >
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest focus:ring-amber-500/20 disabled:opacity-30">
                                    <SelectValue placeholder="SELECT HIVE" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                    {filteredHives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="text-[10px] font-black uppercase p-4 tracking-widest">
                                            {hive.hive_code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Human-Readable Alias</Label>
                        <Input
                            id="device-name"
                            name="device_name"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="E.G. ALPHA_GATEWAY_PRIME"
                            className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-xs uppercase tracking-widest px-6 focus-visible:ring-amber-500/20"
                        />
                    </div>

                    <div className="flex justify-end gap-6 pt-10 border-t border-slate-100 dark:border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-16 px-10 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                        >
                            Abort Process
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !deviceCode}
                            className="h-16 px-14 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 dark:shadow-amber-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-4 border-none"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShieldCheck className="w-5 h-5 text-amber-200" />
                            )}
                            Initialize Node
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
