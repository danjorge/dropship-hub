import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

export function useUserOrgs() {
  return useQuery({
    queryKey: ['user-orgs'],
    queryFn: () => authApi.getUserOrgs(),
  });
}
