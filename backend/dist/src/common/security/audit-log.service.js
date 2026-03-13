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
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
var AuditAction;
(function (AuditAction) {
    AuditAction["LOGIN"] = "auth.login";
    AuditAction["LOGOUT"] = "auth.logout";
    AuditAction["LOGIN_FAILED"] = "auth.login_failed";
    AuditAction["INTEGRATION_CONNECTED"] = "integration.connected";
    AuditAction["INTEGRATION_DISCONNECTED"] = "integration.disconnected";
    AuditAction["INTEGRATION_TOKEN_REFRESHED"] = "integration.token_refreshed";
    AuditAction["INTEGRATION_CONNECTION_FAILED"] = "integration.connection_failed";
    AuditAction["ORDER_SYNCED"] = "order.synced";
    AuditAction["ORDER_CREATED"] = "order.created";
    AuditAction["ORDER_UPDATED"] = "order.updated";
    AuditAction["FULFILLMENT_CREATED"] = "fulfillment.created";
    AuditAction["FULFILLMENT_CONFIRMED"] = "fulfillment.confirmed";
    AuditAction["FULFILLMENT_SHIPPED"] = "fulfillment.shipped";
    AuditAction["FULFILLMENT_CANCELLED"] = "fulfillment.cancelled";
    AuditAction["WEBHOOK_RECEIVED"] = "webhook.received";
    AuditAction["WEBHOOK_PROCESSED"] = "webhook.processed";
    AuditAction["WEBHOOK_FAILED"] = "webhook.failed";
    AuditAction["WEBHOOK_DUPLICATE"] = "webhook.duplicate";
    AuditAction["ACCESS_DENIED"] = "security.access_denied";
    AuditAction["INVALID_ORG_ACCESS"] = "security.invalid_org_access";
    AuditAction["SUSPICIOUS_ACTIVITY"] = "security.suspicious_activity";
    AuditAction["DATA_EXPORTED"] = "data.exported";
    AuditAction["DATA_ANONYMIZED"] = "data.anonymized";
    AuditAction["LISTING_CREATED"] = "listing.created";
    AuditAction["LISTING_UPDATED"] = "listing.updated";
    AuditAction["LISTING_SYNCED"] = "listing.synced";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditLogService_1.name);
    }
    async log(data) {
        try {
            const sanitizedMetadata = this.sanitizeMetadata(data.metadata);
            await this.prisma.$executeRawUnsafe(`INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, metadata_json, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, data.orgId, data.userId || null, data.action, data.entityType || null, data.entityId || null, sanitizedMetadata ? JSON.stringify(sanitizedMetadata) : null, data.ipAddress || null, data.userAgent || null);
            this.logger.log(`Audit: ${data.action} by user ${data.userId || 'system'} in org ${data.orgId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }
    async logAuth(action, userId, orgId, metadata, ipAddress, userAgent) {
        await this.log({
            orgId,
            userId,
            action,
            entityType: 'user',
            entityId: userId,
            metadata,
            ipAddress,
            userAgent,
        });
    }
    async logIntegration(action, orgId, userId, provider, integrationId, metadata) {
        await this.log({
            orgId,
            userId,
            action,
            entityType: 'integration',
            entityId: integrationId,
            metadata: {
                ...metadata,
                provider,
            },
        });
    }
    async logWebhook(action, orgId, provider, externalEventId, metadata) {
        await this.log({
            orgId,
            action,
            entityType: 'webhook',
            entityId: externalEventId,
            metadata: {
                ...metadata,
                provider,
            },
        });
    }
    async logSecurityEvent(action, orgId, userId, metadata, ipAddress) {
        await this.log({
            orgId,
            userId,
            action,
            entityType: 'security',
            metadata,
            ipAddress,
        });
        if (action === AuditAction.SUSPICIOUS_ACTIVITY) {
            await this.createSecurityIncident({
                orgId,
                severity: 'MEDIUM',
                incidentType: 'suspicious_activity',
                description: `Suspicious activity detected: ${JSON.stringify(metadata)}`,
                metadata,
            });
        }
    }
    async logOrder(action, orgId, orderId, userId, metadata) {
        await this.log({
            orgId,
            userId,
            action,
            entityType: 'order',
            entityId: orderId,
            metadata,
        });
    }
    async logFulfillment(action, orgId, fulfillmentId, userId, metadata) {
        await this.log({
            orgId,
            userId,
            action,
            entityType: 'fulfillment',
            entityId: fulfillmentId,
            metadata,
        });
    }
    async getAuditLogs(orgId, filters) {
        const limit = filters?.limit || 100;
        let query = `
      SELECT id, org_id, user_id, action, entity_type, entity_id, 
             metadata_json, ip_address, created_at
      FROM audit_logs
      WHERE org_id = $1
    `;
        const params = [orgId];
        let paramIndex = 2;
        if (filters?.userId) {
            query += ` AND user_id = $${paramIndex}`;
            params.push(filters.userId);
            paramIndex++;
        }
        if (filters?.action) {
            query += ` AND action = $${paramIndex}`;
            params.push(filters.action);
            paramIndex++;
        }
        if (filters?.entityType) {
            query += ` AND entity_type = $${paramIndex}`;
            params.push(filters.entityType);
            paramIndex++;
        }
        if (filters?.startDate) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(filters.startDate);
            paramIndex++;
        }
        if (filters?.endDate) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(filters.endDate);
            paramIndex++;
        }
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);
        return this.prisma.$queryRawUnsafe(query, ...params);
    }
    async createSecurityIncident(data) {
        try {
            await this.prisma.$executeRawUnsafe(`INSERT INTO security_incidents (org_id, severity, incident_type, description, metadata_json, status)
         VALUES ($1, $2, $3, $4, $5, 'OPEN')`, data.orgId || null, data.severity, data.incidentType, data.description, data.metadata ? JSON.stringify(data.metadata) : null);
            this.logger.warn(`Security Incident Created: [${data.severity}] ${data.incidentType} - ${data.description}`);
        }
        catch (error) {
            this.logger.error(`Failed to create security incident: ${error.message}`, error.stack);
        }
    }
    sanitizeMetadata(metadata) {
        if (!metadata)
            return undefined;
        const sanitized = { ...metadata };
        const sensitiveKeys = [
            'access_token',
            'accessToken',
            'refresh_token',
            'refreshToken',
            'password',
            'passwordHash',
            'secret',
            'apiKey',
            'api_key',
            'credentials',
            'credentialsEnc',
            'phone',
            'phoneNumber',
            'email',
            'address',
            'shippingAddress',
            'shipping_address',
            'buyerEmail',
            'buyer_email',
            'buyerPhone',
            'buyer_phone',
        ];
        for (const key of sensitiveKeys) {
            if (key in sanitized) {
                delete sanitized[key];
            }
        }
        for (const [key, value] of Object.entries(sanitized)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                sanitized[key] = this.sanitizeMetadata(value);
            }
        }
        return sanitized;
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map