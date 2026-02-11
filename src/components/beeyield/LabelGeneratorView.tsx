import React, { useEffect, useRef, useState } from 'react';
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
import { beeyieldService, Harvest } from '@/services/beeyieldService';
import { labelService, LabelDesign as ILabelDesign } from '@/services/labelService';
import { Loader2 } from 'lucide-react';

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
}

const templates: Template[] = [
    { id: 'minimal-amber', name: 'Minimal Amber', description: 'Clean typography and a delicate touch in honey color.', color: '#F5A623' },
    { id: 'minimal-ink', name: 'Minimal Ink', description: 'Contrasting, premium, with a dark recipe.', color: '#1A1A1A' },
    { id: 'minimal-cream', name: 'Minimal Cream', description: 'Bright background, soft lines and calm layout.', color: '#FFF8E7' },
    { id: 'apiary-honeycomb', name: 'Apiary Honeycomb', description: 'A stylish background with gold and an elegant feel.', color: '#FFD700' },
    { id: 'apiary-hex', name: 'Apiary Hex', description: 'Geometric pattern motif with strong contrast.', color: '#E67E22' },
    { id: 'apiary-bee', name: 'Apiary Bee', description: 'A subtle bee on a warm climate of the apiary.', color: '#F1C40F' },
];

interface LabelGeneratorViewProps {
    onTabChange?: (tab: string, message?: string) => void;
}

const defaultDesign: LabelDesign = {
    id: crypto.randomUUID(),
    name: 'Artisan Collection 2025',
    productName: 'Mountain Wildflower',
    honeyType: 'Premium Raw',
    harvestYear: '2025',
    weight: '500',
    weightUnit: 'g',
    countryOfOrigin: 'Single Estate',
    country: 'Kenya',
    producer: 'BeeYield Premium Apiaries',
    address: 'Nanyuki Highlands, Box 15',
    marketingNote: 'Cold-extracted from native wildflowers in the shadow of Mount Kenya. 100% natural, unprocessed goodness.',

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

const honeyTypes = [
    'Wildflower', 'Acacia', 'Manuka', 'Clover', 'Orange Blossom',
    'Lavender', 'Buckwheat', 'Eucalyptus', 'Sage', 'Forest'
];

const certificationOptions = [
    { id: 'organic', label: 'Organic', icon: Hexagon },
    { id: 'fair-trade', label: 'Fair Trade', icon: Shield },
    { id: 'raw', label: 'Raw Honey', icon: Droplet },
    { id: 'premium', label: 'Premium', icon: Award }
];

const labelSizes = [
    { id: 'small', name: 'Small (50x30mm)', width: 50, height: 30 },
    { id: 'standard', name: 'Standard (70x50mm)', width: 70, height: 50 },
    { id: 'large', name: 'Large (100x70mm)', width: 100, height: 70 },
    { id: 'jar-wrap', name: 'Jar Wrap (150x40mm)', width: 150, height: 40 }
];

const LabelGeneratorView: React.FC<LabelGeneratorViewProps> = ({ onTabChange }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('design');
    const [design, setDesign] = useState<LabelDesign>(defaultDesign);
    const [savedDesigns, setSavedDesigns] = useState<LabelDesign[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [isLoadingHarvests, setIsLoadingHarvests] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingHarvests(true);
            try {
                const [harvestData, labelData] = await Promise.all([
                    beeyieldService.getHarvests(),
                    labelService.getLabels()
                ]);
                setHarvests(harvestData);
                setSavedDesigns(labelData);
            } catch (error) {
                console.error('Failed to load initial data', error);
                toast.error('Failed to load data');
            } finally {
                setIsLoadingHarvests(false);
            }
        };
        loadInitialData();
    }, []);

    const updateDesign = (updates: Partial<LabelDesign>) => {
        setDesign(prev => ({ ...prev, ...updates }));
    };

    const toggleCertification = (certId: string) => {
        const current = design.certifications;
        if (current.includes(certId)) {
            updateDesign({ certifications: current.filter(c => c !== certId) });
        } else {
            updateDesign({ certifications: [...current, certId] });
        }
    };

    const saveDesign = async () => {
        try {
            const saved = await labelService.saveLabel(design);
            // Update the local list
            const existingIndex = savedDesigns.findIndex(d => d.id === saved.id);
            if (existingIndex >= 0) {
                const updated = [...savedDesigns];
                updated[existingIndex] = saved;
                setSavedDesigns(updated);
            } else {
                setSavedDesigns([saved, ...savedDesigns]);
            }
            // Update current design state with the ID from DB
            setDesign(saved);
            toast.success('Label design saved to cloud!');
        } catch (error) {
            toast.error('Failed to save design');
        }
    };

    const loadDesign = (savedDesign: LabelDesign) => {
        setDesign(savedDesign);
        toast.success('Design loaded');
    };

    const createNewDesign = () => {
        setDesign({ ...defaultDesign, id: crypto.randomUUID() });
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

    const isChecklistValid = {
        name: design.productName.length > 0,
        weight: design.weight.length > 0 && parseFloat(design.weight) > 0,
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
        if (!isChecklistValid.name || !isChecklistValid.weight) {
            toast.error('Please complete the required fields first');
            return;
        }

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {t('label_generator_title') || 'Honey Label Generator'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('label_generator_subtitle') || 'Design and print professional honey jar labels'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={createNewDesign} className="gap-2 border-gray-200 dark:border-white/10">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Project</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveDesign} className="gap-2 border-gray-200 dark:border-white/10">
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Save Design</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleGeneratePDF}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-amber-500/20"
                    >
                        <Download className="w-4 h-4" />
                        {isGenerating ? 'Exporting...' : 'Export PDF'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel - Content Editor */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" />
                                Label Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-800/20 space-y-2">
                                <Label className="text-amber-900 dark:text-amber-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> Auto-fill from Harvest
                                </Label>
                                <Select onValueChange={handleHarvestSelect}>
                                    <SelectTrigger className="h-9 bg-white dark:bg-[#121212] text-xs border-amber-200/30">
                                        <SelectValue placeholder="Select a harvest..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {harvests.length > 0 ? harvests.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="text-xs">
                                                {h.batch_code || `Harvest ${h.harvest_date}`}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-gray-400">No harvests found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="productName" className="text-[11px] font-medium">Product Name*</Label>
                                    <Input
                                        id="productName"
                                        value={design.productName}
                                        onChange={e => updateDesign({ productName: e.target.value })}
                                        className="h-9 text-xs"
                                        placeholder="e.g. Mountain Wildflower"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="weight" className="text-[11px] font-medium">Weight*</Label>
                                        <Input
                                            id="weight"
                                            value={design.weight}
                                            onChange={e => updateDesign({ weight: e.target.value })}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="weightUnit" className="text-[11px] font-medium">Unit*</Label>
                                        <Input
                                            id="weightUnit"
                                            value={design.weightUnit}
                                            onChange={e => updateDesign({ weightUnit: e.target.value })}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="producer" className="text-[11px] font-medium">Producer/Apiary*</Label>
                                    <Input
                                        id="producer"
                                        value={design.producer}
                                        onChange={e => updateDesign({ producer: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address" className="text-[11px] font-medium">Location/Address*</Label>
                                    <Input
                                        id="address"
                                        value={design.address}
                                        onChange={e => updateDesign({ address: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="marketingNote" className="text-[11px] font-medium flex justify-between">
                                        <span>Marketing Blurb</span>
                                        <span className="text-[9px] text-gray-400">{design.marketingNote.length}/140</span>
                                    </Label>
                                    <textarea
                                        id="marketingNote"
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                        rows={3}
                                        maxLength={140}
                                        value={design.marketingNote}
                                        onChange={e => updateDesign({ marketingNote: e.target.value })}
                                        placeholder="Tell the story of this honey..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Plus className="w-4 h-4 text-amber-500" />
                                Details & QR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between group">
                                    <Label className="text-[11px] cursor-pointer" htmlFor="sw-batch">Include Batch #</Label>
                                    <Switch id="sw-batch" checked={design.showBatchNumber} onCheckedChange={v => updateDesign({ showBatchNumber: v })} />
                                </div>
                                {design.showBatchNumber && (
                                    <Input
                                        value={design.batchNumber}
                                        onChange={e => updateDesign({ batchNumber: e.target.value })}
                                        className="h-8 text-[11px] bg-gray-50/50 dark:bg-white/5"
                                        placeholder="LOT Number"
                                    />
                                )}

                                <div className="flex items-center justify-between group">
                                    <Label className="text-[11px] cursor-pointer" htmlFor="sw-date">Best Before Date</Label>
                                    <Switch id="sw-date" checked={design.showBestBefore} onCheckedChange={v => updateDesign({ showBestBefore: v })} />
                                </div>
                                {design.showBestBefore && (
                                    <Input
                                        type="date"
                                        value={design.bestBeforeDate}
                                        onChange={e => updateDesign({ bestBeforeDate: e.target.value })}
                                        className="h-8 text-[11px] bg-gray-50/50 dark:bg-white/5"
                                    />
                                )}

                                <div className="flex items-center justify-between group">
                                    <Label className="text-[11px] cursor-pointer" htmlFor="sw-qr">Traceability QR</Label>
                                    <Switch id="sw-qr" checked={design.showQRCode} onCheckedChange={v => updateDesign({ showQRCode: v })} />
                                </div>

                                <div className="flex items-center justify-between group">
                                    <Label className="text-[11px] cursor-pointer" htmlFor="sw-footer">System Footer</Label>
                                    <Switch id="sw-footer" checked={design.showFooter} onCheckedChange={v => updateDesign({ showFooter: v })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Middle Panel - Visual Designer */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] overflow-hidden shadow-xl ring-1 ring-black/5">
                        <div className="p-4 sm:p-12 flex items-center justify-center bg-gray-50 dark:bg-[#111] min-h-[500px] relative overflow-auto">
                            {/* Grid Background Effect */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                            <div
                                ref={previewRef}
                                className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col p-7 transition-all duration-500 ease-out hover:scale-[1.02]"
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
                                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none -mr-8 -mt-8 rotate-12">
                                    <Hexagon className="w-full h-full" stroke={design.accentColor} />
                                </div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-[0.15em] leading-tight" style={{ color: design.accentColor }}>
                                            {design.productName || 'Pure Honey'}
                                        </h2>
                                        <p className="text-[11px] font-medium tracking-wide uppercase opacity-80 mt-1">
                                            {design.honeyType} Collection
                                        </p>
                                    </div>
                                    {design.showLogo && (
                                        <div className="flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-lg p-2 border border-black/5">
                                            {design.logoUrl ? (
                                                <img
                                                    src={design.logoUrl}
                                                    alt="Logo"
                                                    style={{ height: `${28 * design.logoScale}px` }}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <Droplet className="w-5 h-5" style={{ color: design.accentColor }} />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex-1">
                                    <p className="text-[9px] leading-relaxed max-w-[80%] opacity-90">
                                        {design.marketingNote || 'A taste of nature in every drop.'}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3 relative z-10">
                                    <div className="flex justify-between items-end border-t pt-3" style={{ borderColor: `${design.accentColor}20` }}>
                                        <div className="text-[9px] space-y-0.5 font-medium leading-tight">
                                            {design.producer && <p className="font-bold uppercase tracking-tighter text-[10px]">{design.producer}</p>}
                                            {design.address && <p className="opacity-70">{design.address}</p>}
                                            {design.country && <p className="opacity-70">{design.country}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Net Weight</p>
                                            <p className="text-2xl font-black tabular-nums">{design.weight}{design.weightUnit}</p>
                                        </div>
                                    </div>

                                    {(design.showBatchNumber || design.showBestBefore) && (
                                        <div className="flex gap-4 text-[7px] uppercase tracking-wider font-bold opacity-60">
                                            {design.showBatchNumber && (
                                                <div>
                                                    <span className="opacity-60">LOT:</span> <span className="font-mono">{design.batchNumber}</span>
                                                </div>
                                            )}
                                            {design.showBestBefore && (
                                                <div>
                                                    <span className="opacity-60">EXP:</span> <span className="font-mono">{design.bestBeforeDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {design.showFooter && (
                                        <div className="text-[6px] text-center opacity-30 mt-1 flex items-center justify-center gap-1.5 uppercase tracking-[0.2em] font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: design.accentColor }} />
                                            BeeYield Traceability System • {design.harvestYear}
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: design.accentColor }} />
                                        </div>
                                    )}
                                </div>

                                {design.showQRCode && (
                                    <div className="absolute bottom-12 right-6 w-10 h-10 bg-white shadow-sm border border-black/5 flex items-center justify-center p-1.5 rounded-md">
                                        <Grid className="w-full h-full text-black/80" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Bottom Sections: Saved & Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                            <CardHeader>
                                <CardTitle className="text-lg">Validation and checklists</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Checklist</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isChecklistValid.name ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <ShieldCheck className="w-3 h-3" />
                                            </div>
                                            <span className={isChecklistValid.name ? 'text-gray-900' : 'text-gray-400'}>Provide honey name</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isChecklistValid.weight ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <ShieldCheck className="w-3 h-3" />
                                            </div>
                                            <span className={isChecklistValid.weight ? 'text-gray-900' : 'text-gray-400'}>Provide net weight</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg">My labels</CardTitle>
                                <Button variant="link" size="sm" onClick={createNewDesign} className="h-auto p-0 text-xs">New project</Button>
                            </CardHeader>
                            <CardContent>
                                {savedDesigns.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-gray-400">No saved designs</div>
                                ) : (
                                    <div className="space-y-3">
                                        {savedDesigns.map(saved => (
                                            <div key={saved.id} className="p-3 rounded-lg border bg-gray-50 dark:bg-white/5 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-bold">{saved.productName}</p>
                                                        <p className="text-[10px] text-gray-500">{saved.customWidth} x {saved.customHeight} mm</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => loadDesign(saved)} className="h-6 text-[10px]">Load</Button>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px]">Duplicate</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteDesign(saved.id)} className="h-6 text-[10px] text-red-500">Delete</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Panel - Style & Export */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Palette className="w-4 h-4 text-orange-500" />
                                Style Presets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-2">
                                {templates.map(tmp => (
                                    <button
                                        key={tmp.id}
                                        onClick={() => updateDesign({
                                            template: tmp.id,
                                            backgroundColor: tmp.color,
                                            textColor: tmp.id.includes('ink') ? '#FFFFFF' : '#2D241E',
                                            accentColor: tmp.id.includes('ink') ? '#F5A623' : tmp.color === '#FFF8E7' ? '#D97706' : '#8B4513'
                                        })}
                                        className={`group p-2 rounded-xl border-2 text-left transition-all ${design.template === tmp.id ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'border-gray-100 dark:border-white/5 hover:border-amber-200'}`}
                                    >
                                        <div className="aspect-[3/2] rounded-lg mb-2 shadow-sm flex flex-col p-2 space-y-1 overflow-hidden relative" style={{ backgroundColor: tmp.color }}>
                                            <div className="w-full h-1 bg-black/10 rounded-full" />
                                            <div className="w-2/3 h-1 bg-black/5 rounded-full" />
                                            <div className="mt-auto flex justify-between">
                                                <div className="w-4 h-4 bg-black/10 rounded-sm" />
                                                <div className="w-8 h-4 bg-black/10 rounded-sm" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold truncate leading-tight">{tmp.name}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Grid className="w-4 h-4 text-orange-500" />
                                Label Geometry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Width (mm)</Label>
                                    <Input value={design.customWidth} onChange={e => updateDesign({ customWidth: e.target.value })} className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase opacity-60">Height (mm)</Label>
                                    <Input value={design.customHeight} onChange={e => updateDesign({ customHeight: e.target.value })} className="h-8 text-xs" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Shape</Label>
                                <Select value={design.customShape} onValueChange={v => updateDesign({ customShape: v })}>
                                    <SelectTrigger className="h-8 text-xs">
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

                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-orange-500" />
                                Logo & Branding
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div
                                className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {design.logoUrl ? (
                                    <img src={design.logoUrl} alt="Logo" className="h-12 object-contain" />
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 text-gray-400 mb-1" />
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">Upload Brand Logo</p>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="outline" onClick={handlePrint} className="gap-2 h-11 border-gray-200 dark:border-white/10">
                    <Printer className="w-4 h-4" />
                    Print Labels
                </Button>
                <Button
                    variant="outline"
                    onClick={createNewDesign}
                    className="gap-2 h-11 border-gray-200 dark:border-white/10"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset Editor
                </Button>
            </div>
        </div>
    );
};

export default LabelGeneratorView;
