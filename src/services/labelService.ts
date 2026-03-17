import { apiGet, apiPost, apiDelete, apiDownload } from './api';

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

export const labelService = {
    getLabels: async (): Promise<LabelDesign[]> => {
        try {
            const response: any = await apiGet('/labels');
            const data = Array.isArray(response) ? response : (response.data || []);
            return data.map((item: any) => ({
                ...item.design_json,
                id: item.id // Ensure we use the database ID
            }));
        } catch (e) {
            // If user is logged out, return empty list (dashboard shows empty tables)
            return [];
        }
    },

    saveLabel: async (design: LabelDesign): Promise<LabelDesign> => {
        try {
            const response: any = await apiPost('/labels', design);
            const data = response.data ? response.data : response;
            
            // If design_json exists, use it; otherwise treat the whole response as the design
            if (data.design_json) {
                return {
                    ...data.design_json,
                    id: data.id || design.id
                };
            }
            
            // Fallback: the response IS the design
            return {
                ...design,
                id: data.id || design.id
            };
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
