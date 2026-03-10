import { apiClient } from './client';
import type {
  Product,
  CreateProductRequest,
  Sku,
  CreateSkuRequest,
  ProductImage,
  CreateProductImageRequest,
  SupplierOffer,
  CreateOfferRequest,
  Supplier,
} from '@/types';

export const catalogApi = {
  // Supplier: Product management
  getProducts: () => {
    return apiClient.get<Product[]>('/catalog/products', {
      requiresOrg: true,
    });
  },

  createProduct: (data: CreateProductRequest) => {
    return apiClient.post<Product>('/catalog/products', data, {
      requiresOrg: true,
    });
  },

  // Supplier: SKU management
  createSku: (productId: string, data: CreateSkuRequest) => {
    return apiClient.post<Sku>(`/catalog/products/${productId}/skus`, data, {
      requiresOrg: true,
    });
  },

  // Supplier: Product image management
  createProductImage: (productId: string, data: CreateProductImageRequest) => {
    return apiClient.post<ProductImage>(
      `/catalog/products/${productId}/images`,
      data,
      {
        requiresOrg: true,
      }
    );
  },

  // Supplier: Offer management
  createOffer: (data: CreateOfferRequest) => {
    return apiClient.post<SupplierOffer>('/catalog/offers', data, {
      requiresOrg: true,
    });
  },

  // Merchant: Browse suppliers
  getSuppliers: () => {
    return apiClient.get<Supplier[]>('/catalog/suppliers', {
      requiresOrg: true,
    });
  },

  // Merchant: Browse supplier products
  getSupplierProducts: (supplierOrgId: string) => {
    return apiClient.get<Product[]>(
      `/catalog/suppliers/${supplierOrgId}/products`,
      {
        requiresOrg: true,
      }
    );
  },
};
