import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupplierProducts } from '@/hooks/useCatalog';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function SupplierProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { supplierOrgId } = useParams<{ supplierOrgId: string }>();
  const { data: products, isLoading, error, refetch } = useSupplierProducts(supplierOrgId!);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={t('common.error')} onRetry={() => refetch()} />;

  return (
    <PageContainer
      title={t('products.title')}
      description={t('suppliers.browseProducts')}
    >
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/catalog/suppliers')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      {products && products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-2">
                    {t('products.brand')}: {product.brand}
                  </p>
                )}
                {product.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}
                
                {/* SKUs and Offers */}
                {product.skus && product.skus.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t('products.skus')}: {product.skus.length}
                    </p>
                    {product.skus[0].offers && product.skus[0].offers.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          {t('common.price')}: R$ {(product.skus[0].offers[0].msrpCents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('common.stock')}: {product.skus[0].offers[0].stockQty}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('products.noProducts')}
          description={t('products.createFirst')}
        />
      )}
    </PageContainer>
  );
}
