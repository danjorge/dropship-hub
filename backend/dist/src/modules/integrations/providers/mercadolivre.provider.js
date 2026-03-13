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
exports.MercadoLivreProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const base_provider_1 = require("./base.provider");
let MercadoLivreProvider = class MercadoLivreProvider extends base_provider_1.BaseMarketplaceProvider {
    constructor(config) {
        super();
        this.config = config;
        this.provider = client_1.Provider.MERCADOLIVRE;
        this.name = 'Mercado Livre';
        this.apiBaseUrl = 'https://api.mercadolibre.com';
        this.authBaseUrl = 'https://auth.mercadolivre.com.br';
        this.clientId = this.config.get('MELI_CLIENT_ID') || '';
        this.clientSecret = this.config.get('MELI_CLIENT_SECRET') || '';
        this.redirectUrl = this.config.get('MELI_REDIRECT_URL') ||
            'http://localhost:3000/integrations/mercadolivre/callback';
    }
    async getAuthorizationUrl(orgId) {
        if (!this.clientId || !this.clientSecret) {
            console.log('[MERCADO LIVRE DEMO MODE] Generating mock authorization URL for demonstration');
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
    async handleCallback(orgId, queryParams) {
        const { code, state, demo } = queryParams;
        if (!code) {
            throw new common_1.BadRequestException('Missing authorization code from Mercado Livre callback');
        }
        if (state !== orgId) {
            throw new common_1.BadRequestException('Invalid state parameter - possible CSRF attack');
        }
        if (demo === 'true' || !this.clientId || !this.clientSecret) {
            console.log('[MERCADO LIVRE DEMO MODE] Processing mock OAuth callback for demonstration');
            const credentials = {
                access_token: `DEMO_MELI_ACCESS_TOKEN_${Date.now()}`,
                refresh_token: `DEMO_MELI_REFRESH_TOKEN_${Date.now()}`,
                user_id: 'DEMO_USER_123',
                expires_at: Date.now() + (180 * 24 * 60 * 60 * 1000),
            };
            return {
                credentials,
                status: 'ACTIVE',
            };
        }
        try {
            const credentials = {
                access_token: code,
                expires_at: Date.now() + 21600000,
            };
            return {
                credentials,
                status: 'ACTIVE',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to exchange Mercado Livre authorization code: ${error.message}`);
        }
    }
    async refreshToken(credentials) {
        throw new Error('Mercado Livre token refresh not yet implemented');
    }
    validateWebhookSignature(payload, signature) {
        return true;
    }
};
exports.MercadoLivreProvider = MercadoLivreProvider;
exports.MercadoLivreProvider = MercadoLivreProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MercadoLivreProvider);
//# sourceMappingURL=mercadolivre.provider.js.map