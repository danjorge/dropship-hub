import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => financeApi.getWallet(),
  });
}

export function useTransactions(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['transactions', page, limit],
    queryFn: () => financeApi.getTransactions(page, limit),
  });
}

export function usePixPayments(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['pixPayments', page, limit],
    queryFn: () => financeApi.getPixPayments(page, limit),
  });
}

export function useCreatePixPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amountCents: number; payerName: string; payerDocument: string }) =>
      financeApi.createPixPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['pixPayments'] });
    },
  });
}

export function useConfirmPixPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pixPaymentId: string) => financeApi.confirmPixPayment(pixPaymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pixPayments'] });
    },
  });
}
