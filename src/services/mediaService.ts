import { apiGet } from './api';

export interface MediaItem {
    id: string;
    title: string;
    description: string;
    media_type: 'press_release' | 'video' | 'image' | 'award';
    source_name?: string;
    url?: string;
    thumbnail_url?: string;
    published_date: string;
    is_featured?: boolean;
}

export const getMediaItems = async (type?: string): Promise<MediaItem[]> => {
    const queryParams = type ? { media_type: type } : undefined;
    return apiGet<MediaItem[]>('/media/', queryParams);
};

export const getFeaturedMedia = async (): Promise<MediaItem[]> => {
    return apiGet<MediaItem[]>('/media/featured');
};
