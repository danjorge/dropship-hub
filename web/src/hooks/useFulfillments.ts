import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fulfillmentsApi } from '@/lib/api';
import type { ShipFulfillmentRequest } from '@/types';

export function useFulfillments() {
  return useQuery({
    queryKey: ['fulfillments'],
    queryFn: () => fulfillmentsApi.getFulfillments(),
  });
}

export function useConfirmFulfillment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fulfillmentsApi.confirmFulfillment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
    },
  });
}

export function useShipFulfillment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipFulfillmentRequest }) =>
      fulfillmentsApi.shipFulfillment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
    },
  });
}
