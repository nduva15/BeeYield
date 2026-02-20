import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { Hive, HiveCreateInput, Apiary } from '@/services/beeyieldService';
import { useCreateHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import { toast } from 'sonner';

interface HiveFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingHive?: Hive | null;
    preselectedApiaryId?: string;
}

const HiveFormModal: React.FC<HiveFormModalProps> = ({ isOpen, onClose, editingHive, preselectedApiaryId }) => {
    const { data: apiaries = [] } = useApiaries();
    const createHive = useCreateHive();
    const updateHive = useUpdateHive();

    const [formData, setFormData] = React.useState<HiveCreateInput>({
        hive_code: '',
        apiary_id: '',
        hive_type: 'Langstroth',
        bee_type: 'African Honey Bee',
        frame_count: 10,
        material: 'Wood',
        status: 'ACTIVE',
        installation_date: new Date().toISOString().split('T')[0],
        has_sensors: false,
    });

    const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
            return date.toISOString().split('T')[0];
        } catch (e) {
            return new Date().toISOString().split('T')[0];
        }
    };

    React.useEffect(() => {
        if (editingHive) {
            setFormData({
                hive_code: editingHive.hive_code,
                apiary_id: editingHive.apiary_id || '',
                hive_type: editingHive.hive_type || 'Langstroth',
                bee_type: editingHive.bee_type || 'African Honey Bee',
                frame_count: editingHive.frame_count || 10,
                material: editingHive.material || 'Wood',
                status: editingHive.status || 'ACTIVE',
                installation_date: formatDateForInput(editingHive.installation_date),
                has_sensors: editingHive.has_sensors || false,
            });
        } else {
            setFormData({
                hive_code: '',
                apiary_id: preselectedApiaryId || (apiaries.length > 0 ? apiaries[0].id : ''),
                hive_type: 'Langstroth',
                bee_type: 'African Honey Bee',
                frame_count: 10,
                material: 'Wood',
                status: 'ACTIVE',
                installation_date: new Date().toISOString().split('T')[0],
                has_sensors: false,
            });
        }
    }, [editingHive, preselectedApiaryId, apiaries, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.hive_code.trim()) {
            toast.error('Please enter a hive code');
            return;
        }
        if (!formData.apiary_id) {
            toast.error('Please select an apiary');
            return;
        }

        try {
            if (editingHive) {
                await updateHive.mutateAsync({ id: editingHive.id, data: formData });
            } else {
                await createHive.mutateAsync(formData);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save hive', error);
        }
    };

    const isSaving = createHive.isPending || updateHive.isPending;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#064e3b]/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {editingHive ? 'Modify Asset' : 'Register Asset'}
                    </h2>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white hover:bg-white/10 rounded-none border-2 border-white/20 hover:border-white transition-none h-12 w-12"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <Card className="border-4 border-[#064e3b] shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] bg-white rounded-none overflow-hidden">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="hive_code" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        ASSET CODE<span className="text-[#10b981] ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="hive_code"
                                        name="hive_code"
                                        value={formData.hive_code}
                                        onChange={(e) => setFormData({ ...formData, hive_code: e.target.value })}
                                        placeholder="e.g. ALPHA-001"
                                        className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs transition-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apiary_id" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        SECTOR LOCATION<span className="text-[#10b981] ml-1">*</span>
                                    </Label>
                                    <Select name="apiary_id" value={formData.apiary_id} onValueChange={(val) => setFormData({ ...formData, apiary_id: val })}>
                                        <SelectTrigger id="hive-apiary" className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs focus:ring-0">
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white p-0">
                                            {apiaries.map(apiary => (
                                                <SelectItem key={apiary.id} value={apiary.id} className="hover:bg-[#facc15]/10 transition-none p-4 font-black uppercase text-[10px] tracking-widest focus:bg-[#10b981] focus:text-white rounded-none">{apiary.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hive_type" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        ASSET ARCHITECTURE
                                    </Label>
                                    <Select name="hive_type" value={formData.hive_type} onValueChange={(val) => setFormData({ ...formData, hive_type: val })}>
                                        <SelectTrigger id="hive-type" className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white p-0">
                                            <SelectItem value="Langstroth" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Langstroth</SelectItem>
                                            <SelectItem value="KTBH" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Kenya Top-Bar</SelectItem>
                                            <SelectItem value="Traditional Log" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Traditional Log</SelectItem>
                                            <SelectItem value="Warre" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Warré</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frame_count" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        UNIT CAPACITY (FRAMES)
                                    </Label>
                                    <Input
                                        id="frame_count"
                                        name="frame_count"
                                        type="number"
                                        value={formData.frame_count || ''}
                                        onChange={(e) => setFormData({ ...formData, frame_count: parseInt(e.target.value) || 0 })}
                                        placeholder="10"
                                        className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs transition-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bee_type" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        BIOLOGICAL TYPE
                                    </Label>
                                    <Select name="bee_type" value={formData.bee_type} onValueChange={(val) => setFormData({ ...formData, bee_type: val })}>
                                        <SelectTrigger id="hive-bee-type" className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white p-0">
                                            <SelectItem value="African Honey Bee" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">African Honey Bee</SelectItem>
                                            <SelectItem value="Italian Bee" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Italian Bee</SelectItem>
                                            <SelectItem value="Carniolan Bee" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Carniolan Bee</SelectItem>
                                            <SelectItem value="Buckfast Bee" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Buckfast Bee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        OPERATIONAL STATUS
                                    </Label>
                                    <Select name="status" value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                        <SelectTrigger id="hive-status" className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white p-0">
                                            <SelectItem value="ACTIVE" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Active</SelectItem>
                                            <SelectItem value="WEAK" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Weak</SelectItem>
                                            <SelectItem value="INACTIVE" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Inactive</SelectItem>
                                            <SelectItem value="QUEENLESS" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Queenless</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="material" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        CHASSIS MATERIAL
                                    </Label>
                                    <Select name="material" value={formData.material} onValueChange={(val) => setFormData({ ...formData, material: val })}>
                                        <SelectTrigger id="hive-material" className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs">
                                            <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white p-0">
                                            <SelectItem value="Wood" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Wood</SelectItem>
                                            <SelectItem value="Plastic" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Plastic</SelectItem>
                                            <SelectItem value="Bamboo" className="hover:bg-[#facc15]/10 p-4 font-black uppercase text-[10px] focus:bg-[#10b981] focus:text-white rounded-none">Bamboo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="installation_date" className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">
                                        REGISTRY DATE
                                    </Label>
                                    <Input
                                        id="installation_date"
                                        name="installation_date"
                                        type="date"
                                        value={formData.installation_date || ''}
                                        onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                                        className="h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black uppercase text-xs transition-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t-4 border-[#064e3b]/10 flex items-center justify-end gap-6">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="h-12 px-6 rounded-none font-black text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-[#facc15]/10 uppercase text-[10px] tracking-widest transition-none"
                                disabled={isSaving}
                            >
                                Abort Registry
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="h-12 px-8 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] border-2 border-[#064e3b] font-black uppercase text-xs tracking-widest transition-none shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {editingHive ? 'COMMIT CHANGES' : 'EXECUTE REGISTRY'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HiveFormModal;
