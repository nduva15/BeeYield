import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Save, ArrowLeft, Wand2, Plus, GripVertical, Trash2,
    RefreshCcw, Eye, Download, LayoutTemplate, Sparkles,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import contentEngine, { ContentPost, BlogChapter, SEOScoreResult, PILLAR_META } from '@/services/contentEngineService';
import SeoScorecard from './SeoScorecard';

const ContentEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [post, setPost] = React.useState<ContentPost | null>(null);
    const [chapters, setChapters] = React.useState<BlogChapter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [analysis, setAnalysis] = React.useState<SEOScoreResult | null>(null);

    // Editor State
    const [activeChapterId, setActiveChapterId] = React.useState<string | null>(null);
    const [editedContent, setEditedContent] = React.useState('');

    // AI Generation State
    const [generating, setGenerating] = React.useState(false);
    const [publishing, setPublishing] = React.useState(false);
    const [aiContext, setAiContext] = React.useState('');

    React.useEffect(() => {
        if (id) loadPost(id);
    }, [id]);

    const loadPost = async (postId: string) => {
        setLoading(true);
        try {
            const [postData, chaptersData] = await Promise.all([
                contentEngine.getPost(postId),
                contentEngine.getChapters(postId)
            ]);

            if (!postData) {
                toast.error("Post not found");
                navigate('/ceba/content');
                return;
            }

            setPost(postData);
            setChapters(chaptersData);

            // Set initial active chapter
            if (chaptersData.length > 0) {
                setActiveChapterId(chaptersData[0].id);
                setEditedContent(chaptersData[0].content_markdown || chaptersData[0].content_html);
            }

            // Run initial analysis if we have content
            if (postData.content_html || postData.content_markdown) {
                runAnalysis(postData, chaptersData);
            }

        } catch (error) {
            console.error("Failed to load post", error);
            toast.error("Failed to load editor");
        } finally {
            setLoading(false);
        }
    };

    const runAnalysis = async (currentPost: ContentPost, currentChapters: BlogChapter[]) => {
        // Combine all chapters for full context
        const fullContent = currentChapters
            .sort((a, b) => a.chapter_number - b.chapter_number)
            .map(c => c.content_html || c.content_markdown)
            .join(' ');

        // Get metadata
        const metadata = await contentEngine.getSEOMetadata(currentPost.id);
        const keywords = metadata?.focus_keywords || currentPost.tags || [];

        const result = contentEngine.analyzeContent(
            fullContent,
            currentPost.title,
            keywords,
            metadata?.meta_title,
            metadata?.meta_description,
            metadata?.aeo_answer_snippet,
            metadata?.geo_citation_sources
        );

        setAnalysis(result);

        // Save scores to DB
        if (metadata) {
            await contentEngine.updateSEOMetadata(currentPost.id, {
                seo_score: result.seo.score,
                aeo_score: result.aeo.score,
                geo_score: result.geo.score,
                overall_score: result.overall,
                last_analyzed_at: new Date().toISOString()
            });
        }
    };

    const handleChapterSelect = (chapter: BlogChapter) => {
        // Auto-save previous if needed could be implemented here
        setActiveChapterId(chapter.id);
        setEditedContent(chapter.content_markdown || chapter.content_html || '');
    };

    const handleSaveChapter = async () => {
        if (!activeChapterId) return;
        setSaving(true);
        try {
            await contentEngine.updateChapter(activeChapterId, {
                content_markdown: editedContent,
                content_html: editedContent // In a real app, convert MD to HTML here
            });

            // Update local state
            const updatedChapters = chapters.map(c =>
                c.id === activeChapterId ? { ...c, content_markdown: editedContent, content_html: editedContent } : c
            );
            setChapters(updatedChapters);

            // Re-run analysis
            if (post) runAnalysis(post, updatedChapters);
            toast.success("Chapter saved");
        } catch (error) {
            toast.error("Failed to save chapter");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateChapter = async () => {
        if (!activeChapterId || !post) return;
        const chapter = chapters.find(c => c.id === activeChapterId);
        if (!chapter) return;

        setGenerating(true);
        try {
            const content = await contentEngine.generateChapterContent({
                title: post.title,
                chapter_heading: chapter.heading,
                context: aiContext,
                tone: 'professional_educational'
            });

            setEditedContent(content);
            // Auto save
            await contentEngine.updateChapter(activeChapterId, {
                content_markdown: content,
                content_html: content,
                status: 'complete'
            });

            toast.success("Chapter generated");

            // Update local
            const updatedChapters: BlogChapter[] = chapters.map(c =>
                c.id === activeChapterId ? { ...c, content_markdown: content, content_html: content, status: 'complete' as const } : c
            ) as BlogChapter[];

            setChapters(updatedChapters);
            runAnalysis(post, updatedChapters);

        } catch (error) {
            toast.error("Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateOutline = async () => {
        if (!post) return;
        setGenerating(true);
        try {
            const headings = await contentEngine.generateOutline(post.title);

            // Delete existing chapters (optional, maybe ask confirm)
            // For now, just append

            const newChapters = await Promise.all(headings.map((heading, index) =>
                contentEngine.createChapter({
                    post_id: post.id,
                    chapter_number: index + 1,
                    heading: heading,
                    status: 'pending'
                })
            ));

            const validChapters = newChapters.filter(Boolean) as BlogChapter[];
            setChapters(validChapters);
            if (validChapters.length > 0) handleChapterSelect(validChapters[0]);

            toast.success("Outline generated");
        } catch (error) {
            toast.error("Failed to generate outline");
        } finally {
            setGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!post) return;
        if (!confirm("Are you sure you want to publish this post to the live site?")) return;

        setPublishing(true);
        try {
            const result = await contentEngine.publishPost(post.id);
            if (result) {
                setPost(result);
                toast.success("Post published successfully!");
            }
        } catch (error) {
            toast.error("Failed to publish post");
        } finally {
            setPublishing(false);
        }
    };

    const handleAddChapter = async () => {
        if (!post) return;
        const heading = prompt("Enter chapter heading:");
        if (!heading) return;

        const newChapter = await contentEngine.createChapter({
            post_id: post.id,
            chapter_number: chapters.length + 1,
            heading: heading,
            status: 'pending'
        });

        if (newChapter) {
            setChapters([...chapters, newChapter]);
            handleChapterSelect(newChapter);
        }
    };

    if (loading) return <div>Loading editor...</div>;
    if (!post) return <div>Post not found</div>;

    const activeChapter = chapters.find(c => c.id === activeChapterId);

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Bar */}
            <div className="border-b px-4 py-2 flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/ceba/content')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg truncate max-w-md">{post.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" style={{ color: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color }}>
                                {post.pillar ? PILLAR_META[post.pillar].label : 'General'}
                            </Badge>
                            <span>{(analysis?.overall || 0)}/100 Score</span>
                            <span>•</span>
                            <span>{chapters.reduce((acc, c) => acc + (c.word_count || 0), 0)} words</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                SEO Assistant
                                {analysis && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                                        {analysis.overall}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] p-0">
                            {analysis && <SeoScorecard analysis={analysis} focusKeywords={post.tags || []} />}
                        </SheetContent>
                    </Sheet>

                    <Button variant="outline" size="sm" onClick={() => window.open(`/blogs/${post.slug}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <Button size="sm" onClick={handleSaveChapter} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Chapter'}
                    </Button>
                    {post.status !== 'published' && (
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            onClick={handlePublish}
                            disabled={publishing}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> {publishing ? 'Publishing...' : 'Publish Post'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Chapter Sidebar */}
                <div className="w-64 border-r bg-muted/10 flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-sm">Chapters</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddChapter}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {chapters.length === 0 && (
                                <div className="text-center p-4">
                                    <p className="text-sm text-muted-foreground mb-4">No chapters yet</p>
                                    <Button size="sm" variant="outline" onClick={handleGenerateOutline} disabled={generating}>
                                        <Wand2 className="w-3 h-3 mr-2" /> Auto-Generate Outline
                                    </Button>
                                </div>
                            )}

                            {chapters.map((chapter) => (
                                <div
                                    key={chapter.id}
                                    className={`
                                        group flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm
                                        ${activeChapterId === chapter.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}
                                    `}
                                    onClick={() => handleChapterSelect(chapter)}
                                >
                                    <div className="text-xs text-muted-foreground w-4">{chapter.chapter_number}.</div>
                                    <div className="flex-1 truncate">{chapter.heading}</div>
                                    {chapter.status === 'complete' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                    {chapter.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-3 border-t bg-card">
                        <div className="text-xs font-medium mb-2">Editor Tools</div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="text-xs" onClick={handleGenerateOutline}>
                                <LayoutTemplate className="w-3 h-3 mr-1" /> Re-Outline
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Center: Writing Area */}
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white dark:bg-zinc-950 shadow-sm border-x">
                    {activeChapter ? (
                        <>
                            <div className="p-6 border-b pb-4">
                                <Input
                                    className="text-xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
                                    value={activeChapter.heading}
                                    onChange={(e) => {
                                        const newHeading = e.target.value;
                                        setChapters(prev => prev.map(c => c.id === activeChapter.id ? { ...c, heading: newHeading } : c));
                                    }}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                        Chapter {activeChapter.chapter_number}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {editedContent.split(/\s+/).filter(Boolean).length} words
                                    </span>
                                </div>
                            </div>

                            {/* Processing Context Bar */}
                            <div className="px-6 py-2 bg-muted/20 border-b flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-purple-600" />
                                <Input
                                    placeholder="Instruction: e.g., 'Focus on sustainable practices and include a data table comparing yields'"
                                    className="h-8 text-sm bg-transparent border-none shadow-none focus-visible:ring-0"
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700"
                                    onClick={handleGenerateChapter}
                                    disabled={generating}
                                >
                                    {generating ? <RefreshCcw className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                    Write Chapter
                                </Button>
                            </div>

                            <Tabs defaultValue="write" className="flex-1 flex flex-col">
                                <div className="px-6 pt-2">
                                    <TabsList className="w-[200px]">
                                        <TabsTrigger value="write">Write</TabsTrigger>
                                        <TabsTrigger value="preview">Preview</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="write" className="flex-1 p-0 m-0 relative">
                                    <Textarea
                                        className="w-full h-full resize-none border-none p-6 text-base leading-relaxed focus-visible:ring-0 font-mono"
                                        placeholder="Start writing or use our system to generate content..."
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                    />
                                </TabsContent>

                                <TabsContent value="preview" className="flex-1 p-6 overflow-auto prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {editedContent}
                                    </ReactMarkdown>
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <LayoutTemplate className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Chapter Selected</h3>
                            <p className="max-w-sm mb-6">Select a chapter from the sidebar to start writing, or generate a new outline to get started.</p>
                            <Button onClick={handleGenerateOutline}>Generate Outline</Button>
                        </div>
                    )}
                </div>

                {/* Right: Quick Stats (Hidden on small screens) */}
                <div className="hidden xl:block w-64 border-l p-4 bg-muted/5">
                    <h3 className="font-semibold text-sm mb-4">Optimization Check</h3>

                    {analysis ? (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Content Score</span>
                                    <span className="font-bold">{analysis.overall}/100</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all" style={{ width: `${analysis.overall}%` }} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    {analysis.seo.score >= 80 ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                                    <span>SEO (Google): {analysis.seo.score}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {analysis.aeo.score >= 80 ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                                    <span>AEO (Voice): {analysis.aeo.score}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {analysis.geo.score >= 80 ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                                    <span>GEO (Insight): {analysis.geo.score}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-700 dark:text-blue-300">
                                <strong>Tip:</strong> {analysis.seo.issues[0]?.replace('⚠️ ', '') || "Good job! Keep writing."}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground text-center">
                            Stats update as you write...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentEditor;
