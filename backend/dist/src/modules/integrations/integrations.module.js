"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const webhooks_controller_1 = require("./webhooks.controller");
const integrations_controller_1 = require("./integrations/integrations.controller");
const webhooks_service_1 = require("./webhooks.service");
const integrations_service_1 = require("./integrations.service");
const prisma_module_1 = require("../../common/db/prisma.module");
const encryption_service_1 = require("../../common/utils/encryption.service");
const shopee_provider_1 = require("./providers/shopee.provider");
const mercadolivre_provider_1 = require("./providers/mercadolivre.provider");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [webhooks_controller_1.WebhooksController, integrations_controller_1.IntegrationsController],
        providers: [
            webhooks_service_1.WebhooksService,
            integrations_service_1.IntegrationsService,
            encryption_service_1.EncryptionService,
            shopee_provider_1.ShopeeProvider,
            mercadolivre_provider_1.MercadoLivreProvider,
        ],
        exports: [webhooks_service_1.WebhooksService, integrations_service_1.IntegrationsService],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map