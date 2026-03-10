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
    if (!this.clientId || !this.clientSecret) {
      throw new BadRequestException(
        'Mercado Livre integration not configured. Please set MELI_CLIENT_ID and MELI_CLIENT_SECRET environment variables.',
      );
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
    const { code, state } = queryParams;

    if (!code) {
      throw new BadRequestException('Missing authorization code from Mercado Livre callback');
    }

    if (state !== orgId) {
      throw new BadRequestException('Invalid state parameter - possible CSRF attack');
    }

    if (!this.clientId || !this.clientSecret) {
      throw new BadRequestException('Mercado Livre integration not configured');
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
