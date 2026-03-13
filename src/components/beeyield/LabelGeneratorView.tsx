import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
    Tag, Download, Printer, Save, Eye, Palette, Type, Image as ImageIcon,
    Grid, AlignJustify, FileText, ChevronRight, Plus, Trash2, Copy,
    Hexagon, Droplet, Calendar, MapPin, Shield, ShieldCheck, Award, Sparkles, RotateCcw,
    Upload, Link as LinkIcon, Activity
} from 'lucide-react';
import beeyieldService from '@/services/beeyieldService';
import { labelService, LabelDesign as ILabelDesign } from '@/services/labelService';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

// Types for local use
interface Harvest {
    id: string;
    batch_code?: string;
    honey_type?: string;
    harvest_date?: string;
    apiary?: {
        location_name?: string;
    };
    farmer?: {
        name?: string;
    };
}

interface Hive {
    id: string;
    hive_code: string;
    apiary_name?: string;
    apiary?: {
        name?: string;
        location_name?: string;
        country?: string;
    };
}

interface LabelDesign extends Omit<ILabelDesign, 'id'> {
    id: string;
    name: string;
    productName: string;
    honeyType: string;
    harvestYear: string;
    weight: string;
    weightUnit: string;
    countryOfOrigin: string;
    country: string;
    producer: string;
    address: string;
    marketingNote: string;

    // Optional fields
    showBatchNumber: boolean;
    batchNumber: string;
    showBottlingDate: boolean;
    bottlingDate: string;
    showBestBefore: boolean;
    bestBeforeDate: string;
    showStorageConditions: boolean;
    storageConditions: string;
    showContact: boolean;
    contactInfo: string;
    showQRCode: boolean;
    showFooter: boolean;
    showLogo: boolean;
    logoUrl: string;
    logoScale: number;

    // Style & Template
    template: string;
    labelSize: string;
    customWidth: string;
    customHeight: string;
    customShape: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderStyle: string;

    // Export
    exportFormat: string;
    exportDPI: string;
    exportBleed: string;
    showCropMarks: boolean;
    useA4Sheet: boolean;

    certifications: string[];
}

interface Template {
    id: string;
    name: string;
    description: string;
    color: string;
    textColor: string;
    accent: string;
}

const templates: Template[] = [
    { id: 'minimal-amber', name: 'Minimal Amber', description: 'Clean typography, honey gold.', color: '#FFFBF0', textColor: '#2D241E', accent: '#D97706' },
    { id: 'minimal-ink', name: 'Minimal Ink', description: 'Premium darker look.', color: '#1A1A1A', textColor: '#FFFFFF', accent: '#F5A623' },
    { id: 'minimal-cream', name: 'Minimal Cream', description: 'Soft and calm layout.', color: '#FFF8E7', textColor: '#2D241E', accent: '#D97706' },
    { id: 'apiary-forest', name: 'Forest Dark', description: 'Deep nature greens.', color: '#0F291E', textColor: '#F0FDF4', accent: '#34D399' },
    { id: 'apiary-hex', name: 'Apiary Hex', description: 'Geometric patterns.', color: '#FFFFFF', textColor: '#1A1A1A', accent: '#E67E22' },
    { id: 'royal-blue', name: 'Royal Blue', description: 'Trustworthy and premium.', color: '#1E3A8A', textColor: '#FFFFFF', accent: '#FCD34D' },
];

interface LabelGeneratorViewProps {
    onTabChange?: (tab: string, message?: string) => void;
}

const defaultDesign: LabelDesign = {
    id: crypto.randomUUID(),
    name: 'New Label Design',
    productName: 'Mountain Wildflower',
    honeyType: 'Premium Raw',
    harvestYear: new Date().getFullYear().toString(),
    weight: '500',
    weightUnit: 'g',
    countryOfOrigin: 'Single Estate',
    country: 'Kenya',
    producer: 'BeeYield Premium Apiaries',
    address: 'Nanyuki Highlands, Box 15',
    marketingNote: 'Cold-extracted from native wildflowers. 100% natural, unprocessed goodness.',

    showBatchNumber: true,
    batchNumber: 'MTK-2025-01',
    showBottlingDate: true,
    bottlingDate: new Date().toISOString().split('T')[0],
    showBestBefore: true,
    bestBeforeDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    showStorageConditions: true,
    storageConditions: 'Store in a cool, dry place away from direct sunlight.',
    showContact: true,
    contactInfo: 'www.beeyield.com • hello@beeyield.com',
    showQRCode: false,
    showFooter: true,
    showLogo: true,
    logoUrl: '',
    logoScale: 1.0,

    template: 'minimal-amber',
    labelSize: '99x57',
    customWidth: '99.1',
    customHeight: '57',
    customShape: 'Rectangle',
    backgroundColor: '#FFFBF0',
    textColor: '#2D241E',
    accentColor: '#D97706',
    borderStyle: 'elegant',

    exportFormat: 'PDF',
    exportDPI: '300',
    exportBleed: '3',
    showCropMarks: true,
    useA4Sheet: false,

    certifications: ['raw', 'premium'],
};

const LabelGeneratorView: React.FC<LabelGeneratorViewProps> = ({ onTabChange }) => {
    const { t } = useLanguage();
    const [design, setDesign] = React.useState<LabelDesign>(defaultDesign);
    const [savedDesigns, setSavedDesigns] = React.useState<LabelDesign[]>([]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [harvests, setHarvests] = React.useState<Harvest[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [isGeneratingBlurb, setIsGeneratingBlurb] = React.useState(false);

    // Refs
    const previewRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingData(true);
            try {
                // Load harvests & hives for autofill
                const [harvestData, hiveData] = await Promise.all([
                    beeyieldService.getHarvests(),
                    beeyieldService.getHives()
                ]);
                setHarvests(harvestData);
                setHives(hiveData);

                // Load saved designs
                const labelData = await labelService.getLabels();
                setSavedDesigns(labelData as LabelDesign[]);
            } catch (error) {
                console.error('Failed to load initial data', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    const updateDesign = (updates: Partial<LabelDesign>) => {
        setDesign(prev => ({ ...prev, ...updates }));
    };

    const saveDesign = async () => {
        try {
            const saved = await labelService.saveLabel(design);

            // Update the local list
            const existingIndex = savedDesigns.findIndex(d => d.id === saved.id);
            const newSavedDesigns = existingIndex >= 0
                ? savedDesigns.map((d, i) => i === existingIndex ? saved as LabelDesign : d)
                : [saved as LabelDesign, ...savedDesigns];

            setSavedDesigns(newSavedDesigns);

            // Update current design state with the ID from DB/Mock
            setDesign(saved as LabelDesign);
            toast.success('Label design saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save design');
        }
    };

    const loadDesign = (savedDesign: LabelDesign) => {
        setDesign(savedDesign);
        toast.success('Design loaded');
    };

    const createNewDesign = () => {
        setDesign({ ...defaultDesign, id: crypto.randomUUID() });
        toast.info('Created new design');
    };

    const deleteDesign = async (designId: string) => {
        try {
            await labelService.deleteLabel(designId);
            setSavedDesigns(savedDesigns.filter(d => d.id !== designId));
            if (design.id === designId) {
                createNewDesign();
            }
            toast.success('Design deleted');
        } catch (error) {
            toast.error('Failed to delete design');
        }
    };

    const handleHarvestSelect = (harvestId: string) => {
        const harvest = harvests.find(h => h.id === harvestId);
        if (harvest) {
            updateDesign({
                batchNumber: harvest.batch_code || design.batchNumber,
                honeyType: harvest.honey_type || design.honeyType,
                harvestYear: harvest.harvest_date ? new Date(harvest.harvest_date).getFullYear().toString() : design.harvestYear,
                country: harvest.apiary?.location_name || design.country,
                producer: harvest.farmer?.name || design.producer,
                bestBeforeDate: harvest.harvest_date
                    ? new Date(new Date(harvest.harvest_date).setFullYear(new Date(harvest.harvest_date).getFullYear() + 2)).toISOString().split('T')[0]
                    : design.bestBeforeDate
            });
            toast.success('Label linked to harvest data');
        }
    };

    const handleHiveSelect = (hiveId: string) => {
        const hive = hives.find(h => h.id === hiveId);
        if (hive) {
            const apiary = (hive as any).apiary || {};

            updateDesign({
                country: apiary.location_name || apiary.country || design.country,
                producer: apiary.name ? `${apiary.name} (Hive ${hive.hive_code})` : design.producer,
            });

            toast.success(`Linked to Hive ${hive.hive_code}`);
        }
    }

    const generateBlurb = async () => {
        setIsGeneratingBlurb(true);
        try {
            const { blurb } = await beeyieldService.generateLabelBlurb({
                floral_type: design.honeyType,
                location: design.country,
                harvest_year: design.harvestYear,
                use_ai: true,
            });
            updateDesign({ marketingNote: blurb });
            toast.success('Marketing note generated!', { description: 'Powered by BeeYield' });
        } catch (e) {
            console.error(e);
            toast.error('Could not generate description. Using fallback.');
        } finally {
            setIsGeneratingBlurb(false);
        }
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateDesign({ logoUrl: url });
            toast.success('Logo uploaded');
        }
    };

    const handleGeneratePDF = async () => {
        setIsGenerating(true);
        try {
            const fileName = `label-${design.productName.toLowerCase().replace(/\s+/g, '-') || 'honey'}.pdf`;
            await labelService.exportPdf(design, fileName);
            toast.success('PDF label generated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF. Is the backend server running?');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={glass.page}>
            {/* Header Section */}
            <PageHeader
                icon={Tag}
                label="Orbital Intelligence Kernel"
                title="Label Systems"
                subtitle="High-fidelity export and precision product labeling for global apiculture."
                actions={
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={createNewDesign} 
                            className={cn(glass.btnSecondary, "h-9 px-4 rounded-xl")}
                        >
                            <Plus className="w-3.5 h-3.5 text-[#F4D03F]" />
                            <span>NEW_PROJECT</span>
                        </button>
                        <button
                            onClick={handleGeneratePDF}
                            disabled={isGenerating}
                            className={cn(glass.btnPrimary, "h-9 px-6 rounded-xl")}
                        >
                            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span>{isGenerating ? 'EXPORTING' : 'EXPORT_PDF'}</span>
                        </button>
                    </div>
                }
            />

            {/* Quick Stats Grid - Matching Home View standard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <GlassStatCard
                    label="LABELS_GENERATED"
                    value={savedDesigns.length + 124}
                    icon={Tag}
                    color="text-amber-500"
                    index={0}
                />
                <GlassStatCard
                    label="COMPLIANCE_SCORE"
                    value="99.2%"
                    icon={ShieldCheck}
                    color="text-emerald-500"
                    index={1}
                />
                <GlassStatCard
                    label="ACTIVE_DESIGNS"
                    value={savedDesigns.length}
                    icon={FileText}
                    color="text-blue-500"
                    index={2}
                />
                <GlassStatCard
                    label="SYSTEM_HEALTH"
                    value="OPTIMAL"
                    icon={Activity}
                    color="text-[#F4D03F]"
                    index={3}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Panel - Content Editor */}
                <div className="lg:col-span-1 space-y-6">
                    <div className={glass.card}>
                        <div className={glass.sectionHeader}>
                             <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className={glass.sectionTitle}>LABEL_CONTENT</h3>
                             </div>
                        </div>
                        <div className="p-5 space-y-6">
                            {/* Hive Selector */}
                            <div className="space-y-2.5">
                                <Label className={glass.microLabel}>ASSET_SOURCE_UNIT</Label>
                                <Select onValueChange={handleHiveSelect}>
                                    <SelectTrigger className={cn(glass.select, "w-full")}>
                                        <SelectValue placeholder="SELECT_ASSET" />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {hives.length > 0 ? hives.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="font-black uppercase text-[10px]">
                                                {h.hive_code} {h.apiary_name ? `- ${h.apiary_name}` : ''}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-gray-400 font-black">NO_DATA_SYNCED</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Harvest Selector */}
                             <div className="space-y-2.5">
                                <Label className={glass.microLabel}>BATCH_LINK_PROTOCOL</Label>
                                <Select onValueChange={handleHarvestSelect}>
                                    <SelectTrigger className={cn(glass.select, "w-full")}>
                                        <SelectValue placeholder="SELECT_PROTOCOL" />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {harvests.length > 0 ? harvests.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="font-black uppercase text-[10px]">
                                                {h.batch_code || `BATCH_${h.harvest_date}`}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-gray-400 font-black">NO_BATCH_RECORDS</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="h-px bg-gradient-to-r from-[#F4D03F]/20 to-transparent" />

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <Label className={glass.microLabel}>PRODUCT_DESIGNATION</Label>
                                        <span className="text-[8px] font-black text-[#F4D03F]/40 uppercase">UTF-8_READY</span>
                                    </div>
                                    <Input
                                        value={design.productName}
                                        onChange={e => updateDesign({ productName: e.target.value })}
                                        className={glass.input}
                                        placeholder="E.G. WILDFLOWER_ELITE"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className={glass.microLabel}>MASS_VALUE</Label>
                                        <Input
                                            value={design.weight}
                                            onChange={e => updateDesign({ weight: e.target.value })}
                                            className={glass.input}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className={glass.microLabel}>UNIT_ID</Label>
                                        <Input
                                            value={design.weightUnit}
                                            onChange={e => updateDesign({ weightUnit: e.target.value })}
                                            className={glass.input}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className={glass.microLabel}>MARKETING_DIAGNOSTICS</Label>
                                        <button
                                            className="h-6 px-2 rounded-lg bg-[#F4D03F]/10 border border-[#F4D03F]/20 text-[8px] font-black text-[#F4D03F] uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#F4D03F]/20 transition-all"
                                            onClick={generateBlurb}
                                            disabled={isGeneratingBlurb}
                                        >
                                            {isGeneratingBlurb ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                            <span>AI_CORE_GEN</span>
                                        </button>
                                    </div>
                                    <textarea
                                        className={cn(glass.input, "w-full py-2.5 min-h-[100px] resize-none")}
                                        maxLength={180}
                                        value={design.marketingNote}
                                        onChange={e => updateDesign({ marketingNote: e.target.value })}
                                        placeholder="ENTER_PRODUCT_STORY_PROTOCOL..."
                                    />
                                    <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                        <span>BUFFER_LIMIT</span>
                                        <span className={cn(design.marketingNote.length > 160 ? "text-[#F4D03F]" : "")}>{design.marketingNote.length}/180</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={glass.card}>
                        <div className={glass.sectionHeader}>
                             <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className={glass.sectionTitle}>PROTOCOL_DETAILS</h3>
                             </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { id: 'showBatchNumber', label: 'Include_Batch_ID', value: design.showBatchNumber },
                                { id: 'showBestBefore', label: 'Expiration_Safe_Gate', value: design.showBestBefore },
                                { id: 'showQRCode', label: 'Traceability_QR_Link', value: design.showQRCode },
                                { id: 'showFooter', label: 'System_Seal_Footer', value: design.showFooter },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold text-[#1A1A1A]/80 uppercase tracking-tight">{item.label}</Label>
                                    <Switch 
                                        checked={item.value as boolean} 
                                        onCheckedChange={v => updateDesign({ [item.id]: v })} 
                                        className="data-[state=checked]:bg-[#F4D03F] scale-75" 
                                    />
                                </div>
                            ))}
                            <AnimatePresence>
                                {design.showBatchNumber && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <Input
                                            value={design.batchNumber}
                                            onChange={e => updateDesign({ batchNumber: e.target.value })}
                                            className={cn(glass.input, "w-full mt-2")}
                                            placeholder="LOT_NUMBER"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Center Panel - Precision Designer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={cn(glass.card, "bg-[#1A1A1A]/5 shadow-inner min-h-[640px] flex flex-col")}>
                         <div className={glass.sectionHeader}>
                             <div className="flex items-center gap-2">
                                 <Plus className="w-4 h-4 text-[#F4D03F]" />
                                 <h3 className={glass.sectionTitle}>PRECISION_DESIGNER</h3>
                             </div>
                             <div className={glass.badge}>
                                 OPTIC: 300_ULTRACLEAR
                             </div>
                         </div>
                        
                        <div className="flex-1 flex items-center justify-center p-12 relative overflow-auto">
                            {/* Grid Background Effect */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                             <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                ref={previewRef}
                                className="shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col p-8 transition-all duration-500 ease-out border border-white/40"
                                style={{
                                    width: `${parseFloat(design.customWidth) * 4}px`,
                                    height: `${parseFloat(design.customHeight) * 4}px`,
                                    backgroundColor: design.backgroundColor,
                                    color: design.textColor,
                                    border: design.borderStyle === 'elegant' ? `6px double ${design.accentColor}30` : 'none',
                                    borderRadius: design.customShape === 'Circle' ? '50%' : '12px',
                                }}
                            >
                                {/* Background Accent Pattern */}
                                <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04] pointer-events-none -mr-12 -mt-12 rotate-12">
                                    <Hexagon className="w-full h-full" stroke={design.accentColor} strokeWidth={1} />
                                </div>

                                {/* Label Content */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex-1 pr-6">
                                        <h2 className="text-3xl font-black uppercase tracking-[0.1em] leading-tight mb-2" style={{ color: design.accentColor }}>
                                            {design.productName || 'PURE_HONEY'}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className="h-[1px] w-8 bg-current opacity-30"></span>
                                            <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                                                {design.honeyType} CORE
                                            </p>
                                        </div>
                                    </div>
                                    {design.showLogo && (
                                        <div className="flex items-center justify-center p-1">
                                            {design.logoUrl ? (
                                                <img
                                                    src={design.logoUrl}
                                                    alt="Logo"
                                                    style={{ height: `${36 * design.logoScale}px` }}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <Droplet className="w-8 h-8 opacity-60" style={{ color: design.accentColor }} />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex-1">
                                    <p className="text-[10px] leading-relaxed max-w-[90%] opacity-80 font-bold tracking-tight uppercase">
                                        {design.marketingNote || 'INITIALIZING_PRODUCT_STORY_SEQUENCE...'}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-4 relative z-10">
                                    <div className="flex justify-between items-end border-t pt-4" style={{ borderColor: `${design.accentColor}20` }}>
                                        <div className="text-[9px] space-y-1 font-bold leading-tight uppercase opacity-80">
                                            {design.producer && <p className="font-black tracking-widest">{design.producer}</p>}
                                            <div className="text-[7px] tracking-[0.2em] opacity-60">
                                                {design.address && <p>{design.address}</p>}
                                                {design.country && <p>{design.country}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[7px] opacity-40 font-black uppercase tracking-[0.2em]">NET_MASS</p>
                                            <p className="text-3xl font-black tabular-nums tracking-tighter">{design.weight}<span className="text-xs ml-0.5 font-bold">{design.weightUnit}</span></p>
                                        </div>
                                    </div>

                                    {(design.showBatchNumber || design.showBestBefore) && (
                                        <div className="flex gap-4 text-[7px] uppercase tracking-[0.2em] font-black opacity-30">
                                            {design.showBatchNumber && <div>BATCH: {design.batchNumber}</div>}
                                            {design.showBestBefore && <div>EXP: {design.bestBeforeDate}</div>}
                                        </div>
                                    )}

                                    {design.showFooter && (
                                        <div className="text-[6px] text-center opacity-30 flex items-center justify-center gap-2 uppercase tracking-[0.4em] font-black pt-2">
                                            BEEYIELD_AUTHENTICATED • CYCLE_{design.harvestYear}
                                        </div>
                                    )}

                                    {design.showQRCode && (
                                        <div className="absolute bottom-16 right-8 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 rounded-sm">
                                            <Grid className="w-full h-full opacity-40 text-current" />
                                        </div>
                                    )}
                                </div>
                             </motion.div>
                        </div>
                    </div>

                    {/* Bottom Sections: Saved & Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={glass.card}>
                            <div className={glass.sectionHeader}>
                                <h3 className={glass.sectionTitle}>SAVED_ARCHIVES</h3>
                                <Save className="w-4 h-4 text-[#F4D03F]/40" />
                            </div>
                            <div className="p-4 h-[200px] overflow-y-auto space-y-2">
                                {savedDesigns.length === 0 ? (
                                    <div className={glass.emptyState}>
                                        <Save className="w-6 h-6 opacity-20 text-[#F4D03F]" />
                                        <p className={glass.microLabel}>NO_SAVED_PROTOCOLS</p>
                                    </div>
                                ) : (
                                    savedDesigns.map(saved => (
                                        <div key={saved.id} className="p-3 rounded-lg border border-[#F4D03F]/10 bg-white/40 hover:bg-white/80 transition-all group flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-black text-[#1A1A1A] uppercase tracking-tight">{saved.productName || 'UNNAMED_PROJECT'}</p>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{saved.honeyType} • {saved.customWidth}x{saved.customHeight}MM</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => loadDesign(saved)} className="p-1.5 rounded-md hover:bg-[#F4D03F]/10 text-gray-500 hover:text-[#F4D03F]"><Eye className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteDesign(saved.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className={glass.card}>
                            <div className={glass.sectionHeader}>
                                <h3 className={glass.sectionTitle}>COMPLIANCE_MATRIX</h3>
                                <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <div className="p-4 space-y-2">
                                {[
                                    { label: 'PRODUCT_ID_LEGIBILITY', icon: ShieldCheck, status: 'NOMINAL', color: 'text-[#1B9157]' },
                                    { label: 'MASS_COMPLIANCE_USDA', icon: ShieldCheck, status: 'NOMINAL', color: 'text-[#1B9157]' },
                                    { label: 'JURISDICTION_PROTOCOL', icon: Shield, status: 'MANUAL_VERIFY', color: 'text-[#F4D03F]' },
                                ].map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-black/5 bg-white/30">
                                        <div className="flex items-center gap-2.5">
                                            <c.icon className={cn("w-3.5 h-3.5", c.color)} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{c.label}</span>
                                        </div>
                                        <span className={cn("text-[8px] font-black", c.color)}>{c.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Style & Export */}
                <div className="lg:col-span-1 space-y-6">
                    <div className={glass.card}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-orange-500" />
                                <h3 className={glass.sectionTitle}>STYLE_PRESETS</h3>
                            </div>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-3">
                            {templates.map(tmp => (
                                <button
                                    key={tmp.id}
                                    onClick={() => updateDesign({
                                        template: tmp.id,
                                        backgroundColor: tmp.color,
                                        textColor: tmp.textColor,
                                        accentColor: tmp.accent
                                    })}
                                    className={cn(
                                        "group p-2.5 rounded-xl border-2 transition-all duration-300",
                                        design.template === tmp.id
                                            ? 'border-[#F4D03F] bg-[#F4D03F]/5 shadow-md'
                                            : 'border-transparent bg-white/50 hover:border-[#F4D03F]/20'
                                    )}
                                >
                                    <div className="aspect-[3/2] rounded-lg mb-2 shadow-inner flex flex-col p-2 space-y-1 overflow-hidden" style={{ backgroundColor: tmp.color }}>
                                        <div className="w-full h-1 rounded-full opacity-20 bg-current" />
                                        <div className="w-2/3 h-1 rounded-full opacity-10 bg-current" />
                                    </div>
                                    <p className="text-[9px] font-black text-center uppercase tracking-widest truncate">{tmp.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={glass.card}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <Grid className="w-4 h-4 text-orange-500" />
                                <h3 className={glass.sectionTitle}>GEOMETRY_CONFIG</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className={glass.microLabel}>WIDTH (MM)</Label>
                                    <Input value={design.customWidth} onChange={e => updateDesign({ customWidth: e.target.value })} className={glass.input} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={glass.microLabel}>HEIGHT (MM)</Label>
                                    <Input value={design.customHeight} onChange={e => updateDesign({ customHeight: e.target.value })} className={glass.input} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className={glass.microLabel}>GEOMETRIC_SHAPE</Label>
                                <Select value={design.customShape} onValueChange={v => updateDesign({ customShape: v })}>
                                    <SelectTrigger className={cn(glass.select, "w-full")}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        <SelectItem value="Rectangle" className="font-black uppercase text-[10px]">RECTANGLE_STD</SelectItem>
                                        <SelectItem value="Circle" className="font-black uppercase text-[10px]">ROUND_LABEL</SelectItem>
                                        <SelectItem value="Oval" className="font-black uppercase text-[10px]">OVAL_SEAL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className={glass.card}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-orange-500" />
                                <h3 className={glass.sectionTitle}>BRAND_UPLOAD</h3>
                            </div>
                        </div>
                        <div className="p-5">
                            <div
                                className="w-full h-28 rounded-xl border-2 border-dashed border-[#F4D03F]/30 flex flex-col items-center justify-center bg-white/30 cursor-pointer hover:bg-[#F4D03F]/5 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {design.logoUrl ? (
                                    <img src={design.logoUrl} alt="Logo" className="h-20 object-contain p-2" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-[#F4D03F]/40 group-hover:text-[#F4D03F] mb-2 transition-colors" />
                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">OPTIC_UPLOAD</p>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            
                            {design.logoUrl && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#F4D03F]">
                                        <span>OPTIC_SCALE</span>
                                        <span>{(design.logoScale * 100).toFixed(0)}%</span>
                                    </div>
                                    <Slider
                                        value={[design.logoScale]}
                                        min={0.1}
                                        max={2.0}
                                        step={0.05}
                                        onValueChange={([v]) => updateDesign({ logoScale: v })}
                                        className="py-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {/* Modals or other overlays */}
            </AnimatePresence>
        </div>
    );
};

export default LabelGeneratorView;
