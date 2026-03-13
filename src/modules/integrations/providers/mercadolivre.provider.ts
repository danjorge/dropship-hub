import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import {
  BaseMarketplaceProvider,
  AuthorizationUrlResult,
  CallbackResult,
  ProviderCredentials,
} from './base.provider';

@Injectable()
export class MercadoLivreProvider extends BaseMarketplaceProvider {
  readonly provider = Provider.MERCADOLIVRE;
  readonly name = 'Mercado Livre';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUrl: string;
  private readonly apiBaseUrl = 'https://api.mercadolibre.com';
  private readonly authBaseUrl = 'https://auth.mercadolivre.com.br';

  constructor(private config: ConfigService) {
    super();
    this.clientId = this.config.get<string>('MELI_CLIENT_ID') || '';
    this.clientSecret = this.config.get<string>('MELI_CLIENT_SECRET') || '';
    this.redirectUrl = this.config.get<string>('MELI_REDIRECT_URL') || 
      'http://localhost:3000/integrations/mercadolivre/callback';
  }

  async getAuthorizationUrl(orgId: string): Promise<AuthorizationUrlResult> {
    // DEMO MODE: If credentials not configured, return mock auth URL for demonstration
    if (!this.clientId || !this.clientSecret) {
      console.log('[MERCADO LIVRE DEMO MODE] Generating mock authorization URL for demonstration');
      
      // Return a mock URL that redirects back to callback with demo parameters
      const demoAuthUrl = `${this.redirectUrl}?code=DEMO_MELI_CODE_${Date.now()}&state=${orgId}&demo=true`;
      
      return {
        authUrl: demoAuthUrl,
        state: orgId,
      };
    }

    const authUrl = `${this.authBaseUrl}/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUrl)}&state=${orgId}`;

    return {
      authUrl,
      state: orgId,
    };
  }

  async handleCallback(
    orgId: string,
    queryParams: Record<string, any>,
  ): Promise<CallbackResult> {
    const { code, state, demo } = queryParams;

    if (!code) {
      throw new BadRequestException('Missing authorization code from Mercado Livre callback');
    }

    if (state !== orgId) {
      throw new BadRequestException('Invalid state parameter - possible CSRF attack');
    }

    // DEMO MODE: If this is a demo callback or credentials not configured
    if (demo === 'true' || !this.clientId || !this.clientSecret) {
      console.log('[MERCADO LIVRE DEMO MODE] Processing mock OAuth callback for demonstration');
      
      // Return mock credentials for demonstration
      const credentials: ProviderCredentials = {
        access_token: `DEMO_MELI_ACCESS_TOKEN_${Date.now()}`,
        refresh_token: `DEMO_MELI_REFRESH_TOKEN_${Date.now()}`,
        user_id: 'DEMO_USER_123',
        expires_at: Date.now() + (180 * 24 * 60 * 60 * 1000), // 180 days
      };

      return {
        credentials,
        status: 'ACTIVE',
      };
    }

    try {
      // TODO: Exchange code for access token with real Mercado Livre API
      // Real implementation would call:
      // POST /oauth/token
      // with grant_type=authorization_code, client_id, client_secret, code, redirect_uri
      
      const credentials: ProviderCredentials = {
        access_token: code, // In production, this would be the real access token
        expires_at: Date.now() + 21600000, // 6 hours placeholder
        // TODO: Add refresh_token when implementing real token exchange
      };

      return {
        credentials,
        status: 'ACTIVE',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to exchange Mercado Livre authorization code: ${error.message}`,
      );
    }
  }

  async refreshToken(credentials: ProviderCredentials): Promise<ProviderCredentials> {
    // TODO: Implement Mercado Livre token refresh
    // POST /oauth/token
    // with grant_type=refresh_token, client_id, client_secret, refresh_token
    
    throw new Error('Mercado Livre token refresh not yet implemented');
  }

  validateWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Implement Mercado Livre webhook signature validation if needed
    // Mercado Livre uses x-signature header with SHA256
    
    return true; // Placeholder
  }
}
