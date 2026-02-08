import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Note, NoteCreateInput } from '@/services/beeyieldService';

export const useNotes = () => {
    return useQuery({
        queryKey: ['notes'],
        queryFn: () => beeyieldService.getNotes(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: NoteCreateInput) => beeyieldService.createNote(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
};

export const useUpdateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<NoteCreateInput> }) =>
            beeyieldService.updateNote(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
};
