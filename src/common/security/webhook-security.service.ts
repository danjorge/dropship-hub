import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Provider } from '@prisma/client';
import { AuditLogService, AuditAction } from './audit-log.service';
import { SecurityIncidentService, IncidentSeverity, IncidentType } from './security-incident.service';

export interface WebhookValidationResult {
  isValid: boolean;
  isDuplicate: boolean;
  eventId: string;
}

/**
 * Webhook Security Service
 * Handles webhook validation, deduplication, and secure processing
 * Implements idempotency and security best practices
 */
@Injectable()
export class WebhookSecurityService {
  private readonly logger = new Logger(WebhookSecurityService.name);

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private securityIncident: SecurityIncidentService,
  ) {}

  /**
   * Validate and deduplicate webhook event
   * Returns validation result indicating if webhook should be processed
   */
  async validateWebhook(
    provider: Provider,
    externalEventId: string,
    payload: Record<string, unknown>,
    signature?: string
  ): Promise<WebhookValidationResult> {
    // Check for duplicate webhook
    const isDuplicate = await this.isDuplicateWebhook(provider, externalEventId);

    if (isDuplicate) {
      this.logger.warn(
        `Duplicate webhook detected: ${provider} event ${externalEventId}`
      );

      // Log duplicate webhook attempt
      await this.auditLog.logWebhook(
        AuditAction.WEBHOOK_DUPLICATE,
        'system', // No specific org for duplicate detection
        provider,
        externalEventId,
        { isDuplicate: true }
      );

      return {
        isValid: false,
        isDuplicate: true,
        eventId: externalEventId,
      };
    }

    // Validate webhook signature if provided
    let isValid = true;
    if (signature) {
      isValid = await this.validateSignature(provider, payload, signature);

      if (!isValid) {
        this.logger.error(
          `Invalid webhook signature: ${provider} event ${externalEventId}`
        );

        // Create security incident for invalid signature
        await this.securityIncident.createIncident({
          severity: IncidentSeverity.HIGH,
          incidentType: IncidentType.WEBHOOK_SIGNATURE_FAILURE,
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

  /**
   * Store webhook event for idempotency and audit trail
   * IMPORTANT: Only store minimal data, never full PII
   */
  async storeWebhookEvent(
    provider: Provider,
    externalEventId: string,
    sanitizedPayload: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.prisma.webhookEvent.create({
        data: {
          provider,
          externalEventId,
          payload: sanitizedPayload as never,
        },
      });

      this.logger.log(`Stored webhook event: ${provider} ${externalEventId}`);
    } catch (error) {
      // If unique constraint violation, it's a duplicate (race condition)
      if (error.code === '23505') {
        this.logger.warn(
          `Duplicate webhook event (race condition): ${provider} ${externalEventId}`
        );
        throw new BadRequestException('Duplicate webhook event');
      }

      this.logger.error(`Failed to store webhook event: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if webhook is duplicate
   */
  private async isDuplicateWebhook(
    provider: Provider,
    externalEventId: string
  ): Promise<boolean> {
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

  /**
   * Validate webhook signature
   * Provider-specific signature validation
   */
  private async validateSignature(
    provider: Provider,
    payload: Record<string, unknown>,
    signature: string
  ): Promise<boolean> {
    // TODO: Implement provider-specific signature validation
    // For Shopee: HMAC-SHA256 with partner key
    // For Mercado Livre: Different validation method

    switch (provider) {
      case Provider.SHOPEE:
        return this.validateShopeeSignature(payload, signature);
      case Provider.MERCADOLIVRE:
        return this.validateMercadoLivreSignature(payload, signature);
      default:
        this.logger.warn(`No signature validation implemented for provider: ${provider}`);
        return true; // Allow webhook but log warning
    }
  }

  /**
   * Validate Shopee webhook signature
   */
  private validateShopeeSignature(
    payload: Record<string, unknown>,
    signature: string
  ): boolean {
    // TODO: Implement Shopee signature validation
    // Shopee uses HMAC-SHA256 with partner key
    // Reference: Shopee Open Platform documentation

    this.logger.warn('Shopee signature validation not yet implemented');
    return true; // Temporarily allow all webhooks
  }

  /**
   * Validate Mercado Livre webhook signature
   */
  private validateMercadoLivreSignature(
    payload: Record<string, unknown>,
    signature: string
  ): boolean {
    // TODO: Implement Mercado Livre signature validation
    // Reference: Mercado Livre API documentation

    this.logger.warn('Mercado Livre signature validation not yet implemented');
    return true; // Temporarily allow all webhooks
  }

  /**
   * Sanitize webhook payload before storage
   * Remove all PII and sensitive data
   */
  sanitizeWebhookPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    // Only keep safe metadata
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

    // Never include:
    // - buyer_name, buyer_email, buyer_phone
    // - shipping_address (full address)
    // - payment details
    // - access tokens
    // - Any other PII

    return sanitized;
  }

  /**
   * Detect unusual webhook patterns
   */
  async detectUnusualWebhookPattern(
    provider: Provider,
    orgId?: string
  ): Promise<void> {
    // Check for excessive webhook failures
    const recentFailures = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM audit_logs 
       WHERE action = 'webhook.failed' 
       AND metadata_json->>'provider' = $1
       AND created_at > NOW() - INTERVAL '1 hour'`,
      provider
    );

    const failureCount = Number(recentFailures[0]?.count || 0);

    if (failureCount >= 10) {
      await this.securityIncident.createIncident({
        orgId,
        severity: IncidentSeverity.HIGH,
        incidentType: IncidentType.UNUSUAL_WEBHOOK_PATTERN,
        description: `Unusual webhook failure pattern for ${provider}: ${failureCount} failures in last hour`,
        metadata: {
          provider,
          failureCount,
          timeWindow: '1 hour',
        },
      });
    }

    // Check for excessive duplicate webhooks (possible replay attack)
    const recentDuplicates = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM audit_logs 
       WHERE action = 'webhook.duplicate' 
       AND metadata_json->>'provider' = $1
       AND created_at > NOW() - INTERVAL '10 minutes'`,
      provider
    );

    const duplicateCount = Number(recentDuplicates[0]?.count || 0);

    if (duplicateCount >= 5) {
      await this.securityIncident.createIncident({
        orgId,
        severity: IncidentSeverity.MEDIUM,
        incidentType: IncidentType.UNUSUAL_WEBHOOK_PATTERN,
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

  /**
   * Get webhook processing statistics
   */
  async getWebhookStats(
    provider?: Provider,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    duplicates: number;
    failures: number;
    successRate: number;
  }> {
    let whereClause = '';
    const params: unknown[] = [];
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

    const stats = await this.prisma.$queryRawUnsafe<{
      total: bigint;
      duplicates: bigint;
      failures: bigint;
    }[]>(
      `SELECT 
        COUNT(*) FILTER (WHERE action LIKE 'webhook.%') as total,
        COUNT(*) FILTER (WHERE action = 'webhook.duplicate') as duplicates,
        COUNT(*) FILTER (WHERE action = 'webhook.failed') as failures
       FROM audit_logs
       WHERE action LIKE 'webhook.%' ${whereClause}`,
      ...params
    );

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
}
