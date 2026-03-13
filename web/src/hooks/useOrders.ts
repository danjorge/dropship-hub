import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import type { GetOrdersParams } from '@/types';

export function useOrders(params?: GetOrdersParams, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
    refetchInterval: options?.refetchInterval,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId,
  });
}

export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId,
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.payOrder(orderId),
    onSuccess: (_, orderId) => {
      // Invalidate orders list and specific order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      // Also invalidate wallet to show updated balance
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
