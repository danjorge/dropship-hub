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
var WebhookSecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSecurityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
const client_1 = require("@prisma/client");
const audit_log_service_1 = require("./audit-log.service");
const security_incident_service_1 = require("./security-incident.service");
let WebhookSecurityService = WebhookSecurityService_1 = class WebhookSecurityService {
    constructor(prisma, auditLog, securityIncident) {
        this.prisma = prisma;
        this.auditLog = auditLog;
        this.securityIncident = securityIncident;
        this.logger = new common_1.Logger(WebhookSecurityService_1.name);
    }
    async validateWebhook(provider, externalEventId, payload, signature) {
        const isDuplicate = await this.isDuplicateWebhook(provider, externalEventId);
        if (isDuplicate) {
            this.logger.warn(`Duplicate webhook detected: ${provider} event ${externalEventId}`);
            await this.auditLog.logWebhook(audit_log_service_1.AuditAction.WEBHOOK_DUPLICATE, 'system', provider, externalEventId, { isDuplicate: true });
            return {
                isValid: false,
                isDuplicate: true,
                eventId: externalEventId,
            };
        }
        let isValid = true;
        if (signature) {
            isValid = await this.validateSignature(provider, payload, signature);
            if (!isValid) {
                this.logger.error(`Invalid webhook signature: ${provider} event ${externalEventId}`);
                await this.securityIncident.createIncident({
                    severity: security_incident_service_1.IncidentSeverity.HIGH,
                    incidentType: security_incident_service_1.IncidentType.WEBHOOK_SIGNATURE_FAILURE,
                    description: `Invalid webhook signature for ${provider} event ${externalEventId}`,
                    metadata: {
                        provider,
                        externalEventId,
                        hasSignature: !!signature,
                    },
                });
                return {
                    isValid: false,
                    isDuplicate: false,
                    eventId: externalEventId,
                };
            }
        }
        return {
            isValid: true,
            isDuplicate: false,
            eventId: externalEventId,
        };
    }
    async storeWebhookEvent(provider, externalEventId, sanitizedPayload) {
        try {
            await this.prisma.webhookEvent.create({
                data: {
                    provider,
                    externalEventId,
                    payload: sanitizedPayload,
                },
            });
            this.logger.log(`Stored webhook event: ${provider} ${externalEventId}`);
        }
        catch (error) {
            if (error.code === '23505') {
                this.logger.warn(`Duplicate webhook event (race condition): ${provider} ${externalEventId}`);
                throw new common_1.BadRequestException('Duplicate webhook event');
            }
            this.logger.error(`Failed to store webhook event: ${error.message}`, error.stack);
            throw error;
        }
    }
    async isDuplicateWebhook(provider, externalEventId) {
        const existing = await this.prisma.webhookEvent.findUnique({
            where: {
                provider_externalEventId: {
                    provider,
                    externalEventId,
                },
            },
            select: { id: true },
        });
        return !!existing;
    }
    async validateSignature(provider, payload, signature) {
        switch (provider) {
            case client_1.Provider.SHOPEE:
                return this.validateShopeeSignature(payload, signature);
            case client_1.Provider.MERCADOLIVRE:
                return this.validateMercadoLivreSignature(payload, signature);
            default:
                this.logger.warn(`No signature validation implemented for provider: ${provider}`);
                return true;
        }
    }
    validateShopeeSignature(payload, signature) {
        this.logger.warn('Shopee signature validation not yet implemented');
        return true;
    }
    validateMercadoLivreSignature(payload, signature) {
        this.logger.warn('Mercado Livre signature validation not yet implemented');
        return true;
    }
    sanitizeWebhookPayload(payload) {
        const sanitized = {};
        const safeFields = [
            'event_type',
            'event_id',
            'timestamp',
            'shop_id',
            'order_id',
            'order_status',
            'item_id',
            'listing_id',
            'quantity',
            'provider',
        ];
        for (const field of safeFields) {
            if (field in payload) {
                sanitized[field] = payload[field];
            }
        }
        return sanitized;
    }
    async detectUnusualWebhookPattern(provider, orgId) {
        const recentFailures = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM audit_logs 
       WHERE action = 'webhook.failed' 
       AND metadata_json->>'provider' = $1
       AND created_at > NOW() - INTERVAL '1 hour'`, provider);
        const failureCount = Number(recentFailures[0]?.count || 0);
        if (failureCount >= 10) {
            await this.securityIncident.createIncident({
                orgId,
                severity: security_incident_service_1.IncidentSeverity.HIGH,
                incidentType: security_incident_service_1.IncidentType.UNUSUAL_WEBHOOK_PATTERN,
                description: `Unusual webhook failure pattern for ${provider}: ${failureCount} failures in last hour`,
                metadata: {
                    provider,
                    failureCount,
                    timeWindow: '1 hour',
                },
            });
        }
        const recentDuplicates = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM audit_logs 
       WHERE action = 'webhook.duplicate' 
       AND metadata_json->>'provider' = $1
       AND created_at > NOW() - INTERVAL '10 minutes'`, provider);
        const duplicateCount = Number(recentDuplicates[0]?.count || 0);
        if (duplicateCount >= 5) {
            await this.securityIncident.createIncident({
                orgId,
                severity: security_incident_service_1.IncidentSeverity.MEDIUM,
                incidentType: security_incident_service_1.IncidentType.UNUSUAL_WEBHOOK_PATTERN,
                description: `Excessive duplicate webhooks for ${provider}: ${duplicateCount} duplicates in last 10 minutes`,
                metadata: {
                    provider,
                    duplicateCount,
                    timeWindow: '10 minutes',
                    possibleReplayAttack: true,
                },
            });
        }
    }
    async getWebhookStats(provider, startDate, endDate) {
        let whereClause = '';
        const params = [];
        let paramIndex = 1;
        if (provider) {
            whereClause += ` AND metadata_json->>'provider' = $${paramIndex}`;
            params.push(provider);
            paramIndex++;
        }
        if (startDate) {
            whereClause += ` AND created_at >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }
        if (endDate) {
            whereClause += ` AND created_at <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }
        const stats = await this.prisma.$queryRawUnsafe(`SELECT 
        COUNT(*) FILTER (WHERE action LIKE 'webhook.%') as total,
        COUNT(*) FILTER (WHERE action = 'webhook.duplicate') as duplicates,
        COUNT(*) FILTER (WHERE action = 'webhook.failed') as failures
       FROM audit_logs
       WHERE action LIKE 'webhook.%' ${whereClause}`, ...params);
        const total = Number(stats[0]?.total || 0);
        const duplicates = Number(stats[0]?.duplicates || 0);
        const failures = Number(stats[0]?.failures || 0);
        const successful = total - duplicates - failures;
        const successRate = total > 0 ? (successful / total) * 100 : 0;
        return {
            total,
            duplicates,
            failures,
            successRate: Math.round(successRate * 100) / 100,
        };
    }
};
exports.WebhookSecurityService = WebhookSecurityService;
exports.WebhookSecurityService = WebhookSecurityService = WebhookSecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        security_incident_service_1.SecurityIncidentService])
], WebhookSecurityService);
//# sourceMappingURL=webhook-security.service.js.map