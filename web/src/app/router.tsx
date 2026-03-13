import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { OrgsPage } from '@/pages/OrgsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsListPage } from '@/pages/catalog/ProductsListPage';
import { CreateProductPage } from '@/pages/catalog/CreateProductPage';
import { SuppliersListPage } from '@/pages/catalog/SuppliersListPage';
import { ListingsPage } from '@/pages/listings/ListingsPage';
import { FulfillmentsPage } from '@/pages/fulfillments/FulfillmentsPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/orgs" element={<OrgsPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  
                  {/* Supplier: Products */}
                  <Route path="/catalog/products" element={<ProductsListPage />} />
                  <Route path="/catalog/products/new" element={<CreateProductPage />} />
                  
                  {/* Merchant: Suppliers */}
                  <Route path="/catalog/suppliers" element={<SuppliersListPage />} />
                  <Route path="/catalog/suppliers/:supplierOrgId/products" element={<SupplierProductsPage />} />
                  
                  {/* Merchant: Listings */}
                  <Route path="/listings" element={<ListingsPage />} />
                  
                  {/* Merchant: Orders */}
                  <Route path="/orders" element={<OrdersPage />} />
                  
                  {/* Supplier: Fulfillments */}
                  <Route path="/fulfillments" element={<FulfillmentsPage />} />
                  
                  {/* Integrations */}
                  <Route path="/integrations" element={<IntegrationsPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
