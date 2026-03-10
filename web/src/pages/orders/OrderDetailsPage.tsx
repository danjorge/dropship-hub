import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrder } from '@/hooks/useOrders';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import type { Provider } from '@/types';

export function OrderDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id || '');

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'medium',
    }).format(new Date(dateString));
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

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower.includes('confirmed')) {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower.includes('shipped') || statusLower.includes('delivered')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getFulfillmentBadgeColor = (status: string) => {
    switch (status) {
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={t('common.error')} onRetry={() => refetch()} />;
  if (!order) return <ErrorState message={t('orders.orderNotFound')} onRetry={() => navigate('/orders')} />;

  const totalItemsPrice = order.items.reduce((sum, item) => sum + (item.priceCents * item.qty), 0);

  return (
    <PageContainer
      title={t('orders.orderDetails')}
      description={`${t('orders.orderId')}: ${order.externalOrderId}`}
      action={
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          ← {t('orders.backToOrders')}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{order.externalOrderId}</h2>
              <p className="text-sm text-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getProviderBadgeColor(order.provider)}`}>
                {order.provider}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">{t('orders.buyerInfo')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">{t('orders.buyer')}:</span>
                  <span className="ml-2 text-sm text-gray-900">{order.buyerName || '-'}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">{t('orders.shippingAddress')}</h3>
              {order.shippingAddressJson ? (
                <div className="text-sm text-gray-900">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(order.shippingAddressJson, null, 2)}
                  </pre>
                </div>
              ) : (
                <span className="text-sm text-gray-400">{t('orders.noShippingInfo')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orders.orderItems')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.quantity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.unitPrice')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.subtotal')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.listing?.title || t('orders.unknownProduct')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.priceCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(item.priceCents * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {t('orders.total')}:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(order.totalCents || totalItemsPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Fulfillments */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orders.fulfillments')}</h3>
          {order.fulfillments.length > 0 ? (
            <div className="space-y-4">
              {order.fulfillments.map((fulfillment) => (
                <div key={fulfillment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getFulfillmentBadgeColor(fulfillment.status)}`}>
                        {fulfillment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(fulfillment.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('orders.supplier')}:</span>
                      <span className="ml-2 text-sm text-gray-900">{fulfillment.supplier.name}</span>
                    </div>
                    {fulfillment.trackingCode && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('orders.trackingCode')}:</span>
                        <span className="ml-2 text-sm text-gray-900 font-mono">{fulfillment.trackingCode}</span>
                      </div>
                    )}
                    {fulfillment.carrier && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('orders.carrier')}:</span>
                        <span className="ml-2 text-sm text-gray-900">{fulfillment.carrier}</span>
                      </div>
                    )}
                    {fulfillment.shippedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('orders.shippedAt')}:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatDateTime(fulfillment.shippedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t('orders.noFulfillments')}</p>
              <p className="text-sm mt-2">{t('orders.fulfillmentsPending')}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
