import { apiClient } from './client';
import type { LoginRequest, LoginResponse, User, UserOrgsResponse } from '@/types';

export const authApi = {
  login: (data: LoginRequest) => {
    return apiClient.post<LoginResponse>('/auth/login', data, {
      requiresAuth: false,
    });
  },

  getCurrentUser: () => {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  getUserInOrg: () => {
    return apiClient.get<{ user: User; note: string }>('/auth/me-in-org', {
      requiresOrg: true,
    });
  },

  getUserOrgs: () => {
    return apiClient.get<UserOrgsResponse>('/debug/me-orgs');
  },
};
