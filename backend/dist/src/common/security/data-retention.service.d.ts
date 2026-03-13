import { PrismaService } from '../db/prisma.service';
import { AuditLogService } from './audit-log.service';
export declare class DataRetentionService {
    private prisma;
    private auditLog;
    private readonly logger;
    private readonly RETENTION_DAYS;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    anonymizeExpiredOrders(): Promise<{
        processed: number;
        errors: number;
    }>;
    anonymizeOrder(orderId: string, orgId: string): Promise<void>;
    setRetentionDate(orderId: string): Promise<void>;
    getOrdersApproachingRetention(orgId: string, daysBeforeRetention?: number): Promise<unknown[]>;
    getRetentionStats(orgId: string): Promise<{
        totalOrders: number;
        anonymizedOrders: number;
        pendingAnonymization: number;
        approachingRetention: number;
    }>;
    manualAnonymizeOrder(orderId: string, orgId: string, userId: string, reason: string): Promise<void>;
    cleanupOldAuditLogs(): Promise<number>;
    cleanupOldWebhookEvents(): Promise<number>;
}
