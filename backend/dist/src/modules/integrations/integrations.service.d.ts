import { PrismaService } from '../../common/db/prisma.service';
import { Provider } from '@prisma/client';
import { EncryptionService } from '../../common/utils/encryption.service';
import { ShopeeProvider } from './providers/shopee.provider';
import { MercadoLivreProvider } from './providers/mercadolivre.provider';
export interface IntegrationStatus {
    provider: Provider;
    status: string;
    isConnected: boolean;
    createdAt?: Date;
}
export interface ConnectIntegrationResponse {
    provider: Provider;
    status: string;
    authUrl?: string;
    integrationId?: string;
}
export declare class IntegrationsService {
    private prisma;
    private encryption;
    private shopeeProvider;
    private mercadoLivreProvider;
    private providers;
    constructor(prisma: PrismaService, encryption: EncryptionService, shopeeProvider: ShopeeProvider, mercadoLivreProvider: MercadoLivreProvider);
    private verifyMerchantOrg;
    private getProvider;
    getIntegrationsStatus(orgId: string): Promise<{
        items: IntegrationStatus[];
    }>;
    startIntegration(orgId: string, provider: Provider): Promise<ConnectIntegrationResponse>;
    handleCallback(provider: Provider, queryParams: Record<string, any>): Promise<{
        orgId: string;
        success: boolean;
    }>;
    disconnectIntegration(orgId: string, provider: Provider): Promise<{
        success: boolean;
    }>;
    getIntegration(orgId: string, provider: Provider): Promise<{
        credentials: any;
        id: string;
        createdAt: Date;
        orgId: string;
        provider: import("@prisma/client").$Enums.Provider;
        status: string;
        credentialsEnc: string;
    }>;
    getIntegrations(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        provider: import("@prisma/client").$Enums.Provider;
        status: string;
    }[]>;
    getActiveIntegrations(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        provider: import("@prisma/client").$Enums.Provider;
        status: string;
    }[]>;
    getAvailableProviders(orgId: string): Promise<Provider[]>;
    isProviderActive(orgId: string, provider: Provider): Promise<boolean>;
}
