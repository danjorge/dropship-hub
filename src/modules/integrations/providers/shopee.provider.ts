import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { createHmac } from 'crypto';
import {
  BaseMarketplaceProvider,
  AuthorizationUrlResult,
  CallbackResult,
  ProviderCredentials,
} from './base.provider';

@Injectable()
export class ShopeeProvider extends BaseMarketplaceProvider {
  readonly provider = Provider.SHOPEE;
  readonly name = 'Shopee';

  private readonly partnerId: string;
  private readonly partnerKey: string;
  private readonly redirectUrl: string;
  private readonly apiBaseUrl = 'https://partner.shopeemobile.com';

  constructor(private config: ConfigService) {
    super();
    this.partnerId = this.config.get<string>('SHOPEE_PARTNER_ID') || '';
    this.partnerKey = this.config.get<string>('SHOPEE_PARTNER_KEY') || '';
    this.redirectUrl = this.config.get<string>('SHOPEE_REDIRECT_URL') || 
      'http://localhost:3000/integrations/shopee/callback';
  }

  async getAuthorizationUrl(orgId: string): Promise<AuthorizationUrlResult> {
    if (!this.partnerId || !this.partnerKey) {
      throw new BadRequestException(
        'Shopee integration not configured. Please set SHOPEE_PARTNER_ID and SHOPEE_PARTNER_KEY environment variables.',
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const baseString = `${this.partnerId}${path}${timestamp}`;
    
    const sign = createHmac('sha256', this.partnerKey)
      .update(baseString)
      .digest('hex');

    const authUrl = `${this.apiBaseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(this.redirectUrl)}`;

    return {
      authUrl,
      state: orgId,
    };
  }

  async handleCallback(
    orgId: string,
    queryParams: Record<string, any>,
  ): Promise<CallbackResult> {
    const { code, shop_id } = queryParams;

    if (!code) {
      throw new BadRequestException('Missing authorization code from Shopee callback');
    }

    if (!this.partnerId || !this.partnerKey) {
      throw new BadRequestException('Shopee integration not configured');
    }

    try {
      // Exchange code for access token with Shopee API
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/api/v2/auth/token/get';
      const baseString = `${this.partnerId}${path}${timestamp}`;
      
      const sign = createHmac('sha256', this.partnerKey)
        .update(baseString)
        .digest('hex');

      const requestBody = {
        code,
        shop_id: parseInt(shop_id, 10),
        partner_id: parseInt(this.partnerId, 10),
      };

      const response = await fetch(
        `${this.apiBaseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Shopee API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      // Shopee API returns: { access_token, refresh_token, expire_in }
      if (!data.access_token) {
        throw new Error('No access token received from Shopee');
      }

      const credentials: ProviderCredentials = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        shop_id: shop_id?.toString() || '',
        expires_at: Date.now() + (data.expire_in * 1000), // Convert seconds to milliseconds
      };

      return {
        credentials,
        status: 'ACTIVE',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to exchange Shopee authorization code: ${error.message}`,
      );
    }
  }

  async refreshToken(credentials: ProviderCredentials): Promise<ProviderCredentials> {
    if (!this.partnerId || !this.partnerKey) {
      throw new BadRequestException('Shopee integration not configured');
    }

    if (!credentials.refresh_token) {
      throw new BadRequestException('No refresh token available');
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/api/v2/auth/access_token/get';
      const baseString = `${this.partnerId}${path}${timestamp}`;
      
      const sign = createHmac('sha256', this.partnerKey)
        .update(baseString)
        .digest('hex');

      const requestBody = {
        refresh_token: credentials.refresh_token,
        shop_id: parseInt(credentials.shop_id || '0', 10),
        partner_id: parseInt(this.partnerId, 10),
      };

      const response = await fetch(
        `${this.apiBaseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Shopee API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error('No access token received from Shopee');
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || credentials.refresh_token,
        shop_id: credentials.shop_id,
        expires_at: Date.now() + (data.expire_in * 1000),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to refresh Shopee token: ${error.message}`,
      );
    }
  }

  validateWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Implement Shopee webhook signature validation
    // Shopee uses HMAC-SHA256 with partner_key
    
    const calculatedSignature = createHmac('sha256', this.partnerKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return calculatedSignature === signature;
  }
}
