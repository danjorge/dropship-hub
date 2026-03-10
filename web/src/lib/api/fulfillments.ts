import { apiClient } from './client';
import type { FulfillmentOrder, ShipFulfillmentRequest } from '@/types';

export const fulfillmentsApi = {
  getFulfillments: () => {
    return apiClient.get<FulfillmentOrder[]>('/fulfillments', {
      requiresOrg: true,
    });
  },

  confirmFulfillment: (id: string) => {
    return apiClient.post<FulfillmentOrder>(
      `/fulfillments/${id}/confirm`,
      undefined,
      {
        requiresOrg: true,
      }
    );
  },

  shipFulfillment: (id: string, data: ShipFulfillmentRequest) => {
    return apiClient.post<FulfillmentOrder>(
      `/fulfillments/${id}/ship`,
      data,
      {
        requiresOrg: true,
      }
    );
  },
};
