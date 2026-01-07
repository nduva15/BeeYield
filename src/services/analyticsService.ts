import { apiGet } from '@/services/api';

export interface AnalyticsSummary {
    page_views: number;
    unique_sessions: number;
    traceability_scans: number;
}

export interface PageViewData {
    date: string;
    views: number;
    visitors: number;
}

export interface TopPageData {
    page_path: string;
    views: number;
}

export interface ScanData {
    date: string;
    scans: number;
}

export interface SalesData {
    date: string;
    orders: number;
    revenue: number;
}

export const analyticsService = {
    async getSummary(days: number = 30): Promise<AnalyticsSummary> {
        return apiGet<AnalyticsSummary>('/analytics/summary', { days });
    },

    async getPageViewsChart(days: number = 7): Promise<PageViewData[]> {
        return apiGet<PageViewData[]>('/analytics/page-views', { days });
    },

    async getTopPages(limit: number = 10, days: number = 30): Promise<TopPageData[]> {
        return apiGet<TopPageData[]>('/analytics/top-pages', { limit, days });
    },

    async getScansChart(days: number = 7): Promise<ScanData[]> {
        return apiGet<ScanData[]>('/analytics/scans', { days });
    },

    async getSalesAnalytics(days: number = 30): Promise<SalesData[]> {
        return apiGet<SalesData[]>('/analytics/sales', { days });
    }
};
