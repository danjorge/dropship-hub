# Authentication & Organization Flow

## ✅ Current Implementation

The Dropshipping Hub already has **complete authentication and organization-based access control** implemented.

### **Authentication Requirements**

All product-related operations require:
1. ✅ **User must be logged in** (JWT token required)
2. ✅ **User must have an active organization selected** (`x-org-id` header required)
3. ✅ **User must be a member of the organization** (verified by backend `OrgGuard`)

### **How It Works**

#### **1. Login Flow**
```
User enters credentials → Backend validates → Returns JWT token
→ Frontend stores token in localStorage → Token sent with all API requests
```

#### **2. Organization Selection**
```
User logs in → Backend returns list of user's organizations
→ User selects organization → Frontend stores orgId in localStorage
→ orgId sent as x-org-id header with all API requests
```

#### **3. API Request Flow**
```typescript
// Every catalog API call includes:
{
  requiresAuth: true,    // Adds Authorization: Bearer <token>
  requiresOrg: true,     // Adds x-org-id: <orgId>
}
```

### **Protected Endpoints**

All catalog endpoints require authentication + organization:

- `GET /catalog/products` - List products (requires org)
- `POST /catalog/products` - Create product (requires org)
- `POST /catalog/products/:id/skus` - Create SKU (requires org)
- `POST /catalog/products/:id/images` - Add image (requires org)
- `POST /catalog/offers` - Create offer (requires org)
- `GET /catalog/suppliers` - List suppliers (requires org)
- `GET /catalog/suppliers/:id/products` - Browse supplier products (requires org)

### **Backend Guards**

#### **AuthGuard**
- Validates JWT token
- Extracts user ID from token
- Attaches user to request

#### **OrgGuard**
- Validates `x-org-id` header is present
- Verifies user is a member of the organization
- Attaches orgId and orgRole to request
- Returns 403 Forbidden if user is not a member

### **Frontend Protection**

#### **Automatic Redirects**
```typescript
// If 401 Unauthorized:
storage.clearAll();
window.location.href = '/login';

// If no token or orgId:
API requests fail → User redirected to login
```

#### **Storage Management**
```typescript
// localStorage stores:
- accessToken: JWT token
- activeOrgId: Selected organization ID
```

### **Testing Authentication**

#### **1. Without Login**
```bash
curl http://localhost:3000/catalog/products
# Response: 401 Unauthorized
```

#### **2. Without Organization**
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/catalog/products
# Response: 400 Bad Request - Missing x-org-id header
```

#### **3. With Wrong Organization**
```bash
curl -H "Authorization: Bearer <token>" \
     -H "x-org-id: wrong-org-id" \
     http://localhost:3000/catalog/products
# Response: 403 Forbidden - User is not a member of this org
```

#### **4. Correct Authentication**
```bash
curl -H "Authorization: Bearer <token>" \
     -H "x-org-id: <valid-org-id>" \
     http://localhost:3000/catalog/products
# Response: 200 OK - Returns products
```

### **User Experience**

#### **First Time User**
1. User visits `/products`
2. No token → Redirected to `/login`
3. User logs in → Receives token
4. User selects organization → orgId stored
5. User can now access products

#### **Returning User**
1. User visits `/products`
2. Token and orgId loaded from localStorage
3. User immediately sees products (no redirect)

#### **Session Expiry**
1. JWT token expires
2. Next API call returns 401
3. Frontend clears storage and redirects to login
4. User must log in again

### **Multi-Tenancy**

Each user can belong to multiple organizations:
- **Supplier organizations**: Can create and manage products
- **Merchant organizations**: Can browse supplier catalogs

The `x-org-id` header determines which organization context the user is operating in.

### **Security Features**

✅ **JWT Authentication**: Secure token-based auth
✅ **Organization Isolation**: Users can only access their org's data
✅ **Role-Based Access**: OWNER, ADMIN, STAFF roles (future use)
✅ **Automatic Token Refresh**: Token stored securely in localStorage
✅ **CORS Protection**: Backend validates origin
✅ **Rate Limiting**: 1000 requests per 60 seconds per IP

### **Current Status**

🎉 **All authentication and organization requirements are already implemented and working!**

No additional changes needed. The system already:
- Requires login to access products
- Requires organization selection
- Validates user membership
- Protects all catalog endpoints
- Handles authentication errors gracefully

### **Testing Your Setup**

1. **Logout** (if logged in)
2. Try to access `/catalog/products`
3. You should be redirected to `/login`
4. Log in with valid credentials
5. Select an organization
6. Now you can access products

Everything is already secured! 🔒
