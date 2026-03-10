import { useFulfillments } from '@/hooks/useFulfillments';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

export function FulfillmentsPage() {
  const { data: fulfillments, isLoading, error, refetch } = useFulfillments();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load fulfillments" onRetry={() => refetch()} />;

  return (
    <PageContainer
      title="Fulfillments"
      description="Manage fulfillment orders from merchants"
    >
      {fulfillments && fulfillments.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fulfillments.map((fulfillment) => (
                <tr key={fulfillment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {fulfillment.marketplaceOrderId.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fulfillment.qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      fulfillment.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' :
                      fulfillment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      fulfillment.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                      fulfillment.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fulfillment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fulfillment.trackingCode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fulfillment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No fulfillments yet"
          description="Fulfillment orders will appear here when merchants place orders"
        />
      )}
    </PageContainer>
  );
}
