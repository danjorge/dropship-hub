import { ConfigService } from '@nestjs/config';
import { BaseMarketplaceProvider, AuthorizationUrlResult, CallbackResult, ProviderCredentials } from './base.provider';
export declare class MercadoLivreProvider extends BaseMarketplaceProvider {
    private config;
    readonly provider: "MERCADOLIVRE";
    readonly name = "Mercado Livre";
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectUrl;
    private readonly apiBaseUrl;
    private readonly authBaseUrl;
    constructor(config: ConfigService);
    getAuthorizationUrl(orgId: string): Promise<AuthorizationUrlResult>;
    handleCallback(orgId: string, queryParams: Record<string, any>): Promise<CallbackResult>;
    refreshToken(credentials: ProviderCredentials): Promise<ProviderCredentials>;
    validateWebhookSignature(payload: any, signature: string): boolean;
}
