import { PrismaService } from '../db/prisma.service';
import { Provider } from '@prisma/client';
import { AuditLogService } from './audit-log.service';
import { SecurityIncidentService } from './security-incident.service';
export interface WebhookValidationResult {
    isValid: boolean;
    isDuplicate: boolean;
    eventId: string;
}
export declare class WebhookSecurityService {
    private prisma;
    private auditLog;
    private securityIncident;
    private readonly logger;
    constructor(prisma: PrismaService, auditLog: AuditLogService, securityIncident: SecurityIncidentService);
    validateWebhook(provider: Provider, externalEventId: string, payload: Record<string, unknown>, signature?: string): Promise<WebhookValidationResult>;
    storeWebhookEvent(provider: Provider, externalEventId: string, sanitizedPayload: Record<string, unknown>): Promise<void>;
    private isDuplicateWebhook;
    private validateSignature;
    private validateShopeeSignature;
    private validateMercadoLivreSignature;
    sanitizeWebhookPayload(payload: Record<string, unknown>): Record<string, unknown>;
    detectUnusualWebhookPattern(provider: Provider, orgId?: string): Promise<void>;
    getWebhookStats(provider?: Provider, startDate?: Date, endDate?: Date): Promise<{
        total: number;
        duplicates: number;
        failures: number;
        successRate: number;
    }>;
}
