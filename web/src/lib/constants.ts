export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dropship_access_token',
  ACTIVE_ORG_ID: 'dropship_active_org_id',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ORGS: '/orgs',
  
  // Catalog
  CATALOG_PRODUCTS: '/catalog/products',
  CATALOG_PRODUCTS_NEW: '/catalog/products/new',
  CATALOG_PRODUCT_DETAIL: '/catalog/products/:id',
  
  // Suppliers (Merchant view)
  CATALOG_SUPPLIERS: '/catalog/suppliers',
  CATALOG_SUPPLIER_PRODUCTS: '/catalog/suppliers/:supplierOrgId/products',
  
  // Listings
  LISTINGS: '/listings',
  LISTINGS_NEW: '/listings/new',
  
  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  
  // Fulfillments
  FULFILLMENTS: '/fulfillments',
  FULFILLMENT_DETAIL: '/fulfillments/:id',
  
  // Integrations
  INTEGRATIONS: '/integrations',
} as const;
