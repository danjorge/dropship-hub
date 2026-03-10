import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useListings } from '@/hooks/useListings';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import type { Provider } from '@/types';

export function ListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: response, isLoading, error, refetch } = useListings({
    provider: selectedProvider,
    search: searchQuery || undefined,
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getProviderBadgeColor = (provider: Provider) => {
    switch (provider) {
      case 'SHOPEE':
        return 'bg-orange-100 text-orange-800';
      case 'MERCADOLIVRE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getSyncStatusBadge = (syncStatus: string) => {
    switch (syncStatus) {
      case 'SYNCED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={t('common.error')} onRetry={() => refetch()} />;

  const { providers = [], items = [], total = 0 } = response || {};
  const hasNoIntegrations = providers.length === 0;

  return (
    <PageContainer
      title={t('listings.title')}
      description={t('listings.description')}
      action={
        !hasNoIntegrations && (
          <button
            onClick={() => navigate('/listings/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + {t('listings.newListing')}
          </button>
        )
      }
    >
      {hasNoIntegrations ? (
        <EmptyState
          title={t('listings.noIntegrations')}
          description={t('listings.connectMarketplace')}
          action={{
            label: t('listings.goToIntegrations'),
            onClick: () => navigate('/integrations'),
          }}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Provider Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('listings.filterByProvider')}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedProvider(undefined)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedProvider === undefined
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('listings.all')} ({total})
                  </button>
                  {providers.map((provider) => (
                    <button
                      key={provider}
                      onClick={() => setSelectedProvider(provider)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedProvider === provider
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('listings.search')}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('listings.searchPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Listings Table */}
          {items.length > 0 ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('listings.provider')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('listings.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('listings.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('listings.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('listings.syncStatus')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('listings.externalId')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderBadgeColor(listing.provider)}`}>
                          {listing.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        {listing.supplierOffer?.sku?.product && (
                          <div className="text-xs text-gray-500 mt-1">
                            {listing.supplierOffer.sku.product.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(listing.priceCents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            listing.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.isActive ? t('listings.active') : t('listings.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSyncStatusBadge(listing.syncStatus)}`}>
                          {listing.syncStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.externalListingId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={t('listings.noListingsFound')}
              description={
                selectedProvider
                  ? t('listings.noListingsForProvider', { provider: selectedProvider })
                  : t('listings.createFirstListing')
              }
              action={{
                label: t('listings.createListing'),
                onClick: () => navigate('/listings/new'),
              }}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
