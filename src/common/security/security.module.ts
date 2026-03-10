import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { PiiMaskingService } from './pii-masking.service';
import { SecurityIncidentService } from './security-incident.service';
import { DataRetentionService } from './data-retention.service';
import { WebhookSecurityService } from './webhook-security.service';
import { PrismaModule } from '../db/prisma.module';

/**
 * Global security module providing comprehensive security services
 * - Audit logging for compliance
 * - PII masking for safe logging
 * - Security incident management
 * - Data retention and anonymization
 * - Webhook security and validation
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuditLogService,
    PiiMaskingService,
    SecurityIncidentService,
    DataRetentionService,
    WebhookSecurityService,
  ],
  exports: [
    AuditLogService,
    PiiMaskingService,
    SecurityIncidentService,
    DataRetentionService,
    WebhookSecurityService,
  ],
})
export class SecurityModule {}
