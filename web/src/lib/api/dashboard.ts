import { apiClient } from './client';
import type { DashboardStats } from '@/types/dashboard';

export const dashboardApi = {
  getStats: () => {
    return apiClient.get<DashboardStats>('/dashboard/stats', {
      requiresOrg: true,
    });
  },
};
