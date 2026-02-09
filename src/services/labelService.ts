import { apiGet, apiPost, apiDelete, apiDownload } from './api';

export interface LabelDesign {
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

export const labelService = {
    getLabels: async (): Promise<LabelDesign[]> => {
        const response: any = await apiGet('/labels');
        const data = Array.isArray(response) ? response : (response.data || []);
        return data.map((item: any) => ({
            ...item.design_json,
            id: item.id // Ensure we use the database ID
        }));
    },

    saveLabel: async (design: LabelDesign): Promise<LabelDesign> => {
        const response: any = await apiPost('/labels', design);
        const data = response.data ? response.data : response;
        return {
            ...data.design_json,
            id: data.id
        };
    },

    deleteLabel: async (id: string): Promise<void> => {
        await apiDelete(`/labels/${id}`);
    },

    exportPdf: async (design: LabelDesign, filename?: string): Promise<Blob> => {
        return await apiDownload('/labels/export', design, filename);
    }
};
