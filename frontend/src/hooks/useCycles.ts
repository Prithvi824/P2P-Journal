import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as journalApi from '../api/journal';
import type { TradeCycleUpdate } from '../types';

export function useGetCycles() {
  return useQuery({
    queryKey: ['cycles'],
    queryFn: journalApi.getCycles,
  });
}

export function useGetCycle(id: string) {
  return useQuery({
    queryKey: ['cycle', id],
    queryFn: () => journalApi.getCycle(id),
    enabled: !!id,
  });
}

export function useCreateCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: journalApi.createCycle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles'] });
      toast.success('New cycle created');
    },
    onError: () => toast.error('Failed to create cycle'),
  });
}

export function useUpdateCycle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TradeCycleUpdate) => journalApi.updateCycle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycle', id] });
      qc.invalidateQueries({ queryKey: ['cycles'] });
      toast.success('Cycle updated');
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail ?? 'Failed to update cycle';
      toast.error(detail);
    },
  });
}

export function useAutoSaveCycle(id: string) {
  return useMutation({
    mutationFn: (payload: TradeCycleUpdate) => journalApi.updateCycle(id, payload),
  });
}

export function useDeleteCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalApi.deleteCycle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles'] });
      toast.success('Cycle deleted');
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail ?? 'Failed to delete cycle';
      toast.error(detail);
    },
  });
}
