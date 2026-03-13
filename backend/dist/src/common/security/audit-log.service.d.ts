import { PrismaService } from '../db/prisma.service';
export declare enum AuditAction {
    LOGIN = "auth.login",
    LOGOUT = "auth.logout",
    LOGIN_FAILED = "auth.login_failed",
    INTEGRATION_CONNECTED = "integration.connected",
    INTEGRATION_DISCONNECTED = "integration.disconnected",
    INTEGRATION_TOKEN_REFRESHED = "integration.token_refreshed",
    INTEGRATION_CONNECTION_FAILED = "integration.connection_failed",
    ORDER_SYNCED = "order.synced",
    ORDER_CREATED = "order.created",
    ORDER_UPDATED = "order.updated",
    FULFILLMENT_CREATED = "fulfillment.created",
    FULFILLMENT_CONFIRMED = "fulfillment.confirmed",
    FULFILLMENT_SHIPPED = "fulfillment.shipped",
    FULFILLMENT_CANCELLED = "fulfillment.cancelled",
    WEBHOOK_RECEIVED = "webhook.received",
    WEBHOOK_PROCESSED = "webhook.processed",
    WEBHOOK_FAILED = "webhook.failed",
    WEBHOOK_DUPLICATE = "webhook.duplicate",
    ACCESS_DENIED = "security.access_denied",
    INVALID_ORG_ACCESS = "security.invalid_org_access",
    SUSPICIOUS_ACTIVITY = "security.suspicious_activity",
    DATA_EXPORTED = "data.exported",
    DATA_ANONYMIZED = "data.anonymized",
    LISTING_CREATED = "listing.created",
    LISTING_UPDATED = "listing.updated",
    LISTING_SYNCED = "listing.synced"
}
export interface AuditLogMetadata {
    [key: string]: unknown;
}
export interface CreateAuditLogDto {
    orgId: string;
    userId?: string;
    action: AuditAction | string;
    entityType?: string;
    entityId?: string;
    metadata?: AuditLogMetadata;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(data: CreateAuditLogDto): Promise<void>;
    logAuth(action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED, userId: string, orgId: string, metadata?: AuditLogMetadata, ipAddress?: string, userAgent?: string): Promise<void>;
    logIntegration(action: AuditAction, orgId: string, userId: string, provider: string, integrationId?: string, metadata?: AuditLogMetadata): Promise<void>;
    logWebhook(action: AuditAction, orgId: string, provider: string, externalEventId: string, metadata?: AuditLogMetadata): Promise<void>;
    logSecurityEvent(action: AuditAction, orgId: string, userId?: string, metadata?: AuditLogMetadata, ipAddress?: string): Promise<void>;
    logOrder(action: AuditAction, orgId: string, orderId: string, userId?: string, metadata?: AuditLogMetadata): Promise<void>;
    logFulfillment(action: AuditAction, orgId: string, fulfillmentId: string, userId: string, metadata?: AuditLogMetadata): Promise<void>;
    getAuditLogs(orgId: string, filters?: {
        userId?: string;
        action?: string;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<unknown[]>;
    createSecurityIncident(data: {
        orgId?: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        incidentType: string;
        description: string;
        metadata?: AuditLogMetadata;
    }): Promise<void>;
    private sanitizeMetadata;
}
