"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("./audit-log.service");
const pii_masking_service_1 = require("./pii-masking.service");
const security_incident_service_1 = require("./security-incident.service");
const data_retention_service_1 = require("./data-retention.service");
const webhook_security_service_1 = require("./webhook-security.service");
const prisma_module_1 = require("../db/prisma.module");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            audit_log_service_1.AuditLogService,
            pii_masking_service_1.PiiMaskingService,
            security_incident_service_1.SecurityIncidentService,
            data_retention_service_1.DataRetentionService,
            webhook_security_service_1.WebhookSecurityService,
        ],
        exports: [
            audit_log_service_1.AuditLogService,
            pii_masking_service_1.PiiMaskingService,
            security_incident_service_1.SecurityIncidentService,
            data_retention_service_1.DataRetentionService,
            webhook_security_service_1.WebhookSecurityService,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map