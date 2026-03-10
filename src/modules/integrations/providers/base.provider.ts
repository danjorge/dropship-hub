import { Provider } from '@prisma/client';

export interface ProviderCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  shop_id?: string;
  [key: string]: any;
}

export interface AuthorizationUrlResult {
  authUrl: string;
  state: string;
}

export interface CallbackResult {
  credentials: ProviderCredentials;
  status: 'ACTIVE' | 'PENDING' | 'ERROR';
}

export abstract class BaseMarketplaceProvider {
  abstract readonly provider: Provider;
  abstract readonly name: string;

  abstract getAuthorizationUrl(orgId: string): Promise<AuthorizationUrlResult>;
  
  abstract handleCallback(
    orgId: string,
    queryParams: Record<string, any>,
  ): Promise<CallbackResult>;

  abstract refreshToken?(credentials: ProviderCredentials): Promise<ProviderCredentials>;

  abstract validateWebhookSignature?(
    payload: any,
    signature: string,
  ): boolean;
}
