import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './api';

export interface LabelDesign {
    id: string;
    /** Linkages for traceability context */
    harvestId?: string;
    hiveId?: string;
    apiaryId?: string;
    /** Convenience: stored traceability URL for QR / quick-open */
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

interface LabelRecord {
    id?: string;
    name?: string;
    design_json?: Partial<LabelDesign>;
}

const normalizeLabelDesign = (item: LabelRecord | LabelDesign): LabelDesign => {
    const design = 'design_json' in item && item.design_json ? item.design_json : item;
    const recordId = 'id' in item ? item.id : design.id;
    const normalizedId = String(recordId || '').replace(/^"|"$/g, '');

    return {
        ...(design as LabelDesign),
        id: normalizedId,
        name: (design as LabelDesign).name || ('name' in item ? item.name : undefined) || (design as LabelDesign).productName || 'Untitled Label',
    };
};

export const labelService = {
    getLabels: async (): Promise<LabelDesign[]> => {
        try {
            const response: LabelRecord[] | { data?: LabelRecord[] } = await apiGet('/labels');
            const data = Array.isArray(response) ? response : (response.data || []);
            return data.map(normalizeLabelDesign);
        } catch (e) {
            // If user is logged out, return empty list (dashboard shows empty tables)
            return [];
        }
    },

    getLabel: async (id: string): Promise<LabelDesign> => {
        const response: LabelRecord | { data?: LabelRecord } = await apiGet(`/labels/${id}`);
        const data = 'data' in response && response.data ? response.data : response;
        return normalizeLabelDesign(data as LabelRecord);
    },

    createLabel: async (design: LabelDesign): Promise<LabelDesign> => {
        const response: LabelRecord | { data?: LabelRecord } = await apiPost('/labels', design);
        const data = 'data' in response && response.data ? response.data : response;
        return normalizeLabelDesign(data as LabelRecord);
    },

    updateLabel: async (id: string, design: LabelDesign): Promise<LabelDesign> => {
        const response: LabelRecord | { data?: LabelRecord } = await apiPut(`/labels/${id}`, design);
        const data = 'data' in response && response.data ? response.data : response;
        return normalizeLabelDesign(data as LabelRecord);
    },

    saveLabel: async (design: LabelDesign): Promise<LabelDesign> => {
        try {
            return design.id
                ? await labelService.updateLabel(design.id, design)
                : await labelService.createLabel(design);
        } catch (error) {
            console.error('[LabelService] Save failed:', error);
            throw error;
        }
    },


    deleteLabel: async (id: string): Promise<void> => {
        await apiDelete(`/labels/${id}`);
    },

    exportPdf: async (design: LabelDesign, filename?: string): Promise<Blob> => {
        return await apiDownload('/labels/export', design, filename);
    }
};
