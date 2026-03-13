import type { Response } from 'express';
import { Provider } from '@prisma/client';
import { IntegrationsService } from '../integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    getIntegrationsStatus(orgId: string): Promise<{
        items: import("../integrations.service").IntegrationStatus[];
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
    connectIntegration(orgId: string, provider: Provider): Promise<import("../integrations.service").ConnectIntegrationResponse>;
    disconnectIntegration(orgId: string, provider: Provider): Promise<{
        success: boolean;
    }>;
    shopeeCallback(query: any, res: Response): Promise<void>;
    mercadoLivreCallback(query: any, res: Response): Promise<void>;
}
