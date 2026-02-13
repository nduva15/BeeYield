/**
 * Content Engine Service
 * ======================
 * Powers the "Big 45" Content Engine: AI-assisted blog creation,
 * SEO/AEO/GEO optimization scoring, and CTA management.
 */
import { supabase } from '@/lib/supabase';
import { apiPost } from './api';

// ============================================================
// Types
// ============================================================

export type BlogCategory = 'bees' | 'honey' | 'apiary' | 'diseases';
export type BlogStatus = 'idea' | 'writing' | 'seo_review' | 'published';
export type ContentPillar = 'bee_biology_behavior' | 'honey_hive_products' | 'apiary_management_tech' | 'diseases_pests';

export interface ContentPost {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    content_html: string;
    content_markdown: string;
    excerpt: string;
    category: BlogCategory;
    pillar?: ContentPillar;
    author_id?: string;
    author_name: string;
    status: BlogStatus;
    featured_image?: string;
    word_count: number;
    target_word_count: number;
    read_time_minutes: number;
    tags: string[];
    views_count: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface BlogChapter {
    id: string;
    post_id: string;
    chapter_number: number;
    heading: string;
    content_html: string;
    content_markdown: string;
    word_count: number;
    status: 'pending' | 'generating' | 'complete';
    ai_prompt?: string;
    created_at: string;
    updated_at: string;
}

export interface SEOMetadata {
    id: string;
    post_id: string;
    meta_title: string;
    meta_description: string;
    focus_keywords: string[];
    secondary_keywords: string[];
    aeo_answer_snippet: string;
    geo_citation_sources: string[];
    schema_json: Record<string, unknown>;
    seo_score: number;
    aeo_score: number;
    geo_score: number;
    overall_score: number;
    last_analyzed_at?: string;
}

export interface CTABlock {
    id: string;
    name: string;
    cta_type: 'banner' | 'inline' | 'sidebar' | 'popup';
    title: string;
    description?: string;
    button_text: string;
    button_url: string;
    image_url?: string;
    style_variant: string;
    is_active: boolean;
}

export interface SEOScoreResult {
    seo: { score: number; issues: string[]; passes: string[] };
    aeo: { score: number; issues: string[]; passes: string[] };
    geo: { score: number; issues: string[]; passes: string[] };
    overall: number;
    readability: { fleschKincaid: number; grade: string };
    keywordDensity: Record<string, { count: number; density: number }>;
}

export interface ChapterGenerationRequest {
    title: string;
    chapter_heading: string;
    tone?: string;
    context?: string;
    include_tables?: boolean;
    include_lists?: boolean;
}

// ============================================================
// Pillar metadata
// ============================================================
export const PILLAR_META: Record<ContentPillar, { label: string; color: string; icon: string; target: string }> = {
    bee_biology_behavior: {
        label: 'Bee Biology & Behavior',
        color: '#F59E0B',
        icon: 'ðŸ',
        target: 'Researchers, Students, Hobbyists'
    },
    honey_hive_products: {
        label: 'Honey & Hive Products',
        color: '#D97706',
        icon: 'ðŸ¯',
        target: 'Consumers, Wholesalers, Health Enthusiasts'
    },
    apiary_management_tech: {
        label: 'Apiary Management & Tech',
        color: '#059669',
        icon: 'ðŸ“¡',
        target: 'Commercial Beekeepers (B2B)'
    },
    diseases_pests: {
        label: 'Diseases & Pests',
        color: '#DC2626',
        icon: 'ðŸ”¬',
        target: 'Veterinarians, Government, Farmers'
    }
};

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
    bees: '#F59E0B',
    honey: '#D97706',
    apiary: '#059669',
    diseases: '#DC2626'
};

// ============================================================
// Blog Posts CRUD
// ============================================================

export const contentEngine = {
    // ---- POSTS ----

    async getPosts(filters?: {
        status?: BlogStatus;
        category?: BlogCategory;
        pillar?: ContentPillar;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<ContentPost[]> {
        if (!supabase) return [];

        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('updated_at', { ascending: false });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.pillar) query = query.eq('pillar', filters.pillar);
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
        if (filters?.limit) query = query.limit(filters.limit);
        if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);

        const { data, error } = await query;
        if (error) { console.error('Error fetching posts:', error); return []; }
        return (data || []) as ContentPost[];
    },

    async getPost(id: string): Promise<ContentPost | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();
        if (error) { console.error('Error fetching post:', error); return null; }
        return data as ContentPost;
    },

    async getPostBySlug(slug: string): Promise<ContentPost | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) return null;
        return data as ContentPost;
    },

    async createPost(post: Partial<ContentPost>): Promise<ContentPost | null> {
        if (!supabase) return null;
        const slug = post.slug || post.title?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 80) || `post-${Date.now()}`;

        const { data, error } = await supabase
            .from('blog_posts')
            .insert({ ...post, slug })
            .select()
            .single();

        if (error) { console.error('Error creating post:', error); return null; }

        // Auto-create SEO metadata
        if (data) {
            await supabase.from('seo_metadata').insert({
                post_id: data.id,
                meta_title: post.title?.slice(0, 60),
                meta_description: post.excerpt?.slice(0, 160),
                focus_keywords: post.tags || [],
            });
        }

        return data as ContentPost;
    },

    async updatePost(id: string, updates: Partial<ContentPost>): Promise<ContentPost | null> {
        if (!supabase) return null;

        // Auto-calc word count + read time
        if (updates.content_html || updates.content_markdown) {
            const text = (updates.content_html || updates.content_markdown || '').replace(/<[^>]*>/g, '');
            updates.word_count = text.split(/\s+/).filter(Boolean).length;
            updates.read_time_minutes = Math.ceil(updates.word_count / 200);
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) { console.error('Error updating post:', error); return null; }
        return data as ContentPost;
    },

    async deletePost(id: string): Promise<boolean> {
        if (!supabase) return false;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        return !error;
    },

    async publishPost(id: string): Promise<ContentPost | null> {
        return this.updatePost(id, {
            status: 'published',
            published_at: new Date().toISOString()
        } as any);
    },

    // ---- CHAPTERS ----

    async getChapters(postId: string): Promise<BlogChapter[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('blog_chapters')
            .select('*')
            .eq('post_id', postId)
            .order('chapter_number', { ascending: true });

        if (error) { console.error('Error fetching chapters:', error); return []; }
        return (data || []) as BlogChapter[];
    },

    async createChapter(chapter: Partial<BlogChapter>): Promise<BlogChapter | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('blog_chapters')
            .insert(chapter)
            .select()
            .single();
        if (error) { console.error('Error creating chapter:', error); return null; }
        return data as BlogChapter;
    },

    async updateChapter(id: string, updates: Partial<BlogChapter>): Promise<BlogChapter | null> {
        if (!supabase) return null;

        if (updates.content_html || updates.content_markdown) {
            const text = (updates.content_html || updates.content_markdown || '').replace(/<[^>]*>/g, '');
            updates.word_count = text.split(/\s+/).filter(Boolean).length;
        }

        const { data, error } = await supabase
            .from('blog_chapters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) { console.error('Error updating chapter:', error); return null; }
        return data as BlogChapter;
    },

    async deleteChapter(id: string): Promise<boolean> {
        if (!supabase) return false;
        const { error } = await supabase.from('blog_chapters').delete().eq('id', id);
        return !error;
    },

    async generateOutline(title: string): Promise<string[]> {
        // Try backend AI first, then fall back to heuristic
        try {
            const result = await apiPost<{ headings: string[] }>('/blog/generate-outline', { title });
            if (result.headings?.length) return result.headings;
        } catch {
            // Fall through to heuristic
        }

        // Intelligent heuristic fallback
        return [
            'Introduction: Setting the Context',
            `What is ${title.split(':')[0]}?`,
            'Historical Background and Evolution',
            'The Science Behind the Topic',
            'Key Data and Statistical Analysis',
            'Practical Applications and Case Studies',
            'Current Research and Innovations',
            'Challenges and Controversies',
            'Best Practices and Recommendations',
            'Future Outlook and Emerging Trends',
            'FAQ: Frequently Asked Questions',
            'Conclusion and Key Takeaways'
        ];
    },

    async generateChapterContent(request: ChapterGenerationRequest): Promise<string> {
        try {
            const result = await apiPost<{ html_content: string }>('/blog/generate-chapter', {
                title: request.title,
                chapter_heading: request.chapter_heading,
                tone: request.tone || 'professional_educational',
                context: request.context || '',
                include_tables: request.include_tables ?? true,
                include_lists: request.include_lists ?? true
            });
            return result.html_content || '';
        } catch {
            // Placeholder content for when backend is unavailable
            return `<h2>${request.chapter_heading}</h2>
<p>This chapter section is pending AI generation. Please ensure the backend API is running with the <code>/blog/generate-chapter</code> endpoint configured.</p>
<p>To generate content, the system will use the following prompt context:</p>
<ul>
<li><strong>Post Title:</strong> ${request.title}</li>
<li><strong>Section:</strong> ${request.chapter_heading}</li>
<li><strong>Tone:</strong> ${request.tone || 'professional_educational'}</li>
</ul>
<p><em>Target: ~600 words with data tables and actionable insights.</em></p>`;
        }
    },

    async assemblePostFromChapters(postId: string): Promise<ContentPost | null> {
        const chapters = await this.getChapters(postId);
        if (!chapters.length) return null;

        const fullHtml = chapters
            .sort((a, b) => a.chapter_number - b.chapter_number)
            .map(ch => ch.content_html)
            .join('\n\n');

        const fullMarkdown = chapters
            .sort((a, b) => a.chapter_number - b.chapter_number)
            .map(ch => ch.content_markdown)
            .join('\n\n');

        const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);

        return this.updatePost(postId, {
            content_html: fullHtml,
            content_markdown: fullMarkdown,
            word_count: totalWords,
            read_time_minutes: Math.ceil(totalWords / 200),
        });
    },

    // ---- SEO METADATA ----

    async getSEOMetadata(postId: string): Promise<SEOMetadata | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('seo_metadata')
            .select('*')
            .eq('post_id', postId)
            .single();
        if (error) return null;
        return data as SEOMetadata;
    },

    async updateSEOMetadata(postId: string, updates: Partial<SEOMetadata>): Promise<SEOMetadata | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('seo_metadata')
            .upsert({ post_id: postId, ...updates }, { onConflict: 'post_id' })
            .select()
            .single();
        if (error) { console.error('Error updating SEO:', error); return null; }
        return data as SEOMetadata;
    },

    // ---- CTA BLOCKS ----

    async getCTABlocks(): Promise<CTABlock[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('blog_cta_blocks')
            .select('*')
            .eq('is_active', true);
        if (error) return [];
        return (data || []) as CTABlock[];
    },

    // ============================================================
    // SEO / AEO / GEO Scoring Engine (Frontend)
    // ============================================================

    analyzeContent(
        content: string,
        title: string,
        focusKeywords: string[],
        metaTitle?: string,
        metaDescription?: string,
        aeoSnippet?: string,
        citationSources?: string[]
    ): SEOScoreResult {
        const plainText = content.replace(/<[^>]*>/g, '');
        const words = plainText.split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        const lowerContent = plainText.toLowerCase();
        const lowerTitle = title.toLowerCase();

        // ---- SEO SCORING ----
        const seoIssues: string[] = [];
        const seoPasses: string[] = [];
        let seoPoints = 0;

        // 1. Keyword in Title (15 pts)
        const primaryKeyword = focusKeywords[0]?.toLowerCase() || '';
        if (primaryKeyword && lowerTitle.includes(primaryKeyword)) {
            seoPoints += 15; seoPasses.push('âœ… Focus keyword found in H1 title');
        } else if (primaryKeyword) {
            seoIssues.push('âš ï¸ Add focus keyword to your H1 title');
        }

        // 2. Keyword in first 100 words (10 pts)
        const first100 = words.slice(0, 100).join(' ').toLowerCase();
        if (primaryKeyword && first100.includes(primaryKeyword)) {
            seoPoints += 10; seoPasses.push('âœ… Keyword in first 100 words');
        } else if (primaryKeyword) {
            seoIssues.push('âš ï¸ Include focus keyword in the first 100 words');
        }

        // 3. Meta Title length (10 pts)
        if (metaTitle && metaTitle.length > 0 && metaTitle.length <= 60) {
            seoPoints += 10; seoPasses.push(`âœ… Meta title length: ${metaTitle.length}/60 chars`);
        } else if (!metaTitle || metaTitle.length === 0) {
            seoIssues.push('âš ï¸ Add a meta title (max 60 chars)');
        } else {
            seoIssues.push(`âš ï¸ Meta title too long: ${metaTitle.length}/60 chars`);
        }

        // 4. Meta Description length (10 pts)
        if (metaDescription && metaDescription.length > 0 && metaDescription.length <= 160) {
            seoPoints += 10; seoPasses.push(`âœ… Meta description: ${metaDescription.length}/160 chars`);
        } else if (!metaDescription || metaDescription.length === 0) {
            seoIssues.push('âš ï¸ Add a meta description (max 160 chars)');
        } else {
            seoIssues.push(`âš ï¸ Meta description too long: ${metaDescription.length}/160 chars`);
        }

        // 5. Word count > 3000 (15 pts), > 5000 bonus
        if (wordCount >= 6000) {
            seoPoints += 15; seoPasses.push(`âœ… Excellent word count: ${wordCount.toLocaleString()} words`);
        } else if (wordCount >= 3000) {
            seoPoints += 10; seoPasses.push(`âœ… Good word count: ${wordCount.toLocaleString()} words`);
        } else {
            seoIssues.push(`âš ï¸ Short content: ${wordCount.toLocaleString()}/6,000 words`);
        }

        // 6. Subheadings (H2/H3) present (10 pts)
        const headingCount = (content.match(/<h[23][^>]*>/gi) || []).length;
        if (headingCount >= 5) {
            seoPoints += 10; seoPasses.push(`âœ… ${headingCount} subheadings found`);
        } else if (headingCount >= 2) {
            seoPoints += 5; seoIssues.push(`âš ï¸ Only ${headingCount} subheadings. Add more for structure.`);
        } else {
            seoIssues.push('âš ï¸ Add H2/H3 subheadings to improve structure');
        }

        // 7. Images / Alt text (10 pts)
        const images = content.match(/<img[^>]*>/gi) || [];
        const imagesWithAlt = content.match(/<img[^>]*alt="[^"]+"/gi) || [];
        if (images.length >= 3 && imagesWithAlt.length === images.length) {
            seoPoints += 10; seoPasses.push(`âœ… ${images.length} images, all with alt text`);
        } else if (images.length >= 1) {
            seoPoints += 5; seoIssues.push('âš ï¸ Ensure all images have descriptive alt text');
        } else {
            seoIssues.push('âš ï¸ Add images with alt text for better SEO');
        }

        // 8. Internal/External links (10 pts)
        const links = content.match(/<a\s/gi) || [];
        if (links.length >= 3) {
            seoPoints += 10; seoPasses.push(`âœ… ${links.length} links found`);
        } else {
            seoIssues.push('âš ï¸ Add internal and external links (min 3)');
        }

        // 9. Keyword density 1-3% (10 pts)
        const keywordOccurrences = primaryKeyword ? (lowerContent.match(new RegExp(primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
        const density = wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0;
        if (density >= 0.5 && density <= 3) {
            seoPoints += 10; seoPasses.push(`âœ… Keyword density: ${density.toFixed(1)}% (ideal)`);
        } else if (density > 3) {
            seoIssues.push(`âš ï¸ Keyword stuffing detected: ${density.toFixed(1)}% density`);
        } else if (primaryKeyword) {
            seoIssues.push(`âš ï¸ Low keyword density: ${density.toFixed(1)}%. Aim for 1-3%`);
        }

        const seoScore = Math.min(100, seoPoints);

        // ---- AEO SCORING (Answer Engine Optimization) ----
        const aeoIssues: string[] = [];
        const aeoPasses: string[] = [];
        let aeoPoints = 0;

        // 1. Question Headers (25 pts)
        const questionHeaders = (content.match(/<h[234][^>]*>[^<]*\?/gi) || []).length;
        if (questionHeaders >= 3) {
            aeoPoints += 25; aeoPasses.push(`âœ… ${questionHeaders} question headers (FAQ-ready)`);
        } else if (questionHeaders >= 1) {
            aeoPoints += 12; aeoIssues.push('âš ï¸ Add more question headers (e.g., "What is...?", "How does...?")');
        } else {
            aeoIssues.push('âš ï¸ No question headers found. Critical for voice search!');
        }

        // 2. Direct answers after questions (25 pts)
        const qaPattern = /<h[234][^>]*>[^<]*\?<\/h[234]>\s*<p>/gi;
        const directAnswers = (content.match(qaPattern) || []).length;
        if (directAnswers >= 2) {
            aeoPoints += 25; aeoPasses.push('âœ… Direct answers follow question headers');
        } else if (directAnswers >= 1) {
            aeoPoints += 12;
            aeoIssues.push('âš ï¸ Add direct answers immediately after question headers');
        } else if (questionHeaders > 0) {
            aeoIssues.push('âš ï¸ Place concise answers right after your question headers');
        }

        // 3. AEO Snippet provided (25 pts)
        if (aeoSnippet && aeoSnippet.split(/\s+/).length >= 20) {
            aeoPoints += 25; aeoPasses.push('âœ… AEO answer snippet provided (voice search ready)');
        } else {
            aeoIssues.push('âš ï¸ Add a 40-word AEO snippet for voice search (Siri/Alexa)');
        }

        // 4. Lists/Tables for featured snippets (25 pts)
        const hasList = /<[ou]l/i.test(content);
        const hasTable = /<table/i.test(content);
        if (hasList && hasTable) {
            aeoPoints += 25; aeoPasses.push('âœ… Lists AND tables found (snippet-ready)');
        } else if (hasList || hasTable) {
            aeoPoints += 12; aeoIssues.push('âš ï¸ Add both lists and tables for better featured snippets');
        } else {
            aeoIssues.push('âš ï¸ Add structured content (lists/tables) for featured snippets');
        }

        const aeoScore = Math.min(100, aeoPoints);

        // ---- GEO SCORING (Generative Engine Optimization) ----
        const geoIssues: string[] = [];
        const geoPasses: string[] = [];
        let geoPoints = 0;

        // 1. Authoritative citations (30 pts)
        const citationPatterns = /according to|cited by|research by|published in|study by|data from|FAO|WHO|USDA|university|journal/gi;
        const citations = (lowerContent.match(citationPatterns) || []).length;
        if (citations >= 5) {
            geoPoints += 30; geoPasses.push(`âœ… ${citations} authoritative citations found`);
        } else if (citations >= 2) {
            geoPoints += 15; geoIssues.push('âš ï¸ Add more authoritative citations (FAO, USDA, journals)');
        } else {
            geoIssues.push('âš ï¸ AI summaries prioritize cited content. Add "According to..." citations');
        }

        // 2. Citation sources provided (20 pts)
        if (citationSources && citationSources.length >= 3) {
            geoPoints += 20; geoPasses.push(`âœ… ${citationSources.length} citation source URLs provided`);
        } else {
            geoIssues.push('âš ï¸ Add citation source URLs for AI engine verification');
        }

        // 3. Data-driven content (20 pts)
        const dataIndicators = /\d+%|\d+\.\d+|statistic|data shows|research indicates|figure \d|table \d/gi;
        const dataPoints = (lowerContent.match(dataIndicators) || []).length;
        if (dataPoints >= 5) {
            geoPoints += 20; geoPasses.push(`âœ… ${dataPoints} data points found (AI-summary friendly)`);
        } else if (dataPoints >= 2) {
            geoPoints += 10; geoIssues.push('âš ï¸ Add more statistics and data points');
        } else {
            geoIssues.push('âš ï¸ No quantitative data found. AI summaries favor data-rich content');
        }

        // 4. Expertise signals (15 pts)
        const expertiseSignals = /expert|specialist|researcher|PhD|professor|years of experience|certified/gi;
        const expertCount = (lowerContent.match(expertiseSignals) || []).length;
        if (expertCount >= 2) {
            geoPoints += 15; geoPasses.push('âœ… Expertise signals detected (E-E-A-T compliant)');
        } else {
            geoIssues.push('âš ï¸ Add expertise signals (author credentials, experience mentions)');
        }

        // 5. Content depth/comprehensiveness (15 pts)
        if (wordCount >= 4000 && headingCount >= 8) {
            geoPoints += 15; geoPasses.push('âœ… Comprehensive depth: high word count + structured headings');
        } else {
            geoIssues.push('âš ï¸ AI engines favor comprehensive long-form content (4000+ words, 8+ sections)');
        }

        const geoScore = Math.min(100, geoPoints);

        // ---- READABILITY ----
        const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const syllableCount = words.reduce((total, word) => {
            const w = word.toLowerCase().replace(/[^a-z]/g, '');
            if (w.length <= 3) return total + 1;
            const vowelGroups = w.match(/[aeiouy]+/g) || [];
            return total + Math.max(1, vowelGroups.length);
        }, 0);

        const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
        const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;
        const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
        const fk = Math.max(0, Math.round(fleschKincaid * 10) / 10);

        let grade = 'Too Simple';
        if (fk >= 13) grade = 'Academic';
        else if (fk >= 10) grade = 'Professional';
        else if (fk >= 8) grade = 'Educated';
        else if (fk >= 6) grade = 'Standard';
        else if (fk >= 4) grade = 'Easy';

        // ---- KEYWORD DENSITY MAP ----
        const keywordDensity: Record<string, { count: number; density: number }> = {};
        focusKeywords.forEach(kw => {
            const kwLower = kw.toLowerCase();
            const escaped = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (lowerContent.match(new RegExp(escaped, 'g')) || []).length;
            keywordDensity[kw] = {
                count,
                density: wordCount > 0 ? Math.round((count / wordCount) * 10000) / 100 : 0
            };
        });

        const overall = Math.round((seoScore * 0.4 + aeoScore * 0.3 + geoScore * 0.3));

        return {
            seo: { score: seoScore, issues: seoIssues, passes: seoPasses },
            aeo: { score: aeoScore, issues: aeoIssues, passes: aeoPasses },
            geo: { score: geoScore, issues: geoIssues, passes: geoPasses },
            overall,
            readability: { fleschKincaid: fk, grade },
            keywordDensity
        };
    },

    // ---- ROADMAP STATS ----
    async getRoadmapStats(): Promise<{
        total: number;
        byStatus: Record<BlogStatus, number>;
        byPillar: Record<string, number>;
        totalWords: number;
        targetWords: number;
        completionPercent: number;
    }> {
        const posts = await this.getPosts();
        const byStatus: Record<BlogStatus, number> = { idea: 0, writing: 0, seo_review: 0, published: 0 };
        const byPillar: Record<string, number> = {};
        let totalWords = 0;
        let targetWords = 0;

        posts.forEach(p => {
            byStatus[p.status] = (byStatus[p.status] || 0) + 1;
            const pillarLabel = p.pillar ? PILLAR_META[p.pillar]?.label || p.pillar : 'Unknown';
            byPillar[pillarLabel] = (byPillar[pillarLabel] || 0) + 1;
            totalWords += p.word_count || 0;
            targetWords += p.target_word_count || 6000;
        });

        return {
            total: posts.length,
            byStatus,
            byPillar,
            totalWords,
            targetWords,
            completionPercent: targetWords > 0 ? Math.round((totalWords / targetWords) * 100) : 0
        };
    }
};

export default contentEngine;
