import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Task } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters?: any) => [...taskKeys.lists(), { filters }] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
};

export function useTasks() {
    return useQuery({
        queryKey: taskKeys.lists(),
        queryFn: () => beeyieldService.getTasks(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (task: any) => beeyieldService.createTask(task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            toast.success('Task created');
        },
        onError: (error: any) => {
            console.error('Create task error:', error);
            // toast.error('Failed to create task'); // beeyieldService already toasts
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: any }) => beeyieldService.updateTask(id, updates),
        onSuccess: (response) => {
            if (response.data) {
                queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
                queryClient.invalidateQueries({ queryKey: taskKeys.detail(response.data.id) });
                toast.success('Task updated');
            }
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            toast.success('Task removed');
        },
    });
}
