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
exports.ShopeeProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const base_provider_1 = require("./base.provider");
let ShopeeProvider = class ShopeeProvider extends base_provider_1.BaseMarketplaceProvider {
    constructor(config) {
        super();
        this.config = config;
        this.provider = client_1.Provider.SHOPEE;
        this.name = 'Shopee';
        this.apiBaseUrl = 'https://partner.shopeemobile.com';
        this.partnerId = this.config.get('SHOPEE_PARTNER_ID') || '';
        this.partnerKey = this.config.get('SHOPEE_PARTNER_KEY') || '';
        this.redirectUrl = this.config.get('SHOPEE_REDIRECT_URL') ||
            'http://localhost:3000/integrations/shopee/callback';
    }
    async getAuthorizationUrl(orgId) {
        if (!this.partnerId || !this.partnerKey) {
            console.log('[SHOPEE DEMO MODE] Generating mock authorization URL for demonstration');
            const demoAuthUrl = `${this.redirectUrl}?code=DEMO_AUTH_CODE_${Date.now()}&shop_id=DEMO_SHOP_123&state=${orgId}&demo=true`;
            return {
                authUrl: demoAuthUrl,
                state: orgId,
            };
        }
        const timestamp = Math.floor(Date.now() / 1000);
        const path = '/api/v2/shop/auth_partner';
        const baseString = `${this.partnerId}${path}${timestamp}`;
        const sign = (0, crypto_1.createHmac)('sha256', this.partnerKey)
            .update(baseString)
            .digest('hex');
        const authUrl = `${this.apiBaseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(this.redirectUrl)}`;
        return {
            authUrl,
            state: orgId,
        };
    }
    async handleCallback(orgId, queryParams) {
        const { code, shop_id, demo } = queryParams;
        if (!code) {
            throw new common_1.BadRequestException('Missing authorization code from Shopee callback');
        }
        if (demo === 'true' || !this.partnerId || !this.partnerKey) {
            console.log('[SHOPEE DEMO MODE] Processing mock OAuth callback for demonstration');
            const credentials = {
                access_token: `DEMO_ACCESS_TOKEN_${Date.now()}`,
                refresh_token: `DEMO_REFRESH_TOKEN_${Date.now()}`,
                shop_id: shop_id?.toString() || 'DEMO_SHOP_123',
                expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000),
            };
            return {
                credentials,
                status: 'ACTIVE',
            };
        }
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = '/api/v2/auth/token/get';
            const baseString = `${this.partnerId}${path}${timestamp}`;
            const sign = (0, crypto_1.createHmac)('sha256', this.partnerKey)
                .update(baseString)
                .digest('hex');
            const requestBody = {
                code,
                shop_id: parseInt(shop_id, 10),
                partner_id: parseInt(this.partnerId, 10),
            };
            const response = await fetch(`${this.apiBaseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Shopee API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            if (!data.access_token) {
                throw new Error('No access token received from Shopee');
            }
            const credentials = {
                access_token: data.access_token,
                refresh_token: data.refresh_token || '',
                shop_id: shop_id?.toString() || '',
                expires_at: Date.now() + (data.expire_in * 1000),
            };
            return {
                credentials,
                status: 'ACTIVE',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to exchange Shopee authorization code: ${error.message}`);
        }
    }
    async refreshToken(credentials) {
        if (!this.partnerId || !this.partnerKey) {
            throw new common_1.BadRequestException('Shopee integration not configured');
        }
        if (!credentials.refresh_token) {
            throw new common_1.BadRequestException('No refresh token available');
        }
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = '/api/v2/auth/access_token/get';
            const baseString = `${this.partnerId}${path}${timestamp}`;
            const sign = (0, crypto_1.createHmac)('sha256', this.partnerKey)
                .update(baseString)
                .digest('hex');
            const requestBody = {
                refresh_token: credentials.refresh_token,
                shop_id: parseInt(credentials.shop_id || '0', 10),
                partner_id: parseInt(this.partnerId, 10),
            };
            const response = await fetch(`${this.apiBaseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Shopee API error: ${response.status} - ${JSON.stringify(errorData)}`);
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
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to refresh Shopee token: ${error.message}`);
        }
    }
    validateWebhookSignature(payload, signature) {
        const calculatedSignature = (0, crypto_1.createHmac)('sha256', this.partnerKey)
            .update(JSON.stringify(payload))
            .digest('hex');
        return calculatedSignature === signature;
    }
};
exports.ShopeeProvider = ShopeeProvider;
exports.ShopeeProvider = ShopeeProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShopeeProvider);
//# sourceMappingURL=shopee.provider.js.map