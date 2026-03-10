import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useOrg } from '@/contexts/OrgContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useDashboardStats } from '@/hooks/useDashboard';

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getActiveMembership } = useOrg();
  const activeMembership = getActiveMembership();
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={t('common.error')} onRetry={() => refetch()} />;

  // Supplier-specific dashboard
  if (activeMembership?.type === 'SUPPLIER') {
    return (
      <PageContainer
        title={t('dashboard.title')}
        description={`${t('dashboard.welcome')}, ${user?.fullName || 'User'}`}
      >
        {/* Supplier Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalProducts')}</h3>
              <span className="text-2xl">📦</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalProducts || 0}</p>
            <p className="mt-1 text-sm text-gray-600">{t('dashboard.inCatalog')}</p>
          </div>

          {/* Active Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.activeProducts')}</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-600">{stats?.totalProducts || 0}</p>
            <p className="mt-1 text-sm text-gray-600">{t('dashboard.readyToSell')}</p>
          </div>

          {/* Pending Fulfillments */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.pendingFulfillments')}</h3>
              <span className="text-2xl">�</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-orange-600">{stats?.unpaidOrders || 0}</p>
            <p className="mt-1 text-sm text-gray-600">{t('dashboard.ordersToShip')}</p>
          </div>

          {/* Total Sales */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalSales')}</h3>
              <span className="text-2xl">�</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
            <p className="mt-1 text-sm text-gray-600">{t('dashboard.allTime')}</p>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.salesPerformance')}</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-500">{t('dashboard.today')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.revenueToday || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.salesRevenue')}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-500">{t('dashboard.last7Days')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.revenueLast7Days || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.salesRevenue')}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-500">{t('dashboard.last30Days')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.revenueLast30Days || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.salesRevenue')}</p>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.topSellingProducts')}</h3>
          {stats?.bestSellingProducts && stats.bestSellingProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.unitsSold')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.revenue')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.bestSellingProducts.map((product, index) => (
                    <tr key={product.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.totalSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t('dashboard.noSalesYet')}</p>
              <p className="text-sm mt-2">{t('dashboard.startSelling')}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🚀 {t('dashboard.quickActions')}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => navigate('/catalog/products')}
              className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium text-gray-900">{t('dashboard.manageProducts')}</p>
                  <p className="text-sm text-gray-600">{t('dashboard.addEditProducts')}</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/fulfillments')}
              className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📮</span>
                <div>
                  <p className="font-medium text-gray-900">{t('dashboard.viewFulfillments')}</p>
                  <p className="text-sm text-gray-600">{t('dashboard.processOrders')}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Merchant dashboard
  return (
    <PageContainer
      title={t('dashboard.title')}
      description={`${t('dashboard.welcome')}, ${user?.fullName || 'User'}`}
    >
      {/* Merchant Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Listings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{t('dashboard.activeListings')}</h3>
            <span className="text-2xl">📝</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalProducts || 0}</p>
          <p className="mt-1 text-sm text-gray-600">{t('dashboard.onMarketplaces')}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalOrders')}</h3>
            <span className="text-2xl">🛒</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats?.unpaidOrders || 0}</p>
          <p className="mt-1 text-sm text-gray-600">{t('dashboard.allTime')}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{t('dashboard.pendingOrders')}</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-orange-600">{stats?.unpaidOrders || 0}</p>
          <p className="mt-1 text-sm text-gray-600">{t('dashboard.needsAttention')}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalRevenue')}</h3>
            <span className="text-2xl">💵</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-600">{t('dashboard.grossSales')}</p>
        </div>
      </div>

      {/* Revenue & Profit Section */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Revenue Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.revenueOverview')}</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-500">{t('dashboard.today')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.revenueToday || 0)}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-500">{t('dashboard.last7Days')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.revenueLast7Days || 0)}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-500">{t('dashboard.last30Days')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.revenueLast30Days || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Payments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.supplierPayments')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.pendingPayments')}</p>
                <p className="text-2xl font-semibold text-orange-600 mt-1">
                  {formatCurrency(stats?.walletBalance || 0)}
                </p>
              </div>
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.paidThisMonth')}</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">
                  {formatCurrency(0)}
                </p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Performing Listings */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.bestPerformingListings')}</h3>
        {stats?.bestSellingProducts && stats.bestSellingProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.listing')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.marketplace')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.orderCount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.revenue')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.bestSellingProducts.map((product, index) => (
                  <tr key={product.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.productTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Shopee</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t('dashboard.noListingsYet')}</p>
            <p className="text-sm mt-2">{t('dashboard.createListings')}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          🚀 {t('dashboard.quickActions')}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate('/catalog/suppliers')}
            className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏭</span>
              <div>
                <p className="font-medium text-gray-900">{t('dashboard.browseSuppliers')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.findProducts')}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/listings')}
            className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium text-gray-900">{t('dashboard.manageListings')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.editListings')}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <p className="font-medium text-gray-900">{t('dashboard.viewOrders')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.trackOrders')}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
