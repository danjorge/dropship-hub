# Merchant Listings Flow - Implementation Summary

## Overview
Implemented a complete merchant listings management system that filters listings based on active marketplace integrations. Merchants can only see and manage listings for marketplaces they have connected.

---

## Backend Implementation

### 1. Integrations Service (`src/modules/integrations/integrations.service.ts`)

**New Methods Added:**
- `getIntegrations(orgId)` - Get all integrations for an organization
- `getActiveIntegrations(orgId)` - Get only ACTIVE integrations
- `getAvailableProviders(orgId)` - Returns array of Provider enums for connected marketplaces
- `isProviderActive(orgId, provider)` - Check if specific provider is connected and active

**Purpose:** Provides integration status information to other services for filtering logic.

---

### 2. Listings Service (`src/modules/listings/listings.service.ts`)

**Major Changes:**

#### Updated `getListings()` method:
- Now accepts `GetListingsDto` filters parameter
- Returns `ListingsResponse` with structure:
  ```typescript
  {
    providers: Provider[];  // Available connected providers
    items: Listing[];       // Filtered listings
    total: number;          // Total count
  }
  ```

#### Business Logic:
1. **Verify org is MERCHANT** - Only merchant orgs can access listings
2. **Get available providers** - Fetch active integrations from IntegrationsService
3. **Validate provider filter** - If provider filter specified, ensure it's connected
4. **Filter listings by connected providers** - Only show listings for active integrations
5. **Apply additional filters** - Search, status, syncStatus
6. **Return empty if no integrations** - If no marketplaces connected, return empty result

#### Updated `createListing()` method:
- Added validation: Provider must be connected and active before creating listing
- Throws `BadRequestException` if provider not connected

**Key Feature:** Listings are automatically scoped to connected integrations - merchants cannot see listings for disconnected marketplaces.

---

### 3. Listings Controller (`src/modules/listings/listings.controller.ts`)

**Updated GET /listings endpoint:**
- Accepts query parameters via `GetListingsDto`
- Query params: `provider`, `isActive`, `search`, `syncStatus`
- Returns new `ListingsResponse` format with providers array
- Validates provider filter against connected integrations

**Updated POST /listings endpoint:**
- Added validation for provider connectivity
- Returns 400 if provider not connected

---

### 4. New DTO (`src/modules/listings/dto/get-listings.dto.ts`)

```typescript
export class GetListingsDto {
  provider?: Provider;      // Filter by specific marketplace
  isActive?: boolean;       // Filter by active status
  search?: string;          // Search by title
  syncStatus?: string;      // Filter by sync status
}
```

All fields optional with proper validation decorators.

---

### 5. Integrations Controller (`src/modules/integrations/integrations/integrations.controller.ts`)

**New Endpoints:**
- `GET /integrations` - List all integrations for current org
- `GET /integrations/active` - List only ACTIVE integrations

Both endpoints:
- Require JWT authentication
- Require OrgGuard (x-org-id header)
- Return integration data without decrypted credentials

---

### 6. Module Updates

**ListingsModule:**
- Added `IntegrationsModule` import to access IntegrationsService

**IntegrationsModule:**
- Added `IntegrationsController` to controllers array
- Already exports IntegrationsService for use by other modules

---

## Frontend Implementation

### 1. Types (`web/src/types/index.ts`)

**New Types:**
```typescript
export interface Integration {
  id: string;
  provider: Provider;
  status: string;
  createdAt: string;
}

export interface ListingsResponse {
  providers: Provider[];
  items: Listing[];
  total: number;
}

export interface GetListingsParams {
  provider?: Provider;
  isActive?: boolean;
  search?: string;
  syncStatus?: string;
}
```

**Updated Listing type:**
- Added `syncStatus` field
- Added `externalListingId` as nullable
- Updated `supplierOffer` structure with nested product info

---

### 2. API Layer

**New File: `web/src/lib/api/integrations.ts`**
```typescript
export const integrationsApi = {
  getIntegrations: () => {...},
  getActiveIntegrations: () => {...}
}
```

**Updated: `web/src/lib/api/listings.ts`**
- `getListings()` now accepts `GetListingsParams`
- Builds query string from parameters
- Returns `ListingsResponse` instead of `Listing[]`

---

### 3. Hooks

**New File: `web/src/hooks/useIntegrations.ts`**
```typescript
export function useIntegrations() {...}
export function useActiveIntegrations() {...}
```

**Updated: `web/src/hooks/useListings.ts`**
- `useListings()` now accepts optional `GetListingsParams`
- Query key includes params for proper cache invalidation

---

### 4. Listings Page (`web/src/pages/listings/ListingsPage.tsx`)

**Complete Rewrite with:**

#### State Management:
- `selectedProvider` - Currently selected provider filter
- `searchQuery` - Search input value

#### Three Main UI States:

1. **No Integrations Connected:**
   - Shows empty state with message
   - "Connect a marketplace to start managing listings"
   - Button to navigate to /integrations

2. **Integrations Connected, No Listings:**
   - Shows empty state
   - "No listings found" or "No listings for {provider}"
   - Button to create first listing

3. **Listings Available:**
   - Provider filter buttons (All, Shopee, Mercado Livre)
   - Search input
   - Table with columns:
     - Provider (color-coded badge)
     - Title (with product name subtitle)
     - Price (formatted currency)
     - Status (Active/Inactive)
     - Sync Status (SYNCED/PENDING/ERROR)
     - External ID

#### Features:
- **Dynamic provider filters** - Only shows buttons for connected providers
- **Real-time search** - Filters as you type
- **Color-coded badges** - Different colors for each provider and status
- **Responsive design** - Works on mobile and desktop
- **Internationalized** - All text uses i18next translations

---

### 5. Translations

**Added to all locales (en, pt, es):**
```
listings.title
listings.description
listings.newListing
listings.provider
listings.price
listings.status
listings.syncStatus
listings.active
listings.inactive
listings.all
listings.filterByProvider
listings.search
listings.searchPlaceholder
listings.noIntegrations
listings.connectMarketplace
listings.goToIntegrations
listings.noListingsFound
listings.noListingsForProvider
listings.createFirstListing
listings.externalId
listings.createListing
```

---

## How It Works

### Flow Diagram:

```
1. Merchant navigates to /listings
   ↓
2. Frontend calls GET /listings (with x-org-id header)
   ↓
3. Backend validates:
   - User is authenticated (JWT)
   - Org exists and user is member (OrgGuard)
   - Org type is MERCHANT
   ↓
4. Backend fetches active integrations for org
   ↓
5. Backend filters listings:
   - Only listings with provider IN active integrations
   - Apply additional filters (provider, search, status)
   ↓
6. Backend returns:
   {
     providers: ['SHOPEE', 'MERCADOLIVRE'],
     items: [...listings...],
     total: 12
   }
   ↓
7. Frontend displays:
   - If providers.length === 0: Show "connect marketplace" message
   - Else: Show provider filters + listings table
```

---

## Provider Filtering Logic

### Backend:
```typescript
// Get connected providers
const availableProviders = await integrationsService.getAvailableProviders(orgId);

// If no integrations, return empty
if (availableProviders.length === 0) {
  return { providers: [], items: [], total: 0 };
}

// Filter listings by connected providers
where.provider = {
  in: availableProviders  // Only SHOPEE and MERCADOLIVRE if both connected
};

// If specific provider requested, validate it's connected
if (filters.provider && !availableProviders.includes(filters.provider)) {
  throw new BadRequestException('Provider not connected');
}
```

### Frontend:
```typescript
// Provider filter buttons are generated from response.providers
{providers.map((provider) => (
  <button onClick={() => setSelectedProvider(provider)}>
    {provider}
  </button>
))}

// When provider selected, new API call with filter
useListings({ provider: selectedProvider })
```

---

## Security & Validation

### Backend Validation:
1. ✅ JWT authentication required
2. ✅ OrgGuard validates x-org-id header
3. ✅ Only MERCHANT orgs can access listings
4. ✅ Provider filter must be in connected integrations
5. ✅ Cannot create listing for disconnected provider
6. ✅ Listings automatically scoped to org via merchantOrgId

### Frontend Validation:
1. ✅ Provider filters only show connected marketplaces
2. ✅ Cannot select provider that's not connected
3. ✅ Empty state if no integrations
4. ✅ All API calls include x-org-id header automatically

---

## Database Schema

**No schema changes required!** Uses existing tables:
- `integrations` - Stores marketplace connections
- `listings` - Stores marketplace listings
- `orgs` - Organization data

**Key Fields Used:**
- `integrations.status` - Must be 'ACTIVE'
- `integrations.provider` - SHOPEE or MERCADOLIVRE
- `listings.provider` - Must match integration provider
- `listings.merchantOrgId` - Scopes listings to merchant

---

## Scalability for Future Providers

### Adding a new marketplace (e.g., Amazon):

1. **Add to Prisma enum:**
   ```prisma
   enum Provider {
     SHOPEE
     MERCADOLIVRE
     AMAZON  // Add new provider
   }
   ```

2. **Run migration:**
   ```bash
   npx prisma migrate dev
   ```

3. **Update frontend types:**
   ```typescript
   export type Provider = 'SHOPEE' | 'MERCADOLIVRE' | 'AMAZON';
   ```

4. **Add badge color in ListingsPage:**
   ```typescript
   case 'AMAZON':
     return 'bg-blue-100 text-blue-800';
   ```

**That's it!** All filtering logic is provider-agnostic and will automatically work with new providers.

---

## Testing Scenarios

### Scenario 1: No Integrations
- **Setup:** Merchant org with no integrations
- **Expected:** Empty state with "Connect marketplace" message
- **API Response:** `{ providers: [], items: [], total: 0 }`

### Scenario 2: Shopee Only
- **Setup:** Merchant with active Shopee integration
- **Expected:** Only "All" and "SHOPEE" filter buttons, only Shopee listings shown
- **API Response:** `{ providers: ['SHOPEE'], items: [...], total: X }`

### Scenario 3: Both Marketplaces
- **Setup:** Merchant with Shopee and Mercado Livre active
- **Expected:** All three filter buttons, all listings shown
- **API Response:** `{ providers: ['SHOPEE', 'MERCADOLIVRE'], items: [...], total: X }`

### Scenario 4: Filter by Provider
- **Setup:** Select "SHOPEE" filter
- **Expected:** Only Shopee listings shown
- **API Call:** `GET /listings?provider=SHOPEE`

### Scenario 5: Search
- **Setup:** Type "Fone" in search
- **Expected:** Only listings with "Fone" in title
- **API Call:** `GET /listings?search=Fone`

### Scenario 6: Create Listing - Provider Not Connected
- **Setup:** Try to create listing for MERCADOLIVRE when only Shopee connected
- **Expected:** 400 Bad Request error
- **Error:** "Provider MERCADOLIVRE is not connected or not active"

---

## What's Still Pending for Real Shopee Sync

The current implementation provides the **architecture and UI** for marketplace listings, but actual Shopee API sync is not yet implemented. To complete real Shopee integration:

### 1. Shopee OAuth Flow
- Implement real OAuth callback with Shopee API
- Store actual access tokens and refresh tokens
- Handle token refresh logic

### 2. Listing Sync Service
- Create background job to sync listings to Shopee
- Update `syncStatus` based on API responses
- Store `externalListingId` from Shopee

### 3. Webhook Handling
- Process Shopee webhooks for listing updates
- Update local listing status when changed on Shopee
- Handle order creation webhooks

### 4. Product Mapping
- Map supplier products to Shopee categories
- Handle Shopee-specific fields (logistics, variations)
- Image upload to Shopee CDN

### 5. Error Handling
- Retry logic for failed syncs
- Error status tracking
- User notifications for sync failures

**Current Status:** The infrastructure is ready. When you implement real Shopee sync, the listings will automatically appear in the UI with proper status tracking.

---

## API Endpoints Summary

### Integrations
- `GET /integrations` - List all integrations
- `GET /integrations/active` - List active integrations only

### Listings
- `GET /listings` - List listings (filtered by connected providers)
  - Query params: `provider`, `isActive`, `search`, `syncStatus`
  - Returns: `{ providers: [], items: [], total: 0 }`
- `POST /listings` - Create listing (validates provider is connected)

All endpoints require:
- `Authorization: Bearer {jwt_token}`
- `x-org-id: {organization_id}`

---

## Files Created/Modified

### Backend Files Created:
1. `src/modules/listings/dto/get-listings.dto.ts` - Query parameters DTO

### Backend Files Modified:
1. `src/modules/integrations/integrations.service.ts` - Added integration query methods
2. `src/modules/integrations/integrations/integrations.controller.ts` - Added GET endpoints
3. `src/modules/integrations/integrations.module.ts` - Added controller
4. `src/modules/listings/listings.service.ts` - Complete rewrite with filtering logic
5. `src/modules/listings/listings.controller.ts` - Updated with query params
6. `src/modules/listings/listings.module.ts` - Added IntegrationsModule import

### Frontend Files Created:
1. `web/src/lib/api/integrations.ts` - Integrations API client
2. `web/src/hooks/useIntegrations.ts` - Integration hooks

### Frontend Files Modified:
1. `web/src/types/index.ts` - Added Integration and ListingsResponse types
2. `web/src/lib/api/listings.ts` - Updated with query params
3. `web/src/lib/api/index.ts` - Export integrationsApi
4. `web/src/hooks/useListings.ts` - Accept params argument
5. `web/src/pages/listings/ListingsPage.tsx` - Complete rewrite with filtering UI
6. `web/src/i18n/locales/en.json` - Added listings translations
7. `web/src/i18n/locales/pt.json` - Added listings translations
8. `web/src/i18n/locales/es.json` - Added listings translations

---

## Summary

✅ **Complete merchant listings flow implemented**
✅ **Listings filtered by active marketplace integrations**
✅ **Provider validation on create and list**
✅ **Clean, scalable architecture for future providers**
✅ **Full internationalization support**
✅ **Proper error handling and empty states**
✅ **Type-safe throughout backend and frontend**

The system is production-ready for the listing management UI. When you're ready to implement actual Shopee API sync, the infrastructure is in place to support it seamlessly.
