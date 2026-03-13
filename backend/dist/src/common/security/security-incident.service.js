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
var SecurityIncidentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityIncidentService = exports.IncidentType = exports.IncidentStatus = exports.IncidentSeverity = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "LOW";
    IncidentSeverity["MEDIUM"] = "MEDIUM";
    IncidentSeverity["HIGH"] = "HIGH";
    IncidentSeverity["CRITICAL"] = "CRITICAL";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["OPEN"] = "OPEN";
    IncidentStatus["INVESTIGATING"] = "INVESTIGATING";
    IncidentStatus["RESOLVED"] = "RESOLVED";
    IncidentStatus["CLOSED"] = "CLOSED";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var IncidentType;
(function (IncidentType) {
    IncidentType["MULTIPLE_FAILED_LOGINS"] = "multiple_failed_logins";
    IncidentType["UNAUTHORIZED_ACCESS_ATTEMPT"] = "unauthorized_access_attempt";
    IncidentType["SUSPICIOUS_IP_ACTIVITY"] = "suspicious_ip_activity";
    IncidentType["TOKEN_LEAK_SUSPECTED"] = "token_leak_suspected";
    IncidentType["INVALID_TOKEN_USAGE"] = "invalid_token_usage";
    IncidentType["CREDENTIAL_COMPROMISE"] = "credential_compromise";
    IncidentType["WEBHOOK_SIGNATURE_FAILURE"] = "webhook_signature_failure";
    IncidentType["UNUSUAL_WEBHOOK_PATTERN"] = "unusual_webhook_pattern";
    IncidentType["INTEGRATION_ABUSE"] = "integration_abuse";
    IncidentType["DATA_BREACH_SUSPECTED"] = "data_breach_suspected";
    IncidentType["UNAUTHORIZED_DATA_ACCESS"] = "unauthorized_data_access";
    IncidentType["PII_EXPOSURE"] = "pii_exposure";
    IncidentType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    IncidentType["UNUSUAL_API_PATTERN"] = "unusual_api_pattern";
    IncidentType["SYSTEM_ANOMALY"] = "system_anomaly";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
let SecurityIncidentService = SecurityIncidentService_1 = class SecurityIncidentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SecurityIncidentService_1.name);
    }
    async createIncident(data) {
        try {
            const result = await this.prisma.$queryRawUnsafe(`INSERT INTO security_incidents (org_id, severity, incident_type, description, metadata_json, status)
         VALUES ($1, $2, $3, $4, $5, 'OPEN')
         RETURNING id`, data.orgId || null, data.severity, data.incidentType, data.description, data.metadata ? JSON.stringify(data.metadata) : null);
            const incidentId = result[0]?.id;
            this.logger.warn(`Security Incident Created [${data.severity}]: ${data.incidentType} - ${data.description}`, { incidentId, orgId: data.orgId });
            if (data.severity === IncidentSeverity.CRITICAL) {
                await this.handleCriticalIncident(incidentId, data);
            }
            return incidentId;
        }
        catch (error) {
            this.logger.error(`Failed to create security incident: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateIncident(incidentId, data) {
        try {
            const updates = [];
            const params = [];
            let paramIndex = 1;
            if (data.status) {
                updates.push(`status = $${paramIndex}`);
                params.push(data.status);
                paramIndex++;
            }
            if (data.metadata) {
                updates.push(`metadata_json = $${paramIndex}`);
                params.push(JSON.stringify(data.metadata));
                paramIndex++;
            }
            if (data.resolvedAt) {
                updates.push(`resolved_at = $${paramIndex}`);
                params.push(data.resolvedAt);
                paramIndex++;
            }
            updates.push(`updated_at = NOW()`);
            if (updates.length === 0) {
                return;
            }
            params.push(incidentId);
            await this.prisma.$executeRawUnsafe(`UPDATE security_incidents SET ${updates.join(', ')} WHERE id = $${paramIndex}`, ...params);
            this.logger.log(`Security incident ${incidentId} updated: ${data.status || 'metadata updated'}`);
        }
        catch (error) {
            this.logger.error(`Failed to update security incident: ${error.message}`, error.stack);
            throw error;
        }
    }
    async resolveIncident(incidentId, resolution) {
        await this.updateIncident(incidentId, {
            status: IncidentStatus.RESOLVED,
            resolvedAt: new Date(),
            metadata: { resolution },
        });
    }
    async getIncidents(orgId, filters) {
        const limit = filters?.limit || 50;
        let query = `
      SELECT id, org_id, severity, incident_type, description, status, 
             metadata_json, detected_at, resolved_at, created_at
      FROM security_incidents
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;
        if (orgId) {
            query += ` AND org_id = $${paramIndex}`;
            params.push(orgId);
            paramIndex++;
        }
        if (filters?.severity) {
            query += ` AND severity = $${paramIndex}`;
            params.push(filters.severity);
            paramIndex++;
        }
        if (filters?.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }
        if (filters?.startDate) {
            query += ` AND detected_at >= $${paramIndex}`;
            params.push(filters.startDate);
            paramIndex++;
        }
        if (filters?.endDate) {
            query += ` AND detected_at <= $${paramIndex}`;
            params.push(filters.endDate);
            paramIndex++;
        }
        query += ` ORDER BY detected_at DESC LIMIT $${paramIndex}`;
        params.push(limit);
        return this.prisma.$queryRawUnsafe(query, ...params);
    }
    async detectSuspiciousActivity(orgId, userId, activityType, metadata) {
        if (activityType === 'failed_login') {
            const recentFailures = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM audit_logs 
         WHERE org_id = $1 AND user_id = $2 
         AND action = 'auth.login_failed' 
         AND created_at > NOW() - INTERVAL '15 minutes'`, orgId, userId);
            const failureCount = Number(recentFailures[0]?.count || 0);
            if (failureCount >= 5) {
                await this.createIncident({
                    orgId,
                    severity: IncidentSeverity.MEDIUM,
                    incidentType: IncidentType.MULTIPLE_FAILED_LOGINS,
                    description: `User ${userId} has ${failureCount} failed login attempts in the last 15 minutes`,
                    metadata: { userId, failureCount, ...metadata },
                });
            }
        }
        if (activityType === 'webhook_failure') {
            const recentFailures = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM audit_logs 
         WHERE org_id = $1 
         AND action = 'webhook.failed' 
         AND created_at > NOW() - INTERVAL '1 hour'`, orgId);
            const failureCount = Number(recentFailures[0]?.count || 0);
            if (failureCount >= 10) {
                await this.createIncident({
                    orgId,
                    severity: IncidentSeverity.HIGH,
                    incidentType: IncidentType.UNUSUAL_WEBHOOK_PATTERN,
                    description: `Unusual webhook failure pattern detected: ${failureCount} failures in the last hour`,
                    metadata: { failureCount, ...metadata },
                });
            }
        }
    }
    async handleCriticalIncident(incidentId, data) {
        this.logger.error(`CRITICAL SECURITY INCIDENT: ${data.incidentType}`, {
            incidentId,
            orgId: data.orgId,
            description: data.description,
        });
    }
    async getIncidentStats(orgId) {
        const whereClause = orgId ? `WHERE org_id = '${orgId}'` : '';
        const stats = await this.prisma.$queryRawUnsafe(`SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'OPEN') as open,
        COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical
       FROM security_incidents ${whereClause}`);
        const byType = await this.prisma.$queryRawUnsafe(`SELECT incident_type, COUNT(*) as count
       FROM security_incidents ${whereClause}
       GROUP BY incident_type
       ORDER BY count DESC`);
        return {
            total: Number(stats[0]?.total || 0),
            open: Number(stats[0]?.open || 0),
            critical: Number(stats[0]?.critical || 0),
            byType: Object.fromEntries(byType.map(row => [row.incident_type, Number(row.count)])),
        };
    }
};
exports.SecurityIncidentService = SecurityIncidentService;
exports.SecurityIncidentService = SecurityIncidentService = SecurityIncidentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityIncidentService);
//# sourceMappingURL=security-incident.service.js.map