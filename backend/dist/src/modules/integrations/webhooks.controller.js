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
var WebhooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = WebhooksController_1 = class WebhooksController {
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
        this.logger = new common_1.Logger(WebhooksController_1.name);
    }
    async handleShopeeWebhook(payload, signature) {
        this.logger.log('Received Shopee webhook');
        return this.webhooksService.handleShopeeWebhook(payload, signature);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('shopee/webhook'),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Shopee webhook handler',
        description: 'Receive and process Shopee marketplace webhooks (order events, etc.) with idempotency'
    }),
    (0, swagger_1.ApiHeader)({ name: 'x-shopee-signature', description: 'Shopee webhook signature for verification', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - invalid webhook payload' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - invalid signature' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-shopee-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleShopeeWebhook", null);
exports.WebhooksController = WebhooksController = WebhooksController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map