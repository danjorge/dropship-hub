import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSuppliers } from '@/hooks/useCatalog';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

export function SuppliersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: suppliers, isLoading, error, refetch } = useSuppliers();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={t('common.error')} onRetry={() => refetch()} />;

  return (
    <PageContainer
      title={t('suppliers.title')}
      description={t('suppliers.description')}
    >
      {suppliers && suppliers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <button
              key={supplier.orgId}
              onClick={() => navigate(`/catalog/suppliers/${supplier.orgId}/products`)}
              className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-500"
            >
              <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{t('suppliers.browseProducts')}</p>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('suppliers.noSuppliers')}
          description={t('suppliers.noSuppliersDesc')}
        />
      )}
    </PageContainer>
  );
}
