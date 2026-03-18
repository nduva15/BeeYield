
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    LayoutList, FileText, CheckCircle2, AlertCircle, Calendar, User,
    ArrowRight, Plus, Search, Filter, RefreshCw, BarChart3, Edit3, Globe, Zap, PenTool
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import contentEngine, { ContentPost, BlogStatus, ContentPillar, PILLAR_META } from '@/services/contentEngineService';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

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
            className="flex-1 min-w-[320px] bg-muted/5 rounded-2xl p-5 border border-[#F4D03F]/5 flex flex-col gap-4 group/column transition-all duration-300 hover:bg-muted/10"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-xl border",
                        status === 'idea' ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                        status === 'writing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        status === 'seo_review' ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                        {status === 'idea' && <LayoutList className="w-4 h-4" />}
                        {status === 'writing' && <PenTool className="w-4 h-4" />}
                        {status === 'seo_review' && <Zap className="w-4 h-4" />}
                        {status === 'published' && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <h3 className="font-black text-[11px] tracking-widest uppercase opacity-80">{title}</h3>
                </div>
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-black text-[9px] bg-muted/20 border-border/50">
                    {posts.length}
                </Badge>
            </div>

            <div className="flex-1 space-y-4 min-h-[500px]">
                {posts.map(post => (
                    <div
                        key={post.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, post.id)}
                        className="cursor-grab active:cursor-grabbing transform transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group"
                        onClick={() => onEdit_(post.id)}
                    >
                        <div 
                            className={cn(glass.section, "p-4 relative overflow-hidden h-full border-l-4")}
                            style={{ borderLeftColor: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color || '#ccc' }}
                        >
                            <div className="flex justify-between items-start gap-2 mb-3">
                                <Badge variant="outline" className="text-[8px] font-black h-5 px-2 tracking-widest uppercase rounded-lg" style={{
                                    color: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color,
                                    borderColor: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color + '40',
                                    backgroundColor: PILLAR_META[post.pillar || 'bee_biology_behavior']?.color + '10'
                                }}>
                                    {post.pillar ? PILLAR_META[post.pillar].label : 'General'}
                                </Badge>
                                {post.priority && (
                                    <div className="flex items-center gap-1 text-[8px] font-black text-destructive uppercase tracking-widest animate-pulse">
                                        <Zap className="w-3 h-3 fill-current" /> High Priority
                                    </div>
                                )}
                            </div>

                            <h4 className="font-black text-sm leading-tight text-white/90 group-hover:text-primary transition-colors mb-4 line-clamp-2 uppercase tracking-tighter">
                                {post.title}
                            </h4>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                                <div className="flex items-center gap-1.5 opacity-40 font-mono text-[9px] uppercase tracking-widest">
                                    <FileText className="w-3 h-3" />
                                    <span>{Math.round(post.word_count / 1000)}k / {Math.round(post.target_word_count / 1000)}k</span>
                                </div>
                                {post.author_name && (
                                    <div className="flex items-center gap-1.5 opacity-40 font-mono text-[9px] uppercase tracking-widest">
                                        <User className="w-3 h-3" />
                                        <span className="truncate max-w-[80px]">{post.author_name.split(' ')[0]}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="h-24 flex flex-col items-center justify-center gap-2 text-[9px] font-black tracking-widest text-muted-foreground/30 border-2 border-dashed border-muted/50 rounded-2xl uppercase italic">
                        No active protocols
                    </div>
                )}
            </div>
        </div>
    );
};

const ContentDashboard = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = React.useState<ContentPost[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState<any>(null);
    const [search, setSearch] = React.useState('');
    const [pillarFilter, setPillarFilter] = React.useState('all');

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

    React.useEffect(() => {
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
            <div className="flex items-center justify-center p-24 h-full">
                <RefreshCw className="w-10 h-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    return (
        <div className="space-y-8 h-full flex flex-col animate-in fade-in zoom-in-95 duration-700">
            <PageHeader
                icon={FileText}
                label="Knowledge Base"
                title="Content Engine"
                subtitle="Centralized management for documentation, research, and educational publications."
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                            onClick={handleCreatePost} 
                            className="h-10 px-4 rounded-xl bg-primary text-black font-black text-[11px] tracking-widest uppercase hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4 mr-2" /> New Protocol
                        </Button>
                    </div>
                }
            />

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassStatCard
                    label="Active Roadmap"
                    value={`${stats?.total || 0} Posts`}
                    icon={LayoutList}
                />
                <GlassStatCard
                    label="Knowledge Mass"
                    value={(stats?.totalWords || 0).toLocaleString()}
                    icon={FileText}
                />
                <GlassStatCard
                    label="Sync Completion"
                    value={`${stats?.completionPercent || 0}%`}
                    icon={BarChart3}
                    color="text-primary"
                />
                <GlassStatCard
                    label="Public Assets"
                    value={stats?.byStatus?.published || 0}
                    icon={Globe}
                    color="text-emerald-500"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 py-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="SEARCH PROTOCOLS..."
                        className="pl-10 h-11 bg-muted/20 border-border/50 rounded-xl font-black text-[10px] tracking-widest uppercase placeholder:text-muted-foreground/30 focus:ring-primary focus:border-primary transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={pillarFilter} onValueChange={setPillarFilter}>
                    <SelectTrigger className="w-[240px] h-11 bg-muted/20 border-border/50 rounded-xl font-black text-[10px] tracking-widest uppercase">
                        <SelectValue placeholder="FILTER BY CLASSIFICATION" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-[#F4D03F]/10">
                        <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">Global Classification</SelectItem>
                        {Object.entries(PILLAR_META).map(([key, meta]) => (
                            <SelectItem key={key} value={key} className="font-black text-[10px] uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">{meta.icon}</span>
                                    <span>{meta.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Kanban Board */}
            <ScrollArea className="flex-1 -mx-4 px-4 overflow-visible">
                <div className="flex gap-6 pb-8 min-w-[1200px]">
                    <KanbanColumn
                        title="Intel Idea List"
                        status="idea"
                        posts={filteredPosts.filter(p => p.status === 'idea')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                    <KanbanColumn
                        title="Draft Generation"
                        status="writing"
                        posts={filteredPosts.filter(p => p.status === 'writing')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                    <KanbanColumn
                        title="Quality Control"
                        status="seo_review"
                        posts={filteredPosts.filter(p => p.status === 'seo_review')}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onEdit_={handleEditPost}
                    />
                    <KanbanColumn
                        title="Public Deployment"
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
