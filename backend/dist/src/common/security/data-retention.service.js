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
var DataRetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRetentionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
const audit_log_service_1 = require("./audit-log.service");
let DataRetentionService = DataRetentionService_1 = class DataRetentionService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
        this.logger = new common_1.Logger(DataRetentionService_1.name);
        this.RETENTION_DAYS = 90;
    }
    async anonymizeExpiredOrders() {
        this.logger.log('Starting data retention anonymization job');
        let processed = 0;
        let errors = 0;
        try {
            const ordersToAnonymize = await this.prisma.$queryRawUnsafe(`SELECT id, merchant_org_id, external_order_id
         FROM marketplace_orders
         WHERE anonymized_at IS NULL
         AND created_at < NOW() - INTERVAL '${this.RETENTION_DAYS} days'
         LIMIT 1000`);
            this.logger.log(`Found ${ordersToAnonymize.length} orders to anonymize`);
            for (const order of ordersToAnonymize) {
                try {
                    await this.anonymizeOrder(order.id, order.merchant_org_id);
                    processed++;
                    await this.auditLog.log({
                        orgId: order.merchant_org_id,
                        action: audit_log_service_1.AuditAction.DATA_ANONYMIZED,
                        entityType: 'order',
                        entityId: order.id,
                        metadata: {
                            externalOrderId: order.external_order_id,
                            retentionDays: this.RETENTION_DAYS,
                        },
                    });
                }
                catch (error) {
                    errors++;
                    this.logger.error(`Failed to anonymize order ${order.id}: ${error.message}`, error.stack);
                }
            }
            this.logger.log(`Data retention job completed: ${processed} processed, ${errors} errors`);
            return { processed, errors };
        }
        catch (error) {
            this.logger.error(`Data retention job failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async anonymizeOrder(orderId, orgId) {
        await this.prisma.$executeRawUnsafe(`UPDATE marketplace_orders
       SET buyer_name = 'ANONYMIZED',
           shipping_address_json = jsonb_build_object(
             'city', COALESCE(shipping_address_json->>'city', 'ANONYMIZED'),
             'state', COALESCE(shipping_address_json->>'state', 'ANONYMIZED'),
             'country', COALESCE(shipping_address_json->>'country', 'ANONYMIZED')
           ),
           anonymized_at = NOW(),
           data_retention_date = created_at + INTERVAL '${this.RETENTION_DAYS} days'
       WHERE id = $1`, orderId);
        this.logger.log(`Anonymized order ${orderId} for org ${orgId}`);
    }
    async setRetentionDate(orderId) {
        await this.prisma.$executeRawUnsafe(`UPDATE marketplace_orders
       SET data_retention_date = created_at + INTERVAL '${this.RETENTION_DAYS} days'
       WHERE id = $1 AND data_retention_date IS NULL`, orderId);
    }
    async getOrdersApproachingRetention(orgId, daysBeforeRetention = 7) {
        return this.prisma.$queryRawUnsafe(`SELECT id, external_order_id, created_at, data_retention_date
       FROM marketplace_orders
       WHERE merchant_org_id = $1
       AND anonymized_at IS NULL
       AND data_retention_date BETWEEN NOW() AND NOW() + INTERVAL '${daysBeforeRetention} days'
       ORDER BY data_retention_date ASC`, orgId);
    }
    async getRetentionStats(orgId) {
        const stats = await this.prisma.$queryRawUnsafe(`SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL) as anonymized,
        COUNT(*) FILTER (WHERE anonymized_at IS NULL AND created_at < NOW() - INTERVAL '${this.RETENTION_DAYS} days') as pending,
        COUNT(*) FILTER (WHERE anonymized_at IS NULL AND data_retention_date BETWEEN NOW() AND NOW() + INTERVAL '7 days') as approaching
       FROM marketplace_orders
       WHERE merchant_org_id = $1`, orgId);
        return {
            totalOrders: Number(stats[0]?.total || 0),
            anonymizedOrders: Number(stats[0]?.anonymized || 0),
            pendingAnonymization: Number(stats[0]?.pending || 0),
            approachingRetention: Number(stats[0]?.approaching || 0),
        };
    }
    async manualAnonymizeOrder(orderId, orgId, userId, reason) {
        await this.anonymizeOrder(orderId, orgId);
        await this.auditLog.log({
            orgId,
            userId,
            action: audit_log_service_1.AuditAction.DATA_ANONYMIZED,
            entityType: 'order',
            entityId: orderId,
            metadata: {
                manual: true,
                reason,
            },
        });
        this.logger.log(`Manual anonymization of order ${orderId} by user ${userId}: ${reason}`);
    }
    async cleanupOldAuditLogs() {
        const result = await this.prisma.$executeRawUnsafe(`DELETE FROM audit_logs
       WHERE created_at < NOW() - INTERVAL '1 year'`);
        const deleted = Number(result || 0);
        this.logger.log(`Deleted ${deleted} old audit log entries`);
        return deleted;
    }
    async cleanupOldWebhookEvents() {
        const result = await this.prisma.$executeRawUnsafe(`DELETE FROM webhook_events
       WHERE received_at < NOW() - INTERVAL '30 days'`);
        const deleted = Number(result || 0);
        this.logger.log(`Deleted ${deleted} old webhook events`);
        return deleted;
    }
};
exports.DataRetentionService = DataRetentionService;
exports.DataRetentionService = DataRetentionService = DataRetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], DataRetentionService);
//# sourceMappingURL=data-retention.service.js.map