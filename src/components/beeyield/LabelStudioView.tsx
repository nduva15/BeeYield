import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useHarvests } from '@/hooks/useHarvests';
import { beeyieldService } from '@/services/beeyieldService';
import { Harvest } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { format, addYears } from 'date-fns';
import {
    Check,
    AlertTriangle,
    Sparkles,
    Loader2,
    ImagePlus,
    FileDown,
    Copy,
    Trash2,
    FolderPlus,
    Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MARKETING_NOTE_MAX = 140;

const TEMPLATES = [
    { id: 'minimal-amber', name: 'Minimal Amber', desc: 'Klasyczny złoty' },
    { id: 'apiary-honeycomb', name: 'Apiary Honeycomb', desc: 'Plaster miodu' },
    { id: 'minimal-ink', name: 'Minimal Ink', desc: 'Czarno-biały' },
    { id: 'apiary-hex', name: 'Apiary Hex', desc: 'Hexagon' },
    { id: 'minimal-cream', name: 'Minimal Cream', desc: 'Kremowy' },
    { id: 'apiary-bee', name: 'Apiary Bee', desc: 'Pszczoła' },
    { id: 'apiary-hive', name: 'Apiary Hive', desc: 'Ul' },
    { id: 'apiary-blossom', name: 'Apiary Blossom', desc: 'Kwiat' },
    { id: 'apiary-meadow', name: 'Apiary Meadow', desc: 'Łąka' },
];

const LABEL_SIZES = [
    { jar: '500 g', options: ['99.1 x 57 mm', '100 x 50 mm', '52 x 60 mm (hex)', '55 x 100 mm (banderola)', 'Ø69 mm (wieczko)'] },
    { jar: '250 g', options: ['125 x 36 mm', '50 x 37 mm', '50 x 100 mm (banderola)', 'Ø50 mm (wieczko)'] },
    { jar: 'Large / wrap', options: ['185 x 55 mm'] },
    { jar: 'Universal', options: ['92 x 60 mm'] },
];

interface SavedLabel {
    id: string;
    name: string;
    dimensions: string;
    updated: string;
}

interface LabelStudioViewProps {
    onTabChange?: (tab: string) => void;
}

const LabelStudioView: React.FC<LabelStudioViewProps> = () => {
    const { data: harvests = [] } = useHarvests();

    // Batch / harvest sync
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [honeyName, setHoneyName] = useState('Lipowy');
    const [harvestYear, setHarvestYear] = useState('2025');
    const [weight, setWeight] = useState('400');
    const [unit, setUnit] = useState('g');
    const [countryOrigin, setCountryOrigin] = useState('Single country');
    const [country, setCountry] = useState('Polska');
    const [producer, setProducer] = useState('Pasieka Sloneczna');
    const [address, setAddress] = useState('Krakow, ul. Miodowa 12');
    const [marketingNote, setMarketingNote] = useState('Zbior z pasiek wsrod lipowych alei.');
    const [batchNumber, setBatchNumber] = useState('LOT-0525');
    const [bottlingDate, setBottlingDate] = useState('01/06/2025');
    const [bestBefore, setBestBefore] = useState('');
    const [storageConditions, setStorageConditions] = useState('Przechowywac w chlodnym miejscu.');
    const [contactWww, setContactWww] = useState('Pasicka Sloneczna, +48 600 000 000');
    const [includeQr, setIncludeQr] = useState(true);
    const [includeBeeHubFooter, setIncludeBeeHubFooter] = useState(true);
    const [showLogo, setShowLogo] = useState(true);
    const [logoScale, setLogoScale] = useState([100]);
    const [scalePreview, setScalePreview] = useState(100);
    const [selectedTemplateId, setSelectedTemplateId] = useState('minimal-amber');
    const [customWidth, setCustomWidth] = useState('99.1');
    const [customHeight, setCustomHeight] = useState('57');
    const [shape, setShape] = useState('Rectangle');
    const [exportFormat, setExportFormat] = useState('PDF');
    const [dpi, setDpi] = useState('300');
    const [bleed, setBleed] = useState('3');
    const [cropMarks, setCropMarks] = useState(true);
    const [a4Sheet, setA4Sheet] = useState(false);
    const [netWeightFontMm, setNetWeightFontMm] = useState(4.5);
    const [generatingBlurb, setGeneratingBlurb] = useState(false);

    const selectedHarvest = harvests.find(h => h.id === selectedBatchId) || harvests.find(h => h.batch_code) || null;

    useEffect(() => {
        if (selectedHarvest) {
            setHoneyName(selectedHarvest.honey_type || honeyName);
            const year = selectedHarvest.harvest_date ? new Date(selectedHarvest.harvest_date).getFullYear() : new Date().getFullYear();
            setHarvestYear(String(year));
            const loc = selectedHarvest.apiary?.location_name || selectedHarvest.apiary?.name || selectedHarvest.apiary?.county;
            if (loc) setCountry(loc);
            if (selectedHarvest.batch_code) setBatchNumber(selectedHarvest.batch_code);
            const best = selectedHarvest.harvest_date
                ? format(addYears(new Date(selectedHarvest.harvest_date), 2), 'dd/MM/yyyy')
                : '';
            setBestBefore(best);
        }
    }, [selectedHarvest]);

    const generateBlurb = useCallback(async () => {
        setGeneratingBlurb(true);
        try {
            const { blurb } = await beeyieldService.generateLabelBlurb({
                floral_type: honeyName,
                location: country,
                harvest_year: harvestYear,
                use_ai: true,
            });
            setMarketingNote(blurb);
            toast.success('Marketing note generated', { description: 'Smart Storyteller' });
        } catch (e) {
            toast.error('Could not generate description');
        } finally {
            setGeneratingBlurb(false);
        }
    }, [honeyName, country, harvestYear]);

    const complianceNetWeightOk = netWeightFontMm >= 4;
    const charCount = marketingNote.length;

    const savedLabels: SavedLabel[] = [
        { id: '1', name: 'Lipowy', dimensions: '99.1 x 57 mm', updated: '2/8/26' },
        { id: '2', name: 'Spadziowy', dimensions: '50 x 37 mm', updated: '2/8/26' },
        { id: '3', name: 'Rzepakowy', dimensions: '69 x 69 mm', updated: '2/8/26' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Honey label generator</h1>
                <p className="text-slate-500 mt-1 font-medium">Create a print-ready label in minutes.</p>
            </div>

            <Card className="rounded-2xl border border-slate-100 bg-amber-50/30">
                <CardContent className="p-4">
                    <p className="text-sm font-medium text-slate-700">
                        <strong>Important for blends:</strong> From 14.06.2026 blends require countries and percentages in the main field of view.{' '}
                        <a href="#" className="text-primary underline">check source</a>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        The generator helps prepare a label — final compliance responsibility remains with the producer.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Label data + optional */}
                <div className="xl:col-span-1 space-y-6">
                    <Card className="rounded-2xl border border-slate-100">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-slate-800">Label data</h3>
                            <div className="space-y-2">
                                <Label>Batch (Harvest)</Label>
                                <Select value={selectedBatchId || 'none'} onValueChange={(v) => setSelectedBatchId(v === 'none' ? '' : v)}>
                                    <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Manual entry —</SelectItem>
                                        {harvests.map((h: Harvest) => (
                                            <SelectItem key={h.id} value={h.id}>
                                                {h.batch_code || h.honey_type || h.id.slice(0, 8)} — {h.honey_type || 'Honey'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Honey name / type *</Label>
                                <Input value={honeyName} onChange={(e) => setHoneyName(e.target.value)} placeholder="e.g. Lipowy" />
                            </div>
                            <div className="space-y-2">
                                <Label>Harvest year (optional)</Label>
                                <Input value={harvestYear} onChange={(e) => setHarvestYear(e.target.value)} placeholder="2025" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Weight *</Label>
                                    <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="400" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit *</Label>
                                    <Select value={unit} onValueChange={setUnit}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="g">g</SelectItem>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="oz">oz</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Country of origin *</Label>
                                <Select value={countryOrigin} onValueChange={setCountryOrigin}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single country">Single country</SelectItem>
                                        <SelectItem value="Blend">Blend</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Country *</Label>
                                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Polska" />
                            </div>
                            <div className="space-y-2">
                                <Label>Producer / apiary *</Label>
                                <Input value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="Pasieka Sloneczna" />
                            </div>
                            <div className="space-y-2">
                                <Label>Address / city *</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Krakow, ul. Miodowa 12" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Marketing note (max {MARKETING_NOTE_MAX} chars)</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 text-amber-600 hover:text-amber-700"
                                        onClick={generateBlurb}
                                        disabled={generatingBlurb}
                                    >
                                        {generatingBlurb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        {generatingBlurb ? 'Generating…' : 'Smart Storyteller'}
                                    </Button>
                                </div>
                                <Textarea
                                    value={marketingNote}
                                    onChange={(e) => setMarketingNote(e.target.value.slice(0, MARKETING_NOTE_MAX))}
                                    placeholder="e.g. Zbior z pasiek wsrod lipowych alei."
                                    rows={3}
                                    className="resize-none"
                                />
                                <p className={cn("text-xs", charCount > MARKETING_NOTE_MAX ? 'text-destructive' : 'text-slate-500')}>
                                    {charCount}/{MARKETING_NOTE_MAX}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-100">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-slate-800">Optional fields</h3>
                            {[
                                { label: 'Batch number (LOT)', value: batchNumber, set: setBatchNumber, placeholder: 'LOT-0525' },
                                { label: 'Bottling date', value: bottlingDate, set: setBottlingDate, placeholder: '01/06/2025' },
                                { label: 'Best before date', value: bestBefore, set: setBestBefore, placeholder: 'Auto from harvest' },
                            ].map(({ label, value, set, placeholder }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <Switch defaultChecked />
                                    <div className="flex-1">
                                        <Label className="text-xs text-slate-500">{label}</Label>
                                        <Input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="mt-0.5" />
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center gap-3">
                                <Switch defaultChecked />
                                <div className="flex-1">
                                    <Label className="text-xs text-slate-500">Storage conditions</Label>
                                    <Input value={storageConditions} onChange={(e) => setStorageConditions(e.target.value)} className="mt-0.5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch defaultChecked />
                                <div className="flex-1">
                                    <Label className="text-xs text-slate-500">Contact / www</Label>
                                    <Input value={contactWww} onChange={(e) => setContactWww(e.target.value)} className="mt-0.5" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>QR code</Label>
                                <Switch checked={includeQr} onCheckedChange={setIncludeQr} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>BeeHUB.app footer</Label>
                                <Switch checked={includeBeeHubFooter} onCheckedChange={setIncludeBeeHubFooter} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Show logo</Label>
                                <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                            </div>
                            {showLogo && (
                                <>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
                                        Drop logo or click to upload PNG, JPG, SVG
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Logo scale</Label>
                                        <Slider value={logoScale} onValueChange={setLogoScale} min={50} max={150} step={5} />
                                        <p className="text-xs text-slate-500">{(logoScale[0] / 100).toFixed(2)}x</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Center + Right: Preview, Templates, Size, Export, Validation */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="rounded-2xl border border-slate-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Edit layout</Button>
                                    <span className="text-sm text-slate-500">Scale</span>
                                    <Slider value={[scalePreview]} onValueChange={(v) => setScalePreview(v[0])} className="w-24" min={50} max={150} />
                                    <span className="text-sm font-medium w-10">{scalePreview}%</span>
                                </div>
                            </div>
                            <div
                                className="mx-auto rounded-xl border-2 border-amber-200 bg-[#f5f0e6] text-slate-800 overflow-hidden shadow-lg"
                                style={{
                                    width: 'min(100%, ' + ((Number(customWidth) || 99) * (scalePreview / 100)) + 'px)',
                                    aspectRatio: `${Number(customWidth) || 99} / ${Number(customHeight) || 57}`,
                                }}
                            >
                                <div className="p-3 h-full flex flex-col justify-between text-left">
                                    <div>
                                        <p className="text-[10px] opacity-80">Net weight: {weight} {unit}</p>
                                        <p className="font-semibold text-sm mt-0.5">{honeyName}</p>
                                        <p className="text-[10px] opacity-80">Harvest year: {harvestYear}</p>
                                        <p className="text-[10px] opacity-80">Country of origin: {country}</p>
                                    </div>
                                    {includeQr && (
                                        <div className="w-10 h-10 rounded bg-white border border-slate-200 mt-2 flex items-center justify-center text-[8px]">QR</div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">Drag the logo in preview to adjust the crop.</p>
                            {!complianceNetWeightOk && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    Your Net Weight font size is below 4mm. Increase size for compliance.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-2xl border border-slate-100">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Templates</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {TEMPLATES.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setSelectedTemplateId(t.id)}
                                            className={cn(
                                                "rounded-xl border-2 p-2 text-left transition-all",
                                                selectedTemplateId === t.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                                            )}
                                        >
                                            <div className="w-full aspect-[99/57] rounded-lg bg-amber-100/80 border border-amber-200" />
                                            <p className="text-[10px] font-medium mt-1 truncate">{t.name}</p>
                                            <p className="text-[9px] text-slate-500 truncate">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border border-slate-100">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-slate-800">Label size</h3>
                                <div className="flex flex-wrap gap-2">
                                    {LABEL_SIZES.flatMap(({ jar, options }) =>
                                        options.map((opt) => (
                                            <Button
                                                key={`${jar}-${opt}`}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => {
                                                    const match = opt.match(/([\d.]+)\s*x\s*([\d.]+)/);
                                                    if (match) {
                                                        setCustomWidth(match[1]);
                                                        setCustomHeight(match[2]);
                                                    }
                                                }}
                                            >
                                                {opt}
                                            </Button>
                                        ))
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Width (mm) *</Label>
                                        <Input value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Height (mm) *</Label>
                                        <Input value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Shape *</Label>
                                        <Select value={shape} onValueChange={setShape}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Rectangle">Rectangle</SelectItem>
                                                <SelectItem value="Circle">Circle</SelectItem>
                                                <SelectItem value="Hexagon">Hexagon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-800 pt-2">Export</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Format *</Label>
                                        <Select value={exportFormat} onValueChange={setExportFormat}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PDF">PDF</SelectItem>
                                                <SelectItem value="PNG">PNG</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">DPI *</Label>
                                        <Input value={dpi} onChange={(e) => setDpi(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Bleed (mm)</Label>
                                        <Input value={bleed} onChange={(e) => setBleed(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Crop marks (PDF)</Label>
                                    <Switch checked={cropMarks} onCheckedChange={setCropMarks} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">A4 sheet</Label>
                                    <Switch checked={a4Sheet} onCheckedChange={setA4Sheet} />
                                </div>
                                <Button className="w-full gap-2">
                                    <FileDown className="w-4 h-4" />
                                    Export
                                </Button>
                                <div className="pt-2">
                                    <h3 className="font-semibold text-slate-800 mb-2">Validation and checklists</h3>
                                    <ul className="space-y-1 text-sm">
                                        <li className="flex items-center gap-2 text-green-600">
                                            <Check className="w-4 h-4" /> Provide honey name.
                                        </li>
                                        <li className="flex items-center gap-2 text-green-600">
                                            <Check className="w-4 h-4" /> Provide net weight.
                                        </li>
                                        {!complianceNetWeightOk && (
                                            <li className="flex items-center gap-2 text-amber-600">
                                                <AlertTriangle className="w-4 h-4" /> Net weight font ≥ 4mm for compliance.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Card className="rounded-2xl border border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">My labels</h3>
                        <Button variant="outline" size="sm" className="gap-1">
                            <FolderPlus className="w-4 h-4" /> New project
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {savedLabels.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50"
                            >
                                <div>
                                    <p className="font-medium text-slate-800">{s.name}</p>
                                    <p className="text-xs text-slate-500">{s.dimensions}</p>
                                    <p className="text-[10px] text-slate-400">Last update: {s.updated}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm">Load</Button>
                                    <Button variant="ghost" size="sm" className="gap-0"><Copy className="w-3 h-3" /></Button>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button className="gap-2">
                            <Save className="w-4 h-4" /> Save project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LabelStudioView;
