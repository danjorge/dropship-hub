import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet, useTransactions } from '@/hooks/useFinance';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { PixPaymentModal } from '@/components/finance/PixPaymentModal';

export function FinancePage() {
  const { t } = useTranslation();
  const [showPixModal, setShowPixModal] = useState(false);
  const { data: wallet, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useWallet();
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactions();

  if (walletLoading || transactionsLoading) return <LoadingState />;
  if (walletError || transactionsError) return <ErrorState message={t('common.error')} onRetry={() => refetchWallet()} />;

  const transactions = (transactionsData as any)?.transactions || [];

  return (
    <PageContainer
      title={t('finance.title')}
      description={t('finance.pageDescription')}
    >
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90 mb-1">{t('finance.availableBalance')}</p>
            <h2 className="text-4xl font-bold">
              R$ {(wallet as any)?.balance?.toFixed(2) || '0.00'}
            </h2>
          </div>
          <button
            onClick={() => setShowPixModal(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            + {t('finance.addCredits')}
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{t('finance.transactionHistory')}</h3>
        </div>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('finance.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('finance.transactionDescription')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('finance.type')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('finance.amount')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'CREDIT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'CREDIT' ? t('finance.credit') : t('finance.debit')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>{t('finance.noTransactions')}</p>
          </div>
        )}
      </div>

      {/* PIX Payment Modal */}
      {showPixModal && (
        <PixPaymentModal
          onClose={() => {
            setShowPixModal(false);
            refetchWallet();
          }}
        />
      )}
    </PageContainer>
  );
}
