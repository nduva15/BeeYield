import { apiDelete, apiGet, getAuthHeaders } from './api';

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BeeDetection {
    id: number;
    label: string;
    confidence: number; // 0..1
    health?: string;
    health_confidence?: number; // 0..1
    bbox: BoundingBox;
}

export interface DiseaseIndicator {
    disease: string;
    probability: number; // 0..1
    affected_bees: number[];
    severity: 'Low' | 'Medium' | 'High' | 'Critical' | string;
}

export interface AnalysisResults {
    bee_count: number;
    health_status: 'Healthy' | 'Warning' | 'Critical' | 'Unknown' | string;
    health_score: number;
    confidence: number; // 0..1
    detections: BeeDetection[];
    disease_indicators: DiseaseIndicator[];
    recommendations: string[];
}

export interface ImageAnalysisResponse {
    success: boolean;
    analysis_id: string;
    status: 'processing' | 'completed' | 'failed' | string;
    results: AnalysisResults;
    image_url?: string | null;
    annotated_image_url?: string | null;
    created_at: string;
    processing_time_ms: number;
}

export interface AnalysisHistoryItem {
    id: string;
    thumbnail_url?: string | null;
    bee_count: number;
    health_score: number;
    health_status: string;
    created_at?: string | null;
    hive_id?: string | null;
    apiary_id?: string | null;
}

export interface AnalysisHistoryResponse {
    total: number;
    items: AnalysisHistoryItem[];
}

export interface HealthTrendPoint {
    date?: string | null;
    health_score: number;
    bee_count: number;
    health_status?: string | null;
}

export interface HealthTrendsResponse {
    hive_id: string;
    trends: HealthTrendPoint[];
    average_score?: number | null;
    total_analyses?: number;
}

export const imageAnalysisService = {
    // Analyze Bee Image
    async analyzeImage(
        formData: FormData,
        params?: {
            confidence?: number;
            overlap?: number;
            analysis_type?: string;
        }
    ): Promise<ImageAnalysisResponse> {
        const headers = await getAuthHeaders();
        // Remove Content-Type header to let browser set it with boundary for FormData
        const { 'Content-Type': ct, ...restHeaders } = headers as any;

        // Append params to FormData if provided
        if (params) {
            if (params.confidence) formData.append('confidence_threshold', params.confidence.toString());
            if (params.overlap) formData.append('overlap_threshold', params.overlap.toString());
            if (params.analysis_type) formData.append('analysis_type', params.analysis_type);
        }

        try {
            // Dynamic import to avoid circular dependencies if any, and ensure we get the latest URL
            const { API_V1_URL } = await import('./api');
            const response = await fetch(`${API_V1_URL}/image/analyze`, {
                method: 'POST',
                headers: {
                    ...restHeaders,
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error((error as any).detail || 'Analysis failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error analyzing image:', error);
            throw error;
        }
    },

    // Get specific analysis
    async getAnalysis(id: string): Promise<ImageAnalysisResponse> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<ImageAnalysisResponse>(`/image/analysis/${id}`, {}, { headers });
        } catch (error) {
            console.error('Error fetching analysis:', error);
            throw error;
        }
    },

    // List user analyses
    async listAnalyses(params: {
        hive_id?: string;
        apiary_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<AnalysisHistoryResponse> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<AnalysisHistoryResponse>('/image/analyses', params, { headers });
        } catch (error) {
            console.error('Error listing analyses:', error);
            // Return empty structure on error to prevent UI crashes
            return { items: [], total: 0 };
        }
    },

    // Delete analysis
    async deleteAnalysis(id: string): Promise<{ success: boolean }> {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete<{ success: boolean }>(`/image/analysis/${id}`, { headers });
        } catch (error) {
            console.error('Error deleting analysis:', error);
            throw error;
        }
    },

    // Get hive health trends
    async getHealthTrends(hiveId: string, days = 30): Promise<HealthTrendsResponse | null> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<HealthTrendsResponse>(`/image/health-trends/${hiveId}`, { days }, { headers });
        } catch (error) {
            console.error('Error fetching health trends:', error);
            return null;
        }
    }
};
