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
        onSuccess: (result) => {
            if (!result.data) return;
            queryClient.setQueryData<Note[]>(['notes', userId], (current = []) => [
                result.data as Note,
                ...current.filter((note) => note.id !== result.data?.id),
            ]);
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
        onSuccess: (result, variables) => {
            if (!result.data) return;
            queryClient.setQueryData<Note[]>(['notes', userId], (current = []) =>
                current.map((note) =>
                    note.id === variables.id ? { ...note, ...result.data } : note
                )
            );
        },
    });
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await beeyieldService.deleteNote(id);
            if (result.error) throw result.error;
            return id;
        },
        onMutate: async (id) => {
            // Cancel any outgoing refetches so they don't overwrite the optimistic update
            await queryClient.cancelQueries({ queryKey: ['notes', userId] });
            // Snapshot previous value for rollback
            const previousNotes = queryClient.getQueryData<Note[]>(['notes', userId]);
            // Optimistically remove the note from the cache immediately
            if (previousNotes) {
                queryClient.setQueryData<Note[]>(
                    ['notes', userId],
                    previousNotes.filter(n => n.id !== id)
                );
            }
            return { previousNotes };
        },
        onError: (_err, _id, context) => {
            // Rollback to the previous notes if the mutation fails
            if (context?.previousNotes) {
                queryClient.setQueryData(['notes', userId], context.previousNotes);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', userId], refetchType: 'inactive' });
        },
    });
};
