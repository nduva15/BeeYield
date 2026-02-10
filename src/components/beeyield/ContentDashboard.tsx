import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    LayoutList, FileText, CheckCircle2, AlertCircle, Calendar, User,
    ArrowRight, Plus, Search, Filter, RefreshCw, BarChart3, Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import contentEngine, { ContentPost, BlogStatus, ContentPillar, PILLAR_META, CATEGORY_COLORS } from '@/services/contentEngineService';

const KanbanColumn = ({
    title,
    status,
    posts,
    onDragStart,
    onDrop,
    onEdit_
}: {
    title: string,
    status: BlogStatus,
    posts: ContentPost[],
    onDragStart: (e: React.DragEvent, id: string) => void,
    onDrop: (e: React.DragEvent, status: BlogStatus) => void,
    onEdit_: (id: string) => void
}) => {
    return (
        <div
            className="flex-1 min-w-[300px] bg-muted/30 rounded-xl p-4 border border-dashed border-muted-foreground/20"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    {status === 'idea' && <LayoutList className="w-4 h-4 text-slate-500" />}
                    {status === 'writing' && <Edit3 className="w-4 h-4 text-blue-500" />}
                    {status === 'seo_review' && <Search className="w-4 h-4 text-amber-500" />}
                    {status === 'published' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {title}
                </h3>
                <Badge variant="secondary" className="rounded-full px-2">
                    {posts.length}
                </Badge>
            </div>

            <div className="space-y-3 min-h-[500px]">
                {posts.map(post => (
                    <Card
                        key={post.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, post.id)}
                        className="cursor-move hover:shadow-md transition-all active:cursor-grabbing border-l-4"
                        style={{ borderLeftColor: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color || '#ccc' }}
                        onClick={() => onEdit_(post.id)}
                    >
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wider" style={{
                                    color: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color,
                                    borderColor: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color + '40',
                                    backgroundColor: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color + '10'
                                }}>
                                    {post.pillar ? PILLAR_META[post.pillar].label.split(' ')[0] : 'General'}
                                </Badge>
                                {post.priority && (
                                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                                        High
                                    </Badge>
                                )}
                            </div>

                            <h4 className="font-medium text-sm line-clamp-2 leading-snug">
                                {post.title}
                            </h4>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-dashed mt-2">
                                <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    <span>{Math.round(post.word_count / 1000)}k / {Math.round(post.target_word_count / 1000)}k words</span>
                                </div>
                                {post.author_name && (
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span className="truncate max-w-[80px]">{post.author_name.split(' ')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {posts.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-sm text-muted-foreground italic border-2 border-dashed rounded-lg">
                        Empty
                    </div>
                )}
            </div>
        </div>
    );
};

const ContentDashboard = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<ContentPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [pillarFilter, setPillarFilter] = useState('all');

    const loadData = async () => {
        setLoading(true);
        try {
            const [postsData, statsData] = await Promise.all([
                contentEngine.getPosts(),
                contentEngine.getRoadmapStats()
            ]);
            setPosts(postsData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to load content data", error);
            toast.error("Failed to load content dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('postId', id);
    };

    const handleDrop = async (e: React.DragEvent, newStatus: BlogStatus) => {
        const id = e.dataTransfer.getData('postId');
        if (!id) return;

        // Optimistic update
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));

        try {
            await contentEngine.updatePost(id, { status: newStatus });
            toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            toast.error("Failed to update status");
            loadData(); // Revert
        }
    };

    const handleEditPost = (id: string) => {
        // Navigate to the editor (we'll create this route next)
        navigate(`/ceba/content/editor/${id}`);
    };

    const handleCreatePost = async () => {
        try {
            const newPost = await contentEngine.createPost({
                title: "New Untitled Post",
                status: 'idea',
                category: 'bees',
                pillar: 'bee_biology_behavior',
                target_word_count: 6000
            });
            if (newPost) {
                toast.success("New post created");
                handleEditPost(newPost.id);
            }
        } catch (error) {
            toast.error("Failed to create post");
        }
    };

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesPillar = pillarFilter === 'all' || p.pillar === pillarFilter;
        return matchesSearch && matchesPillar;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Roadmap</CardTitle>
                        <div className="text-2xl font-bold">{stats?.total || 0} Posts</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Words Written</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                            {(stats?.totalWords || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target: {(stats?.targetWords || 270000).toLocaleString()} ({(stats?.completionPercent || 0)}%)
                        </p>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.byStatus?.published || 0}
                        </div>
                    </CardHeader>
                </Card>
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="py-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-medium text-primary">Content Hub</CardTitle>
                            <div className="text-sm font-bold mt-1 text-primary">Active</div>
                        </div>
                        <Button onClick={handleCreatePost} size="sm">
                            <Plus className="w-4 h-4 mr-1" /> New Post
                        </Button>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 py-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={pillarFilter} onValueChange={setPillarFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by Pillar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Pillars</SelectItem>
                        {Object.entries(PILLAR_META).map(([key, meta]) => (
                            <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                    <span>{meta.icon}</span>
                                    <span>{meta.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={loadData}>
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Kanban Board */}
            <ScrollArea className="flex-1">
                <div className="flex gap-4 pb-6 min-w-[1200px]">
                    <KanbanColumn
                        title="Idea List"
                        status="idea"
                        posts={filteredPosts.filter(p => p.status === 'idea')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                    <KanbanColumn
                        title="Writing (Helper)"
                        status="writing"
                        posts={filteredPosts.filter(p => p.status === 'writing')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                    <KanbanColumn
                        title="Review"
                        status="seo_review"
                        posts={filteredPosts.filter(p => p.status === 'seo_review')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                    <KanbanColumn
                        title="Published"
                        status="published"
                        posts={filteredPosts.filter(p => p.status === 'published')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                </div>
            </ScrollArea>
        </div>
    );
};

export default ContentDashboard;
