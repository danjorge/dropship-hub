import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IncidentType {
  // Authentication & Access
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  SUSPICIOUS_IP_ACTIVITY = 'suspicious_ip_activity',
  
  // Token & Credentials
  TOKEN_LEAK_SUSPECTED = 'token_leak_suspected',
  INVALID_TOKEN_USAGE = 'invalid_token_usage',
  CREDENTIAL_COMPROMISE = 'credential_compromise',
  
  // Webhook & Integration
  WEBHOOK_SIGNATURE_FAILURE = 'webhook_signature_failure',
  UNUSUAL_WEBHOOK_PATTERN = 'unusual_webhook_pattern',
  INTEGRATION_ABUSE = 'integration_abuse',
  
  // Data & Privacy
  DATA_BREACH_SUSPECTED = 'data_breach_suspected',
  UNAUTHORIZED_DATA_ACCESS = 'unauthorized_data_access',
  PII_EXPOSURE = 'pii_exposure',
  
  // System
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNUSUAL_API_PATTERN = 'unusual_api_pattern',
  SYSTEM_ANOMALY = 'system_anomaly',
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

@Injectable()
export class SecurityIncidentService {
  private readonly logger = new Logger(SecurityIncidentService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new security incident
   */
  async createIncident(data: CreateIncidentDto): Promise<string> {
    try {
      const result = await this.prisma.$queryRawUnsafe<{ id: string }[]>(
        `INSERT INTO security_incidents (org_id, severity, incident_type, description, metadata_json, status)
         VALUES ($1, $2, $3, $4, $5, 'OPEN')
         RETURNING id`,
        data.orgId || null,
        data.severity,
        data.incidentType,
        data.description,
        data.metadata ? JSON.stringify(data.metadata) : null
      );

      const incidentId = result[0]?.id;

      this.logger.warn(
        `Security Incident Created [${data.severity}]: ${data.incidentType} - ${data.description}`,
        { incidentId, orgId: data.orgId }
      );

      // For critical incidents, send immediate alerts
      if (data.severity === IncidentSeverity.CRITICAL) {
        await this.handleCriticalIncident(incidentId, data);
      }

      return incidentId;
    } catch (error) {
      this.logger.error(`Failed to create security incident: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing incident
   */
  async updateIncident(incidentId: string, data: UpdateIncidentDto): Promise<void> {
    try {
      const updates: string[] = [];
      const params: unknown[] = [];
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

      await this.prisma.$executeRawUnsafe(
        `UPDATE security_incidents SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        ...params
      );

      this.logger.log(`Security incident ${incidentId} updated: ${data.status || 'metadata updated'}`);
    } catch (error) {
      this.logger.error(`Failed to update security incident: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(incidentId: string, resolution: string): Promise<void> {
    await this.updateIncident(incidentId, {
      status: IncidentStatus.RESOLVED,
      resolvedAt: new Date(),
      metadata: { resolution },
    });
  }

  /**
   * Get incidents for an organization
   */
  async getIncidents(
    orgId?: string,
    filters?: {
      severity?: IncidentSeverity;
      status?: IncidentStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<unknown[]> {
    const limit = filters?.limit || 50;
    
    let query = `
      SELECT id, org_id, severity, incident_type, description, status, 
             metadata_json, detected_at, resolved_at, created_at
      FROM security_incidents
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
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

  /**
   * Check for suspicious patterns and create incidents
   */
  async detectSuspiciousActivity(
    orgId: string,
    userId: string,
    activityType: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    // Example: Detect multiple failed login attempts
    if (activityType === 'failed_login') {
      const recentFailures = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*) as count FROM audit_logs 
         WHERE org_id = $1 AND user_id = $2 
         AND action = 'auth.login_failed' 
         AND created_at > NOW() - INTERVAL '15 minutes'`,
        orgId,
        userId
      );

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

    // Example: Detect unusual webhook patterns
    if (activityType === 'webhook_failure') {
      const recentFailures = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*) as count FROM audit_logs 
         WHERE org_id = $1 
         AND action = 'webhook.failed' 
         AND created_at > NOW() - INTERVAL '1 hour'`,
        orgId
      );

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

  /**
   * Handle critical incidents (send alerts, notifications, etc.)
   */
  private async handleCriticalIncident(
    incidentId: string,
    data: CreateIncidentDto
  ): Promise<void> {
    // TODO: Implement critical incident handling
    // - Send email/SMS alerts to security team
    // - Create Slack/Discord notifications
    // - Trigger automated response procedures
    // - Log to external security monitoring system
    
    this.logger.error(
      `CRITICAL SECURITY INCIDENT: ${data.incidentType}`,
      {
        incidentId,
        orgId: data.orgId,
        description: data.description,
      }
    );

    // For now, just log. In production, integrate with alerting systems.
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(orgId?: string): Promise<{
    total: number;
    open: number;
    critical: number;
    byType: Record<string, number>;
  }> {
    const whereClause = orgId ? `WHERE org_id = '${orgId}'` : '';

    const stats = await this.prisma.$queryRawUnsafe<{
      total: bigint;
      open: bigint;
      critical: bigint;
    }[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'OPEN') as open,
        COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical
       FROM security_incidents ${whereClause}`
    );

    const byType = await this.prisma.$queryRawUnsafe<{
      incident_type: string;
      count: bigint;
    }[]>(
      `SELECT incident_type, COUNT(*) as count
       FROM security_incidents ${whereClause}
       GROUP BY incident_type
       ORDER BY count DESC`
    );

    return {
      total: Number(stats[0]?.total || 0),
      open: Number(stats[0]?.open || 0),
      critical: Number(stats[0]?.critical || 0),
      byType: Object.fromEntries(
        byType.map(row => [row.incident_type, Number(row.count)])
      ),
    };
  }
}
