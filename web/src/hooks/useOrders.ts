import { useQuery } from '@tanstack/react-query';
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
