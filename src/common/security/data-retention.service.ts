import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { AuditLogService, AuditAction } from './audit-log.service';

/**
 * Data Retention Service
 * Implements Shopee DPP compliance for personal data retention and anonymization
 * 
 * Policy: Personal data must be anonymized after 90 days from order creation
 */
@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);
  private readonly RETENTION_DAYS = 90;

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Anonymize personal data in marketplace orders older than retention period
   * This should be run as a scheduled job (daily)
   */
  async anonymizeExpiredOrders(): Promise<{
    processed: number;
    errors: number;
  }> {
    this.logger.log('Starting data retention anonymization job');

    let processed = 0;
    let errors = 0;

    try {
      // Find orders that need anonymization
      const ordersToAnonymize = await this.prisma.$queryRawUnsafe<{
        id: string;
        merchant_org_id: string;
        external_order_id: string;
      }[]>(
        `SELECT id, merchant_org_id, external_order_id
         FROM marketplace_orders
         WHERE anonymized_at IS NULL
         AND created_at < NOW() - INTERVAL '${this.RETENTION_DAYS} days'
         LIMIT 1000`
      );

      this.logger.log(`Found ${ordersToAnonymize.length} orders to anonymize`);

      for (const order of ordersToAnonymize) {
        try {
          await this.anonymizeOrder(order.id, order.merchant_org_id);
          processed++;

          // Log anonymization for audit trail
          await this.auditLog.log({
            orgId: order.merchant_org_id,
            action: AuditAction.DATA_ANONYMIZED,
            entityType: 'order',
            entityId: order.id,
            metadata: {
              externalOrderId: order.external_order_id,
              retentionDays: this.RETENTION_DAYS,
            },
          });
        } catch (error) {
          errors++;
          this.logger.error(
            `Failed to anonymize order ${order.id}: ${error.message}`,
            error.stack
          );
        }
      }

      this.logger.log(
        `Data retention job completed: ${processed} processed, ${errors} errors`
      );

      return { processed, errors };
    } catch (error) {
      this.logger.error(`Data retention job failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Anonymize a single order's personal data
   */
  async anonymizeOrder(orderId: string, orgId: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE marketplace_orders
       SET buyer_name = 'ANONYMIZED',
           shipping_address_json = jsonb_build_object(
             'city', COALESCE(shipping_address_json->>'city', 'ANONYMIZED'),
             'state', COALESCE(shipping_address_json->>'state', 'ANONYMIZED'),
             'country', COALESCE(shipping_address_json->>'country', 'ANONYMIZED')
           ),
           anonymized_at = NOW(),
           data_retention_date = created_at + INTERVAL '${this.RETENTION_DAYS} days'
       WHERE id = $1`,
      orderId
    );

    this.logger.log(`Anonymized order ${orderId} for org ${orgId}`);
  }

  /**
   * Set retention date for new orders
   * This should be called when creating new orders
   */
  async setRetentionDate(orderId: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE marketplace_orders
       SET data_retention_date = created_at + INTERVAL '${this.RETENTION_DAYS} days'
       WHERE id = $1 AND data_retention_date IS NULL`,
      orderId
    );
  }

  /**
   * Get orders approaching retention date (for notifications)
   */
  async getOrdersApproachingRetention(
    orgId: string,
    daysBeforeRetention: number = 7
  ): Promise<unknown[]> {
    return this.prisma.$queryRawUnsafe(
      `SELECT id, external_order_id, created_at, data_retention_date
       FROM marketplace_orders
       WHERE merchant_org_id = $1
       AND anonymized_at IS NULL
       AND data_retention_date BETWEEN NOW() AND NOW() + INTERVAL '${daysBeforeRetention} days'
       ORDER BY data_retention_date ASC`,
      orgId
    );
  }

  /**
   * Get retention statistics for an organization
   */
  async getRetentionStats(orgId: string): Promise<{
    totalOrders: number;
    anonymizedOrders: number;
    pendingAnonymization: number;
    approachingRetention: number;
  }> {
    const stats = await this.prisma.$queryRawUnsafe<{
      total: bigint;
      anonymized: bigint;
      pending: bigint;
      approaching: bigint;
    }[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL) as anonymized,
        COUNT(*) FILTER (WHERE anonymized_at IS NULL AND created_at < NOW() - INTERVAL '${this.RETENTION_DAYS} days') as pending,
        COUNT(*) FILTER (WHERE anonymized_at IS NULL AND data_retention_date BETWEEN NOW() AND NOW() + INTERVAL '7 days') as approaching
       FROM marketplace_orders
       WHERE merchant_org_id = $1`,
      orgId
    );

    return {
      totalOrders: Number(stats[0]?.total || 0),
      anonymizedOrders: Number(stats[0]?.anonymized || 0),
      pendingAnonymization: Number(stats[0]?.pending || 0),
      approachingRetention: Number(stats[0]?.approaching || 0),
    };
  }

  /**
   * Manually trigger anonymization for specific order (admin function)
   */
  async manualAnonymizeOrder(
    orderId: string,
    orgId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    await this.anonymizeOrder(orderId, orgId);

    await this.auditLog.log({
      orgId,
      userId,
      action: AuditAction.DATA_ANONYMIZED,
      entityType: 'order',
      entityId: orderId,
      metadata: {
        manual: true,
        reason,
      },
    });

    this.logger.log(
      `Manual anonymization of order ${orderId} by user ${userId}: ${reason}`
    );
  }

  /**
   * Delete old audit logs (keep for 1 year)
   */
  async cleanupOldAuditLogs(): Promise<number> {
    const result = await this.prisma.$executeRawUnsafe<{ count: bigint }>(
      `DELETE FROM audit_logs
       WHERE created_at < NOW() - INTERVAL '1 year'`
    );

    const deleted = Number(result || 0);
    this.logger.log(`Deleted ${deleted} old audit log entries`);
    return deleted;
  }

  /**
   * Delete old webhook events (keep for 30 days)
   */
  async cleanupOldWebhookEvents(): Promise<number> {
    const result = await this.prisma.$executeRawUnsafe<{ count: bigint }>(
      `DELETE FROM webhook_events
       WHERE received_at < NOW() - INTERVAL '30 days'`
    );

    const deleted = Number(result || 0);
    this.logger.log(`Deleted ${deleted} old webhook events`);
    return deleted;
  }
}
