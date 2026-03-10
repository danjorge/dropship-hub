import { apiClient } from './client';
import type { OrdersResponse, OrderDetails, GetOrdersParams } from '@/types';

export const ordersApi = {
  getOrders: (params?: GetOrdersParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.provider) {
      queryParams.append('provider', params.provider);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.from) {
      queryParams.append('from', params.from);
    }
    if (params?.to) {
      queryParams.append('to', params.to);
    }
    if (params?.page) {
      queryParams.append('page', String(params.page));
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', String(params.pageSize));
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';

    return apiClient.get<OrdersResponse>(url, {
      requiresOrg: true,
    });
  },

  getOrderById: (orderId: string) => {
    return apiClient.get<OrderDetails>(`/orders/${orderId}`, {
      requiresOrg: true,
    });
  },
};
