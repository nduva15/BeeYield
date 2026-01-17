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
    try {
        const response = await fetch(`${API_V1_URL}/blog/posts?limit=${limit}&offset=${offset}${category && category !== "All" ? `&category=${category}` : ''}`);
        if (!response.ok) throw new Error("Failed to fetch blog posts");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
        // Fallback to local data if API returns empty array
        let filtered = localBlogs;
        if (category && category !== "All") {
            filtered = localBlogs.filter(post => post.category === category);
        }
        return filtered as BlogPost[];
    } catch (error) {
        console.warn("Error fetching blog posts, falling back to local data:", error);
        // Fallback to local data
        let filtered = localBlogs;
        if (category && category !== "All") {
            filtered = localBlogs.filter(post => post.category === category);
        }
        return filtered as BlogPost[];
    }
};

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/blog/posts/${slug}`);
        if (!response.ok) {
            // If API fails (e.g. 404), check local data
            const localPost = localBlogs.find(p => p.slug === slug);
            if (localPost) return localPost as BlogPost;
            if (response.status === 404) return null;
            throw new Error("Failed to fetch blog post");
        }
        return await response.json();
    } catch (error) {
        console.warn("Error fetching blog post, checking local data:", error);
        const localPost = localBlogs.find(p => p.slug === slug);
        return (localPost as BlogPost) || null;
    }
};

export const getBlogCategories = async (): Promise<{ name: string, slug: string }[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/blog/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback categories
        return ["Conservation", "Education", "Sustainability", "Process", "Health", "Community"].map(c => ({ name: c, slug: c.toLowerCase() }));
    }
};
