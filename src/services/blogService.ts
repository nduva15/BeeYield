/**
 * Blog Service - Connects to Python Backend
 */
import { API_V1_URL } from "./api";

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content?: string;
    featured_image: string;
    category: string;
    tags: string[];
    author_name: string;
    author_image?: string;
    read_time_minutes: number;
    published_at: string;
    views_count: number;
}

export interface BlogCategory {
    name: string;
    slug: string;
}

export const getBlogPosts = async (category?: string, tag?: string, limit: number = 10): Promise<BlogPost[]> => {
    try {
        let url = `${API_V1_URL}/blog/posts?limit=${limit}`;
        if (category) url += `&category=${category}`;
        if (tag) url += `&tag=${tag}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch blog posts");
        return await response.json();
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
};

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/blog/posts/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch blog post");
        return await response.json();
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return null;
    }
};

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/blog/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};
