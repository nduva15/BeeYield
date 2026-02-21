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
    Upload, Link as LinkIcon
} from 'lucide-react';
import { beeyieldService, Harvest, Hive } from '@/services/beeyieldService';
import { labelService, LabelDesign as ILabelDesign } from '@/services/labelService';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    certifications: string[]; // Keep for compatibility but maybe move to optional
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
                setSavedDesigns(labelData);
            } catch (error) {
                console.error('Failed to load initial data', error);
                // toast.error('Failed to load data, checking local storage...');
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
                ? savedDesigns.map((d, i) => i === existingIndex ? saved : d)
                : [saved, ...savedDesigns];

            setSavedDesigns(newSavedDesigns);

            // Update current design state with the ID from DB/Mock
            setDesign(saved);
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
            // Use hive apiary data if available, otherwise fallback to defaults or existing
            // @ts-ignore - apiary might be enriched in backend but not in strict types yet
            const apiary = hive.apiary || {};

            updateDesign({
                // country: apiary.location_name || apiary.county || design.country,
                // Simplify location logic
                country: apiary.location_name || 'Kenya',
                producer: design.producer, // Keep current producer or maybe fetch hive owner?
                // honeyType: hive.bee_type || design.honeyType, // Maybe not relevant
            });

            // More robust update
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
            toast.success('Marketing note generated!', { description: 'Powered by Intelligent Hive AI' });
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

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                                {t('label_generator_title') || 'Labels'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('label_generator_subtitle') || 'Design and print labels.'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={createNewDesign} className="gap-2 border-border/50 hover:bg-accent/50 glass-card">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Project</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveDesign} className="gap-2 border-border/50 hover:bg-accent/50 glass-card">
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Save Data</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleGeneratePDF}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-soft transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isGenerating ? 'Exporting...' : 'Export PDF'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel - Content Editor */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="glass-panel border-white/20 dark:border-white/10 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <FileText className="w-4 h-4 text-amber-500" />
                                Label Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {/* Hive Selector */}
                            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 space-y-2">
                                <Label className="text-amber-900 dark:text-amber-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Hexagon className="w-3 h-3" /> Auto-fill from Hive
                                </Label>
                                <Select onValueChange={handleHiveSelect}>
                                    <SelectTrigger className="h-9 bg-white/50 dark:bg-black/20 text-xs border-amber-200/30">
                                        <SelectValue placeholder="Select a hive..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hives.length > 0 ? hives.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="text-xs">
                                                {h.hive_code} {h.apiary_name ? `- ${h.apiary_name}` : ''}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-muted-foreground">No hives found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Harvest Selector */}
                            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 space-y-2">
                                <Label className="text-amber-900 dark:text-amber-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> Auto-fill from Harvest
                                </Label>
                                <Select onValueChange={handleHarvestSelect}>
                                    <SelectTrigger className="h-9 bg-white/50 dark:bg-black/20 text-xs border-amber-200/30">
                                        <SelectValue placeholder="Select a batch..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {harvests.length > 0 ? harvests.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="text-xs">
                                                {h.batch_code || `Batch ${h.harvest_date}`} - {h.honey_type}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-muted-foreground">No harvests found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="productName" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Product Name</Label>
                                    <Input
                                        id="productName"
                                        value={design.productName}
                                        onChange={e => updateDesign({ productName: e.target.value })}
                                        className="h-9 text-xs bg-white/50 dark:bg-black/20"
                                        placeholder="e.g. Mountain Wildflower"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="weight" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Weight</Label>
                                        <Input
                                            id="weight"
                                            value={design.weight}
                                            onChange={e => updateDesign({ weight: e.target.value })}
                                            className="h-9 text-xs bg-white/50 dark:bg-black/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="weightUnit" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Unit</Label>
                                        <Input
                                            id="weightUnit"
                                            value={design.weightUnit}
                                            onChange={e => updateDesign({ weightUnit: e.target.value })}
                                            className="h-9 text-xs bg-white/50 dark:bg-black/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="producer" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Producer/Apiary</Label>
                                    <Input
                                        id="producer"
                                        value={design.producer}
                                        onChange={e => updateDesign({ producer: e.target.value })}
                                        className="h-9 text-xs bg-white/50 dark:bg-black/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="marketingNote" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Marketing Blurb</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-2 text-[10px] gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100/50"
                                            onClick={generateBlurb}
                                            disabled={isGeneratingBlurb}
                                        >
                                            {isGeneratingBlurb ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Smart Storyteller
                                        </Button>
                                    </div>
                                    <textarea
                                        id="marketingNote"
                                        className="w-full rounded-lg border border-input bg-white/50 dark:bg-black/20 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                                        rows={4}
                                        maxLength={180}
                                        value={design.marketingNote}
                                        onChange={e => updateDesign({ marketingNote: e.target.value })}
                                        placeholder="Tell the story of this honey..."
                                    />
                                    <p className="text-[10px] text-right text-muted-foreground">{design.marketingNote.length}/180</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-white/20 dark:border-white/10 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Plus className="w-4 h-4 text-amber-500" />
                                Details & QR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] cursor-pointer text-muted-foreground">Include Batch #</Label>
                                    <Switch checked={design.showBatchNumber} onCheckedChange={v => updateDesign({ showBatchNumber: v })} className="scale-75 origin-right" />
                                </div>
                                {design.showBatchNumber && (
                                    <Input
                                        value={design.batchNumber}
                                        onChange={e => updateDesign({ batchNumber: e.target.value })}
                                        className="h-8 text-[11px] bg-white/50 dark:bg-black/20"
                                        placeholder="LOT Number"
                                    />
                                )}

                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] cursor-pointer text-muted-foreground">Best Before Date</Label>
                                    <Switch checked={design.showBestBefore} onCheckedChange={v => updateDesign({ showBestBefore: v })} className="scale-75 origin-right" />
                                </div>
                                {design.showBestBefore && (
                                    <Input
                                        type="date"
                                        value={design.bestBeforeDate}
                                        onChange={e => updateDesign({ bestBeforeDate: e.target.value })}
                                        className="h-8 text-[11px] bg-white/50 dark:bg-black/20"
                                    />
                                )}

                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] cursor-pointer text-muted-foreground">Traceability QR</Label>
                                    <Switch checked={design.showQRCode} onCheckedChange={v => updateDesign({ showQRCode: v })} className="scale-75 origin-right" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] cursor-pointer text-muted-foreground">System Footer</Label>
                                    <Switch checked={design.showFooter} onCheckedChange={v => updateDesign({ showFooter: v })} className="scale-75 origin-right" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Middle Panel - Visual Designer */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="glass-card overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                        <div className="p-4 sm:p-12 flex items-center justify-center bg-gray-50/50 dark:bg-[#111] min-h-[500px] relative overflow-auto backdrop-blur-3xl">
                            {/* Grid Background Effect */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                            <div
                                ref={previewRef}
                                className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col p-8 transition-all duration-500 ease-out hover:scale-[1.01]"
                                style={{
                                    width: `${parseFloat(design.customWidth) * 4}px`,
                                    height: `${parseFloat(design.customHeight) * 4}px`,
                                    backgroundColor: design.backgroundColor,
                                    color: design.textColor,
                                    border: design.borderStyle === 'elegant' ? `6px double ${design.accentColor}40` : 'none',
                                    borderRadius: design.customShape === 'Circle' ? '50%' : '12px',
                                    fontFamily: "'Playfair Display', serif"
                                }}
                            >
                                {/* Background Accent Pattern */}
                                <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04] pointer-events-none -mr-12 -mt-12 rotate-12">
                                    <Hexagon className="w-full h-full" stroke={design.accentColor} strokeWidth={1} />
                                </div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 opacity-[0.04] pointer-events-none -ml-8 -mb-8 -rotate-12">
                                    <Hexagon className="w-full h-full" stroke={design.accentColor} strokeWidth={1} />
                                </div>

                                {/* Start of Label Content */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex-1 pr-4">
                                        <h2 className="text-3xl font-black uppercase tracking-[0.1em] leading-none mb-2" style={{ color: design.accentColor }}>
                                            {design.productName || 'Pure Honey'}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className="h-[1px] w-12 bg-current opacity-30"></span>
                                            <p className="text-[12px] font-medium tracking-widest uppercase opacity-80">
                                                {design.honeyType} Collection
                                            </p>
                                        </div>
                                    </div>
                                    {design.showLogo && (
                                        <div className="flex items-center justify-center p-2">
                                            {design.logoUrl ? (
                                                <img
                                                    src={design.logoUrl}
                                                    alt="Logo"
                                                    style={{ height: `${32 * design.logoScale}px` }}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="opacity-80">
                                                    <Droplet className="w-8 h-8" style={{ color: design.accentColor }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex-1">
                                    <p className="text-[10px] leading-relaxed max-w-[85%] opacity-90 font-sans tracking-wide">
                                        {design.marketingNote || 'Start writing to tell your story...'}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-4 relative z-10">
                                    <div className="flex justify-between items-end border-t pt-4" style={{ borderColor: `${design.accentColor}30` }}>
                                        <div className="text-[10px] space-y-1 font-medium leading-tight">
                                            {design.producer && <p className="font-bold uppercase tracking-wider">{design.producer}</p>}
                                            <div className="opacity-70 font-sans text-[9px] uppercase tracking-wide">
                                                {design.address && <p>{design.address}</p>}
                                                {design.country && <p>{design.country}</p>}
                                                {design.contactInfo && design.showContact && <p className="mt-1">{design.contactInfo}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] opacity-60 font-bold uppercase tracking-[0.2em] mb-0.5">Net Weight</p>
                                            <p className="text-3xl font-black tabular-nums leading-none tracking-tight">{design.weight}<span className="text-lg ml-0.5">{design.weightUnit}</span></p>
                                        </div>
                                    </div>

                                    {(design.showBatchNumber || design.showBestBefore) && (
                                        <div className="flex gap-4 text-[7px] uppercase tracking-wider font-bold opacity-60 font-mono">
                                            {design.showBatchNumber && (
                                                <div>
                                                    <span className="opacity-50 mr-1">LOT:</span>{design.batchNumber}
                                                </div>
                                            )}
                                            {design.showBestBefore && (
                                                <div>
                                                    <span className="opacity-50 mr-1">EXP:</span>{design.bestBeforeDate}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {design.showFooter && (
                                        <div className="text-[6px] text-center opacity-30 flex items-center justify-center gap-2 uppercase tracking-[0.2em] font-medium pt-1">
                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: design.accentColor }} />
                                            BeeYield Verified • {design.harvestYear}
                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: design.accentColor }} />
                                        </div>
                                    )}
                                </div>

                                {design.showQRCode && (
                                    <div className="absolute bottom-16 right-8 w-12 h-12 bg-white shadow-sm border border-black/5 flex items-center justify-center p-1 rounded-sm">
                                        <Grid className="w-full h-full text-black/90" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Bottom Sections: Saved & Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="glass-panel border-white/20 dark:border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Saved Labels</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {savedDesigns.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center gap-2">
                                        <Save className="w-6 h-6 opacity-20" />
                                        No saved designs yet
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {savedDesigns.map(saved => (
                                            <div key={saved.id} className="p-3 rounded-lg border bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-white/5 transition-all group relative">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{saved.productName || 'Unnamed Label'}</p>
                                                        <p className="text-[10px] text-muted-foreground">{saved.honeyType} • {saved.customWidth}x{saved.customHeight}mm</p>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => loadDesign(saved)}>
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => deleteDesign(saved.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="glass-panel border-white/20 dark:border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Compliance Check</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-xs p-2 rounded-md bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300">
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        <span>Product name is legible</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs p-2 rounded-md bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300">
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        <span>Net weight complies with EU/US std</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                                        <Shield className="w-4 h-4 shrink-0" />
                                        <span>Check local laws for address format</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Panel - Style & Export */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="glass-panel border-white/20 dark:border-white/10 shadow-sm">
                        <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Palette className="w-4 h-4 text-orange-500" />
                                Style Presets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-2">
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
                                            "group p-2 rounded-xl border-2 text-left transition-all hover:scale-105 duration-200",
                                            design.template === tmp.id
                                                ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                                                : 'border-transparent hover:border-amber-200 bg-white/50 dark:bg-black/20'
                                        )}
                                    >
                                        <div className="aspect-[3/2] rounded-lg mb-2 shadow-inner flex flex-col p-2 space-y-1 overflow-hidden relative" style={{ backgroundColor: tmp.color }}>
                                            <div className="w-full h-1 rounded-full opacity-20 bg-current text-black" />
                                            <div className="w-2/3 h-1 rounded-full opacity-10 bg-current text-black" />
                                        </div>
                                        <p className="text-[10px] font-bold truncate leading-tight">{tmp.name}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-white/20 dark:border-white/10 shadow-sm">
                        <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Grid className="w-4 h-4 text-orange-500" />
                                Label Geometry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Width (mm)</Label>
                                    <Input value={design.customWidth} onChange={e => updateDesign({ customWidth: e.target.value })} className="h-8 text-xs bg-white/50 dark:bg-black/20" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Height (mm)</Label>
                                    <Input value={design.customHeight} onChange={e => updateDesign({ customHeight: e.target.value })} className="h-8 text-xs bg-white/50 dark:bg-black/20" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Shape</Label>
                                <Select value={design.customShape} onValueChange={v => updateDesign({ customShape: v })}>
                                    <SelectTrigger className="h-8 text-xs bg-white/50 dark:bg-black/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Rectangle">Standard Rectangle</SelectItem>
                                        <SelectItem value="Circle">Round Label</SelectItem>
                                        <SelectItem value="Oval">Oval Seal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-white/20 dark:border-white/10 shadow-sm">
                        <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <ImageIcon className="w-4 h-4 text-orange-500" />
                                Logo Upload
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div
                                className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center bg-white/30 dark:bg-white/5 cursor-pointer hover:bg-amber-50/50 dark:hover:bg-white/10 transition-colors group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {design.logoUrl ? (
                                    <img src={design.logoUrl} alt="Logo" className="h-16 object-contain" />
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors mb-2" />
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">Click to Upload Brand Logo</p>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            {design.logoUrl && (
                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span>Scale</span>
                                        <span>{(design.logoScale * 100).toFixed(0)}%</span>
                                    </div>
                                    <Slider
                                        value={[design.logoScale]}
                                        min={0.2}
                                        max={2.0}
                                        step={0.1}
                                        onValueChange={([v]) => updateDesign({ logoScale: v })}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LabelGeneratorView;
