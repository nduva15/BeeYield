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
import { Plus, MapPin, Sun, Calendar, Hexagon, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { beeyieldService, Apiary } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';

interface QuickActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = React.useState('apiary');
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [loading, setLoading] = React.useState(false);

    const [apiaryData, setApiaryData] = React.useState({
        name: '',
        location_name: '',
        forage_type: 'Forest',
        sun_exposure: 'Semi-Shade'
    });

    const [hiveData, setHiveData] = React.useState({
        apiary_id: '',
        hive_code: '',
        type: 'Langstroth',
        queen_hatched: new Date().toISOString().split('T')[0],
        strength: 3
    });

    React.useEffect(() => {
        if (isOpen) fetchApiaries();
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
        const toastId = toast.loading("Creating apiary...");
        setLoading(true);
        const { data, error } = await beeyieldService.createApiary(apiaryData);
        setLoading(false);
        if (!error) {
            toast.success(`Apiary "${apiaryData.name}" created successfully`, { id: toastId });
            onSuccess?.();
            onClose();
            setApiaryData({ name: '', location_name: '', forage_type: 'Forest', sun_exposure: 'Semi-Shade' });
        } else {
            toast.error("Failed to create apiary", { id: toastId });
        }
    };

    const handleAddHive = async () => {
        if (!hiveData.apiary_id || !hiveData.hive_code) {
            toast.error("Please fill in all required fields");
            return;
        }
        const toastId = toast.loading("Creating hive...");
        setLoading(true);
        const { data, error } = await beeyieldService.createHive({
            ...hiveData,
            hive_type: hiveData.type,
            installation_date: hiveData.queen_hatched,
        } as any);
        setLoading(false);
        if (!error) {
            toast.success(`Hive "${hiveData.hive_code}" created successfully`, { id: toastId });
            onSuccess?.();
            onClose();
            setHiveData({ apiary_id: apiaries[0]?.id || '', hive_code: '', type: 'Langstroth', queen_hatched: new Date().toISOString().split('T')[0], strength: 3 });
        } else {
            toast.error("Failed to create hive", { id: toastId });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl p-0 overflow-hidden outline-none">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#FF6B00]/5 to-transparent px-6 py-5 border-b border-gray-200">
                    <DialogHeader>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FF6B00]/10 rounded-lg border border-[#FF6B00]/20 w-fit mb-2">
                            <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
                            <span className="text-[11px] font-semibold text-[#FF6B00]">New Record</span>
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            Add New Asset
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Create a new apiary location or register a hive unit.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <Tabs defaultValue="apiary" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-10 rounded-lg mb-6">
                            <TabsTrigger value="apiary" className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm h-8">
                                Apiary
                            </TabsTrigger>
                            <TabsTrigger value="hive" className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm h-8">
                                Hive
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="apiary" className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-1.5">
                                    <Label htmlFor="apiary-name" className="text-sm font-medium">Apiary Name *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="apiary-name"
                                            placeholder="e.g. Kibwezi Main Apiary"
                                            className="h-10 pl-10 rounded-lg"
                                            value={apiaryData.name}
                                            onChange={e => setApiaryData({ ...apiaryData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="apiary-location" className="text-sm font-medium">Location *</Label>
                                    <Input
                                        id="apiary-location"
                                        placeholder="e.g. Kibwezi, Makueni County"
                                        className="h-10 rounded-lg"
                                        value={apiaryData.location_name}
                                        onChange={e => setApiaryData({ ...apiaryData, location_name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Forage Type</Label>
                                        <Select value={apiaryData.forage_type} onValueChange={v => setApiaryData({ ...apiaryData, forage_type: v })}>
                                            <SelectTrigger className="h-10 rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg">
                                                <SelectItem value="Forest">Forest</SelectItem>
                                                <SelectItem value="Canola">Canola</SelectItem>
                                                <SelectItem value="Acacia">Acacia</SelectItem>
                                                <SelectItem value="Lavender">Lavender</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Sun Exposure</Label>
                                        <Select value={apiaryData.sun_exposure} onValueChange={v => setApiaryData({ ...apiaryData, sun_exposure: v })}>
                                            <SelectTrigger className="h-10 rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg">
                                                <SelectItem value="Full Sun">Full Sun</SelectItem>
                                                <SelectItem value="Shade">Shade</SelectItem>
                                                <SelectItem value="Semi-Shade">Semi-Shade</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="hive" className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Apiary *</Label>
                                    <Select value={hiveData.apiary_id} onValueChange={v => setHiveData({ ...hiveData, apiary_id: v })}>
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue placeholder="Select apiary..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg">
                                            {apiaries.map(apiary => (
                                                <SelectItem key={apiary.id} value={apiary.id}>{apiary.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="hive-code" className="text-sm font-medium">Hive Code *</Label>
                                    <div className="relative">
                                        <Hexagon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hive-code"
                                            placeholder="e.g. KIB-H01"
                                            className="h-10 pl-10 rounded-lg"
                                            value={hiveData.hive_code}
                                            onChange={e => setHiveData({ ...hiveData, hive_code: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Hive Type</Label>
                                        <Select value={hiveData.type} onValueChange={v => setHiveData({ ...hiveData, type: v })}>
                                            <SelectTrigger className="h-10 rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg">
                                                <SelectItem value="Langstroth">Langstroth</SelectItem>
                                                <SelectItem value="Top Bar">Top Bar</SelectItem>
                                                <SelectItem value="Warre">Warre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Installation Date</Label>
                                        <Input
                                            type="date"
                                            className="h-10 rounded-lg"
                                            value={hiveData.queen_hatched}
                                            onChange={e => setHiveData({ ...hiveData, queen_hatched: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-medium">Colony Strength</Label>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                                            {Math.round(hiveData.strength * 20)}%
                                        </Badge>
                                    </div>
                                    <Slider
                                        defaultValue={[3]}
                                        max={5}
                                        min={1}
                                        step={1}
                                        className="py-2"
                                        onValueChange={v => setHiveData({ ...hiveData, strength: v[0] })}
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Weak</span>
                                        <span>Average</span>
                                        <span>Strong</span>
                                    </div>
                                </div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex gap-3 justify-end">
                    <button onClick={onClose} className={cn(glass.btnSecondary, "bg-transparent")}>
                        Cancel
                    </button>
                    <button
                        onClick={activeTab === 'apiary' ? handleAddApiary : handleAddHive}
                        className={cn(glass.btnPrimary, "gap-2")}
                        disabled={loading}
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-4 h-4" />
                        )}
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickActionModal;
