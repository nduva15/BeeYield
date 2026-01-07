const API_URL = "http://localhost:8000/api/v1";

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category: string;
    tags: string[];
    author_id: string;
    status: string;
    read_time_minutes: number;
    published_at: string;
    created_at: string;
}

export const getBlogPosts = async (category?: string): Promise<BlogPost[]> => {
    try {
        const url = category && category !== "All"
            ? `${API_URL}/blog/?category=${category}`
            : `${API_URL}/blog/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch blog posts");
        return await response.json();
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
};
