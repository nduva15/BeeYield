import React from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    HelpCircle,
    Loader2,
    MessageSquare,
    Plus,
    Search,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useAddRequestComment, useCreateRequest, useDeleteRequest, useRequestComments, useRequestDetail, useRequests, useUpdateRequest } from '@/hooks/useRequests';
import { RequestCreateInput, SupportRequest } from '@/services/beeyieldService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BeeYieldEmptyState, BeeYieldFormField, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { GlassConfirmModal, GlassStatCard, glass } from './GlassTheme';
import { getApiaryDisplayName, getHiveDisplayName } from '@/lib/beeyieldDisplay';

const CATEGORIES = [
    { id: 'Hardware', label: 'Hardware' },
    { id: 'Software', label: 'Software' },
    { id: 'Traceability', label: 'Traceability' },
    { id: 'General', label: 'General' },
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
const EDITABLE_STATUSES = ['Draft', 'Open'] as const;

function normalizeStatus(status?: string) {
    const value = String(status || '').trim().toLowerCase().replace(/_/g, ' ');
    if (value === 'draft') return 'Draft';
    if (value === 'in progress') return 'In Progress';
    if (value === 'resolved' || value === 'closed') return 'Resolved';
    return 'Open';
}

function statusIcon(status?: string) {
    const normalized = normalizeStatus(status);
    if (normalized === 'Resolved') return CheckCircle2;
    if (normalized === 'In Progress') return Clock3;
    if (normalized === 'Draft') return ShieldAlert;
    return AlertCircle;
}

function statusClasses(status?: string) {
    const normalized = normalizeStatus(status);
    if (normalized === 'Resolved') return 'bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20';
    if (normalized === 'In Progress') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (normalized === 'Draft') return 'bg-slate-200 text-slate-700 border-slate-300';
    return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
}

function emptyForm(): RequestCreateInput & { status: 'Draft' | 'Open' } {
    return {
        subject: '',
        description: '',
        type: 'support',
        category: 'General',
        priority: 'Medium',
        apiary_id: '',
        hive_id: '',
        status: 'Open',
    };
}

const MyRequestsView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    const { data: apiaries = [] } = useApiaries();
    const { data: requests = [], isLoading, refetch } = useRequests();
    const createRequest = useCreateRequest();
    const updateRequest = useUpdateRequest();
    const deleteRequest = useDeleteRequest();

    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingRequest, setEditingRequest] = React.useState<SupportRequest | null>(null);
    const [selectedRequestId, setSelectedRequestId] = React.useState<string>('');
    const [requestToDelete, setRequestToDelete] = React.useState<SupportRequest | null>(null);
    const [commentDraft, setCommentDraft] = React.useState('');
    const [form, setForm] = React.useState(emptyForm);

    const selectedApiaryId = form.apiary_id || editingRequest?.apiary_id || '';
    const { data: hives = [] } = useHives(selectedApiaryId || undefined);
    const requestDetail = useRequestDetail(selectedRequestId);
    const selectedRequest = requestDetail.data || requests.find((request) => request.id === selectedRequestId) || null;
    const requestComments = useRequestComments(selectedRequest?.id || null);
    const addRequestComment = useAddRequestComment();

    const stats = React.useMemo(() => {
        const normalized = requests.map((request) => normalizeStatus(request.status));
        return {
            total: requests.length,
            actionable: normalized.filter((status) => status === 'Open' || status === 'Draft').length,
            resolved: normalized.filter((status) => status === 'Resolved').length,
            urgent: requests.filter((request) => String(request.priority).toLowerCase() === 'high' || String(request.priority).toLowerCase() === 'critical').length,
        };
    }, [requests]);

    const filteredRequests = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        return requests.filter((request) => {
            const normalized = normalizeStatus(request.status);
            const matchesStatus = statusFilter === 'All' || normalized === statusFilter;
            if (!matchesStatus) return false;
            if (!query) return true;
            return (
                request.subject.toLowerCase().includes(query) ||
                request.description.toLowerCase().includes(query) ||
                request.id.toLowerCase().includes(query)
            );
        });
    }, [requests, search, statusFilter]);

    const canEdit = React.useMemo(() => {
        if (!selectedRequest) return false;
        return EDITABLE_STATUSES.includes(normalizeStatus(selectedRequest.status) as (typeof EDITABLE_STATUSES)[number]);
    }, [selectedRequest]);

    const availableHives = React.useMemo(
        () => hives.filter((hive) => !selectedApiaryId || hive.apiary_id === selectedApiaryId),
        [hives, selectedApiaryId]
    );

    const getApiaryName = React.useCallback(
        (apiaryId?: string) => {
            if (!apiaryId) return 'No apiary linked';
            return getApiaryDisplayName(apiaries.find((apiary) => apiary.id === apiaryId));
        },
        [apiaries]
    );

    const getHiveName = React.useCallback(
        (hiveId?: string) => {
            if (!hiveId) return 'No hive linked';
            return getHiveDisplayName(
                availableHives.find((hive) => hive.id === hiveId) ||
                hives.find((hive) => hive.id === hiveId)
            );
        },
        [availableHives, hives]
    );

    const openCreateForm = () => {
        setEditingRequest(null);
        setForm(emptyForm());
        setIsFormOpen(true);
    };

    const openEditForm = (request: SupportRequest) => {
        setEditingRequest(request);
        setForm({
            subject: request.subject,
            description: request.description,
            type: request.type || 'support',
            category: request.category || 'General',
            priority: String(request.priority || 'Medium'),
            apiary_id: request.apiary_id || '',
            hive_id: request.hive_id || '',
            status: normalizeStatus(request.status) as 'Draft' | 'Open',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.subject.trim() || !form.description.trim()) {
            toast.error('Subject and description are required');
            return;
        }

        if (editingRequest) {
            const response = await updateRequest.mutateAsync({
                id: editingRequest.id,
                data: {
                    subject: form.subject.trim(),
                    description: form.description.trim(),
                    type: form.type,
                    category: form.category,
                    priority: form.priority,
                    apiary_id: form.apiary_id || undefined,
                    hive_id: form.hive_id || undefined,
                    status: form.status,
                },
            });
            if (response.error) return;
            setSelectedRequestId(editingRequest.id);
        } else {
            const response = await createRequest.mutateAsync({
                subject: form.subject.trim(),
                description: form.description.trim(),
                type: form.type,
                category: form.category,
                priority: form.priority,
                apiary_id: form.apiary_id || undefined,
                hive_id: form.hive_id || undefined,
            });
            if (response.error || !response.data) return;
            setSelectedRequestId(response.data.id);
        }

        setIsFormOpen(false);
        setEditingRequest(null);
        setForm(emptyForm());
    };

    const handleDelete = async () => {
        if (!requestToDelete) return;
        await deleteRequest.mutateAsync(requestToDelete.id);
        if (selectedRequestId === requestToDelete.id) {
            setSelectedRequestId('');
        }
        setRequestToDelete(null);
    };

    const handleAddComment = async () => {
        if (!selectedRequest || !commentDraft.trim()) return;
        const response = await addRequestComment.mutateAsync({
            requestId: selectedRequest.id,
            message: commentDraft.trim(),
        });
        if (response.error) return;
        setCommentDraft('');
    };

    return (
        <BeeYieldPageShell className={glass.page}>
            <div className="space-y-6">
                <BeeYieldPageHeader
                    icon={MessageSquare}
                    label="Support intelligence"
                    onBack={() => onTabChange('home')}
                    onRefresh={() => { void refetch(); }}
                    title={<>My <span className="text-[#F4D03F]">Requests</span></>}
                    subtitle="Create, track, update, and close your BeeYield support requests from the same dashboard language as home."
                    actions={
                        <Button className={glass.btnPrimary} onClick={openCreateForm}>
                            <Plus className="w-4 h-4" />
                            New Request
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <GlassStatCard label="Total requests" value={stats.total} icon={MessageSquare} />
                    <GlassStatCard label="Actionable" value={stats.actionable} icon={AlertCircle} />
                    <GlassStatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} />
                    <GlassStatCard label="High priority" value={stats.urgent} icon={ShieldAlert} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className={cn(glass.card, 'p-5 space-y-4')}>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className={cn(glass.input, 'pl-10')}
                                    placeholder="Search subject, description, or reference"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All statuses</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <BeeYieldEmptyState
                                icon={HelpCircle}
                                title="No requests yet"
                                description="Open your first request and the list, details, and backend state will stay in sync here."
                                action={{ label: 'Create request', onClick: openCreateForm }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {filteredRequests.map((request) => {
                                    const StatusIcon = statusIcon(request.status);
                                    const normalizedStatus = normalizeStatus(request.status);
                                    return (
                                        <button
                                            key={request.id}
                                            type="button"
                                            onClick={() => setSelectedRequestId(request.id)}
                                            className={cn(
                                                'w-full rounded-2xl border px-4 py-4 text-left transition-all bg-white/60 hover:bg-white',
                                                selectedRequestId === request.id ? 'border-[#F4D03F]/50 shadow-sm' : 'border-[#F4D03F]/15'
                                            )}
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="space-y-2 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-black tracking-[0.18em] text-[#F4D03F]">
                                                            #{request.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                        <Badge className="bg-slate-100 text-slate-600 border-transparent text-[10px]">
                                                            {request.category || 'General'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm font-bold text-[#1A1A1A]">{request.subject}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-2">{request.description}</div>
                                                    <div className="text-[11px] text-gray-500">
                                                        {request.apiary_id ? getApiaryName(request.apiary_id) : 'No apiary linked'}
                                                        {request.hive_id ? ` / ${getHiveName(request.hive_id)}` : ''}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start lg:items-end gap-2">
                                                    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold', statusClasses(normalizedStatus))}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {normalizedStatus}
                                                    </div>
                                                    <div className="text-[10px] font-semibold text-gray-500">{request.priority}</div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className={cn(glass.card, 'p-5')}>
                        {!selectedRequest ? (
                            <BeeYieldEmptyState
                                icon={MessageSquare}
                                title="Select a request"
                                description="Choose a request to inspect the backend record, linked entities, and available actions."
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black tracking-[0.18em] text-[#F4D03F]">
                                            #{selectedRequest.id.slice(0, 8).toUpperCase()}
                                        </div>
                                        <h3 className="text-lg font-bold text-[#1A1A1A]">{selectedRequest.subject}</h3>
                                        <p className="text-sm text-gray-500">{selectedRequest.category || 'General'}</p>
                                    </div>
                                    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold', statusClasses(selectedRequest.status))}>
                                        {React.createElement(statusIcon(selectedRequest.status), { className: 'w-3 h-3' })}
                                        {normalizeStatus(selectedRequest.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-3">
                                        <div className="text-[10px] font-bold text-gray-400">Priority</div>
                                        <div className="text-sm font-semibold text-[#1A1A1A]">{selectedRequest.priority}</div>
                                    </div>
                                    <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-3">
                                        <div className="text-[10px] font-bold text-gray-400">Created</div>
                                        <div className="text-sm font-semibold text-[#1A1A1A]">
                                            {new Date(selectedRequest.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-4 space-y-2">
                                    <div className="text-[10px] font-bold text-gray-400">Description</div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRequest.description}</p>
                                </div>

                                <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-4 space-y-2">
                                    <div className="text-[10px] font-bold text-gray-400">Linked entities</div>
                                    <div className="text-sm text-gray-700">{getApiaryName(selectedRequest.apiary_id)}</div>
                                    <div className="text-sm text-gray-500">{getHiveName(selectedRequest.hive_id)}</div>
                                </div>

                                <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-[10px] font-bold text-gray-400">Comments</div>
                                        {requestComments.isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {(requestComments.data || []).length === 0 ? (
                                            <p className="text-sm text-gray-500">No comments yet. Add context or follow-up details here.</p>
                                        ) : (
                                            (requestComments.data || []).map((comment) => (
                                                <div key={comment.id} className="rounded-xl border border-[#F4D03F]/10 bg-[#FFF9F0] px-3 py-2">
                                                    <div className="text-[10px] font-black text-[#F4D03F]">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="space-y-2 pt-1">
                                        <Textarea
                                            value={commentDraft}
                                            onChange={(event) => setCommentDraft(event.target.value)}
                                            className="min-h-[96px] rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm"
                                            placeholder="Add a follow-up note, reproduction step, or resolution detail."
                                        />
                                        <div className="flex justify-end">
                                            <Button className={glass.btnSecondary} onClick={() => { void handleAddComment(); }} disabled={addRequestComment.isPending || !commentDraft.trim()}>
                                                {addRequestComment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Add comment
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                        className={glass.btnSecondary}
                                        onClick={() => {
                                            void navigator.clipboard.writeText(selectedRequest.id);
                                            toast.success('Request reference copied');
                                        }}
                                    >
                                        Copy reference
                                    </Button>
                                    <Button className={glass.btnSecondary} onClick={() => openEditForm(selectedRequest)} disabled={!canEdit}>
                                        Edit
                                    </Button>
                                    <Button className={glass.btnSecondary} onClick={() => setRequestToDelete(selectedRequest)} disabled={!canEdit}>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl bg-[#FFF9F0] border border-[#F4D03F]/20 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingRequest ? 'Update request' : 'Create request'}</DialogTitle>
                        <DialogDescription>
                            {editingRequest ? 'Edit the live backend record for this support request.' : 'Create a request with the same field structure used by the backend endpoints.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BeeYieldFormField id="request-subject" label="Subject" className="md:col-span-2">
                            <Input
                                id="request-subject"
                                value={form.subject}
                                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                                className={glass.input}
                                placeholder="Short request summary"
                            />
                        </BeeYieldFormField>

                        <BeeYieldFormField id="request-category" label="Category">
                            <Select value={form.category || 'General'} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>

                        <BeeYieldFormField id="request-priority" label="Priority">
                            <Select value={form.priority || 'Medium'} onValueChange={(value) => setForm((current) => ({ ...current, priority: value }))}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((priority) => (
                                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>

                        <BeeYieldFormField id="request-apiary" label="Apiary">
                            <Select
                                value={form.apiary_id || 'none'}
                                onValueChange={(value) => setForm((current) => ({ ...current, apiary_id: value === 'none' ? '' : value, hive_id: '' }))}
                            >
                                <SelectTrigger className={glass.input}>
                                    <SelectValue placeholder="Select apiary" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No apiary</SelectItem>
                                    {apiaries.map((apiary) => (
                                        <SelectItem key={apiary.id} value={apiary.id}>{getApiaryDisplayName(apiary)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>

                        <BeeYieldFormField id="request-hive" label="Hive">
                            <Select
                                value={form.hive_id || 'none'}
                                onValueChange={(value) => setForm((current) => ({ ...current, hive_id: value === 'none' ? '' : value }))}
                            >
                                <SelectTrigger className={glass.input}>
                                    <SelectValue placeholder="Select hive" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No hive</SelectItem>
                                    {availableHives.map((hive) => (
                                        <SelectItem key={hive.id} value={hive.id}>{getHiveDisplayName(hive)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>

                        {editingRequest && (
                            <BeeYieldFormField id="request-status" label="Status">
                                <Select value={form.status} onValueChange={(value: 'Draft' | 'Open') => setForm((current) => ({ ...current, status: value }))}>
                                    <SelectTrigger className={glass.input}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Open">Open</SelectItem>
                                    </SelectContent>
                                </Select>
                            </BeeYieldFormField>
                        )}

                        <BeeYieldFormField id="request-description" label="Description" className="md:col-span-2">
                            <Textarea
                                id="request-description"
                                value={form.description}
                                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                className="min-h-[140px] rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm"
                                placeholder="Describe the issue, affected hardware/software, and what you already tried."
                            />
                        </BeeYieldFormField>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button
                            className={glass.btnPrimary}
                            onClick={() => { void handleSubmit(); }}
                            disabled={createRequest.isPending || updateRequest.isPending}
                        >
                            {(createRequest.isPending || updateRequest.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingRequest ? 'Save changes' : 'Create request'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <GlassConfirmModal
                isOpen={!!requestToDelete}
                onClose={() => setRequestToDelete(null)}
                onConfirm={() => { void handleDelete(); }}
                title="Delete request"
                message="This removes the request from your dashboard and backend record set."
                confirmLabel="Delete"
                isLoading={deleteRequest.isPending}
            />
        </BeeYieldPageShell>
    );
};

export default MyRequestsView;
