import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';

export enum AuditAction {
  // Authentication
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  LOGIN_FAILED = 'auth.login_failed',
  
  // Integration Management
  INTEGRATION_CONNECTED = 'integration.connected',
  INTEGRATION_DISCONNECTED = 'integration.disconnected',
  INTEGRATION_TOKEN_REFRESHED = 'integration.token_refreshed',
  INTEGRATION_CONNECTION_FAILED = 'integration.connection_failed',
  
  // Order Operations
  ORDER_SYNCED = 'order.synced',
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  
  // Fulfillment Operations
  FULFILLMENT_CREATED = 'fulfillment.created',
  FULFILLMENT_CONFIRMED = 'fulfillment.confirmed',
  FULFILLMENT_SHIPPED = 'fulfillment.shipped',
  FULFILLMENT_CANCELLED = 'fulfillment.cancelled',
  
  // Webhook Processing
  WEBHOOK_RECEIVED = 'webhook.received',
  WEBHOOK_PROCESSED = 'webhook.processed',
  WEBHOOK_FAILED = 'webhook.failed',
  WEBHOOK_DUPLICATE = 'webhook.duplicate',
  
  // Security Events
  ACCESS_DENIED = 'security.access_denied',
  INVALID_ORG_ACCESS = 'security.invalid_org_access',
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  
  // Data Operations
  DATA_EXPORTED = 'data.exported',
  DATA_ANONYMIZED = 'data.anonymized',
  
  // Listing Operations
  LISTING_CREATED = 'listing.created',
  LISTING_UPDATED = 'listing.updated',
  LISTING_SYNCED = 'listing.synced',
}

export interface AuditLogMetadata {
  [key: string]: unknown;
  // Never include sensitive data like tokens, passwords, full addresses
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

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create an audit log entry
   * IMPORTANT: Never log sensitive data like tokens, passwords, or full PII
   */
  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      // Sanitize metadata to ensure no sensitive data is logged
      const sanitizedMetadata = this.sanitizeMetadata(data.metadata);

      await this.prisma.$executeRawUnsafe(
        `INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, metadata_json, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        data.orgId,
        data.userId || null,
        data.action,
        data.entityType || null,
        data.entityId || null,
        sanitizedMetadata ? JSON.stringify(sanitizedMetadata) : null,
        data.ipAddress || null,
        data.userAgent || null
      );

      this.logger.log(
        `Audit: ${data.action} by user ${data.userId || 'system'} in org ${data.orgId}`
      );
    } catch (error) {
      // Never fail the main operation due to audit logging failure
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Log authentication event
   */
  async logAuth(
    action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED,
    userId: string,
    orgId: string,
    metadata?: AuditLogMetadata,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
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

  /**
   * Log integration event
   */
  async logIntegration(
    action: AuditAction,
    orgId: string,
    userId: string,
    provider: string,
    integrationId?: string,
    metadata?: AuditLogMetadata
  ): Promise<void> {
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

  /**
   * Log webhook event (with minimal PII)
   */
  async logWebhook(
    action: AuditAction,
    orgId: string,
    provider: string,
    externalEventId: string,
    metadata?: AuditLogMetadata
  ): Promise<void> {
    await this.log({
      orgId,
      action,
      entityType: 'webhook',
      entityId: externalEventId,
      metadata: {
        ...metadata,
        provider,
        // Never include full webhook payload
      },
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    action: AuditAction,
    orgId: string,
    userId?: string,
    metadata?: AuditLogMetadata,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      orgId,
      userId,
      action,
      entityType: 'security',
      metadata,
      ipAddress,
    });

    // If it's a critical security event, also create a security incident
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

  /**
   * Log order operation
   */
  async logOrder(
    action: AuditAction,
    orgId: string,
    orderId: string,
    userId?: string,
    metadata?: AuditLogMetadata
  ): Promise<void> {
    await this.log({
      orgId,
      userId,
      action,
      entityType: 'order',
      entityId: orderId,
      metadata,
    });
  }

  /**
   * Log fulfillment operation
   */
  async logFulfillment(
    action: AuditAction,
    orgId: string,
    fulfillmentId: string,
    userId: string,
    metadata?: AuditLogMetadata
  ): Promise<void> {
    await this.log({
      orgId,
      userId,
      action,
      entityType: 'fulfillment',
      entityId: fulfillmentId,
      metadata,
    });
  }

  /**
   * Query audit logs for an organization
   */
  async getAuditLogs(
    orgId: string,
    filters?: {
      userId?: string;
      action?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<unknown[]> {
    const limit = filters?.limit || 100;
    
    let query = `
      SELECT id, org_id, user_id, action, entity_type, entity_id, 
             metadata_json, ip_address, created_at
      FROM audit_logs
      WHERE org_id = $1
    `;
    
    const params: unknown[] = [orgId];
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

  /**
   * Create a security incident
   */
  async createSecurityIncident(data: {
    orgId?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    incidentType: string;
    description: string;
    metadata?: AuditLogMetadata;
  }): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO security_incidents (org_id, severity, incident_type, description, metadata_json, status)
         VALUES ($1, $2, $3, $4, $5, 'OPEN')`,
        data.orgId || null,
        data.severity,
        data.incidentType,
        data.description,
        data.metadata ? JSON.stringify(data.metadata) : null
      );

      this.logger.warn(
        `Security Incident Created: [${data.severity}] ${data.incidentType} - ${data.description}`
      );
    } catch (error) {
      this.logger.error(`Failed to create security incident: ${error.message}`, error.stack);
    }
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private sanitizeMetadata(metadata?: AuditLogMetadata): AuditLogMetadata | undefined {
    if (!metadata) return undefined;

    const sanitized = { ...metadata };
    
    // List of sensitive keys that should never be logged
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

    // Remove sensitive keys
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        delete sanitized[key];
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value as AuditLogMetadata);
      }
    }

    return sanitized;
  }
}
