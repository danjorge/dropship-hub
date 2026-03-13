"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
const encryption_service_1 = require("../../common/utils/encryption.service");
const shopee_provider_1 = require("./providers/shopee.provider");
const mercadolivre_provider_1 = require("./providers/mercadolivre.provider");
let IntegrationsService = class IntegrationsService {
    constructor(prisma, encryption, shopeeProvider, mercadoLivreProvider) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.shopeeProvider = shopeeProvider;
        this.mercadoLivreProvider = mercadoLivreProvider;
        this.providers = new Map([
            [client_1.Provider.SHOPEE, this.shopeeProvider],
            [client_1.Provider.MERCADOLIVRE, this.mercadoLivreProvider],
        ]);
    }
    async verifyMerchantOrg(orgId) {
        const org = await this.prisma.org.findUnique({
            where: { id: orgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.MERCHANT) {
            throw new common_1.ForbiddenException('Only MERCHANT organizations can manage marketplace integrations');
        }
    }
    getProvider(provider) {
        const providerAdapter = this.providers.get(provider);
        if (!providerAdapter) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        return providerAdapter;
    }
    async getIntegrationsStatus(orgId) {
        await this.verifyMerchantOrg(orgId);
        const existingIntegrations = await this.prisma.integration.findMany({
            where: { orgId },
            select: {
                provider: true,
                status: true,
                createdAt: true,
            },
        });
        const integrationMap = new Map(existingIntegrations.map((i) => [i.provider, i]));
        const allProviders = Array.from(this.providers.keys());
        const items = allProviders.map((provider) => {
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
    async startIntegration(orgId, provider) {
        await this.verifyMerchantOrg(orgId);
        const providerAdapter = this.getProvider(provider);
        try {
            const { authUrl, state } = await providerAdapter.getAuthorizationUrl(orgId);
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
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to start ${provider} integration: ${error.message}`);
        }
    }
    async handleCallback(provider, queryParams) {
        const providerAdapter = this.getProvider(provider);
        const orgId = queryParams.state;
        if (!orgId) {
            throw new common_1.BadRequestException('Missing state parameter in callback');
        }
        await this.verifyMerchantOrg(orgId);
        try {
            const { credentials, status } = await providerAdapter.handleCallback(orgId, queryParams);
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
        }
        catch (error) {
            await this.prisma.integration.updateMany({
                where: {
                    orgId,
                    provider,
                },
                data: {
                    status: 'ERROR',
                },
            });
            throw new common_1.BadRequestException(`Failed to complete ${provider} callback: ${error.message}`);
        }
    }
    async disconnectIntegration(orgId, provider) {
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
            throw new common_1.BadRequestException(`No ${provider} integration found to disconnect`);
        }
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
    async getIntegration(orgId, provider) {
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
    async getIntegrations(orgId) {
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
    async getActiveIntegrations(orgId) {
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
    async getAvailableProviders(orgId) {
        const activeIntegrations = await this.getActiveIntegrations(orgId);
        return activeIntegrations.map((integration) => integration.provider);
    }
    async isProviderActive(orgId, provider) {
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
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        shopee_provider_1.ShopeeProvider,
        mercadolivre_provider_1.MercadoLivreProvider])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map