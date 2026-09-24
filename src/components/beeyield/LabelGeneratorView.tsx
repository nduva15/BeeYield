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
import QRCode from 'qrcode';

const EMPTY_APIARIES: any[] = [];
const EMPTY_HIVES: any[] = [];
const EMPTY_HARVESTS: any[] = [];
import beeyieldService from '@/services/beeyieldService';
import { labelService, LabelDesign as ILabelDesign } from '@/services/labelService';
import { Loader2 } from 'lucide-react';
import { glass, GlassStatCard } from './GlassTheme';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useHarvests } from '@/hooks/useHarvests';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BeeYieldCard,
    BeeYieldFormField,
    BeeYieldPageHeader,
    BeeYieldPageShell,
    BeeYieldTextInput,
} from '@/components/beeyield/BeeYieldUI';
import BEEYIELD_LOGO from '@/assets/Logo.png';


const SIZE_PRESETS = [
    { label: '500g Jar (99×57mm)', width: '99.1', height: '57', shape: 'Rectangle' },
    { label: '250g Jar (80×50mm)', width: '80', height: '50', shape: 'Rectangle' },
    { label: '1kg Tub (120×75mm)', width: '120', height: '75', shape: 'Rectangle' },
    { label: 'Round Lid (60×60mm)', width: '60', height: '60', shape: 'Circle' },
];

// Types for local use
interface Apiary {
    id: string;
    name: string;
    location_name?: string | null;
    country?: string | null;
}

interface Harvest {
    id: string;
    batch_code?: string;
    honey_type?: string;
    harvest_date?: string;
    quantity_kg?: number;
    hive_id?: string;
    apiary_id?: string;
    hive?: { id?: string };
    apiary?: {
        id?: string;
        location_name?: string;
    };
    farmer?: {
        name?: string;
    };
}

interface Hive {
    id: string;
    hive_code: string;
    apiary_id?: string;
    apiary_name?: string;
    apiary?: {
        id?: string;
        name?: string;
        location_name?: string;
        country?: string;
    };
}

interface LabelPack {
    product_name: string;
    short_blurb: string;
    long_story: string;
    tasting_notes: string[];
    origin: string;
    harvest_date_range: string;
    sustainability_claims: string[];
    pairings: string[];
    allergen_notes: string;
    qr_landing_copy: string;
    tone: string;
}

interface LabelDesign extends Omit<ILabelDesign, 'id'> {
    id: string;
    harvestId?: string;
    hiveId?: string;
    apiaryId?: string;
    traceUrl?: string;
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
    harvestId: '',
    hiveId: '',
    apiaryId: '',
    traceUrl: '',
    name: 'New Label Design',
    productName: 'Raw Wildflower Honey',
    honeyType: 'Pure Floral Honey',
    harvestYear: new Date().getFullYear().toString(),
    weight: '500',
    weightUnit: 'g',
    countryOfOrigin: 'Kenya',
    country: 'Kenya',
    producer: 'BeeYield Artisan Apiaries',
    address: 'Rift Valley Highlands',
    marketingNote: 'Cold-extracted from native floral sources. 100% natural goodness.',

    showBatchNumber: true,
    batchNumber: 'BEE-2026-001',
    showBottlingDate: true,
    bottlingDate: new Date().toISOString().split('T')[0],
    showBestBefore: true,
    bestBeforeDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    showStorageConditions: true,
    storageConditions: 'Store in a cool, dry place away from direct sunlight.',
    showContact: true,
    contactInfo: 'www.beeyield.com • hello@beeyield.com',
    showQRCode: true,
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
    const [isSavingDesign, setIsSavingDesign] = React.useState(false);
    const { data: apiariesData } = useApiaries();
    const { data: hivesData } = useHives();
    const { data: harvestsData } = useHarvests();

    const apiaries = (apiariesData as any[]) ?? EMPTY_APIARIES;
    const hives = hivesData ?? EMPTY_HIVES;
    const harvests = harvestsData ?? EMPTY_HARVESTS;

    const [honeyBatches, setHoneyBatches] = React.useState<any[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('');
    const [selectedHarvestId, setSelectedHarvestId] = React.useState<string>('');
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [isGeneratingBlurb, setIsGeneratingBlurb] = React.useState(false);
    const [labelPack, setLabelPack] = React.useState<LabelPack | null>(null);
    const [qrDataUrl, setQrDataUrl] = React.useState<string>('');

    // Refs
    const previewRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const upsertSavedDesign = (saved: LabelDesign) => {
        setSavedDesigns(prev => {
            const existingIndex = prev.findIndex(item => item.id === saved.id);
            if (existingIndex >= 0) {
                return prev.map(item => item.id === saved.id ? saved : item);
            }
            return [saved, ...prev];
        });
    };

    React.useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch traceability data not stored in standard react-query cache
                const batchData = await beeyieldService.getBatches();
                setHoneyBatches(batchData);
                console.log('[LabelGen] Loaded:', batchData.length, 'traceability batches');

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

    const isPersistedDesign = React.useMemo(
        () => savedDesigns.some(saved => saved.id === design.id),
        [savedDesigns, design.id]
    );

    const normalizedDesignName = React.useMemo(() => {
        const designName = (design.name || '').trim();
        if (designName) {
            return designName;
        }
        const fallbackName = (design.productName || '').trim();
        return fallbackName || 'Untitled Label';
    }, [design.name, design.productName]);

    const copyToClipboard = async (label: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied", { description: label });
        } catch {
            toast.error("Copy failed");
        }
    };

    // Modern QR: generate a high-quality PNG data URL for preview with traceability batch
    React.useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!design.showQRCode) {
                setQrDataUrl('');
                return;
            }
            const batch = (design.batchNumber || 'BEE-20260105-001').trim();
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.beeyield.com';
            const traceUrl = design.traceUrl?.trim()?.startsWith('http')
                ? design.traceUrl.trim()
                : `${origin}/traceability?code=${encodeURIComponent(batch)}`;
            
            // Persist for save/load consistency
            if (traceUrl !== design.traceUrl) updateDesign({ traceUrl });
            try {
                const url = await QRCode.toDataURL(traceUrl, {
                    errorCorrectionLevel: 'H',
                    margin: 1,
                    width: 512,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });
                if (!cancelled) setQrDataUrl(url);
            } catch (e) {
                if (!cancelled) setQrDataUrl('');
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [design.showQRCode, design.batchNumber, design.traceUrl]);

    const saveDesign = async () => {
        setIsSavingDesign(true);
        try {
            const payload: LabelDesign = {
                ...design,
                name: normalizedDesignName,
            };
            const saved = isPersistedDesign
                ? await labelService.updateLabel(design.id, payload)
                : await labelService.createLabel(payload);

            upsertSavedDesign(saved as LabelDesign);
            setDesign(saved as LabelDesign);
            toast.success(isPersistedDesign ? `Updated "${saved.name}" successfully!` : `Saved "${saved.name}" successfully!`);
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(error?.message || 'Failed to save design');
        } finally {
            setIsSavingDesign(false);
        }
    };

    const saveAsNewCopy = async () => {
        setIsSavingDesign(true);
        try {
            const newId = (globalThis.crypto as any)?.randomUUID?.() || `label-${Date.now()}`;
            const payload: LabelDesign = {
                ...design,
                id: newId,
                name: `${normalizedDesignName} (Copy)`,
            };
            const saved = await labelService.createLabel(payload);
            upsertSavedDesign(saved as LabelDesign);
            setDesign(saved as LabelDesign);
            toast.success(`Saved copy as "${saved.name}"`);
        } catch (error: any) {
            console.error('Save copy failed:', error);
            toast.error(error?.message || 'Failed to duplicate design');
        } finally {
            setIsSavingDesign(false);
        }
    };

    const loadDesign = async (savedDesign: LabelDesign) => {
        try {
            const latestDesign = await labelService.getLabel(savedDesign.id);
            setDesign(latestDesign as LabelDesign);
            setSelectedApiaryId(latestDesign.apiaryId || '');
            setSelectedHiveId(latestDesign.hiveId || '');
            setSelectedHarvestId(latestDesign.harvestId || '');
            upsertSavedDesign(latestDesign as LabelDesign);
            toast.success(`Loaded "${latestDesign.name}"`);
        } catch (error) {
            console.error('Load failed:', error);
            setDesign(savedDesign);
            setSelectedApiaryId(savedDesign.apiaryId || '');
            setSelectedHiveId(savedDesign.hiveId || '');
            setSelectedHarvestId(savedDesign.harvestId || '');
            toast.info(`Loaded "${savedDesign.name}"`);
        }
    };

    const createNewDesign = () => {
        setDesign({ ...defaultDesign, id: (globalThis.crypto as any)?.randomUUID?.() || `label-${Date.now()}` });
        setSelectedApiaryId('');
        setSelectedHiveId('');
        setSelectedHarvestId('');
        setLabelPack(null);
        toast.info('Created new design template');
    };

    const deleteDesign = async (designId: string) => {
        if (!window.confirm('Are you sure you want to delete this saved label design?')) {
            return;
        }
        try {
            await labelService.deleteLabel(designId);
            setSavedDesigns(prev => prev.filter(d => d.id !== designId));
            if (design.id === designId) {
                createNewDesign();
            }
            toast.success('Label design deleted successfully');
        } catch (error: any) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete design');
        }
    };

    
    // Auto-select first apiary and hive when available
    React.useEffect(() => {
        if (apiaries.length > 0 && !selectedApiaryId) {
            const firstAp = apiaries[0];
            setSelectedApiaryId(firstAp.id);
            const matchingHives = hives.filter(h => (h.apiary_id || h.apiary?.id) === firstAp.id);
            if (matchingHives.length > 0) {
                const firstH = matchingHives[0];
                setSelectedHiveId(firstH.id);
            }
        }
    }, [apiaries, hives, selectedApiaryId]);

    const filteredHives = React.useMemo(() => {
        if (!selectedApiaryId) return hives;
        return hives.filter((h) => (h.apiary_id || h.apiary?.id) === selectedApiaryId);
    }, [hives, selectedApiaryId]);

    const filteredHarvests = React.useMemo(() => {
        if (!selectedHiveId) return [];
        return harvests.filter((h) => (h.hive_id || h.hive?.id) === selectedHiveId);
    }, [harvests, selectedHiveId]);

    // Build batch options by merging harvest batch_codes with honey_batches.
    // Link honey_batches to hives via matching batch_code in harvests.
    const batchOptions = React.useMemo(() => {
        const seen = new Set<string>();
        const result: string[] = [];

        // 1. Batch codes from harvests for this hive (direct link)
        for (const h of filteredHarvests) {
            const code = (h.batch_code || '').trim();
            if (code && !seen.has(code)) {
                seen.add(code);
                result.push(code);
            }
        }

        // 2. Also include honey_batches that match any harvest for this hive
        if (selectedHiveId) {
            const hiveHarvestBatchCodes = new Set(
                harvests
                    .filter(h => (h.hive_id || h.hive?.id) === selectedHiveId)
                    .map(h => (h.batch_code || '').trim())
                    .filter(Boolean)
            );
            for (const b of honeyBatches) {
                const code = (b.batch_code || '').trim();
                if (code && !seen.has(code) && hiveHarvestBatchCodes.has(code)) {
                    seen.add(code);
                    result.push(code);
                }
            }
        }

        return result.sort((a, b) => a.localeCompare(b));
    }, [filteredHarvests, honeyBatches, selectedHiveId, harvests]);

    const filteredHarvestsByBatch = React.useMemo(() => {
        const batch = (design.batchNumber || '').trim();
        if (!batch) return [];
        // Search all harvests (not just filteredHarvests) since batch may have been selected from honey_batches
        return harvests.filter((h) => (h.batch_code || '').trim() === batch);
    }, [harvests, design.batchNumber]);

    const handleApiarySelect = (apiaryId: string) => {
        setSelectedApiaryId(apiaryId);
        setSelectedHiveId('');
        setSelectedHarvestId('');

        updateDesign({
            apiaryId,
            hiveId: '',
            harvestId: '',
            batchNumber: 'BEE-20260105-001',
            traceUrl: '',
        });

        const apiary = apiaries.find((a) => a.id === apiaryId);
        toast.success(apiary ? `Apiary selected: ${apiary.name}` : 'Apiary selected');
    };

    const handleHarvestSelect = (harvestId: string) => {
        const harvest = harvests.find(h => h.id === harvestId);
        if (harvest) {
            const batch = (harvest as any).batch_code || design.batchNumber;
            const apiaryId = (harvest as any).apiary?.id || (harvest as any).apiary_id || design.apiaryId;
            const hiveId = (harvest as any).hive?.id || (harvest as any).hive_id || design.hiveId;
            updateDesign({
                harvestId: harvest.id,
                apiaryId,
                hiveId,
                batchNumber: batch,
                traceUrl: batch ? `/traceability?code=${encodeURIComponent(batch)}` : design.traceUrl,
                honeyType: harvest.honey_type || design.honeyType,
                harvestYear: harvest.harvest_date ? new Date(harvest.harvest_date).getFullYear().toString() : design.harvestYear,
                country: harvest.apiary?.location_name || design.country,
                producer: harvest.farmer?.name || design.producer,
                bestBeforeDate: harvest.harvest_date
                    ? new Date(new Date(harvest.harvest_date).setFullYear(new Date(harvest.harvest_date).getFullYear() + 2)).toISOString().split('T')[0]
                    : design.bestBeforeDate
            });
            setSelectedHarvestId(harvest.id);
            if (apiaryId && apiaryId !== selectedApiaryId) setSelectedApiaryId(apiaryId);
            if (hiveId && hiveId !== selectedHiveId) setSelectedHiveId(hiveId);
            toast.success('Label linked to harvest data');
        }
    };

    const handleBatchSelect = (batchCode: string) => {
        const batch = (batchCode || '').trim();
        updateDesign({
            batchNumber: batch,
            traceUrl: batch ? `/traceability?code=${encodeURIComponent(batch)}` : '',
            harvestId: '',
        });
        setSelectedHarvestId('');

        // Auto-fill from honey_batches record (richer data)
        const honeyBatch = honeyBatches.find(b => (b.batch_code || '').trim() === batch);
        if (honeyBatch) {
            const updates: Partial<LabelDesign> = {};
            if (honeyBatch.honey_type) updates.honeyType = honeyBatch.honey_type;
            if (honeyBatch.farmer_name) updates.producer = honeyBatch.farmer_name;
            if (honeyBatch.location_county) updates.country = `${honeyBatch.location_region || ''}, ${honeyBatch.location_county}`.replace(/^, /, '');
            if (honeyBatch.quantity_kg) updates.weight = String(honeyBatch.quantity_kg);
            if (honeyBatch.harvest_date) {
                updates.harvestYear = new Date(honeyBatch.harvest_date).getFullYear().toString();
                updates.bestBeforeDate = new Date(new Date(honeyBatch.harvest_date).setFullYear(new Date(honeyBatch.harvest_date).getFullYear() + 2)).toISOString().split('T')[0];
            }
            if (honeyBatch.quality_grade) updates.marketingNote = `Grade ${honeyBatch.quality_grade} • ${honeyBatch.processing_method || 'Cold Extraction'} • ${honeyBatch.honey_type || 'Pure Honey'}`;
            if (honeyBatch.apiary_name) updates.address = honeyBatch.apiary_name;
            updateDesign(updates);
        }

        // If this batch exists for the selected hive, auto-link the most recent harvest record.
        const allMatchingHarvests = harvests
            .filter((h) => (h.batch_code || '').trim() === batch)
            .sort((a, b) => {
                const da = a.harvest_date ? new Date(a.harvest_date).getTime() : 0;
                const db = b.harvest_date ? new Date(b.harvest_date).getTime() : 0;
                return db - da;
            });

        const matching = allMatchingHarvests[0];
        if (matching) {
            setSelectedHarvestId(matching.id);
            updateDesign({ harvestId: matching.id });
        }
    };

    const handleHiveSelect = (hiveId: string) => {
        const hive = hives.find(h => h.id === hiveId);
        if (hive) {
            const apiary = (hive as any).apiary || {};

            updateDesign({
                hiveId: hive.id,
                apiaryId: apiary.id || (hive as any).apiary_id || design.apiaryId,
                country: apiary.location_name || apiary.country || design.country,
                producer: apiary.name ? `${apiary.name} (Hive ${hive.hive_code})` : design.producer,
            });

            const nextApiaryId = apiary.id || (hive as any).apiary_id || hive.apiary_id || '';
            if (nextApiaryId && nextApiaryId !== selectedApiaryId) setSelectedApiaryId(nextApiaryId);
            setSelectedHiveId(hive.id);
            setSelectedHarvestId('');
            updateDesign({ harvestId: '', batchNumber: 'BEE-20260105-001', traceUrl: '' });

            toast.success(`Linked to Hive ${hive.hive_code}`);
        }
    }

    const generateBlurb = async () => {
        setIsGeneratingBlurb(true);
        try {
            const pack = await beeyieldService.generateLabelPack({
                floral_type: design.honeyType,
                location: design.country,
                harvest_year: design.harvestYear,
                product_name: design.productName,
                tone: 'luxury',
            });
            setLabelPack(pack);
            updateDesign({
                marketingNote: pack.short_blurb || design.marketingNote,
                productName: pack.product_name || design.productName,
            });
            toast.success('Label pack generated!', { description: 'Structured copy ready to use.' });
        } catch (e) {
            console.error(e);
            toast.error('Could not generate label pack.');
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
        <BeeYieldPageShell>
            {/* Header Section */}
            <BeeYieldPageHeader
                icon={Tag}
                label="Labels"
                title="Label Systems"
                subtitle="Create and export product labels."
                actions={
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={createNewDesign} 
                            className={cn(glass.btnSecondary, "h-9 px-4 rounded-xl")}
                        >
                            <Plus className="w-3.5 h-3.5 text-[#F4D03F]" />
                            <span>New label</span>
                        </button>
                        <button
                            onClick={saveDesign}
                            disabled={isSavingDesign}
                            className={cn(glass.btnSecondary, "h-9 px-4 rounded-xl")}
                            title={isPersistedDesign ? "Update existing design" : "Save as new design"}
                        >
                            {isSavingDesign ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F4D03F]" /> : <Save className="w-3.5 h-3.5 text-[#F4D03F]" />}
                            <span>{isSavingDesign ? 'Saving…' : (isPersistedDesign ? 'Update design' : 'Save design')}</span>
                        </button>
                        {isPersistedDesign && (
                            <button
                                onClick={saveAsNewCopy}
                                disabled={isSavingDesign}
                                className={cn(glass.btnSecondary, "h-9 px-4 rounded-xl")}
                                title="Duplicate this design as a new entry"
                            >
                                <Copy className="w-3.5 h-3.5 text-[#F4D03F]" />
                                <span>Save copy</span>
                            </button>
                        )}
                        <button
                            onClick={handleGeneratePDF}
                            disabled={isGenerating}
                            className={cn(glass.btnPrimary, "h-9 px-6 rounded-xl")}
                        >
                            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span>{isGenerating ? 'Exporting…' : 'Export PDF'}</span>
                        </button>
                    </div>
                }
            />

            {/* Quick Stats - Matching Inspections Page Ledger Aesthetics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Total labels</span>
                        <Tag className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-amber-500">{savedDesigns.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Packaging compliance</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-emerald-500">
                        {design.productName && design.weight && design.batchNumber ? "100%" : "85%"}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Active batch</span>
                        <Grid className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="mt-2 font-display text-lg sm:text-2xl font-bold text-foreground truncate font-mono">
                        {design.batchNumber || "BEE-2026-001"}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Print resolution</span>
                        <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-blue-500">300 DPI</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Panel - Content Editor */}
                <div className="lg:col-span-1 space-y-6">
                    <BeeYieldCard padded={false}>
                        <div className={glass.sectionHeader}>
                             <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className={glass.sectionTitle}>Label content</h3>
                             </div>
                        </div>
                        <div className="p-5 space-y-6">
                            {/* Location Selector */}
                            <div className="space-y-2.5">
                                <Label className={glass.microLabel}>Location</Label>
                                <Select value={selectedApiaryId} onValueChange={handleApiarySelect}>
                                    <SelectTrigger className={cn(glass.select, "w-full")}>
                                        <SelectValue placeholder="Select a location…" />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {apiaries.length > 0 ? apiaries.map(a => (
                                            <SelectItem key={a.id} value={a.id} className="font-black text-[10px]">
                                                {a.name}{a.location_name ? ` — ${a.location_name}` : ''}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-muted-foreground/70 font-black">No locations yet</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Hive Selector */}
                            <div className="space-y-2.5">
                                <Label className={glass.microLabel}>Hive</Label>
                                <Select value={selectedHiveId} onValueChange={handleHiveSelect}>
                                    <SelectTrigger className={cn(glass.select, "w-full")}>
                                        <SelectValue placeholder="Select a hive…" />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {filteredHives.length > 0 ? filteredHives.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="font-black text-[10px]">
                                                {h.hive_code} {h.apiary_name ? `- ${h.apiary_name}` : ''}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-muted-foreground/70 font-black">
                                                {selectedApiaryId ? 'No hives in this location' : 'Select a location first'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Batch (required before harvest) */}
                            <div className="space-y-2.5">
                                <Label className={glass.microLabel}>Batch</Label>
                                <Select value={(design.batchNumber || '').trim()} onValueChange={handleBatchSelect}>
                                    <SelectTrigger className={cn(glass.select, "w-full")} disabled={!selectedHiveId}>
                                        <SelectValue placeholder={selectedHiveId ? "Select a batch…" : "Select a hive first"} />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {batchOptions.length > 0 ? batchOptions.map((code) => (
                                            <SelectItem key={code} value={code} className="font-black text-[10px]">
                                                {code}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-muted-foreground/70 font-black">
                                                {selectedHiveId ? 'No batches for this hive' : 'Select a hive first'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Harvest (linked to hive + batch) */}
                            <div className="space-y-2.5">
                                <Label className={glass.microLabel}>Harvest</Label>
                                <Select value={selectedHarvestId} onValueChange={handleHarvestSelect}>
                                    <SelectTrigger
                                        className={cn(glass.select, "w-full")}
                                        disabled={!selectedHiveId || !(design.batchNumber || '').trim() || filteredHarvestsByBatch.length === 0}
                                    >
                                        <SelectValue
                                            placeholder={
                                                !selectedHiveId
                                                    ? "Select a hive first"
                                                    : !(design.batchNumber || '').trim()
                                                        ? "Select a batch first"
                                                        : filteredHarvestsByBatch.length === 0
                                                            ? "No harvests for this batch"
                                                            : "Select a harvest"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {filteredHarvestsByBatch.length > 0 ? filteredHarvestsByBatch.map(h => (
                                            <SelectItem key={h.id} value={h.id} className="font-semibold text-[12px]">
                                                {h.harvest_date ? new Date(h.harvest_date).toLocaleDateString() : 'No date'} {h.quantity_kg ? `• ${h.quantity_kg} kg` : ''} {h.batch_code ? `• ${h.batch_code}` : ''}
                                            </SelectItem>
                                        )) : (
                                            <div className="p-2 text-center text-[10px] text-muted-foreground/70 font-black">
                                                {!selectedHiveId ? 'Select a hive first' : !(design.batchNumber || '').trim() ? 'Select a batch first' : 'No harvests for this batch'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Harvest History (per Hive) */}
                            <div className={cn(glass.card, "p-4 bg-muted/30 border border-border/60")}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#F4D03F]/70" />
                                        <p className="text-[12px] font-semibold text-foreground/70">
                                            Harvest history
                                        </p>
                                    </div>
                                    <Badge className="bg-muted/30 border border-border/60 text-foreground font-semibold text-[11px]">
                                        {selectedHiveId ? `${filteredHarvestsByBatch.length}` : '—'}
                                    </Badge>
                                </div>

                                {!selectedHiveId ? (
                                    <div className="text-[12px] text-muted-foreground font-semibold text-center py-4">
                                        Select a hive to view history
                                    </div>
                                ) : !(design.batchNumber || '').trim() ? (
                                    <div className="text-[12px] text-muted-foreground font-semibold text-center py-4">
                                        Select a batch to view history
                                    </div>
                                ) : filteredHarvestsByBatch.length === 0 ? (
                                    <div className="text-[12px] text-muted-foreground font-semibold text-center py-4">
                                        No harvests for this batch
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredHarvestsByBatch.slice(0, 6).map((h) => {
                                            const label = h.batch_code || (h.harvest_date ? `Batch ${h.harvest_date}` : `Harvest ${h.id.slice(0, 6)}`);
                                            const date = h.harvest_date ? new Date(h.harvest_date).toLocaleDateString() : '';
                                            const kg = typeof h.quantity_kg === 'number' ? `${h.quantity_kg.toFixed(1)}kg` : '';
                                            const isActive = selectedHarvestId === h.id;
                                            return (
                                                <button
                                                    key={h.id}
                                                    type="button"
                                                    onClick={() => handleHarvestSelect(h.id)}
                                                    className={cn(
                                                        "w-full text-left rounded-xl px-3 py-2 border transition-all flex items-center justify-between",
                                                        isActive
                                                            ? "bg-[#F4D03F]/10 border-border/60"
                                                            : "bg-muted/30 border-border/60 hover:bg-muted/30 hover:border-border/60"
                                                    )}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-[12px] font-semibold text-foreground truncate">
                                                            {label}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                            {date}{kg ? ` • ${kg}` : ''}
                                                        </p>
                                                    </div>
                                                    <div className={cn(
                                                        "shrink-0 w-8 h-8 rounded-xl grid place-items-center border",
                                                        isActive ? "bg-[#F4D03F] border-[#F4D03F] text-black" : "bg-muted/30 border-border/60 text-gray-700"
                                                    )}>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gradient-to-r from-[#F4D03F]/20 to-transparent" />

                            <div className="space-y-4">
                                <BeeYieldFormField id="by_label_design_name" label="Design name" hint="Used to organize your saved label layouts">
                                    <BeeYieldTextInput
                                        id="by_label_design_name"
                                        value={design.name}
                                        onChange={e => updateDesign({ name: e.target.value })}
                                        placeholder="e.g. Retail jar label v1"
                                    />
                                </BeeYieldFormField>

                                <BeeYieldFormField id="by_label_product_name" label="Product name" hint="What you want printed on the label">
                                    <BeeYieldTextInput
                                        id="by_label_product_name"
                                        value={design.productName}
                                        onChange={e => updateDesign({ productName: e.target.value })}
                                        placeholder="e.g. Wildflower Honey"
                                    />
                                </BeeYieldFormField>

                                <div className="grid grid-cols-2 gap-3">
                                    <BeeYieldFormField id="by_label_weight" label="Weight">
                                        <BeeYieldTextInput
                                            id="by_label_weight"
                                            value={design.weight}
                                            onChange={e => updateDesign({ weight: e.target.value })}
                                        />
                                    </BeeYieldFormField>
                                    <BeeYieldFormField id="by_label_weight_unit" label="Unit">
                                        <BeeYieldTextInput
                                            id="by_label_weight_unit"
                                            value={design.weightUnit}
                                            onChange={e => updateDesign({ weightUnit: e.target.value })}
                                        />
                                    </BeeYieldFormField>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className={glass.microLabel}>Product story</Label>
                                        <button
                                            className="h-7 px-2.5 rounded-lg bg-[#F4D03F]/10 border border-border/60 text-xs font-semibold text-[#D4AC0D] flex items-center gap-1.5 hover:bg-[#F4D03F]/20 transition-all"
                                            onClick={generateBlurb}
                                            disabled={isGeneratingBlurb}
                                        >
                                            {isGeneratingBlurb ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                            <span>Generate</span>
                                        </button>
                                    </div>
                                    <textarea
                                        className={cn(glass.input, "w-full py-2.5 min-h-[100px] resize-none")}
                                        maxLength={180}
                                        value={design.marketingNote}
                                        onChange={e => updateDesign({ marketingNote: e.target.value })}
                                        placeholder="Write a short product story…"
                                    />
                                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                                        <span>Character limit</span>
                                        <span className={cn(design.marketingNote.length > 160 ? "text-[#F4D03F]" : "")}>{design.marketingNote.length}/180</span>
                                    </div>
                                </div>

                                {labelPack && (
                                    <div className={cn(glass.card, "p-4 bg-muted/30 border border-border/60")}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-[#F4D03F]/70" />
                                                <p className="text-[10px] font-black text-foreground/70">
                                                    Label pack
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard("Full label pack (JSON)", JSON.stringify(labelPack, null, 2))}
                                                className="h-8 px-3 rounded-lg bg-muted/30 border border-border/60 text-sm font-semibold flex items-center gap-1.5 hover:bg-white transition-all text-foreground"
                                            >
                                                <Copy className="w-3 h-3" />
                                                Copy JSON
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { k: "Short blurb", v: labelPack.short_blurb },
                                                { k: "Long story", v: labelPack.long_story },
                                                { k: "Origin", v: labelPack.origin },
                                                { k: "Harvest window", v: labelPack.harvest_date_range },
                                                { k: "Allergen notes", v: labelPack.allergen_notes },
                                                { k: "QR landing copy", v: labelPack.qr_landing_copy },
                                            ].map((row) => (
                                                <div key={row.k} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-foreground/60">
                                                                {row.k}
                                                            </p>
                                                            <p className="text-[11px] font-semibold text-foreground whitespace-pre-wrap mt-1 leading-relaxed">
                                                                {row.v}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(row.k, row.v)}
                                                            className="shrink-0 w-9 h-9 rounded-xl bg-white border border-border/60 hover:border-border/60 hover:bg-[#F4D03F]/5 transition-all grid place-items-center"
                                                            aria-label={`Copy ${row.k}`}
                                                            title={`Copy ${row.k}`}
                                                        >
                                                            <Copy className="w-4 h-4 text-foreground/60" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-[9px] font-black text-foreground/60">Tasting notes</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard("Tasting notes", (labelPack.tasting_notes || []).join("\n"))}
                                                            className="h-7 px-2.5 rounded-lg bg-white border border-border/60 hover:border-border/60 hover:bg-[#F4D03F]/5 transition-all text-[9px] font-black flex items-center gap-1.5"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            COPY
                                                        </button>
                                                    </div>
                                                    <ul className="mt-2 space-y-1">
                                                        {(labelPack.tasting_notes || []).map((n, idx) => (
                                                            <li key={idx} className="text-[11px] font-semibold text-foreground/80">- {n}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-[9px] font-black text-foreground/60">Sustainability claims</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard("Sustainability claims", (labelPack.sustainability_claims || []).join("\n"))}
                                                            className="h-7 px-2.5 rounded-lg bg-white border border-border/60 hover:border-border/60 hover:bg-[#F4D03F]/5 transition-all text-[9px] font-black flex items-center gap-1.5"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            COPY
                                                        </button>
                                                    </div>
                                                    <ul className="mt-2 space-y-1">
                                                        {(labelPack.sustainability_claims || []).map((n, idx) => (
                                                            <li key={idx} className="text-[11px] font-semibold text-foreground/80">- {n}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-[9px] font-black text-foreground/60">Pairings</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard("Pairings", (labelPack.pairings || []).join("\n"))}
                                                            className="h-7 px-2.5 rounded-lg bg-white border border-border/60 hover:border-border/60 hover:bg-[#F4D03F]/5 transition-all text-[9px] font-black flex items-center gap-1.5"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            COPY
                                                        </button>
                                                    </div>
                                                    <ul className="mt-2 space-y-1">
                                                        {(labelPack.pairings || []).map((n, idx) => (
                                                            <li key={idx} className="text-[11px] font-semibold text-foreground/80">- {n}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </BeeYieldCard>

                    <BeeYieldCard padded={false}>
                        <div className={glass.sectionHeader}>
                             <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className={glass.sectionTitle}>Label details</h3>
                             </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { id: 'showBatchNumber', label: 'Include batch ID', value: design.showBatchNumber },
                                { id: 'showBestBefore', label: 'Include best before date', value: design.showBestBefore },
                                { id: 'showQRCode', label: 'Include QR code', value: design.showQRCode },
                                { id: 'showFooter', label: 'Include footer', value: design.showFooter },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-foreground/80">{item.label}</Label>
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
                                            placeholder="Batch ID"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </BeeYieldCard>
                </div>

                {/* Center Panel - Precision Designer */}
                <div className="lg:col-span-2 space-y-6">
                    <BeeYieldCard padded={false} className={cn("bg-[#1A1A1A]/5 shadow-inner min-h-[640px] flex flex-col")}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                                <h3 className={glass.sectionTitle}>Label Preview (300 DPI High Resolution)</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1 bg-background/60 p-1 rounded-xl border border-border/50 text-[11px]">
                                    {SIZE_PRESETS.map((p) => (
                                        <button
                                            key={p.label}
                                            type="button"
                                            onClick={() => updateDesign({ customWidth: p.width, customHeight: p.height, customShape: p.shape })}
                                            className={cn(
                                                "px-2 py-0.5 rounded-lg font-bold transition-colors",
                                                design.customWidth === p.width && design.customHeight === p.height
                                                    ? "bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {p.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                                <div className={glass.badge}>
                                    {design.customWidth} × {design.customHeight} mm
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-auto">
                            {/* Grid Background Effect */}
                            <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

                            {/* Main Label Preview Canvas */}
                            {(() => {
                                const widthMm = parseFloat(design.customWidth) || 99.1;
                                const heightMm = parseFloat(design.customHeight) || 57;
                                const previewWidth = Math.max(520, Math.min(640, Math.round(widthMm * 5.2)));
                                const previewHeight = Math.max(290, Math.min(380, Math.round(heightMm * 5.2)));

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        ref={previewRef}
                                        className="shadow-[0_30px_90px_rgba(0,0,0,0.18)] relative rounded-2xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 border"
                                        style={{
                                            width: `${previewWidth}px`,
                                            minHeight: `${previewHeight}px`,
                                            backgroundColor: design.backgroundColor,
                                            color: design.textColor,
                                            border: design.borderStyle === 'elegant'
                                                ? `3px double ${design.accentColor}50`
                                                : design.borderStyle === 'modern'
                                                    ? `1.5px solid ${design.accentColor}40`
                                                    : 'none',
                                            borderRadius: design.customShape === 'Circle' ? '50%' : '16px',
                                        }}
                                    >
                                        {/* Background Watermark Pattern */}
                                        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04] pointer-events-none -mr-16 -mt-16 rotate-12">
                                            <Hexagon className="w-full h-full" stroke={design.accentColor} strokeWidth={1.5} />
                                        </div>

                                        {/* Content Grid: Left Column (Brand + Metadata) and Right Column (Dedicated Traceability QR) */}
                                        <div className="grid grid-cols-12 gap-5 h-full relative z-10">
                                            {/* Left Column */}
                                            <div className={design.showQRCode ? "col-span-8 flex flex-col justify-between space-y-3" : "col-span-12 flex flex-col justify-between space-y-3"}>
                                                {/* Header Brand */}
                                                <div className="flex items-center gap-3">
                                                    {design.showLogo && (
                                                        design.logoUrl ? (
                                                            <img
                                                                src={design.logoUrl}
                                                                alt="Logo"
                                                                style={{ height: `${38 * design.logoScale}px` }}
                                                                className="object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 border border-current/15">
                                                                <Droplet className="w-4 h-4" style={{ color: design.accentColor }} />
                                                                <span className="text-[11px] font-black tracking-tight">BeeYield</span>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                        Certified Raw Honey
                                                    </div>
                                                </div>

                                                {/* Product Name & Floral Origin */}
                                                <div className="space-y-1">
                                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight" style={{ color: design.accentColor }}>
                                                        {design.productName || 'Pure Natural Honey'}
                                                    </h2>
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-[1.5px] w-6 bg-current opacity-40"></span>
                                                        <p className="text-xs font-bold opacity-90 truncate">
                                                            {design.honeyType || 'Raw Acacia & Desert Wildflower Blossom'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Marketing Note / Tasting Notes */}
                                                {design.marketingNote && (
                                                    <p className="text-[10px] leading-relaxed opacity-75 font-medium line-clamp-2">
                                                        {design.marketingNote}
                                                    </p>
                                                )}

                                                {/* Bottom Metadata & Net Weight */}
                                                <div className="pt-2 border-t flex items-end justify-between gap-3" style={{ borderColor: `${design.accentColor}25` }}>
                                                    <div className="text-[8.5px] space-y-0.5 font-bold opacity-80 min-w-0">
                                                        {design.producer && <p className="font-black text-[9.5px] truncate">{design.producer}</p>}
                                                        <p className="opacity-70 truncate">{design.address || design.country || 'Kenyan Apiculture Reserve'}</p>
                                                        <div className="flex items-center gap-3 pt-0.5 text-[8px] opacity-60 font-mono font-bold">
                                                            {design.showBatchNumber && <span>LOT: {design.batchNumber || 'BEE-BATCH-01'}</span>}
                                                            {design.showBestBefore && <span>EXP: {design.bestBeforeDate}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Net Weight Pill */}
                                                    <div className="shrink-0 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border border-current/15 text-right shadow-sm">
                                                        <p className="text-[7px] opacity-60 font-black uppercase tracking-wider">Net Weight</p>
                                                        <p className="text-xl sm:text-2xl font-black tabular-nums tracking-tight leading-none">
                                                            {design.weight || '500'}
                                                            <span className="text-[11px] ml-0.5 font-bold">{design.weightUnit || 'g'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Dedicated Traceability QR Block (100% VISIBLE, NO CLIPPING) */}
                                            {design.showQRCode && (
                                                <div className="col-span-4 flex flex-col items-center justify-between p-2.5 rounded-xl bg-white border-2 border-amber-500/80 shadow-md text-center text-neutral-900">
                                                    {/* Header */}
                                                    <div className="w-full space-y-0.5">
                                                        <span className="text-[7.5px] font-black uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1">
                                                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                                            Traceability Verified
                                                        </span>
                                                        <div className="px-1.5 py-0.5 rounded bg-neutral-900 text-amber-300 font-mono font-black text-[8px] tracking-wide truncate border border-amber-500/40">
                                                            BATCH: {design.batchNumber || 'BEE-2026-001'}
                                                        </div>
                                                    </div>

                                                    {/* Crisp QR Code - Guaranteed 100% visible */}
                                                    <div className="w-24 h-24 sm:w-28 sm:h-28 my-1 p-1 rounded-lg bg-white border border-neutral-200 shadow-inner flex items-center justify-center overflow-hidden">
                                                        {qrDataUrl ? (
                                                            <img
                                                                src={qrDataUrl}
                                                                alt={`Traceability QR for ${design.batchNumber || 'batch'}`}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full grid place-items-center text-neutral-400">
                                                                <Grid className="w-8 h-8 animate-pulse" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Scan Callout */}
                                                    <div className="w-full space-y-0.5">
                                                        <div className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-950 font-black text-[7px] tracking-wider uppercase border border-amber-500/30 truncate">
                                                            📷 Scan To Verify
                                                        </div>
                                                        <p className="text-[6.5px] font-mono text-neutral-500 truncate">
                                                            beeyield.com/traceability
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })()}

                            {/* QR Traceability Live Quick Actions Bar */}
                            <div className="w-full max-w-xl mt-6 p-3 rounded-2xl bg-card border border-border/70 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-border/80 p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                        {qrDataUrl ? (
                                            <img src={qrDataUrl} alt="QR Thumbnail" className="w-full h-full object-contain" />
                                        ) : (
                                            <Grid className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                            Cryptographic QR Traceability
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
                                            {design.batchNumber ? `Batch ${design.batchNumber} • beeyield.com/traceability` : 'Ready for verification scan'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard('Traceability Link', design.traceUrl || `https://beeyield.com/traceability?code=${encodeURIComponent(design.batchNumber || '')}`)}
                                        className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors"
                                    >
                                        <LinkIcon className="w-3.5 h-3.5 text-amber-500" /> Copy Link
                                    </button>
                                    {qrDataUrl && (
                                        <a
                                            href={qrDataUrl}
                                            download={`beeyield-qr-${design.batchNumber || 'batch'}.png`}
                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download QR
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </BeeYieldCard>

                    {/* Bottom Sections: Saved & Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BeeYieldCard padded={false}>
                            <div className={glass.sectionHeader}>
                                <h3 className={glass.sectionTitle}>Saved labels</h3>
                                <Save className="w-4 h-4 text-[#F4D03F]/40" />
                            </div>
                            <div className="p-4 h-[200px] overflow-y-auto space-y-2">
                                {savedDesigns.length === 0 ? (
                                    <div className={glass.emptyState}>
                                        <Save className="w-6 h-6 opacity-20 text-[#F4D03F]" />
                                        <p className={glass.microLabel}>No saved labels yet</p>
                                    </div>
                                ) : (
                                    savedDesigns.map(saved => (
                                        <div
                                            key={saved.id}
                                            className={cn(
                                                "p-3 rounded-lg border bg-muted/30 hover:bg-muted/30 transition-all group flex justify-between items-center",
                                                saved.id === design.id ? "border-border/60 shadow-sm" : "border-border/60"
                                            )}
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-foreground truncate">{saved.name || saved.productName || 'Untitled label'}</p>
                                                    {saved.id === design.id && (
                                                        <Badge variant="secondary" className="h-5 rounded-full border-0 bg-[#F4D03F]/15 text-[#8A6A00]">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{saved.honeyType} • {saved.customWidth}×{saved.customHeight} mm</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => loadDesign(saved)}
                                                    aria-label="Load saved label design"
                                                    title="Load"
                                                    className="p-1.5 rounded-md hover:bg-[#F4D03F]/10 text-muted-foreground hover:text-[#F4D03F]"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const copyPayload = {
                                                            ...saved,
                                                            id: (globalThis.crypto as any)?.randomUUID?.() || `label-${Date.now()}`,
                                                            name: `${saved.name || saved.productName || 'Label'} (Copy)`,
                                                        };
                                                        const created = await labelService.createLabel(copyPayload);
                                                        upsertSavedDesign(created);
                                                        toast.success(`Duplicated: "${created.name}"`);
                                                    }}
                                                    aria-label="Duplicate saved label design"
                                                    title="Duplicate"
                                                    className="p-1.5 rounded-md hover:bg-[#F4D03F]/10 text-muted-foreground hover:text-[#F4D03F]"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteDesign(saved.id)}
                                                    aria-label="Delete saved label design"
                                                    title="Delete"
                                                    className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </BeeYieldCard>
                        <BeeYieldCard padded={false}>
                            <div className={glass.sectionHeader}>
                                <h3 className={glass.sectionTitle}>Checklist</h3>
                                <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <div className="p-4 space-y-2">
                                {[
                                    { label: 'Product info', icon: ShieldCheck, status: 'OK', color: 'text-[#1B9157]' },
                                    { label: 'Weight and units', icon: ShieldCheck, status: 'OK', color: 'text-[#1B9157]' },
                                    { label: 'Country rules', icon: Shield, status: 'Check', color: 'text-[#F4D03F]' },
                                ].map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-black/5 bg-muted/30">
                                        <div className="flex items-center gap-2.5">
                                            <c.icon className={cn("w-3.5 h-3.5", c.color)} />
                                            <span className="text-xs font-semibold">{c.label}</span>
                                        </div>
                                        <span className={cn("text-[8px] font-black", c.color)}>{c.status}</span>
                                    </div>
                                ))}
                            </div>
                        </BeeYieldCard>
                    </div>
                </div>

                {/* Right Panel - Style & Export */}
                <div className="lg:col-span-1 space-y-6">
                    <BeeYieldCard padded={false}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-orange-500" />
                                <h3 className={glass.sectionTitle}>Styles</h3>
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
                                            : 'border-transparent bg-muted/30 hover:border-border/60'
                                    )}
                                >
                                    <div className="aspect-[3/2] rounded-lg mb-2 shadow-inner flex flex-col p-2 space-y-1 overflow-hidden" style={{ backgroundColor: tmp.color }}>
                                        <div className="w-full h-1 rounded-full opacity-20 bg-current" />
                                        <div className="w-2/3 h-1 rounded-full opacity-10 bg-current" />
                                    </div>
                                    <p className="text-[9px] font-black text-center truncate">{tmp.name}</p>
                                </button>
                            ))}
                        </div>
                    </BeeYieldCard>

                    <BeeYieldCard padded={false}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <Grid className="w-4 h-4 text-orange-500" />
                                <h3 className={glass.sectionTitle}>Size and shape</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className={glass.microLabel}>Width (mm)</Label>
                                    <Input value={design.customWidth} onChange={e => updateDesign({ customWidth: e.target.value })} className={glass.input} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={glass.microLabel}>Height (mm)</Label>
                                    <Input value={design.customHeight} onChange={e => updateDesign({ customHeight: e.target.value })} className={glass.input} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className={glass.microLabel}>Shape</Label>
                                <Select value={design.customShape} onValueChange={v => updateDesign({ customShape: v })}>
                                    <SelectTrigger className={cn(glass.select, "w-full")}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        <SelectItem value="Rectangle" className="text-sm font-semibold">Rectangle</SelectItem>
                                        <SelectItem value="Circle" className="text-sm font-semibold">Circle</SelectItem>
                                        <SelectItem value="Oval" className="text-sm font-semibold">Oval</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </BeeYieldCard>

                    <BeeYieldCard padded={false}>
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-orange-500" />
                                <h3 className={glass.sectionTitle}>Logo</h3>
                            </div>
                        </div>
                        <div className="p-5">
                            <div
                                className="w-full h-28 rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:bg-[#F4D03F]/5 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {design.logoUrl ? (
                                    <img src={design.logoUrl} alt="Logo" className="h-20 object-contain p-2" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-[#F4D03F]/40 group-hover:text-[#F4D03F] mb-2 transition-colors" />
                                        <p className="text-sm font-semibold text-muted-foreground">Upload a logo</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                aria-label="Upload label logo image"
                                title="Upload logo"
                            />
                            
                            {design.logoUrl && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm font-semibold text-[#D4AC0D]">
                                        <span>Logo size</span>
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
                    </BeeYieldCard>
                </div>
            </div>
            
            <AnimatePresence>
                {/* Modals or other overlays */}
            </AnimatePresence>
        </BeeYieldPageShell>
    );
};

export default LabelGeneratorView;

