import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './api';
import { supabaseBeeYield as sb } from '@/lib/supabase';

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

const LS_KEY_LABELS = 'beeyield_local_labels_v1';

function _lsRead<T>(key: string, fallback: T): T {
    try {
        const raw = globalThis.localStorage?.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function _lsWrite<T>(key: string, value: T): void {
    try {
        globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {}
}

async function getUserId(): Promise<string | null> {
    if (!sb) return null;
    try {
        const { data } = await sb.auth.getUser();
        if (data?.user?.id) return data.user.id;
        const { data: session } = await sb.auth.getSession();
        return session?.session?.user?.id ?? null;
    } catch {
        return null;
    }
}

const normalizeLabelDesign = (item: LabelRecord | LabelDesign | any): LabelDesign => {
    if (!item) return {} as LabelDesign;
    const design = 'design_json' in item && item.design_json && typeof item.design_json === 'object' ? item.design_json : item;
    const recordId = 'id' in item ? item.id : design.id;
    const normalizedId = String(recordId || design.id || '').replace(/^"|"$/g, '');

    return {
        ...(design as LabelDesign),
        id: normalizedId,
        name: (design as LabelDesign).name || ('name' in item ? item.name : undefined) || (design as LabelDesign).productName || 'Untitled Label',
    };
};

export const labelService = {
    getLabels: async (): Promise<LabelDesign[]> => {
        let remote: LabelDesign[] = [];
        // 1. Try API
        try {
            const response: LabelRecord[] | { data?: LabelRecord[] } = await apiGet('/labels');
            const data = Array.isArray(response) ? response : (response.data || []);
            remote = data.map(normalizeLabelDesign);
        } catch (e) {
            console.warn('getLabels API failed, checking Supabase / local:', e);
        }

        // 2. Try Supabase
        if (remote.length === 0 && sb) {
            try {
                const { data, error } = await sb.from('saved_labels').select('*').order('created_at', { ascending: false });
                if (!error && Array.isArray(data)) {
                    remote = data.map(normalizeLabelDesign);
                }
            } catch (sbErr) {
                console.warn('Supabase getLabels error:', sbErr);
            }
        }

        // 3. Local fallback merge
        const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
        if (local.length > 0) {
            const remoteIds = new Set(remote.map((r) => r.id));
            const localOnly = local.filter((l) => !remoteIds.has(l.id));
            return [...localOnly, ...remote];
        }

        return remote;
    },

    getLabel: async (id: string): Promise<LabelDesign> => {
        // 1. Try API
        try {
            const response: LabelRecord | { data?: LabelRecord } = await apiGet(`/labels/${id}`);
            const data = 'data' in response && response.data ? response.data : response;
            if (data) return normalizeLabelDesign(data as LabelRecord);
        } catch (e) {
            console.warn('getLabel API failed, checking Supabase / local:', e);
        }

        // 2. Try Supabase
        if (sb) {
            try {
                const { data, error } = await sb.from('saved_labels').select('*').eq('id', id).maybeSingle();
                if (!error && data) {
                    return normalizeLabelDesign(data);
                }
            } catch (sbErr) {
                console.warn('Supabase getLabel error:', sbErr);
            }
        }

        // 3. Check local
        const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
        const found = local.find((l) => l.id === id);
        if (found) return found;

        throw new Error('Label not found');
    },

    createLabel: async (design: LabelDesign): Promise<LabelDesign> => {
        const now = new Date().toISOString();
        const id = design.id && design.id.length > 10 ? design.id : (globalThis.crypto as any)?.randomUUID?.() || `label-${Date.now()}`;
        const normalizedDesign: LabelDesign = {
            ...design,
            id,
            name: (design.name || design.productName || 'Untitled Label').trim(),
        };

        // 1. Try backend API
        try {
            const response: LabelRecord | { data?: LabelRecord } = await apiPost('/labels', normalizedDesign);
            const data = 'data' in response && response.data ? response.data : response;
            const created = normalizeLabelDesign(data as LabelRecord);
            const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
            _lsWrite(LS_KEY_LABELS, [created, ...local.filter((l) => l.id !== created.id)]);
            return created;
        } catch (apiErr) {
            console.warn('createLabel API failed, falling back to Supabase / local:', apiErr);
        }

        // 2. Try Supabase directly
        const userId = await getUserId();
        if (sb && userId) {
            try {
                const sbPayload = {
                    id,
                    user_id: userId,
                    harvest_batch_id: normalizedDesign.batchNumber || normalizedDesign.harvestId || null,
                    custom_text: normalizedDesign.marketingNote || null,
                    include_qr: Boolean(normalizedDesign.showQRCode),
                    design_json: normalizedDesign,
                    created_at: now,
                };
                const { data, error } = await sb.from('saved_labels').insert(sbPayload).select().single();
                if (!error && data) {
                    const saved = normalizeLabelDesign(data);
                    const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
                    _lsWrite(LS_KEY_LABELS, [saved, ...local.filter((l) => l.id !== saved.id)]);
                    return saved;
                }
                console.warn('Supabase insert saved_label error:', error);
            } catch (sbErr) {
                console.warn('Supabase insert saved_label exception:', sbErr);
            }
        }

        // 3. Fallback to localStorage
        const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
        _lsWrite(LS_KEY_LABELS, [normalizedDesign, ...local.filter((l) => l.id !== normalizedDesign.id)]);
        return normalizedDesign;
    },

    updateLabel: async (id: string, design: LabelDesign): Promise<LabelDesign> => {
        const normalizedDesign: LabelDesign = {
            ...design,
            id,
            name: (design.name || design.productName || 'Untitled Label').trim(),
        };

        // 1. Try backend API
        try {
            const response: LabelRecord | { data?: LabelRecord } = await apiPut(`/labels/${id}`, normalizedDesign);
            const data = 'data' in response && response.data ? response.data : response;
            const updated = normalizeLabelDesign(data as LabelRecord);
            const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
            const idx = local.findIndex((l) => l.id === id);
            if (idx >= 0) local[idx] = updated;
            else local.unshift(updated);
            _lsWrite(LS_KEY_LABELS, local);
            return updated;
        } catch (apiErr) {
            console.warn('updateLabel API failed, falling back to Supabase / local:', apiErr);
        }

        // 2. Try Supabase
        if (sb) {
            try {
                const sbPayload = {
                    harvest_batch_id: normalizedDesign.batchNumber || normalizedDesign.harvestId || null,
                    custom_text: normalizedDesign.marketingNote || null,
                    include_qr: Boolean(normalizedDesign.showQRCode),
                    design_json: normalizedDesign,
                };
                const { data, error } = await sb.from('saved_labels').update(sbPayload).eq('id', id).select().single();
                if (!error && data) {
                    const updated = normalizeLabelDesign(data);
                    const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
                    const idx = local.findIndex((l) => l.id === id);
                    if (idx >= 0) local[idx] = updated;
                    else local.unshift(updated);
                    _lsWrite(LS_KEY_LABELS, local);
                    return updated;
                }
                console.warn('Supabase update saved_label error:', error);
            } catch (sbErr) {
                console.warn('Supabase update saved_label exception:', sbErr);
            }
        }

        // 3. Fallback to localStorage
        const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
        const idx = local.findIndex((l) => l.id === id);
        if (idx >= 0) local[idx] = normalizedDesign;
        else local.unshift(normalizedDesign);
        _lsWrite(LS_KEY_LABELS, local);
        return normalizedDesign;
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
        // 1. Try API
        try {
            await apiDelete(`/labels/${id}`);
        } catch (apiErr) {
            console.warn('deleteLabel API failed, proceeding to Supabase / local:', apiErr);
        }

        // 2. Try Supabase
        if (sb) {
            try {
                await sb.from('saved_labels').delete().eq('id', id);
            } catch (sbErr) {
                console.warn('Supabase delete saved_label error:', sbErr);
            }
        }

        // 3. Always remove from local storage
        const local = _lsRead<LabelDesign[]>(LS_KEY_LABELS, []);
        _lsWrite(LS_KEY_LABELS, local.filter((l) => l.id !== id));
    },

    exportPdf: async (design: LabelDesign, filename?: string): Promise<Blob> => {
        const outName = filename || `label-${(design.productName || 'honey').toLowerCase().replace(/\s+/g, '-')}.pdf`;
        try {
            return await apiDownload('/labels/export', design, outName);
        } catch (error) {
            console.warn('Backend exportPdf failed, generating client-side PDF:', error);
            const { jsPDF } = await import('jspdf');

            // Generate label PDF with jsPDF (standard 100mm x 70mm jar label)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [100, 70],
            });

            // Background
            const bgHex = design.backgroundColor || '#FAF8F5';
            doc.setFillColor(bgHex);
            doc.rect(0, 0, 100, 70, 'F');

            // Decorative gold border
            doc.setDrawColor(212, 160, 23); // Gold #D4A017
            doc.setLineWidth(0.8);
            doc.rect(3, 3, 94, 64);
            doc.setLineWidth(0.3);
            doc.rect(4.5, 4.5, 91, 61);

            // Title & Product Name
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(30, 30, 30);
            doc.text((design.productName || 'BeeYield Pure Honey').toUpperCase(), 50, 13, { align: 'center' });

            // Honey Type
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(180, 130, 15);
            doc.text(design.honeyType || 'Raw Organic Honey', 50, 18.5, { align: 'center' });

            // Divider Line
            doc.setDrawColor(212, 160, 23);
            doc.setLineWidth(0.4);
            doc.line(22, 21.5, 78, 21.5);

            // Left details
            doc.setFontSize(7);
            doc.setTextColor(60, 60, 60);
            let y = 27;

            doc.setFont('helvetica', 'bold');
            doc.text('Origin:', 8, y);
            doc.setFont('helvetica', 'normal');
            doc.text(design.countryOfOrigin || design.country || 'Kenya', 24, y);

            y += 4.5;
            doc.setFont('helvetica', 'bold');
            doc.text('Producer:', 8, y);
            doc.setFont('helvetica', 'normal');
            doc.text(design.producer || 'BeeYield Partners', 24, y);

            if (design.showBatchNumber && design.batchNumber) {
                y += 4.5;
                doc.setFont('helvetica', 'bold');
                doc.text('Batch:', 8, y);
                doc.setFont('helvetica', 'normal');
                doc.text(design.batchNumber, 24, y);
            }

            if (design.showBestBefore && design.bestBeforeDate) {
                y += 4.5;
                doc.setFont('helvetica', 'bold');
                doc.text('Best Before:', 8, y);
                doc.setFont('helvetica', 'normal');
                doc.text(design.bestBeforeDate, 24, y);
            }

            // Weight Badge Right side
            doc.setFillColor(244, 208, 63); // #F4D03F
            doc.roundedRect(68, 26, 24, 9, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(30, 30, 30);
            doc.text(`${design.weight || '500'} ${design.weightUnit || 'g'}`, 80, 32, { align: 'center' });

            // Marketing Note / Slogan
            if (design.marketingNote) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(6.5);
                doc.setTextColor(90, 90, 90);
                const splitNote = doc.splitTextToSize(design.marketingNote, 82);
                doc.text(splitNote, 50, 50, { align: 'center' });
            }

            // Footer
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5.5);
            doc.setTextColor(140, 140, 140);
            doc.text('100% PURE & UNFILTERED • ETHICALLY HARVESTED • BEEYIELD.COM', 50, 61, { align: 'center' });

            // Save and trigger download
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            return blob;
        }
    },
};
