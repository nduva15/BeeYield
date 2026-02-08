import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, SupportRequest, RequestComment } from '@/services/beeyieldService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Search, Filter, MessageSquare, Clock, CheckCircle2,
    AlertCircle, AlertTriangle, User, History, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

export const SupportRequestsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin', 'support-requests'],
        queryFn: async () => {
            // In a real scenario, this would be an admin-only endpoint
            // for now we use the same service method but it might need refinement
            return await beeyieldService.getRequests();
        }
    });

    const { data: comments, isLoading: isLoadingComments } = useQuery({
        queryKey: ['admin', 'request-comments', selectedRequest?.id],
        queryFn: async () => {
            if (!selectedRequest) return [];
            return await beeyieldService.getRequestComments(selectedRequest.id);
        },
        enabled: !!selectedRequest
    });

    const addCommentMutation = useMutation({
        mutationFn: async (data: { requestId: string, text: string }) => {
            return await beeyieldService.addRequestComment(data.requestId, data.text);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'request-comments', selectedRequest?.id] });
            setReplyText('');
            toast.success("Response sent successfully");
        }
    });

    const filteredRequests = (requests || []).filter(req => {
        const matchesSearch =
            req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'in_progress': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'closed': return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
            default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
            case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-200';
            default: return 'bg-blue-500/10 text-blue-600 border-blue-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID or subject..."
                        className="pl-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full capitalize whitespace-nowrap"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="border-b border-border bg-muted/30">
                    <CardTitle className="text-xl font-bold">Support Pipeline</CardTitle>
                    <CardDescription>Manage incoming hardware, software and traceability assistance requests.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/20">
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Reference</TableHead>
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Category</TableHead>
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Subject</TableHead>
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Priority</TableHead>
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Date</TableHead>
                                <TableHead className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-20"><Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-20 text-muted-foreground">No matching requests found.</TableCell></TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id} className="hover:bg-muted/20 transition-colors border-border/10 cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                        <TableCell className="px-6 font-mono text-xs text-primary">{req.reference_id}</TableCell>
                                        <TableCell className="px-6 capitalize text-xs font-semibold">{req.category}</TableCell>
                                        <TableCell className="px-6 max-w-[200px]">
                                            <div className="font-bold truncate">{req.subject}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{req.description}</div>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 capitalize", getPriorityColor(req.priority))}>
                                                {req.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(req.status)}
                                                <span className="text-xs capitalize font-medium">{req.status.replace('_', ' ')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 text-xs text-muted-foreground">
                                            {format(new Date(req.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 overflow-hidden border-none glass">
                    {selectedRequest && (
                        <>
                            <DialogHeader className="p-6 border-b border-border/50 bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="font-mono text-[10px]">{selectedRequest.reference_id}</Badge>
                                    <Badge variant="outline" className={cn("capitalize", getPriorityColor(selectedRequest.priority))}>
                                        {selectedRequest.priority} Priority
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl font-bold tracking-tight">{selectedRequest.subject}</DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none capitalize">{selectedRequest.category}</Badge>
                                    <span>•</span>
                                    <span>Submitted on {format(new Date(selectedRequest.created_at), 'PPP')}</span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-6 space-y-6">
                                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <AlertTriangle className="h-3 w-3" /> Issue Description
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/80">{selectedRequest.description}</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <History className="h-3 w-3" /> Communication Thread
                                    </h4>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                        {isLoadingComments ? (
                                            <div className="flex justify-center p-8"><Clock className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                        ) : comments?.length === 0 ? (
                                            <div className="text-center p-8 bg-muted/30 rounded-2xl text-xs text-muted-foreground italic">
                                                No comments yet. Be the first to respond!
                                            </div>
                                        ) : (
                                            comments?.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className={cn(
                                                        "flex flex-col gap-1 max-w-[85%]",
                                                        comment.is_internal ? "ml-auto items-end" : "items-start"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "rounded-2xl p-3 text-sm shadow-sm",
                                                        comment.is_internal
                                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                                            : "bg-muted border border-border/50 rounded-tl-none"
                                                    )}>
                                                        {comment.comment_text}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                                                        <span>{comment.is_internal ? 'BeeYield Support' : 'Farmer'}</span>
                                                        <span>•</span>
                                                        <span>{format(new Date(comment.created_at), 'p')}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border/50 bg-muted/30">
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Type your response here..."
                                        className="rounded-2xl bg-background border-border/50 min-h-[80px] resize-none focus-visible:ring-primary"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <Button
                                        className="rounded-2xl h-auto aspect-square flex items-center justify-center p-0 w-20 shadow-glow"
                                        disabled={!replyText.trim() || addCommentMutation.isPending}
                                        onClick={() => addCommentMutation.mutate({ requestId: selectedRequest.id, text: replyText })}
                                    >
                                        {addCommentMutation.isPending ? <Clock className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
