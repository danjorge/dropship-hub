import { apiClient } from './client';
import type { ListingsResponse, CreateListingRequest, GetListingsParams } from '@/types';

export const listingsApi = {
  getListings: (params?: GetListingsParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.provider) {
      queryParams.append('provider', params.provider);
    }
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', String(params.isActive));
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.syncStatus) {
      queryParams.append('syncStatus', params.syncStatus);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/listings?${queryString}` : '/listings';

    return apiClient.get<ListingsResponse>(url, {
      requiresOrg: true,
    });
  },

  createListing: (data: CreateListingRequest) => {
    return apiClient.post<ListingsResponse>('/listings', data, {
      requiresOrg: true,
    });
  },
};
