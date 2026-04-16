import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, RequestComment, RequestCreateInput, SupportRequest } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';

export const requestKeys = {
    all: ['requests'] as const,
    lists: () => [...requestKeys.all, 'list'] as const,
    list: (userId?: string) => [...requestKeys.lists(), userId || 'anonymous'] as const,
    details: () => [...requestKeys.all, 'detail'] as const,
    detail: (id: string, userId?: string) => [...requestKeys.details(), id, userId || 'anonymous'] as const,
    comments: (requestId: string, userId?: string) => [...requestKeys.detail(requestId, userId), 'comments'] as const,
};

function useRequestUserId() {
    const { user, beeyieldUser } = useAuth();
    return beeyieldUser?.id || user?.id;
}

export function useRequests() {
    const userId = useRequestUserId();

    return useQuery({
        queryKey: requestKeys.list(userId),
        queryFn: async () => {
            const data = await beeyieldService.getRequests();
            if (!userId) return data;
            return data.filter((request) => !request.user_id || request.user_id === userId);
        },
        staleTime: 1000 * 30,
    });
}

export function useRequestDetail(id: string) {
    const userId = useRequestUserId();

    return useQuery({
        queryKey: requestKeys.detail(id, userId),
        queryFn: () => beeyieldService.getRequestById(id),
        enabled: !!id,
    });
}

export function useCreateRequest() {
    const queryClient = useQueryClient();
    const userId = useRequestUserId();

    return useMutation({
        mutationFn: (input: RequestCreateInput) => beeyieldService.createRequest(input),
        onSuccess: (result) => {
            if (!result.data) return;
            queryClient.setQueryData<SupportRequest[]>(requestKeys.list(userId), (current = []) => [
                result.data as SupportRequest,
                ...current.filter((request) => request.id !== result.data?.id),
            ]);
        },
    });
}

export function useUpdateRequest() {
    const queryClient = useQueryClient();
    const userId = useRequestUserId();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SupportRequest> }) => beeyieldService.updateRequest(id, data),
        onSuccess: (response, variables) => {
            if (!response.data) return;
            queryClient.setQueryData<SupportRequest[]>(requestKeys.list(userId), (current = []) =>
                current.map((request) =>
                    request.id === variables.id ? { ...request, ...response.data } : request
                )
            );
            queryClient.setQueryData(requestKeys.detail(variables.id, userId), response.data);
        },
    });
}

export function useDeleteRequest() {
    const queryClient = useQueryClient();
    const userId = useRequestUserId();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await beeyieldService.deleteRequest(id);
            if (!result.success) {
                throw result.error || new Error('Failed to delete request');
            }
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: requestKeys.list(userId) });
            const previous = queryClient.getQueryData<SupportRequest[]>(requestKeys.list(userId));
            if (previous) {
                queryClient.setQueryData<SupportRequest[]>(
                    requestKeys.list(userId),
                    previous.filter((request) => request.id !== id)
                );
            }
            return { previous };
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(requestKeys.list(userId), context.previous);
            }
        },
        onSettled: (_data, _error, id) => {
            queryClient.invalidateQueries({ queryKey: requestKeys.list(userId), refetchType: 'inactive' });
            if (id) {
                queryClient.removeQueries({ queryKey: requestKeys.detail(id, userId) });
            }
        },
    });
}

export function useRequestComments(requestId: string | null) {
    const userId = useRequestUserId();

    return useQuery({
        queryKey: requestId ? requestKeys.comments(requestId, userId) : [...requestKeys.all, 'comments', 'empty'],
        queryFn: async () => {
            if (!requestId) return [] as RequestComment[];
            return await beeyieldService.getRequestComments(requestId);
        },
        enabled: !!requestId,
        staleTime: 1000 * 30,
    });
}

export function useAddRequestComment() {
    const queryClient = useQueryClient();
    const userId = useRequestUserId();

    return useMutation({
        mutationFn: ({ requestId, message }: { requestId: string; message: string }) =>
            beeyieldService.addRequestComment(requestId, message),
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: requestKeys.comments(variables.requestId, userId), refetchType: 'active' });
            queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId, userId), refetchType: 'active' });
        },
    });
}
