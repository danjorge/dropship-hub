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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const org_guard_1 = require("../../auth/guards/org.guard");
const org_id_decorator_1 = require("../../auth/decorators/org-id.decorator");
const integrations_service_1 = require("../integrations.service");
let IntegrationsController = class IntegrationsController {
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    getIntegrationsStatus(orgId) {
        return this.integrationsService.getIntegrationsStatus(orgId);
    }
    getIntegrations(orgId) {
        return this.integrationsService.getIntegrations(orgId);
    }
    getActiveIntegrations(orgId) {
        return this.integrationsService.getActiveIntegrations(orgId);
    }
    async connectIntegration(orgId, provider) {
        return this.integrationsService.startIntegration(orgId, provider);
    }
    async disconnectIntegration(orgId, provider) {
        return this.integrationsService.disconnectIntegration(orgId, provider);
    }
    async shopeeCallback(query, res) {
        try {
            const { orgId, success } = await this.integrationsService.handleCallback(client_1.Provider.SHOPEE, query);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const redirectUrl = `${frontendUrl}/integrations?provider=SHOPEE&connected=${success}`;
            return res.redirect(redirectUrl);
        }
        catch (error) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const redirectUrl = `${frontendUrl}/integrations?provider=SHOPEE&connected=false&error=${encodeURIComponent(error.message)}`;
            return res.redirect(redirectUrl);
        }
    }
    async mercadoLivreCallback(query, res) {
        try {
            const { orgId, success } = await this.integrationsService.handleCallback(client_1.Provider.MERCADOLIVRE, query);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const redirectUrl = `${frontendUrl}/integrations?provider=MERCADOLIVRE&connected=${success}`;
            return res.redirect(redirectUrl);
        }
        catch (error) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const redirectUrl = `${frontendUrl}/integrations?provider=MERCADOLIVRE&connected=false&error=${encodeURIComponent(error.message)}`;
            return res.redirect(redirectUrl);
        }
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get integrations status',
        description: 'Get connection status for all supported marketplace providers. Returns all providers even if not connected.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Integration status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            provider: { type: 'string', enum: ['SHOPEE', 'MERCADOLIVRE'] },
                            status: { type: 'string' },
                            isConnected: { type: 'boolean' },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only MERCHANT orgs can access' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getIntegrationsStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get integrations',
        description: 'List all marketplace integrations for the current organization',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integrations retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getIntegrations", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active integrations',
        description: 'List only ACTIVE marketplace integrations for the current organization',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active integrations retrieved successfully' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getActiveIntegrations", null);
__decorate([
    (0, common_1.Post)(':provider/connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Start integration connection',
        description: 'Initiate OAuth flow for marketplace integration. Returns authUrl for redirect.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'provider',
        enum: client_1.Provider,
        description: 'Marketplace provider to connect',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Integration flow started successfully',
        schema: {
            type: 'object',
            properties: {
                provider: { type: 'string' },
                status: { type: 'string' },
                authUrl: { type: 'string' },
                integrationId: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - invalid provider or configuration error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only MERCHANT orgs can connect' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "connectIntegration", null);
__decorate([
    (0, common_1.Post)(':provider/disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, org_guard_1.OrgGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiSecurity)('x-org-id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Disconnect integration',
        description: 'Disconnect and deactivate marketplace integration',
    }),
    (0, swagger_1.ApiParam)({
        name: 'provider',
        enum: client_1.Provider,
        description: 'Marketplace provider to disconnect',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration disconnected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - integration not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - only MERCHANT orgs can disconnect' }),
    __param(0, (0, org_id_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "disconnectIntegration", null);
__decorate([
    (0, common_1.Get)('shopee/callback'),
    (0, swagger_1.ApiOperation)({
        summary: 'Shopee OAuth callback',
        description: 'Handle OAuth callback from Shopee. Exchanges code for access token and redirects to frontend.',
    }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirect to frontend integrations page' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "shopeeCallback", null);
__decorate([
    (0, common_1.Get)('mercadolivre/callback'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mercado Livre OAuth callback',
        description: 'Handle OAuth callback from Mercado Livre. Exchanges code for access token and redirects to frontend.',
    }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirect to frontend integrations page' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "mercadoLivreCallback", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('Integrations'),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map