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
    name: 'New Label',
    productName: 'Lipowy', // Example from image
    honeyType: 'Wildflower',
    harvestYear: '2025',
    weight: '400',
    weightUnit: 'g',
    countryOfOrigin: 'Single country',
    country: 'Polska',
    producer: 'Pasieka Słoneczna',
    address: 'Krakow, ul. Miodowa 12',
    marketingNote: 'Zbiór z pasiek wsród lipowych alei.',

    showBatchNumber: true,
    batchNumber: 'LOT-0525',
    showBottlingDate: true,
    bottlingDate: '2025-06-01',
    showBestBefore: true,
    bestBeforeDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    showStorageConditions: true,
    storageConditions: 'Przechowywać w chłodnym miejscu.',
    showContact: true,
    contactInfo: 'Pasieka Słoneczna, +48 500 000 000',
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
    backgroundColor: '#FFF8E7',
    textColor: '#4A3728',
    accentColor: '#F5A623',
    borderStyle: 'elegant',

    exportFormat: 'PDF',
    exportDPI: '300',
    exportBleed: '3',
    showCropMarks: true,
    useA4Sheet: false,

    certifications: ['organic'],
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
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={createNewDesign} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Design
                    </Button>
                    <Button variant="outline" onClick={saveDesign} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save
                    </Button>
                    <Button
                        onClick={handleGeneratePDF}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                        <Download className="w-4 h-4" />
                        {isGenerating ? 'Generating...' : 'Export PDF'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel - Content Editor */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                        <CardHeader>
                            <CardTitle className="text-lg">Label data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 space-y-2">
                                <Label className="text-amber-900 dark:text-amber-100 text-xs font-medium flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> Link to Record
                                </Label>
                                <Select onValueChange={handleHarvestSelect}>
                                    <SelectTrigger className="h-8 bg-white dark:bg-[#1e1e1e] text-xs">
                                        <SelectValue placeholder="Select Record" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {harvests.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="text-xs">
                                                {h.batch_code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="productName" className="text-xs">Honey name / type*</Label>
                                    <Input id="productName" value={design.productName} onChange={e => updateDesign({ productName: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="harvestYear" className="text-xs">Harvest year (optional)</Label>
                                    <Input id="harvestYear" value={design.harvestYear} onChange={e => updateDesign({ harvestYear: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="weight" className="text-xs">Weight*</Label>
                                        <Input id="weight" value={design.weight} onChange={e => updateDesign({ weight: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="weightUnit" className="text-xs">Unit*</Label>
                                        <Input id="weightUnit" value={design.weightUnit} onChange={e => updateDesign({ weightUnit: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="countryOfOrigin" className="text-xs">Country of origin*</Label>
                                    <Input id="countryOfOrigin" value={design.countryOfOrigin} onChange={e => updateDesign({ countryOfOrigin: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="country" className="text-xs">Country*</Label>
                                    <Input id="country" value={design.country} onChange={e => updateDesign({ country: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="producer" className="text-xs">Producer / apiary*</Label>
                                    <Input id="producer" value={design.producer} onChange={e => updateDesign({ producer: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address" className="text-xs">Address / city*</Label>
                                    <Input id="address" value={design.address} onChange={e => updateDesign({ address: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="marketingNote" className="text-xs">Marketing note (max 140 chars)</Label>
                                    <textarea
                                        id="marketingNote"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        rows={3}
                                        maxLength={140}
                                        value={design.marketingNote}
                                        onChange={e => updateDesign({ marketingNote: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                        <CardHeader>
                            <CardTitle className="text-lg">Optional fields</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch checked={design.showBatchNumber} onCheckedChange={v => updateDesign({ showBatchNumber: v })} />
                                        <Label className="text-xs">Batch number (LOT)</Label>
                                    </div>
                                </div>
                                {design.showBatchNumber && (
                                    <Input value={design.batchNumber} onChange={e => updateDesign({ batchNumber: e.target.value })} />
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch checked={design.showBottlingDate} onCheckedChange={v => updateDesign({ showBottlingDate: v })} />
                                        <Label className="text-xs">Bottling date</Label>
                                    </div>
                                </div>
                                {design.showBottlingDate && (
                                    <Input type="date" value={design.bottlingDate} onChange={e => updateDesign({ bottlingDate: e.target.value })} />
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch checked={design.showBestBefore} onCheckedChange={v => updateDesign({ showBestBefore: v })} />
                                        <Label className="text-xs">Best before date</Label>
                                    </div>
                                </div>
                                {design.showBestBefore && (
                                    <Input type="date" value={design.bestBeforeDate} onChange={e => updateDesign({ bestBeforeDate: e.target.value })} />
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch checked={design.showStorageConditions} onCheckedChange={v => updateDesign({ showStorageConditions: v })} />
                                        <Label className="text-xs">Storage conditions</Label>
                                    </div>
                                </div>
                                {design.showStorageConditions && (
                                    <Input value={design.storageConditions} onChange={e => updateDesign({ storageConditions: e.target.value })} />
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch checked={design.showContact} onCheckedChange={v => updateDesign({ showContact: v })} />
                                        <Label className="text-xs">Contact / www</Label>
                                    </div>
                                </div>
                                {design.showContact && (
                                    <Input value={design.contactInfo} onChange={e => updateDesign({ contactInfo: e.target.value })} />
                                )}

                                <div className="flex items-center gap-2">
                                    <Switch checked={design.showQRCode} onCheckedChange={v => updateDesign({ showQRCode: v })} />
                                    <Label className="text-xs">QR code</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={design.showFooter} onCheckedChange={v => updateDesign({ showFooter: v })} />
                                    <Label className="text-xs">BeeHUB.app footer</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={design.showLogo} onCheckedChange={v => updateDesign({ showLogo: v })} />
                                    <Label className="text-xs">Show logo</Label>
                                </div>

                                {design.showLogo && (
                                    <div className="space-y-3 pt-2">
                                        <div
                                            className="w-full h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1e1e1e] cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {design.logoUrl ? (
                                                <img src={design.logoUrl} alt="Logo" className="h-16 object-contain" />
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                                    <p className="text-[10px] text-gray-400">Drop the logo or click to upload</p>
                                                    <p className="text-[8px] text-gray-500">PNG, JPG, SVG</p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <Label>Logo scale</Label>
                                                <span>{design.logoScale.toFixed(2)}x</span>
                                            </div>
                                            <Slider
                                                value={[design.logoScale]}
                                                min={0.1} max={2} step={0.1}
                                                onValueChange={v => updateDesign({ logoScale: v[0] })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Panel - Visual Designer & Templates */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Visual Preview */}
                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e] overflow-hidden">
                        <div className="p-8 flex justify-center bg-gray-100 dark:bg-[#111] min-h-[400px]">
                            <div
                                ref={previewRef}
                                className="bg-white shadow-2xl relative overflow-hidden flex flex-col p-8 transition-all duration-300"
                                style={{
                                    width: `${parseFloat(design.customWidth) * 4}px`,
                                    height: `${parseFloat(design.customHeight) * 4}px`,
                                    backgroundColor: design.backgroundColor,
                                    color: design.textColor,
                                    border: design.borderStyle === 'elegant' ? `4px double ${design.accentColor}` : 'none',
                                    borderRadius: design.customShape === 'Circle' ? '50%' : '8px'
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold uppercase tracking-widest" style={{ color: design.accentColor }}>{design.productName}</h2>
                                        <p className="text-sm italic">{design.honeyType} Honey</p>
                                    </div>
                                    {design.showLogo && design.logoUrl && (
                                        <img
                                            src={design.logoUrl}
                                            alt="Logo"
                                            style={{ height: `${24 * design.logoScale}px` }}
                                            className="object-contain"
                                        />
                                    )}
                                </div>

                                <div className="mt-auto space-y-2">
                                    <div className="flex justify-between items-end border-t pt-4" style={{ borderColor: `${design.textColor}20` }}>
                                        <div className="text-[10px] space-y-0.5">
                                            {design.producer && <p className="font-bold">{design.producer}</p>}
                                            {design.address && <p>{design.address}</p>}
                                            {design.country && <p>{design.country}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black">{design.weight}{design.weightUnit}</p>
                                        </div>
                                    </div>

                                    {(design.showBatchNumber || design.showBestBefore) && (
                                        <div className="grid grid-cols-2 gap-4 text-[8px] uppercase tracking-tighter opacity-70">
                                            {design.showBatchNumber && (
                                                <div>
                                                    <p>Batch / Partia:</p>
                                                    <p className="font-mono">{design.batchNumber}</p>
                                                </div>
                                            )}
                                            {design.showBestBefore && (
                                                <div>
                                                    <p>Best before / Najlepiej spożyć:</p>
                                                    <p className="font-mono">{design.bestBeforeDate}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {design.showFooter && (
                                        <div className="text-[6px] text-center opacity-40 mt-2">
                                            BeeYield Traceability System • {design.customWidth}x{design.customHeight}mm
                                        </div>
                                    )}
                                </div>

                                {design.showQRCode && (
                                    <div className="absolute top-8 right-8 w-12 h-12 bg-white border flex items-center justify-center p-1">
                                        <Grid className="w-full h-full text-black" />
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

                {/* Right Panel - Settings & Templates */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                        <CardHeader>
                            <CardTitle className="text-lg">Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {templates.map(tmp => (
                                    <button
                                        key={tmp.id}
                                        onClick={() => updateDesign({ template: tmp.id, backgroundColor: tmp.color })}
                                        className={`group p-2 rounded-lg border-2 text-left transition-all ${design.template === tmp.id ? 'border-amber-501 bg-amber-50 dark:bg-amber-900/10' : 'border-gray-100 hover:border-amber-200'}`}
                                    >
                                        <div className="aspect-[3/4] rounded bg-white border border-gray-200 mb-2 shadow-sm flex flex-col p-2 space-y-1">
                                            <div className="h-1 w-full rounded" style={{ backgroundColor: tmp.color }}></div>
                                            <div className="h-1 w-2/3 rounded bg-gray-100"></div>
                                            <div className="flex-1"></div>
                                            <div className="h-2 w-full rounded bg-gray-50"></div>
                                        </div>
                                        <p className="text-[10px] font-bold truncate">{tmp.name}</p>
                                        <p className="text-[8px] text-gray-500 line-clamp-2 leading-tight mt-0.5">{tmp.description}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                        <CardHeader>
                            <CardTitle className="text-lg">Label size</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">500 g</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={() => updateDesign({ customWidth: '99.1', customHeight: '57' })}>99.1 x 57 mm</Button>
                                    <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={() => updateDesign({ customWidth: '100', customHeight: '50' })}>100 x 50 mm</Button>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">250 g</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={() => updateDesign({ customWidth: '50', customHeight: '37' })}>50 x 37 mm</Button>
                                    <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={() => updateDesign({ customWidth: '125', customHeight: '35' })}>125 x 35 mm</Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-gray-400 uppercase">Custom size</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Width (mm)*</Label>
                                        <Input value={design.customWidth} onChange={e => updateDesign({ customWidth: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Height (mm)*</Label>
                                        <Input value={design.customHeight} onChange={e => updateDesign({ customHeight: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Shape*</Label>
                                    <Select value={design.customShape} onValueChange={v => updateDesign({ customShape: v })}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Rectangle">Rectangle</SelectItem>
                                            <SelectItem value="Circle">Circle</SelectItem>
                                            <SelectItem value="Oval">Oval</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1e1e1e]">
                        <CardHeader>
                            <CardTitle className="text-lg">Export</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px]">Format</Label>
                                <Select value={design.exportFormat} onValueChange={v => updateDesign({ exportFormat: v })}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDF">PDF</SelectItem>
                                        <SelectItem value="PNG">PNG Image</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px]">DPI</Label>
                                    <Input value={design.exportDPI} onChange={e => updateDesign({ exportDPI: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Bleed (mm)</Label>
                                    <Input value={design.exportBleed} onChange={e => updateDesign({ exportBleed: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <Switch checked={design.showCropMarks} onCheckedChange={v => updateDesign({ showCropMarks: v })} />
                                    <Label className="text-[10px]">Crop marks (PDF)</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={design.useA4Sheet} onCheckedChange={v => updateDesign({ useA4Sheet: v })} />
                                    <Label className="text-[10px]">A4 sheet</Label>
                                </div>
                            </div>
                            <Button className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 transition-transform font-bold" onClick={handleGeneratePDF}>
                                Export
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                </Button>
                <Button
                    variant="outline"
                    onClick={createNewDesign}
                    className="gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default LabelGeneratorView;
