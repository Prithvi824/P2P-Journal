import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as alertsApi from '../api/alerts';
import type { AlertThresholdUpdate } from '../types';

export function useGetAlertThreshold() {
  return useQuery({
    queryKey: ['alertThreshold'],
    queryFn: alertsApi.getAlertThreshold,
    refetchInterval: 30_000,
  });
}

export function useSetAlertThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AlertThresholdUpdate) => alertsApi.setAlertThreshold(payload),
    onSuccess: (data) => {
      qc.setQueryData(['alertThreshold'], data);
      const msg = data.threshold == null ? 'Price alert cleared' : `Alert set for ₹${data.threshold.toLocaleString('en-IN')}`;
      toast.success(msg);
    },
    onError: () => toast.error('Failed to update alert threshold'),
  });
}
