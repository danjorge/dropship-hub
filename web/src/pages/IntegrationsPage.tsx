import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useIntegrationsStatus, useConnectIntegration, useDisconnectIntegration } from '@/hooks/useIntegrations';
import type { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
  name: string;
  description: string;
  isConnected: boolean;
  status: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  isDisconnecting: boolean;
}

function ProviderCard({
  provider,
  name,
  description,
  isConnected,
  status,
  onConnect,
  onDisconnect,
  isConnecting,
  isDisconnecting,
}: ProviderCardProps) {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    if (isConnected) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ {t('integrations.connected')}
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {t('integrations.pending')}
        </span>
      );
    }
    if (status === 'ERROR') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {t('integrations.error')}
        </span>
      );
    }
    return null;
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'SHOPEE':
        return '🛍️';
      case 'MERCADOLIVRE':
        return '🛒';
      default:
        return '🔌';
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{getProviderIcon()}</div>
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{name}</h4>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">{description}</p>

      <div className="flex gap-2">
        {isConnected ? (
          <>
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? t('integrations.reconnecting') : t('integrations.reconnect')}
            </button>
            <button
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? t('integrations.disconnecting') : t('integrations.disconnect')}
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? t('integrations.connecting') : t('integrations.connect')}
          </button>
        )}
      </div>
    </div>
  );
}

export function IntegrationsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: statusResponse, isLoading, error, refetch } = useIntegrationsStatus();
  const connectMutation = useConnectIntegration();
  const disconnectMutation = useDisconnectIntegration();

  useEffect(() => {
    const provider = searchParams.get('provider');
    const connected = searchParams.get('connected');
    const errorMsg = searchParams.get('error');

    if (provider && connected !== null) {
      if (connected === 'true') {
        setToast({
          message: t('integrations.connectionSuccess', { provider }),
          type: 'success',
        });
        refetch();
      } else {
        setToast({
          message: errorMsg || t('integrations.connectionError', { provider }),
          type: 'error',
        });
      }

      // Clean up URL params
      setSearchParams({});

      // Auto-hide toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
    }
  }, [searchParams, setSearchParams, refetch, t]);

  const handleConnect = async (provider: Provider) => {
    try {
      const response = await connectMutation.mutateAsync(provider);
      
      if (response.authUrl) {
        // Redirect to provider OAuth page
        window.location.href = response.authUrl;
      } else {
        // Direct connection (no OAuth redirect needed)
        setToast({
          message: t('integrations.connectionSuccess', { provider }),
          type: 'success',
        });
        refetch();
      }
    } catch (error: any) {
      setToast({
        message: error.message || t('integrations.connectionError', { provider }),
        type: 'error',
      });
    }
  };

  const handleDisconnect = async (provider: Provider) => {
    if (!window.confirm(t('integrations.confirmDisconnect', { provider }))) {
      return;
    }

    try {
      await disconnectMutation.mutateAsync(provider);
      setToast({
        message: t('integrations.disconnectionSuccess', { provider }),
        type: 'success',
      });
      refetch();
    } catch (error: any) {
      setToast({
        message: error.message || t('integrations.disconnectionError', { provider }),
        type: 'error',
      });
    }
  };

  const getProviderName = (provider: Provider): string => {
    switch (provider) {
      case 'SHOPEE':
        return 'Shopee';
      case 'MERCADOLIVRE':
        return 'Mercado Livre';
      default:
        return provider;
    }
  };

  const getProviderDescription = (provider: Provider): string => {
    switch (provider) {
      case 'SHOPEE':
        return t('integrations.shopeeDesc');
      case 'MERCADOLIVRE':
        return t('integrations.mercadoLivreDesc');
      default:
        return '';
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={t('common.error')} onRetry={() => refetch()} />;

  const integrations = statusResponse?.items || [];

  return (
    <PageContainer
      title={t('integrations.title')}
      description={t('integrations.subtitle')}
    >
      {/* Toast Notification */}
      {toast && (
        <div className={`mb-6 p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Provider Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {integrations.map((integration) => (
          <ProviderCard
            key={integration.provider}
            provider={integration.provider}
            name={getProviderName(integration.provider)}
            description={getProviderDescription(integration.provider)}
            isConnected={integration.isConnected}
            status={integration.status}
            onConnect={() => handleConnect(integration.provider)}
            onDisconnect={() => handleDisconnect(integration.provider)}
            isConnecting={connectMutation.isPending}
            isDisconnecting={disconnectMutation.isPending}
          />
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          {t('integrations.helpTitle')}
        </h3>
        <p className="text-sm text-blue-800">
          {t('integrations.helpText')}
        </p>
      </div>
    </PageContainer>
  );
}
