import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    beeyieldService,
    VarroaReadingCreateInput,
    VarroaTreatmentCreateInput,
} from '@/services/beeyieldService';

export const varroaKeys = {
    all: ['varroa'] as const,
    readings: () => [...varroaKeys.all, 'readings'] as const,
    readingList: (hiveId?: string) => [...varroaKeys.readings(), { hiveId }] as const,
    treatments: () => [...varroaKeys.all, 'treatments'] as const,
    treatmentList: (hiveId?: string) => [...varroaKeys.treatments(), { hiveId }] as const,
};

export function useVarroaReadings(hiveId?: string) {
    return useQuery({
        queryKey: varroaKeys.readingList(hiveId),
        queryFn: () => beeyieldService.getVarroaReadings(hiveId),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateVarroaReading() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: VarroaReadingCreateInput) => beeyieldService.createVarroaReading(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: varroaKeys.readings() });
        },
    });
}

export function useUpdateVarroaReading() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<VarroaReadingCreateInput> }) =>
            beeyieldService.updateVarroaReading(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: varroaKeys.readings() });
        },
    });
}

export function useDeleteVarroaReading() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteVarroaReading(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: varroaKeys.readings() });
        },
    });
}

export function useVarroaTreatments(hiveId?: string) {
    return useQuery({
        queryKey: varroaKeys.treatmentList(hiveId),
        queryFn: () => beeyieldService.getVarroaTreatments(hiveId),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateVarroaTreatment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: VarroaTreatmentCreateInput) => beeyieldService.createVarroaTreatment(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: varroaKeys.treatments() });
        },
    });
}

export function useUpdateVarroaTreatment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<VarroaTreatmentCreateInput> }) =>
            beeyieldService.updateVarroaTreatment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: varroaKeys.treatments() });
        },
    });
}

export function useDeleteVarroaTreatment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteVarroaTreatment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: varroaKeys.treatments() });
        },
    });
}
