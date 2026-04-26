import { apiDelete, apiGet, apiPost, apiPut } from './api';

export type ReferenceKind = 'diseases' | 'species';

export interface DiseaseReferenceEntry {
    id: string;
    name: string;
    type?: string | null;
    riskLevel?: string | null;
    causes?: string | null;
    effects?: string | null;
    symptoms: string[];
    treatment?: string | null;
    prevention?: string | null;
    detection?: string | null;
    transmission?: string | null;
    hostSpecies: string[];
    responseSteps: string[];
    cureStatus?: string | null;
    imageUrl?: string | null;
    sourceReferences: string[];
    tags: string[];
    isPublished: boolean;
    sortOrder: number;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface SpeciesReferenceEntry {
    id: string;
    name: string;
    commonName?: string | null;
    scientificName?: string | null;
    category?: string | null;
    location?: string | null;
    description?: string | null;
    suitability?: string | null;
    healthProfile?: string | null;
    notes?: string | null;
    idealUse?: string | null;
    commonDiseases: string[];
    traits: string[];
    conservationStatus?: string | null;
    isExtinct: boolean;
    imageUrl?: string | null;
    sourceReferences: string[];
    tags: string[];
    isPublished: boolean;
    sortOrder: number;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export type ReferenceEntry = DiseaseReferenceEntry | SpeciesReferenceEntry;

export interface ReferenceListResponse<T extends ReferenceEntry> {
    kind: ReferenceKind;
    count: number;
    items: T[];
}

export interface ReferenceImportResponse<T extends ReferenceEntry> extends ReferenceListResponse<T> {
    imported: number;
    deleted: number;
}

export interface ReferenceImportRequest {
    items: Record<string, unknown>[];
    mode: 'upsert' | 'replace';
}

const getEntries = async <T extends ReferenceEntry>(kind: ReferenceKind) =>
    apiGet<ReferenceListResponse<T>>(`/admin/reference-library/${kind}`);

const createEntry = async <T extends ReferenceEntry>(kind: ReferenceKind, payload: Record<string, unknown>) =>
    apiPost<T>(`/admin/reference-library/${kind}`, payload);

const updateEntry = async <T extends ReferenceEntry>(kind: ReferenceKind, id: string, payload: Record<string, unknown>) =>
    apiPut<T>(`/admin/reference-library/${kind}/${id}`, payload);

const deleteEntry = async (kind: ReferenceKind, id: string) =>
    apiDelete<{ success: boolean; id: string }>(`/admin/reference-library/${kind}/${id}`);

const importEntries = async <T extends ReferenceEntry>(kind: ReferenceKind, payload: ReferenceImportRequest) =>
    apiPost<ReferenceImportResponse<T>>(`/admin/reference-library/${kind}/import`, payload);

const bootstrapEntries = async <T extends ReferenceEntry>(kind: ReferenceKind) =>
    apiPost<ReferenceImportResponse<T>>(`/admin/reference-library/${kind}/bootstrap`, {});

export const referenceLibraryService = {
    getDiseaseEntries: () => getEntries<DiseaseReferenceEntry>('diseases'),
    getSpeciesEntries: () => getEntries<SpeciesReferenceEntry>('species'),
    createDiseaseEntry: (payload: Record<string, unknown>) => createEntry<DiseaseReferenceEntry>('diseases', payload),
    createSpeciesEntry: (payload: Record<string, unknown>) => createEntry<SpeciesReferenceEntry>('species', payload),
    updateDiseaseEntry: (id: string, payload: Record<string, unknown>) => updateEntry<DiseaseReferenceEntry>('diseases', id, payload),
    updateSpeciesEntry: (id: string, payload: Record<string, unknown>) => updateEntry<SpeciesReferenceEntry>('species', id, payload),
    deleteDiseaseEntry: (id: string) => deleteEntry('diseases', id),
    deleteSpeciesEntry: (id: string) => deleteEntry('species', id),
    importDiseaseEntries: (payload: ReferenceImportRequest) => importEntries<DiseaseReferenceEntry>('diseases', payload),
    importSpeciesEntries: (payload: ReferenceImportRequest) => importEntries<SpeciesReferenceEntry>('species', payload),
    bootstrapDiseaseEntries: () => bootstrapEntries<DiseaseReferenceEntry>('diseases'),
    bootstrapSpeciesEntries: () => bootstrapEntries<SpeciesReferenceEntry>('species'),
};

export default referenceLibraryService;
