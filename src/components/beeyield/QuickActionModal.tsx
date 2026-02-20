import React from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, MapPin, Wind, Sun, Info, Database, Calendar } from 'lucide-react';
import { beeyieldService, Apiary } from '@/services/beeyieldService';
import { toast } from 'sonner';

interface QuickActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = React.useState('apiary');
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Apiary Form State
    const [apiaryData, setApiaryData] = React.useState({
        name: '',
        location_name: '',
        forage_type: 'Forest',
        sun_exposure: 'Semi-Shade'
    });

    // Hive Form State
    const [hiveData, setHiveData] = React.useState({
        apiary_id: '',
        hive_code: '',
        type: 'Langstroth',
        queen_hatched: new Date().toISOString().split('T')[0],
        strength: 3
    });

    React.useEffect(() => {
        if (isOpen) {
            fetchApiaries();
        }
    }, [isOpen]);

    const fetchApiaries = async () => {
        const data = await beeyieldService.getApiaries();
        setApiaries(data);
        if (data.length > 0 && !hiveData.apiary_id) {
            setHiveData(prev => ({ ...prev, apiary_id: data[0].id }));
        }
    };

    const handleAddApiary = async () => {
        if (!apiaryData.name || !apiaryData.location_name) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        const { data, error } = await beeyieldService.createApiary(apiaryData);
        setLoading(false);

        if (!error) {
            toast.success(`Apiary "${apiaryData.name}" added!`);
            onSuccess?.();
            onClose();
            // Reset form
            setApiaryData({
                name: '',
                location_name: '',
                forage_type: 'Forest',
                sun_exposure: 'Semi-Shade'
            });
        }
    };

    const handleAddHive = async () => {
        if (!hiveData.apiary_id || !hiveData.hive_code) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        const { data, error } = await beeyieldService.createHive({
            ...hiveData,
            hive_type: hiveData.type,
            // Add new fields if service supports them, otherwise they go in metadata
            installation_date: hiveData.queen_hatched,
        } as any);
        setLoading(false);

        if (!error) {
            toast.success(`Hive "${hiveData.hive_code}" registered!`);
            onSuccess?.();
            onClose();
            // Reset form
            setHiveData({
                apiary_id: apiaries[0]?.id || '',
                hive_code: '',
                type: 'Langstroth',
                queen_hatched: new Date().toISOString().split('T')[0],
                strength: 3
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#FAF9F6] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden antialiased">
                <div className="bg-[#FF9100] px-8 py-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black flex items-center gap-3 tracking-tighter leading-none">
                            <Plus className="w-8 h-8 stroke-[3]" />
                            Add New Item
                        </DialogTitle>
                        <DialogDescription className="text-white/80 font-bold text-xs uppercase tracking-[0.2em] mt-2">
                            Add a new apiary or hive
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    <Tabs defaultValue="apiary" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1.5 rounded-2xl mb-8">
                            <TabsTrigger value="apiary" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xl transition-all h-10">
                                Apiary
                            </TabsTrigger>
                            <TabsTrigger value="hive" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xl transition-all h-10">
                                Hive
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="apiary" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="space-y-2">
                                <Label htmlFor="apiary-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apiary Name</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                    <Input
                                        id="apiary-name"
                                        name="name"
                                        placeholder="e.g. Kibwezi Sector Alpha"
                                        className="pl-11 h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-[#FF9100] focus:border-[#FF9100] font-bold text-slate-800"
                                        value={apiaryData.name}
                                        onChange={e => setApiaryData({ ...apiaryData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apiary-location" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</Label>
                                <Input
                                    id="apiary-location"
                                    name="location_name"
                                    placeholder="Enter physical address or Lat/Long"
                                    className="h-14 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-slate-800"
                                    value={apiaryData.location_name}
                                    onChange={e => setApiaryData({ ...apiaryData, location_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Forage Type</Label>
                                    <Select
                                        name="forage_type"
                                        value={apiaryData.forage_type}
                                        onValueChange={v => setApiaryData({ ...apiaryData, forage_type: v })}
                                    >
                                        <SelectTrigger id="apiary-forage" className="h-14 rounded-2xl border-slate-100 bg-white font-bold text-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="Forest">Wild Forest</SelectItem>
                                            <SelectItem value="Canola">High Canola</SelectItem>
                                            <SelectItem value="Acacia">Acacia Prime</SelectItem>
                                            <SelectItem value="Lavender">Pure Lavender</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sun Exposure</Label>
                                    <Select
                                        name="sun_exposure"
                                        value={apiaryData.sun_exposure}
                                        onValueChange={v => setApiaryData({ ...apiaryData, sun_exposure: v })}
                                    >
                                        <SelectTrigger id="apiary-sun" className="h-14 rounded-2xl border-slate-100 bg-white font-bold text-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="Full Sun">Full Sun</SelectItem>
                                            <SelectItem value="Shade">Full Shade</SelectItem>
                                            <SelectItem value="Semi-Shade">Semi-Shade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="hive" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apiary</Label>
                                <Select
                                    name="apiary_id"
                                    value={hiveData.apiary_id}
                                    onValueChange={v => setHiveData({ ...hiveData, apiary_id: v })}
                                >
                                    <SelectTrigger id="hive-apiary" className="h-14 rounded-2xl border-slate-100 bg-white font-bold text-slate-800">
                                        <SelectValue placeholder="Deploy to..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {apiaries.map(apiary => (
                                            <SelectItem key={apiary.id} value={apiary.id}>{apiary.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hive Code</Label>
                                <div className="relative">
                                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                                    <Input
                                        id="hive-code"
                                        name="hive_code"
                                        placeholder="e.g. BY-ALPHA-01"
                                        className="pl-11 h-14 rounded-2xl border-slate-100 bg-white font-bold text-slate-800"
                                        value={hiveData.hive_code}
                                        onChange={e => setHiveData({ ...hiveData, hive_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hive Type</Label>
                                    <Select
                                        name="type"
                                        value={hiveData.type}
                                        onValueChange={v => setHiveData({ ...hiveData, type: v })}
                                    >
                                        <SelectTrigger id="hive-type" className="h-14 rounded-2xl border-slate-100 bg-white font-bold text-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="Langstroth">Langstroth Pro</SelectItem>
                                            <SelectItem value="Top Bar">Kenyas Top Bar</SelectItem>
                                            <SelectItem value="Warre">Warre Eco</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Installed</Label>
                                    <div className="relative">
                                        <Input
                                            id="queen-hatched"
                                            name="queen_hatched"
                                            type="date"
                                            className="h-14 rounded-2xl border-slate-100 bg-white font-bold text-slate-800"
                                            value={hiveData.queen_hatched}
                                            onChange={e => setHiveData({ ...hiveData, queen_hatched: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Colony Strength</Label>
                                    <span className="text-[10px] font-black text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                        Efficiency {Math.round(hiveData.strength * 20)}%
                                    </span>
                                </div>
                                <Slider
                                    defaultValue={[3]}
                                    max={5}
                                    min={1}
                                    step={1}
                                    className="py-4"
                                    onValueChange={v => setHiveData({ ...hiveData, strength: v[0] })}
                                />
                                <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] px-1">
                                    <span>Minimal</span>
                                    <span>Optimal</span>
                                    <span>Maximum</span>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 h-16 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 uppercase tracking-widest text-xs">Cancel</Button>
                    <Button
                        onClick={activeTab === 'apiary' ? handleAddApiary : handleAddHive}
                        className="flex-[2] h-16 bg-slate-800 text-white hover:bg-slate-900 rounded-2xl px-10 font-black shadow-2xl shadow-slate-400/20 uppercase tracking-widest text-xs"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickActionModal;
