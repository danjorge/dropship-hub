# Security Best Practices & Implementation

## 🔒 Current Security Implementation

### ✅ **Implemented Security Features**

#### 1. **Authentication & Authorization**
- ✅ **bcrypt password hashing** (salt rounds: 10)
- ✅ **JWT-based authentication** with configurable expiry
- ✅ **Multi-tenant isolation** via OrgGuard
- ✅ **Role-based access control** (OWNER, ADMIN, STAFF)
- ✅ **Generic error messages** (prevents user enumeration)

#### 2. **Input Validation & Sanitization**
- ✅ **Global ValidationPipe** with strict settings:
  - `whitelist: true` - strips unknown properties
  - `forbidNonWhitelisted: true` - rejects requests with extra fields
  - `transform: true` - type coercion
- ✅ **DTO validation** with class-validator decorators
- ✅ **Prisma ORM** (prevents SQL injection)

#### 3. **Rate Limiting** (NEW)
- ✅ **Global rate limit**: 100 requests per minute per IP
- ✅ **Login endpoint**: 5 attempts per minute (brute force protection)
- ✅ **Webhooks exempted** from rate limiting (external systems)

#### 4. **Security Headers** (NEW)
- ✅ **Helmet.js** enabled with:
  - XSS protection
  - Clickjacking protection (X-Frame-Options)
  - MIME type sniffing prevention
  - Content Security Policy (CSP)
  - HSTS (HTTP Strict Transport Security)

#### 5. **CORS Configuration** (NEW)
- ✅ **Configurable origins** via CORS_ORIGIN env var
- ✅ **Credentials support** enabled
- ✅ **Allowed methods** restricted
- ✅ **Allowed headers** whitelisted (Authorization, x-org-id)

#### 6. **Environment Security**
- ✅ **Environment validation** on startup
- ✅ **Minimum secret lengths** enforced:
  - JWT_SECRET: 32+ characters
  - APP_ENC_KEY: 32+ characters
- ✅ **Fail-fast** on missing critical variables

#### 7. **Webhook Security**
- ✅ **Idempotency** via unique event IDs
- ✅ **Replay attack prevention** (timestamp validation)
- ✅ **Signature verification structure** (ready for implementation)

#### 8. **Logging & Monitoring** (NEW)
- ✅ **HTTP request logging** with user/org context
- ✅ **Error logging** with stack traces
- ✅ **Security event logging** (failed auth, invalid signatures)

## ⚠️ **Security Gaps & Recommendations**

### 🔴 **Critical (Implement Before Production)**

#### 1. **JWT Token Management**
**Current Issues:**
- No refresh tokens (7-day expiry too long)
- No token revocation mechanism
- No token rotation

**Recommendations:**
```typescript
// Implement refresh token pattern
interface TokenPair {
  accessToken: string;  // Short-lived (15 min)
  refreshToken: string; // Long-lived (7 days)
}

// Add token blacklist in Redis
await redis.set(`blacklist:${tokenId}`, '1', 'EX', expirySeconds);

// Implement token rotation on refresh
```

#### 2. **Webhook Signature Verification**
**Current Status:** Placeholder only

**Implementation Required:**
```typescript
import { createHmac } from 'crypto';

private verifyShopeeSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

#### 3. **Encryption Key Management**
**Current Issues:**
- Keys stored in plain environment variables
- No key rotation
- Weak default key

**Recommendations:**
- Use AWS Secrets Manager / HashiCorp Vault
- Implement key rotation schedule
- Use different keys per environment
- Never commit keys to version control

#### 4. **Database Security**
**Missing:**
- Connection pooling limits
- Query timeout protection
- Read replicas for sensitive queries

**Implementation:**
```typescript
// In PrismaService
const pool = new Pool({
  connectionString: url,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
});
```

### 🟡 **High Priority (Implement Soon)**

#### 5. **Audit Logging**
**Missing:**
- Login attempts (success/failure)
- Permission changes
- Data access logs
- Admin actions

**Implementation:**
```typescript
// Create audit_logs table
model AuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()"))
  userId    String
  orgId     String?
  action    String   // LOGIN, CREATE_PRODUCT, etc.
  resource  String?  // products/123
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

#### 6. **Password Policy**
**Current:** Basic validation only

**Recommendations:**
```typescript
// Add to LoginDto
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
  message: 'Password must contain uppercase, lowercase, number, and special character'
})
password!: string;

// Implement password history
// Implement account lockout after N failed attempts
// Implement password expiry (90 days)
```

#### 7. **Session Management**
**Missing:**
- Concurrent session limits
- Session invalidation on password change
- Device tracking

#### 8. **Input Sanitization**
**Add:**
```typescript
import { sanitize } from 'class-sanitizer';

export class CreateProductDto {
  @Sanitize()  // Strips HTML/scripts
  @IsString()
  title!: string;
}
```

### 🟢 **Medium Priority (Nice to Have)**

#### 9. **Two-Factor Authentication (2FA)**
- TOTP-based 2FA for admin accounts
- SMS/Email verification for sensitive operations

#### 10. **IP Whitelisting for Webhooks**
```typescript
const SHOPEE_IPS = ['52.76.123.45', '54.254.123.45'];

if (!SHOPEE_IPS.includes(request.ip)) {
  throw new ForbiddenException('Invalid source IP');
}
```

#### 11. **API Versioning**
```typescript
@Controller({ path: 'catalog', version: '1' })
```

#### 12. **Request Size Limits**
```typescript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
```

## 🛡️ **Security Checklist**

### Pre-Production
- [ ] Change all default credentials
- [ ] Generate strong JWT_SECRET (64+ chars)
- [ ] Generate strong APP_ENC_KEY (64+ chars)
- [ ] Configure CORS_ORIGIN for production domains
- [ ] Enable HTTPS/TLS (SSL certificates)
- [ ] Set NODE_ENV=production
- [ ] Implement refresh tokens
- [ ] Implement webhook signature verification
- [ ] Set up secrets management (Vault/AWS Secrets)
- [ ] Configure database connection limits
- [ ] Enable audit logging
- [ ] Set up monitoring/alerting
- [ ] Perform security audit/penetration testing
- [ ] Review and update dependencies
- [ ] Enable database backups
- [ ] Configure firewall rules

### Runtime Security
- [ ] Monitor failed login attempts
- [ ] Track rate limit violations
- [ ] Alert on suspicious patterns
- [ ] Regular security updates
- [ ] Log rotation and retention
- [ ] Incident response plan

## 📋 **Environment Variables Security**

### Required for Production
```bash
# Strong secrets (generate with: openssl rand -hex 64)
JWT_SECRET=<64-char-random-string>
APP_ENC_KEY=<64-char-random-string>

# Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@host:5433/db?pool_timeout=10&connection_limit=20

# CORS (production domains only)
CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com

# Environment
NODE_ENV=production

# Redis (for rate limiting & caching)
REDIS_HOST=redis.production.internal
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# Optional: Webhook secrets
SHOPEE_WEBHOOK_SECRET=<from-shopee-dashboard>
```

### Never Commit
- ❌ .env files
- ❌ Private keys
- ❌ API credentials
- ❌ Database passwords

### Use .env.example Instead
```bash
# .env.example (safe to commit)
DATABASE_URL=postgresql://user:pass@localhost:5433/dropship
JWT_SECRET=change-me-in-production-min-32-chars
APP_ENC_KEY=change-me-in-production-min-32-chars
```

## 🔐 **Encryption Best Practices**

### Current Implementation
```typescript
// AES-256-GCM for credentials
const cipher = createCipheriv('aes-256-gcm', key, iv);
```

### Recommendations
1. **Use different keys for different purposes**
   - Database encryption key
   - API credential encryption key
   - Session encryption key

2. **Implement key rotation**
   ```typescript
   interface EncryptedData {
     data: string;
     keyVersion: number;  // Track which key was used
     algorithm: string;
   }
   ```

3. **Store encryption metadata**
   - Algorithm used
   - Key version
   - IV (Initialization Vector)
   - Auth tag (for GCM)

## 🚨 **Incident Response**

### If Credentials Are Compromised
1. **Immediate Actions:**
   - Rotate all secrets (JWT_SECRET, APP_ENC_KEY)
   - Invalidate all active sessions
   - Force password reset for affected users
   - Review audit logs for unauthorized access

2. **Investigation:**
   - Check access logs
   - Identify affected data
   - Determine breach scope
   - Document timeline

3. **Communication:**
   - Notify affected users
   - Report to authorities if required (LGPD/GDPR)
   - Update security measures

## 📊 **Security Monitoring**

### Metrics to Track
- Failed login attempts per IP/user
- Rate limit violations
- Invalid JWT tokens
- Webhook signature failures
- Unusual API usage patterns
- Database query performance
- Error rates by endpoint

### Alerting Thresholds
- \> 10 failed logins from same IP in 5 minutes
- \> 100 rate limit violations per hour
- \> 50 invalid JWT attempts per minute
- Any webhook signature failure
- Response time > 5 seconds
- Error rate > 5%

## 🔍 **Security Testing**

### Regular Tests
1. **Dependency Scanning**
   ```bash
   pnpm audit
   pnpm outdated
   ```

2. **Static Analysis**
   ```bash
   pnpm run lint
   # Consider: SonarQube, Snyk
   ```

3. **Penetration Testing**
   - SQL injection attempts
   - XSS attempts
   - CSRF testing
   - Authentication bypass
   - Authorization bypass
   - Rate limit testing

## 📚 **Additional Resources**

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **NestJS Security:** https://docs.nestjs.com/security/helmet
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **LGPD Compliance:** https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd

## ✅ **Summary**

### Current Security Score: 7/10

**Strengths:**
- ✅ Strong password hashing
- ✅ Input validation
- ✅ Multi-tenant isolation
- ✅ Rate limiting (NEW)
- ✅ Security headers (NEW)
- ✅ CORS configuration (NEW)

**Critical Gaps:**
- ⚠️ No refresh tokens
- ⚠️ Webhook signatures not implemented
- ⚠️ No audit logging
- ⚠️ Weak key management

**Recommendation:** Implement critical items before production deployment. The current implementation is suitable for development/staging but requires hardening for production use.
