import { PrismaService } from '../db/prisma.service';
export declare enum IncidentSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum IncidentStatus {
    OPEN = "OPEN",
    INVESTIGATING = "INVESTIGATING",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}
export declare enum IncidentType {
    MULTIPLE_FAILED_LOGINS = "multiple_failed_logins",
    UNAUTHORIZED_ACCESS_ATTEMPT = "unauthorized_access_attempt",
    SUSPICIOUS_IP_ACTIVITY = "suspicious_ip_activity",
    TOKEN_LEAK_SUSPECTED = "token_leak_suspected",
    INVALID_TOKEN_USAGE = "invalid_token_usage",
    CREDENTIAL_COMPROMISE = "credential_compromise",
    WEBHOOK_SIGNATURE_FAILURE = "webhook_signature_failure",
    UNUSUAL_WEBHOOK_PATTERN = "unusual_webhook_pattern",
    INTEGRATION_ABUSE = "integration_abuse",
    DATA_BREACH_SUSPECTED = "data_breach_suspected",
    UNAUTHORIZED_DATA_ACCESS = "unauthorized_data_access",
    PII_EXPOSURE = "pii_exposure",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    UNUSUAL_API_PATTERN = "unusual_api_pattern",
    SYSTEM_ANOMALY = "system_anomaly"
}
export interface CreateIncidentDto {
    orgId?: string;
    severity: IncidentSeverity;
    incidentType: IncidentType | string;
    description: string;
    metadata?: Record<string, unknown>;
}
export interface UpdateIncidentDto {
    status?: IncidentStatus;
    metadata?: Record<string, unknown>;
    resolvedAt?: Date;
}
export declare class SecurityIncidentService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createIncident(data: CreateIncidentDto): Promise<string>;
    updateIncident(incidentId: string, data: UpdateIncidentDto): Promise<void>;
    resolveIncident(incidentId: string, resolution: string): Promise<void>;
    getIncidents(orgId?: string, filters?: {
        severity?: IncidentSeverity;
        status?: IncidentStatus;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<unknown[]>;
    detectSuspiciousActivity(orgId: string, userId: string, activityType: string, metadata: Record<string, unknown>): Promise<void>;
    private handleCriticalIncident;
    getIncidentStats(orgId?: string): Promise<{
        total: number;
        open: number;
        critical: number;
        byType: Record<string, number>;
    }>;
}
