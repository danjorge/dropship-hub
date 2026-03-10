# Shopee Integration - Complete Setup Guide

## Overview
This guide explains how to set up and use the Shopee marketplace integration in the Dropshipping Hub platform. The integration allows merchants to connect their Shopee stores, sync listings, and manage orders.

---

## Prerequisites

1. **Shopee Partner Account**
   - You need a Shopee Partner account to get API credentials
   - Register at: https://open.shopee.com/

2. **Shopee Store**
   - An active Shopee seller account
   - Store must be approved and operational

3. **Development Environment**
   - Backend running on `http://localhost:3000`
   - Frontend running on `http://localhost:3001`
   - PostgreSQL database configured

---

## Step 1: Register as Shopee Partner

### 1.1 Create Partner Account
1. Go to https://open.shopee.com/
2. Click "Register" or "Sign Up"
3. Complete the registration form
4. Verify your email address

### 1.2 Create a New App
1. Log in to Shopee Open Platform
2. Navigate to "My Apps" or "Applications"
3. Click "Create New App"
4. Fill in app details:
   - **App Name**: Dropshipping Hub
   - **App Description**: Multi-tenant dropshipping platform
   - **Category**: E-commerce / Marketplace Integration
   - **Redirect URL**: `http://localhost:3000/integrations/shopee/callback`

### 1.3 Get Credentials
After creating the app, you'll receive:
- **Partner ID** (numeric ID)
- **Partner Key** (secret key for signing requests)

**Important**: Keep these credentials secure. Never commit them to version control.

---

## Step 2: Configure Environment Variables

### 2.1 Update .env File
Add your Shopee credentials to `/Users/danjorge/projects/personal/dropship-hub/.env`:

```bash
# Shopee Integration
SHOPEE_PARTNER_ID=your_partner_id_here
SHOPEE_PARTNER_KEY=your_partner_key_here
SHOPEE_REDIRECT_URL=http://localhost:3000/integrations/shopee/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3001
```

### 2.2 Verify Encryption Key
Ensure you have a secure encryption key set:

```bash
# Security - Strong secrets (32+ characters required)
APP_ENC_KEY=9b2f245b72880f1c9dc7ac1a34af1254fcbcac30ecd0289d26704fc1c97e8be3
```

This key is used to encrypt Shopee credentials before storing them in the database.

---

## Step 3: Backend Architecture

### 3.1 Key Components

**Provider Adapter** (`src/modules/integrations/providers/shopee.provider.ts`)
- Handles Shopee-specific OAuth flow
- Generates authorization URLs with HMAC signatures
- Exchanges authorization codes for access tokens
- Refreshes expired tokens
- Validates webhook signatures

**Integrations Service** (`src/modules/integrations/integrations.service.ts`)
- Manages integration lifecycle
- Encrypts/decrypts credentials
- Enforces multi-tenant isolation
- Validates MERCHANT org access

**Integrations Controller** (`src/modules/integrations/integrations/integrations.controller.ts`)
- Exposes REST API endpoints
- Handles OAuth callbacks
- Redirects to frontend after authentication

### 3.2 API Endpoints

#### Get Integrations Status
```
GET /integrations/status
Headers:
  Authorization: Bearer {jwt_token}
  x-org-id: {organization_id}

Response:
{
  "items": [
    {
      "provider": "SHOPEE",
      "status": "ACTIVE",
      "isConnected": true,
      "createdAt": "2024-03-06T22:00:00Z"
    }
  ]
}
```

#### Start Shopee Connection
```
POST /integrations/SHOPEE/connect
Headers:
  Authorization: Bearer {jwt_token}
  x-org-id: {organization_id}

Response:
{
  "provider": "SHOPEE",
  "status": "PENDING",
  "authUrl": "https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=...&timestamp=...&sign=...&redirect=...",
  "integrationId": "uuid"
}
```

#### Shopee OAuth Callback (Public)
```
GET /integrations/shopee/callback?code={auth_code}&shop_id={shop_id}&state={org_id}

Redirects to:
  Success: http://localhost:3001/integrations?provider=SHOPEE&connected=true
  Error: http://localhost:3001/integrations?provider=SHOPEE&connected=false&error={message}
```

#### Disconnect Shopee
```
POST /integrations/SHOPEE/disconnect
Headers:
  Authorization: Bearer {jwt_token}
  x-org-id: {organization_id}

Response:
{
  "success": true
}
```

---

## Step 4: Complete OAuth Flow

### 4.1 Flow Diagram

```
1. User clicks "Connect Shopee" button
   ↓
2. Frontend calls POST /integrations/SHOPEE/connect
   ↓
3. Backend generates Shopee authorization URL
   - Creates HMAC-SHA256 signature
   - Includes partner_id, timestamp, sign, redirect_url
   - Uses orgId as state parameter (CSRF protection)
   ↓
4. Backend returns authUrl to frontend
   ↓
5. Frontend redirects browser to authUrl
   ↓
6. User sees Shopee login/authorization page
   ↓
7. User logs in and authorizes the app
   ↓
8. Shopee redirects to: /integrations/shopee/callback?code=ABC&shop_id=123&state=orgId
   ↓
9. Backend callback handler:
   - Validates state parameter
   - Calls Shopee API: POST /api/v2/auth/token/get
   - Exchanges code for access_token and refresh_token
   - Encrypts credentials with AES-256-GCM
   - Stores in integrations.credentials_enc
   - Updates status to ACTIVE
   ↓
10. Backend redirects to: /integrations?provider=SHOPEE&connected=true
    ↓
11. Frontend detects success params
    - Shows "Shopee connected successfully!" toast
    - Refetches integration status
    - Updates UI to show "Connected" badge
```

### 4.2 Token Exchange Details

**Request to Shopee API:**
```
POST https://partner.shopeemobile.com/api/v2/auth/token/get?partner_id={id}&timestamp={ts}&sign={signature}

Body:
{
  "code": "authorization_code_from_callback",
  "shop_id": 123456789,
  "partner_id": 987654321
}
```

**Response from Shopee:**
```json
{
  "access_token": "long_access_token_string",
  "refresh_token": "refresh_token_string",
  "expire_in": 14400
}
```

**Stored Credentials (Encrypted):**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "shop_id": "123456789",
  "expires_at": 1709766000000
}
```

---

## Step 5: Security Implementation

### 5.1 Credential Encryption

**Algorithm**: AES-256-GCM (Authenticated Encryption)

**Process**:
1. Generate random 16-byte IV (Initialization Vector)
2. Encrypt credentials JSON with AES-256-GCM
3. Get authentication tag
4. Store as: `{iv}:{authTag}:{encryptedData}` (hex format)

**Decryption**:
1. Split stored string by `:` delimiter
2. Extract IV, auth tag, and encrypted data
3. Verify auth tag (prevents tampering)
4. Decrypt and return JSON

### 5.2 CSRF Protection

**State Parameter**:
- Backend generates state = orgId
- Included in authorization URL
- Shopee returns it in callback
- Backend validates state matches expected orgId
- Prevents cross-site request forgery attacks

### 5.3 HMAC Signature

**All Shopee API requests require HMAC-SHA256 signature**:

```typescript
const baseString = `${partnerId}${path}${timestamp}`;
const signature = createHmac('sha256', partnerKey)
  .update(baseString)
  .digest('hex');
```

This ensures:
- Request authenticity
- Protection against tampering
- Shopee can verify requests come from your app

### 5.4 Multi-Tenant Isolation

**Enforced at multiple levels**:
1. OrgGuard validates x-org-id header
2. All queries scoped by orgId
3. Only MERCHANT orgs can connect integrations
4. Cannot access other org's integrations
5. Credentials encrypted per integration

---

## Step 6: Frontend Implementation

### 6.1 Integrations Page

**Location**: `web/src/pages/IntegrationsPage.tsx`

**Features**:
- Provider cards for Shopee and Mercado Livre
- Connection status badges
- Connect/Disconnect/Reconnect buttons
- OAuth callback handling
- Success/error toast notifications
- Loading states
- Responsive design

### 6.2 Connect Flow (Frontend)

```typescript
const handleConnect = async (provider: Provider) => {
  try {
    // Call backend to start OAuth flow
    const response = await connectMutation.mutateAsync(provider);
    
    if (response.authUrl) {
      // Redirect browser to Shopee authorization page
      window.location.href = response.authUrl;
    }
  } catch (error) {
    // Show error toast
    setToast({
      message: error.message,
      type: 'error',
    });
  }
};
```

### 6.3 Callback Handling

```typescript
useEffect(() => {
  const provider = searchParams.get('provider');
  const connected = searchParams.get('connected');
  const errorMsg = searchParams.get('error');

  if (provider && connected !== null) {
    if (connected === 'true') {
      setToast({
        message: t('integrations.connectionSuccess', { provider }),
        type: 'success',
      });
      refetch(); // Reload integration status
    } else {
      setToast({
        message: errorMsg || t('integrations.connectionError', { provider }),
        type: 'error',
      });
    }

    // Clean up URL params
    setSearchParams({});
  }
}, [searchParams]);
```

---

## Step 7: Testing the Integration

### 7.1 Start the Application

**Backend**:
```bash
cd /Users/danjorge/projects/personal/dropship-hub
npm run start:dev
```

**Frontend**:
```bash
cd /Users/danjorge/projects/personal/dropship-hub/web
npm run dev
```

### 7.2 Test Connection Flow

1. **Login as Merchant**:
   - Navigate to http://localhost:3001
   - Login with merchant account
   - Select merchant organization

2. **Open Integrations Page**:
   - Click "Integrations" in sidebar
   - Should see Shopee and Mercado Livre cards

3. **Connect Shopee**:
   - Click "Connect" button on Shopee card
   - Browser redirects to Shopee authorization page
   - Login with your Shopee seller account
   - Authorize the app
   - Browser redirects back to integrations page
   - Should see "Shopee connected successfully!" toast
   - Shopee card should show green "Connected" badge

4. **Verify in Database**:
```sql
SELECT 
  id,
  org_id,
  provider,
  status,
  created_at,
  LENGTH(credentials_enc) as creds_length
FROM integrations
WHERE provider = 'SHOPEE';
```

Should see:
- status = 'ACTIVE'
- credentials_enc contains encrypted data (long string)

5. **Test Disconnect**:
   - Click "Disconnect" button
   - Confirm in dialog
   - Should see "Shopee disconnected successfully" toast
   - Card should show "Connect" button again
   - Database status should be 'DISCONNECTED'

---

## Step 8: Token Refresh

### 8.1 Automatic Refresh

Shopee access tokens expire after 4 hours (14400 seconds).

**Implementation** (Future Enhancement):
```typescript
// Background job to refresh tokens before expiry
async refreshExpiredTokens() {
  const expiringIntegrations = await this.prisma.integration.findMany({
    where: {
      provider: 'SHOPEE',
      status: 'ACTIVE',
      // Find tokens expiring in next hour
    }
  });

  for (const integration of expiringIntegrations) {
    const credentials = this.decryptCredentials(integration.credentialsEnc);
    const newCredentials = await this.shopeeProvider.refreshToken(credentials);
    await this.updateCredentials(integration.id, newCredentials);
  }
}
```

### 8.2 Manual Refresh

Users can reconnect to refresh tokens:
1. Click "Reconnect" button
2. Goes through OAuth flow again
3. Gets new access_token and refresh_token
4. Updates stored credentials

---

## Step 9: Using the Integration

### 9.1 Orders Sync

Once Shopee is connected, the orders page will:
1. Fetch orders from connected Shopee store
2. Filter orders by SHOPEE provider
3. Display in unified orders table
4. Auto-refresh every 30 seconds

**Backend Query**:
```typescript
const orders = await prisma.marketplaceOrder.findMany({
  where: {
    merchantOrgId: orgId,
    provider: 'SHOPEE',
  },
  include: {
    items: true,
    fulfillments: true,
  }
});
```

### 9.2 Listings Sync

Listings page will:
1. Show products listed on Shopee
2. Allow creating new listings
3. Sync listing status
4. Update prices and inventory

### 9.3 Webhooks

Shopee sends webhooks for real-time updates:
- Order created
- Order status changed
- Listing updated
- Inventory changed

**Webhook Endpoint**:
```
POST /webhooks/shopee/webhook
Headers:
  x-shopee-signature: {hmac_signature}

Body: {
  "event_type": "order.created",
  "shop_id": 123456789,
  "order_id": "ABC123",
  ...
}
```

---

## Step 10: Troubleshooting

### 10.1 Common Issues

**Issue**: "Shopee integration not configured"
- **Cause**: Missing SHOPEE_PARTNER_ID or SHOPEE_PARTNER_KEY
- **Solution**: Add credentials to .env file and restart backend

**Issue**: "Invalid signature" error
- **Cause**: Incorrect Partner Key or timestamp issues
- **Solution**: Verify Partner Key is correct, check system time

**Issue**: "Failed to exchange authorization code"
- **Cause**: Code expired or already used
- **Solution**: Restart OAuth flow, codes are single-use

**Issue**: Callback redirects to error page
- **Cause**: State parameter mismatch or API error
- **Solution**: Check backend logs for detailed error message

**Issue**: Integration shows PENDING forever
- **Cause**: Callback never completed successfully
- **Solution**: Check if redirect URL matches Shopee app settings

### 10.2 Debug Mode

Enable detailed logging:

```typescript
// In shopee.provider.ts
console.log('Authorization URL:', authUrl);
console.log('Callback params:', queryParams);
console.log('Token exchange response:', data);
```

### 10.3 Check Logs

**Backend logs**:
```bash
# In terminal running backend
# Look for Shopee-related errors
```

**Frontend console**:
```javascript
// In browser DevTools Console
// Check for API errors
```

---

## Step 11: Production Deployment

### 11.1 Update Environment Variables

**Production .env**:
```bash
# Use production Shopee app credentials
SHOPEE_PARTNER_ID=production_partner_id
SHOPEE_PARTNER_KEY=production_partner_key
SHOPEE_REDIRECT_URL=https://yourdomain.com/integrations/shopee/callback

# Production frontend URL
FRONTEND_URL=https://yourdomain.com

# Strong encryption key (generate new one)
APP_ENC_KEY=generate_new_32_char_key_for_production
```

### 11.2 Update Shopee App Settings

In Shopee Open Platform:
1. Update redirect URL to production URL
2. Verify app is approved for production
3. Test OAuth flow in production environment

### 11.3 Security Checklist

- [ ] Strong encryption key (32+ characters)
- [ ] HTTPS enabled for all endpoints
- [ ] Credentials never logged or exposed
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Database credentials secured
- [ ] Regular token refresh implemented
- [ ] Webhook signature validation enabled
- [ ] Error messages don't expose sensitive data

---

## Architecture Summary

### Backend Components

1. **ShopeeProvider** - Shopee-specific OAuth logic
2. **IntegrationsService** - Integration lifecycle management
3. **IntegrationsController** - REST API endpoints
4. **EncryptionService** - AES-256-GCM encryption
5. **WebhooksService** - Webhook processing

### Frontend Components

1. **IntegrationsPage** - Main UI for managing integrations
2. **useIntegrationsStatus** - React Query hook for status
3. **useConnectIntegration** - Mutation hook for connecting
4. **useDisconnectIntegration** - Mutation hook for disconnecting
5. **integrationsApi** - API client methods

### Database Schema

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  provider VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'ACTIVE',
  credentials_enc TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, provider)
);
```

### Security Layers

1. **JWT Authentication** - User identity
2. **OrgGuard** - Multi-tenant isolation
3. **MERCHANT Validation** - Only merchants can connect
4. **AES-256-GCM Encryption** - Credential protection
5. **HMAC Signatures** - API request signing
6. **State Parameter** - CSRF protection

---

## Next Steps

### Immediate
1. Get Shopee Partner credentials
2. Add to .env file
3. Test OAuth flow
4. Verify token storage

### Short Term
1. Implement automatic token refresh
2. Add webhook processing
3. Build orders sync
4. Build listings sync

### Long Term
1. Add more providers (Mercado Livre, Amazon)
2. Implement inventory sync
3. Add analytics dashboard
4. Build automated repricing

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Review backend logs
3. Verify environment variables
4. Test with Shopee sandbox (if available)
5. Contact Shopee Partner Support

---

## References

- **Shopee Open Platform**: https://open.shopee.com/
- **Shopee API Documentation**: https://open.shopee.com/documents
- **OAuth 2.0 Specification**: https://oauth.net/2/
- **HMAC Authentication**: https://en.wikipedia.org/wiki/HMAC

---

**Last Updated**: March 6, 2024
**Version**: 1.0.0
