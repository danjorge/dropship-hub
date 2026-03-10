import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import type { CreateListingRequest, GetListingsParams } from '@/types';

export function useListings(params?: GetListingsParams) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => listingsApi.getListings(params),
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingRequest) => listingsApi.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
