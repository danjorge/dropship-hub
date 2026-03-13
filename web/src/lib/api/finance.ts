import { apiClient } from './client';

export const financeApi = {
  getWallet: () => {
    return apiClient.get('/finance/wallet', {
      requiresOrg: true,
    });
  },

  getTransactions: (page = 1, limit = 50) => {
    return apiClient.get(`/finance/transactions?page=${page}&limit=${limit}`, {
      requiresOrg: true,
    });
  },

  getPixPayments: (page = 1, limit = 20) => {
    return apiClient.get(`/finance/pix?page=${page}&limit=${limit}`, {
      requiresOrg: true,
    });
  },

  createPixPayment: (data: { amountCents: number; payerName: string; payerDocument: string }) => {
    return apiClient.post('/finance/pix', data, {
      requiresOrg: true,
    });
  },

  getPixPayment: (pixPaymentId: string) => {
    return apiClient.get(`/finance/pix/${pixPaymentId}`, {
      requiresOrg: true,
    });
  },

  confirmPixPayment: (pixPaymentId: string) => {
    return apiClient.post(`/finance/pix/${pixPaymentId}/confirm`, {}, {
      requiresOrg: true,
    });
  },
};
