import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api';
import type {
  CreateProductRequest,
  CreateSkuRequest,
  CreateProductImageRequest,
  CreateOfferRequest,
} from '@/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => catalogApi.getProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => catalogApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateSku() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateSkuRequest;
    }) => catalogApi.createSku(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateProductImageRequest;
    }) => catalogApi.createProductImage(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferRequest) => catalogApi.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => catalogApi.getSuppliers(),
  });
}

export function useSupplierProducts(supplierOrgId: string) {
  return useQuery({
    queryKey: ['supplier-products', supplierOrgId],
    queryFn: () => catalogApi.getSupplierProducts(supplierOrgId),
    enabled: !!supplierOrgId,
  });
}
