import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Note, NoteCreateInput } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';

export const useNotes = () => {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    return useQuery({
        queryKey: ['notes', userId],
        queryFn: async () => {
            const data = await beeyieldService.getNotes();
            if (!userId) return data;
            return data.filter(n => !n.user_id || n.user_id === userId);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateNote = () => {
    const queryClient = useQueryClient();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;
    return useMutation({
        mutationFn: (input: NoteCreateInput) => beeyieldService.createNote(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', userId] });
        },
    });
};

export const useUpdateNote = () => {
    const queryClient = useQueryClient();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<NoteCreateInput> }) =>
            beeyieldService.updateNote(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', userId] });
        },
    });
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;
    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', userId] });
        },
    });
};
