# Information Security Policy
**Dropship Hub - Multi-Tenant SaaS Platform**

**Version:** 1.0  
**Last Updated:** March 2024  
**Classification:** Internal

---

## 1. Purpose

This Information Security Policy establishes the security requirements and controls for the Dropship Hub platform to ensure compliance with:
- Shopee Open Platform Data Protection Policy (DPP)
- Mercado Livre API Security Requirements
- General Data Protection Regulations
- Industry best practices for SaaS platforms

## 2. Scope

This policy applies to:
- All Dropship Hub backend services
- Frontend applications
- Database systems
- Third-party integrations (Shopee, Mercado Livre)
- All employees, contractors, and service providers

## 3. Data Classification

### 3.1 Highly Sensitive Data
**Encryption Required | Access Restricted | Audit Logged**

- Marketplace API credentials (access tokens, refresh tokens)
- User passwords (hashed with bcrypt)
- Integration credentials
- Payment information (if applicable)

**Storage:** AES-256-GCM encrypted in database  
**Transmission:** HTTPS/TLS only  
**Retention:** Encrypted until integration disconnected

### 3.2 Personal Identifiable Information (PII)
**Anonymization Required After 90 Days**

- Buyer names
- Shipping addresses
- Phone numbers
- Email addresses
- Tax IDs (CPF/CNPJ)

**Storage:** PostgreSQL with row-level security  
**Transmission:** HTTPS/TLS only  
**Retention:** 90 days, then anonymized  
**Logging:** Never logged in plain text

### 3.3 Business Data
**Multi-Tenant Isolation Required**

- Product catalogs
- Listings
- Orders (after PII anonymization)
- Inventory levels
- Fulfillment records

**Storage:** PostgreSQL with org_id scoping  
**Access:** Enforced by OrgGuard  
**Retention:** Indefinite (business records)

### 3.4 System Data
**Audit Trail Required**

- Audit logs
- Security incidents
- Webhook events
- System metrics

**Storage:** PostgreSQL  
**Retention:** 1 year for audit logs, 30 days for webhooks  
**Access:** Admin only

## 4. Access Control

### 4.1 Authentication
- **Method:** JWT (JSON Web Tokens)
- **Token Expiry:** Configurable (default: 24 hours)
- **Password Requirements:** 
  - Minimum 8 characters
  - Hashed with bcrypt (cost factor: 10)
  - Never stored in plain text
  - Never logged

### 4.2 Authorization
- **Multi-Tenancy:** Enforced via x-org-id header + OrgGuard
- **Role-Based Access Control (RBAC):**
  - OWNER: Full organization access
  - ADMIN: Administrative functions
  - STAFF: Limited operational access

### 4.3 Organization Types
- **MERCHANT:** Can connect marketplaces, manage listings, view orders
- **SUPPLIER:** Can manage products, confirm fulfillments
- **ADMIN:** System administration (internal only)

### 4.4 Least Privilege Principle
- Users granted minimum permissions required
- Integration connections require OWNER/ADMIN role
- Cross-org access strictly prohibited
- All access attempts logged

## 5. Data Encryption

### 5.1 Data at Rest
- **Database:** PostgreSQL with encryption at rest (infrastructure level)
- **Sensitive Fields:** AES-256-GCM encryption
  - Integration credentials
  - API tokens
  - Refresh tokens
- **Encryption Key:** APP_ENC_KEY (32+ characters, rotated annually)

### 5.2 Data in Transit
- **API:** HTTPS/TLS 1.2+ only
- **Database:** Encrypted connections
- **Redis:** TLS enabled in production
- **Webhooks:** HTTPS only

### 5.3 Key Management
- Encryption keys stored in environment variables
- Never committed to version control
- Different keys for dev/staging/production
- Annual key rotation policy

## 6. Audit Logging

### 6.1 Logged Events
**All security-relevant events are logged:**

- Authentication (login, logout, failures)
- Integration management (connect, disconnect, token refresh)
- Order operations (sync, create, update)
- Fulfillment operations (confirm, ship, cancel)
- Webhook processing (received, processed, failed, duplicate)
- Security events (access denied, suspicious activity)
- Data operations (export, anonymization)

### 6.2 Audit Log Contents
**Each log entry includes:**
- Timestamp (UTC)
- Organization ID
- User ID (if applicable)
- Action performed
- Entity type and ID
- Metadata (sanitized, no PII)
- IP address
- User agent

### 6.3 Audit Log Protection
- Logs stored in separate table (audit_logs)
- Immutable (insert-only)
- Retention: 1 year
- Access: Admin only
- Never contain sensitive data (tokens, passwords, full PII)

## 7. Data Retention and Anonymization

### 7.1 Personal Data Retention
**Compliance with Shopee DPP:**

- **Retention Period:** 90 days from order creation
- **Anonymization:** Automated daily job
- **Anonymized Fields:**
  - buyer_name → "ANONYMIZED"
  - shipping_address → City/State only
  - buyer_phone → Removed
  - buyer_email → Removed

### 7.2 Business Data Retention
- Order metadata: Retained indefinitely (after PII removal)
- Audit logs: 1 year
- Webhook events: 30 days
- Integration credentials: Until disconnected

### 7.3 Data Deletion
- User requests data deletion: Processed within 30 days
- Integration disconnection: Credentials deleted immediately
- Account closure: All data anonymized/deleted per policy

## 8. Incident Response

### 8.1 Security Incident Classification

**CRITICAL:**
- Data breach confirmed
- Credential compromise
- Unauthorized data access
- System compromise

**HIGH:**
- Webhook signature failures
- Unusual API patterns
- Multiple failed authentications
- Suspected token leak

**MEDIUM:**
- Excessive duplicate webhooks
- Rate limit violations
- Suspicious activity patterns

**LOW:**
- Single failed login
- Configuration warnings

### 8.2 Incident Response Procedure

1. **Detection:** Automated monitoring + manual reporting
2. **Classification:** Severity assessment
3. **Containment:** Immediate action to limit impact
4. **Investigation:** Root cause analysis
5. **Remediation:** Fix vulnerability
6. **Documentation:** Incident report
7. **Review:** Post-mortem and improvements

### 8.3 Incident Notification
- **CRITICAL:** Immediate notification to security team + affected users
- **HIGH:** Notification within 24 hours
- **MEDIUM/LOW:** Logged and reviewed weekly

## 9. Third-Party Integration Security

### 9.1 Shopee Integration
- **Authentication:** OAuth 2.0
- **Credentials:** Encrypted with AES-256-GCM
- **Token Refresh:** Automatic before expiry
- **Webhook Validation:** HMAC-SHA256 signature verification
- **Data Minimization:** Only essential data stored
- **Compliance:** Shopee DPP requirements

### 9.2 Mercado Livre Integration
- **Authentication:** OAuth 2.0
- **Credentials:** Encrypted with AES-256-GCM
- **Token Refresh:** Automatic before expiry
- **Webhook Validation:** Signature verification
- **Data Minimization:** Only essential data stored

### 9.3 Integration Security Controls
- State parameter for CSRF protection
- Webhook deduplication (idempotency)
- Rate limiting on API calls
- Secure credential storage
- Audit logging of all integration events

## 10. Development Security

### 10.1 Development Environment
- **Separate environments:** dev, staging, production
- **No production data in dev/staging**
- **Mock data only** for testing
- **Different credentials** per environment
- **Environment validation** on startup

### 10.2 Code Security
- **No hardcoded secrets**
- **Environment variables** for all credentials
- **Strong typing** (TypeScript, no `any`)
- **Input validation** on all endpoints
- **SQL injection prevention** (Prisma ORM)
- **XSS prevention** (input sanitization)

### 10.3 Dependency Security
- Regular dependency updates
- Vulnerability scanning (npm audit)
- Lock files committed (package-lock.json)
- No deprecated packages

## 11. Network Security

### 11.1 API Security
- **HTTPS only** (TLS 1.2+)
- **Helmet.js** security headers
- **CORS** properly configured
- **Rate limiting** implemented
- **Request validation** (class-validator)

### 11.2 Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: default-src 'self'

### 11.3 Database Security
- **Connection encryption** (SSL/TLS)
- **Principle of least privilege** (database users)
- **No direct database access** from internet
- **Backup encryption**

## 12. Monitoring and Alerting

### 12.1 Security Monitoring
- Failed authentication attempts
- Unusual access patterns
- Webhook anomalies
- Integration failures
- Data export activities
- Security incident creation

### 12.2 Alerting Thresholds
- 5+ failed logins in 15 minutes → MEDIUM incident
- 10+ webhook failures in 1 hour → HIGH incident
- Invalid webhook signature → HIGH incident
- Unauthorized org access → Log + alert

## 13. Compliance

### 13.1 Shopee DPP Compliance
✓ Personal data encrypted  
✓ 90-day retention policy  
✓ Automated anonymization  
✓ Audit logging  
✓ Secure credential storage  
✓ Webhook security  
✓ Incident response plan  

### 13.2 Security Best Practices
✓ OWASP Top 10 addressed  
✓ Multi-tenant isolation  
✓ Least privilege access  
✓ Defense in depth  
✓ Secure by default  

## 14. Roles and Responsibilities

### 14.1 Security Team
- Policy enforcement
- Incident response
- Security reviews
- Compliance monitoring

### 14.2 Development Team
- Secure coding practices
- Code reviews
- Vulnerability fixes
- Security testing

### 14.3 Operations Team
- Infrastructure security
- Monitoring and alerting
- Backup management
- Incident response support

## 15. Policy Review

- **Review Frequency:** Quarterly
- **Update Triggers:** 
  - Security incidents
  - Regulatory changes
  - New integrations
  - Technology changes
- **Approval:** Security team + CTO

## 16. Exceptions

Any exceptions to this policy must be:
1. Documented in writing
2. Approved by security team
3. Time-limited
4. Reviewed quarterly

---

## Appendix A: Security Checklist

### Pre-Production Checklist
- [ ] Environment variables validated
- [ ] Encryption keys rotated
- [ ] HTTPS enforced
- [ ] Database backups configured
- [ ] Monitoring enabled
- [ ] Incident response plan tested
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Audit logging verified
- [ ] Data retention job scheduled

### Post-Deployment Checklist
- [ ] Penetration testing completed
- [ ] Vulnerability scan passed
- [ ] Security review approved
- [ ] Compliance verification
- [ ] Incident response drills
- [ ] Documentation updated

---

**Document Control:**
- **Owner:** Security Team
- **Approver:** CTO
- **Next Review:** June 2024
