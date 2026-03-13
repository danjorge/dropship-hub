import { ConfigService } from '@nestjs/config';
import { BaseMarketplaceProvider, AuthorizationUrlResult, CallbackResult, ProviderCredentials } from './base.provider';
export declare class ShopeeProvider extends BaseMarketplaceProvider {
    private config;
    readonly provider: "SHOPEE";
    readonly name = "Shopee";
    private readonly partnerId;
    private readonly partnerKey;
    private readonly redirectUrl;
    private readonly apiBaseUrl;
    constructor(config: ConfigService);
    getAuthorizationUrl(orgId: string): Promise<AuthorizationUrlResult>;
    handleCallback(orgId: string, queryParams: Record<string, any>): Promise<CallbackResult>;
    refreshToken(credentials: ProviderCredentials): Promise<ProviderCredentials>;
    validateWebhookSignature(payload: any, signature: string): boolean;
}
