import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Request, RequestCreateInput } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const requestKeys = {
    all: ['requests'] as const,
    lists: () => [...requestKeys.all, 'list'] as const,
    details: () => [...requestKeys.all, 'detail'] as const,
    detail: (id: string) => [...requestKeys.details(), id] as const,
    comments: (requestId: string) => [...requestKeys.detail(requestId), 'comments'] as const,
};

export function useRequests() {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    return useQuery({
        queryKey: [...requestKeys.lists(), userId],
        queryFn: async () => {
            const data = await beeyieldService.getRequests();
            if (!userId) return data;
            return data.filter(r => !r.user_id || r.user_id === userId);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useRequestDetail(id: string) {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    return useQuery({
        queryKey: [...requestKeys.detail(id), userId],
        queryFn: async () => {
            const requests = await beeyieldService.getRequests();
            const found = requests.find(r => r.id === id);
            if (!found) return null;
            if (userId && found.user_id && found.user_id !== userId) return null;
            return found;
        },
        enabled: !!id,
    });
}

export function useCreateRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: RequestCreateInput) => beeyieldService.createRequest(input),
        onSuccess: (response) => {
            if (response.data) {
                queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
            }
        },
    });
}
