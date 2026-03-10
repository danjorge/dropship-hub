import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { Provider, OrgType } from '@prisma/client';
import { EncryptionService } from '../../common/utils/encryption.service';
import { ShopeeProvider } from './providers/shopee.provider';
import { MercadoLivreProvider } from './providers/mercadolivre.provider';
import { BaseMarketplaceProvider } from './providers/base.provider';

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

@Injectable()
export class IntegrationsService {
  private providers: Map<Provider, BaseMarketplaceProvider>;

  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private shopeeProvider: ShopeeProvider,
    private mercadoLivreProvider: MercadoLivreProvider,
  ) {
    this.providers = new Map<Provider, BaseMarketplaceProvider>([
      [Provider.SHOPEE, this.shopeeProvider as BaseMarketplaceProvider],
      [Provider.MERCADOLIVRE, this.mercadoLivreProvider as BaseMarketplaceProvider],
    ]);
  }

  /**
   * Verify org is MERCHANT type
   */
  private async verifyMerchantOrg(orgId: string): Promise<void> {
    const org = await this.prisma.org.findUnique({
      where: { id: orgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.MERCHANT) {
      throw new ForbiddenException('Only MERCHANT organizations can manage marketplace integrations');
    }
  }

  /**
   * Get provider adapter
   */
  private getProvider(provider: Provider): BaseMarketplaceProvider {
    const providerAdapter = this.providers.get(provider);
    if (!providerAdapter) {
      throw new BadRequestException(`Provider ${provider} is not supported`);
    }
    return providerAdapter;
  }

  /**
   * Get all integrations status for an organization
   * Returns all supported providers with their connection status
   */
  async getIntegrationsStatus(orgId: string): Promise<{ items: IntegrationStatus[] }> {
    await this.verifyMerchantOrg(orgId);

    const existingIntegrations = await this.prisma.integration.findMany({
      where: { orgId },
      select: {
        provider: true,
        status: true,
        createdAt: true,
      },
    });

    const integrationMap = new Map(
      existingIntegrations.map((i) => [i.provider, i]),
    );

    const allProviders = Array.from(this.providers.keys());
    const items: IntegrationStatus[] = allProviders.map((provider) => {
      const existing = integrationMap.get(provider);
      return {
        provider,
        status: existing?.status || 'NOT_CONNECTED',
        isConnected: existing?.status === 'ACTIVE',
        createdAt: existing?.createdAt,
      };
    });

    return { items };
  }

  /**
   * Start integration connection flow
   */
  async startIntegration(
    orgId: string,
    provider: Provider,
  ): Promise<ConnectIntegrationResponse> {
    await this.verifyMerchantOrg(orgId);

    const providerAdapter = this.getProvider(provider);

    try {
      const { authUrl, state } = await providerAdapter.getAuthorizationUrl(orgId);

      // Create or update integration record with PENDING status
      const integration = await this.prisma.integration.upsert({
        where: {
          orgId_provider: {
            orgId,
            provider,
          },
        },
        update: {
          status: 'PENDING',
        },
        create: {
          orgId,
          provider,
          status: 'PENDING',
          credentialsEnc: this.encryption.encrypt(JSON.stringify({})),
        },
      });

      return {
        provider,
        status: 'PENDING',
        authUrl,
        integrationId: integration.id,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to start ${provider} integration: ${error.message}`,
      );
    }
  }

  /**
   * Handle OAuth callback from provider
   */
  async handleCallback(
    provider: Provider,
    queryParams: Record<string, any>,
  ): Promise<{ orgId: string; success: boolean }> {
    const providerAdapter = this.getProvider(provider);

    // Extract orgId from state parameter
    const orgId = queryParams.state;
    if (!orgId) {
      throw new BadRequestException('Missing state parameter in callback');
    }

    await this.verifyMerchantOrg(orgId);

    try {
      const { credentials, status } = await providerAdapter.handleCallback(
        orgId,
        queryParams,
      );

      // Encrypt and store credentials
      const encrypted = this.encryption.encrypt(JSON.stringify(credentials));

      await this.prisma.integration.upsert({
        where: {
          orgId_provider: {
            orgId,
            provider,
          },
        },
        update: {
          credentialsEnc: encrypted,
          status,
        },
        create: {
          orgId,
          provider,
          credentialsEnc: encrypted,
          status,
        },
      });

      return {
        orgId,
        success: status === 'ACTIVE',
      };
    } catch (error) {
      // Mark integration as ERROR
      await this.prisma.integration.updateMany({
        where: {
          orgId,
          provider,
        },
        data: {
          status: 'ERROR',
        },
      });

      throw new BadRequestException(
        `Failed to complete ${provider} callback: ${error.message}`,
      );
    }
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(
    orgId: string,
    provider: Provider,
  ): Promise<{ success: boolean }> {
    await this.verifyMerchantOrg(orgId);

    const integration = await this.prisma.integration.findUnique({
      where: {
        orgId_provider: {
          orgId,
          provider,
        },
      },
    });

    if (!integration) {
      throw new BadRequestException(`No ${provider} integration found to disconnect`);
    }

    // Update status to DISCONNECTED and clear credentials
    await this.prisma.integration.update({
      where: {
        orgId_provider: {
          orgId,
          provider,
        },
      },
      data: {
        status: 'DISCONNECTED',
        credentialsEnc: this.encryption.encrypt(JSON.stringify({})),
      },
    });

    return { success: true };
  }

  /**
   * Get decrypted integration credentials (internal use only)
   */
  async getIntegration(orgId: string, provider: Provider) {
    const integration = await this.prisma.integration.findUnique({
      where: {
        orgId_provider: {
          orgId,
          provider,
        },
      },
    });

    if (!integration) {
      return null;
    }

    const decrypted = this.encryption.decrypt(integration.credentialsEnc);
    const credentials = JSON.parse(decrypted);

    return {
      ...integration,
      credentials,
    };
  }

  /**
   * Get all integrations for an organization
   */
  async getIntegrations(orgId: string) {
    return this.prisma.integration.findMany({
      where: { orgId },
      select: {
        id: true,
        provider: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get only ACTIVE integrations for an organization
   */
  async getActiveIntegrations(orgId: string) {
    return this.prisma.integration.findMany({
      where: {
        orgId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        provider: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get available providers (providers with ACTIVE integrations)
   */
  async getAvailableProviders(orgId: string): Promise<Provider[]> {
    const activeIntegrations = await this.getActiveIntegrations(orgId);
    return activeIntegrations.map((integration) => integration.provider);
  }

  /**
   * Check if a specific provider is connected and active
   */
  async isProviderActive(orgId: string, provider: Provider): Promise<boolean> {
    const integration = await this.prisma.integration.findUnique({
      where: {
        orgId_provider: {
          orgId,
          provider,
        },
      },
      select: { status: true },
    });

    return integration?.status === 'ACTIVE';
  }
}
