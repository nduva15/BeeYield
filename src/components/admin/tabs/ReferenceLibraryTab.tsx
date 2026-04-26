import React from 'react';
import * as XLSX from 'xlsx';
import {
    AlertTriangle,
    Bug,
    Database,
    Dna,
    Download,
    FileUp,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import referenceLibraryService, {
    DiseaseReferenceEntry,
    ReferenceKind,
    SpeciesReferenceEntry,
} from '@/services/referenceLibraryService';

type DiseaseFormState = {
    id: string;
    name: string;
    type: string;
    riskLevel: string;
    causes: string;
    effects: string;
    symptoms: string;
    treatment: string;
    prevention: string;
    detection: string;
    transmission: string;
    hostSpecies: string;
    responseSteps: string;
    cureStatus: string;
    imageUrl: string;
    sourceReferences: string;
    tags: string;
    isPublished: boolean;
    sortOrder: string;
};

type SpeciesFormState = {
    id: string;
    name: string;
    commonName: string;
    scientificName: string;
    category: string;
    location: string;
    description: string;
    suitability: string;
    healthProfile: string;
    notes: string;
    idealUse: string;
    commonDiseases: string;
    traits: string;
    conservationStatus: string;
    isExtinct: boolean;
    imageUrl: string;
    sourceReferences: string;
    tags: string;
    isPublished: boolean;
    sortOrder: string;
};

const emptyDiseaseForm = (): DiseaseFormState => ({
    id: '',
    name: '',
    type: '',
    riskLevel: '',
    causes: '',
    effects: '',
    symptoms: '',
    treatment: '',
    prevention: '',
    detection: '',
    transmission: '',
    hostSpecies: '',
    responseSteps: '',
    cureStatus: '',
    imageUrl: '',
    sourceReferences: '',
    tags: '',
    isPublished: true,
    sortOrder: '0',
});

const emptySpeciesForm = (): SpeciesFormState => ({
    id: '',
    name: '',
    commonName: '',
    scientificName: '',
    category: '',
    location: '',
    description: '',
    suitability: '',
    healthProfile: '',
    notes: '',
    idealUse: '',
    commonDiseases: '',
    traits: '',
    conservationStatus: '',
    isExtinct: false,
    imageUrl: '',
    sourceReferences: '',
    tags: '',
    isPublished: true,
    sortOrder: '0',
});

const listToTextarea = (value: string[] | undefined) => (value || []).join('\n');
const parseList = (value: string) => value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatDate = (value?: string | null) => {
    if (!value) return 'Never';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const diseaseToForm = (entry: DiseaseReferenceEntry): DiseaseFormState => ({
    id: entry.id,
    name: entry.name,
    type: entry.type || '',
    riskLevel: entry.riskLevel || '',
    causes: entry.causes || '',
    effects: entry.effects || '',
    symptoms: listToTextarea(entry.symptoms),
    treatment: entry.treatment || '',
    prevention: entry.prevention || '',
    detection: entry.detection || '',
    transmission: entry.transmission || '',
    hostSpecies: listToTextarea(entry.hostSpecies),
    responseSteps: listToTextarea(entry.responseSteps),
    cureStatus: entry.cureStatus || '',
    imageUrl: entry.imageUrl || '',
    sourceReferences: listToTextarea(entry.sourceReferences),
    tags: listToTextarea(entry.tags),
    isPublished: entry.isPublished,
    sortOrder: String(entry.sortOrder ?? 0),
});

const speciesToForm = (entry: SpeciesReferenceEntry): SpeciesFormState => ({
    id: entry.id,
    name: entry.name,
    commonName: entry.commonName || '',
    scientificName: entry.scientificName || '',
    category: entry.category || '',
    location: entry.location || '',
    description: entry.description || '',
    suitability: entry.suitability || '',
    healthProfile: entry.healthProfile || '',
    notes: entry.notes || '',
    idealUse: entry.idealUse || '',
    commonDiseases: listToTextarea(entry.commonDiseases),
    traits: listToTextarea(entry.traits),
    conservationStatus: entry.conservationStatus || '',
    isExtinct: entry.isExtinct,
    imageUrl: entry.imageUrl || '',
    sourceReferences: listToTextarea(entry.sourceReferences),
    tags: listToTextarea(entry.tags),
    isPublished: entry.isPublished,
    sortOrder: String(entry.sortOrder ?? 0),
});

export const ReferenceLibraryTab: React.FC = () => {
    const [kind, setKind] = React.useState<ReferenceKind>('diseases');
    const [diseaseEntries, setDiseaseEntries] = React.useState<DiseaseReferenceEntry[]>([]);
    const [speciesEntries, setSpeciesEntries] = React.useState<SpeciesReferenceEntry[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [publishedFilter, setPublishedFilter] = React.useState<'all' | 'published' | 'draft'>('all');
    const [secondaryFilter, setSecondaryFilter] = React.useState('all');
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [importing, setImporting] = React.useState(false);
    const [editingDisease, setEditingDisease] = React.useState<DiseaseReferenceEntry | null>(null);
    const [editingSpecies, setEditingSpecies] = React.useState<SpeciesReferenceEntry | null>(null);
    const [diseaseForm, setDiseaseForm] = React.useState<DiseaseFormState>(emptyDiseaseForm());
    const [speciesForm, setSpeciesForm] = React.useState<SpeciesFormState>(emptySpeciesForm());
    const importFileRef = React.useRef<HTMLInputElement | null>(null);
    const pendingImportModeRef = React.useRef<'upsert' | 'replace'>('upsert');

    const loadData = React.useCallback(async (targetKind: ReferenceKind = kind) => {
        setLoading(true);
        try {
            if (targetKind === 'diseases') {
                const response = await referenceLibraryService.getDiseaseEntries();
                setDiseaseEntries(response.items);
            } else {
                const response = await referenceLibraryService.getSpeciesEntries();
                setSpeciesEntries(response.items);
            }
        } catch (error) {
            console.error('Failed to load reference library', error);
            toast.error(`Failed to load ${targetKind} knowledge base`);
        } finally {
            setLoading(false);
        }
    }, [kind]);

    React.useEffect(() => {
        void loadData(kind);
    }, [kind, loadData]);

    const currentEntries = kind === 'diseases' ? diseaseEntries : speciesEntries;
    const typeOptions = React.useMemo(
        () => Array.from(new Set(diseaseEntries.map((entry) => entry.type).filter(Boolean) as string[])).sort(),
        [diseaseEntries],
    );
    const categoryOptions = React.useMemo(
        () => Array.from(new Set(speciesEntries.map((entry) => entry.category).filter(Boolean) as string[])).sort(),
        [speciesEntries],
    );

    const filteredEntries = React.useMemo(() => {
        const needle = search.trim().toLowerCase();
        return currentEntries.filter((entry) => {
            const matchesPublished = publishedFilter === 'all'
                || (publishedFilter === 'published' ? entry.isPublished : !entry.isPublished);

            if (!matchesPublished) return false;

            if (kind === 'diseases') {
                const disease = entry as DiseaseReferenceEntry;
                const matchesType = secondaryFilter === 'all' || disease.type === secondaryFilter;
                const matchesSearch = !needle || [
                    disease.name,
                    disease.type,
                    disease.riskLevel,
                    disease.causes,
                ].some((value) => String(value || '').toLowerCase().includes(needle));
                return matchesType && matchesSearch;
            }

            const species = entry as SpeciesReferenceEntry;
            const matchesCategory = secondaryFilter === 'all' || species.category === secondaryFilter;
            const matchesSearch = !needle || [
                species.name,
                species.commonName,
                species.scientificName,
                species.category,
                species.location,
            ].some((value) => String(value || '').toLowerCase().includes(needle));
            return matchesCategory && matchesSearch;
        });
    }, [currentEntries, kind, publishedFilter, search, secondaryFilter]);

    const stats = React.useMemo(() => ({
        total: currentEntries.length,
        published: currentEntries.filter((entry) => entry.isPublished).length,
        draft: currentEntries.filter((entry) => !entry.isPublished).length,
    }), [currentEntries]);

    const resetForms = () => {
        setEditingDisease(null);
        setEditingSpecies(null);
        setDiseaseForm(emptyDiseaseForm());
        setSpeciesForm(emptySpeciesForm());
    };

    const openCreateDialog = () => {
        resetForms();
        setDialogOpen(true);
    };

    const openEditDialog = (entry: DiseaseReferenceEntry | SpeciesReferenceEntry) => {
        if (kind === 'diseases') {
            setEditingDisease(entry as DiseaseReferenceEntry);
            setDiseaseForm(diseaseToForm(entry as DiseaseReferenceEntry));
        } else {
            setEditingSpecies(entry as SpeciesReferenceEntry);
            setSpeciesForm(speciesToForm(entry as SpeciesReferenceEntry));
        }
        setDialogOpen(true);
    };

    const buildDiseasePayload = () => ({
        name: diseaseForm.name,
        type: diseaseForm.type,
        riskLevel: diseaseForm.riskLevel,
        causes: diseaseForm.causes,
        effects: diseaseForm.effects,
        symptoms: parseList(diseaseForm.symptoms),
        treatment: diseaseForm.treatment,
        prevention: diseaseForm.prevention,
        detection: diseaseForm.detection,
        transmission: diseaseForm.transmission,
        hostSpecies: parseList(diseaseForm.hostSpecies),
        responseSteps: parseList(diseaseForm.responseSteps),
        cureStatus: diseaseForm.cureStatus,
        imageUrl: diseaseForm.imageUrl,
        sourceReferences: parseList(diseaseForm.sourceReferences),
        tags: parseList(diseaseForm.tags),
        isPublished: diseaseForm.isPublished,
        sortOrder: Number(diseaseForm.sortOrder || 0),
    });

    const buildSpeciesPayload = () => ({
        name: speciesForm.name,
        commonName: speciesForm.commonName,
        scientificName: speciesForm.scientificName,
        category: speciesForm.category,
        location: speciesForm.location,
        description: speciesForm.description,
        suitability: speciesForm.suitability,
        healthProfile: speciesForm.healthProfile,
        notes: speciesForm.notes,
        idealUse: speciesForm.idealUse,
        commonDiseases: parseList(speciesForm.commonDiseases),
        traits: parseList(speciesForm.traits),
        conservationStatus: speciesForm.conservationStatus,
        isExtinct: speciesForm.isExtinct,
        imageUrl: speciesForm.imageUrl,
        sourceReferences: parseList(speciesForm.sourceReferences),
        tags: parseList(speciesForm.tags),
        isPublished: speciesForm.isPublished,
        sortOrder: Number(speciesForm.sortOrder || 0),
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            if (kind === 'diseases') {
                const payload = buildDiseasePayload();
                if (editingDisease) {
                    await referenceLibraryService.updateDiseaseEntry(editingDisease.id, payload);
                    toast.success('Disease reference updated');
                } else {
                    await referenceLibraryService.createDiseaseEntry(payload);
                    toast.success('Disease reference created');
                }
            } else {
                const payload = buildSpeciesPayload();
                if (editingSpecies) {
                    await referenceLibraryService.updateSpeciesEntry(editingSpecies.id, payload);
                    toast.success('Species reference updated');
                } else {
                    await referenceLibraryService.createSpeciesEntry(payload);
                    toast.success('Species reference created');
                }
            }
            setDialogOpen(false);
            resetForms();
            await loadData(kind);
        } catch (error) {
            console.error('Failed to save reference entry', error);
            toast.error(`Failed to save ${kind === 'diseases' ? 'disease' : 'species'} record`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (entry: DiseaseReferenceEntry | SpeciesReferenceEntry) => {
        if (!window.confirm(`Delete "${entry.name}" from the ${kind} knowledge base?`)) {
            return;
        }
        try {
            if (kind === 'diseases') {
                await referenceLibraryService.deleteDiseaseEntry(entry.id);
            } else {
                await referenceLibraryService.deleteSpeciesEntry(entry.id);
            }
            toast.success('Reference entry deleted');
            await loadData(kind);
        } catch (error) {
            console.error('Failed to delete reference entry', error);
            toast.error('Failed to delete reference entry');
        }
    };

    const handleBootstrap = async () => {
        if (!window.confirm(`Load the bundled ${kind} starter dataset into the database?`)) {
            return;
        }
        setImporting(true);
        try {
            if (kind === 'diseases') {
                await referenceLibraryService.bootstrapDiseaseEntries();
            } else {
                await referenceLibraryService.bootstrapSpeciesEntries();
            }
            toast.success(`Bundled ${kind} dataset imported`);
            await loadData(kind);
        } catch (error) {
            console.error('Failed to bootstrap reference library', error);
            toast.error(`Failed to load bundled ${kind} dataset`);
        } finally {
            setImporting(false);
        }
    };

    const parseImportFile = async (file: File): Promise<Record<string, unknown>[]> => {
        if (file.name.toLowerCase().endsWith('.json')) {
            const raw = JSON.parse(await file.text());
            if (Array.isArray(raw)) return raw;
            if (Array.isArray(raw?.items)) return raw.items;
            throw new Error('JSON import must be an array or an object with an items array');
        }

        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
    };

    const handleImportClick = (mode: 'upsert' | 'replace') => {
        pendingImportModeRef.current = mode;
        importFileRef.current?.click();
    };

    const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setImporting(true);
        try {
            const items = await parseImportFile(file);
            if (!items.length) {
                throw new Error('The selected file did not contain any rows');
            }
            if (kind === 'diseases') {
                await referenceLibraryService.importDiseaseEntries({ items, mode: pendingImportModeRef.current });
            } else {
                await referenceLibraryService.importSpeciesEntries({ items, mode: pendingImportModeRef.current });
            }
            toast.success(`Imported ${items.length} ${kind} records`);
            await loadData(kind);
        } catch (error: any) {
            console.error('Failed to import reference data', error);
            toast.error(error?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const handleExport = (format: 'json' | 'csv') => {
        if (filteredEntries.length === 0) {
            toast.error('There are no filtered records to export');
            return;
        }

        const filenameBase = `bee-${kind}-${new Date().toISOString().slice(0, 10)}`;
        if (format === 'json') {
            downloadBlob(
                new Blob([JSON.stringify(filteredEntries, null, 2)], { type: 'application/json;charset=utf-8' }),
                `${filenameBase}.json`,
            );
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(filteredEntries);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${filenameBase}.csv`);
    };

    const secondaryOptions = kind === 'diseases' ? typeOptions : categoryOptions;

    return (
        <div className="space-y-6">
            <input
                ref={importFileRef}
                type="file"
                accept=".json,.csv,.xlsx"
                className="hidden"
                onChange={handleImportFileChange}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Records</CardDescription>
                        <CardTitle className="text-3xl font-black">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardDescription>Published</CardDescription>
                        <CardTitle className="text-3xl font-black text-emerald-600">{stats.published}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardDescription>Draft / Hidden</CardDescription>
                        <CardTitle className="text-3xl font-black text-amber-600">{stats.draft}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="rounded-3xl border-border/60">
                <CardHeader className="gap-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                    Database-backed reference library
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">
                                Bee Species and Bee Diseases Editor
                            </CardTitle>
                            <CardDescription>
                                Maintain the live knowledge base, bulk import starter datasets, and export the current database state.
                            </CardDescription>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" className="rounded-xl" onClick={() => void loadData(kind)} disabled={loading}>
                                <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
                                Refresh
                            </Button>
                            <Button variant="outline" className="rounded-xl" onClick={handleBootstrap} disabled={importing}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Load bundled dataset
                            </Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => handleImportClick('upsert')} disabled={importing}>
                                <FileUp className="mr-2 h-4 w-4" />
                                Import merge
                            </Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => handleImportClick('replace')} disabled={importing}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Import replace
                            </Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => handleExport('csv')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => handleExport('json')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export JSON
                            </Button>
                            <Button className="rounded-xl" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                New entry
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={`Search ${kind} by name, type, or taxonomy...`}
                                className="rounded-xl pl-9"
                            />
                        </div>

                        <Select value={kind} onValueChange={(value: ReferenceKind) => { setKind(value); setSecondaryFilter('all'); }}>
                            <SelectTrigger className="w-full rounded-xl lg:w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="diseases">Bee Diseases</SelectItem>
                                <SelectItem value="species">Bee Species</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={publishedFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setPublishedFilter(value)}>
                            <SelectTrigger className="w-full rounded-xl lg:w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All visibility</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft / hidden</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={secondaryFilter} onValueChange={setSecondaryFilter}>
                            <SelectTrigger className="w-full rounded-xl lg:w-[220px]">
                                <SelectValue placeholder={kind === 'diseases' ? 'Filter by type' : 'Filter by category'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{kind === 'diseases' ? 'All disease types' : 'All species categories'}</SelectItem>
                                {secondaryOptions.map((option) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="overflow-x-auto rounded-2xl border border-border/60">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="min-w-[240px]">Record</TableHead>
                                    <TableHead>{kind === 'diseases' ? 'Type' : 'Category'}</TableHead>
                                    <TableHead>Visibility</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                                            <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin" />
                                            Loading database records...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEntries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-16 text-center">
                                            <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                                                <Database className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold">No records match the current filters.</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Create a new entry or load the bundled starter dataset into the database.
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEntries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="align-top">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {kind === 'diseases' ? (
                                                            <Bug className="h-4 w-4 text-amber-500" />
                                                        ) : (
                                                            <Dna className="h-4 w-4 text-emerald-600" />
                                                        )}
                                                        <span className="font-semibold">{entry.name}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {kind === 'diseases'
                                                            ? (entry as DiseaseReferenceEntry).riskLevel || (entry as DiseaseReferenceEntry).causes || 'No diagnosis summary'
                                                            : (entry as SpeciesReferenceEntry).commonName || (entry as SpeciesReferenceEntry).scientificName || 'No alternate name'}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-muted-foreground">{entry.id}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {kind === 'diseases'
                                                    ? (entry as DiseaseReferenceEntry).type || 'Unclassified'
                                                    : (entry as SpeciesReferenceEntry).category || 'Unclassified'}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Badge variant="outline" className={cn(
                                                    'rounded-full',
                                                    entry.isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700',
                                                )}>
                                                    {entry.isPublished ? 'Published' : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="align-top text-sm text-muted-foreground">
                                                {formatDate(entry.updatedAt)}
                                            </TableCell>
                                            <TableCell className="align-top text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEditDialog(entry)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="rounded-lg text-red-600" onClick={() => void handleDelete(entry)}>
                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForms();
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {kind === 'diseases'
                                ? (editingDisease ? 'Edit disease reference' : 'Create disease reference')
                                : (editingSpecies ? 'Edit species reference' : 'Create species reference')}
                        </DialogTitle>
                        <DialogDescription>
                            Changes are saved to the database and appear on the live reference pages without a redeploy.
                        </DialogDescription>
                    </DialogHeader>

                    {kind === 'diseases' ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {editingDisease && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Record ID</Label>
                                    <Input value={diseaseForm.id} disabled />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={diseaseForm.name} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, name: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Input value={diseaseForm.type} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, type: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Risk Level</Label>
                                <Input value={diseaseForm.riskLevel} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, riskLevel: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input value={diseaseForm.imageUrl} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, imageUrl: event.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Causes</Label>
                                <Textarea value={diseaseForm.causes} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, causes: event.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Effects</Label>
                                <Textarea value={diseaseForm.effects} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, effects: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Symptoms</Label>
                                <Textarea value={diseaseForm.symptoms} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, symptoms: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Response Steps</Label>
                                <Textarea value={diseaseForm.responseSteps} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, responseSteps: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Treatment</Label>
                                <Textarea value={diseaseForm.treatment} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, treatment: event.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Prevention</Label>
                                <Textarea value={diseaseForm.prevention} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, prevention: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Detection</Label>
                                <Textarea value={diseaseForm.detection} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, detection: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Transmission</Label>
                                <Textarea value={diseaseForm.transmission} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, transmission: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Host Species</Label>
                                <Textarea value={diseaseForm.hostSpecies} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, hostSpecies: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Cure Status</Label>
                                <Input value={diseaseForm.cureStatus} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, cureStatus: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Source References</Label>
                                <Textarea value={diseaseForm.sourceReferences} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, sourceReferences: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Textarea value={diseaseForm.tags} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input value={diseaseForm.sortOrder} onChange={(event) => setDiseaseForm((prev) => ({ ...prev, sortOrder: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <Select
                                    value={diseaseForm.isPublished ? 'published' : 'draft'}
                                    onValueChange={(value) => setDiseaseForm((prev) => ({ ...prev, isPublished: value === 'published' }))}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft / hidden</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {editingSpecies && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Record ID</Label>
                                    <Input value={speciesForm.id} disabled />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={speciesForm.name} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, name: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Common Name</Label>
                                <Input value={speciesForm.commonName} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, commonName: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Scientific Name</Label>
                                <Input value={speciesForm.scientificName} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, scientificName: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={speciesForm.category} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, category: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input value={speciesForm.location} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, location: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Conservation Status</Label>
                                <Input value={speciesForm.conservationStatus} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, conservationStatus: event.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea value={speciesForm.description} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, description: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Suitability</Label>
                                <Textarea value={speciesForm.suitability} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, suitability: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ideal Use</Label>
                                <Textarea value={speciesForm.idealUse} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, idealUse: event.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Health Profile</Label>
                                <Textarea value={speciesForm.healthProfile} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, healthProfile: event.target.value }))} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Notes</Label>
                                <Textarea value={speciesForm.notes} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, notes: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Traits</Label>
                                <Textarea value={speciesForm.traits} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, traits: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Common Diseases</Label>
                                <Textarea value={speciesForm.commonDiseases} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, commonDiseases: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input value={speciesForm.imageUrl} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, imageUrl: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Source References</Label>
                                <Textarea value={speciesForm.sourceReferences} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, sourceReferences: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Textarea value={speciesForm.tags} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="One per line or comma-separated" />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input value={speciesForm.sortOrder} onChange={(event) => setSpeciesForm((prev) => ({ ...prev, sortOrder: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Extinction Status</Label>
                                <Select
                                    value={speciesForm.isExtinct ? 'extinct' : 'extant'}
                                    onValueChange={(value) => setSpeciesForm((prev) => ({ ...prev, isExtinct: value === 'extinct' }))}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="extant">Extant</SelectItem>
                                        <SelectItem value="extinct">Extinct</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <Select
                                    value={speciesForm.isPublished ? 'published' : 'draft'}
                                    onValueChange={(value) => setSpeciesForm((prev) => ({ ...prev, isPublished: value === 'published' }))}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft / hidden</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={() => void handleSave()} disabled={saving}>
                            {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReferenceLibraryTab;
