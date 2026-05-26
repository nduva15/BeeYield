/**
 * CMS/Blog Service - Connects to Python Backend
 */
import { API_V1_URL } from "./api";
import { blogs as localBlogs } from "@/data/blogPosts";

export interface BlogPost {
    id: string | number;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    featured_image: string;
    category: string;
    tags: string[];
    author_name: string;
    status?: string;
    read_time_minutes: number;
    published_at: string;
    date?: string;
    views_count?: number;
}

export const getBlogPosts = async (category?: string, limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    // Directly use local data to ensure only the two new pollination blogs are shown, removing the old API/backend mock entries
    let filtered = localBlogs;
    if (category && category !== "All") {
        filtered = localBlogs.filter(post => post.category === category);
    }
    return filtered as BlogPost[];
};

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
    // Directly return the matching local blog post
    const localPost = localBlogs.find(p => p.slug === slug);
    return (localPost as BlogPost) || null;
};

export const getBlogCategories = async (): Promise<{ name: string, slug: string }[]> => {
    // Use fallback categories to match the local data
    return ["Pollination", "Conservation", "Education", "Sustainability", "Process", "Health", "Community"].map(c => ({ name: c, slug: c.toLowerCase() }));
};
