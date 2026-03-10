// User & Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// Organization Types
export type OrgType = 'SUPPLIER' | 'MERCHANT';
export type OrgMemberRole = 'OWNER' | 'ADMIN' | 'STAFF';

export interface Org {
  id: string;
  name: string;
  type: OrgType;
  createdAt: string;
}

export interface OrgMembership {
  orgId: string;
  name: string;
  type: OrgType;
  role: OrgMemberRole;
}

export interface UserOrgsResponse {
  userId: string;
  orgs: OrgMembership[];
}

// Product & Catalog Types
export interface Product {
  id: string;
  supplierOrgId: string;
  title: string;
  description?: string;
  brand?: string;
  isActive: boolean;
  codigo?: string; // SKU from Brazilian import
  createdAt: string;
  updatedAt: string;
  skus?: Sku[];
  images?: ProductImage[];
}

export interface Sku {
  id: string;
  productId: string;
  skuCode: string;
  variantJson?: Record<string, unknown>;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  gtin?: string;
  createdAt: string;
  offers?: SupplierOffer[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
}

export interface SupplierOffer {
  id: string;
  supplierOrgId: string;
  skuId: string;
  costCents: number;
  msrpCents?: number;
  stockQty: number;
  slaDays: number;
  shipsFrom?: string;
  allowRandomColor: boolean;
  createdAt: string;
  updatedAt: string;
  sku?: Sku;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  brand?: string;
  isActive?: boolean;
  
  // Brazilian product fields
  codigo?: string;
  unidade?: string;
  ncm?: string;
  origem?: string;
  preco?: number;
  valorIpiFixo?: number;
  observacoes?: string;
  situacao?: string;
  estoque?: number;
  precosDeCusto?: number;
  codNoFornecedor?: string;
  fornecedor?: string;
  localizacao?: string;
  estoqueMaximo?: number;
  estoqueMinimo?: number;
  pesoLiquidoKg?: number;
  pesoBrutoKg?: number;
  gtinEan?: string;
  gtinEanDaEmbalagem?: string;
  larguraDoProduto?: number;
  alturaDoProduto?: number;
  profundidadeDoProduto?: number;
  dataDeValidade?: string;
  descricaoDoProdutoNoFornecedor?: string;
  descricaoComplementar?: string;
  itensPorCaixa?: number;
  produtoVariacao?: string;
  tipoProducao?: string;
  classeDeEnquadramentoDoIpi?: string;
  codigoListaDeServicos?: string;
  tipoDoItem?: string;
  grupoDeTags?: string;
  tributos?: string;
  codigoPai?: string;
  codigoIntegracao?: string;
  grupoDeProdutos?: string;
  cest?: string;
  volumes?: number;
  descricaoCurta?: string;
  crossDocking?: string;
  urlImagensExternas?: string;
  linkExterno?: string;
  mesesGarantiaFornecedor?: number;
  clonarDadosDoPai?: string;
  condicaoDoProduto?: string;
  freteGratis?: string;
  numeroFci?: string;
  video?: string;
  departamento?: string;
  unidadeDeMedida?: string;
  precoDeCompra?: number;
  valorBaseIcsmStParaRetencao?: number;
  valorIcmsStParaRetencao?: number;
  valorIcmsProprioDoSubstituto?: number;
  categoriaDoProduto?: string;
  informacoesAdicionais?: string;
}

export interface CreateSkuRequest {
  skuCode: string;
  variantJson?: Record<string, unknown>;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  gtin?: string;
}

export interface CreateProductImageRequest {
  url: string;
  sortOrder?: number;
}

export interface CreateOfferRequest {
  skuId: string;
  costCents: number;
  msrpCents?: number;
  stockQty: number;
  slaDays?: number;
  shipsFrom?: string;
  allowRandomColor?: boolean;
}

// Integration Types
export type Provider = 'SHOPEE' | 'MERCADOLIVRE';

export interface Integration {
  id: string;
  provider: Provider;
  status: string;
  createdAt: string;
}

// Listing Types
export interface Listing {
  id: string;
  merchantOrgId: string;
  supplierOfferId: string;
  provider: Provider;
  externalListingId: string | null;
  title: string;
  priceCents: number;
  isActive: boolean;
  syncStatus: string;
  createdAt: string;
  supplierOffer?: {
    id: string;
    sku: {
      id: string;
      skuCode: string;
      product: {
        id: string;
        title: string;
      };
    };
  };
}

export interface ListingsResponse {
  providers: Provider[];
  items: Listing[];
  total: number;
}

export interface GetListingsParams {
  provider?: Provider;
  isActive?: boolean;
  search?: string;
  syncStatus?: string;
}

export interface CreateListingRequest {
  supplierOfferId: string;
  provider: Provider;
  title: string;
  priceCents: number;
}

// Order & Fulfillment Types
export type FulfillmentStatus = 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface MarketplaceOrder {
  id: string;
  provider: Provider;
  externalOrderId: string;
  status: string;
  buyerName: string | null;
  totalCents: number | null;
  createdAt: string;
  itemsCount: number;
  fulfillment: {
    status: string;
    trackingCode: string | null;
  } | null;
}

export interface OrdersResponse {
  providers: Provider[];
  items: MarketplaceOrder[];
  page: number;
  pageSize: number;
  total: number;
}

export interface GetOrdersParams {
  provider?: Provider;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderDetails {
  id: string;
  provider: Provider;
  externalOrderId: string;
  status: string;
  buyerName: string | null;
  shippingAddressJson: any;
  totalCents: number | null;
  createdAt: string;
  items: Array<{
    id: string;
    qty: number;
    priceCents: number;
    listing: {
      id: string;
      title: string;
    } | null;
  }>;
  fulfillments: Array<{
    id: string;
    status: string;
    trackingCode: string | null;
    carrier: string | null;
    shippedAt: string | null;
    createdAt: string;
    supplier: {
      id: string;
      name: string;
    };
  }>;
}

export interface FulfillmentOrder {
  id: string;
  supplierOrgId: string;
  marketplaceOrderId: string;
  supplierOfferId: string;
  qty: number;
  status: FulfillmentStatus;
  trackingCode?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
  marketplaceOrder?: MarketplaceOrder;
  supplierOffer?: SupplierOffer;
}

export interface ShipFulfillmentRequest {
  trackingCode: string;
  carrier: string;
}

// Supplier Types (for merchant browsing)
export interface Supplier {
  orgId: string;
  name: string;
  type: OrgType;
}

// API Error Type
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
