import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, SupportRequest, SupportRequestCreate, RequestComment } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const requestKeys = {
    all: ['requests'] as const,
    lists: () => [...requestKeys.all, 'list'] as const,
    details: () => [...requestKeys.all, 'detail'] as const,
    detail: (id: string) => [...requestKeys.details(), id] as const,
    comments: (requestId: string) => [...requestKeys.detail(requestId), 'comments'] as const,
};

export function useRequests() {
    return useQuery({
        queryKey: requestKeys.lists(),
        queryFn: () => beeyieldService.getRequests(),
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useRequestDetail(id: string) {
    return useQuery({
        queryKey: requestKeys.detail(id),
        queryFn: async () => {
            const requests = await beeyieldService.getRequests();
            return requests.find(r => r.id === id) || null;
        },
        enabled: !!id,
    });
}

export function useRequestComments(requestId: string) {
    return useQuery({
        queryKey: requestKeys.comments(requestId),
        queryFn: () => beeyieldService.getRequestComments(requestId),
        enabled: !!requestId,
        refetchInterval: 1000 * 10, // Poll comments every 10s for "real-time" feel
    });
}

export function useCreateRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: SupportRequestCreate) => beeyieldService.createRequest(input),
        onSuccess: (response) => {
            if (response.data) {
                queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
            }
        },
    });
}

export function useAddComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, message }: { requestId: string; message: string }) =>
            beeyieldService.addRequestComment(requestId, message),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: requestKeys.comments(variables.requestId) });
        },
    });
}
