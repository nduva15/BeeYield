import React, { useState, useEffect } from 'react';
import { Plus, MapPin, X, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Info, NotepadText, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { beeyieldService, Apiary, ApiaryCreateInput } from '@/services/beeyieldService';
import { toast } from 'sonner';

interface MyPlacesViewProps {
    onTabChange: (tab: string) => void;
}

const MyPlacesView: React.FC<MyPlacesViewProps> = ({ onTabChange }) => {
    const [isAddingPlace, setIsAddingPlace] = useState(false);
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);

    // Form state
    const [formData, setFormData] = useState<ApiaryCreateInput>({
        name: '',
        type: 'permanent',
        location_name: '',
        forage_type: '',
        expected_hives: 0,
        notes: '',
    });

    // Fetch apiaries on mount
    useEffect(() => {
        const fetchApiaries = async () => {
            setIsLoading(true);
            const data = await beeyieldService.getApiaries();
            setApiaries(data);
            setIsLoading(false);
        };
        fetchApiaries();
    }, []);

    // Handle form submission
    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Please enter an apiary name');
            return;
        }

        setIsSaving(true);
        const { data, error } = await beeyieldService.createApiary(formData);
        setIsSaving(false);

        if (data && !error) {
            setApiaries([data, ...apiaries]);
            setIsAddingPlace(false);
            setFormData({ name: '', type: 'permanent', location_name: '', forage_type: '', expected_hives: 0, notes: '' });
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        const { error } = await beeyieldService.deleteApiary(id);
        if (!error) {
            setApiaries(apiaries.filter(a => a.id !== id));
        }
    };

    if (isAddingPlace) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                {/* Header for Form */}
                <div className="mb-8 px-2">
                    <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
                        Add Place
                    </h1>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-[2rem] overflow-hidden max-w-4xl mx-2">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Name<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Nanyuki North Field"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="type" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Type
                                    </Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                            <SelectItem value="migratory">Migratory</SelectItem>
                                            <SelectItem value="breeding">Breeding</SelectItem>
                                            <SelectItem value="quarantine">Quarantine</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="hives" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Expected Hives
                                    </Label>
                                    <Input
                                        id="hives"
                                        type="number"
                                        value={formData.expected_hives || ''}
                                        onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="location" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Location / Coordinates
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="location"
                                            value={formData.location_name || ''}
                                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                            placeholder="Search location..."
                                            className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="forage" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Primary Forage
                                    </Label>
                                    <Input
                                        id="forage"
                                        value={formData.forage_type || ''}
                                        onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                        placeholder="e.g. Acacia, Sunflowers"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="notes" className="text-sm font-[800] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <NotepadText className="w-4 h-4" /> Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes || ''}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any special instructions or observations..."
                                        className="min-h-[120px] rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => setIsAddingPlace(false)}
                                className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-all"
                                disabled={isSaving}
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="h-14 px-10 rounded-2xl font-[900] bg-[#F4D03F] hover:bg-[#D4AF37] text-white shadow-xl shadow-[#F4D03F]/40 dark:shadow-none tracking-widest uppercase text-xs"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                Deploy Apiary
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 min-h-[80vh]">

            {/* Section Heading - Exact Font Weight and Size from Image */}
            <div className="mb-8 px-2">
                <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
                    My Places
                </h1>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]" />
                </div>
            )}

            {/* Empty State Banner */}
            {!isLoading && apiaries.length === 0 && (
                <div className="bg-[#FEF2F2] dark:bg-red-950/20 border border-[#FEE2E2] dark:border-red-900/40 rounded-[2rem] py-16 flex items-center justify-center shadow-sm mx-2">
                    <span className="text-[#F87171] dark:text-red-400 font-extrabold text-center text-lg tracking-[0.15em] px-8 uppercase">
                        You don't have any apiaries yet.
                    </span>
                </div>
            )}

            {/* Apiaries Grid */}
            {!isLoading && apiaries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-2">
                    {apiaries.map((apiary) => (
                        <Card
                            key={apiary.id}
                            className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-[2rem] overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-[#F4D03F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{apiary.name}</h3>
                                            <p className="text-sm text-slate-500">{apiary.location_name || 'No location set'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(apiary.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                                        {apiary.type || 'permanent'}
                                    </Badge>
                                    {apiary.status && (
                                        <Badge className={cn(
                                            "capitalize",
                                            apiary.status === 'active' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {apiary.status}
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Expected Hives</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{apiary.expected_hives || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Forage</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{apiary.forage_type || '-'}</p>
                                    </div>
                                </div>

                                {apiary.notes && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-sm text-slate-500 line-clamp-2">{apiary.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Floating Actions */}
            <div className="fixed bottom-12 right-12 flex flex-col items-end gap-3 z-50">
                <AnimatePresence>
                    {isFabExpanded && (
                        <>
                            {/* Backdrop for click-out */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFabExpanded(false)}
                                className="fixed inset-0 z-[-1] bg-transparent"
                            />

                            {/* PLACE Label/Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                onClick={() => {
                                    setIsAddingPlace(true);
                                    setIsFabExpanded(false);
                                }}
                                className="bg-[#2D3748] dark:bg-[#1e293b] text-white pl-4 pr-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform mr-1 mb-2"
                            >
                                <MapPin className="w-4 h-4 text-[#F4D03F] fill-current" />
                                <span className="tracking-[0.2em] text-[11px] font-black">PLACE</span>
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* FAB Main Button */}
                <button
                    onClick={() => setIsFabExpanded(!isFabExpanded)}
                    className={cn(
                        "w-[64px] h-[64px] text-white rounded-full shadow-[0_15px_30px_-5px_rgba(246,173,85,0.4)] flex items-center justify-center transition-all duration-500 active:scale-90 group overflow-hidden relative",
                        isFabExpanded ? "bg-[#2D3748] rotate-90 shadow-xl" : "bg-[#F4D03F] hover:bg-[#D4AF37]"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isFabExpanded ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-7 h-7 text-white stroke-[3.5]" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Plus className="w-7 h-7 text-white stroke-[3.5]" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};

export default MyPlacesView;
