import { apiClient } from './client';
import type { Provider } from '@/types';

export interface IntegrationStatus {
  provider: Provider;
  status: string;
  isConnected: boolean;
  createdAt?: string;
}

export interface IntegrationsStatusResponse {
  items: IntegrationStatus[];
}

export interface ConnectIntegrationResponse {
  provider: Provider;
  status: string;
  authUrl?: string;
  integrationId?: string;
}

export const integrationsApi = {
  getIntegrationsStatus: () => {
    return apiClient.get<IntegrationsStatusResponse>('/integrations/status', {
      requiresOrg: true,
    });
  },

  getIntegrations: () => {
    return apiClient.get('/integrations', {
      requiresOrg: true,
    });
  },

  getActiveIntegrations: () => {
    return apiClient.get('/integrations/active', {
      requiresOrg: true,
    });
  },

  connectIntegration: (provider: Provider) => {
    return apiClient.post<ConnectIntegrationResponse>(
      `/integrations/${provider}/connect`,
      {},
      {
        requiresOrg: true,
      }
    );
  },

  disconnectIntegration: (provider: Provider) => {
    return apiClient.post<{ success: boolean }>(
      `/integrations/${provider}/disconnect`,
      {},
      {
        requiresOrg: true,
      }
    );
  },
};
